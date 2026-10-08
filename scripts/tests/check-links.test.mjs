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
    writeFileSync(path.join(build, 'BUILD_SOURCE'), runtime === 'crowdsource' ? 'release:0.10.0\n' : 'grunt\n');
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

test('published release-capable runtimes retain valid build-source markers', () => {
  for (const runtime of ['cascade', 'shortlist', 'mapseries', 'crowdsource']) {
    const source = readFileSync(path.join(publish, 'viewers', runtime, 'BUILD_SOURCE'), 'utf8').trim();
    assert.match(source, /^(?:grunt|release:\d+\.\d+\.\d+)$/, runtime);
  }
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

test('all sample and overview story links open in an isolated new tab', () => {
  const slugs = ['map-tour', 'map-journal', 'map-series', 'cascade', 'shortlist', 'swipe-spyglass', 'crowdsource', 'basic'];
  const files = ['index.html', 'archive/index.html', 'viewers/archive-root.html', 'archive/2017-12-10-app-list.html', 'archive/2017-12-10-pages/en__app-list.html',
    ...slugs.map(slug => 'archive/2017-12-10-pages/en__app-list__' + slug + '.html')];
  let checked = 0;
  for (const file of files) {
    const html = readFileSync(path.join(publish, file), 'utf8');
    for (const match of html.matchAll(/<a\b([^>]*\bhref="([^"]*)"[^>]*)>([\s\S]*?)<\/a>/g)) {
      const label = match[3].replace(/<[^>]*>/g, '').trim();
      if (!/^view (?:sample\b|a\b|this\b)/i.test(label) && !/\/viewers\/(?:maptour|swipe|mapjournal|mapseries|cascade|shortlist|crowdsource|basic)(?:[/?]|$)/.test(match[2])) continue;
      assert.match(match[1], /\btarget="_blank"/, file + ': ' + match[2]);
      const rel = match[1].match(/\brel="([^"]*)"/)?.[1].split(/\s+/) || [];
      assert.ok(rel.includes('noopener') && rel.includes('noreferrer'), file + ': ' + match[2]);
      checked += 1;
    }
  }
  assert.ok(checked >= 48, 'Cover every example and repeated archive listing');
});

test('historical home links open the original Bare Earth Cascade in the current viewer', () => {
  const html = readFileSync(path.join(publish, 'archive/2017-12-10-pages/en.html'), 'utf8');
  const examples = [...html.matchAll(/<a\b[^>]*href="([^"]*\/viewers\/cascade\/index\.html\?appid=36b4887370d141fcbb35392f996c82d9)"[^>]*>[\s\S]*?<\/a>/g)];
  assert.equal(examples.length, 2, 'Cover both the image and text links');
  assert.ok(examples.some(example => example[0].includes('The Bare Earth')));
  for (const example of examples) {
    assert.equal(example[1], base + '/viewers/cascade/index.html?appid=36b4887370d141fcbb35392f996c82d9');
    assert.ok(example[0].includes('target="_blank"'));
    assert.ok(example[0].includes('noopener noreferrer'));
  }
  assert.doesNotMatch(html, /href="[^"]*smotm_dec2017/);
});

test('Resources singing presentation opens its original Cascade in the current viewer', () => {
  const html = readFileSync(path.join(publish, 'archive/2017-12-10-pages/en__resources.html'), 'utf8');
  const example = html.match(/<a\b[^>]*href="([^"]*\/viewers\/cascade\/index\.html\?appid=dcd5d01e2b0342fe90cf3b8ca9ab8302)"[^>]*>[\s\S]*?<\/a>/);
  assert.ok(example, 'Preserve the original singing presentation');
  assert.equal(example[1], base + '/viewers/cascade/index.html?appid=dcd5d01e2b0342fe90cf3b8ca9ab8302');
  assert.ok(example[0].includes('Make Your Story Map Sing'));
  assert.ok(example[0].includes('target="_blank"'));
  assert.ok(example[0].includes('noopener noreferrer'));
  assert.ok(!html.includes('make_your_story_map_sing'));
});

test('Resources introduction presentation opens its original Map Series in the current viewer', () => {
  const html = readFileSync(path.join(publish, 'archive/2017-12-10-pages/en__resources.html'), 'utf8');
  const example = html.match(/<a\b[^>]*href="([^"]*\/viewers\/mapseries\/index\.html\?appid=4aaf9036c7324b0cb5c8ee3e609126e7)"[^>]*>[\s\S]*?<\/a>/);
  assert.ok(example, 'Preserve the original introduction presentation');
  assert.equal(example[1], base + '/viewers/mapseries/index.html?appid=4aaf9036c7324b0cb5c8ee3e609126e7');
  assert.ok(example[0].includes('An Introduction to Story Maps'));
  assert.ok(example[0].includes('target="_blank"'));
  assert.ok(example[0].includes('noopener noreferrer'));
  assert.ok(!html.includes('an_introduction_presentation'));
});

