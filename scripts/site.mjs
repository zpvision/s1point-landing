import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));
for (const filename of ['.env.local', '.env']) {
  const file = path.join(root, filename);
  if (existsSync(file)) process.loadEnvFile(file);
}
const app = new URL(process.env.APP_URL || 'http://localhost:5174');
if (!['http:', 'https:'].includes(app.protocol) || app.username || app.password || app.pathname !== '/' || app.search || app.hash) {
  throw new Error('APP_URL must be an HTTP(S) origin, e.g. https://app.s1point.ru');
}
export const appOrigin = app.origin;
export const pages = {
  '/': 'home.html',
  '/points': 'points.html',
  '/partners': 'partners.html',
  '/sellers': 'sellers.html',
  '/points/conditions': 'point-conditions.html',
  '/legal/point-privacy': 'point-privacy.html',
  '/legal/point-consent': 'point-consent.html',
};

export function renderPage(html) {
  // Preserve the existing markup and visible content. Consent is collected by
  // the application on its own origin, before authentication and registration.
  return html
    .replace(/<script src="\/point-consent\.js\?v=16" defer><\/script>/g, '')
    .replace(/href="(\/(?:account|register|market|registration-consent|signin-with-chatgpt|signout-with-chatgpt)(?:[/?#][^"]*)?)"/g,
      (_, href) => `href="${appOrigin}${href}"`);
}
