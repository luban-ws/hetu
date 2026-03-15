import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

const siteUrl = process.env.SITE_URL || 'https://hetu.dev';
const basePath = new URL(siteUrl).pathname.replace(/\/$/, '') || undefined;

export default defineConfig({
  site: siteUrl,
  base: basePath,
  output: 'static',
  integrations: [sitemap(), mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
});
