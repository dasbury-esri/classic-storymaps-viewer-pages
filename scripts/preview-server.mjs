import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import https from 'node:https';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const mimeTypes = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.gif': 'image/gif', '.woff': 'font/woff', '.woff2': 'font/woff2' };

export function createPreviewHandler({ root, basePath = '' }) {
  root = path.resolve(root);
  basePath = basePath.replace(/\/+$/, '');
  return async (request, response) => {
    try {
      const url = new URL(request.url, 'https://localhost');
      const pathname = decodeURIComponent(url.pathname);
      if (pathname !== basePath && !pathname.startsWith(basePath + '/')) {
        response.writeHead(404).end();
        return;
      }
      let filename = path.resolve(root, '.' + pathname.slice(basePath.length));
      if (filename !== root && !filename.startsWith(root + path.sep)) {
        response.writeHead(403).end();
        return;
      }
      if ((await stat(filename)).isDirectory()) {
        if (!url.pathname.endsWith('/')) {
          response.writeHead(308, { Location: url.pathname + '/' + url.search, 'Cache-Control': 'no-store' }).end();
          return;
        }
        filename = path.join(filename, 'index.html');
      }
      const content = await readFile(filename);
      response.writeHead(200, { 'Content-Type': mimeTypes[path.extname(filename)] || 'application/octet-stream', 'Cache-Control': 'no-store' }).end(content);
    } catch {
      response.writeHead(404).end();
    }
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const root = path.resolve(process.env.PUBLISH_CHECK_ROOT || fileURLToPath(new URL('../publish', import.meta.url)));
  const basePath = (process.env.SITE_BASE_PATH ?? '/classic-storymaps-viewer-pages').replace(/\/+$/, '');
  const port = Number(process.env.PORT || '61326');
  if (!(await stat(root)).isDirectory()) throw new Error('Preview root must be a directory');
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'classic-preview-https-'));
  try {
    const key = path.join(temporary, 'key.pem');
    const cert = path.join(temporary, 'cert.pem');
    execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', key, '-out', cert, '-days', '1', '-subj', '/CN=localhost', '-addext', 'subjectAltName=DNS:localhost,IP:127.0.0.1'], { stdio: 'ignore' });
    const server = https.createServer({ key: await readFile(key), cert: await readFile(cert) }, createPreviewHandler({ root, basePath }));
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(port, '127.0.0.1', resolve);
    });
    for (const signal of ['SIGINT', 'SIGTERM']) {
      process.once(signal, () => server.close(async () => {
        await rm(temporary, { recursive: true, force: true });
        process.exit(0);
      }));
    }
    console.log('HTTPS preview: https://127.0.0.1:' + server.address().port + basePath + '/');
    console.log('Temporary self-signed localhost certificate; no system trust changes.');
  } catch (error) {
    await rm(temporary, { recursive: true, force: true });
    throw error;
  }
}
