import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const loader = readFileSync(new URL('../../apps/classic-storymaps-site/assets/js/classic-story-loader.js', import.meta.url), 'utf8');

function destinationContext() {
  const context = vm.createContext({
    URL,
    state: {},
    APP_LABEL_BY_ID: { maptour: 'Map Tour' },
    launcherAppLabel: 'Story',
    ui: { openBtn: {}, downloadItemBtn: {}, downloadDataBtn: {}, downloadZipBtn: {}, downloadAllBtn: {} },
    setTitle() {},
    setStatus: (message) => { context.status = message; },
    setDisabled: (button, disabled) => { button.disabled = disabled; },
    getViewerUrl: () => '/viewers/maptour/?appid=local-test'
  });
  const helperStart = loader.indexOf('  function describeSelfHostedDestination(');
  if (helperStart >= 0) vm.runInContext(loader.slice(helperStart, loader.indexOf('  function ensureUi(')), context);
  vm.runInContext(loader.slice(loader.indexOf('    function applyFoundState('), loader.indexOf('    function applyWebmapState(')), context);
  return context;
}

for (const url of [
  'http://stories.example/tour/index.html',
  'https://stories.example/tour/?appid=test#section',
  'https://' + 'long-hostname-'.repeat(4) + '.example/' + 'long-path/'.repeat(80) + '?detail=full#section'
]) {
  test('shows the complete self-hosted destination for ' + (url.length > 200 ? 'a long URL' : new URL(url).protocol), () => {
    const context = destinationContext();
    context.applyFoundState({ item: { id: 'local-test', title: 'Example', url }, selfHosted: true, classicType: 'maptour' });
    assert.equal(context.ui.openBtn.textContent, 'Open Map Tour Viewer (' + new URL(url).hostname + ')');
    assert.ok(context.status.includes(url), 'Show the complete URL before navigation');
    assert.equal(context.state.viewerUrl, url);
    assert.equal(context.ui.openBtn.disabled, false);
    assert.equal(context.describeSelfHostedDestination(url, 'Map Tour').url, url);
    context.applyFoundState({ item: { id: 'local-test', title: 'Hosted' }, selfHosted: false, classicType: 'maptour' });
    assert.equal(context.ui.openBtn.textContent, 'Open Map Tour Viewer');
    assert.equal(context.status, 'Valid app id: local-test');
  });
}

test('invalid self-hosted destinations cannot enable navigation', () => {
  for (const url of ['', 'not a URL', 'javascript:void(0)', 'ftp://stories.example/tour']) {
    const context = destinationContext();
    context.applyFoundState({ item: { id: 'local-test', title: 'Invalid', url }, selfHosted: true, classicType: 'maptour' });
    assert.equal(context.state.viewerUrl, null);
    assert.equal(context.ui.openBtn.disabled, true);
    assert.match(context.status, /valid HTTP\(S\)/);
  }
});
