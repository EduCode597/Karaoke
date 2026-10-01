/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        videoke: {
          bg: '#030712', // Deep obsidian
          panel: '#0f172a', // Glass surface
          card: '#1e293b', // Card surface
          cyan: '#06b6d4', // Neon Cyan
          magenta: '#d946ef', // Laser Magenta
          amber: '#fbbf24', // 7-segment LED Amber
          yellow: '#fde047', // Active Lyric Glow
        },
      },
      fontFamily: {
        mono: ['Courier New', 'Courier', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(6, 182, 212, 0.6), 0 0 30px rgba(6, 182, 212, 0.25)',
        'neon-magenta': '0 0 15px rgba(217, 70, 239, 0.6), 0 0 30px rgba(217, 70, 239, 0.25)',
        'neon-amber': '0 0 15px rgba(251, 191, 36, 0.7), 0 0 30px rgba(251, 191, 36, 0.3)',
        'neon-yellow': '0 0 15px rgba(253, 224, 71, 0.8), 0 0 30px rgba(253, 224, 71, 0.4)',
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 15px rgba(6, 182, 212, 0.8))' },
          '50%': { opacity: 0.8, filter: 'drop-shadow(0 0 5px rgba(6, 182, 212, 0.4))' },
        },
      },
    },
  },
  plugins: [],
};
