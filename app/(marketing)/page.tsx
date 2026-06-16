'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Heart,
  BookOpen,
  ShieldCheck,
  HandHeart,
  MessageCircle,
  Sparkles,
  Lock,
  Instagram,
  Youtube,
  Mail,
} from 'lucide-react'
import AminaWordmark from '@/components/brand/AminaWordmark'

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Amina', href: '#about' },
  { label: 'The Circle', href: '#access' },
  { label: 'Partnerships', href: '#' },
]

const HERO_BULLETS = [
  { icon: Heart, text: 'Guidance for your heart and mind' },
  { icon: Sparkles, text: 'Rooted in Islam. Built with love.' },
  { icon: ShieldCheck, text: 'Private, safe, and sisters-only' },
]

const SUPPORTS = [
  {
    icon: HandHeart,
    title: 'New Muslim Guidance',
    desc: 'Helpful answers and gentle explanations for those learning Islam.',
    tone: 'olive' as const,
  },
  {
    icon: BookOpen,
    title: 'Daily Reflections',
    desc: 'Inspiration, reminders, and reflections to keep your heart grounded.',
    tone: 'rose' as const,
  },
  {
    icon: MessageCircle,
    title: 'Faith Q&A',
    desc: 'Ask your questions and get faith-centered responses with wisdom and care.',
    tone: 'olive' as const,
  },
  {
    icon: HandHeart,
    title: 'Sisterly Support',
    desc: 'A safe space to talk, reflect, and feel understood — anytime.',
    tone: 'rose' as const,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-cream font-body">
      {/* Nav */}
      <nav className="flex items-center justify-between gap-6 px-8 lg:px-16 py-8 max-w-7xl mx-auto">
        <AminaWordmark size="lg" tone="gradient" className="!items-start !text-left" />
        <div className="hidden lg:flex items-center gap-7 text-sm text-secondary">
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href} className="hover:text-rose-amina transition-colors whitespace-nowrap">
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth" className="text-sm font-medium text-muted transition-colors whitespace-nowrap hover:text-primary">
            Sign in
          </Link>
          <Link href="/auth" className="btn-primary text-sm px-5 py-2.5 whitespace-nowrap">
            Join The Circle
            <HandHeart size={16} strokeWidth={1.75} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section id="about" className="max-w-7xl mx-auto px-6 lg:px-12 pt-10 pb-16 grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
        <div>
          <p className="label-eyebrow text-rose-amina mb-5 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-warm-highlight flex items-center justify-center">
              <Lock size={13} strokeWidth={1.75} className="text-rose-action" />
            </span>
            Meet Amina
          </p>
          <h1 className="font-display text-5xl md:text-6xl text-primary leading-[1.05] mb-6 text-balance">
            You&apos;re not meant to navigate this journey <span className="accent-italic text-rose-action">alone.</span>
          </h1>
          <p className="text-secondary text-lg mb-8 leading-relaxed max-w-md">
            Meet Amina, your faith-centered reflection companion for questions, encouragement, and support — whenever you
            need it.
          </p>
          <ul className="space-y-4 mb-10">
            {HERO_BULLETS.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.text} className="flex items-center gap-3 text-primary">
                  <span className="w-9 h-9 rounded-full bg-ivory flex items-center justify-center flex-shrink-0" style={{ border: '1px solid var(--amina-hairline)' }}>
                    <Icon size={16} strokeWidth={1.5} className="text-rose-action" />
                  </span>
                  {item.text}
                </li>
              )
            })}
          </ul>
          <div className="flex flex-wrap gap-4">
            <Link href="/auth" className="btn-primary">
              Access Amina <ArrowRight size={18} strokeWidth={1.75} />
            </Link>
            <a href="#how" className="btn-secondary">
              Learn More
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-card-lg">
            <Image
              src="/marketing/hero-woman.png"
              alt="A woman in a hijab sitting peacefully on a balcony, gazing at mountains at sunrise"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.15) 100%)' }} />
          </div>
          {/* Floating quote card */}
          <div className="absolute -bottom-6 -left-2 sm:left-6 max-w-[16rem] bg-cream rounded-3xl p-6 text-center shadow-card-lg" style={{ border: '1px solid var(--amina-hairline)' }}>
            <div className="w-12 h-12 rounded-full bg-rose-selected flex items-center justify-center mx-auto mb-3 ring-soft">
              <Sparkles size={20} strokeWidth={1.5} className="text-rose-action" />
            </div>
            <p className="font-display text-lg text-primary leading-snug mb-3">
              Amina is here to walk beside you on your beautiful journey of faith, growth, and healing.
            </p>
            <div className="gold-divider mx-auto mb-3" />
            <Heart size={16} strokeWidth={1.5} className="text-rose-action mx-auto" />
          </div>
        </div>
      </section>

      {/* How it supports you */}
      <section id="how" className="max-w-7xl mx-auto px-6 lg:px-12 pt-16">
        <div className="bg-ivory rounded-[2rem] px-6 sm:px-12 py-14" style={{ border: '1px solid var(--amina-hairline)' }}>
          <div className="text-center mb-12 max-w-xl mx-auto">
            <h2 className="font-display text-4xl text-primary mb-4">How Amina Supports You</h2>
            <div className="gold-divider mx-auto mb-4" />
            <p className="text-muted">A personal AI companion created for women on their journey to Allah.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6">
            {SUPPORTS.map((item, i) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="text-center px-2 lg:px-6"
                  style={i < SUPPORTS.length - 1 ? { borderRight: '1px solid var(--amina-hairline)' } : undefined}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: item.tone === 'olive' ? 'var(--amina-soft-olive)' : 'var(--amina-primary-action)' }}
                  >
                    <Icon size={24} strokeWidth={1.5} className="text-cream" />
                  </div>
                  <h3 className="font-display text-lg text-primary mb-2">{item.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Access Gate */}
      <section id="access" className="max-w-7xl mx-auto px-6 lg:px-12 py-16 grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
        <div className="relative aspect-[5/4] rounded-3xl overflow-hidden shadow-card-lg">
          <Image
            src="/marketing/access-arch.png"
            alt="An Islamic arch tablet with Arabic calligraphy reading Amina, beside a lantern and white flowers"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div>
          <p className="label-eyebrow text-rose-action mb-4 flex items-center gap-2">
            <Lock size={14} strokeWidth={1.75} />
            Member Access
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-primary mb-4">Access Amina</h2>
          <p className="text-muted mb-8 max-w-md">
            Amina is available exclusively to The Circle members. Enter your access code to begin.
          </p>
          <form action="/auth" className="space-y-4 max-w-md">
            <div className="relative">
              <input
                type="text"
                name="code"
                placeholder="Enter Access Code"
                className="input-field pr-12"
                aria-label="Access code"
              />
              <Lock size={18} strokeWidth={1.5} className="text-muted absolute right-4 top-1/2 -translate-y-1/2" />
            </div>
            <button type="submit" className="btn-primary w-full justify-center">
              Access Amina <ArrowRight size={18} strokeWidth={1.75} />
            </button>
          </form>

        </div>
      </section>

      {/* Disclaimer */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-16">
        <div className="relative overflow-hidden rounded-[2rem] p-7 flex gap-5 items-start" style={{ backgroundColor: 'var(--amina-rose-selected)' }}>
          <Image
            src="/marketing/botanical-accent.png"
            alt=""
            aria-hidden="true"
            width={220}
            height={220}
            className="pointer-events-none select-none absolute -right-4 -bottom-6 w-44 opacity-25"
          />
          <span className="w-11 h-11 rounded-full bg-rose-action flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={20} strokeWidth={1.5} className="text-cream" />
          </span>
          <p className="relative text-sm text-secondary leading-relaxed max-w-4xl">
            Amina is an AI companion designed to support your spiritual journey. For detailed religious rulings (fatwas),
            please consult qualified scholars. For emotional support needs, please seek professional support. Amina is not
            a replacement for human connection, scholarly guidance, or professional care.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ivory" style={{ borderTop: '1px solid var(--amina-border)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-14 grid gap-10 md:grid-cols-3">
          <div>
            <AminaWordmark size="md" tone="gradient" className="!items-start !text-left" />
            <p className="font-display text-primary mt-4">Faith. Purpose. Sisterhood.</p>
            <p className="text-sm text-muted mt-1">Building a legacy of light.</p>
          </div>
          <div>
            <p className="label-eyebrow text-muted mb-4">Quick Links</p>
            <ul className="space-y-2.5 text-sm text-secondary">
              <li><a href="#about" className="hover:text-rose-action">About</a></li>
              <li><a href="#about" className="hover:text-rose-action">Amina</a></li>
              <li><a href="#access" className="hover:text-rose-action">The Circle</a></li>
              <li><a href="#" className="hover:text-rose-action">Partnerships</a></li>
            </ul>
          </div>
          <div>
            <p className="label-eyebrow text-muted mb-4">Connect</p>
            <div className="flex gap-3">
              {[Instagram, Youtube, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-cream flex items-center justify-center text-secondary hover:text-rose-action transition-colors"
                  style={{ border: '1px solid var(--amina-hairline)' }}
                  aria-label="Social link"
                >
                  <Icon size={18} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
