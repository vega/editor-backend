import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000
  },
  build: {
    lib: {
      entry: 'src/app.ts',
      formats: ['es'],
      fileName: 'app'
    },
    outDir: 'dist',
    rollupOptions: {
      external: [],
      output: {
        entryFileNames: 'app.js'
      }
    },
    target: 'esnext',
    minify: false
  }
});