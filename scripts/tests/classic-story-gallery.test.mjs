import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';

const site = new URL('../../apps/classic-storymaps-site/', import.meta.url);
const require = createRequire(import.meta.url);
const gallery = () => require(new URL('assets/js/classic-story-gallery.js', site).pathname);
function configuration(pathname = '/viewers/') {
  const context = vm.createContext({ window: { location: { pathname } } });
  vm.runInContext(readFileSync(new URL('assets/js/classic-storymaps-config.js', site), 'utf8'), context);
  return context.window.ClassicStoryMapsConfig;
}

test('every runtime has two to eight unique screenshot-backed examples', () => {
  const config = configuration();
  const identifiers = new Set();
  for (const runtime of Object.keys(config.appRegistry)) {
    const examples = config.exampleStoriesByRuntime?.[runtime];
    assert.ok(examples?.length >= 2 && examples.length <= 8, runtime);
    for (const example of examples) {
      assert.match(example.id, /^[a-f0-9]{32}$/);
      assert.equal(identifiers.has(example.id), false);
      identifiers.add(example.id);
      assert.ok(example.title);
      assert.ok(existsSync(new URL(example.image, site)), example.image);
    }
  }
  assert.equal(identifiers.size, 19);
  assert.equal(config.gallery.converter.enabled, false);
  assert.equal(config.gallery.publicGroupId, '');
});

test('runtime classification also recognizes Classic tags', () => {
  const config = configuration('/classic-storymaps-viewer-pages/viewers/');
  assert.equal(config.classifyClassicRuntimeFromItem({ type: 'Web Mapping Application', tags: ['Story Map', 'Story Map Journal'] }), 'mapjournal');
  assert.equal(config.runtimeViewerByApp.mapjournal, '/classic-storymaps-viewer-pages/viewers/mapjournal/index.html');
});

const item = (number, overrides = {}) => ({
  id: number.toString(16).padStart(32, '0'), title: `Story ${number}`, owner: 'owner',
  type: 'Web Mapping Application', tags: ['Story Map'], typeKeywords: ['Story Map Journal'],
  access: 'public', ...overrides
});

test('gallery membership validates owner, type, ID, public access and Classic metadata before routes', () => {
  const config = configuration();
  const accept = (candidate, owner = 'owner') => gallery().storyFromItem(candidate, config, owner);
  assert.equal(accept(item(1)).runtime, 'mapjournal');
  assert.equal(accept(item(1, { typeKeywords: [], tags: ['Story Map Journal'] })).runtime, 'mapjournal');
  assert.equal(accept(item(1, { tags: [] })).runtime, 'mapjournal');
  for (const override of [
    { owner: 'another' }, { type: 'StoryMap' }, { id: '../foreign' },
    { tags: [], typeKeywords: [], url: 'https://example.org/MapJournal/' },
    { tags: ['Story Map'], typeKeywords: [], url: '' },
    { typeKeywords: ['Story Map Journal', 'Story Map Tour'] }
  ]) assert.equal(accept(item(1, override)), null, JSON.stringify(override));
  assert.equal(accept(item(1, { access: 'private' }), ''), null);
  assert.equal(accept(item(1, { access: 'private' })).id, item(1).id);
});

test('search constraints are escaped and public group searches have no owner or credential', () => {
  const search = gallery().searchUrl({ owner: 'test" OR owner:*', title: '" OR type:*', start: 1, sort: 'title' });
  assert.equal(search.origin, 'https://www.arcgis.com');
  assert.equal(search.searchParams.get('q'), 'owner:"test\\" OR owner\\:\\*" AND type:"Web Mapping Application" AND title:"\\" OR type\\:\\*"');
  const publicSearch = gallery().searchUrl({ groupId: 'a'.repeat(32), start: 1 });
  assert.match(publicSearch.searchParams.get('q'), /group:"a{32}" AND access:public/);
  assert.doesNotMatch(publicSearch.href, /owner|token/);
  assert.throws(() => gallery().searchUrl({}), /source/);
  assert.throws(() => gallery().searchUrl({ groupId: 'invalid' }), /group/i);
});

test('conversion is gated by identity, deployment approval and supported runtime', () => {
  const config = configuration();
  assert.equal(gallery().convertUrl(item(1, { runtime: 'mapjournal' }), config, 'owner'), null);
  config.gallery.converter.enabled = true;
  const story = item(1, { runtime: 'mapjournal' });
  assert.equal(gallery().convertUrl(story, config, ''), null);
  assert.equal(gallery().convertUrl({ ...story, runtime: 'basic' }, config, 'owner'), null);
  const link = new URL(gallery().convertUrl(story, config, 'owner'));
  assert.equal(link.origin, 'https://regal-sable-0a6dde.netlify.app');
  assert.deepEqual([...link.searchParams], [['appid', story.id]]);
  config.gallery.converter.url = 'javascript:alert(1)';
  assert.equal(gallery().convertUrl(story, config, 'owner'), null);
});

