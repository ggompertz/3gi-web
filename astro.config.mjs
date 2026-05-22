import { defineConfig } from 'astro/config';

export default defineConfig({
  outDir: './dist',
  publicDir: './public',
  build: {
    format: 'directory',
  },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
});
