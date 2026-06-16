/**
 * lib/sightengine.ts
 * Sightengine image moderation helper.
 *
 * NEVER call this from the client — only from server-side API routes.
 * API keys are read from env; they must never reach the browser.
 *
 * Fail-open policy: if Sightengine is unreachable, return FLAGGED (not REJECTED).
 * A moderation outage should NOT block uploads — items queue for human review.
 *
 * Supported surfaces:
 *   - circle avatar
 *   - circle post image
 *   - circle chat media
 *   - profile photo
 *   - DM attachment
 */

export type ModerationVerdict = 'approved' | 'flagged' | 'rejected'
export type ModerationReason = 'nudity' | 'offensive' | 'gore' | 'weapon' | 'error'

export interface ModerationResult {
  verdict: ModerationVerdict
  reasons: ModerationReason[]
  raw?: Record<string, unknown>
}

// Sightengine confidence thresholds
const REJECT_THRESHOLD = 0.7   // hard block
const FLAG_THRESHOLD   = 0.4   // queue for human review

const MODELS = 'nudity-2.0,weapon,offensive,gore'

/**
 * Moderate an image by URL (must be publicly reachable or a data: URI).
 * Call from API routes only.
 */
export async function moderateImageUrl(imageUrl: string): Promise<ModerationResult> {
  const apiUser   = process.env.SIGHTENGINE_API_USER
  const apiSecret = process.env.SIGHTENGINE_API_SECRET

  if (!apiUser || !apiSecret) {
    console.error('[sightengine] Missing SIGHTENGINE_API_USER or SIGHTENGINE_API_SECRET')
    // Fail-flagged: do not block upload but queue for review
    return { verdict: 'flagged', reasons: ['error'] }
  }

  try {
    const params = new URLSearchParams({
      url: imageUrl,
      models: MODELS,
      api_user: apiUser,
      api_secret: apiSecret,
    })

    const res = await fetch(`https://api.sightengine.com/1.0/check.json?${params}`, {
      method: 'GET',
      signal: AbortSignal.timeout(8000), // 8s max
    })

    if (!res.ok) {
      console.error('[sightengine] API error', res.status)
      return { verdict: 'flagged', reasons: ['error'] }
    }

    const data = await res.json() as SightengineResponse

    return evaluateResponse(data)
  } catch (err) {
    console.error('[sightengine] Request failed', err)
    // Network error → fail-open: flag for review, do not block
    return { verdict: 'flagged', reasons: ['error'] }
  }
}

/**
 * Moderate an image uploaded as a binary file.
 * Use this when you have the file Buffer (e.g. from Supabase storage upload).
 */
export async function moderateImageBuffer(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<ModerationResult> {
  const apiUser   = process.env.SIGHTENGINE_API_USER
  const apiSecret = process.env.SIGHTENGINE_API_SECRET

  if (!apiUser || !apiSecret) {
    return { verdict: 'flagged', reasons: ['error'] }
  }

  try {
    const formData = new FormData()
    formData.append('media', new Blob([new Uint8Array(buffer)], { type: mimeType }), filename)
    formData.append('models', MODELS)
    formData.append('api_user', apiUser)
    formData.append('api_secret', apiSecret)

    const res = await fetch('https://api.sightengine.com/1.0/check.json', {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      return { verdict: 'flagged', reasons: ['error'] }
    }

    const data = await res.json() as SightengineResponse
    return evaluateResponse(data)
  } catch {
    return { verdict: 'flagged', reasons: ['error'] }
  }
}

// ─── Response evaluation ──────────────────────────────────────────────────────

function evaluateResponse(data: SightengineResponse): ModerationResult {
  const reasons: ModerationReason[] = []
  let maxScore = 0

  // Nudity — check explicit + suggestive
  const nudityScore = Math.max(
    data.nudity?.raw ?? 0,
    data.nudity?.partial ?? 0,
    data.nudity?.sexual_activity ?? 0,
  )
  if (nudityScore > FLAG_THRESHOLD) reasons.push('nudity')
  maxScore = Math.max(maxScore, nudityScore)

  // Weapon
  const weaponScore = data.weapon?.classes?.['any-weapon'] ?? 0
  if (weaponScore > FLAG_THRESHOLD) reasons.push('weapon')
  maxScore = Math.max(maxScore, weaponScore)

  // Offensive (gestures, symbols)
  const offensiveScore = Math.max(
    data.offensive?.prob ?? 0,
    data.offensive?.prob ?? 0,
  )
  if (offensiveScore > FLAG_THRESHOLD) reasons.push('offensive')
  maxScore = Math.max(maxScore, offensiveScore)

  // Gore
  const goreScore = data.gore?.prob ?? 0
  if (goreScore > FLAG_THRESHOLD) reasons.push('gore')
  maxScore = Math.max(maxScore, goreScore)

  if (reasons.length === 0) {
    return { verdict: 'approved', reasons: [], raw: data as unknown as Record<string, unknown> }
  }

  if (maxScore >= REJECT_THRESHOLD) {
    return { verdict: 'rejected', reasons, raw: data as unknown as Record<string, unknown> }
  }

  return { verdict: 'flagged', reasons, raw: data as unknown as Record<string, unknown> }
}

// ─── Sightengine response shape (partial) ────────────────────────────────────

interface SightengineResponse {
  status: string
  request?: { id: string; timestamp: number; operations: number }
  nudity?: {
    sexual_activity?: number
    sexual_display?: number
    erotica?: number
    suggestive?: number
    suggestive_classes?: Record<string, number>
    none?: number
    raw?: number
    partial?: number
  }
  weapon?: {
    prob?: number
    classes?: Record<string, number>
  }
  offensive?: {
    prob?: number
    nazi?: number
    confederate?: number
    supremacist?: number
    terrorist?: number
    middle_finger?: number
  }
  gore?: {
    prob?: number
    classes?: Record<string, number>
  }
}
