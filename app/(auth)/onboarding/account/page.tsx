'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AccountPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })
      if (signUpError) {
        setError(signUpError.message)
        return
      }
      router.push('/onboarding/complete')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-cream flex flex-col px-6 py-8">
      <button onClick={() => router.back()} aria-label="Back" className="w-8 h-8 flex items-center justify-center mb-6 text-charcoal">
        <ChevronLeft size={20} strokeWidth={1.5} />
      </button>

      {/* Progress */}
      <div className="flex gap-1.5 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-1 flex-1 rounded-full" style={{ backgroundColor: 'var(--amina-primary-action)' }} />
        ))}
      </div>

      <div className="mb-8">
        <h1 className="font-display text-3xl text-charcoal">Create your</h1>
        <h1 className="font-display text-3xl text-rose-amina mb-2">account</h1>
        <p className="text-charcoal/60 text-sm">Your space is private and yours alone.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 flex-1">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-1.5">Email</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full bg-cream rounded-xl px-4 py-3 text-charcoal text-sm outline-none focus:ring-2 focus:ring-rose-amina/30"
            style={{ border: '1px solid var(--amina-border)' }}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-charcoal mb-1.5">Password</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full bg-cream rounded-xl px-4 py-3 pr-12 text-charcoal text-sm outline-none focus:ring-2 focus:ring-rose-amina/30"
              style={{ border: '1px solid var(--amina-border)' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal/70"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-rose-amina bg-rose-50 rounded-xl px-4 py-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="btn-primary w-full mt-4"
        >
          {loading ? 'Creating your account...' : 'Create Account'}
          {!loading && <ArrowRight size={18} strokeWidth={1.75} />}
        </button>
      </form>

      <p className="text-center text-xs text-charcoal/40 mt-6">
        Already have an account?{' '}
        <button onClick={() => router.push('/auth')} className="text-rose-amina underline underline-offset-2">
          Sign in
        </button>
      </p>
    </div>
  )
}
