import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

declare const process: { env: Record<string, string | undefined> }

export default defineConfig({
  base: process.env['VITE_BASE_PATH'] ?? '/',
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
  },
})
