import { SITE, profile } from '../data/site';
import { withBase } from '../lib/url';

export function GET() {
  const manifest = {
    name: `${profile.name} — ${profile.headline.pt}`,
    short_name: profile.name,
    description: SITE.description,
    lang: 'pt-BR',
    start_url: withBase('/'),
    scope: withBase('/'),
    display: 'browser',
    background_color: '#0B1120',
    theme_color: '#0B1120',
    icons: [
      { src: withBase('/favicon.svg'), sizes: 'any', type: 'image/svg+xml' },
      { src: withBase('/apple-touch-icon.png'), sizes: '180x180', type: 'image/png' },
    ],
  };
  return new Response(JSON.stringify(manifest, null, 2), { headers: { 'Content-Type': 'application/manifest+json' } });
}
