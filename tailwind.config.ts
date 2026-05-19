import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Surfaces (light-first)
        background: '#FAFAF7', // cream
        surface: '#FFFFFF',
        'surface-muted': '#F1F5F9', // slate-100

        // Brand: emerald (energy + nature)
        primary: {
          DEFAULT: '#10B981', // emerald-500
          hover: '#059669', // emerald-600
          subtle: 'rgba(16, 185, 129, 0.1)',
          foreground: '#FFFFFF',
        },

        // Accent: sunset orange (action / peak)
        accent: {
          DEFAULT: '#F97316', // orange-500
          hover: '#EA580C', // orange-600
          subtle: 'rgba(249, 115, 22, 0.1)',
        },

        // Info: sky blue (fresh, water)
        info: {
          DEFAULT: '#0EA5E9', // sky-500
          hover: '#0284C7',
          subtle: 'rgba(14, 165, 233, 0.1)',
        },

        // Text
        ink: {
          DEFAULT: '#0F172A', // slate-900
          muted: '#475569', // slate-600 (7:1 on white)
          subtle: '#64748B', // slate-500 (4.6:1 on white)
          inverse: '#F8FAFC',
        },

        // Borders
        border: '#E2E8F0', // slate-200
        'border-strong': '#CBD5E1', // slate-300

        // Slate scale (still useful)
        slate: {
          50:  '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },

        status: {
          success: { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' },
          warning: { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' },
          danger:  { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA' },
          info:    { bg: '#F0F9FF', text: '#0369A1', border: '#BAE6FD' },
        },
      },
      borderRadius: {
        'xs': '2px',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '10px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '28px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Barlow Condensed"', 'Inter', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      animation: {
        'slide-up': 'slide-up 0.5s ease-out forwards',
        'fade-in': 'fade-in 0.4s ease-out forwards',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        'sport-sm': '0 1px 2px 0 rgba(15, 23, 42, 0.06)',
        'sport': '0 4px 16px -2px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.06)',
        'sport-lg': '0 12px 32px -8px rgba(15, 23, 42, 0.12), 0 4px 8px -4px rgba(15, 23, 42, 0.08)',
        'sport-xl': '0 24px 48px -12px rgba(15, 23, 42, 0.18)',
        'ring-primary': '0 0 0 4px rgba(16, 185, 129, 0.2)',
      },
      backgroundImage: {
        'court-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%2310B981' stroke-opacity='0.05' stroke-width='1'%3E%3Cpath d='M30 0v60M0 30h60'/%3E%3Ccircle cx='30' cy='30' r='12'/%3E%3C/g%3E%3C/svg%3E\")",
        'hero-fade': 'linear-gradient(180deg, rgba(255,255,255,0) 0%, #FAFAF7 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
