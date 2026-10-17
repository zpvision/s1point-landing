import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { root, pages, renderPage } from './site.mjs';

const built = process.argv.includes('--dist');
const publicRoot = path.join(root, built ? 'dist' : 'public');
const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.pdf': 'application/pdf',
  '.csv': 'text/csv; charset=utf-8', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
};
const server = createServer(async (req, res) => {
  try {
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { Allow: 'GET, HEAD' }).end(); return;
    }
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const route = pathname.replace(/\/+$/, '') || '/';
    let body, extension;
    if (!built && pages[route]) {
      body = renderPage(await readFile(path.join(root, 'pages', pages[route]), 'utf8'));
      extension = '.html';
    } else {
      let filename = path.resolve(publicRoot, '.' + pathname);
      const relative = path.relative(publicRoot, filename);
      if (relative.startsWith('..') || path.isAbsolute(relative)) {
        res.writeHead(403).end(); return;
      }
      if ((await stat(filename)).isDirectory()) filename = path.join(filename, 'index.html');
      body = await readFile(filename);
      extension = path.extname(filename);
    }
    res.writeHead(200, { 'Content-Type': mime[extension] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch (error) {
    res.writeHead(['ENOENT', 'ENOTDIR'].includes(error.code) ? 404 : 400).end('Not found');
  }
});
server.listen(Number(process.env.PORT || 5173), '127.0.0.1', () => {
  console.log(`Point landing: http://localhost:${server.address().port}/ (${built ? 'dist' : 'source'})`);
});
