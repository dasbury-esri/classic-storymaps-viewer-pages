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

test('published runtime entry points contain no uncompiled template tags', () => {
  for (const runtime of runtimes) {
    const html = readFileSync(path.join(publish, 'viewers', runtime, 'index.html'), 'utf8');
    assert.doesNotMatch(html, /<%/, runtime + ': runtime entry point must be compiled');
  }
});

test('archive root repeats the archive disclaimer below the historical copyright', () => {
  for (const filename of ['index.html', 'archive/index.html']) {
    const html = readFileSync(path.join(publish, filename), 'utf8');
    const banner = html.match(/<div class="archive-banner"[^>]*>\s*<div class="container">([^<]+)<\/div>/);
    const footer = html.match(/<footer id="archive-footer"[^>]*>([\s\S]*?)<\/footer>/);
    assert.ok(footer, filename + ': archive disclaimer footer is present');
    assert.ok(html.indexOf('Copyright 2017') < footer.index, 'Footer follows the historical copyright');
    const disclaimer = 'This is a historical archive of the Classic Story Maps website from 2017-12-10.';
    assert.equal(banner[1], disclaimer);
    assert.match(footer[0], /class="archive-banner"/);
    assert.equal(footer[1].match(/<div class="container">([^<]+)<\/div>/)?.[1], disclaimer);
    assert.doesNotMatch(footer[1], /<nav\b|<a\b|site-brand|esri-logo/);
    assert.match(html, /#archive-footer\s*\{[^}]*position:\s*static;/);
  }
});

test('site and archive pages omit Esri PNG logos but preserve historical copyright', () => {
  const sitePages = htmlFiles(publish).filter(file => {
    const relative = path.relative(publish, file).split(path.sep).join('/');
    return !runtimes.some(runtime => relative.startsWith('viewers/' + runtime + '/'));
  });
  for (const file of sitePages) {
    const html = readFileSync(file, 'utf8');
    assert.doesNotMatch(html, /class="[^"]*\besri-logo(?:-footer)?\b|(?:src|background)="[^"]*logo-esri[^"/]*\.png/i, file);
  }
  const stylesheet = readFileSync(path.join(publish, 'viewers/assets/css/archive/screen.css'), 'utf8');
  assert.doesNotMatch(stylesheet, /url\([^)]*logo-esri[^)]*\.png/i);
  for (const filename of ['index.html', 'archive/index.html']) {
    const html = readFileSync(path.join(publish, filename), 'utf8');
    assert.match(html, /<footer\b[\s\S]*Copyright 2017 Environmental Systems Research Institute, Inc\./);
  }
  const archiveSources = path.join(repo, 'classic-apps/2017-12-10/app-list/pages');
  for (const sourceFile of htmlFiles(archiveSources)) {
    const source = readFileSync(sourceFile, 'utf8');
    const output = readFileSync(path.join(publish, 'archive/2017-12-10-pages', path.relative(archiveSources, sourceFile)), 'utf8');
    const notices = source.match(/Copyright[^<\r\n]+/gi) || [];
    for (const notice of notices) assert.ok(output.includes(notice), sourceFile + ': copyright text must survive');
  }
});

