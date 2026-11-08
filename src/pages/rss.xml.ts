import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE, profile } from '../data/site';
import { getPosts } from '../lib/content';
import { absoluteUrl } from '../lib/url';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: `${SITE.title} — Blog`,
    description: 'Notícias e artigos sobre dados, inteligência artificial, governança e arquitetura de software.',
    site: absoluteUrl('/', context.site),
    trailingSlash: true,
    customData: `<language>pt-br</language>${profile.email ? `<managingEditor>${profile.email} (${profile.name})</managingEditor>` : ''}`,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: absoluteUrl(`/blog/${post.id}/`, context.site),
      categories: [post.data.category, ...post.data.tags],
      author: profile.name,
    })),
  });
}
