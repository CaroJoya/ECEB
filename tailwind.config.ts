import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        base: {
          950: '#050505',
          900: '#0a0a0a',
          850: '#111111',
          800: '#171717',
          750: '#1d1d1d',
          700: '#262626',
          600: '#404040',
          500: '#737373',
        },
        accent: {
          DEFAULT: '#1DB954',
          light: '#1ed760',
          dark: '#169c46',
        },
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
        purple: '#a855f7',
        pink: '#ec4899',
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        glow: '0 0 20px rgba(29, 185, 84, 0.35)',
        'glow-sm': '0 0 10px rgba(29, 185, 84, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;