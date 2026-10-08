import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const { chromium } = await import(pathToFileURL(path.join(process.env.PLAYWRIGHT_NODE_MODULES, 'playwright/index.mjs')).href);
const root = path.resolve(process.env.PUBLISH_CHECK_ROOT || 'publish');
const output = path.resolve(process.argv[2] || '/tmp/classic-archive-link-audit');
const origin = 'https://dasbury-esri.github.io';
const base = '/classic-storymaps-viewer-pages';
const browser = await chromium.launch();
const parser = await browser.newPage();
const links = [];
const pages = [];
const results = [];
const cache = new Map();
await mkdir(output, { recursive: true });

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory()
    ? htmlFiles(path.join(directory, entry.name))
    : entry.name.endsWith('.html') ? [path.join(directory, entry.name)] : []))).flat();
}

async function retrieve(url) {
  const redirects = [];
  let current = url;
  try {
    for (let hop = 0; hop < 10; hop += 1) {
      const response = await fetch(current, { redirect: 'manual', signal: AbortSignal.timeout(15000) });
      const location = response.headers.get('location');
      if (response.status >= 300 && response.status < 400 && location) {
        await response.body?.cancel();
        const next = new URL(location, current).href;
        redirects.push({ from: current, status: response.status, to: next });
        current = next;
        continue;
      }
      const contentType = response.headers.get('content-type') || '';
      let html = '';
      if (/html|text\/plain/i.test(contentType) && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let bytes = 0;
        while (bytes < 1500000) {
          const chunk = await reader.read();
          if (chunk.done) break;
          bytes += chunk.value.length;
          html += decoder.decode(chunk.value, { stream: true });
        }
        await reader.cancel();
      } else await response.body?.cancel();
      return { requested: url, final: current, status: response.status, contentType, redirects, html };
    }
    return { requested: url, final: current, redirects, error: 'Redirect limit exceeded' };
  } catch (error) {
    return { requested: url, final: current, redirects, error: error.cause?.code || error.message };
  }
}

async function documentInfo(html) {
  return parser.evaluate(html => {
    const document = new DOMParser().parseFromString(html, 'text/html');
    document.querySelectorAll('script,style,noscript').forEach(element => element.remove());
    return {
      title: document.title.trim(),
      headings: [...document.querySelectorAll('h1,h2')].map(element => element.textContent.trim()).slice(0, 8),
      text: document.body?.textContent.replace(/\s+/g, ' ').trim().slice(0, 7000),
      ids: [...document.querySelectorAll('[id],a[name]')].map(element => element.id || element.getAttribute('name')),
      anchors: [...document.querySelectorAll('a[href],area[href]')].map(anchor => ({
        href: anchor.getAttribute('href'),
        label: (anchor.textContent || anchor.getAttribute('aria-label') || anchor.querySelector('img')?.alt || '').replace(/\s+/g, ' ').trim(),
        context: anchor.closest('.app-text,section,header,footer')?.querySelector('h1,h2,h3,h4')?.textContent.trim(),
      })),
    };
  }, html);
}

try {
  const files = [...await htmlFiles(path.join(root, 'archive')), path.join(root, 'index.html'), path.join(root, 'viewers/archive-root.html')].sort();
  for (const file of files) {
    const relative = path.relative(root, file);
    const url = origin + base + '/' + relative;
    const live = await retrieve(url);
    cache.set(url, live);
    const sources = [{ variant: 'local', html: await readFile(file, 'utf8') }];
    if (live.status === 200) sources.push({ variant: 'production', html: live.html });
    pages.push({ file: relative, url, productionStatus: live.status, error: live.error });
    for (const source of sources) {
      const info = await documentInfo(source.html);
      for (const anchor of info.anchors) {
        let resolved;
        try { resolved = new URL(anchor.href, url).href; } catch {}
        links.push({ page: relative, variant: source.variant, ...anchor, url: resolved,
          placeholder: !anchor.href || anchor.href === '#' || /^javascript:/i.test(anchor.href),
          missingSamePageFragment: anchor.href.startsWith('#') && anchor.href.length > 1 && !info.ids.includes(decodeURIComponent(anchor.href.slice(1))),
        });
      }
    }
  }
  await writeFile(path.join(output, 'inventory.json'), JSON.stringify({ pages, links }, null, 2) + '\n');
  const targets = [...new Set(links.filter(link => !link.placeholder && /^https?:/.test(link.url)).map(link => { const url = new URL(link.url); url.hash = ''; return url.href; }))];
  console.log(JSON.stringify({ pages: pages.length, links: links.length, targets: targets.length, output }));
  let next = 0;
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (next < targets.length) {
      const url = targets[next++];
      const response = cache.get(url) || await retrieve(url);
      const info = await documentInfo(response.html || '');
      const { html, ...network } = response;
      const flags = [];
      if (network.error) flags.push('network-error');
      if (network.status >= 400) flags.push([401, 403, 429].includes(network.status) ? 'access-or-bot-block' : 'http-error');
      if (/page not found|404 not found|page (?:you requested|cannot be found)|access denied|just a moment|pardon our interruption/i.test([info.title, ...info.headings].join(' '))) flags.push('error-or-challenge-page');
      const destination = new URL(network.final);
      if (network.redirects.length && /^(?:\/(?:en-us|en|en-us\/arcgis\/products\/arcgis-storymaps)?\/?|\/en-us\/arcgis\/products\/arcgis-storymaps\/overview)$/.test(destination.pathname) && new URL(url).pathname !== destination.pathname) flags.push('generic-landing-redirect');
      results.push({ ...network, title: info.title, headings: info.headings, text: info.text, ids: info.ids, flags });
      if (flags.length) console.log(JSON.stringify({ url, status: network.status, final: network.final, title: info.title, flags, error: network.error }));
    }
  }));
  results.sort((first, second) => first.requested.localeCompare(second.requested));
  await writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2) + '\n');
  console.log(JSON.stringify({ completed: results.length, flagged: results.filter(result => result.flags.length).length, placeholders: links.filter(link => link.placeholder).length, missingSamePageFragments: links.filter(link => link.missingSamePageFragment).length }));
} finally {
  await browser.close();
}
