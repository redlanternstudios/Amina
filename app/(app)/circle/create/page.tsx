'use client'

import { useRouter } from 'next/navigation'
import CreateCircleForm from '@/components/circle/CreateCircleForm'
import BottomNav from '@/components/BottomNav'

export default function CreateCirclePage() {
  const router = useRouter()

  function handleSuccess(circleId: string) {
    router.push(`/circle/${circleId}/chat`)
  }

  function handleCancel() {
    router.back()
  }

  return (
    <div className="min-h-dvh bg-cream">
      <div className="mx-auto max-w-lg px-4 pt-12 pb-24">
        {/* Back button */}
        <div className="mb-2">
          <button
            onClick={handleCancel}
            className="text-sm text-charcoal/50 hover:text-charcoal"
          >
            &larr; Back
          </button>
        </div>

        {/* Header */}
        <h1 className="font-display text-2xl text-charcoal">Create Circle</h1>
        <p className="mt-1 text-sm text-charcoal/50">
          Start a new circle for your community.
        </p>

        {/* Form */}
        <div className="mt-8">
          <CreateCircleForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            apiEndpoint="/api/circles"
          />
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
