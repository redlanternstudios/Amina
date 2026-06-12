'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

const CATEGORIES = [
  'General',
  'Quran Study',
  'Hadith Study',
  'Fiqh',
  'Dua & Dhikr',
  'Community',
  'Events',
] as const

export default function CreateCirclePage() {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [maxMembers, setMaxMembers] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  // Auth guard
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setLoaded(true)
    }
    checkAuth()
  }, [router, supabase])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setSubmitting(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error: insertError } = await supabase
        .from('circles')
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          category: category || null,
          is_private: isPrivate,
          max_members: maxMembers ? parseInt(maxMembers, 10) : null,
          created_by: user.id,
        })
        .select()
        .single()

      if (insertError) throw new Error(insertError.message)

      // Auto-join the creator as admin
      if (data) {
        await supabase.from('circle_memberships').insert({
          circle_id: data.id,
          user_id: user.id,
          role: 'admin',
          status: 'active',
        })
      }

      router.push('/circle')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <span key={i} className="w-2 h-2 rounded-full bg-rose-300 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="mb-2">
        <button
          onClick={() => router.back()}
          className="text-sm text-charcoal/50 hover:text-charcoal"
        >
          &larr; Back
        </button>
      </div>
      <h1 className="text-2xl font-bold text-charcoal">Create Circle</h1>
      <p className="mt-1 text-sm text-charcoal/50">
        Start a new circle for your community.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-charcoal">Name *</label>
          <input
            id="name"
            placeholder="Circle name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={submitting}
            className="w-full rounded-xl border border-charcoal/10 bg-ivory px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-rose-amina/30 disabled:opacity-50"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-charcoal">Description</label>
          <textarea
            id="description"
            placeholder="What is this circle about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            disabled={submitting}
            className="w-full rounded-xl border border-charcoal/10 bg-ivory px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-rose-amina/30 disabled:opacity-50 resize-none"
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium text-charcoal">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={submitting}
            className="w-full rounded-xl border border-charcoal/10 bg-ivory px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-rose-amina/30 disabled:opacity-50 appearance-none"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat.toLowerCase().replace(/\s+/g, '_')}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Private Toggle */}
        <div className="flex items-center justify-between">
          <label htmlFor="private" className="text-sm font-medium text-charcoal cursor-pointer">
            Private circle
          </label>
          <button
            id="private"
            type="button"
            role="switch"
            aria-checked={isPrivate}
            onClick={() => setIsPrivate(!isPrivate)}
            disabled={submitting}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isPrivate ? 'bg-rose-amina' : 'bg-charcoal/20'
            } disabled:opacity-50`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isPrivate ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {/* Max Members */}
        <div className="space-y-2">
          <label htmlFor="maxMembers" className="text-sm font-medium text-charcoal">Max members</label>
          <input
            id="maxMembers"
            type="number"
            min={1}
            placeholder="Leave empty for unlimited"
            value={maxMembers}
            onChange={(e) => setMaxMembers(e.target.value)}
            disabled={submitting}
            className="w-full rounded-xl border border-charcoal/10 bg-ivory px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-rose-amina/30 disabled:opacity-50"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="w-full rounded-full bg-rose-amina px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 active:opacity-80 flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? 'Creating...' : 'Create Circle'}
        </button>
      </form>
    </div>
  )
}