test('archive headers and mobile drawers link to Viewers without changing historical footer navigation', () => {
  const pages = [path.join(publish, 'index.html'), path.join(publish, 'viewers/archive-root.html'), ...htmlFiles(path.join(publish, 'archive'))];
  let checked = 0;
  for (const file of pages) {
    const html = readFileSync(file, 'utf8');
    const navigation = Array.from(html.matchAll(/<nav\b[^>]*class="(?:site-nav|drawer-nav)\b[^>]*>([\s\S]*?)<\/nav>/g), match => match[1]);
    for (const content of navigation) {
      if (!/nav_(?:gallery|viewers)/.test(content)) continue;
      const link = content.match(/<a\b[^>]*data-langlabel="nav_viewers"[^>]*href="([^"]+)"[^>]*>Viewers<\/a>/);
      assert.ok(link, file + ': header or drawer must offer Viewers');
      assert.equal(link[1], base + '/viewers/');
      assert.doesNotMatch(content, /nav_gallery/);
      if (content.includes('drawer-link')) assert.match(link[0], /class="drawer-link icon-grid"/);
      checked += 1;
    }
  }
  assert.ok(checked > 30, 'Check the full archive navigation set');
  const historicalHome = readFileSync(path.join(publish, 'archive/2017-12-10-pages/en.html'), 'utf8');
  assert.match(historicalHome.match(/<footer\b[\s\S]*?<\/footer>/)[0], /data-langlabel="nav_gallery"[^>]*>Gallery<\/a>/);
});

test('archive headers and mobile drawers replace My Stories with FAQs', () => {
  const pages = [path.join(publish, 'index.html'), path.join(publish, 'viewers/archive-root.html'), ...htmlFiles(path.join(publish, 'archive'))];
  let checked = 0;
  for (const file of pages) {
    const html = readFileSync(file, 'utf8');
    for (const navigation of html.matchAll(/<nav\b[^>]*class="(?:site-nav|drawer-nav)\b[^>]*>([\s\S]*?)<\/nav>/g)) {
      const content = navigation[1];
      const link = content.match(/<a\b[^>]*data-langlabel="nav_faq"[^>]*href="([^"]+)"[^>]*>FAQs<\/a>/);
      assert.ok(link, file + ': header or drawer must offer FAQs');
      assert.equal(link[1], base + '/archive/2017-12-10-pages/en__faq.html');
      assert.doesNotMatch(content, /nav_mystories|My Stories/);
      checked += 1;
    }
  }
  assert.ok(checked > 30, 'Check the full archive navigation set');
  const historicalHome = readFileSync(path.join(publish, 'archive/2017-12-10-pages/en.html'), 'utf8');
  assert.match(historicalHome.match(/<footer\b[\s\S]*?<\/footer>/)[0], /data-langlabel="nav_mystories"[^>]*>My Stories<\/a>/);
});

test('archive footers preserve social and email icons without href links', () => {
  const pages = [path.join(publish, 'index.html'), path.join(publish, 'viewers/archive-root.html'), ...htmlFiles(path.join(publish, 'archive'))];
  let checked = 0;
  for (const file of pages) {
    const html = readFileSync(file, 'utf8');
    for (const footer of html.matchAll(/<footer\b[\s\S]*?<\/footer>/g)) {
      assert.doesNotMatch(footer[0], /<a\b[^>]*(?:icon-(?:twitter|facebook|github|email))[^>]*\bhref\s*=/i, file);
      checked += 1;
    }
  }
  assert.ok(checked > 4, 'Check root, captured, and standalone archive footers');
  for (const filename of ['index.html', 'archive/index.html', 'viewers/archive-root.html', 'archive/2017-12-10-app-list.html', 'archive/2017-12-10-pages/en.html', 'archive/2017-12-10-pages/en__app-list.html']) {
    const html = readFileSync(path.join(publish, filename), 'utf8');
    const social = html.match(/<section class="footer-social-nav">([\s\S]*?)<\/section>/);
    assert.ok(social, filename + ': footer icon section remains');
    assert.doesNotMatch(social[1], /\bhref\s*=/i);
    for (const icon of ['twitter', 'facebook', 'github', 'email']) {
      assert.match(social[1], new RegExp('<a class="icon-' + icon + '"[^>]*></a>'));
    }
  }
});

test('archive app listings omit Gallery controls but retain other app actions', () => {
  for (const filename of ['index.html', 'archive/index.html', 'viewers/archive-root.html', 'archive/2017-12-10-app-list.html', 'archive/2017-12-10-pages/en__app-list.html']) {
    const html = readFileSync(path.join(publish, filename), 'utf8');
    const listings = Array.from(html.matchAll(/<div class="app-text">([\s\S]*?)<\/div>/g), match => match[1]);
    const sourceFile = filename === 'archive/2017-12-10-app-list.html'
      ? 'classic-apps/2017-12-10/app-list/raw/index.raw.html'
      : filename === 'archive/2017-12-10-pages/en__app-list.html'
        ? 'classic-apps/2017-12-10/app-list/pages/en__app-list.html'
        : 'apps/classic-storymaps-site/archive-root.html';
    const source = readFileSync(path.join(repo, sourceFile), 'utf8');
    const sourceListings = Array.from(source.matchAll(/<div class="app-text">([\s\S]*?)<\/div>/g), match => match[1]);
    const labels = listing => Array.from(listing.matchAll(/<(?:a|span)\b[^>]*>([^<]*)<\/(?:a|span)>/g), match => match[1].trim()).filter(label => label !== 'GALLERY');
    assert.ok(listings.length >= 8, filename + ': check every app listing');
    assert.deepEqual(listings.map(labels), sourceListings.map(labels), filename + ': preserve non-Gallery controls');
    for (const listing of listings) {
      assert.doesNotMatch(listing, /<(?:a|span)\b[^>]*>\s*GALLERY\s*<\/(?:a|span)>/i, filename);
    }
  }
});

test('catalog has a return button pointing to the archive under the deployment prefix', () => {
  const html = readFileSync(path.join(publish, 'viewers/index.html'), 'utf8');
  const link = html.match(/<a\b[^>]*class="[^"]*\barchive-return\b[^>]*href="([^"]+)"[^>]*>\s*Back to Archive\s*<\/a>/);
  assert.ok(link, 'Catalog includes a Back to Archive button-styled link');
  assert.equal(link[1], base + '/archive/');
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