test('HTTP conversion requires explicit development opt-in and a loopback destination', () => {
  const config = configuration();
  const converter = config.gallery.converter;
  const story = item(1, { runtime: 'mapjournal' });
  converter.enabled = true;
  converter.url = 'http://localhost:8888/';
  assert.equal(gallery().convertUrl(story, config, 'owner'), null);
  converter.allowLocalHttp = true;
  assert.equal(gallery().convertUrl(story, config, 'owner'), 'http://localhost:8888/?appid=' + story.id);
  assert.equal(gallery().convertUrl(story, config, ''), null);
  assert.equal(gallery().convertUrl({ ...story, runtime: 'shortlist' }, config, 'owner'), null);
  for (const url of ['http://example.org/', 'http://localhost.example.org/', 'http://user:password@localhost:8888/', 'ftp://localhost/']) {
    converter.url = url;
    assert.equal(gallery().convertUrl(story, config, 'owner'), null, url);
  }
});

test('pager crosses sparse pages, deduplicates and buffers excess results', async () => {
  const starts = [];
  const pager = gallery().createPager({ pageSize: 2, accept: candidate => candidate.keep && candidate,
    fetchPage: async start => {
      starts.push(start);
      return start === 1 ? { results: [{ id: 'skip' }], nextStart: 101 }
        : { results: ['a', 'a', 'b', 'c'].map(id => ({ id, keep: true })), nextStart: -1 };
    }
  });
  const first = await pager.next();
  assert.deepEqual(first.items.map(story => story.id), ['a', 'b']);
  assert.equal(first.hasMore, true);
  assert.deepEqual((await pager.next()).items.map(story => story.id), ['c']);
  assert.deepEqual(starts, [1, 101]);
});

test('pager bounds empty-page fetching and does not falsely claim exhaustion', async () => {
  let requests = 0;
  const pager = gallery().createPager({ accept: () => null,
    fetchPage: async start => { requests++; return { results: [], nextStart: start + 100 }; }
  });
  const page = await pager.next();
  assert.equal(requests, 3);
  assert.equal(page.items.length, 0);
  assert.equal(page.hasMore, true);
  assert.equal(page.continuation, true);
});

test('pager rejects repeated cursors, preserves state after errors and handles result limit', async () => {
  const repeated = gallery().createPager({ accept: candidate => candidate, fetchPage: async () => ({ results: [], nextStart: 1 }) });
  await assert.rejects(repeated.next(), /cursor/i);
  let fail = true;
  const starts = [];
  const retry = gallery().createPager({ accept: candidate => candidate, fetchPage: async start => {
    starts.push(start);
    if (fail) { fail = false; throw new Error('offline'); }
    return { results: [], nextStart: 10001 };
  } });
  await assert.rejects(retry.next(), /offline/);
  const page = await retry.next();
  assert.deepEqual(starts, [1, 1]);
  assert.equal(page.hasMore, false);
  assert.equal(page.limited, true);
});

test('REST client fixes the origin, keeps tokens out of URLs, and classifies auth errors', async () => {
  const calls = [];
  const client = gallery().createClient(async (url, options) => {
    calls.push({ url: String(url), options });
    return { ok: true, json: async () => ({ error: { code: 498 } }) };
  });
  await assert.rejects(client.json(new URL('https://www.arcgis.com/sharing/rest/community/self?f=json'), 'synthetic-token'), error => error.code === 498);
  assert.doesNotMatch(calls[0].url, /synthetic-token|token=/);
  assert.equal(calls[0].options.headers['X-Esri-Authorization'], 'Bearer synthetic-token');
  await assert.rejects(client.json(new URL('https://other.example/sharing/rest/search'), 'synthetic-token'), /origin/i);
  assert.equal(calls.length, 1);
  assert.equal(gallery().thumbnailUrl(item(1, { thumbnail: '../outside' })), null);
  assert.equal(gallery().thumbnailUrl(item(1, { thumbnail: 'https://other.example/img.png' })), null);
});

test('Viewers starts with a hidden gallery and whole-card catalog links', () => {
  const page = readFileSync(new URL('viewers.html', site), 'utf8');
  assert.match(page, /id="stories-toggle"[^>]*aria-expanded="false"/);
  assert.match(page, /id="story-gallery"[^>]*hidden/);
  assert.match(page, /<a class="card"[^>]*href="\$\{app.launchRoute\}"/);
  assert.match(page, /ClassicStoryGallery.mount/);
  assert.match(page, /galleryController.setSession/);
});

test('all eight launchers opt into shared galleries and explicitly identify their advanced tools', () => {
  for (const runtime of Object.keys(configuration().appRegistry)) {
    const page = readFileSync(new URL(`${runtime}-launcher.html`, site), 'utf8');
    assert.ok(page.includes(`data-classic-runtime="${runtime}"`), runtime);
    assert.ok(page.includes('assets/js/classic-launcher.js'), runtime);
    assert.ok(page.includes('assets/css/classic-launcher.css'), runtime);
    assert.ok(page.indexOf('assets/js/classic-launcher.js') < page.indexOf('assets/js/classic-story-loader.js'));
    assert.match(page, /id="launch-form"/);
  }
  const loader = readFileSync(new URL('assets/js/classic-story-loader.js', site), 'utf8');
  assert.match(loader, /getAttribute\("data-classic-runtime"\)/);
});
