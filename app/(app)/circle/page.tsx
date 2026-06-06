'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

const TABS = ['Community', 'Groups', 'Events']

const POSTS = [
  {
    id: '1',
    author: 'Sister Noor',
    time: '2 hours ago',
    content: "Just wanted to remind someone out there that Allah sees your struggles and your efforts. You're doing better than you think. 🌙",
    likes: 24,
    comments: 8,
  },
  {
    id: '2',
    author: 'Sister A.',
    time: '5 hours ago',
    content: 'What are some ways you stay consistent with your prayers when you\'re feeling unmotivated?',
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
  'Trusting Allah\'s Plan', 'Relationships & Boundaries',
]

export default function CirclePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('Community')
  const [postText, setPostText] = useState('')

  return (
    <div className="flex flex-col h-screen bg-cream">
      {/* Header */}
      <div className="px-4 pt-12 pb-3 bg-cream border-b border-charcoal/10">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => router.back()} className="text-charcoal text-sm">← Back</button>
        </div>
        <h1 className="font-display text-2xl text-charcoal text-center">The Circle</h1>
        <p className="text-charcoal/50 text-sm text-center">A safe space of faith, support, and sisterhood.</p>

        {/* Tabs */}
        <div className="flex mt-4">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 pb-2 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab ? 'border-rose-400 text-rose-500' : 'border-transparent text-charcoal/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {activeTab === 'Community' && (
          <div className="flex gap-4 px-4 pt-4">
            {/* Main feed */}
            <div className="flex-1 space-y-4">
              {/* Post composer */}
              <div className="bg-ivory rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-rose-200 flex items-center justify-center font-semibold text-rose-600 text-sm">S</div>
                  <input
                    value={postText}
                    onChange={e => setPostText(e.target.value)}
                    placeholder="Share with the sisters..."
                    className="flex-1 bg-transparent text-charcoal text-sm outline-none placeholder:text-charcoal/40"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    disabled={!postText.trim()}
                    className="bg-rose-400 text-white px-4 py-1.5 rounded-full text-sm font-medium disabled:opacity-40"
                  >
                    Post
                  </button>
                </div>
              </div>

              {/* Posts */}
              {POSTS.map(post => (
                <div key={post.id} className="bg-ivory rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-sm">🧕</div>
                      <div>
                        <p className="font-semibold text-charcoal text-sm">{post.author}</p>
                        <p className="text-charcoal/40 text-xs">{post.time}</p>
                      </div>
                    </div>
                    <span className="text-charcoal/30">•••</span>
                  </div>
                  <p className="text-charcoal text-sm leading-relaxed mb-3">{post.content}</p>
                  <div className="flex gap-4">
                    <button className="flex items-center gap-1 text-charcoal/50 text-sm">
                      <span>♥</span> {post.likes}
                    </button>
                    <button className="flex items-center gap-1 text-charcoal/50 text-sm">
                      <span>💬</span> {post.comments}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar — hidden on mobile, shown on wider */}
            <div className="hidden md:block w-56 space-y-4 flex-shrink-0">
              <div className="bg-ivory rounded-2xl p-4">
                <p className="font-semibold text-charcoal text-sm mb-3">Upcoming Events</p>
                {EVENTS.map(e => (
                  <div key={e.title} className="mb-3">
                    <div className="flex items-start gap-2">
                      <span className="text-rose-400 text-sm">📅</span>
                      <div>
                        <p className="font-medium text-charcoal text-xs">{e.title}</p>
                        <p className="text-charcoal/50 text-xs">{e.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-ivory rounded-2xl p-4">
                <p className="font-semibold text-charcoal text-sm mb-2">Popular Topics</p>
                <ul className="space-y-1">
                  {POPULAR_TOPICS.map(t => (
                    <li key={t} className="text-charcoal/60 text-xs flex items-start gap-1">
                      <span className="text-charcoal/30">•</span> {t}
                    </li>
                  ))}
                </ul>
              </div>
              <button className="w-full border border-rose-300 text-rose-500 rounded-full py-2 text-sm font-medium">
                Create a Group
              </button>
            </div>
          </div>
        )}

        {activeTab === 'Groups' && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <span className="text-4xl mb-3">👥</span>
            <p className="font-semibold text-charcoal">Groups coming soon</p>
            <p className="text-charcoal/50 text-sm mt-1">Join or create a sister group to connect with others on your journey.</p>
          </div>
        )}

        {activeTab === 'Events' && (
          <div className="px-4 pt-4 space-y-3">
            {EVENTS.map(e => (
              <div key={e.title} className="bg-ivory rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                  <span className="text-rose-400">📅</span>
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
