import { defineConfig } from 'astro/config';
import sentry from '@sentry/astro';

// Node 20.6+ nativo — carga .env local para desarrollo/build manual.
// En Cloudflare Pages (deploy automático) y en el fallback de wrangler en Hetzner,
// SENTRY_DSN debe estar seteada como variable de entorno del proyecto/build.
try {
  process.loadEnvFile();
} catch {
  // sin .env local — se espera que la variable ya esté en el entorno (CI/Cloudflare)
}

export default defineConfig({
  outDir: './dist',
  publicDir: './public',
  build: {
    format: 'directory',
  },
  vite: {
    build: {
      sourcemap: true,
    },
  },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    // Init real de Sentry vive en sentry.client.config.ts (patrón recomendado por @sentry/astro
    // para evitar el warning de deprecación de pasar `dsn` acá). Sitio 100% estático (sin
    // adapter SSR), así que solo aplica sentry.client.config.ts, no hace falta el de server.
    sentry({
      org: '3gi',
      project: '3gi-web',
    }),
  ],
});
