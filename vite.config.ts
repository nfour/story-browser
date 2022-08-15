import { resolve } from 'path'
import { defineConfig } from 'vite'
import reactPlugin from '@vitejs/plugin-react'
import pkgJson from './package.json'

export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: resolve('./src/index.ts'),
      formats: ['cjs', 'es'],
      name: 'storyBrowser',
      fileName: (fmt) => `story-browser.${fmt}.js`,
    },
    rollupOptions: {
      external: [...Object.keys(pkgJson.dependencies)],
    },

    outDir: resolve('./x'),
    emptyOutDir: true,
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
  optimizeDeps: {
    force: true,
  },
  plugins: [
    reactPlugin({
      jsxImportSource: '@emotion/react',
      include: ['src/**/*.tsx', 'src/**/*.ts'],
      jsxRuntime: 'automatic',
    }),
  ],
  root: resolve('./src'),
  server: {
    host: '0.0.0.0',
    port: 9005,
    fs: { strict: true, allow: ['../../../'] },
  },
})
