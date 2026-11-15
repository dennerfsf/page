/**
 * Testes de fumaça no site compilado (dist/), usando um navegador real.
 * Valida os fluxos principais: navegação (menu e submenus), seções, breadcrumbs,
 * redirecionamentos, tema, busca, PDF e ausência de erros.
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
    const note = await fn();
    results.push([true, note ? `${name} (${note})` : name]);
  } catch (err) {
    results.push([false, `${name}: ${err.message}`]);
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}
const path = (url) => new URL(url).pathname;

const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 }, colorScheme: 'dark' });
const page = await ctx.newPage();
page.on('pageerror', (e) => pageErrors.push(`${page.url()}: ${e.message}`));
page.on('response', (r) => r.status() >= 400 && pageErrors.push(`${r.status()} ${r.url()}`));

/** Uma página por seção, mais as páginas pessoais. */
const PAGES = [
  '/',
  '/noticias-e-ideias/',
  '/noticias-e-ideias/noticias/',
  '/noticias-e-ideias/noticias/2026/',
  '/noticias-e-ideias/publicacoes/',
  '/estudos/',
  '/estudos/fisica/',
  '/artigos/',
  '/categorias/',
  '/tags/',
  '/sobre/',
  '/curriculo/',
  '/projetos/',
  '/competencias/',
  '/contato/',
  '/en/resume/',
];

await test('páginas principais carregam com título e h1 únicos', async () => {
  const titles = new Set();
  for (const p of PAGES) {
    const res = await page.goto(origin + p);
    assert(res.status() === 200, `${p} retornou ${res.status()}`);
    const h1 = await page.locator('h1').count();
    assert(h1 === 1, `${p} tem ${h1} <h1>`);
    titles.add(await page.title());
  }
  assert(titles.size === PAGES.length, 'títulos de página repetidos');
});

await test('páginas internas têm breadcrumb e BreadcrumbList', async () => {
  for (const p of PAGES.filter((x) => x !== '/')) {
    await page.goto(origin + p);
    assert(await page.locator('[data-breadcrumbs] [aria-current="page"]').count() === 1, `${p} sem breadcrumb`);
    const graphs = await page.$$eval('script[type="application/ld+json"]', (els) => els.map((s) => JSON.parse(s.textContent)));
    const nodes = graphs.flatMap((g) => g['@graph'] ?? [g]);
    assert(nodes.some((n) => n['@type'] === 'BreadcrumbList'), `${p} sem BreadcrumbList`);
  }
});

await test('trilha do ano de Notícias: Início › Notícias e ideias › Notícias › 2026', async () => {
  await page.goto(origin + '/noticias-e-ideias/noticias/2026/');
  const crumbs = await page.$$eval('[data-breadcrumbs] li', (els) => els.map((e) => e.textContent.trim()));
  assert(crumbs.join(' › ') === 'Início › Notícias e ideias › Notícias › 2026', `trilha: ${crumbs.join(' › ')}`);
});

await test('Notícias agrupa por ano, com 2026 listado', async () => {
  await page.goto(origin + '/noticias-e-ideias/noticias/');
  const years = await page.$$eval('[data-news-year]', (els) => els.map((e) => Number(e.dataset.newsYear)));
  assert(years.includes(2026), 'grupo 2026 ausente');
  assert(years.join() === [...years].sort((a, b) => b - a).join(), `anos fora de ordem: ${years}`);
});

await test('área de Estudos vazia mostra "Em breve"', async () => {
  await page.goto(origin + '/estudos/fisica/');
  const text = await page.locator('[data-empty-state]').innerText();
  assert(text.includes('Em breve'), 'estado vazio ausente');
});

await test('URL antiga redireciona para a nova', async () => {
  for (const [from, to] of [['/blog/', '/noticias-e-ideias/'], ['/publicacoes/', '/artigos/']]) {
    await page.goto(origin + from);
    await page.waitForURL((u) => u.pathname === `${base}${to.slice(1)}`, { timeout: 5000 });
    assert(path(page.url()) === `${base}${to.slice(1)}`, `${from} foi para ${page.url()}`);
  }
});

