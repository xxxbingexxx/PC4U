import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: 'source',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'source/index.html'),
        about: resolve(__dirname, 'source/about/about.html'),
        help: resolve(__dirname, 'source/help/help.html'),
        builds: resolve(__dirname, 'source/builds/builds.html'),
        results: resolve(__dirname, 'source/results/results.html'),
        login: resolve(__dirname, 'source/login/login.html'),
      }
    }
  }
})
