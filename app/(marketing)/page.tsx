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
    <div className="min-h-dvh font-body" style={{ backgroundColor: '#07080D', color: '#F7F2EE' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between gap-6 px-8 lg:px-16 py-8 max-w-7xl mx-auto" style={{ borderBottom: '1px solid transparent' }}>
        <AminaWordmark size="lg" tone="gradient" className="!items-start !text-left" />
        <div className="hidden lg:flex items-center gap-7 text-sm" style={{ color: '#A89F97' }}>
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href} className="hover:text-rose-amina transition-colors whitespace-nowrap">
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth" className="text-sm font-medium transition-colors whitespace-nowrap" style={{ color: '#A89F97' }}>
            Sign in
          </Link>
          <Link href="/auth" className="text-sm px-5 py-2.5 whitespace-nowrap rounded-lg flex items-center gap-2 font-medium" style={{ backgroundColor: '#D92532', color: '#F7F2EE' }}>
            Join The Circle
            <HandHeart size={16} strokeWidth={1.75} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section id="about" className="max-w-7xl mx-auto px-6 lg:px-12 pt-10 pb-16 grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
        <div>
          <p className="label-eyebrow mb-5 flex items-center gap-2" style={{ color: '#D92532' }}>
            <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(217,37,50,0.15)' }}>
              <Lock size={13} strokeWidth={1.75} style={{ color: '#D92532' }} />
            </span>
            Meet Amina
          </p>
          <h1 className="font-display text-5xl md:text-6xl leading-[1.05] mb-6 text-balance" style={{ color: '#F7F2EE' }}>
            You&apos;re not meant to navigate this journey <span className="accent-italic" style={{ color: '#D92532' }}>alone.</span>
          </h1>
          <p className="text-lg mb-8 leading-relaxed max-w-md" style={{ color: '#A89F97' }}>
            Meet Amina, your faith-centered reflection companion for questions, encouragement, and support — whenever you
            need it.
          </p>
          <ul className="space-y-4 mb-10">
            {HERO_BULLETS.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.text} className="flex items-center gap-3" style={{ color: '#F7F2EE' }}>
                  <span className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ border: '1px solid #2A2B33', backgroundColor: 'rgba(255,255,255,0.04)' }}>
                    <Icon size={16} strokeWidth={1.5} style={{ color: '#D92532' }} />
                  </span>
                  {item.text}
                </li>
              )
            })}
          </ul>
          <div className="flex flex-wrap gap-4">
            <Link href="/auth" className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm" style={{ backgroundColor: '#D92532', color: '#F7F2EE' }}>
              Join The Circle <ArrowRight size={18} strokeWidth={1.75} />
            </Link>
            <a href="#how" className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm" style={{ border: '1px solid #2A2B33', color: '#F7F2EE', backgroundColor: 'transparent' }}>
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
            {/* Blend left edge into dark background */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #07080D 0%, transparent 30%), linear-gradient(180deg, transparent 55%, rgba(7,8,13,0.4) 100%)' }} />
          </div>
          {/* Floating quote card */}
          <div className="absolute -bottom-6 -left-2 sm:left-6 max-w-[16rem] rounded-3xl p-6 text-center shadow-card-lg" style={{ backgroundColor: '#0F1117', border: '1px solid #2A2B33' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'rgba(217,37,50,0.15)' }}>
              <Sparkles size={20} strokeWidth={1.5} style={{ color: '#D92532' }} />
            </div>
            <p className="font-display text-lg leading-snug mb-3" style={{ color: '#F7F2EE' }}>
              Private. Faith-centered. Built for Muslim women.
            </p>
            <div className="gold-divider mx-auto mb-3" />
            <Heart size={16} strokeWidth={1.5} style={{ color: '#D92532' }} className="mx-auto" />
          </div>
        </div>
      </section>

      {/* How it supports you */}
      <section id="how" className="max-w-7xl mx-auto px-6 lg:px-12 pt-16">
        <div className="rounded-[2rem] px-6 sm:px-12 py-14" style={{ backgroundColor: '#0F1117', border: '1px solid #2A2B33' }}>
          <div className="text-center mb-12 max-w-xl mx-auto">
            <h2 className="font-display text-4xl mb-4" style={{ color: '#F7F2EE' }}>How Amina Supports You</h2>
            <div className="gold-divider mx-auto mb-4" />
            <p style={{ color: '#A89F97' }}>A personal AI companion created for women on their journey to Allah.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6">
            {SUPPORTS.map((item, i) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="text-center px-2 lg:px-6"
                  style={i < SUPPORTS.length - 1 ? { borderRight: '1px solid #2A2B33' } : undefined}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: 'rgba(217,37,50,0.15)' }}
                  >
                    <Icon size={24} strokeWidth={1.5} style={{ color: '#D92532' }} />
                  </div>
                  <h3 className="font-display text-lg mb-2" style={{ color: '#F7F2EE' }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#A89F97' }}>{item.desc}</p>
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
          <p className="label-eyebrow mb-4 flex items-center gap-2" style={{ color: '#D92532' }}>
            <Lock size={14} strokeWidth={1.75} />
            Member Access
          </p>
          <h2 className="font-display text-4xl md:text-5xl mb-4" style={{ color: '#F7F2EE' }}>Access Amina</h2>
          <p className="mb-8 max-w-md" style={{ color: '#A89F97' }}>
            Amina is available exclusively to The Circle members. Enter your access code to begin.
          </p>
          <form action="/auth" className="space-y-4 max-w-md">
            <div className="relative">
              <input
                type="text"
                name="code"
                placeholder="Enter Access Code"
                aria-label="Access code"
                className="w-full rounded-lg px-4 py-3 text-sm outline-none pr-12"
                style={{ backgroundColor: '#0F1117', border: '1px solid #2A2B33', color: '#F7F2EE' }}
              />
              <Lock size={18} strokeWidth={1.5} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: '#A89F97' }} />
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-sm" style={{ backgroundColor: '#D92532', color: '#F7F2EE' }}>
              Join The Circle <ArrowRight size={18} strokeWidth={1.75} />
            </button>
          </form>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-16">
        <div className="relative overflow-hidden rounded-[2rem] p-7 flex gap-5 items-start" style={{ backgroundColor: '#0F1117', border: '1px solid #2A2B33' }}>
          <Image
            src="/marketing/botanical-accent.png"
            alt=""
            aria-hidden="true"
            width={220}
            height={220}
            className="pointer-events-none select-none absolute -right-4 -bottom-6 w-44 opacity-10"
          />
          <span className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#D92532' }}>
            <ShieldCheck size={20} strokeWidth={1.5} style={{ color: '#F7F2EE' }} />
          </span>
          <p className="relative text-sm leading-relaxed max-w-4xl" style={{ color: '#A89F97' }}>
            Amina is an AI companion designed to support your spiritual journey. For detailed religious rulings (fatwas),
            please consult qualified scholars. For emotional support needs, please seek professional support. Amina is not
            a replacement for human connection, scholarly guidance, or professional care.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#07080D', borderTop: '1px solid #2A2B33' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-14 grid gap-10 md:grid-cols-3">
          <div>
            <AminaWordmark size="md" tone="gradient" className="!items-start !text-left" />
            <p className="font-display mt-4" style={{ color: '#F7F2EE' }}>Faith. Purpose. Sisterhood.</p>
            <p className="text-sm mt-1" style={{ color: '#A89F97' }}>Building a legacy of light.</p>
          </div>
          <div>
            <p className="label-eyebrow mb-4" style={{ color: '#A89F97' }}>Quick Links</p>
            <ul className="space-y-2.5 text-sm" style={{ color: '#A89F97' }}>
              <li><a href="#about" className="hover:text-rose-action transition-colors">About</a></li>
              <li><a href="#about" className="hover:text-rose-action transition-colors">Amina</a></li>
              <li><a href="#access" className="hover:text-rose-action transition-colors">The Circle</a></li>
              <li><a href="#" className="hover:text-rose-action transition-colors">Partnerships</a></li>
            </ul>
          </div>
          <div>
            <p className="label-eyebrow mb-4" style={{ color: '#A89F97' }}>Connect</p>
            <div className="flex gap-3">
              {[Instagram, Youtube, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:text-rose-action"
                  style={{ border: '1px solid #2A2B33', color: '#A89F97', backgroundColor: '#0F1117' }}
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
