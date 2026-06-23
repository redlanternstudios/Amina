'use client'

import { useState, useEffect, useCallback, FormEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft } from 'lucide-react'

interface CircleData {
  id: string
  name: string
  intention: string | null
  topic_tag: string
  is_open: boolean
  max_members: number
  created_by: string
}

type Phase = 'loading' | 'form' | 'saving' | 'error' | 'delete_confirm' | 'deleting' | 'deleted'

export default function CircleSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const circleId = params.id as string

  const [phase, setPhase] = useState<Phase>('loading')
  const [circle, setCircle] = useState<CircleData | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [intention, setIntention] = useState('')
  const [topicTag, setTopicTag] = useState('Faith & Belief')
  const [maxMembers, setMaxMembers] = useState(50)
  const [dirty, setDirty] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [inviteCode, setInviteCode] = useState('')
  const [regenLoading, setRegenLoading] = useState(false)

  const load = useCallback(async () => {
    setPhase('loading')
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      setCurrentUserId(user.id)

      const { data: c, error: cErr } = await supabase
        .from('circle_groups').select('*').eq('id', circleId).single()

      if (cErr || !c) { setError('Circle not found'); setPhase('error'); return }

      setCircle(c)
      setName(c.name)
      setIntention(c.intention || '')
      setTopicTag(c.topic_tag)
      setMaxMembers(c.max_members)
      setInviteCode(c.invite_code || '')

      const { data: membership } = await supabase
        .from('circle_group_members').select('role')
        .eq('circle_id', circleId).eq('user_id', user.id).single()

      setUserRole(membership?.role || null)
      setPhase('form')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings')
      setPhase('error')
    }
  }, [circleId, supabase, router])

  useEffect(() => { load() }, [load])

  const isAdmin = circle?.created_by === currentUserId && userRole === 'admin'

  const handleRegenerateCode = async () => {
    setRegenLoading(true)
    try {
      const token = await supabase.auth.getSession().then(s => s.data?.session?.access_token)
      const res = await fetch(`/api/circles/${circleId}/invite-regen`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to regenerate code'); return }
      setInviteCode(data.invite_code)
      setSuccess('Invite code regenerated!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate code')
    } finally {
      setRegenLoading(false)
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    if (!isAdmin || !name.trim()) return
    setPhase('saving'); setError(null); setSuccess(null)
    try {
      const response = await fetch(`/api/circles/${circleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          intention: intention.trim() || null,
          topic_tag: topicTag,
          max_members: maxMembers,
        }),
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to update')
      }
      setDirty(false)
      setSuccess('Settings saved')
      setTimeout(() => setSuccess(null), 3000)
      setPhase('form')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
      setPhase('form')
    }
  }

  async function handleDelete() {
    setPhase('deleting'); setError(null)
    try {
      const response = await fetch(`/api/circles/${circleId}`, { method: 'DELETE' })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to delete')
      }
      setPhase('deleted')
      setTimeout(() => router.push('/circle'), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
      setPhase('form')
    }
  }

  function markDirty() { setDirty(true) }

  if (phase === 'loading') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-200 rounded w-32" />
          <div className="h-10 bg-gray-200 rounded-xl" />
          <div className="h-24 bg-gray-200 rounded-xl" />
          <div className="h-10 bg-gray-200 rounded-xl w-24" />
        </div>
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium mb-1">Something went wrong</p>
          <p className="text-sm text-red-500 mb-4">{error || 'Could not load circle settings.'}</p>
          <div className="flex gap-2 justify-center">
            <button onClick={load} className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100">Try again</button>
            <button onClick={() => router.back()} className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200">Go back</button>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'delete_confirm') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white border border-red-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Delete this circle?</h2>
          <p className="text-sm text-gray-500 mb-1">
            All messages and posts will be preserved but the circle will become inaccessible to all members.
          </p>
          <p className="text-sm text-gray-400 mb-6">Circle: <strong>{circle?.name}</strong></p>
          <div className="flex gap-3">
            <button onClick={() => setPhase('form')} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600">Delete</button>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'deleted') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🗑️</p>
          <p className="font-semibold text-emerald-600 mb-1">Circle deleted</p>
          <p className="text-sm text-gray-400">Redirecting to your circles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-1 -ml-1 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Circle Settings</h1>
      </div>

      {!isAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 mb-6">
          You are viewing settings in read-only mode. Only admins can edit circle settings.
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700 mb-4">{success}</div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">{error}</div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Circle Name</label>
          <input id="name" type="text" value={name} onChange={(e) => { setName(e.target.value); markDirty() }}
            disabled={!isAdmin || phase === 'saving'} maxLength={80} required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50 disabled:bg-gray-50" />
          <p className="text-xs text-gray-400 mt-1">{name.length}/80</p>
        </div>

        <div>
          <label htmlFor="intention" className="block text-sm font-medium text-gray-700 mb-1">Intention</label>
          <textarea id="intention" value={intention} onChange={(e) => { setIntention(e.target.value); markDirty() }}
            disabled={!isAdmin || phase === 'saving'} rows={2} maxLength={150}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50 disabled:bg-gray-50 resize-none" />
          <p className="text-xs text-gray-400 mt-1">{intention.length}/150</p>
        </div>

        <div>
          <label htmlFor="topicTag" className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
          <select id="topicTag" value={topicTag} onChange={(e) => { setTopicTag(e.target.value); markDirty() }}
            disabled={!isAdmin || phase === 'saving'}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50 disabled:bg-gray-50">
            <option value="Faith & Belief">Faith & Belief</option>
            <option value="Mental Health">Mental Health</option>
            <option value="Prayer & Worship">Prayer & Worship</option>
            <option value="Family & Relationships">Family & Relationships</option>
            <option value="Parenting">Parenting</option>
            <option value="Career & Education">Career & Education</option>
            <option value="Hobbies & Interests">Hobbies & Interests</option>
          </select>
        </div>

        <div>
          <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-700 mb-1">Max Members</label>
          <input id="maxMembers" type="number" value={maxMembers} onChange={(e) => { setMaxMembers(parseInt(e.target.value) || 50); markDirty() }}
            disabled={!isAdmin || phase === 'saving'} min={2} max={500}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50 disabled:bg-gray-50" />
        </div>

        {isAdmin && inviteCode && (
          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Invite Sisters</p>
            <div className="flex gap-2 items-center">
              <div className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm tracking-widest text-center">
                {inviteCode}
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(inviteCode)
                  setSuccess('Code copied!')
                }}
                className="px-3 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200"
              >
                Copy
              </button>
            </div>
            <button
              type="button"
              onClick={handleRegenerateCode}
              disabled={regenLoading || phase === 'saving'}
              className="mt-3 w-full px-4 py-2 text-red-500 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-50 disabled:opacity-50"
            >
              {regenLoading ? 'Regenerating...' : 'Regenerate Code'}
            </button>
            <p className="text-xs text-gray-400 mt-2">Create a new code to revoke the current one</p>
          </div>
        )}

        {isAdmin && (
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="submit" disabled={!dirty || phase === 'saving'}
              className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed">
              {phase === 'saving' ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => setPhase('delete_confirm')} disabled={phase === 'saving'}
              className="px-4 py-2.5 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 disabled:opacity-50">
              Delete
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
