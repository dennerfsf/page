/**
 * Verifica links e recursos internos no site compilado (dist/):
 *  - todo href/src interno deve começar com o base path;
 *  - o arquivo de destino precisa existir em dist/;
 *  - as rotas da navegação existem (incluindo o ano 2026 e as 4 áreas de Estudos);
 *  - cada URL antiga de src/data/redirects.mjs redireciona para um destino existente;
 *  - nenhuma página aponta para uma URL antiga.
 * Uso: npm run build && npm run test:links
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { REDIRECTS } from '../src/data/redirects.mjs';

const DIST = resolve('dist');

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(p)));
    else if (entry.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const files = await walk(DIST);
// Descobre o base path pelo link canônico da home.
const home = await readFile(join(DIST, 'index.html'), 'utf8');
const canonical = home.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
const base = canonical ? new URL(canonical).pathname.replace(/\/?$/, '/') : '/';

const errors = [];
let checked = 0;
const cache = new Map();

async function exists(path) {
  if (cache.has(path)) return cache.get(path);
  let target = join(DIST, path);
  let s = await stat(target).catch(() => null);
  if (s?.isDirectory()) s = await stat(join(target, 'index.html')).catch(() => null);
  const ok = Boolean(s);
  cache.set(path, ok);
  return ok;
}

for (const file of files) {
  const html = await readFile(file, 'utf8');
  const rel = relative(DIST, file);
  for (const [, attr, raw] of html.matchAll(/\s(href|src|srcset|content)="([^"]+)"/g)) {
    const urls = attr === 'srcset' ? raw.split(',').map((s) => s.trim().split(/\s+/)[0]) : [raw];
    for (let url of urls) {
      if (attr === 'content' && !url.startsWith('/')) continue;
      if (!url.startsWith('/') || url.startsWith('//')) continue; // externos, âncoras, mailto
      url = url.split('#')[0].split('?')[0];
      if (!url) continue;
      checked++;
      if (base !== '/' && !url.startsWith(base)) {
        errors.push(`${rel}: "${url}" não inclui o base path ${base}`);
        continue;
      }
      const path = decodeURIComponent(url.slice(base.length - 1));
      if (!(await exists(path))) errors.push(`${rel}: "${url}" não existe em dist/`);
    }
  }
}

/* ---------- Rotas da navegação ---------- */
const REQUIRED_ROUTES = [
  '/noticias-e-ideias/',
  '/noticias-e-ideias/noticias/',
  '/noticias-e-ideias/noticias/2026/',
  '/noticias-e-ideias/publicacoes/',
  '/estudos/',
  ...['engenharias', 'fisica', 'computacao', 'economia'].map((a) => `/estudos/${a}/`),
  '/artigos/',
  '/categorias/',
  '/tags/',
  '/sobre/',
  '/curriculo/',
  '/projetos/',
  '/competencias/',
  '/contato/',
  '/busca/',
];
for (const route of REQUIRED_ROUTES) {
  if (!(await exists(route))) errors.push(`rota obrigatória ausente: ${route}`);
}

/* ---------- Redirecionamentos (URLs antigas) ---------- */
const norm = (p) => p.replace(/\/?$/, '/');
const prefix = base.replace(/\/$/, '');
const oldUrls = new Set(Object.keys(REDIRECTS).map(norm));
for (const [from, to] of Object.entries(REDIRECTS)) {
  const file = join(DIST, from, 'index.html');
  const html = await readFile(file, 'utf8').catch(() => null);
  if (!html) {
    errors.push(`redirecionamento ausente: ${from}`);
    continue;
  }
  const target = html.match(/http-equiv="refresh" content="0;url=([^"]+)"/)?.[1];
  if (target !== `${prefix}${to}`) errors.push(`redirecionamento ${from} aponta para "${target}", esperado "${prefix}${to}"`);
  if (!(await exists(to))) errors.push(`redirecionamento ${from} → ${to}: destino não existe`);
}

/* ---------- Nenhuma página deve linkar para URLs antigas ---------- */
for (const file of files) {
  const html = await readFile(file, 'utf8');
  if (html.includes('http-equiv="refresh"')) continue; // as próprias páginas de redirecionamento
  for (const [, url] of html.matchAll(/\shref="([^"#?]+)/g)) {
    if (!url.startsWith(base)) continue;
    const path = norm(url.slice(prefix.length) || '/');
    if (oldUrls.has(path)) errors.push(`${relative(DIST, file)}: link para URL antiga "${url}"`);
  }
}

if (errors.length) {
  console.error(`✗ ${errors.length} problema(s) em ${checked} links verificados:`);
  for (const e of [...new Set(errors)]) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`✓ ${checked} links/recursos internos verificados em ${files.length} páginas (base: ${base})`);
console.log(`✓ ${REQUIRED_ROUTES.length} rotas da navegação e ${Object.keys(REDIRECTS).length} redirecionamentos verificados`);
