import { cp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { root, pages, renderPage } from './site.mjs';

const dist = path.join(root, 'dist');
// Only the fixed, project-local generated directory is replaced.
await rm(dist, { recursive: true, force: true });
await cp(path.join(root, 'public'), dist, { recursive: true });
for (const [route, filename] of Object.entries(pages)) {
  const directory = path.join(dist, route.slice(1));
  await mkdir(directory, { recursive: true });
  const html = await readFile(path.join(root, 'pages', filename), 'utf8');
  await writeFile(path.join(directory, 'index.html'), renderPage(html));
}
console.log('Built static landing in dist/');
