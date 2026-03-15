import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'src/main/**/*.{test,spec}.{js,mjs,cjs,ts}',
      'src/preload/**/*.{test,spec}.{js,mjs,cjs,ts}',
      'src/common/**/*.{test,spec}.{js,mjs,cjs,ts}'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/out/**',
      'src/renderer/**' // Angular components use separate test config
    ]
  },
  resolve: {
    alias: {
      '@common': resolve(__dirname, 'src/common'),
      '@main': resolve(__dirname, 'src/main')
    }
  }
});