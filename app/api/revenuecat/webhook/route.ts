/**
 * RevenueCat webhook → Supabase sync
 *
 * RevenueCat fires this when: subscription purchased, renewed, cancelled, expired, refunded.
 * We update user_profiles.plan_type + has_full_access accordingly.
 *
 * Setup: RevenueCat Dashboard → Project → Integrations → Webhooks → add this URL
 * Auth: set Authorization header in RC to match REVENUECAT_WEBHOOK_SECRET env var
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// RC event types we care about
const GRANT_EVENTS = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'PRODUCT_CHANGE',
  'UNCANCELLATION',
])

const REVOKE_EVENTS = new Set([
  'CANCELLATION',
  'EXPIRATION',
  'BILLING_ISSUE',
  'SUBSCRIBER_ALIAS', // ignore — no action
])

export async function POST(req: NextRequest) {
  // Auth check
  const authHeader = req.headers.get('authorization')
  if (authHeader !== process.env.REVENUECAT_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const event = body.event as Record<string, unknown>
  const eventType = event?.type as string
  const appUserId = event?.app_user_id as string

  if (!appUserId || !eventType) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  if (GRANT_EVENTS.has(eventType)) {
    const expiresAt = event.expiration_at_ms
      ? new Date(event.expiration_at_ms as number).toISOString()
      : null

    // Upsert into subscriptions table
    await supabase
      .from('subscriptions')
      .upsert({
        user_id: appUserId,
        plan_type: 'premium',
        status: 'active',
        current_period_end: expiresAt,
        metadata: { source: 'revenuecat', event_type: eventType },
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

    // Flip the fast-path access gate
    await supabase
      .from('amina_profiles')
      .update({ has_full_access: true })
      .eq('id', appUserId)

  } else if (REVOKE_EVENTS.has(eventType)) {
    await supabase
      .from('subscriptions')
      .upsert({
        user_id: appUserId,
        plan_type: 'free',
        status: eventType === 'CANCELLATION' ? 'cancelled' : 'expired',
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

    await supabase
      .from('amina_profiles')
      .update({ has_full_access: false })
      .eq('id', appUserId)
  }

  return NextResponse.json({ ok: true })
}
