'use client'

import { useState, useEffect } from 'react'
import { X, Sparkles, Heart, BookOpen, Shield } from 'lucide-react'
import { getOfferings, purchasePackage, restorePurchases } from '@/lib/revenuecat'
import type { PurchasesPackage } from '@revenuecat/purchases-capacitor'

interface PaywallModalProps {
  onClose: () => void
  onSuccess: () => void
  trigger?: 'conversations' | 'dua-wall' | 'reflections' | 'general'
}

const TRIGGER_COPY: Record<string, { headline: string; subline: string }> = {
  conversations: {
    headline: 'Unlock unlimited conversations with Amina',
    subline: 'You\'ve reached your free limit. Continue your reflection journey with premium.',
  },
  'dua-wall': {
    headline: 'Join the Du\'a Wall community',
    subline: 'Share your du\'as and receive ameen from sisters around the world.',
  },
  reflections: {
    headline: 'Unlock your full reflection archive',
    subline: 'Review your spiritual journey and Amina\'s insights over time.',
  },
  general: {
    headline: 'Unlock Amina Premium',
    subline: 'Deepen your faith journey with unlimited access.',
  },
}

const FEATURES = [
  { icon: Heart, text: 'Unlimited conversations with Amina' },
  { icon: BookOpen, text: 'Full reflection archive + spiritual milestones' },
  { icon: Sparkles, text: 'Personalized du\'a wall access' },
  { icon: Shield, text: 'Priority AI responses with deeper citations' },
]

export default function PaywallModal({ onClose, onSuccess, trigger = 'general' }: PaywallModalProps) {
  const [packages, setPackages] = useState<PurchasesPackage[]>([])
  const [selectedPkg, setSelectedPkg] = useState<PurchasesPackage | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const copy = TRIGGER_COPY[trigger]

  useEffect(() => {
    async function load() {
      const offering = await getOfferings()
      if (offering?.availablePackages?.length) {
        setPackages(offering.availablePackages)
        // Default select annual if available, otherwise first package
        const annual = offering.availablePackages.find(p => p.packageType === 'ANNUAL')
        setSelectedPkg(annual ?? offering.availablePackages[0])
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handlePurchase() {
    if (!selectedPkg) return
    setPurchasing(true)
    setError(null)

    const result = await purchasePackage(selectedPkg)
    setPurchasing(false)

    if (result.success) {
      onSuccess()
    } else if (result.error !== 'cancelled') {
      setError(result.error ?? 'Purchase could not be completed. Please try again.')
    }
  }

  async function handleRestore() {
    setRestoring(true)
    const restored = await restorePurchases()
    setRestoring(false)
    if (restored) {
      onSuccess()
    } else {
      setError('No previous purchases found.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-cream rounded-t-3xl px-6 pt-6 pb-10 shadow-2xl">
        {/* Close */}
        <div className="flex justify-end mb-2">
          <button onClick={onClose} className="p-1 text-muted hover:text-charcoal">
            <X size={20} />
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🌙</div>
          <h2 className="font-display text-2xl text-charcoal font-semibold leading-snug mb-2">
            {copy.headline}
          </h2>
          <p className="text-muted text-sm">{copy.subline}</p>
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-6">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-charcoal">
              <span className="w-7 h-7 rounded-full bg-sand flex items-center justify-center flex-shrink-0">
                <Icon size={14} className="text-terracotta" />
              </span>
              {text}
            </li>
          ))}
        </ul>

        {/* Packages */}
        {loading ? (
          <div className="text-center text-muted text-sm py-4">Loading plans…</div>
        ) : packages.length === 0 ? (
          <div className="text-center text-muted text-sm py-4">Plans unavailable — please try again later.</div>
        ) : (
          <div className="space-y-2 mb-4">
            {packages.map(pkg => (
              <button
                key={pkg.identifier}
                onClick={() => setSelectedPkg(pkg)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-sm transition-all ${
                  selectedPkg?.identifier === pkg.identifier
                    ? 'border-terracotta bg-terracotta/5 text-charcoal'
                    : 'border-hairline text-muted'
                }`}
              >
                <span className="font-medium">{pkg.product.title || pkg.packageType}</span>
                <span>{pkg.product.priceString}</span>
              </button>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-500 text-xs text-center mb-3">{error}</p>
        )}

        {/* CTA */}
        <button
          onClick={handlePurchase}
          disabled={purchasing || !selectedPkg}
          className="w-full py-4 rounded-2xl bg-charcoal text-cream font-semibold text-sm disabled:opacity-50 mb-3"
        >
          {purchasing ? 'Processing…' : `Continue with ${selectedPkg?.product.priceString ?? '—'}`}
        </button>

        {/* Restore */}
        <button
          onClick={handleRestore}
          disabled={restoring}
          className="w-full text-center text-xs text-muted py-1"
        >
          {restoring ? 'Checking…' : 'Restore purchases'}
        </button>

        <p className="text-center text-xs text-muted mt-3 leading-relaxed">
          Subscription automatically renews. Cancel anytime in iPhone Settings.
        </p>
      </div>
    </div>
  )
}
