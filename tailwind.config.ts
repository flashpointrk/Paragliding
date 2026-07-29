import type { Config } from 'tailwindcss';

/**
 * Design system.
 * Theme: "cyan + yellow", shared with the brand mark.
 *
 * The two brand colours, also used by `public/images/logo.svg`:
 *  - cyan   #00E1FC (accent)
 *  - yellow #FFBB00 (canopy)
 *
 * Colour families (the names are kept for backwards compatibility):
 *  - navy   : dark cyan-leaning neutral — surfaces and text
 *  - sky    : the logo cyan — accent
 *  - brand  : the logo yellow — primary action (CTA)
 *  - sunset : warm orange (a leftover from the old theme, used sparingly)
 *  - sand   : neutral warm grey (surfaces and backgrounds)
 *  - glass  : rgba glass effects (glassmorphism)
 *
 * Every visual token has a single source: THIS FILE.
 */
const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        // Dark neutral — a deep-sea tone, the cyan below desaturated and darkened.
        // (The name stayed `navy` for compatibility; the hue is no longer navy.)
        // 800-950 for dark surfaces, 400-900 for text. Contrast on white:
        // 400 → 4.8, 500 → 6.4, 900 → 14.9 (all AA).
        navy: {
          DEFAULT: '#0B3039',
          50: '#EDF7F9',
          100: '#D2E9EF',
          200: '#A2CEDB',
          // 300 doubles as the form placeholder colour; it is kept dark so the
          // legibility level inherited from the old theme (3.4) still holds.
          300: '#4E93A8',
          400: '#2E7C90',
          500: '#1B6579',
          600: '#14515F',
          700: '#0F3F4B',
          800: '#0B3039',
          900: '#082630',
          950: '#05191F',
        },
        // Brand cyan — the accent colour of the mark (#00E1FC).
        // The bright end, 200-400: legible on dark only (icons, accents, rules).
        // From 500 up it darkens for text and buttons — cyan is illegible in
        // light tones on white, so this break is deliberate.
        sky: {
          DEFAULT: '#00E1FC',
          50: '#E8FDFF',
          100: '#C6F8FF',
          200: '#8DF1FF',
          300: '#4CE7FF',
          400: '#00E1FC',
          500: '#00778C',
          600: '#00636F',
          700: '#05505C',
          800: '#0A404A',
          900: '#0C343C',
        },
        // Hero gradient overlay tones (chosen by the operator).
        // Used only in the colour layer of the home page hero.
        hero: {
          cyan: '#00CBFF',
          aqua: '#00F5FF',
        },
        // Blue (alternative accent) — kept
        blue: {
          DEFAULT: '#3B82F6',
        },
        // Warm sunset palette (premium accent)
        sunset: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
          950: '#431407',
        },
        // Brand yellow — the canopy tone of the mark (#FFBB00, hsl 44).
        // CTA = a brand-400 surface with navy-950 text (contrast 11.1, AAA).
        // Yellow is illegible on white: use brand-700 for TEXT on light surfaces
        // (contrast 5.3, AA) and brand-400 on dark ones.
        brand: {
          DEFAULT: '#FFBB00',
          50: '#FFF8E5',
          100: '#FFEEBF',
          200: '#FFDF85',
          300: '#FFCE47',
          400: '#FFBB00',
          500: '#E5A600',
          600: '#B8830A',
          700: '#8F6200',
          800: '#6B4900',
          900: '#4A3200',
        },
        // Sand/gold warm neutral palette (surfaces, dark text)
        sand: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
          950: '#0C0A09',
        },
        // Glass effects (rgba — glassmorphism)
        glass: {
          light: 'rgba(255, 255, 255, 0.08)',
          dark: 'rgba(8, 38, 48, 0.45)',
          border: 'rgba(255, 255, 255, 0.15)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        // Display font — for headings (Sora)
        display: [
          'var(--font-sora)',
          'var(--font-inter)',
          'system-ui',
          'sans-serif',
        ],
      },
      boxShadow: {
        // Kept
        card: '0 1px 3px 0 rgb(8 38 48 / 0.1), 0 1px 2px -1px rgb(8 38 48 / 0.1)',
        elevated: '0 10px 30px -10px rgb(8 38 48 / 0.25)',
        // "Open Sky" — soft, low-contrast editorial shadows
        soft: '0 1px 2px 0 rgb(8 38 48 / 0.04), 0 4px 16px -6px rgb(8 38 48 / 0.10)',
        'soft-lg': '0 2px 4px 0 rgb(8 38 48 / 0.05), 0 12px 32px -12px rgb(8 38 48 / 0.16)',
        // Glow effects
        'glow-sky': '0 0 40px -5px rgb(0 225 252 / 0.4)',
        'glow-sunset': '0 0 40px -5px rgb(255 187 0 / 0.4)',
        'glow-navy': '0 0 60px -10px rgb(8 38 48 / 0.5)',
        'inner-glass': 'inset 0 1px 0 0 rgb(255 255 255 / 0.1)',
        floating: '0 25px 50px -12px rgb(8 38 48 / 0.25)',
      },
      backgroundImage: {
        // Kept
        'navy-gradient':
          'linear-gradient(135deg, #05191F 0%, #0B3039 50%, #14515F 100%)',
        'sky-gradient': 'linear-gradient(135deg, #00E1FC 0%, #00778C 100%)',
        // Sunset gradient (premium CTA)
        'sunset-gradient':
          'linear-gradient(135deg, #F97316 0%, #FB923C 50%, #FED7AA 100%)',
        // Hero alt karartma (sinematik)
        'hero-gradient':
          'linear-gradient(180deg, transparent 0%, rgb(8 38 48 / 0.3) 40%, rgb(5 25 31 / 0.85) 100%)',
        // Sunset mesh (multi-layer radial)
        'mesh-gradient':
          'radial-gradient(at 20% 30%, rgb(255 187 0 / 0.15) 0px, transparent 50%), radial-gradient(at 80% 20%, rgb(0 225 252 / 0.12) 0px, transparent 50%), radial-gradient(at 50% 80%, rgb(8 38 48 / 0.1) 0px, transparent 50%)',
        // Animated aurora (drifts via background-size 200%)
        aurora:
          'linear-gradient(125deg, #00E1FC 0%, #FFBB00 25%, #FFCE47 50%, #4CE7FF 75%, #00E1FC 100%)',
      },
      backdropBlur: {
        xs: '4px',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        'ken-burns': {
          '0%': { transform: 'scale(1) translate(0, 0)' },
          '100%': { transform: 'scale(1.15) translate(-2%, -2%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.95)', opacity: '0.7' },
          '70%': { transform: 'scale(1.3)', opacity: '0' },
          '100%': { opacity: '0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'aurora-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'ken-burns': 'ken-burns 20s ease-out infinite alternate',
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float-slow 9s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        marquee: 'marquee 30s linear infinite',
        'fade-up': 'fade-up 0.6s ease-out',
        aurora: 'aurora-shift 8s ease infinite',
      },
    },
  },
  plugins: [],
};

export default config;
