/**
 * Localiza um navegador Chromium instalado (Chrome/Edge/Chromium) para o playwright-core.
 * Ordem: variável CHROME_PATH → caminhos conhecidos por sistema operacional.
 * No GitHub Actions (ubuntu-latest) o Google Chrome já vem instalado.
 */
import { existsSync } from 'node:fs';

const candidates = {
  win32: [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  ],
  darwin: [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ],
  linux: ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge'],
};

export function findBrowser() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  return (candidates[process.platform] ?? []).find((p) => existsSync(p)) ?? null;
}
