import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { root, pages, renderPage, appOrigin } from '../scripts/site.mjs';

test('production origin and URL suffixes', () => {
  assert.equal(appOrigin, 'https://app.2point.ru');
  for (const suffix of ['/account', '/account/points/new?from=landing#step', '/market/']) {
    assert.equal(renderPage(`<a href="${suffix}">Go</a>`), `<a href="https://app.2point.ru${suffix}">Go</a>`);
  }
});

test('all seven built pages preserve markup, routes and contact email', async () => {
  let links = 0, emails = 0;
  assert.equal(Object.keys(pages).length, 7);
  for (const [route, file] of Object.entries(pages)) {
    const source = await readFile(path.join(root, 'pages', file), 'utf8');
    const built = await readFile(path.join(root, 'dist', route.slice(1), 'index.html'), 'utf8');
    assert.equal(built, renderPage(source));
    assert(!/https?:\/\/(?:app\.|www\.)?s1point\.ru/i.test(built));
    assert.equal((built.match(/office@s1point\.ru/g) || []).length, (source.match(/office@s1point\.ru/g) || []).length);
    for (const [, href] of built.matchAll(/href="([^"]+)"/g)) {
      if (/\/account|\/market|\/register/.test(href)) {
        assert(href.startsWith('https://app.2point.ru/'), href);
        links++;
      }
    }
    emails += (built.match(/office@s1point\.ru/g) || []).length;
  }
  assert(links > 0); assert(emails > 0);
  console.log(`Verified ${links} application links and ${emails} unchanged email occurrences across 7 pages`);
});