await test('menu desktop: submenu abre por teclado, mostra 3 níveis e fecha com Esc', async () => {
  await page.goto(origin + '/');
  const btn = page.locator('[data-desktop-nav] [data-submenu-toggle]').first();
  await btn.focus();
  await page.keyboard.press('Enter');
  assert((await btn.getAttribute('aria-expanded')) === 'true', 'aria-expanded não mudou');
  const panel = page.locator(`#${await btn.getAttribute('aria-controls')}`);
  assert(await panel.isVisible(), 'submenu não abriu');
  for (const href of ['noticias-e-ideias/noticias/', 'noticias-e-ideias/noticias/2026/', 'noticias-e-ideias/publicacoes/']) {
    assert((await panel.locator(`a[href="${base}${href}"]`).count()) === 1, `link ${href} ausente no submenu`);
  }
  // O 2º nível (anos) fica dentro do 1º (Notícias): 2026 está em uma lista aninhada.
  assert((await panel.locator('[data-nav-depth="1"] a', { hasText: '2026' }).count()) === 1, '2026 não está aninhado em Notícias');
  await page.keyboard.press('Tab');
  assert(await page.evaluate(() => document.activeElement?.closest('[data-submenu-panel]') !== null), 'Tab não entra no submenu');
  await page.keyboard.press('Escape');
  assert(!(await panel.isVisible()), 'Esc não fechou o submenu');
  assert(await btn.evaluate((el) => el === document.activeElement), 'foco não voltou ao botão');
});

await test('menu desktop: só um submenu aberto e clique fora fecha', async () => {
  await page.goto(origin + '/');
  const btns = page.locator('[data-desktop-nav] [data-submenu-toggle]');
  await btns.nth(0).click();
  await btns.nth(1).click();
  assert((await btns.nth(0).getAttribute('aria-expanded')) === 'false', 'primeiro submenu continuou aberto');
  assert((await btns.nth(1).getAttribute('aria-expanded')) === 'true', 'segundo submenu não abriu');
  await page.mouse.click(10, 600);
  assert((await btns.nth(1).getAttribute('aria-expanded')) === 'false', 'clique fora não fechou');
});

await test('menu mobile: abre, expande submenu, Esc fecha submenu e depois o menu', async () => {
  const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await m.goto(origin + '/');
  await m.click('[data-menu-toggle]');
  assert(await m.isVisible('#mobile-menu'), 'menu não abriu');
  const sub = m.locator('#mobile-menu [data-submenu-toggle]').nth(1); // Estudos
  await sub.click();
  assert((await sub.getAttribute('aria-expanded')) === 'true', 'submenu não expandiu');
  assert(await m.locator(`#mobile-menu a[href="${base}estudos/fisica/"]`).isVisible(), 'área Física não aparece');
  await m.keyboard.press('Escape');
  assert((await sub.getAttribute('aria-expanded')) === 'false', 'Esc não recolheu o submenu');
  assert(await m.isVisible('#mobile-menu'), 'o menu fechou junto com o submenu');
  await m.keyboard.press('Escape');
  assert(!(await m.isVisible('#mobile-menu')), 'menu não fechou');
  assert(await m.evaluate(() => document.activeElement?.hasAttribute('data-menu-toggle')), 'foco não voltou ao botão');
  await m.close();
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

await test('busca global retorna resultados (Pagefind)', async () => {
  await page.goto(origin + '/busca/?q=engenharia');
  await page.waitForSelector('[data-search-results] li', { timeout: 5000 });
});

await test('texto publicado: progresso de leitura, trilha da seção e JSON-LD', async () => {
  // Usa o primeiro texto publicado de qualquer seção; sem conteúdo publicado, o teste é pulado.
  const lists = ['/noticias-e-ideias/publicacoes/', '/noticias-e-ideias/noticias/', '/estudos/'];
  let href = null;
  for (const l of lists) {
    await page.goto(origin + l);
    href = await page.locator('main [data-post] a').first().getAttribute('href').catch(() => null);
    if (href) break;
  }
  if (!href) return 'pulado: nenhum texto publicado';
  await page.goto(new URL(href, origin).toString());
  assert(await page.locator('[data-reading-progress]').count(), 'sem barra de progresso');
  const ld = await page.$eval('script[type="application/ld+json"]', (s) => JSON.parse(s.textContent));
  assert(ld['@graph'].some((n) => n['@type'] === 'BlogPosting'), 'sem BlogPosting');
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

await test('RSS, sitemap e robots.txt válidos; sitemap inclui as seções', async () => {
  for (const [p, needle] of [['/rss.xml', '<rss'], ['/sitemap-index.xml', '<sitemapindex'], ['/robots.txt', 'Sitemap:']]) {
    const res = await page.request.get(origin + p);
    assert(res.status() === 200 && (await res.text()).includes(needle), `${p} inválido`);
  }
  const sitemap = await (await page.request.get(origin + '/sitemap-0.xml')).text();
  for (const p of ['noticias-e-ideias/noticias/2026/', 'estudos/fisica/', 'artigos/']) {
    assert(sitemap.includes(`${base}${p}</loc>`), `sitemap sem ${p}`);
  }
  assert(!sitemap.includes(`${base}blog/`), 'sitemap inclui URL antiga /blog/');
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
