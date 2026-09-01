import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

declare const process: { env: Record<string, string | undefined> }

export default defineConfig({
  base: process.env['VITE_BASE_PATH'] ?? '/',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          charts: ['recharts'],
          table: ['@tanstack/react-table'],
          state: ['zustand', 'zod', 'uuid'],
          supabase: ['@supabase/supabase-js'],
          motion: ['motion'],
        },
      },
    },
  },
  test: {
    environment: 'node',
    globals: true,
  },
})
