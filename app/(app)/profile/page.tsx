'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronRight, Pencil, Lock, Bell, Palette, Globe, LogOut,
  ShieldCheck, Download, Trash2,
} from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import AppHeader from '@/components/app/AppHeader'
import { createClient } from '@/lib/supabase/client'

const TABS = ['Profile', 'Preferences', 'Privacy', 'Support']

export default function ProfilePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('Profile')
  const [theme] = useState('Light')
  const [language] = useState('English')

  async function handleLogout() {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {
      // ignore — still route to auth
    }
    router.push('/auth')
  }

  return (
    <div className="flex flex-col min-h-dvh bg-cream pb-28">
      <AppHeader title="Profile" />

      {/* Page heading + tabs */}
      <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid var(--amina-hairline)' }}>
        <h1 className="font-display text-3xl text-charcoal text-center">Profile &amp; Settings</h1>
        <p className="text-charcoal/50 text-sm text-center">Manage your account and preferences.</p>
        {/* Tabs */}
        <div className="flex mt-4 overflow-x-auto gap-1">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-shrink-0 px-4 pb-2 text-sm font-medium transition-colors"
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

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {activeTab === 'Profile' && (
          <div className="space-y-4">
            {/* Avatar + info */}
            <div className="flex items-center gap-4 card">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-display"
                style={{ backgroundColor: 'var(--amina-rose-selected)', color: 'var(--amina-primary-action)' }}
              >
                S
              </div>
              <div>
                <p className="font-semibold text-charcoal">Sister</p>
                <p className="text-charcoal/50 text-sm">sister@example.com</p>
                <p className="text-charcoal/40 text-xs mt-0.5">Member since May 2025</p>
              </div>
            </div>

            {/* Actions */}
            {[
              { icon: Pencil, label: 'Edit Profile' },
              { icon: Lock, label: 'Change Password' },
              { icon: Bell, label: 'Notification Preferences' },
            ].map(item => {
              const Icon = item.icon
              return (
                <button key={item.label} className="w-full flex items-center gap-3 card">
                  <Icon size={20} strokeWidth={1.5} className="text-olive" />
                  <span className="flex-1 text-left text-charcoal text-sm font-medium">{item.label}</span>
                  <ChevronRight size={18} strokeWidth={1.5} className="text-charcoal/30" />
                </button>
              )
            })}

            {/* Theme */}
            <div className="card flex items-center gap-3">
              <Palette size={20} strokeWidth={1.5} className="text-olive" />
              <span className="flex-1 text-charcoal text-sm font-medium">Theme</span>
              <button className="text-charcoal/60 text-sm flex items-center gap-1">{theme} <ChevronRight size={16} strokeWidth={1.5} /></button>
            </div>

            {/* Language */}
            <div className="card flex items-center gap-3">
              <Globe size={20} strokeWidth={1.5} className="text-olive" />
              <span className="flex-1 text-charcoal text-sm font-medium">Language</span>
              <button className="text-charcoal/60 text-sm flex items-center gap-1">{language} <ChevronRight size={16} strokeWidth={1.5} /></button>
            </div>

            {/* Log Out */}
            <button onClick={handleLogout} className="w-full flex items-center gap-3 card text-rose-amina">
              <LogOut size={20} strokeWidth={1.5} />
              <span className="flex-1 text-left text-sm font-medium">Log Out</span>
            </button>
          </div>
        )}

        {activeTab === 'Preferences' && (
          <div className="space-y-4">
            <div className="card">
              <p className="font-semibold text-charcoal mb-3">Reflection Cadence</p>
              <div className="flex gap-2">
                {['Daily', 'A few times a week', 'Weekly'].map(f => (
                  <button key={f} className="flex-1 py-2 px-2 rounded-full text-xs font-medium bg-cream text-charcoal/60" style={{ border: '1px solid var(--amina-border)' }}>{f}</button>
                ))}
              </div>
            </div>
            <div className="card">
              <p className="font-semibold text-charcoal mb-1">Companion Tone</p>
              <p className="text-charcoal/50 text-sm">Currently: Gentle &amp; Nurturing</p>
            </div>
            <div className="card">
              <p className="font-semibold text-charcoal mb-1">Topics of Interest</p>
              <p className="text-charcoal/50 text-sm">Faith &amp; Belief, Inner Peace</p>
            </div>
          </div>
        )}

        {activeTab === 'Privacy' && (
          <div className="space-y-4">
            <div className="card">
              <p className="font-semibold text-charcoal mb-2 flex items-center gap-2">
                <ShieldCheck size={18} strokeWidth={1.5} className="text-olive" /> Your Privacy
              </p>
              <p className="text-charcoal/60 text-sm leading-relaxed">Your conversations with Amina are private and secure. We do not share your data with third parties without your consent.</p>
            </div>
            <button className="w-full card text-left flex items-center gap-3">
              <Download size={20} strokeWidth={1.5} className="text-olive" />
              <div>
                <p className="font-medium text-charcoal text-sm">Download My Data</p>
                <p className="text-charcoal/50 text-xs mt-0.5">Request a copy of all your data.</p>
              </div>
            </button>
            <button className="w-full card text-left flex items-center gap-3">
              <Trash2 size={20} strokeWidth={1.5} className="text-rose-amina" />
              <div>
                <p className="font-medium text-rose-amina text-sm">Delete My Account</p>
                <p className="text-charcoal/50 text-xs mt-0.5">This action is permanent and cannot be undone.</p>
              </div>
            </button>
          </div>
        )}

        {activeTab === 'Support' && (
          <div className="space-y-4">
            {['Help Center', 'Contact Us', 'Report an Issue', 'Terms of Use', 'Privacy Policy'].map(item => (
              <button key={item} className="w-full flex items-center card">
                <span className="flex-1 text-left text-charcoal text-sm font-medium">{item}</span>
                <ChevronRight size={18} strokeWidth={1.5} className="text-charcoal/30" />
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
