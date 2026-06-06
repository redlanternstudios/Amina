'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const TABS = ['Profile', 'Preferences', 'Privacy', 'Support']

export default function ProfilePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('Profile')

  return (
    <div className="flex flex-col min-h-dvh bg-cream">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button onClick={() => router.back()} className="text-charcoal/60 text-2xl">‹</button>
        <div className="flex-1 text-center">
          <h1 className="font-display text-xl text-charcoal">Profile & Settings</h1>
          <p className="text-charcoal/40 text-xs">Manage your account and preferences.</p>
        </div>
        <div className="w-8" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-charcoal/10 px-4 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-3 text-sm font-medium border-b-2 transition-colors flex-shrink-0 ${
              activeTab === tab
                ? 'border-rose-amina text-rose-amina'
                : 'border-transparent text-charcoal/40'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Profile' && (
        <div className="px-4 pt-6 flex flex-col gap-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-rose-amina/20 flex items-center justify-center">
              <span className="text-rose-amina font-bold text-2xl">S</span>
            </div>
            <div>
              <p className="font-semibold text-charcoal">Sister</p>
              <p className="text-charcoal/40 text-sm">sister@example.com</p>
              <p className="text-charcoal/30 text-xs">Member since May 2025</p>
            </div>
          </div>

          {/* Actions */}
          <div className="card flex flex-col gap-1 divide-y divide-charcoal/5">
            {[
              { icon: '✏️', label: 'Edit Profile' },
              { icon: '🔒', label: 'Change Password' },
              { icon: '🔔', label: 'Notification Preferences' },
            ].map(item => (
              <button key={item.label} className="flex items-center gap-3 py-3 text-left">
                <span>{item.icon}</span>
                <span className="text-charcoal text-sm">{item.label}</span>
                <span className="ml-auto text-charcoal/30">›</span>
              </button>
            ))}
          </div>

          {/* Preferences */}
          <div className="card flex flex-col gap-1 divide-y divide-charcoal/5">
            <div className="flex items-center justify-between py-3">
              <span className="text-charcoal text-sm">Theme</span>
              <span className="text-charcoal/40 text-sm">Light ›</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-charcoal text-sm">Language</span>
              <span className="text-charcoal/40 text-sm">English ›</span>
            </div>
          </div>

          {/* Log out */}
          <button className="flex items-center gap-3 py-3 text-rose-amina">
            <span>🚪</span>
            <span className="text-sm font-medium">Log Out</span>
          </button>
        </div>
      )}

      {activeTab !== 'Profile' && (
        <div className="flex flex-col items-center justify-center flex-1 py-16">
          <span className="text-4xl mb-3">⚙️</span>
          <p className="text-charcoal/40 text-sm">{activeTab} settings coming soon</p>
        </div>
      )}
    </div>
  )
}
