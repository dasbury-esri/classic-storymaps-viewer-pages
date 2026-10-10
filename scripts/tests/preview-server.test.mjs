import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';
import vm from 'node:vm';
import { createPreviewHandler } from '../preview-server.mjs';

const base = '/classic-storymaps-viewer-pages';
let directory;
let server;
let origin;

before(async () => {
  directory = await mkdtemp(path.join(os.tmpdir(), 'classic-preview-test-'));
  await mkdir(path.join(directory, 'viewers/maptour'), { recursive: true });
  await mkdir(path.join(directory, 'encoded folder'));
  await writeFile(path.join(directory, 'index.html'), 'root');
  await writeFile(path.join(directory, 'viewers/index.html'), '<html><head><title>Viewers</title></head><body>Catalog</body></html>');
  await writeFile(path.join(directory, 'viewers/maptour/index.html'), 'viewer');
  await writeFile(path.join(directory, 'viewers/maptour/app.js'), 'viewer script');
  await writeFile(path.join(directory, 'encoded folder/index.html'), 'encoded');
  server = http.createServer(createPreviewHandler({ root: directory, basePath: base }));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  origin = 'http://127.0.0.1:' + server.address().port;
});

after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  if (directory) await rm(directory, { recursive: true, force: true });
});

test('preview redirects slashless viewer directories and preserves query bytes', async () => {
  const query = '?appid=lincoln&webmap=map&label=a%20b&redirect=%2Fexample%3Fvalue%3D1';
  const response = await fetch(origin + base + '/viewers/maptour' + query, { redirect: 'manual' });
  assert.equal(response.status, 308);
  assert.equal(response.headers.get('location'), base + '/viewers/maptour/' + query);
  const followed = await fetch(origin + response.headers.get('location'));
  assert.equal(followed.status, 200);
  assert.equal(await followed.text(), 'viewer');
});

test('preview redirects the deployment root and encoded directories', async () => {
  for (const suffix of ['', '/encoded%20folder']) {
    const response = await fetch(origin + base + suffix + '?keep=1', { redirect: 'manual' });
    assert.equal(response.status, 308);
    assert.equal(response.headers.get('location'), base + suffix + '/?keep=1');
  }
});

test('preview serves slashful directories and explicit files without redirecting', async () => {
  for (const suffix of ['/viewers/maptour/', '/viewers/maptour/index.html']) {
    const response = await fetch(origin + base + suffix, { redirect: 'manual' });
    assert.equal(response.status, 200);
    assert.equal(await response.text(), 'viewer');
  }
  const script = await fetch(origin + base + '/viewers/maptour/app.js');
  assert.equal(script.headers.get('content-type'), 'application/javascript');
  assert.equal(await script.text(), 'viewer script');
});

test('preview returns 404 for missing files and requests outside the deployment prefix', async () => {
  for (const suffix of ['/missing.html', base + '/missing.html', base + '-other/index.html']) {
    assert.equal((await fetch(origin + suffix, { redirect: 'manual' })).status, 404);
  }
});

test('preview HEAD requests have no body', async () => {
  const response = await fetch(origin + base + '/viewers/maptour/index.html', { method: 'HEAD' });
  assert.equal(response.status, 200);
  assert.equal(await response.text(), '');
});

test('preview converter override enables only a local destination without changing published configuration', async () => {
  const relative = 'viewers/assets/js/classic-storymaps-config.js';
  const original = 'window.ClassicStoryMapsConfig={gallery:{converter:{enabled:false,url:"https://regal-sable-0a6dde.netlify.app/"}}};';
  await mkdir(path.dirname(path.join(directory, relative)), { recursive: true });
  await writeFile(path.join(directory, relative), original);
  assert.equal(await (await fetch(origin + base + '/' + relative)).text(), original);
  for (const basePath of [base, '']) {
    const configured = http.createServer(createPreviewHandler({ root: directory, basePath, converterUrl: 'http://localhost:8888/' }));
    await new Promise(resolve => configured.listen(0, '127.0.0.1', resolve));
    const localOrigin = 'http://127.0.0.1:' + configured.address().port;
    try {
      const response = await fetch(localOrigin + basePath + '/' + relative);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      const window = {};
      vm.runInNewContext(await response.text(), { window });
      const converter = window.ClassicStoryMapsConfig.gallery.converter;
      assert.equal(converter.enabled, true);
      assert.equal(converter.url, 'http://localhost:8888/');
      assert.equal(converter.allowLocalHttp, true);
      assert.equal(await readFile(path.join(directory, relative), 'utf8'), original);
      assert.equal(await (await fetch(localOrigin + basePath + '/viewers/maptour/')).text(), 'viewer');
    } finally {
      await new Promise(resolve => configured.close(resolve));
    }
  }
  for (const converterUrl of ['https://example.org/', 'http://localhost.example.org/', 'http://user:password@localhost:8888/', 'ftp://localhost/', 'http://localhost:8888/?token=synthetic']) {
    assert.throws(() => createPreviewHandler({ root: directory, converterUrl }), /converter URL/i);
  }
});

test('preview OAuth override is opt-in, Viewers-only, and never changes published files', async () => {
  const original = await readFile(path.join(directory, 'viewers/index.html'), 'utf8');
  assert.equal(await (await fetch(origin + base + '/viewers/')).text(), original);
  for (const basePath of [base, '']) {
    const configured = http.createServer(createPreviewHandler({ root: directory, basePath, oauthClientId: 'development-client' }));
    await new Promise(resolve => configured.listen(0, '127.0.0.1', resolve));
    const localOrigin = 'http://127.0.0.1:' + configured.address().port;
    try {
      for (const suffix of ['/viewers/', '/viewers/index.html']) {
        const response = await fetch(localOrigin + basePath + suffix);
        assert.equal(response.headers.get('cache-control'), 'no-store');
        const html = await response.text();
        const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
        assert.equal(scripts.length, 1);
        const window = { location: { origin: localOrigin } };
        vm.runInNewContext(scripts[0][1], { window });
        assert.equal(window.__CLASSIC_STORYMAPS_CLIENT_ID__, 'development-client');
        assert.equal(window.__CLASSIC_STORYMAPS_REDIRECT_URI__, localOrigin + basePath + '/viewers/');
        assert.ok(html.indexOf('<script>') < html.indexOf('<title>'));
      }
      assert.equal(await (await fetch(localOrigin + basePath + '/viewers/maptour/')).text(), 'viewer');
      assert.equal(await (await fetch(localOrigin + basePath + '/')).text(), 'root');
      assert.equal(await readFile(path.join(directory, 'viewers/index.html'), 'utf8'), original);
    } finally {
      await new Promise(resolve => configured.close(resolve));
    }
  }
  assert.throws(() => createPreviewHandler({ root: directory, oauthClientId: '</script>' }), /client ID/i);
});
