/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        memorial: {
          bg: '#FFFBF4',
          surface: '#FFFBF4',
          surfaceAlt: '#D8CFBC',
          text: '#11120D',
          textSecondary: '#565449',
          textTertiary: '#7A7A6D',
          accent: '#565449',
          accentHover: '#6B6A5E',
          accentActive: '#45443A',
          border: '#D8CFBC',
          borderLight: '#E8E4D9',
          borderDark: '#C8BFB0',
          divider: '#D8CFBC',
        },
        memorialDark: {
          bg: '#11120D',
          surface: '#1A1B16',
          text: '#FFFBF4',
          textSecondary: '#C8BFB0',
          accent: '#D8CFBC',
          // Add other dark mode colors relative to light mode if needed for full parity
          surfaceAlt: '#24251F',
          textTertiary: '#A39F92',
          border: '#3F3F36',
          divider: '#2C2C24',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Inter', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'xs': ['var(--text-xs)', { lineHeight: '1.5' }],
        'sm': ['var(--text-sm)', { lineHeight: '1.5' }],
        'base': ['var(--text-base)', { lineHeight: '1.7' }],
        'lg': ['var(--text-lg)', { lineHeight: '1.7' }],
        'xl': ['var(--text-xl)', { lineHeight: '1.7' }],
        '2xl': ['var(--text-2xl)', { lineHeight: '1.4' }],
        '3xl': ['var(--text-3xl)', { lineHeight: '1.3' }],
        '4xl': ['var(--text-4xl)', { lineHeight: '1.2' }],
        '5xl': ['var(--text-5xl)', { lineHeight: '1.1' }],
        '6xl': ['var(--text-6xl)', { lineHeight: '1.1' }],
        '7xl': ['var(--text-7xl)', { lineHeight: '1' }],
        '8xl': ['var(--text-8xl)', { lineHeight: '1' }],
      },
      borderRadius: {
        'memorial': 'var(--radius-memorial)',
        'memorial-lg': 'var(--radius-memorial-lg)',
      },
      boxShadow: {
        'nav': 'var(--shadow-sm)',
        'card': 'var(--shadow-md)',
        'card-hover': 'var(--shadow-card-hover)',
        'memorial': 'var(--shadow-md)',
        'memorial-lg': 'var(--shadow-lg)',
      },
      transitionDuration: {
        'fast': '150ms',
        'base': '250ms',
        'slow': '350ms',
      },
      transitionTimingFunction: {
        'memorial': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      spacing: {
        // Memorial spacing system
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
        '10': 'var(--space-10)',
        '12': 'var(--space-12)',
        '16': 'var(--space-16)',
        '20': 'var(--space-20)',
        '24': 'var(--space-24)',
        'sidebar': '240px',
        'nav': '64px',
        'bottom-nav': '56px',
      },
      zIndex: {
        'base': '0',
        'dropdown': '10',
        'sticky': '20',
        'fixed': '30',
        'navbar': '50',
        'modal-backdrop': '100',
        'modal': '110',
        'popover': '120',
        'tooltip': '130',
      },
      minHeight: {
        'touch': '44px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
