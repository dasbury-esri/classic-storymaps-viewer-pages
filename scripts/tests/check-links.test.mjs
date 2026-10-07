import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, before, test } from 'node:test';
import vm from 'node:vm';

const repo = fileURLToPath(new URL('../../', import.meta.url));
const base = process.env.PUBLISH_CHECK_ROOT
  ? (process.env.SITE_BASE_PATH || '')
  : (process.env.SITE_BASE_PATH || '/classic-storymaps-viewer-pages');
const runtimes = ['maptour', 'swipe', 'mapjournal', 'mapseries', 'cascade', 'shortlist', 'crowdsource', 'basic'];
let temporary;
let publish;

before(() => {
  if (process.env.PUBLISH_CHECK_ROOT) {
    publish = path.resolve(process.env.PUBLISH_CHECK_ROOT);
    return;
  }
  temporary = mkdtempSync(path.join(os.tmpdir(), 'classic-links-'));
  publish = path.join(temporary, 'publish');
  const env = {
    ...process.env,
    SITE_BASE_PATH: base,
    OUT_DIR: path.join(publish, 'viewers'),
    COMPAT_OUT_DIR_STORIES: path.join(publish, 'templates/classic-stories'),
    COMPAT_OUT_DIR_STORYMAPS: path.join(publish, 'templates/classic-storymaps'),
    ROOT_PAGE_OUT: path.join(publish, 'index.html'),
    ARCHIVE_ROOT_OUT: path.join(publish, 'archive/index.html'),
    ARCHIVE_PAGE_OUT: path.join(publish, 'archive/2017-12-10-app-list.html'),
    ARCHIVE_PAGES_OUT: path.join(publish, 'archive/2017-12-10-pages'),
    SANITIZE_ARCHIVE_SOURCE_PAGES: '0',
    PUBLISH_ROOT: path.join(publish, 'viewers')
  };
  execFileSync('bash', ['scripts/build-classic-storymaps-landing.sh'], { cwd: repo, env });
  for (const runtime of runtimes) {
    const build = path.join(temporary, 'runtimes', runtime, 'build');
    mkdirSync(build, { recursive: true });
    writeFileSync(path.join(build, 'index.html'), '<!doctype html><html><head></head><body><img src="/viewers/' + runtime + '/image.png"></body></html>');
    writeFileSync(path.join(build, 'image.png'), 'fixture');
    if (runtime === 'shortlist') {
      mkdirSync(path.join(build, 'resources/tpl/builder/icons'), { recursive: true });
      writeFileSync(path.join(build, 'resources/tpl/builder/icons/builder-help.png'), 'shared viewer icon');
      mkdirSync(path.join(build, 'app/storymaps/common/ui/share'), { recursive: true });
      writeFileSync(path.join(build, 'app/storymaps/common/ui/share/ShareDialog.html'), '<img src="resources/tpl/builder/icons/builder-help.png">');
    }
  }
  execFileSync('bash', [path.join(repo, 'scripts/build-classic-storymaps-runtime-publish.sh')], { cwd: temporary, env });
});

after(() => {
  if (temporary) rmSync(temporary, { recursive: true, force: true });
});

function htmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(file) : entry.name.endsWith('.html') ? [file] : [];
  });
}

test('published HTML links stay under the base path and resolve on disk', () => {
  const failures = [];
  let checked = 0;
  for (const file of htmlFiles(publish)) {
    const relative = path.relative(publish, file).split(path.sep).join('/');
    const html = readFileSync(file, 'utf8')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/(<script\b[^>]*>)[\s\S]*?<\/script\s*>/gi, '$1</script>');
    const tags = Array.from(html.matchAll(/<[a-z][^>]*>/gi), (match) => match[0]).join('\n');
    const runtimeFragment = !/<(?:!doctype\s+html|html)\b/i.test(html)
      && relative.match(/^viewers\/[^/]+\//);
    const documentPath = runtimeFragment ? runtimeFragment[0] + 'index.html' : relative;
    for (const match of tags.matchAll(/\b(?:href|src)\s*=\s*(["'])(.*?)\1/gi)) {
      const value = match[2].replaceAll('&amp;', '&');
      if (!value || value.startsWith('#') || /[<{]/.test(value)) continue;
      const url = new URL(value, 'https://local.example' + base + '/' + documentPath);
      if (url.origin !== 'https://local.example') continue;
      checked += 1;
      if (base && url.pathname !== base && !url.pathname.startsWith(base + '/')) {
        failures.push(relative + ': outside base: ' + value);
        continue;
      }
      let target = path.join(publish, decodeURIComponent(url.pathname.slice(base.length)));
      if (existsSync(target) && statSync(target).isDirectory()) target = path.join(target, 'index.html');
      if (!existsSync(target)) failures.push(relative + ': missing target: ' + value);
    }
  }
  assert.ok(checked > 100, 'Check the real landing and archive links');
  assert.equal(failures.length, 0, failures.length + ' link failures:\n' + failures.slice(0, 30).join('\n'));
});

test('catalog routes and loader inference include the deployment prefix', () => {
  const context = vm.createContext({ window: { location: { pathname: base + '/viewers/maptour-launcher.html' } } });
  vm.runInContext(readFileSync(path.join(publish, 'viewers/assets/js/classic-storymaps-config.js'), 'utf8'), context);
  const config = context.window.ClassicStoryMapsConfig;
  assert.equal(config.basePath, base + '/viewers');
  assert.equal(config.runtimeViewerByApp.maptour, base + '/viewers/maptour/index.html');
  const loader = readFileSync(path.join(publish, 'viewers/assets/js/classic-story-loader.js'), 'utf8');
  vm.runInContext(loader.slice(loader.indexOf('  var APP_ID_REGEX'), loader.indexOf('  function encodePath(')), context);
  assert.equal(context.getStoryBasePath(), base + '/viewers');
});

test('compatibility redirects retain the deployment prefix, query, and hash', () => {
  for (const legacy of ['classic-stories', 'classic-storymaps']) {
    let destination;
    const html = readFileSync(path.join(publish, 'templates', legacy, 'maptour/index.html'), 'utf8');
    const context = vm.createContext({ window: { location: {
      pathname: base + '/templates/' + legacy + '/maptour/',
      search: '?appid=local-test', hash: '#section',
      replace: (url) => { destination = url; }
    } } });
    vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1], context);
    assert.equal(destination, base + '/viewers/maptour/?appid=local-test#section');
  }
});
