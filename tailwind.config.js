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
        // Decorative font for first letters
        display: ['Playfair Display', 'serif'],
        poppins: ['var(--font-poppins)', 'sans-serif'],
      },
      colors: {
        // ===== LIGHT MODE (White, Black, Gray Palette) =====
        memorial: {
          // Background Tones (Whites)
          bg: '#FFFFFF',              // Pure white
          surface: '#FAFAFA',         // Soft off-white
          surfaceAlt: '#F5F5F5',      // Light gray surface

          // Borders & Dividers (Grays)
          borderLight: '#E5E5E5',     // Very light border
          border: '#D4D4D4',          // Light gray border
          divider: '#A3A3A3',         // Medium gray divider

          // Text Hierarchy (Black to Gray)
          textTertiary: '#737373',    // Light gray text / captions
          textSecondary: '#525252',   // Medium gray text
          textMuted: '#404040',       // Dark gray text
          text: '#262626',            // Near black text
          textDark: '#171717',        // Dark text / emphasis
          textBlack: '#000000',       // Pure black

          // Accent (Gray-based)
          accent: '#404040',          // Dark gray accent
          accentLight: '#525252',     // Medium gray for hover
          accentDark: '#262626',      // Near black for active
          accentMuted: '#737373',     // Muted accent for subtle elements

          // Sidebar-specific colors
          sidebarBg: '#FFFFFF',
          sidebarHover: '#F5F5F5',
          sidebarActive: '#E5E5E5',
          sidebarActiveBorder: '#404040',
          sidebarText: '#525252',
          sidebarActiveText: '#000000',
        },

        // ===== DARK MODE (Navy-based, not pure black) =====
        memorialDark: {
          // Background Tones (Navy/Charcoal)
          bg: '#0A0F1C',              // Deep navy (not pure black)
          surface: '#141B2D',         // Navy surface
          surfaceAlt: '#1E2640',      // Lighter navy surface

          // Borders & Dividers (Dark Blues)
          border: '#2D3748',          // Dark blue-gray border
          divider: '#4A5568',         // Medium blue-gray divider

          // Text Hierarchy (White to Gray)
          textTertiary: '#A0AEC0',    // Blue-gray
          textSecondary: '#CBD5E0',   // Light blue-gray
          text: '#F5F5F5',            // Soft white text
          textBright: '#FFFFFF',      // Pure white

          // Accent (Light Gray-based)
          accent: '#E2E8F0',          // Light gray accent
          accentLight: '#EDF2F7',     // Lighter for hover
          accentDark: '#A0AEC0',      // Medium gray for active
          accentMuted: '#718096',     // Muted accent

          // Sidebar-specific colors
          sidebarBg: '#141B2D',
          sidebarHover: '#1E2640',
          sidebarActive: '#2D3748',
          sidebarActiveBorder: '#E2E8F0',
          sidebarText: '#CBD5E0',
          sidebarActiveText: '#FFFFFF',
        },

        // Legacy colors (updated for consistency)
        light: {
          background: '#FFFFFF',
          surface: '#FAFAFA',
          textPrimary: '#000000',
          textSecondary: '#525252',
          primaryButton: '#262626',
          buttonText: '#FFFFFF',
          accent: '#404040',
          border: '#E5E5E5',
        },
        dark: {
          background: '#0A0F1C',
          surface: '#141B2D',
          textPrimary: '#FFFFFF',
          textSecondary: '#A0AEC0',
          primaryButton: '#F5F5F5',
          buttonText: '#0A0F1C',
          accent: '#E2E8F0',
          border: '#2D3748',
        },
      },
      spacing: {
        // Memorial spacing system
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        // Sidebar width
        'sidebar': '240px',
        // Top nav height
        'nav': '64px',
        // Bottom nav height (mobile)
        'bottom-nav': '56px',
      },
      borderRadius: {
        'memorial': '8px',
        'memorial-lg': '12px',
        'memorial-xl': '16px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
      },
      lineHeight: {
        'tight': '1.2',
        'snug': '1.3',
        'normal': '1.5',
        'relaxed': '1.7',
        'loose': '1.8',
      },
      letterSpacing: {
        'heading': '0.02em',
        'tight': '-0.01em',
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '1.4' }],
        'sm': ['14px', { lineHeight: '1.5' }],
        'base': ['14px', { lineHeight: '1.7' }],
        'base-desktop': ['16px', { lineHeight: '1.7' }],
        'lg': ['18px', { lineHeight: '1.6' }],
        'xl': ['20px', { lineHeight: '1.5' }],
        '2xl': ['24px', { lineHeight: '1.3' }],
        '3xl': ['30px', { lineHeight: '1.2' }],
        '4xl': ['36px', { lineHeight: '1.2' }],
        '5xl': ['48px', { lineHeight: '1.1' }],
      },
      boxShadow: {
        'memorial-sm': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'memorial': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'memorial-md': '0 4px 12px rgba(0, 0, 0, 0.07)',
        'memorial-lg': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'memorial-xl': '0 8px 24px rgba(0, 0, 0, 0.10)',
        'accent-glow': '0 0 16px rgba(64, 64, 64, 0.3)',
        'accent-glow-lg': '0 0 24px rgba(64, 64, 64, 0.4)',
        // Top nav shadow
        'nav': '0 1px 3px rgba(0, 0, 0, 0.08)',
        // Card hover shadow
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
      },
      transitionTimingFunction: {
        'memorial': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'memorial-out': 'cubic-bezier(0, 0, 0.2, 1)',
      },
      minHeight: {
        'touch': '44px',
        'touch-lg': '48px',
      },
      minWidth: {
        'touch': '44px',
      },
      maxWidth: {
        'dashboard': '1200px',
        'content': '800px',
      },
      scale: {
        '98': '0.98',
        '102': '1.02',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'fade-up': 'fadeUp 0.5s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
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
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        skeleton: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
