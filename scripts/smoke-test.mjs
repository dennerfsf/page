/**
 * Testes de fumaça no site compilado (dist/), usando um navegador real.
 * Valida os fluxos principais: tema, menu, filtros, busca, PDF e ausência de erros.
 * Uso: npm run build && npm run test:e2e
 */
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright-core';
import { findBrowser } from './browser.mjs';
import { serve } from './static-server.mjs';

const DIST = resolve('dist');
const home = await readFile(join(DIST, 'index.html'), 'utf8');
const base = new URL(home.match(/<link rel="canonical" href="([^"]+)"/)[1]).pathname.replace(/\/?$/, '/');

const executablePath = findBrowser();
if (!executablePath) {
  console.error('Nenhum navegador Chromium encontrado (defina CHROME_PATH).');
  process.exit(1);
}

const server = await serve(DIST, base);
const origin = `http://127.0.0.1:${server.address().port}${base.replace(/\/$/, '')}`;
const browser = await chromium.launch({ executablePath });
const results = [];
const pageErrors = [];

async function test(name, fn) {
  try {
    await fn();
    results.push([true, name]);
  } catch (err) {
    results.push([false, `${name}: ${err.message}`]);
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 }, colorScheme: 'dark' });
const page = await ctx.newPage();
page.on('pageerror', (e) => pageErrors.push(`${page.url()}: ${e.message}`));
page.on('response', (r) => r.status() >= 400 && pageErrors.push(`${r.status()} ${r.url()}`));

await test('páginas principais carregam com título e h1 únicos', async () => {
  const titles = new Set();
  for (const p of ['/', '/sobre/', '/curriculo/', '/projetos/', '/blog/', '/publicacoes/', '/competencias/', '/contato/', '/en/resume/']) {
    const res = await page.goto(origin + p);
    assert(res.status() === 200, `${p} retornou ${res.status()}`);
    const h1 = await page.locator('h1').count();
    assert(h1 === 1, `${p} tem ${h1} <h1>`);
    titles.add(await page.title());
  }
  assert(titles.size === 9, 'títulos de página repetidos');
});

await test('tema claro/escuro alterna e persiste após recarregar', async () => {
  await page.goto(origin + '/');
  const before = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  await page.click('[data-theme-toggle]');
  const after = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  assert(before !== after, 'classe não mudou');
  await page.reload();
  const persisted = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  assert(persisted === after, 'preferência não persistiu');
  await page.click('[data-theme-toggle]'); // restaura
});

await test('busca do blog filtra por título e por conteúdo (Pagefind)', async () => {
  await page.goto(origin + '/blog/');
  await page.fill('#q', 'governança');
  await page.waitForTimeout(300);
  const byTitle = await page.locator('[data-list] [data-post]:visible').count();
  assert(byTitle >= 1, 'nenhum resultado por título');
  // "Pydantic" só aparece no corpo de um artigo
  await page.fill('#q', 'Pydantic');
  await page.waitForFunction(() => document.querySelectorAll('[data-list] [data-post]:not([hidden])').length === 1, null, { timeout: 5000 });
});

await test('filtro por categoria e tag do blog', async () => {
  await page.goto(origin + '/blog/');
  await page.selectOption('#categoria', 'data-mesh');
  let n = await page.locator('[data-list] [data-post]:visible').count();
  assert(n === 1, `categoria: esperado 1, obtido ${n}`);
  await page.selectOption('#categoria', '');
  await page.click('[data-tag="governanca"]');
  n = await page.locator('[data-list] [data-post]:visible').count();
  assert(n >= 2, `tag: esperado ≥ 2, obtido ${n}`);
  assert(page.url().includes('tag=governanca'), 'estado do filtro não refletido na URL');
});

await test('ordenação cronológica do blog', async () => {
  await page.goto(origin + '/blog/?ordem=asc');
  const dates = await page.$$eval('[data-list] [data-post]', (els) => els.map((e) => e.dataset.date));
  assert(dates.join() === [...dates].sort().join(), 'ordem crescente incorreta');
});

await test('busca global retorna resultados', async () => {
  await page.goto(origin + '/busca/?q=data%20mesh');
  await page.waitForSelector('[data-search-results] li', { timeout: 5000 });
});

await test('filtro de projetos por categoria', async () => {
  await page.goto(origin + '/projetos/');
  await page.click('[data-cat="iot-e-sistemas-embarcados"]');
  const n = await page.locator('[data-project]:visible').count();
  assert(n === 1, `esperado 1, obtido ${n}`);
});

await test('projeto confidencial não exibe links de repositório', async () => {
  await page.goto(origin + '/projetos/integracao-sistemas-corporativos/');
  const repo = await page.locator('main a:has-text("Repositório")').count();
  assert(repo === 0, 'link de repositório exibido em projeto privado');
});

await test('linha do tempo filtra por tipo', async () => {
  await page.goto(origin + '/sobre/');
  await page.click('[data-filter="education"]');
  const work = await page.locator('[data-kind="work"]:visible').count();
  assert(work === 0, 'itens profissionais ainda visíveis');
});

await test('currículo oferece PDF existente (pt e en)', async () => {
  for (const p of ['/curriculo/', '/en/resume/']) {
    await page.goto(origin + p);
    const href = await page.getAttribute('a[download][href$=".pdf"]', 'href');
    const res = await page.request.get(new URL(href, origin).toString());
    assert(res.status() === 200 && res.headers()['content-type'] === 'application/pdf', `PDF indisponível em ${p}`);
  }
});

await test('artigo tem progresso de leitura, JSON-LD e diagrama Mermaid', async () => {
  await page.goto(origin + '/blog/introducao-data-mesh/');
  assert(await page.locator('[data-reading-progress]').count(), 'sem barra de progresso');
  const ld = await page.$eval('script[type="application/ld+json"]', (s) => JSON.parse(s.textContent));
  assert(ld['@graph'].some((n) => n['@type'] === 'BlogPosting'), 'sem BlogPosting');
  await page.locator('.mermaid-diagram').scrollIntoViewIfNeeded();
  await page.waitForSelector('.mermaid-diagram svg', { timeout: 10000 });
});

await test('menu mobile abre, fecha com Esc e devolve o foco', async () => {
  const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await m.goto(origin + '/');
  await m.click('[data-menu-toggle]');
  assert(await m.isVisible('#mobile-menu'), 'menu não abriu');
  await m.keyboard.press('Escape');
  assert(!(await m.isVisible('#mobile-menu')), 'menu não fechou');
  assert(await m.evaluate(() => document.activeElement?.hasAttribute('data-menu-toggle')), 'foco não voltou ao botão');
  await m.close();
});

await test('RSS, sitemap e robots.txt válidos', async () => {
  for (const [p, needle] of [['/rss.xml', '<rss'], ['/sitemap-index.xml', '<sitemapindex'], ['/robots.txt', 'Sitemap:']]) {
    const res = await page.request.get(origin + p);
    assert(res.status() === 200 && (await res.text()).includes(needle), `${p} inválido`);
  }
});

await test('sem erros de JavaScript nem recursos 4xx', async () => {
  assert(pageErrors.length === 0, pageErrors.join(' | '));
});

await browser.close();
server.close();

for (const [ok, name] of results) console.log(`${ok ? '✓' : '✗'} ${name}`);
const failed = results.filter(([ok]) => !ok).length;
console.log(`\n${results.length - failed}/${results.length} testes passaram`);
process.exit(failed ? 1 : 0);
