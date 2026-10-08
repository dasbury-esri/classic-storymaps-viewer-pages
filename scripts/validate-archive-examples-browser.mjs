import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const modulePath = process.env.PLAYWRIGHT_NODE_MODULES;
const { chromium } = modulePath
  ? await import(pathToFileURL(path.join(modulePath, 'playwright/index.mjs')).href)
  : await import('playwright');
const origin = process.env.EXAMPLE_ORIGIN || 'https://dasbury-esri.github.io';
const publish = path.resolve(process.env.PUBLISH_CHECK_ROOT || 'publish');
const output = await mkdtemp(path.join(os.tmpdir(), 'classic-example-audit-'));
const browser = await chromium.launch({ headless: true });
const results = [];
const slugs = { maptour: 'map-tour', swipe: 'swipe-spyglass', mapjournal: 'map-journal', mapseries: 'map-series', cascade: 'cascade', shortlist: 'shortlist', crowdsource: 'crowdsource', basic: 'basic' };

async function inventory() {
  const parser = await browser.newPage();
  const links = [];
  for (const [runtime, slug] of Object.entries(slugs)) {
    const file = 'archive/2017-12-10-pages/en__app-list__' + slug + '.html';
    const html = await readFile(path.join(publish, file), 'utf8');
    const entries = await parser.evaluate(html => {
      const document = new DOMParser().parseFromString(html, 'text/html');
      return [...document.querySelectorAll('#top-feat a[href], #features a[href]')]
        .filter(anchor => anchor.querySelector('h6') || /^view (?:sample\b|a\b|this\b)/i.test(anchor.textContent.trim()) || /\/viewers\/(?:maptour|swipe|mapjournal|mapseries|cascade|shortlist|crowdsource|basic)(?:[/?]|$)/.test(anchor.getAttribute('href')))
        .map(anchor => ({ href: anchor.getAttribute('href'), label: anchor.textContent.trim(), image: anchor.querySelector('img')?.getAttribute('src') }));
    }, html);
    links.push(...entries.map(entry => ({ runtime, file, ...entry })));
  }
  const html = await readFile(path.join(publish, 'index.html'), 'utf8');
  const samples = await parser.evaluate(html => [...new DOMParser().parseFromString(html, 'text/html').querySelectorAll('a[href]')]
    .filter(anchor => anchor.textContent.trim() === 'VIEW SAMPLE')
    .map(anchor => ({ href: anchor.getAttribute('href'), label: anchor.textContent.trim() })), html);
  links.push(...samples.map(entry => ({ runtime: entry.href.match(/viewers\/([^/]+)\//)?.[1], file: 'index.html', ...entry })));
  await parser.close();
  await writeFile(path.join(output, 'inventory.json'), JSON.stringify(links, null, 2) + '\n');
  return [...new Map(links.map(entry => [entry.href, { runtime: entry.runtime, url: new URL(entry.href, origin).href }])).values()];
}

async function audit(target, index) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 850 }, ignoreHTTPSErrors: process.env.LOCAL_HTTPS === '1' });
  const page = await context.newPage();
  const errors = [];
  const cancelled = [];
  const result = { ...target, errors, cancelled, screenshot: `${index}-${target.runtime}.jpg` };
  page.on('pageerror', error => errors.push('page: ' + error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push('console: ' + message.text()); });
  page.on('requestfailed', request => {
    const message = 'request: ' + new URL(request.url()).origin + new URL(request.url()).pathname + ' ' + request.failure()?.errorText;
    if (request.failure()?.errorText === 'net::ERR_ABORTED' && request.resourceType() !== 'document') cancelled.push(message);
    else errors.push(message);
  });
  page.on('response', response => { if (response.status() >= 400) errors.push('http: ' + response.status() + ' ' + new URL(response.url()).origin + new URL(response.url()).pathname); });
  try {
    const url = new URL(target.url);
    const itemId = url.searchParams.get('appid') || url.searchParams.get('webmap');
    if (itemId) {
      const response = await fetch('https://www.arcgis.com/sharing/rest/content/items/' + itemId + '?f=json', { signal: AbortSignal.timeout(15000) });
      const item = await response.json();
      assert.ok(!item.error && item.access === 'public', 'Item is unavailable anonymously');
      result.itemTitle = item.title;
      result.itemType = item.type;
    }
    await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    if (target.runtime === 'crowdsource') {
      await page.waitForFunction(() => document.querySelectorAll('.gallery-item').length > 0, undefined, { timeout: 30000 });
      assert.equal(await page.evaluate(() => window.app.mode.isBuilder), false);
      assert.equal(await page.locator('button.participate').count(), 0);
      await page.getByText('Explore Map', { exact: true }).click();
      await page.waitForFunction(() => {
        const bounds = document.querySelector('.map-pane')?.getBoundingClientRect();
        return bounds && bounds.top >= 0 && bounds.top < 100 && bounds.bottom > 200;
      });
      result.interaction = 'Explore Map opened';
    } else await page.waitForFunction(() => {
      const visible = element => element && getComputedStyle(element).display !== 'none' && getComputedStyle(element).visibility !== 'hidden' && element.getBoundingClientRect().height > 0;
      return !['loadingOverlay', 'loadingIndicator'].some(id => visible(document.getElementById(id))) && document.body.innerText.trim().length > 40;
    }, undefined, { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    result.title = await page.title();
    result.body = (await page.locator('body').innerText()).slice(0, 1600);
    assert.doesNotMatch(result.body, /page not found|story (?:map )?(?:is |has been )?not available|has been retired|not authorized|sign in to access|unable to load|an error has occurred|unable to create map/i);
    if (target.title) assert.ok(result.body.toLowerCase().includes(target.title.toLowerCase()), 'Expected story title is not rendered');
    if (target.runtime === 'crowdsource') assert.ok(await page.locator('.gallery-item').count() > 0, 'Gallery is empty');
    if (target.runtime === 'maptour' && url.pathname.includes('/viewers/')) {
      assert.ok(await page.evaluate(() => window.app?.data?.getTourPoints?.().length > 0 && !window.app.isLoading), 'Tour is not ready');
      const cover = page.locator('.cover-start');
      if (await cover.isVisible()) await cover.click({ timeout: 5000 });
    }
    await page.screenshot({ path: path.join(output, result.screenshot), type: 'jpeg', quality: 80 });
    const navigation = {
      maptour: '.carousel-item-div:visible',
      mapjournal: '.dot:visible',
      mapseries: '.accordion-header:visible, .nav-tabs .entryLbl:visible',
      shortlist: '.tilelist > li:visible',
    }[target.runtime];
    if (navigation) {
      const controls = page.locator(navigation);
      if (await controls.count() > 1) {
        await controls.nth(1).click({ timeout: 10000 });
        result.interaction = 'Opened the second story entry';
      } else if (target.runtime === 'maptour') {
        await page.locator('#arrowNext:visible').click({ timeout: 10000 });
        result.interaction = 'Advanced with the next-story-point arrow';
      } else {
        assert.equal(target.runtime, 'mapjournal', 'Story navigation is missing');
        assert.equal(await page.locator('.sections .section').count(), 1, 'Journal navigation is missing');
        result.interaction = 'Single-section journal: no section navigation';
      }
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    } else if (target.runtime === 'cascade') {
      await page.mouse.wheel(0, 1600);
      await page.waitForFunction(() => !document.querySelector('.section-layout-cover')?.classList.contains('active'));
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      result.interaction = 'Scrolled past the cover';
    } else if (target.runtime === 'basic' || target.runtime === 'swipe') {
      await page.locator('.esriSimpleSliderIncrementButton:visible').first().click({ timeout: 10000 });
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      result.interaction = 'Zoomed the map';
    }
    const brokenImages = await page.evaluate(() => [...document.images].filter(image => {
      const bounds = image.getBoundingClientRect();
      return image.getAttribute('src') && image.complete && !image.naturalWidth && bounds.width > 10 && bounds.height > 10 && bounds.top < innerHeight && bounds.bottom > 0 && getComputedStyle(image).visibility !== 'hidden';
    }).map(image => new URL(image.src).pathname));
    assert.deepEqual(brokenImages, [], 'Visible story images failed to load');
    assert.equal(errors.length, 0, 'Browser errors (see errors in report)');
    result.pass = true;
  } catch (error) {
    result.pass = false;
    result.failure = error.message.slice(0, 1200);
    result.title = await page.title().catch(() => '');
    result.body = (await page.locator('body').innerText().catch(() => '')).slice(0, 1600);
  }
  if (!result.pass) await page.screenshot({ path: path.join(output, result.screenshot), type: 'jpeg', quality: 70 }).catch(() => {});
  await context.close();
  results.push(result);
  await writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2) + '\n');
  console.log(JSON.stringify({ runtime: result.runtime, url: result.url, title: result.title || result.itemTitle, pass: result.pass, failure: result.failure?.slice(0, 160), errors: errors.length }));
}

try {
  const targets = process.argv[2] ? JSON.parse(await readFile(process.argv[2], 'utf8')) : await inventory();
  console.log('Audit artifacts: ' + output);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(3, targets.length) }, async () => {
    while (next < targets.length) {
      const index = next++;
      await audit(targets[index], index);
    }
  }));
  console.log(`${results.filter(result => result.pass).length}/${results.length} passed`);
  if (results.some(result => !result.pass)) process.exitCode = 1;
} finally {
  await browser.close();
}
