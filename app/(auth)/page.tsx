'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function SplashPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col min-h-dvh bg-cream relative overflow-hidden">
      {/* Hero background */}
      <div className="flex-1 flex flex-col items-center justify-start pt-16 px-6 relative">
        {/* Logo mark */}
        <div className="text-center mb-2">
          <span className="text-gold text-3xl">⌙★</span>
        </div>

        {/* Wordmark */}
        <h1 className="font-display text-6xl text-olive mb-1" style={{ fontStyle: 'italic' }}>
          Amina
        </h1>
        <p className="text-charcoal/50 text-sm tracking-wide mb-1">by RedLantern Studios™</p>

        {/* Divider */}
        <div className="flex items-center gap-2 my-4">
          <div className="h-px w-12 bg-gold/40" />
          <span className="text-gold text-lg">🌿</span>
          <div className="h-px w-12 bg-gold/40" />
        </div>

        <p className="text-charcoal/70 text-base text-center">
          Faith centered reflection for women.
        </p>

        {/* Lantern illustration placeholder */}
        <div className="flex-1 flex items-end justify-center pb-8">
          <div className="w-48 h-64 rounded-3xl bg-ivory/60 flex items-center justify-center">
            <span className="text-6xl">🪭</span>
          </div>
        </div>
      </div>

      {/* CTA stack */}
      <div className="px-6 pb-10 flex flex-col gap-3">
        <button
          onClick={() => router.push('/welcome')}
          className="btn-primary w-full"
        >
          Continue <span>→</span>
        </button>

        <button
          onClick={() => router.push('/signup')}
          className="btn-secondary w-full"
        >
          Create an Account
        </button>

        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-charcoal/10" />
          <span className="text-charcoal/40 text-sm">or</span>
          <div className="flex-1 h-px bg-charcoal/10" />
        </div>

        <button className="btn-secondary w-full">
          <span className="text-lg"></span> Continue with Apple
        </button>

        <p className="text-center text-xs text-charcoal/40 mt-1">
          By continuing, you agree to our{' '}
          <a href="/terms" className="text-rose-amina">Terms of Use</a>{' '}and{' '}
          <a href="/privacy" className="text-rose-amina">Privacy Policy</a>.
        </p>

        <p className="text-center text-xs text-charcoal/30 mt-2">by RedLantern Studios™</p>
      </div>
    </div>
  )
}
