/**
 * Gera os PDFs do currículo a partir das páginas já compiladas em dist/
 * (/curriculo/ e /en/resume/), usando a folha de estilo de impressão.
 * Assim a versão web e o PDF saem sempre dos mesmos dados.
 *
 * Executado automaticamente por `npm run build`. Requer Chrome, Edge ou Chromium
 * instalado (ou a variável CHROME_PATH). No CI, a falha interrompe o build;
 * localmente, apenas avisa.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { chromium } from 'playwright-core';
import { findBrowser } from './browser.mjs';
import { serve } from './static-server.mjs';

const DIST = resolve('dist');
const PAGES = ['curriculo/index.html', 'en/resume/index.html'];
const strict = process.env.CI === 'true' || process.env.CV_PDF_STRICT === 'true';

function fail(msg) {
  if (strict) {
    console.error(`✗ ${msg}`);
    process.exit(1);
  }
  console.warn(`⚠ ${msg}\n  O link "Baixar PDF" ficará indisponível nesta build local.`);
  process.exit(0);
}

// Descobre o base path e o caminho do PDF a partir do HTML gerado.
const jobs = [];
for (const rel of PAGES) {
  const html = await readFile(join(DIST, rel), 'utf8').catch(() => null);
  if (!html) fail(`Página ${rel} não encontrada em dist/. Rode "astro build" antes.`);
  const pdf = html.match(/data-cv-pdf="([^"]+)"/)?.[1];
  const href = html.match(new RegExp(`href="([^"]*${pdf?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})"`))?.[1];
  if (!pdf || !href) fail(`Não foi possível identificar o PDF em ${rel}.`);
  const base = href.slice(0, href.length - pdf.length) || '/';
  jobs.push({ page: `/${rel.replace(/index\.html$/, '')}`, pdf, base });
}

const executablePath = findBrowser();
if (!executablePath) fail('Nenhum navegador Chromium encontrado (defina CHROME_PATH).');

const base = jobs[0].base;
const server = await serve(DIST, base);
const origin = `http://127.0.0.1:${server.address().port}${base.replace(/\/$/, '')}`;
const browser = await chromium.launch({ executablePath });

try {
  const context = await browser.newContext({ colorScheme: 'light' });
  const page = await context.newPage();
  for (const job of jobs) {
    await page.goto(`${origin}${job.page}`, { waitUntil: 'networkidle' });
    await page.emulateMedia({ media: 'print', colorScheme: 'light' });
    await page.evaluate(async () => {
      document.documentElement.classList.remove('dark');
      await document.fonts.ready;
    });
    const buffer = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true });
    const out = join(DIST, job.pdf);
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, buffer);
    console.log(`✓ PDF gerado: dist${job.pdf} (${Math.round(buffer.length / 1024)} KB)`);
  }
} catch (err) {
  await browser.close();
  server.close();
  fail(`Erro ao gerar PDF: ${err.message}`);
}
await browser.close();
server.close();
