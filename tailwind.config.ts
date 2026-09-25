import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

// Tokens mirror the Acadium landing page (see DESIGN_TOKENS.md).
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1.5rem', screens: { '2xl': '1160px' } },
    extend: {
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        violet: { DEFAULT: 'hsl(var(--violet))' },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        soft: 'hsl(var(--soft))',
        tint: { DEFAULT: 'hsl(var(--tint))', foreground: 'hsl(var(--tint-foreground))' },
        ink: { DEFAULT: 'hsl(var(--foreground))', soft: 'hsl(var(--ink-soft))', mute: 'hsl(var(--ink-mute))' },
        ok: { DEFAULT: 'hsl(var(--ok))', soft: 'hsl(var(--ok-soft))' },
        warn: { DEFAULT: 'hsl(var(--warn))', soft: 'hsl(var(--warn-soft))' },
        bad: { DEFAULT: 'hsl(var(--bad))', soft: 'hsl(var(--bad-soft))' },
      },
      borderRadius: {
        xl: '20px',
        lg: '12px',
        md: '10px',
        sm: '8px',
      },
      boxShadow: {
        lift: '0 1px 2px rgba(15, 23, 42, .04), 0 12px 32px -12px rgba(15, 23, 42, .12)',
        card: '0 30px 60px -30px rgba(30, 41, 99, .35)',
        btn: '0 6px 18px -8px rgba(99, 102, 241, .7)',
        'btn-hover': '0 10px 24px -8px rgba(99, 102, 241, .75)',
      },
      backgroundImage: {
        brand: 'linear-gradient(120deg, #4a9eed, #8b5cf6)',
        hero: 'radial-gradient(60% 60% at 85% 20%, rgba(139, 92, 246, .10), transparent 70%), radial-gradient(50% 50% at 60% 80%, rgba(74, 158, 237, .10), transparent 70%)',
      },
      keyframes: {
        'fade-up': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'none' } },
      },
      animation: { 'fade-up': 'fade-up .35s ease both' },
    },
  },
  plugins: [animate],
} satisfies Config
