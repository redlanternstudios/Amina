'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SignInForm({ onClose, redirectTo = '/home' }: { onClose?: () => void; redirectTo?: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (signInError) {
        setError(signInError.message)
        return
      }
      router.replace(redirectTo)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3" aria-label="Sign in">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm text-charcoal/70">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
          placeholder="you@example.com"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm text-charcoal/70">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
          placeholder="Enter your password"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-rose-action">{error}</p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full mt-1 disabled:opacity-60">
        {loading ? <Loader2 size={18} className="animate-spin" /> : <>Sign In <ArrowRight size={18} strokeWidth={1.75} /></>}
      </button>

      {onClose && (
        <button type="button" onClick={onClose} className="text-center text-xs text-charcoal/50 mt-1">
          Back
        </button>
      )}
    </form>
  )
}