test('FAQ caption example opens the original Map Tour in the current viewer', () => {
  const html = readFileSync(path.join(publish, 'archive/2017-12-10-pages/en__faq.html'), 'utf8');
  const example = html.match(/<a\b[^>]*href="([^"]*\/viewers\/maptour\/index\.html\?appid=d5b2c90d8a53466f9c3efb0f25d13325)"[^>]*>Map Tour<\/a>/);
  assert.ok(example, 'Preserve the caption-formatting story and link label');
  assert.equal(example[1], base + '/viewers/maptour/index.html?appid=d5b2c90d8a53466f9c3efb0f25d13325');
  assert.ok(example[0].includes('target="_blank"'));
  assert.ok(example[0].includes('noopener noreferrer'));
  assert.ok(!html.includes('story_map_tour_html_formatting_in_caption_example'));
});

test('Audubon organization tile opens the owner-approved original Map Series', () => {
  const html = readFileSync(path.join(publish, 'archive/2017-12-10-pages/en.html'), 'utf8');
  const tile = html.match(/<a\b[^>]*class="party-tile audubon"[^>]*>/);
  assert.ok(tile, 'Preserve the Audubon organization tile');
  assert.ok(tile[0].includes('href="' + base + '/viewers/mapseries/index.html?appid=3c48121bd41945d68aacd1ded71841a4"'));
  assert.ok(tile[0].includes('target="_blank"'));
  assert.ok(tile[0].includes('noopener noreferrer'));
  assert.doesNotMatch(html, /href="[^"]*links\.esri\.com\/storymaps\/user\/audubon/);
});

test('organization tiles retain local styling and accessible NOAA content', () => {
  const html = readFileSync(path.join(publish, 'archive/2017-12-10-pages/en.html'), 'utf8');
  assert.ok(html.includes('href="' + base + '/viewers/assets/css/archive/organization-tiles.css"'));
  assert.ok(existsSync(path.join(publish, 'viewers/assets/css/archive/organization-tiles.css')));
  const tile = html.match(/<a\b[^>]*class="party-tile noaa"[^>]*>([\s\S]*?)<\/a>/);
  assert.ok(tile?.[1].includes('NOAA'), 'NOAA has visible, accessible link content');
});

test('Boston organization tile opens the owner-selected filtered gallery', () => {
  const html = readFileSync(path.join(publish, 'archive/2017-12-10-pages/en.html'), 'utf8');
  const tile = html.match(/<a\b[^>]*class="party-tile boston"[^>]*>City of Boston<\/a>/);
  assert.ok(tile, 'Preserve the readable Boston organization tile');
  const href = tile[0].match(/\bhref="([^"]+)"/)[1].replaceAll('&amp;', '&');
  assert.equal(href, 'https://boston.maps.arcgis.com/home/gallery.html?sortField=relevance&sortOrder=desc&mode=keyword&focus=applications-storymap');
  assert.ok(tile[0].includes('target="_blank"'));
  assert.ok(tile[0].includes('rel="noopener noreferrer"'));
  assert.doesNotMatch(html, /href="[^"]*links\.esri\.com\/storymaps\/user\/city_boston/);
});

test('NOAA organization tile uses the owner-selected Wayback capture', () => {
  const html = readFileSync(path.join(publish, 'archive/2017-12-10-pages/en.html'), 'utf8');
  const tile = html.match(/<a\b[^>]*class="party-tile noaa"[^>]*>/);
  assert.ok(tile, 'NOAA tile exists');
  assert.ok(tile[0].includes('href="https://web.archive.org/web/20250223200002/https://oceanservice.noaa.gov/map-stories/welcome.html"'));
  assert.ok(tile[0].includes('target="_blank"'));
  assert.ok(!html.includes('href="https://links.esri.com/storymaps/user/noaa"'));
});

test('first Playlist example uses the archived 20 Towns destination', () => {
  const html = readFileSync(path.join(publish, 'archive/2017-12-10-pages/en__app-list__playlist.html'), 'utf8');
  const example = html.match(/<a\b[^>]*href="([^"]+)"[^>]*>\s*<img[^>]*playlist1\.jpg[^>]*>[\s\S]*?<\/a>/);
  assert.ok(example, 'First Playlist example exists');
  assert.equal(example[1], 'https://storymaps.esri.com/archives/stories/2013/20towns/');
  assert.ok(example[0].includes('target="_blank"'));
  assert.ok(example[0].includes('noopener noreferrer'));
});

test('Map Tour sample and fourth Overview example use the owner-selected stories', () => {
  for (const file of ['index.html', 'archive/index.html', 'viewers/archive-root.html']) {
    const html = readFileSync(path.join(publish, file), 'utf8');
    const tour = [...html.matchAll(/<div class="app-text">([\s\S]*?)<\/div>/g)]
      .find(match => match[1].includes('Story Map Tour'))?.[1];
    assert.ok(tour?.includes('/viewers/maptour/index.html?webmap=a5019e8c55d547eab69c0777dcd7509a'), file + ': Map Tour sample');
  }
  const html = readFileSync(path.join(publish, 'archive/2017-12-10-pages/en__app-list__map-tour.html'), 'utf8');
  const examples = [...html.matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)]
    .filter(match => match[1].includes('/viewers/maptour') && match[2].includes('<img'));
  assert.equal(examples.length, 4);
  assert.ok(examples[3][1].endsWith('/viewers/maptour/index.html?appid=016c31c6dcd54c7ca635cc63e4bc82a4'));
  assert.ok(examples[3][2].includes('/images/examples/016c31c6dcd54c7ca635cc63e4bc82a4.jpg'));
  assert.ok(examples[3][0].includes('target="_blank"'));
});

