import { getCollection, type CollectionEntry } from 'astro:content';
import { slugify } from './taxonomy';

export type Post = CollectionEntry<'blog'>;
export type Project = CollectionEntry<'projects'>;
export type Publication = CollectionEntry<'publications'>;

/** Rascunhos (draft: true) aparecem no `npm run dev`, mas nunca no build de produção. */
const visible = <T extends { data: { draft: boolean } }>(entry: T) => import.meta.env.DEV || !entry.data.draft;

export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', visible);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getProjects(): Promise<Project[]> {
  const items = await getCollection('projects', visible);
  return items.sort(
    (a, b) => Number(b.data.featured) - Number(a.data.featured) || b.data.date.valueOf() - a.data.date.valueOf(),
  );
}

export async function getPublications(): Promise<Publication[]> {
  const items = await getCollection('publications', visible);
  return items.sort((a, b) => b.data.year - a.data.year || a.data.title.localeCompare(b.data.title));
}

/** Tempo de leitura estimado (≈ 200 palavras/min), ignorando blocos de código e marcação. */
export function readingTime(body: string | undefined): number {
  if (!body) return 1;
  const text = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`~\-|[\]()!]/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Artigos relacionados: pontua tags em comum (2) e mesma categoria (1). */
export function relatedPosts(post: Post, all: Post[], limit = 3): Post[] {
  const tags = new Set(post.data.tags.map((t) => t.toLowerCase()));
  return all
    .filter((p) => p.id !== post.id)
    .map((p) => ({
      p,
      score:
        p.data.tags.filter((t) => tags.has(t.toLowerCase())).length * 2 + (p.data.category === post.data.category ? 1 : 0),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.p.data.date.valueOf() - a.p.data.date.valueOf())
    .slice(0, limit)
    .map((x) => x.p);
}

/** Todas as tags com contagem, em ordem alfabética. */
export function tagIndex(posts: Post[]): { tag: string; slug: string; count: number }[] {
  const map = new Map<string, { tag: string; count: number }>();
  for (const p of posts) {
    for (const tag of p.data.tags) {
      const slug = slugify(tag);
      const cur = map.get(slug);
      map.set(slug, { tag: cur?.tag ?? tag, count: (cur?.count ?? 0) + 1 });
    }
  }
  return [...map.entries()]
    .map(([slug, v]) => ({ slug, ...v }))
    .sort((a, b) => a.tag.localeCompare(b.tag, 'pt-BR'));
}

/** Formata a lista de autores destacando o dono do site. */
export function formatAuthors(authors: string[]): string {
  if (authors.length <= 2) return authors.join(' e ');
  return `${authors.slice(0, -1).join(', ')} e ${authors.at(-1)}`;
}
