/**
 * Gera public/og-default.png (1200×630) e public/apple-touch-icon.png (180×180)
 * a partir de HTML, com o nome e a descrição do site (mantenha em sincronia com src/data/site.ts).
 *
 * Uso: npm run images   (rode novamente após mudar nome/descrição)
 */
import { chromium } from 'playwright-core';
import { findBrowser } from './browser.mjs';

const site = {
  name: 'Cero',
  description: 'Desenvolvimento de software, engenharia de dados e analytics, ciência da computação e estudos',
};
/** Símbolo do site (mesmo desenho de src/components/LogoMark.astro). */
const mark = (fill, size) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="217 100 815 835" width="${size}" height="${size}"><path fill="${fill}" fill-rule="evenodd" d="M525.0 280.4 L627.0 236.0 L729.0 280.4 L729.0 386.0 L876.4 248.6 L627.0 140.0 L356.0 258.0 L356.0 671.6 L257.0 825.9 L525.0 576.1 Z M729.0 424.2 L729.0 754.6 L627.0 799.0 L525.0 754.6 L525.0 614.4 L356.0 777.0 L627.0 895.0 L898.0 777.0 L898.0 334.7 L992.0 179.1 Z"/></svg>`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const og = `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;box-sizing:border-box}
  body{width:1200px;height:630px;font-family:'Segoe UI',Inter,Helvetica,Arial,sans-serif;color:#F5F5F7;
    background:
      radial-gradient(700px 400px at 10% 0%, rgba(37,99,235,.3), transparent 60%),
      radial-gradient(600px 380px at 100% 100%, rgba(59,130,246,.12), transparent 60%),
      linear-gradient(rgba(148,163,184,.07) 1px, transparent 1px) 0 0/44px 44px,
      linear-gradient(90deg, rgba(148,163,184,.07) 1px, transparent 1px) 0 0/44px 44px,
      #1B1B1F;
    display:flex;flex-direction:column;justify-content:center;padding:80px 90px}
  .logo{margin-bottom:40px;line-height:0}
  h1{font-size:76px;font-weight:700;letter-spacing:-2px;line-height:1.05}
  p{margin-top:22px;font-size:34px;font-weight:600;max-width:950px;line-height:1.25;
    background:linear-gradient(100deg,#60A5FA,#93C5FD 70%);-webkit-background-clip:text;color:transparent}
  .bar{position:absolute;left:0;bottom:0;height:10px;width:100%;background:#2563EB}
</style></head><body>
  <div class="logo">${mark('#F5F5F7', 104)}</div>
  <h1>${esc(site.name)}</h1>
  <p>${esc(site.description)}</p>
  <div class="bar"></div>
</body></html>`;

const icon = `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0}body{width:180px;height:180px;display:grid;place-items:center;
  background:transparent}
</style></head><body>${mark('#1B1B1F', 120)}</body></html>`;

const executablePath = findBrowser();
if (!executablePath) {
  console.error('Nenhum navegador Chromium encontrado. Defina CHROME_PATH.');
  process.exit(1);
}
const browser = await chromium.launch({ executablePath });
const page = await browser.newPage();

await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(og);
await page.screenshot({ path: 'public/og-default.png' });

await page.setViewportSize({ width: 180, height: 180 });
await page.setContent(icon);
await page.screenshot({ path: 'public/apple-touch-icon.png', omitBackground: true });

await browser.close();
console.log('✓ public/og-default.png e public/apple-touch-icon.png gerados');
