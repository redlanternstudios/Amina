'use client'

export function CircleDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gray-200" />
        <div className="space-y-2 flex-1">
          <div className="h-6 w-48 rounded bg-gray-200" />
          <div className="h-4 w-32 rounded bg-gray-200" />
        </div>
      </div>
      <div className="h-4 w-3/4 rounded bg-gray-200" />
      <div className="h-4 w-1/2 rounded bg-gray-200" />
      <div className="grid grid-cols-3 gap-4">
        <div className="h-32 rounded bg-gray-200" />
        <div className="h-32 rounded bg-gray-200" />
        <div className="h-32 rounded bg-gray-200" />
      </div>
    </div>
  )
}
