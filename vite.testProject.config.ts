import { resolve } from 'path'
import { defineConfig } from 'vite'
import config from './vite.config'

export default defineConfig({
  ...config,
  root: resolve('./testProject'),
  build: {
    outDir: resolve('./testProject/x'),
    emptyOutDir: true,
  },
})
