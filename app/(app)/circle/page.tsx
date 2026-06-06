'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const TABS = ['Community', 'Groups', 'Events']

const POSTS = [
  {
    id: '1',
    author: 'Sister Noor',
    time: '2 hours ago',
    content: 'Just wanted to remind someone out there that Allah sees your struggles and your efforts. You’re doing better than you think. 🌙',
    likes: 24,
    comments: 8,
  },
  {
    id: '2',
    author: 'Sister A.',
    time: '5 hours ago',
    content: 'What are some ways you stay consistent with your prayers when you’re feeling unmotivated?',
    likes: 18,
    comments: 12,
  },
]

const EVENTS = [
  { id: '1', title: 'Quran Reflection Circle', date: 'May 20, 2025 • 8:00 PM EST' },
  { id: '2', title: 'Sisterhood Chat', date: 'May 24, 2025 • 7:00 PM EST' },
]

const TOPICS = [
  'Strengthening Iman', 'Overcoming Anxiety',
  'Building Better Habits', 'Trusting Allah’s Plan',
  'Relationships & Boundaries',
]

export default function CirclePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('Community')
  const [post, setPost] = useState('')

  return (
    <div className="flex flex-col min-h-dvh bg-cream">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button onClick={() => router.back()} className="text-charcoal/60 text-2xl">‹</button>
        <div className="flex-1 text-center">
          <h1 className="font-display text-xl text-charcoal">The Circle</h1>
          <p className="text-charcoal/40 text-xs">A safe space of faith, support, and sisterhood.</p>
        </div>
        <div className="w-8" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-charcoal/10 px-4">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-rose-amina text-rose-amina'
                : 'border-transparent text-charcoal/40'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Community' && (
        <div className="flex gap-4 px-4 pt-4">
          {/* Main feed */}
          <div className="flex-1 flex flex-col gap-3">
            {/* Compose */}
            <div className="card flex gap-3">
              <div className="w-9 h-9 rounded-full bg-rose-amina/20 flex items-center justify-center flex-shrink-0">
                <span className="text-rose-amina font-bold text-sm">S</span>
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  value={post}
                  onChange={e => setPost(e.target.value)}
                  placeholder="Share with the sisters..."
                  className="flex-1 bg-transparent text-sm text-charcoal placeholder:text-charcoal/30 outline-none"
                />
                <button disabled={!post.trim()} className="btn-primary text-xs px-4 py-1.5 disabled:opacity-40">
                  Post
                </button>
              </div>
            </div>

            {/* Posts */}
            {POSTS.map(p => (
              <div key={p.id} className="card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-ivory flex items-center justify-center">
                      <span className="text-charcoal/50 text-sm">👤</span>
                    </div>
                    <div>
                      <p className="font-semibold text-charcoal text-xs">{p.author}</p>
                      <p className="text-charcoal/30 text-xs">{p.time}</p>
                    </div>
                  </div>
                  <button className="text-charcoal/30">…</button>
                </div>
                <p className="text-charcoal text-sm leading-relaxed mb-3">{p.content}</p>
                <div className="flex gap-4">
                  <button className="flex items-center gap-1 text-xs text-charcoal/50">
                    <span>❤️</span> {p.likes}
                  </button>
                  <button className="flex items-center gap-1 text-xs text-charcoal/50">
                    <span>💬</span> {p.comments}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="w-40 flex-shrink-0 flex flex-col gap-3">
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-charcoal text-xs">Upcoming Events</p>
                <button className="text-olive text-xs">View all</button>
              </div>
              {EVENTS.map(e => (
                <div key={e.id} className="flex gap-2 mb-2">
                  <span className="text-rose-amina text-sm">📅</span>
                  <div>
                    <p className="font-medium text-charcoal text-xs">{e.title}</p>
                    <p className="text-charcoal/40 text-xs">{e.date}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="card">
              <p className="font-semibold text-charcoal text-xs mb-2">Popular Topics</p>
              {TOPICS.map(t => (
                <p key={t} className="text-charcoal/50 text-xs mb-1">• {t}</p>
              ))}
            </div>

            <button className="btn-secondary text-xs py-2 px-3">Create a Group</button>
          </div>
        </div>
      )}

      {activeTab !== 'Community' && (
        <div className="flex flex-col items-center justify-center flex-1 py-16">
          <span className="text-4xl mb-3">👥</span>
          <p className="text-charcoal/40 text-sm">{activeTab} coming soon</p>
        </div>
      )}
    </div>
  )
}
