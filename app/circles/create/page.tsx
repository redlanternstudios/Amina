'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import CreateCircleForm from '@/components/circle/CreateCircleForm'
import { ArrowLeft } from 'lucide-react'

export default function CreateCirclePage() {
  const router = useRouter()

  function handleSuccess(circleId: string) {
    router.push(`/circles/${circleId}`)
  }

  function handleCancel() {
    router.push('/circles')
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link
        href="/circles"
        className="mb-6 inline-flex items-center gap-1 text-sm text-charcoal/50 hover:text-charcoal transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to circles
      </Link>

      <CreateCircleForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  )
}
