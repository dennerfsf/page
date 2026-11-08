/**
 * Verifica links e recursos internos no site compilado (dist/):
 *  - todo href/src interno deve começar com o base path;
 *  - o arquivo de destino precisa existir em dist/.
 * Uso: npm run build && npm run test:links
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

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

if (errors.length) {
  console.error(`✗ ${errors.length} problema(s) em ${checked} links verificados:`);
  for (const e of [...new Set(errors)]) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`✓ ${checked} links/recursos internos verificados em ${files.length} páginas (base: ${base})`);
