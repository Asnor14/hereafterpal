/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Serif for headings - dignified and classic
        serif: ['Playfair Display', 'Crimson Text', 'Lora', 'serif'],
        // Sans-serif for body - modern readability
        sans: ['Inter', 'Source Sans Pro', 'system-ui', 'sans-serif'],
        poppins: ['var(--font-poppins)', 'sans-serif'],
      },
      colors: {
        // ===== LIGHT MODE =====
        memorial: {
          // Background Tones (Whites to Light Grays)
          bg: '#FFFFFF',              // Base white
          surface: '#FAFAFA',         // Soft off-white
          surfaceAlt: '#F5F5F5',      // Light gray surface

          // Borders & Dividers
          borderLight: '#E5E5E5',     // Very light border
          border: '#D4D4D4',          // Light gray border
          divider: '#A3A3A3',         // Medium gray divider

          // Text Hierarchy
          textTertiary: '#737373',    // Light text / captions
          textSecondary: '#525252',   // Secondary text
          textMuted: '#404040',       // Muted text
          text: '#262626',            // Primary text
          textDark: '#171717',        // Dark text / emphasis
          textBlack: '#0A0A0A',       // Near black

          // Accent
          gold: '#C9A961',            // Muted gold accent
          goldLight: '#D4B87A',       // Lighter gold for hover
          goldDark: '#B89951',        // Darker gold for active
        },

        // ===== DARK MODE =====
        memorialDark: {
          // Background Tones (Darkest to Medium)
          bg: '#0A0F1C',              // Deep navy
          surface: '#141B2D',         // Dark navy surface
          surfaceAlt: '#1F2937',      // Medium dark surface

          // Borders & Dividers
          border: '#2D3748',          // Dark border
          divider: '#4B5563',         // Medium divider

          // Text Hierarchy
          textTertiary: '#9CA3AF',    // Muted light
          textSecondary: '#D1D5DB',   // Secondary light
          text: '#F5F5F5',            // Primary light text
          textBright: '#FFFFFF',      // Pure white

          // Accent
          gold: '#D4AF76',            // Soft amber accent
          goldLight: '#E0C090',       // Lighter amber for hover
          goldDark: '#C99F66',        // Darker amber for active
        },

        // Legacy colors (keeping for backward compatibility)
        light: {
          background: '#FBFBFB',
          surface: '#FFFFFF',
          textPrimary: '#262626',
          textSecondary: '#575757',
          primaryButton: '#444444',
          buttonText: '#FFFFFF',
          accent: '#b45309',
          border: '#EBEBEB',
        },
        dark: {
          background: '#0f172a',
          surface: '#1e293b',
          textPrimary: '#f1f5f9',
          textSecondary: '#94a3b8',
          primaryButton: '#e2e8f0',
          buttonText: '#1e293b',
          accent: '#f59e0b',
          border: '#334155',
        },
      },
      spacing: {
        // Memorial spacing system
        '1': '4px',     // Icon padding, tiny gaps
        '2': '8px',     // Component padding, small gaps
        '3': '12px',    // Small padding
        '4': '16px',    // Card padding, section padding (mobile)
        '5': '20px',    // Medium padding
        '6': '24px',    // Section padding (tablet)
        '8': '32px',    // Section gaps (mobile)
        '10': '40px',   // Medium section gaps
        '12': '48px',   // Section gaps (tablet/desktop)
        '16': '64px',   // Major section dividers
        '20': '80px',   // Large section gaps
      },
      borderRadius: {
        'memorial': '8px',    // Default rounded corners
        'memorial-lg': '12px', // Larger rounded corners
        'memorial-xl': '16px', // Extra large corners
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
      },
      lineHeight: {
        'tight': '1.2',       // Headings
        'snug': '1.3',        // Subheadings
        'normal': '1.5',      // UI text
        'relaxed': '1.7',     // Body text
        'loose': '1.8',       // Long-form content
      },
      letterSpacing: {
        'heading': '0.02em',   // Headings - slightly increased
        'tight': '-0.01em',    // Dense text
      },
      fontSize: {
        // Mobile-first typography scale
        'xs': ['12px', { lineHeight: '1.4' }],
        'sm': ['14px', { lineHeight: '1.5' }],
        'base': ['14px', { lineHeight: '1.7' }],         // Mobile base
        'base-desktop': ['16px', { lineHeight: '1.7' }], // Desktop base
        'lg': ['18px', { lineHeight: '1.6' }],
        'xl': ['20px', { lineHeight: '1.5' }],
        '2xl': ['24px', { lineHeight: '1.3' }],
        '3xl': ['30px', { lineHeight: '1.2' }],
        '4xl': ['36px', { lineHeight: '1.2' }],
        '5xl': ['48px', { lineHeight: '1.1' }],
      },
      boxShadow: {
        // Memorial shadow system
        'memorial-sm': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'memorial': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'memorial-md': '0 4px 12px rgba(0, 0, 0, 0.07)',
        'memorial-lg': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'memorial-xl': '0 8px 24px rgba(0, 0, 0, 0.10)',
        // Gold glow for accents
        'gold-glow': '0 0 16px rgba(201, 169, 97, 0.3)',
        'gold-glow-lg': '0 0 24px rgba(201, 169, 97, 0.4)',
      },
      transitionDuration: {
        '150': '150ms',   // Quick interactions
        '200': '200ms',   // Button hovers
        '300': '300ms',   // Gentle transitions
        '400': '400ms',   // Page transitions
      },
      transitionTimingFunction: {
        'memorial': 'cubic-bezier(0.4, 0, 0.2, 1)', // Smooth ease
        'memorial-out': 'cubic-bezier(0, 0, 0.2, 1)', // Ease out
      },
      minHeight: {
        'touch': '44px',  // Minimum touch target (WCAG)
        'touch-lg': '48px', // Larger touch target
      },
      minWidth: {
        'touch': '44px',  // Minimum touch target (WCAG)
      },
      scale: {
        '98': '0.98',     // Subtle press effect
        '102': '1.02',    // Subtle hover lift
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'fade-up': 'fadeUp 0.5s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
