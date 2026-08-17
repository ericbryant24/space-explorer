import { defineConfig } from 'vite'

// Relative base so the build works from any GitHub Pages sub-path
// (https://user.github.io/space-explorer/) as well as from the root.
export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
    assetsInlineLimit: 8192,
  },
})
