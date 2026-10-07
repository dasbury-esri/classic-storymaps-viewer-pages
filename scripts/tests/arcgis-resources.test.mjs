import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const siteUrl = new URL('../../apps/classic-storymaps-site/', import.meta.url);
const helperUrl = new URL('assets/js/arcgis-resource-helpers.js', siteUrl);
const loader = readFileSync(new URL('assets/js/classic-story-loader.js', siteUrl), 'utf8');
const legacyStart = loader.indexOf('  function addTokenToResourceUrl(');
const downloadStart = loader.indexOf('  async function appendResourcesAndImages(');
const legacy = legacyStart >= 0 ? loader.slice(legacyStart, downloadStart) : '';
const legacyContext = vm.createContext({});
vm.runInContext(legacy, legacyContext);
const helpers = existsSync(helperUrl)
  ? require(helperUrl.pathname)
  : { withArcgisToken: legacyContext.addTokenToResourceUrl };

for (const url of [
  'https://foreign.example/sharing/rest/content/items/image.png',
  'https://foreign.example/image.png?source=/sharing/rest/content/items/image.png',
  'https://www.arcgis.com.attacker.example/sharing/rest/content/items/image.png',
  'https://org.maps.arcgis.com.attacker.example/sharing/rest/content/items/image.png',
  'http://www.arcgis.com/sharing/rest/content/items/image.png',
  'https://www.arcgis.com/sharing/rest/content-other/image.png',
  '/sharing/rest/content/items/image.png',
  'not a URL'
]) {
  test('does not send the session token to ' + url, () => {
    assert.equal(helpers.withArcgisToken(url, 'local-test-token'), url);
    assert.equal(helpers.shouldSendArcgisToken(url), false);
  });
}

test('ArcGIS resource URLs preserve queries and have exactly one current token', () => {
  for (const host of ['www.arcgis.com', 'example.maps.arcgis.com']) {
    for (const query of ['', '?w=800', '?w=800&token=old&token=duplicate']) {
      const url = 'https://' + host + '/sharing/rest/content/items/image.png' + query;
      const result = new URL(helpers.withArcgisToken(url, 'new token&value'));
      assert.deepEqual(result.searchParams.getAll('token'), ['new token&value']);
      if (query) assert.equal(result.searchParams.get('w'), '800');
    }
    assert.equal(helpers.shouldSendArcgisToken('https://' + host + '/sharing/rest/content/items/image.png'), true);
  }
});

test('resource and linked-image downloads use the token policy', async () => {
  const fetched = [];
  const foreign = 'https://foreign.example/sharing/rest/content/items/image.png';
  const allowed = 'https://example.maps.arcgis.com/sharing/rest/content/users/owner/image.png?w=800';
  const context = vm.createContext({
    window: { ClassicArcgisResourceHelpers: helpers },
    ARC_BASE: 'https://www.arcgis.com/sharing/rest',
    encodePath: encodeURIComponent,
    fetchArcgisJson: async () => ({ resources: [{ resource: 'image.png' }] }),
    collectImageRefs: () => [{ url: foreign }, { url: allowed }],
    toCsv: () => '',
    fetch: async (url) => {
      fetched.push(url);
      return { ok: true, blob: async () => 'local-blob' };
    }
  });
  vm.runInContext(legacy + loader.slice(downloadStart, loader.indexOf('  async function buildResourceZip(')), context);
  await context.appendResourcesAndImages({ file() {} }, { item: { id: 'test-id' }, itemData: {} }, 'local-test-token', () => {});
  assert.equal(fetched.length, 3);
  assert.equal(new URL(fetched[0]).searchParams.get('token'), 'local-test-token');
  assert.equal(fetched[1], foreign);
  assert.equal(new URL(fetched[2]).searchParams.get('token'), 'local-test-token');
  assert.equal(new URL(fetched[2]).searchParams.get('w'), '800');
});

test('every launcher loads the resource helper before the loader', () => {
  const pages = readdirSync(siteUrl).filter((name) => name.endsWith('.html'));
  let loaderPages = 0;
  for (const name of pages) {
    const html = readFileSync(new URL(name, siteUrl), 'utf8');
    const loaderPosition = html.indexOf('<script src="assets/js/classic-story-loader.js">');
    if (loaderPosition < 0) continue;
    loaderPages += 1;
    const helperPosition = html.indexOf('<script src="assets/js/arcgis-resource-helpers.js">');
    assert.ok(helperPosition >= 0 && helperPosition < loaderPosition, name);
  }
  assert.equal(loaderPages, 8);
});
