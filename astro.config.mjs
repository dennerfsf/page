// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

/**
 * Endereço público e caminho base.
 *
 * - No GitHub Actions, os valores vêm de `actions/configure-pages`
 *   (funciona tanto para `usuario.github.io/repositorio/` quanto para domínio próprio).
 * - Localmente, os padrões abaixo refletem o remoto `github.com/dennerfsf/page`.
 *   Para simular um domínio próprio: SITE_URL=https://seudominio.com.br BASE_PATH= npm run build
 */
try {
  process.loadEnvFile(); // lê um .env opcional na raiz (Node ≥ 21.7)
} catch {
  /* sem .env: usa variáveis do ambiente ou os padrões */
}

const SITE_URL = process.env.SITE_URL || 'https://dennerfsf.github.io';
const BASE_PATH = process.env.BASE_PATH ?? '/page';

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH === '' ? '/' : BASE_PATH,
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  output: 'static',

  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/busca') && !page.includes('/404'),
      i18n: {
        defaultLocale: 'pt-BR',
        locales: { 'pt-BR': 'pt-BR', en: 'en' },
      },
    }),
  ],

  markdown: {
    syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid'] },
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
      defaultColor: false,
      wrap: false,
    },
  },

  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Inter',
      cssVariable: '--font-inter',
      weights: ['400', '500', '600', '700'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Space Grotesk',
      cssVariable: '--font-space-grotesk',
      weights: ['500', '600', '700'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains-mono',
      weights: ['400', '500'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'monospace'],
    },
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
