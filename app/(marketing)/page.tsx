'use client'

import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F7F2EB] font-sans">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex flex-col">
          <span className="font-display text-2xl text-[#2C2926]">Amina</span>
          <span className="text-xs text-[#8E9878]">by RedLantern Studios™</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm text-[#2C2926]">
          <a href="#about" className="hover:text-[#C9796A] transition-colors">About</a>
          <a href="#how" className="hover:text-[#C9796A] transition-colors">How It Works</a>
          <a href="#access" className="hover:text-[#C9796A] transition-colors">Access</a>
        </div>
        <Link href="/auth" className="btn-primary text-sm px-5 py-2">
          Get Started →
        </Link>
      </nav>

      {/* Hero */}
      <section id="about" className="max-w-6xl mx-auto px-6 pt-16 pb-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-xs font-semibold tracking-widest text-[#C9796A] uppercase mb-4">Meet Amina</p>
          <h1 className="font-display text-5xl md:text-6xl text-[#2C2926] leading-tight mb-6">
            You're not meant to navigate this journey{' '}
            <span className="text-[#C9796A]">alone.</span>
          </h1>
          <p className="text-[#2C2926]/70 text-lg mb-8 leading-relaxed">
            Meet Amina, your faith-centered reflection companion for questions, encouragement,
            and support — whenever you need it.
          </p>
          <ul className="space-y-3 mb-10">
            {[
              'Guidance for your heart and mind',
              'Rooted in Islam. Built with love.',
              'Private, safe, and sisters-only',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-[#2C2926]/80">
                <span className="w-5 h-5 rounded-full bg-[#F2ECE4] flex items-center justify-center text-[#C9796A] text-xs">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <div className="flex gap-4">
            <Link href="/auth" className="btn-primary">
              Access Amina →
            </Link>
            <a href="#how" className="btn-secondary">
              Learn More
            </a>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-square rounded-3xl bg-[#F2ECE4] flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-16 h-16 rounded-full bg-[#C9796A]/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✦</span>
              </div>
              <p className="font-display text-xl text-[#2C2926] mb-2">Amina is here to walk</p>
              <p className="text-[#2C2926]/70">beside you on your beautiful journey of faith, growth, and healing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it supports you */}
      <section id="how" className="bg-[#F2ECE4] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl text-[#2C2926] mb-4">How Amina Supports You</h2>
            <p className="text-[#2C2926]/60">A personal AI companion created for women on their journey to Allah.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '📖', title: 'New Muslim Guidance', desc: 'Helpful answers and gentle explanations for those learning Islam.' },
              { icon: '🌙', title: 'Daily Reflections', desc: 'Inspiration, reminders, and reflections to keep your heart grounded.' },
              { icon: '💬', title: 'Faith Q&A', desc: 'Ask your questions and get faith-centered responses with wisdom and care.' },
              { icon: '🤝', title: 'Sisterly Support', desc: 'A safe space to talk, reflect, and feel understood — anytime.' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-6 text-center shadow-sm">
                <div className="w-14 h-14 rounded-full bg-[#C9796A]/10 flex items-center justify-center mx-auto mb-4 text-2xl">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-[#2C2926] mb-2">{item.title}</h3>
                <p className="text-sm text-[#2C2926]/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Access Gate */}
      <section id="access" className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div className="bg-[#F2ECE4] rounded-3xl p-10 text-center">
          <p className="font-display text-3xl text-[#8E9878] mb-2">أمينة</p>
          <p className="text-[#2C2926]/60 italic">A faithful companion on your journey to Allah.</p>
          <div className="mt-6 text-3xl">✦</div>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-widest text-[#C9796A] uppercase mb-4">Member Access</p>
          <h2 className="font-display text-4xl text-[#2C2926] mb-4">Access Amina</h2>
          <p className="text-[#2C2926]/60 mb-8">
            Create your account and begin your journey with Amina — your private, faith-centered companion.
          </p>
          <Link href="/auth" className="btn-primary w-full text-center block mb-4">
            Access Amina →
          </Link>
          <p className="text-sm text-center text-[#2C2926]/50">
            Not a member yet?{' '}
            <a href="/auth" className="text-[#C9796A] hover:underline">Join The Circle</a>
          </p>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <div className="bg-[#F2ECE4] rounded-2xl p-6 flex gap-4 items-start">
          <span className="text-[#C9796A] mt-0.5">🛡️</span>
          <p className="text-sm text-[#2C2926]/60 leading-relaxed">
            Amina is an AI companion designed to support your spiritual journey. For detailed religious
            rulings (fatwas), please consult qualified scholars. For emotional support needs, please seek
            professional support. Amina is not a replacement for human connection, scholarly guidance,
            or professional care.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2C2926]/10 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <p className="font-display text-xl text-[#2C2926] mb-1">Amina</p>
            <p className="text-sm text-[#2C2926]/50">by RedLantern Studios™</p>
            <p className="text-sm text-[#8E9878] mt-2">Faith. Purpose. Sisterhood.</p>
          </div>
          <div className="flex gap-12 text-sm">
            <div>
              <p className="font-semibold text-[#2C2926] mb-3">Quick Links</p>
              <ul className="space-y-2 text-[#2C2926]/60">
                <li><a href="#about" className="hover:text-[#C9796A]">About</a></li>
                <li><Link href="/auth" className="hover:text-[#C9796A]">Access Amina</Link></li>
                <li><a href="/auth" className="hover:text-[#C9796A]">The Circle</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-[#2C2926] mb-3">Legal</p>
              <ul className="space-y-2 text-[#2C2926]/60">
                <li><Link href="/privacy" className="hover:text-[#C9796A]">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-[#C9796A]">Terms of Use</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
