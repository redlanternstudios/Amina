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
  { icon: Sparkles, text: 'Grounded in your deen.' },
  { icon: ShieldCheck, text: 'Private and safe — for you alone.' },
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

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-cream/90 backdrop-blur-sm" style={{ borderBottom: '1px solid var(--amina-hairline)' }}>
        <div className="flex items-center justify-between gap-4 px-5 sm:px-8 lg:px-12 py-4 max-w-6xl mx-auto">
          {/* Wordmark — compact in nav */}
          <div className="flex items-baseline gap-2 flex-shrink-0">
            <span
              className="font-display italic leading-none text-3xl"
              style={{
                backgroundImage: 'linear-gradient(95deg, var(--amina-soft-olive) 0%, var(--amina-dusty-rose) 55%, var(--amina-muted-gold) 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Amina
            </span>
            <span className="font-display italic text-[11px]" style={{ color: 'var(--amina-muted-text)' }}>
              by RedLantern Studios™
            </span>
          </div>

          {/* Center links */}
          <div className="hidden lg:flex items-center gap-7 text-sm text-secondary">
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="hover:text-rose-amina transition-colors whitespace-nowrap">
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href="/auth"
              className="hidden sm:inline text-sm font-medium text-muted transition-colors whitespace-nowrap hover:text-primary"
            >
              Sign in
            </Link>
            <Link href="/auth" className="btn-primary text-sm px-4 sm:px-5 py-2.5 whitespace-nowrap">
              Join The Circle
              <HandHeart size={15} strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        id="about"
        className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 pt-8 pb-12 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center"
      >
        {/* Left — copy */}
        <div>
          <p className="label-eyebrow text-rose-amina mb-5 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-warm-highlight flex items-center justify-center">
              <Lock size={11} strokeWidth={1.75} className="text-rose-action" />
            </span>
            Meet Amina
          </p>

          <h1 className="font-display text-[2.6rem] sm:text-5xl md:text-[3.5rem] lg:text-[3.75rem] text-primary leading-[1.05] mb-5 text-balance">
            You&apos;re not meant to navigate this journey{' '}
            <span className="accent-italic text-rose-action">alone.</span>
          </h1>

          <p className="text-secondary text-base sm:text-lg mb-7 leading-relaxed max-w-sm">
            Meet Amina, your faith-centered reflection companion for questions, encouragement, and support — whenever you
            need it.
          </p>

          <ul className="space-y-3 mb-9">
            {HERO_BULLETS.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.text} className="flex items-center gap-3 text-primary text-[15px]">
                  <span
                    className="w-8 h-8 rounded-full bg-ivory flex items-center justify-center flex-shrink-0"
                    style={{ border: '1px solid var(--amina-hairline)' }}
                  >
                    <Icon size={14} strokeWidth={1.5} className="text-rose-action" />
                  </span>
                  {item.text}
                </li>
              )
            })}
          </ul>

          <div className="flex flex-wrap gap-3">
            <Link href="/auth" className="btn-primary">
              Join The Circle <ArrowRight size={17} strokeWidth={1.75} />
            </Link>
            <a href="#how" className="btn-secondary">
              Learn More
            </a>
          </div>
        </div>

        {/* Right — image */}
        <div className="relative mt-6 lg:mt-0">
          <div className="relative aspect-[4/5] rounded-2xl lg:rounded-3xl overflow-hidden shadow-card-lg">
            <Image
              src="/marketing/hero-woman.png"
              alt="A woman in a hijab sitting peacefully on a balcony, gazing at mountains at sunrise"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.15) 100%)' }}
            />
          </div>

          {/* Floating quote card — safe positioning */}
          <div
            className="absolute bottom-5 left-4 sm:left-6 max-w-[15rem] bg-cream rounded-2xl p-5 text-center"
            style={{
              border: '1px solid var(--amina-hairline)',
              boxShadow: 'var(--amina-shadow-soft)',
            }}
          >
            <div className="w-10 h-10 rounded-full bg-rose-selected flex items-center justify-center mx-auto mb-3 ring-soft">
              <Sparkles size={17} strokeWidth={1.5} className="text-rose-action" />
            </div>
            <p className="font-display text-[15px] text-primary leading-snug mb-2.5">
              Private. Faith-centered. Built for Muslim women.
            </p>
            <div className="gold-divider mx-auto mb-2.5" />
            <Heart size={14} strokeWidth={1.5} className="text-rose-action mx-auto" />
          </div>
        </div>
      </section>

      {/* ── How it supports you ── */}
      <section id="how" className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 pb-12">
        <div
          className="bg-ivory rounded-2xl sm:rounded-[2rem] px-5 sm:px-10 lg:px-14 py-12 lg:py-16"
          style={{ border: '1px solid var(--amina-hairline)' }}
        >
          <div className="text-center mb-10 max-w-lg mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl text-primary mb-3">How Amina Supports You</h2>
            <div className="gold-divider mx-auto mb-3" />
            <p className="text-muted text-sm sm:text-base">A personal AI companion created for women on their journey to Allah.</p>
          </div>

          {/* 2-col on mobile, 4-col on lg — dividers only inside lg grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
            {SUPPORTS.map((item, i) => {
              const Icon = item.icon
              const isLastInRow = (i + 1) % 4 === 0 || i === SUPPORTS.length - 1
              return (
                <div
                  key={item.title}
                  className="text-center sm:px-4 lg:px-6"
                  style={
                    !isLastInRow
                      ? { borderRight: '1px solid var(--amina-hairline)' }
                      : undefined
                  }
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{
                      backgroundColor:
                        item.tone === 'olive' ? 'var(--amina-soft-olive)' : 'var(--amina-primary-action)',
                    }}
                  >
                    <Icon size={22} strokeWidth={1.5} className="text-cream" />
                  </div>
                  <h3 className="font-display text-[17px] text-primary mb-2">{item.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Access Gate ── */}
      <section
        id="access"
        className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 pb-12 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center"
      >
        <div className="relative aspect-[5/4] rounded-2xl lg:rounded-3xl overflow-hidden shadow-card-lg">
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
            <Lock size={13} strokeWidth={1.75} />
            Member Access
          </p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-primary mb-4">Access Amina</h2>
          <p className="text-muted mb-7 max-w-md text-[15px] leading-relaxed">
            Amina is available exclusively to The Circle members. Enter your access code to begin.
          </p>
          <form action="/circle/join" className="space-y-3 max-w-sm">
            <div className="relative">
              <input
                type="text"
                name="code"
                placeholder="Enter Access Code"
                className="input-field pr-12"
                aria-label="Access code"
              />
              <Lock size={16} strokeWidth={1.5} className="text-muted absolute right-4 top-1/2 -translate-y-1/2" />
            </div>
            <button type="submit" className="btn-primary w-full justify-center">
              Join The Circle <ArrowRight size={17} strokeWidth={1.75} />
            </button>
          </form>
        </div>
      </section>

      {/* ── Disclaimer ── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 pb-12">
        <div
          className="relative overflow-hidden rounded-2xl p-6 sm:p-7 flex gap-4 sm:gap-5 items-start"
          style={{ backgroundColor: 'var(--amina-rose-selected)' }}
        >
          <Image
            src="/marketing/botanical-accent.png"
            alt=""
            aria-hidden="true"
            width={220}
            height={220}
            className="pointer-events-none select-none absolute -right-4 -bottom-6 w-36 sm:w-44 opacity-20"
          />
          <span className="w-10 h-10 rounded-full bg-rose-action flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={18} strokeWidth={1.5} className="text-cream" />
          </span>
          <p className="relative text-sm text-secondary leading-relaxed max-w-4xl">
            Amina is an AI companion designed to support your spiritual journey. For detailed religious rulings (fatwas),
            please consult qualified scholars. For emotional support needs, please seek professional support. Amina is not
            a replacement for human connection, scholarly guidance, or professional care.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-ivory" style={{ borderTop: '1px solid var(--amina-border)' }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 py-12 grid gap-10 sm:grid-cols-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span
                className="font-display italic text-2xl leading-none"
                style={{
                  backgroundImage: 'linear-gradient(95deg, var(--amina-soft-olive) 0%, var(--amina-dusty-rose) 55%, var(--amina-muted-gold) 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Amina
              </span>
              <span className="font-display italic text-[10px]" style={{ color: 'var(--amina-muted-text)' }}>
                by RedLantern Studios™
              </span>
            </div>
            <p className="font-display text-primary mt-4 text-[15px]">Faith. Purpose. Sisterhood.</p>
            <p className="text-sm text-muted mt-1">Building a legacy of light.</p>
          </div>

          <div>
            <p className="label-eyebrow text-muted mb-4">Quick Links</p>
            <ul className="space-y-2.5 text-sm text-secondary">
              {[['About', '#about'], ['Amina', '#about'], ['The Circle', '#access'], ['Partnerships', '#']].map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="hover:text-rose-action transition-colors">{label}</a>
                </li>
              ))}
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
                  <Icon size={17} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
