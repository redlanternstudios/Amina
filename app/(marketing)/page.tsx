'use client'

import Link from 'next/link'
import { ArrowRight, Check, ShieldCheck, BookOpen, Moon, MessageCircle, HandHeart } from 'lucide-react'
import AminaWordmark from '@/components/brand/AminaWordmark'
import AminaIcon from '@/components/brand/AminaIcon'

const SUPPORTS = [
  { icon: BookOpen, title: 'New Muslim Guidance', desc: 'Helpful answers and gentle explanations for those learning Islam.' },
  { icon: Moon, title: 'Daily Reflections', desc: 'Inspiration, reminders, and reflections to keep your heart grounded.' },
  { icon: MessageCircle, title: 'Faith Q&A', desc: 'Ask your questions and get faith-centered responses with wisdom and care.' },
  { icon: HandHeart, title: 'Sisterly Support', desc: 'A safe space to talk, reflect, and feel understood — anytime.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-cream font-body">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <AminaWordmark size="sm" tone="charcoal" showSignature={false} className="!items-start" />
        <div className="hidden md:flex gap-8 text-sm text-charcoal">
          <a href="#about" className="hover:text-rose-amina transition-colors">About</a>
          <a href="#how" className="hover:text-rose-amina transition-colors">How It Works</a>
          <a href="#access" className="hover:text-rose-amina transition-colors">Access</a>
        </div>
        <Link href="/auth" className="btn-primary text-sm px-5 py-2.5">
          Join The Circle
        </Link>
      </nav>

      {/* Hero */}
      <section id="about" className="max-w-6xl mx-auto px-6 pt-16 pb-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="label-eyebrow text-rose-amina mb-4">Meet Amina</p>
          <h1 className="font-display text-5xl md:text-6xl text-charcoal leading-tight mb-6 text-balance">
            You&apos;re not meant to navigate this journey <span className="text-rose-amina">alone.</span>
          </h1>
          <p className="text-charcoal/70 text-lg mb-8 leading-relaxed">
            Meet Amina, your faith-centered reflection companion for questions, encouragement, and support — whenever you need it.
          </p>
          <ul className="space-y-3 mb-10">
            {[
              'Guidance for your heart and mind',
              'Rooted in Islam. Built with love.',
              'Private, safe, and sisters-only',
            ].map(item => (
              <li key={item} className="flex items-center gap-3 text-charcoal/80">
                <span className="w-5 h-5 rounded-full bg-ivory flex items-center justify-center flex-shrink-0">
                  <Check size={12} strokeWidth={2.5} className="text-rose-amina" />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-4">
            <Link href="/auth" className="btn-primary">
              Access Amina <ArrowRight size={18} strokeWidth={1.75} />
            </Link>
            <a href="#how" className="btn-secondary">Learn More</a>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-square rounded-3xl bg-ivory flex items-center justify-center" style={{ border: '1px solid var(--amina-hairline)' }}>
            <div className="text-center p-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--amina-warm-highlight)' }}>
                <AminaIcon size={36} />
              </div>
              <p className="font-display text-2xl text-charcoal mb-2">Amina is here to walk</p>
              <p className="text-charcoal/70">beside you on your beautiful journey of faith, growth, and healing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it supports you */}
      <section id="how" className="bg-ivory py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl text-charcoal mb-4">How Amina Supports You</h2>
            <p className="text-charcoal/60">A personal companion created for women on their journey to Allah.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {SUPPORTS.map(item => {
              const Icon = item.icon
              return (
                <div key={item.title} className="bg-cream rounded-3xl p-6 text-center" style={{ border: '1px solid var(--amina-hairline)' }}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--amina-rose-selected)' }}>
                    <Icon size={24} strokeWidth={1.5} className="text-charcoal" />
                  </div>
                  <h3 className="font-semibold text-charcoal mb-2">{item.title}</h3>
                  <p className="text-sm text-charcoal/60 leading-relaxed">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Access Gate */}
      <section id="access" className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div className="rounded-3xl p-10 text-center bg-ivory" style={{ border: '1px solid var(--amina-hairline)' }}>
          <p className="font-display text-4xl text-olive mb-2">أمينة</p>
          <p className="text-charcoal/60 italic font-display text-lg">A faithful companion on your journey to Allah.</p>
          <div className="mt-6 flex justify-center">
            <AminaIcon size={32} />
          </div>
        </div>
        <div>
          <p className="label-eyebrow text-rose-amina mb-4">Member Access</p>
          <h2 className="font-display text-4xl text-charcoal mb-4">Access Amina</h2>
          <p className="text-charcoal/60 mb-8">
            Amina is available exclusively to The Circle members. Download the app and sign in to begin.
          </p>
          <Link href="/auth" className="btn-primary w-full mb-4">
            Access Amina <ArrowRight size={18} strokeWidth={1.75} />
          </Link>
          <p className="text-sm text-center text-charcoal/50">
            Not a member yet?{' '}
            <a href="https://theblondemuslim.com/circle" className="text-rose-amina hover:underline">Join The Circle</a>
          </p>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <div className="bg-ivory rounded-3xl p-6 flex gap-4 items-start" style={{ border: '1px solid var(--amina-hairline)' }}>
          <ShieldCheck size={20} strokeWidth={1.5} className="text-olive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-charcoal/60 leading-relaxed">
            Amina is a companion designed to support your spiritual journey. For detailed religious rulings (fatwas),
            please consult qualified scholars. For emotional support needs, please seek professional support. Amina is
            not a replacement for human connection, scholarly guidance, or professional care.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12" style={{ borderTop: '1px solid var(--amina-border)' }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <p className="font-display italic text-2xl text-charcoal mb-1">Amina</p>
            <p className="text-sm text-charcoal/50">by RedLantern Studios™</p>
            <p className="text-sm text-olive mt-2">Faith. Purpose. Sisterhood.</p>
          </div>
          <div className="flex gap-12 text-sm">
            <div>
              <p className="font-semibold text-charcoal mb-3">Quick Links</p>
              <ul className="space-y-2 text-charcoal/60">
                <li><a href="#about" className="hover:text-rose-amina">About</a></li>
                <li><Link href="/auth" className="hover:text-rose-amina">Access Amina</Link></li>
                <li><a href="https://theblondemuslim.com/circle" className="hover:text-rose-amina">The Circle</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-charcoal mb-3">Legal</p>
              <ul className="space-y-2 text-charcoal/60">
                <li><Link href="/privacy" className="hover:text-rose-amina">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-rose-amina">Terms of Use</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
