'use client'

import { useState, FormEvent } from 'react'
import { Loader2 } from 'lucide-react'

// ---------------------------------------------------------------------------
// Inner error state (inline, not a separate component — it renders as a banner)
// ---------------------------------------------------------------------------

interface ErrorBannerProps {
  message: string
  onDismiss?: () => void
}

function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
      <span className="mt-0.5 flex-shrink-0">⚠️</span>
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="text-red-400 hover:text-red-600 flex-shrink-0" aria-label="Dismiss error">
          ✕
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// CreateCircleForm
// ---------------------------------------------------------------------------

interface CreateCircleFormProps {
  /** Called after successful creation with the new circle id */
  onSuccess?: (circleId: string) => void
  /** Called when the user wants to cancel/go back */
  onCancel?: () => void
  /** Override the API endpoint (default: POST /api/circles) */
  apiEndpoint?: string
}

export default function CreateCircleForm({
  onSuccess,
  onCancel,
  apiEndpoint = '/api/circles',
}: CreateCircleFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          is_public: isPublic,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error ?? 'Failed to create circle')
      }

      onSuccess?.(result.circle?.id ?? result.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <label htmlFor="circle-name" className="text-sm font-medium text-charcoal">
          Name <span className="text-rose-amina">*</span>
        </label>
        <input
          id="circle-name"
          placeholder="Circle name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={submitting}
          maxLength={80}
          className="w-full rounded-xl border border-charcoal/10 bg-ivory px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-rose-amina/30 disabled:opacity-50"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="circle-description" className="text-sm font-medium text-charcoal">
          Description
        </label>
        <textarea
          id="circle-description"
          placeholder="What is this circle about?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          disabled={submitting}
          className="w-full rounded-xl border border-charcoal/10 bg-ivory px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-rose-amina/30 disabled:opacity-50 resize-none"
        />
      </div>

      {/* Public/Private toggle */}
      <div className="flex items-center justify-between">
        <div>
          <label htmlFor="circle-public" className="text-sm font-medium text-charcoal cursor-pointer">
            Public circle
          </label>
          <p className="text-charcoal/40 text-xs mt-0.5">
            Anyone can find and join this circle
          </p>
        </div>
        <button
          id="circle-public"
          type="button"
          role="switch"
          aria-checked={isPublic}
          onClick={() => setIsPublic(!isPublic)}
          disabled={submitting}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isPublic ? 'bg-rose-amina' : 'bg-charcoal/20'
          } disabled:opacity-50`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isPublic ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Error banner */}
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 rounded-full border border-charcoal/10 px-4 py-2.5 text-sm font-medium text-charcoal/60 disabled:opacity-50 active:opacity-80"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="flex-1 rounded-full bg-rose-amina px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 active:opacity-80 flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? 'Creating...' : 'Create Circle'}
        </button>
      </div>
    </form>
  )
}
