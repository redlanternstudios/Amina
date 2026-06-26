'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Leaf } from 'lucide-react'
import AminaWordmark from '@/components/brand/AminaWordmark'
import AminaIcon from '@/components/brand/AminaIcon'
import SignInForm from '@/components/auth/SignInForm'

function AuthContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') ?? '/home'
  const [showSignIn, setShowSignIn] = useState(true)

  return (
    <div className="flex flex-col min-h-dvh bg-cream relative overflow-hidden">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-start pt-16 px-6">
        <AminaWordmark size="xl" tone="gradient" showSignature />

        {/* Divider */}
        <div className="flex items-center gap-2 my-5">
          <div className="h-px w-12" style={{ backgroundColor: 'rgba(215,186,130,0.4)' }} />
          <Leaf size={18} strokeWidth={1.5} className="text-gold" />
          <div className="h-px w-12" style={{ backgroundColor: 'rgba(215,186,130,0.4)' }} />
        </div>

        <p className="font-display text-2xl text-charcoal/80 text-center">
          Faith centered reflection for women.
        </p>

        {/* Lantern-glow motif */}
        <div className="flex-1 flex items-end justify-center pb-8">
          <div
            className="w-48 h-64 rounded-3xl flex items-center justify-center bg-ivory"
            style={{ border: '1px solid var(--amina-hairline)' }}
          >
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--amina-warm-highlight)' }}
            >
              <AminaIcon size={56} />
            </div>
          </div>
        </div>
      </div>

      {/* CTA stack */}
      <div className="px-6 pb-10 flex flex-col gap-3">
        {showSignIn ? (
          <>
            <SignInForm onClose={() => setShowSignIn(false)} redirectTo={redirectTo} />
            <p className="text-center text-xs text-charcoal/40 mt-3">
              New to Amina?{" "}
              <button onClick={() => router.push("/welcome")} className="text-rose-amina font-medium">
                Create an account
              </button>
            </p>
          </>
        ) : (
          <>
            <button onClick={() => setShowSignIn(true)} className="btn-primary w-full">
              Continue <ArrowRight size={18} strokeWidth={1.75} />
            </button>

            <button onClick={() => router.push('/welcome')} className="btn-secondary w-full">
              Create an Account
            </button>
          </>
        )}

        <p className="text-center text-xs text-charcoal/40 mt-1">
          By continuing, you agree to our{' '}
          <a href="/terms" className="text-rose-amina">Terms of Use</a> and{' '}
          <a href="/privacy" className="text-rose-amina">Privacy Policy</a>.
        </p>

        <p className="text-center text-xs text-charcoal/30 mt-2">by RedLantern Studios™</p>
      </div>
    </div>
  )
}

export default function SplashPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-cream" />}>
      <AuthContent />
    </Suspense>
  )
}
