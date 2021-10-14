import { resolve } from 'path'
import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'

export default defineConfig({
  plugins: [reactRefresh({ include: '**/*.tsx' })],
  base: './',
  root: resolve('./testProject'),
  build: {
    outDir: resolve('./testProject/x'),
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0',
    port: 9001,
  },
})
