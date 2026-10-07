import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const base = (process.env.SITE_BASE_PATH || '').replace(/\/$/, '');
if (!/^(\/[A-Za-z0-9._~-]+)*$/.test(base) || base.split('/').some((part) => part === '.' || part === '..')) {
  throw new Error('SITE_BASE_PATH must be empty or an absolute path without a trailing slash, query, or fragment');
}

function prefix(url) {
  if (!base || !url.startsWith('/') || url.startsWith('//') || url === base || url.startsWith(base + '/')) return url;
  return base + url;
}

function rewrite(file) {
  if (statSync(file).isDirectory()) {
    for (const entry of readdirSync(file)) rewrite(path.join(file, entry));
    return;
  }
  if (!/\.(html|css)$/.test(file)) return;
  const original = readFileSync(file, 'utf8');
  let updated = original.replaceAll('__SITE_BASE_PATH__', base);
  if (file.endsWith('.html')) {
    updated = updated.replace(/(\b(?:href|src|action|poster)\s*=\s*)(["'])(\/[^"']*)\2/gi,
      (match, attribute, quote, url) => attribute + quote + prefix(url) + quote);
  }
  updated = updated.replace(/(url\(\s*["']?)(\/(?!\/)[^\s)'";]+)(["']?\s*\))/gi,
    (match, before, url, after) => before + prefix(url) + after);
  if (updated !== original) writeFileSync(file, updated);
}

for (const file of process.argv.slice(2)) {
  if (file !== '--validate') rewrite(file);
}
