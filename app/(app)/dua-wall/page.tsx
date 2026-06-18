'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

const SAMPLE_DUAS = [
  {
    id: '1',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    transliteration: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan waqina 'adhaban-nar",
    translation: 'Our Lord, give us in this world good and in the Hereafter good, and protect us from the punishment of the Fire.',
    source: "Quran 2:201",
    category: 'General',
    favorited: false,
  },
  {
    id: '2',
    arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي',
    transliteration: "Rabbi ishrah li sadri wa yassir li amri",
    translation: 'My Lord, expand my chest for me and make my affair easy for me.',
    source: "Quran 20:25-26",
    category: 'Anxiety & Peace',
    favorited: false,
  },
  {
    id: '3',
    arabic: 'رَبِّ لَا تَذَرْنِي فَرْدًا وَأَنتَ خَيْرُ الْوَارِثِينَ',
    transliteration: "Rabbi la tadharni fardan wa anta khayrul-waritheen",
    translation: 'My Lord, do not leave me alone, and You are the best of inheritors.',
    source: "Quran 21:89",
    category: 'Family',
    favorited: false,
  },
]

const CATEGORIES = ['All', 'General', 'Anxiety & Peace', 'Family', 'Forgiveness', 'Gratitude', 'Guidance']

export default function DuaWallPage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState('All')
  const [duas, setDuas] = useState(SAMPLE_DUAS)
  const [search, setSearch] = useState('')

  function toggleFavorite(id: string) {
    setDuas(prev => prev.map(d => d.id === id ? { ...d, favorited: !d.favorited } : d))
  }

  const filtered = duas.filter(d => {
    if (search && !d.translation.toLowerCase().includes(search.toLowerCase())) return false
    if (activeCategory !== 'All' && d.category !== activeCategory) return false
    return true
  })

  return (
    <div className="flex flex-col h-screen bg-cream">
      {/* Header */}
      <div className="px-4 pt-12 pb-4 bg-cream">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()} className="text-charcoal">← Back</button>
        </div>
        <h1 className="font-display text-2xl text-charcoal">Du'a Wall</h1>
        <p className="text-charcoal/50 text-sm">Supplications and remembrances for every moment.</p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 px-4 overflow-x-auto pb-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat ? 'bg-rose-400 text-white' : 'bg-ivory text-charcoal/60'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 bg-ivory rounded-xl px-4 py-2">
          <span className="text-charcoal/30">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search duas..."
            className="flex-1 bg-transparent text-charcoal text-sm outline-none placeholder:text-charcoal/30"
          />
        </div>
      </div>

      {/* Dua cards */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-24">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-4xl mb-3">🤲</span>
            <p className="font-semibold text-charcoal">No duas found</p>
            <p className="text-charcoal/50 text-sm mt-1">Try a different category or search term.</p>
          </div>
        ) : (
          filtered.map(dua => (
            <div key={dua.id} className="bg-ivory rounded-2xl p-5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="bg-cream text-charcoal/60 text-xs px-2 py-0.5 rounded-full">
                  {dua.category}
                </span>
                <button onClick={() => toggleFavorite(dua.id)} className="flex-shrink-0">
                  <span className={dua.favorited ? 'text-rose-400' : 'text-charcoal/20'}>♥</span>
                </button>
              </div>
              <p className="text-right text-2xl leading-loose text-charcoal mb-3" dir="rtl">
                {dua.arabic}
              </p>
              <p className="text-charcoal/60 text-sm italic mb-1">{dua.transliteration}</p>
              <p className="text-charcoal text-sm leading-relaxed">{dua.translation}</p>
              <p className="text-charcoal/40 text-xs mt-2">— {dua.source}</p>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  )
}
