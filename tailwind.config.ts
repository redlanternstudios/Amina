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
        // Amina exact palette — SightEngine spec §4
        cream: '#F7F2E8',
        ivory: '#F2ECE4',
        rose: {
          DEFAULT: '#D6AAA3', // dusty rose (brand base)
          action: '#C78072', // primary action / button
          hover: '#B96E62',
        },
        olive: {
          DEFAULT: '#8E9878',
          dark: '#6B7A5C',
        },
        charcoal: '#2C2926',
        gold: '#D7BA82',
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
        soft: '0 12px 32px rgba(44, 41, 38, 0.07)',
        button: '0 8px 18px rgba(120, 74, 64, 0.14)',
        nav: '0 12px 30px rgba(44, 41, 38, 0.08)',
      },
    },
  },
  plugins: [],
}
export default config
