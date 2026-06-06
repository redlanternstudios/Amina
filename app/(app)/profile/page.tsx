'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

const TABS = ['Profile', 'Preferences', 'Privacy', 'Support']

export default function ProfilePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('Profile')
  const [theme, setTheme] = useState('Light')
  const [language, setLanguage] = useState('English')

  return (
    <div className="flex flex-col h-screen bg-cream">
      {/* Header */}
      <div className="px-4 pt-12 pb-3 bg-cream border-b border-charcoal/10">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => router.back()} className="text-charcoal text-sm">← Back</button>
        </div>
        <h1 className="font-display text-2xl text-charcoal text-center">Profile & Settings</h1>
        <p className="text-charcoal/50 text-sm text-center">Manage your account and preferences.</p>
        {/* Tabs */}
        <div className="flex mt-4 overflow-x-auto gap-1">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 pb-2 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab ? 'border-rose-400 text-rose-500' : 'border-transparent text-charcoal/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        {activeTab === 'Profile' && (
          <div className="space-y-4">
            {/* Avatar + info */}
            <div className="flex items-center gap-4 bg-ivory rounded-2xl p-4">
              <div className="w-16 h-16 rounded-full bg-rose-200 flex items-center justify-center text-2xl font-semibold text-rose-600">S</div>
              <div>
                <p className="font-semibold text-charcoal">Sister</p>
                <p className="text-charcoal/50 text-sm">sister@example.com</p>
                <p className="text-charcoal/40 text-xs mt-0.5">Member since May 2025</p>
              </div>
            </div>

            {/* Actions */}
            {[
              { icon: '✏️', label: 'Edit Profile' },
              { icon: '🔒', label: 'Change Password' },
              { icon: '🔔', label: 'Notification Preferences' },
            ].map(item => (
              <button key={item.label} className="w-full flex items-center gap-3 bg-ivory rounded-2xl p-4">
                <span className="text-xl">{item.icon}</span>
                <span className="flex-1 text-left text-charcoal text-sm font-medium">{item.label}</span>
                <span className="text-charcoal/30">›</span>
              </button>
            ))}

            {/* Theme */}
            <div className="bg-ivory rounded-2xl p-4 flex items-center">
              <span className="text-xl mr-3">🎨</span>
              <span className="flex-1 text-charcoal text-sm font-medium">Theme</span>
              <button className="text-charcoal/60 text-sm">{theme} ›</button>
            </div>

            {/* Language */}
            <div className="bg-ivory rounded-2xl p-4 flex items-center">
              <span className="text-xl mr-3">🌍</span>
              <span className="flex-1 text-charcoal text-sm font-medium">Language</span>
              <button className="text-charcoal/60 text-sm">{language} ›</button>
            </div>

            {/* Log Out */}
            <button className="w-full flex items-center gap-3 bg-ivory rounded-2xl p-4 text-red-500">
              <span className="text-xl">🚪</span>
              <span className="flex-1 text-left text-sm font-medium">Log Out</span>
            </button>
          </div>
        )}

        {activeTab === 'Preferences' && (
          <div className="space-y-4">
            <div className="bg-ivory rounded-2xl p-4">
              <p className="font-semibold text-charcoal mb-3">Reflection Cadence</p>
              <div className="flex gap-2">
                {['Daily', 'A few times a week', 'Weekly'].map(f => (
                  <button key={f} className="flex-1 py-2 px-2 rounded-full text-xs font-medium bg-cream border border-charcoal/15 text-charcoal/60">{f}</button>
                ))}
              </div>
            </div>
            <div className="bg-ivory rounded-2xl p-4">
              <p className="font-semibold text-charcoal mb-1">Companion Tone</p>
              <p className="text-charcoal/50 text-sm">Currently: Gentle & Nurturing</p>
            </div>
            <div className="bg-ivory rounded-2xl p-4">
              <p className="font-semibold text-charcoal mb-1">Topics of Interest</p>
              <p className="text-charcoal/50 text-sm">Faith & Belief, Inner Peace</p>
            </div>
          </div>
        )}

        {activeTab === 'Privacy' && (
          <div className="space-y-4">
            <div className="bg-ivory rounded-2xl p-5">
              <p className="font-semibold text-charcoal mb-2">🔒 Your Privacy</p>
              <p className="text-charcoal/60 text-sm leading-relaxed">Your conversations with Amina are private and secure. We do not share your data with third parties without your consent.</p>
            </div>
            <button className="w-full bg-ivory rounded-2xl p-4 text-left">
              <p className="font-medium text-charcoal text-sm">Download My Data</p>
              <p className="text-charcoal/50 text-xs mt-0.5">Request a copy of all your data.</p>
            </button>
            <button className="w-full bg-ivory rounded-2xl p-4 text-left">
              <p className="font-medium text-red-500 text-sm">Delete My Account</p>
              <p className="text-charcoal/50 text-xs mt-0.5">This action is permanent and cannot be undone.</p>
            </button>
          </div>
        )}

        {activeTab === 'Support' && (
          <div className="space-y-4">
            {['Help Center', 'Contact Us', 'Report an Issue', 'Terms of Use', 'Privacy Policy'].map(item => (
              <button key={item} className="w-full flex items-center bg-ivory rounded-2xl p-4">
                <span className="flex-1 text-left text-charcoal text-sm font-medium">{item}</span>
                <span className="text-charcoal/30">›</span>
              </button>
            ))}
            <p className="text-center text-charcoal/30 text-xs">Amina v1.0.0 • by RedLantern Studios™</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
