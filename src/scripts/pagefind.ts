/**
 * Acesso ao índice de busca estático do Pagefind (gerado após `astro build`).
 * Em `npm run dev` o índice não existe: as funções retornam vazio sem quebrar a página.
 */

export interface SearchHit {
  url: string;
  title: string;
  excerpt: string;
  section?: string;
}

interface PagefindApi {
  options(opts: Record<string, unknown>): Promise<void>;
  init(): Promise<void>;
  search(term: string): Promise<{ results: { data(): Promise<{ url: string; excerpt: string; meta: Record<string, string> }> }[] }>;
}

let api: Promise<PagefindApi | null> | null = null;
const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;

export function loadPagefind(): Promise<PagefindApi | null> {
  if (!api) {
    const path = `${base}pagefind/pagefind.js`;
    api = import(/* @vite-ignore */ path)
      .then(async (pf: PagefindApi) => {
        await pf.options({ baseUrl: base, excerptLength: 24 });
        await pf.init();
        return pf;
      })
      .catch(() => null);
  }
  return api;
}

export async function search(term: string, limit = 20): Promise<SearchHit[] | null> {
  const pf = await loadPagefind();
  if (!pf) return null;
  const res = await pf.search(term);
  const data = await Promise.all(res.results.slice(0, limit).map((r) => r.data()));
  return data.map((d) => ({ url: d.url, title: d.meta.title ?? d.url, excerpt: d.excerpt, section: d.meta.section }));
}

/** URLs de páginas cujo conteúdo corresponde ao termo, opcionalmente restritas a um prefixo (ex.: "/noticias-e-ideias/publicacoes/"). */
export async function searchContent(term: string, prefix?: string): Promise<string[]> {
  const hits = await search(term, 50);
  if (!hits) return [];
  const p = prefix ? `${base.replace(/\/$/, '')}${prefix}` : '';
  return hits.map((h) => h.url).filter((u) => !p || u.startsWith(p));
}
