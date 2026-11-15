import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE, profile } from '../data/site';
import { getPosts } from '../lib/content';
import { postPath } from '../lib/routes';
import { SECOES } from '../lib/taxonomy';
import { absoluteUrl } from '../lib/url';

/** Feed de Notícias e ideias: notícias e publicações (os estudos ficam fora do feed). */
export async function GET(context: APIContext) {
  const posts = (await getPosts()).filter((p) => p.data.secao === 'noticias' || p.data.secao === 'publicacoes');
  return rss({
    title: `${SITE.title} — Notícias e ideias`,
    description: 'Notícias e publicações sobre desenvolvimento de software, dados, computação e ciência.',
    site: absoluteUrl('/', context.site),
    trailingSlash: true,
    customData: `<language>pt-br</language>${profile.email ? `<managingEditor>${profile.email} (${profile.name})</managingEditor>` : ''}`,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: absoluteUrl(postPath(post), context.site),
      categories: [SECOES[post.data.secao], post.data.category, ...post.data.tags],
      author: profile.name,
    })),
  });
}
