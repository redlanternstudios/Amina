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
        cream: '#F7F2EB',
        ivory: '#F2ECE4',
        rose: {
          DEFAULT: '#C9796A',
          light: '#E8A89C',
          dark: '#A85E50',
        },
        olive: {
          DEFAULT: '#8E9878',
          dark: '#6B7A5C',
        },
        charcoal: '#2C2926',
        gold: '#D7BA82',
      },
      fontFamily: {
        display: ['Canela', 'Georgia', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
export default config
