import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';
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
