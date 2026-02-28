// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
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
