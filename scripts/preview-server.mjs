import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import https from 'node:https';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const mimeTypes = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.gif': 'image/gif', '.woff': 'font/woff', '.woff2': 'font/woff2' };

export function createPreviewHandler({ root, basePath = '', oauthClientId = '', converterUrl = '' }) {
  root = path.resolve(root);
  basePath = basePath.replace(/\/+$/, '');
  if (oauthClientId && !/^[A-Za-z0-9_-]{1,128}$/.test(oauthClientId)) throw new Error('Invalid development OAuth client ID');
  if (converterUrl) {
    const destination = new URL(converterUrl);
    if (!['http:', 'https:'].includes(destination.protocol)
      || !['localhost', '127.0.0.1', '[::1]'].includes(destination.hostname)
      || destination.username || destination.password || destination.search || destination.hash) {
      throw new Error('Invalid development converter URL: expected a loopback address without credentials, query, or fragment');
    }
    converterUrl = destination.href;
  }
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
      let content = await readFile(filename);
      if (converterUrl && filename === path.join(root, 'viewers/assets/js/classic-storymaps-config.js')) {
        content = content.toString('utf8') + '\nObject.assign(window.ClassicStoryMapsConfig.gallery.converter,'
          + JSON.stringify({ enabled: true, url: converterUrl, allowLocalHttp: true }) + ');\n';
      }
      if (oauthClientId && filename === path.join(root, 'viewers/index.html')) {
        const callbackPath = JSON.stringify(basePath + '/viewers/').replace(/</g, '\\u003c');
        const configuration = '<script>window.__CLASSIC_STORYMAPS_CLIENT_ID__=' + JSON.stringify(oauthClientId)
          + ';window.__CLASSIC_STORYMAPS_REDIRECT_URI__=window.location.origin+' + callbackPath + ';</script>';
        const html = content.toString('utf8');
        if (!/<head(?:\s[^>]*)?>/i.test(html)) throw new Error('Viewers HTML head is missing');
        content = html.replace(/<head(?:\s[^>]*)?>/i, head => head + '\n' + configuration);
      }
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
    const server = https.createServer({ key: await readFile(key), cert: await readFile(cert) }, createPreviewHandler({
      root, basePath, oauthClientId: process.env.CLASSIC_DEV_CLIENT_ID || '', converterUrl: process.env.CLASSIC_DEV_CONVERTER_URL || ''
    }));
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
