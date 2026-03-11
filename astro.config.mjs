// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

const SITE_URL = 'https://madeirapropertyconcierge.com';

export default defineConfig({
  site: SITE_URL,
  output: 'server',
  adapter: vercel(),
  image: {
    remotePatterns: [],
  },
  security: {
    checkOrigin: false,
    allowedDomains: [
      { protocol: 'https', hostname: 'madeirapropertyconcierge.com' },
      { protocol: 'https', hostname: 'www.madeirapropertyconcierge.com' },
    ],
  },
  i18n: {
    locales: ['en', 'pt'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
