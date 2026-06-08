/** @type {import('tailwindcss').Config} */

// All raw values live in src/styles/tokens.css as RGB channel triplets / CSS vars.
// Tailwind only references those vars — keeps a single source of truth for design tokens.
const rgb = (name) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand — TechxServe red
        brand: {
          50: rgb('--brand-50'),
          100: rgb('--brand-100'),
          200: rgb('--brand-200'),
          300: rgb('--brand-300'),
          400: rgb('--brand-400'),
          500: rgb('--brand-500'),
          600: rgb('--brand-600'),
          700: rgb('--brand-700'),
          800: rgb('--brand-800'),
          900: rgb('--brand-900'),
          950: rgb('--brand-950'),
        },
        // Neutral / ink scale
        ink: {
          50: rgb('--ink-50'),
          100: rgb('--ink-100'),
          200: rgb('--ink-200'),
          300: rgb('--ink-300'),
          400: rgb('--ink-400'),
          500: rgb('--ink-500'),
          600: rgb('--ink-600'),
          700: rgb('--ink-700'),
          800: rgb('--ink-800'),
          900: rgb('--ink-900'),
          950: rgb('--ink-950'),
        },
        // Semantic
        success: { DEFAULT: rgb('--success-500'), soft: rgb('--success-100'), strong: rgb('--success-700') },
        warning: { DEFAULT: rgb('--warning-500'), soft: rgb('--warning-100'), strong: rgb('--warning-700') },
        danger: { DEFAULT: rgb('--danger-500'), soft: rgb('--danger-100'), strong: rgb('--danger-700') },
        info: { DEFAULT: rgb('--info-500'), soft: rgb('--info-100'), strong: rgb('--info-700') },
        // Semantic surface roles (theme-aware)
        app: rgb('--bg-app'),
        surface: {
          DEFAULT: rgb('--bg-surface'),
          raised: rgb('--bg-raised'),
          sunken: rgb('--bg-sunken'),
          overlay: rgb('--bg-overlay'),
        },
        line: { DEFAULT: rgb('--border-base'), strong: rgb('--border-strong') },
        content: {
          DEFAULT: rgb('--text-primary'),
          muted: rgb('--text-secondary'),
          subtle: rgb('--text-tertiary'),
          invert: rgb('--text-inverse'),
        },
      },
      fontFamily: {
        display: 'var(--font-display)',
        sans: 'var(--font-body)',
        mono: 'var(--font-mono)',
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius-md)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-md)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        glow: 'var(--shadow-glow)',
        'inner-line': 'inset 0 0 0 1px rgb(var(--border-base))',
      },
      spacing: {
        18: '4.5rem',
        sidebar: 'var(--sidebar-w)',
        'sidebar-collapsed': 'var(--sidebar-w-collapsed)',
        topbar: 'var(--topbar-h)',
      },
      transitionTimingFunction: {
        spring: 'var(--ease-spring)',
        out: 'var(--ease-out)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        shake: {
          '10%, 90%': { transform: 'translateX(-1px)' },
          '20%, 80%': { transform: 'translateX(2px)' },
          '30%, 50%, 70%': { transform: 'translateX(-4px)' },
          '40%, 60%': { transform: 'translateX(4px)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
        shake: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
      },
    },
  },
  plugins: [],
};
