import type { APIContext } from 'astro';
import { absoluteUrl } from '../lib/url';

/** Gerado no build para que o endereço do sitemap respeite o domínio e o base path. */
export function GET(context: APIContext) {
  const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${absoluteUrl('/sitemap-index.xml', context.site)}`, ''].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
