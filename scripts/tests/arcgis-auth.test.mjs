import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const pageUrl = new URL('../../apps/classic-storymaps-site/viewers.html', import.meta.url);
const helperUrl = new URL('../../apps/classic-storymaps-site/assets/js/arcgis-auth-helpers.js', import.meta.url);
const page = readFileSync(pageUrl, 'utf8');

function authContext() {
  const storage = new Map();
  const context = vm.createContext({
    URL,
    URLSearchParams,
    Date,
    AUTH_STORAGE_KEY: 'arcgis_access_token',
    AUTH_EXPIRY_KEY: 'arcgis_access_token_expires',
    AUTH_CONFIG: { clientId: 'test-client', redirectUri: 'https://site.example/viewers/' },
    document: { cookie: '' },
    sessionStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: (key) => storage.delete(key)
    },
    window: {
      location: {
        protocol: 'https:',
        pathname: '/viewers/',
        search: '?app=maptour',
        hash: '',
        assign: (url) => { context.authorizeUrl = url; }
      }
    }
  });
  if (existsSync(helperUrl)) {
    vm.runInContext(readFileSync(helperUrl, 'utf8'), context);
  }
  vm.runInContext(page.slice(page.indexOf('    function getStoredToken()'), page.indexOf('    function setOmniStatus(')), context);
  return context;
}

test('login requests a 120-minute token', () => {
  const context = authContext();
  context.beginArcgisLogin();
  const authorizeUrl = new URL(context.authorizeUrl);
  assert.equal(authorizeUrl.searchParams.get('expiration'), '120');
  assert.equal(authorizeUrl.searchParams.get('client_id'), 'test-client');
  assert.equal(authorizeUrl.searchParams.get('redirect_uri'), context.AUTH_CONFIG.redirectUri);
});

test('OAuth return reads expires_in with the token', () => {
  const context = authContext();
  context.window.location.hash = '#access_token=test-token&expires_in=1800';
  const returned = context.getTokenFromHash();
  assert.equal(returned.token, 'test-token');
  assert.equal(returned.expiresIn, 1800);
});

test('cookie lifetime follows expires_in and sign-out clears both stores', () => {
  const context = authContext();
  const started = Date.now();
  context.storeToken('test-token', 1800);
  assert.match(context.document.cookie, /; Max-Age=1800(?:;|$)/);
  const payload = JSON.parse(decodeURIComponent(context.document.cookie.split(';')[0].slice('esri_auth='.length)));
  assert.equal(payload.token, 'test-token');
  assert.ok(payload.expires >= started + 1800 * 1000);
  assert.ok(payload.expires <= Date.now() + 1800 * 1000);
  assert.match(context.document.cookie, /; Secure(?:;|$)/);
  context.clearStoredToken();
  assert.equal(context.sessionStorage.getItem(context.AUTH_STORAGE_KEY), null);
  assert.equal(context.sessionStorage.getItem(context.AUTH_EXPIRY_KEY), null);
  assert.match(context.document.cookie, /esri_auth=;.*Expires=Thu, 01 Jan 1970/);
});

test('expired stored tokens are removed instead of getting a renewed cookie', () => {
  const context = authContext();
  context.sessionStorage.setItem(context.AUTH_STORAGE_KEY, 'expired-token');
  context.sessionStorage.setItem(context.AUTH_EXPIRY_KEY, Date.now() - 1000);
  assert.equal(context.getStoredToken(), null);
  assert.equal(context.sessionStorage.getItem(context.AUTH_STORAGE_KEY), null);
});

test('missing or invalid lifetimes do not create a session', () => {
  for (const expiresIn of [undefined, null, '', 0, -1, Infinity, 'invalid']) {
    const context = authContext();
    context.storeToken('test-token', expiresIn);
    assert.equal(context.getStoredToken(), null);
    assert.doesNotMatch(context.document.cookie, /test-token/);
  }
});

test('catalog source contains no legacy fourteen-day token lifetime', () => {
  assert.doesNotMatch(page, /20160|14\s*\*\s*24|1209600/);
});
