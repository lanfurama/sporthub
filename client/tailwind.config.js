/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0b',
        surface: '#121214',
        'surface-lighter': '#1c1c1f',
        primary: {
          DEFAULT: '#ccff00', // Neon Green
          hover: '#b8e600',
          subtle: 'rgba(204, 255, 0, 0.1)',
        },
        secondary: {
          DEFAULT: '#00e5ff', // Electric Blue
          hover: '#00ccff',
        },
        accent: {
          DEFAULT: '#ff3d00', // Energetic Red
          hover: '#e63600',
        },
        gray: {
          50:  '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        border: 'rgba(255, 255, 255, 0.08)',
        'border-hover': 'rgba(204, 255, 0, 0.3)',
        status: {
          success: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: 'rgba(16, 185, 129, 0.2)' },
          warning: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.2)' },
          danger:  { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.2)' },
          info:    { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)' },
        },
      },
      borderRadius: {
        'xs': '2px',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        display: ['"Space Grotesk"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out forwards',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(204, 255, 0, 0.2), 0 0 10px rgba(204, 255, 0, 0.1)' },
          '100%': { boxShadow: '0 0 15px rgba(204, 255, 0, 0.4), 0 0 25px rgba(204, 255, 0, 0.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'sport': '0 8px 30px rgba(0, 0, 0, 0.12)',
        'sport-hover': '0 20px 40px rgba(0, 0, 0, 0.24)',
        'neon': '0 0 15px rgba(204, 255, 0, 0.4)',
      },
    },
  },
  plugins: [],
};
