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
        // ===== LIGHT MODE (Floral White, Smoky Black, Olive Drab, Bone) =====
        memorial: {
          // Primary backgrounds
          bg: '#FFFBF4',           // Floral White - main background
          surface: '#FFFBF4',      // Floral White - card surfaces
          surfaceAlt: '#D8CFBC',   // Bone - alternate surfaces

          // Sidebar specific
          sidebarBg: '#11120D',           // Smoky Black
          sidebarHover: '#1A1B16',        // Slightly lighter Smoky Black
          sidebarActive: '#565449',       // Olive Drab
          sidebarActiveBorder: '#D8CFBC', // Bone accent
          sidebarText: '#D8CFBC',         // Bone text
          sidebarActiveText: '#FFFBF4',   // Floral White active text

          // Text hierarchy
          text: '#11120D',          // Smoky Black - primary text
          textSecondary: '#565449', // Olive Drab - secondary text
          textTertiary: '#7A7A6D',  // Muted olive - tertiary text
          textMuted: '#565449',     // Olive Drab - muted text
          textDark: '#11120D',      // Smoky Black - dark text
          textBlack: '#11120D',     // Smoky Black - pure black

          // Borders & dividers
          border: '#D8CFBC',        // Bone
          borderLight: '#E8E4D9',   // Lighter Bone
          divider: '#D8CFBC',       // Bone

          // Accents
          accent: '#565449',        // Olive Drab - primary accent
          accentLight: '#6B6B5E',   // Lighter Olive
          accentDark: '#3F3F36',    // Darker Olive
          accentMuted: '#7A7A6D',   // Muted Olive
        },

        // ===== DARK MODE (Smoky Black, Olive Drab, Bone, Floral White) =====
        memorialDark: {
          // Dark mode backgrounds
          bg: '#11120D',            // Smoky Black
          surface: '#1A1B16',       // Slightly lighter
          surfaceAlt: '#24251F',    // Even lighter

          // Sidebar (same as light mode for consistency)
          sidebarBg: '#11120D',
          sidebarHover: '#1A1B16',
          sidebarActive: '#565449',
          sidebarActiveBorder: '#D8CFBC',
          sidebarText: '#D8CFBC',
          sidebarActiveText: '#FFFBF4',

          // Text hierarchy (reversed)
          text: '#FFFBF4',          // Floral White - primary text
          textSecondary: '#D8CFBC', // Bone - secondary text
          textTertiary: '#A39F92',  // Muted bone - tertiary text
          textBright: '#FFFBF4',    // Floral White - bright text

          // Borders & dividers
          border: '#3F3F36',        // Dark Olive
          divider: '#2C2C24',       // Darker divider

          // Accents
          accent: '#D8CFBC',        // Bone - primary accent
          accentLight: '#E8E4D9',   // Lighter Bone
          accentDark: '#A39F92',    // Darker Bone
          accentMuted: '#7A7A6D',   // Muted accent
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
