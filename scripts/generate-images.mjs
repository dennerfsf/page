/**
 * Gera public/og-default.png (1200×630) e public/apple-touch-icon.png (180×180)
 * a partir de HTML, usando o nome e o título de src/data/profile.json.
 *
 * Uso: npm run images   (rode novamente após mudar nome/título)
 */
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright-core';
import { findBrowser } from './browser.mjs';

const profile = JSON.parse(await readFile(new URL('../src/data/profile.json', import.meta.url), 'utf8'));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const og = `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;box-sizing:border-box}
  body{width:1200px;height:630px;font-family:'Segoe UI',Inter,Helvetica,Arial,sans-serif;color:#F8FAFC;
    background:
      radial-gradient(700px 400px at 10% 0%, rgba(37,99,235,.35), transparent 60%),
      radial-gradient(600px 380px at 100% 100%, rgba(6,182,212,.25), transparent 60%),
      linear-gradient(rgba(148,163,184,.07) 1px, transparent 1px) 0 0/44px 44px,
      linear-gradient(90deg, rgba(148,163,184,.07) 1px, transparent 1px) 0 0/44px 44px,
      #0B1120;
    display:flex;flex-direction:column;justify-content:center;padding:80px 90px}
  .logo{width:88px;height:88px;border-radius:22px;background:linear-gradient(135deg,#2563EB,#06B6D4);
    display:grid;place-items:center;font-weight:700;font-size:38px;margin-bottom:44px}
  h1{font-size:76px;font-weight:700;letter-spacing:-2px;line-height:1.05}
  p{margin-top:22px;font-size:34px;font-weight:600;max-width:950px;line-height:1.25;
    background:linear-gradient(100deg,#60A5FA,#22D3EE 70%);-webkit-background-clip:text;color:transparent}
  .bar{position:absolute;left:0;bottom:0;height:10px;width:100%;background:linear-gradient(90deg,#2563EB,#06B6D4)}
</style></head><body>
  <div class="logo">${esc(profile.initials)}</div>
  <h1>${esc(profile.name)}</h1>
  <p>${esc(profile.headline.pt ?? profile.headline)}</p>
  <div class="bar"></div>
</body></html>`;

const icon = `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0}body{width:180px;height:180px;display:grid;place-items:center;
  background:linear-gradient(135deg,#2563EB,#06B6D4);font-family:'Segoe UI',Helvetica,Arial,sans-serif;
  color:#fff;font-weight:700;font-size:76px}
</style></head><body>${esc(profile.initials)}</body></html>`;

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
await page.screenshot({ path: 'public/apple-touch-icon.png' });

await browser.close();
console.log('✓ public/og-default.png e public/apple-touch-icon.png gerados');
