'use client'

import { useEffect, useState } from 'react'

interface StreakData {
  current_streak: number
  longest_streak: number
  last_reflection_date: string | null
}

interface StreakCounterProps {
  accessToken: string
}

export function StreakCounter({ accessToken }: StreakCounterProps) {
  const [data, setData] = useState<StreakData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    // Wait for session to resolve before fetching
    if (!accessToken) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(false)

    fetch('/api/streak')
      .then(res => {
        if (res.status === 401) throw new Error('Unauthorized')
        if (!res.ok) throw new Error('Failed to fetch streak')
        return res.json()
      })
      .then((json: StreakData) => {
        setData(json)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [accessToken])

  if (loading) {
    return (
      <div className="card flex items-center gap-3 animate-pulse">
        <div className="w-10 h-10 rounded-full bg-charcoal/10" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-charcoal/10 rounded w-1/3" />
          <div className="h-2 bg-charcoal/10 rounded w-1/2" />
        </div>
      </div>
    )
  }

  // Silent failure — don't render broken streak UI
  if (error) return null

  const count: number = data?.current_streak ?? 0
  const longest: number = data?.longest_streak ?? 0
  const lastDate: string | null = data?.last_reflection_date ?? null

  if (count === 0) {
    return (
      <div className="card flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-ivory flex items-center justify-center text-xl">
          🌱
        </div>
        <div>
          <p className="font-semibold text-charcoal text-sm">Begin your streak</p>
          <p className="text-charcoal/40 text-xs">Reflect daily to build your practice</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-rose-amina/10 flex items-center justify-center text-xl">
        🔥
      </div>
      <div className="flex-1">
        <p className="font-semibold text-charcoal text-sm">
          {count} day{count !== 1 ? 's' : ''} streak
        </p>
        <p className="text-charcoal/40 text-xs">
          Longest: {longest} day{longest !== 1 ? 's' : ''}
          {lastDate ? ` · Last reflected ${lastDate}` : ''}
        </p>
      </div>
    </div>
  )
}
