/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Expose to local network so phones can access via Wi-Fi IP
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-redis': ['@upstash/redis'],
          'vendor-ui': ['lucide-react', 'qrcode.react', 'clsx', 'tailwind-merge'],
          'vendor-audio': ['pitchfinder'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    // Component and unit tests
    include: ['src/**/*.test.tsx', 'src/lib/redis.test.ts'],
  },
});
