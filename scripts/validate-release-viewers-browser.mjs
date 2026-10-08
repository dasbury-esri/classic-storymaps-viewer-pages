import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import https from 'node:https';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createPreviewHandler } from './preview-server.mjs';

const publish = path.resolve(process.env.PUBLISH_CHECK_ROOT || 'publish');
const basePath = process.env.SITE_BASE_PATH || '/classic-storymaps-viewer-pages';
const temporary = await mkdtemp(path.join(os.tmpdir(), 'classic-release-browser-'));
const modulePath = process.env.PLAYWRIGHT_NODE_MODULES;
const { chromium } = modulePath
  ? await import(pathToFileURL(path.join(modulePath, 'playwright/index.mjs')).href)
  : await import('playwright');
execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', path.join(temporary, 'key.pem'), '-out', path.join(temporary, 'cert.pem'), '-days', '1', '-subj', '/CN=localhost'], { stdio: 'ignore' });
const server = https.createServer({ key: await readFile(path.join(temporary, 'key.pem')), cert: await readFile(path.join(temporary, 'cert.pem')) }, createPreviewHandler({ root: publish, basePath }));
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = 'https://127.0.0.1:' + server.address().port;
const browser = await chromium.launch({ headless: true });
const results = [];
const selectedRuntimes = new Set((process.env.RUNTIME_FILTER || 'crowdsource,shortlist,mapseries,cascade').split(','));
async function observePage(width) {
  const context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width, height: 850 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push('page: ' + error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push('console: ' + message.text()); });
  page.on('requestfailed', request => errors.push('request: ' + request.url() + ' ' + request.failure()?.errorText));
  page.on('response', response => { if (response.status() >= 400) errors.push('http: ' + response.status() + ' ' + response.url()); });
  return { context, page, errors };
}
try {
  if (selectedRuntimes.has('crowdsource')) {
  for (const width of [1280, 390]) {
    for (const suffix of ['', '&edit=true', '&fromScratch=true']) {
      const { context, page, errors } = await observePage(width);
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
  }
  for (const target of [
    { runtime: 'shortlist', appid: '5a9c34acf59a49f0a67d5f7293b44d6b', title: 'The Raised Bogs of Ireland' },
    { runtime: 'mapseries', appid: '77245a2c7bb540878fd3b24ebd048b20', title: 'Stewardship' },
    { runtime: 'cascade', appid: 'dbc3574e3d0d4f4a81ae95f2e86b0dc2', title: 'Palau' }
  ]) {
    if (!selectedRuntimes.has(target.runtime)) continue;
    for (const width of [1280, 390]) {
      for (const suffix of ['', '&edit=true']) {
        const { context, page, errors } = await observePage(width);
        const result = { ...target, width, suffix, errors };
        results.push(result);
        try {
          await page.goto(origin + basePath + '/viewers/' + target.runtime + '/index.html?appid=' + target.appid + suffix, { waitUntil: 'domcontentloaded', timeout: 60000 });
          await page.waitForFunction(title => document.body.innerText.toLowerCase().includes(title.toLowerCase()), target.title, { timeout: 60000 });
          await page.locator('#loadingOverlay').waitFor({ state: 'hidden', timeout: 60000 });
          await page.locator('#loadingIndicator').waitFor({ state: 'hidden', timeout: 60000 });
          await page.waitForLoadState('networkidle', { timeout: 60000 });
          for (const control of await page.getByText(/^\W*Edit\W*$/i).all()) assert.equal(await control.isVisible(), false, 'Edit control must not be visible');
          assert.doesNotMatch(new URL(page.url()).search, /edit=/);
          await page.screenshot({ path: path.join(temporary, target.runtime + '-' + width + '-' + (suffix ? 'edit' : 'plain') + '.png') });
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
