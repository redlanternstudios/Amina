'use client'

import { useState } from 'react'
import { Search, BookOpen, Moon, Leaf, Heart, Users, MessageCircle, ChevronRight, Bookmark, ArrowRight } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import AppHeader from '@/components/app/AppHeader'

const CATEGORIES = ['All', 'Faith & Belief', 'Heart & Mind', 'Relationships', 'Life']

const TOPICS = [
  { icon: Moon, label: 'Strengthen Your Iman', count: 18 },
  { icon: Leaf, label: 'Inner Peace & Contentment', count: 22 },
  { icon: Heart, label: 'Healing the Heart', count: 15 },
  { icon: Users, label: 'Family & Relationships', count: 20 },
]

const POPULAR_QUESTIONS = [
  { icon: MessageCircle, q: 'How do I find peace when I feel overwhelmed?', cat: 'Faith & Belief' },
  { icon: Leaf, q: 'How can I improve my connection with Allah?', cat: 'Faith & Belief' },
  { icon: Heart, q: 'How do I let go of the past and move forward?', cat: 'Heart & Mind' },
]

export default function GuidancePage() {
  const [activeCategory, setActiveCategory] = useState('All')

  return (
    <div className="flex flex-col min-h-dvh bg-cream pb-28">
      <AppHeader
        brand
        right={
          <button aria-label="Search" className="w-9 h-9 flex items-center justify-center rounded-full bg-ivory text-charcoal/70" style={{ border: '1px solid var(--amina-hairline)' }}>
            <Search size={18} strokeWidth={1.5} />
          </button>
        }
      />

      {/* Page heading */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="font-display text-3xl text-charcoal mb-1">Guidance</h1>
        <p className="text-charcoal/60 text-sm">Explore answers, wisdom, and reminders for life&apos;s journey.</p>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 px-4 overflow-x-auto pb-3">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`chip flex-shrink-0 ${activeCategory === cat ? 'chip-active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-6">
        {/* Featured Guidance */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-charcoal">Featured Guidance</p>
            <button className="btn-tertiary">View all</button>
          </div>
          <div className="card overflow-hidden p-0">
            <div className="h-32 flex items-center justify-center" style={{ backgroundColor: 'var(--amina-warm-highlight)' }}>
              <BookOpen size={40} strokeWidth={1.25} className="text-olive" />
            </div>
            <div className="p-4">
              <p className="label-eyebrow text-rose-amina mb-1">Featured</p>
              <p className="font-display text-xl text-charcoal mb-2">Finding Strength in Tawakkul</p>
              <p className="text-charcoal/60 text-sm mb-4">Trusting Allah brings peace to the heart and clarity to the path.</p>
              <button className="btn-primary text-sm px-5 py-2">Read Article <ArrowRight size={16} strokeWidth={1.75} /></button>
            </div>
          </div>
        </div>

        {/* Browse by topic */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-charcoal">Browse by topic</p>
            <button className="btn-tertiary">View all</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {TOPICS.map(t => {
              const Icon = t.icon
              return (
                <div key={t.label} className="card">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--amina-rose-selected)' }}>
                    <Icon size={22} strokeWidth={1.5} className="text-charcoal" />
                  </div>
                  <p className="font-semibold text-charcoal text-sm leading-snug mb-1">{t.label}</p>
                  <p className="text-rose-amina text-xs flex items-center gap-1">{t.count} articles <ArrowRight size={12} strokeWidth={1.75} /></p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Popular Questions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-charcoal">Popular Questions</p>
            <button className="btn-tertiary">View all</button>
          </div>
          <div className="space-y-2">
            {POPULAR_QUESTIONS.map((q, i) => {
              const Icon = q.icon
              return (
                <div key={i} className="card flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center flex-shrink-0" style={{ border: '1px solid var(--amina-hairline)' }}>
                    <Icon size={18} strokeWidth={1.5} className="text-olive" />
                  </div>
                  <div className="flex-1">
                    <p className="text-charcoal text-sm font-medium">{q.q}</p>
                    <p className="text-charcoal/40 text-xs mt-0.5">Answer • {q.cat}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 text-charcoal/30">
                    <Bookmark size={16} strokeWidth={1.5} />
                    <ChevronRight size={16} strokeWidth={1.5} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
