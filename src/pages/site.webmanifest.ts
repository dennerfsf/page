import { SITE } from '../data/site';
import { withBase } from '../lib/url';

export function GET() {
  const manifest = {
    name: `${SITE.title} — ${SITE.tagline}`,
    short_name: SITE.title,
    description: SITE.description,
    lang: 'pt-BR',
    start_url: withBase('/'),
    scope: withBase('/'),
    display: 'browser',
    background_color: '#1B1B1F',
    theme_color: '#1B1B1F',
    icons: [
      { src: withBase('/favicon.svg?v=2'), sizes: 'any', type: 'image/svg+xml' },
      { src: withBase('/apple-touch-icon.png?v=2'), sizes: '180x180', type: 'image/png' },
    ],
  };
  return new Response(JSON.stringify(manifest, null, 2), { headers: { 'Content-Type': 'application/manifest+json' } });
}
