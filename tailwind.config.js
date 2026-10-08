/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        videoke: {
          bg: '#040711', // Deep Obsidian Cosmic
          surface: '#090e1c', // Machined console chassis
          panel: '#0d1527', // Glass panel surface
          card: '#121d33', // Elevated card surface
          cardHover: '#182542',
          border: '#1f2e4d',
          cyan: '#06b6d4', // Neon Cyan
          neonBlue: '#38bdf8', // Electric Sky Blue
          magenta: '#d946ef', // Laser Magenta
          fuchsia: '#ec4899', // Hot Pink
          amber: '#f59e0b', // 7-Segment Amber LED
          gold: '#fbbf24', // Radiant Amber Gold
          yellow: '#fde047', // Active Lyric Glow
          emerald: '#10b981', // Studio Live Green
          rose: '#f43f5e', // Siren / Gong Red
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        digital: ['Share Tech Mono', 'Courier New', 'monospace'],
        mono: ['Share Tech Mono', 'Courier New', 'monospace'],
        tech: ['Space Grotesk', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(6, 182, 212, 0.5), 0 0 40px rgba(6, 182, 212, 0.2)',
        'neon-magenta': '0 0 20px rgba(217, 70, 239, 0.5), 0 0 40px rgba(217, 70, 239, 0.2)',
        'neon-amber': '0 0 20px rgba(251, 191, 36, 0.6), 0 0 40px rgba(251, 191, 36, 0.25)',
        'neon-yellow': '0 0 20px rgba(253, 224, 71, 0.7), 0 0 40px rgba(253, 224, 71, 0.3)',
        'neon-emerald': '0 0 20px rgba(16, 185, 129, 0.5), 0 0 40px rgba(16, 185, 129, 0.2)',
        'neon-rose': '0 0 20px rgba(244, 63, 94, 0.5), 0 0 40px rgba(244, 63, 94, 0.2)',
        'glow-stage':
          '0 20px 60px -10px rgba(6, 182, 212, 0.25), 0 0 100px -20px rgba(217, 70, 239, 0.15)',
        'bezel-outer':
          '0 10px 30px -5px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.12)',
        'bezel-inner': 'inset 0 2px 4px rgba(0, 0, 0, 0.6), inset 0 0 12px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        'marquee-fast': 'marquee 18s linear infinite',
        'pulse-glow': 'pulse-glow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'equalizer-1': 'equalizer 1.2s ease-in-out infinite alternate',
        'equalizer-2': 'equalizer 0.8s ease-in-out infinite alternate 0.2s',
        'equalizer-3': 'equalizer 1.5s ease-in-out infinite alternate 0.4s',
        'equalizer-4': 'equalizer 0.9s ease-in-out infinite alternate 0.1s',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 15px rgba(6, 182, 212, 0.8))' },
          '50%': { opacity: 0.75, filter: 'drop-shadow(0 0 6px rgba(6, 182, 212, 0.3))' },
        },
        equalizer: {
          '0%': { height: '20%' },
          '100%': { height: '100%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};
