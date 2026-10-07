import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createReadStream } from 'node:fs';
import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import https from 'node:https';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const publish = path.resolve(process.env.PUBLISH_CHECK_ROOT || 'publish');
const basePath = process.env.SITE_BASE_PATH || '/classic-storymaps-viewer-pages';
const temporary = await mkdtemp(path.join(os.tmpdir(), 'classic-release-browser-'));
const modulePath = process.env.PLAYWRIGHT_NODE_MODULES;
const { chromium } = modulePath
  ? await import(pathToFileURL(path.join(modulePath, 'playwright/index.mjs')).href)
  : await import('playwright');
execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', path.join(temporary, 'key.pem'), '-out', path.join(temporary, 'cert.pem'), '-days', '1', '-subj', '/CN=localhost'], { stdio: 'ignore' });
const mimeTypes = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.gif': 'image/gif', '.woff': 'font/woff', '.woff2': 'font/woff2' };
const server = https.createServer({ key: await readFile(path.join(temporary, 'key.pem')), cert: await readFile(path.join(temporary, 'cert.pem')) }, async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'https://localhost').pathname);
    if (!pathname.startsWith(basePath + '/')) throw new Error('Outside base path');
    let filename = path.resolve(publish, '.' + pathname.slice(basePath.length));
    if (!filename.startsWith(publish + path.sep)) throw new Error('Outside publish root');
    if ((await stat(filename)).isDirectory()) filename = path.join(filename, 'index.html');
    await stat(filename);
    response.setHeader('Content-Type', mimeTypes[path.extname(filename)] || 'application/octet-stream');
    createReadStream(filename).pipe(response);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = 'https://127.0.0.1:' + server.address().port;
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const width of [1280, 390]) {
    for (const suffix of ['', '&edit=true', '&fromScratch=true']) {
      const context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width, height: 850 } });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push('page: ' + error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push('console: ' + message.text()); });
      page.on('requestfailed', request => errors.push('request: ' + request.url() + ' ' + request.failure()?.errorText));
      page.on('response', response => { if (response.status() >= 400) errors.push('http: ' + response.status() + ' ' + response.url()); });
      const result = { runtime: 'crowdsource', width, suffix, errors };
      results.push(result);
      try {
        await page.goto(origin + basePath + '/viewers/crowdsource/index.html?appid=f1fcc302b0864b0c94beffc5177da2b8' + suffix, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForFunction(() => document.querySelectorAll('.gallery-item').length > 0, undefined, { timeout: 60000 });
        result.galleryItems = await page.locator('.gallery-item').count();
        result.builder = await page.evaluate(() => window.app.mode.isBuilder);
        assert.equal(result.builder, false);
        assert.equal(await page.locator('button.participate').count(), 0);
        assert.doesNotMatch(await page.locator('body').innerText(), /Participate/);
        assert.doesNotMatch(new URL(page.url()).search, /edit=|fromScratch=/);
        if (width === 1280) {
          await page.getByText('Explore Map', { exact: true }).click({ timeout: 30000 });
          await page.waitForFunction(() => {
            const bounds = document.querySelector('.map-pane')?.getBoundingClientRect();
            return bounds && bounds.top >= 0 && bounds.top < 100 && bounds.bottom > 200;
          });
          result.mapVisible = true;
        } else {
          await page.getByText('Gallery', { exact: true }).click();
          await page.waitForFunction(() => {
            const bounds = document.querySelector('.gallery-item')?.getBoundingClientRect();
            return bounds && bounds.top >= 0 && bounds.top < innerHeight && bounds.width > 0;
          });
          result.galleryVisible = true;
        }
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: path.join(temporary, 'crowdsource-' + width + '-' + (suffix || 'plain').replace(/[^a-z0-9]/gi, '') + '.png') });
        assert.deepEqual(errors, []);
        result.pass = true;
      } catch (error) {
        result.pass = false;
        result.failure = error.message;
        result.visibleText = (await page.locator('body').innerText()).slice(0, 1500);
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
  await rm(path.join(temporary, 'key.pem'));
  await rm(path.join(temporary, 'cert.pem'));
}
await writeFile(path.join(temporary, 'results.json'), JSON.stringify(results, null, 2) + '\n');
console.log(JSON.stringify({ artifacts: temporary, results }, null, 2));
if (results.some(result => !result.pass)) process.exitCode = 1;
