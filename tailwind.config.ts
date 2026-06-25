import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // All colors read from CSS vars so dark mode overrides work
        cream: 'var(--amina-soft-cream)',
        ivory: 'var(--amina-warm-ivory)',
        rose: {
          DEFAULT: '#D6AAA3',
          action: 'var(--amina-primary-action)',
          hover: 'var(--amina-primary-action-hover)',
          selected: 'var(--amina-rose-selected)',
        },
        olive: {
          DEFAULT: '#8E9878',
          dark: '#6B7A5C',
        },
        charcoal: 'var(--amina-soft-charcoal)',
        gold: 'var(--amina-muted-gold)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Newsreader', 'Georgia', 'serif'],
        body: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        'amina-voice': ['var(--font-amina-voice)', 'Lora', 'Georgia', 'serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: 'var(--amina-shadow-soft)',
        button: 'var(--amina-shadow-button)',
        nav: 'var(--amina-shadow-nav)',
      },
    },
  },
  plugins: [],
}
export default config
