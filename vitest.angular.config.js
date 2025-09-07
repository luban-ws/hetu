import { defineConfig } from 'vite';
import { angular } from '@analogjs/vite-plugin-angular';
import { resolve } from 'path';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/renderer/**/*.spec.ts'],
    setupFiles: ['src/test-setup.ts']
  },
  resolve: {
    alias: {
      '@common': resolve(__dirname, 'src/common')
    }
  }
});