/**
 * Utilitários de URL que respeitam o `base` do Astro.
 * Use SEMPRE `withBase()` para links internos e arquivos de /public,
 * assim o site funciona em `usuario.github.io/repositorio/` e em domínio próprio.
 */

const BASE = import.meta.env.BASE_URL.replace(/\/+$/, ''); // "" ou "/page"

/** Links externos, âncoras e esquemas como mailto: não recebem o prefixo. */
const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;

export function withBase(path = '/'): string {
  if (!path) return `${BASE}/`;
  if (EXTERNAL.test(path)) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (BASE && (clean === BASE || clean.startsWith(`${BASE}/`))) return clean;
  return `${BASE}${clean}`;
}

/** URL absoluta (com domínio) — usada em canonical, Open Graph, RSS e JSON-LD. */
export function absoluteUrl(path: string, site: URL | undefined): string {
  if (/^https?:\/\//i.test(path)) return path;
  const origin = site ?? new URL('http://localhost:4321');
  return new URL(withBase(path), origin).toString();
}

/** Remove o base e a barra final para comparar rotas (ex.: menu ativo). */
export function stripBase(pathname: string): string {
  let p = pathname;
  if (BASE && p.startsWith(BASE)) p = p.slice(BASE.length);
  p = p.replace(/\/+$/, '');
  return p === '' ? '/' : p;
}

export function isActivePath(current: string, target: string): boolean {
  const c = stripBase(current);
  const t = stripBase(withBase(target));
  return t === '/' ? c === '/' : c === t || c.startsWith(`${t}/`);
}
