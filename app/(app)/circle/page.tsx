'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Heart, MessageCircle, MoreHorizontal, CalendarDays, Users } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const TABS = ['Community', 'Groups', 'Events']

const POSTS = [
  {
    id: '1',
    author: 'Sister Noor',
    time: '2 hours ago',
    content: "Just wanted to remind someone out there that Allah sees your struggles and your efforts. You're doing better than you think.",
    likes: 24,
    comments: 8,
  },
  {
    id: '2',
    author: 'Sister A.',
    time: '5 hours ago',
    content: "What are some ways you stay consistent with your prayers when you're feeling unmotivated?",
    likes: 18,
    comments: 12,
  },
]

const EVENTS = [
  { title: 'Quran Reflection Circle', date: 'May 20, 2025 • 8:00 PM EST' },
  { title: 'Sisterhood Chat', date: 'May 24, 2025 • 7:00 PM EST' },
]

const POPULAR_TOPICS = [
  'Strengthening Iman', 'Overcoming Anxiety', 'Building Better Habits',
  "Trusting Allah's Plan", 'Relationships & Boundaries',
]

function Avatar({ initial }: { initial: string }) {
  return (
    <div
      className="flex items-center justify-center rounded-full font-semibold text-sm flex-shrink-0"
      style={{ width: 36, height: 36, backgroundColor: 'var(--amina-rose-selected)', color: 'var(--amina-primary-action)' }}
    >
      {initial}
    </div>
  )
}

export default function CirclePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('Community')
  const [postText, setPostText] = useState('')

  return (
    <div className="flex flex-col min-h-dvh bg-cream pb-28">
      {/* Header */}
      <div className="px-4 pt-12 pb-3" style={{ borderBottom: '1px solid var(--amina-hairline)' }}>
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => router.back()} aria-label="Back" className="flex items-center gap-1 text-charcoal text-sm">
            <ChevronLeft size={18} strokeWidth={1.5} /> Back
          </button>
        </div>
        <h1 className="font-display text-3xl text-charcoal text-center">The Circle</h1>
        <p className="text-charcoal/50 text-sm text-center">A safe space of faith, support, and sisterhood.</p>

        {/* Tabs */}
        <div className="flex mt-4">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 pb-2 text-sm font-medium transition-colors"
              style={{
                borderBottom: activeTab === tab ? '2px solid var(--amina-primary-action)' : '2px solid transparent',
                color: activeTab === tab ? 'var(--amina-primary-action)' : 'var(--amina-muted-text)',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'Community' && (
          <div className="flex gap-4 px-4 pt-4">
            {/* Main feed */}
            <div className="flex-1 space-y-4">
              {/* Post composer */}
              <div className="card">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar initial="S" />
                  <input
                    value={postText}
                    onChange={e => setPostText(e.target.value)}
                    placeholder="Share with the sisters..."
                    className="flex-1 bg-transparent text-charcoal text-sm outline-none placeholder:text-charcoal/40"
                  />
                </div>
                <div className="flex justify-end">
                  <button disabled={!postText.trim()} className="btn-primary text-sm px-5 py-2 disabled:opacity-40">
                    Post
                  </button>
                </div>
              </div>

              {/* Posts */}
              {POSTS.map(post => (
                <div key={post.id} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar initial={post.author.charAt(post.author.indexOf(' ') + 1)} />
                      <div>
                        <p className="font-semibold text-charcoal text-sm">{post.author}</p>
                        <p className="text-charcoal/40 text-xs">{post.time}</p>
                      </div>
                    </div>
                    <button aria-label="Post options" className="text-charcoal/30">
                      <MoreHorizontal size={18} strokeWidth={1.5} />
                    </button>
                  </div>
                  <p className="text-charcoal text-sm leading-relaxed mb-3">{post.content}</p>
                  <div className="flex gap-4 text-charcoal/50">
                    <button className="flex items-center gap-1.5 text-sm">
                      <Heart size={16} strokeWidth={1.5} /> {post.likes}
                    </button>
                    <button className="flex items-center gap-1.5 text-sm">
                      <MessageCircle size={16} strokeWidth={1.5} /> {post.comments}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar — hidden on mobile */}
            <div className="hidden md:block w-56 space-y-4 flex-shrink-0">
              <div className="card">
                <p className="font-semibold text-charcoal text-sm mb-3">Upcoming Events</p>
                {EVENTS.map(e => (
                  <div key={e.title} className="mb-3 flex items-start gap-2">
                    <CalendarDays size={16} strokeWidth={1.5} className="text-rose-amina mt-0.5" />
                    <div>
                      <p className="font-medium text-charcoal text-xs">{e.title}</p>
                      <p className="text-charcoal/50 text-xs">{e.date}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="card">
                <p className="font-semibold text-charcoal text-sm mb-2">Popular Topics</p>
                <ul className="space-y-1">
                  {POPULAR_TOPICS.map(t => (
                    <li key={t} className="text-charcoal/60 text-xs flex items-start gap-1">
                      <span className="text-charcoal/30">•</span> {t}
                    </li>
                  ))}
                </ul>
              </div>
              <button className="btn-secondary w-full text-sm py-2.5">Create a Group</button>
            </div>
          </div>
        )}

        {activeTab === 'Groups' && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <Users size={36} strokeWidth={1.25} className="text-olive mb-3" />
            <p className="font-semibold text-charcoal">Groups coming soon</p>
            <p className="text-charcoal/50 text-sm mt-1">Join or create a sister group to connect with others on your journey.</p>
          </div>
        )}

        {activeTab === 'Events' && (
          <div className="px-4 pt-4 space-y-3">
            {EVENTS.map(e => (
              <div key={e.title} className="card flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--amina-rose-selected)' }}>
                  <CalendarDays size={18} strokeWidth={1.5} className="text-rose-amina" />
                </div>
                <div>
                  <p className="font-semibold text-charcoal text-sm">{e.title}</p>
                  <p className="text-charcoal/50 text-xs">{e.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