test('archive examples replace failed stories and match advertised sample layouts', () => {
  const slugs = ['map-tour', 'map-journal', 'map-series', 'cascade', 'shortlist', 'swipe-spyglass', 'crowdsource', 'basic'];
  const files = ['index.html', 'archive/index.html', 'viewers/archive-root.html',
    ...slugs.map(slug => 'archive/2017-12-10-pages/en__app-list__' + slug + '.html')];
  const retired = ['2c62acf3468c4cbbba6b82f1035bfe22', '5afdbed13fad458cb6288c46a0bad060', 'd6635d5602b04c05a445058f53da5cb5', 'ef703d9454bb4e4e8a9c1b086b5b66b5', 'c7ad1a55de0247a68454a76f251225a4', 'a0a12caf5025441497d49d35b01a07f8', '716b6277db404a5aaf2406f7bb444295', 'f2e8448fef064238ace4f324ffc16fde'];
  for (const file of files) {
    const html = readFileSync(path.join(publish, file), 'utf8');
    for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
      assert.ok(!retired.some(id => match[1].includes(id)), file + ': stale example ' + match[1]);
    }
  }
  for (const file of files.slice(0, 3)) {
    const html = readFileSync(path.join(publish, file), 'utf8');
    const blocks = [...html.matchAll(/<div class="app-text">([\s\S]*?)<\/div>/g)].map(match => match[1]);
    for (const [label, id] of [['Tabbed Layout', '6aab740eb5f146d0bbc073185aa726cb'], ['Side Accordion Layout', '77245a2c7bb540878fd3b24ebd048b20'], ['Story Map Spyglass', '97ae55e015774b7ea89fd0a52ca551c2']]) {
      const block = blocks.find(content => content.includes(label));
      assert.ok(block?.includes('appid=' + id), file + ': ' + label);
    }
  }
});

test('archive overview examples do not depend on the inactive custom domain', () => {
  const slugs = ['map-tour', 'map-journal', 'map-series', 'cascade', 'shortlist', 'swipe-spyglass', 'crowdsource', 'basic'];
  for (const slug of slugs) {
    const html = readFileSync(path.join(publish, 'archive/2017-12-10-pages/en__app-list__' + slug + '.html'), 'utf8');
    assert.doesNotMatch(html, /href="https?:\/\/(?:www\.)?classicstorymaps\.com\/viewers\//i, slug);
  }
});

test('catalog has a return button pointing to the archive under the deployment prefix', () => {
  const html = readFileSync(path.join(publish, 'viewers/index.html'), 'utf8');
  const link = html.match(/<a\b[^>]*class="[^"]*\barchive-return\b[^>]*href="([^"]+)"[^>]*>\s*Back to Archive\s*<\/a>/);
  assert.ok(link, 'Catalog includes a Back to Archive button-styled link');
  assert.equal(link[1], base + '/archive/');
});

test('catalog supports all eight runtimes with working launcher routes', () => {
  const context = vm.createContext({ window: { location: { pathname: base + '/viewers/' } } });
  vm.runInContext(readFileSync(path.join(publish, 'viewers/assets/js/classic-storymaps-config.js'), 'utf8'), context);
  const apps = context.window.ClassicStoryMapsConfig.catalogApps;
  assert.equal(apps.length, runtimes.length);
  for (const app of apps) {
    assert.equal(app.state, 'supported', app.runtime);
    assert.equal(app.action, 'Open Launcher', app.runtime);
    assert.equal(app.launchRoute, app.runtime + '-launcher.html');
    assert.ok(existsSync(path.join(publish, 'viewers', app.launchRoute)));
    assert.doesNotMatch(app.description, /in progress/i);
  }
});

test('catalog cards omit support badges and retain all launcher links', () => {
  const context = vm.createContext({ window: { location: { pathname: base + '/viewers/' } }, grid: {} });
  vm.runInContext(readFileSync(path.join(publish, 'viewers/assets/js/classic-storymaps-config.js'), 'utf8'), context);
  const html = readFileSync(path.join(publish, 'viewers/index.html'), 'utf8');
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  vm.runInContext(script.slice(script.indexOf('    const SUPPORT_STATE'), script.indexOf('    const grid')), context);
  vm.runInContext(script.slice(script.indexOf('    function getActionMarkup')), context);
  assert.equal((context.grid.innerHTML.match(/<article\b/g) || []).length, runtimes.length);
  assert.doesNotMatch(context.grid.innerHTML, /class="(?:badge|row)\b|In Progress|>Supported</);
  assert.equal((context.grid.innerHTML.match(/class="link-btn"/g) || []).length, runtimes.length);
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
