import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import path from 'node:path';

const [manifestPath, outputPath, sourceIndex] = process.argv.slice(2);
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const patches = [...(manifest.patches || [])];
if (sourceIndex) {
  const source = readFileSync(sourceIndex, 'utf8');
  for (const setting of [
    { name: 'appid', expression: /\bappid:\s*("(?:\\.|[^"\\])*")/g, original: 'appid: ""' },
    { name: 'authorizedOwners', expression: /\bauthorizedOwners:\s*(\[[^\]]*\])/g, original: 'authorizedOwners: [""]' }
  ]) {
    const matches = Array.from(source.matchAll(setting.expression));
    if (matches.length !== 1) throw new Error(setting.name + ': source setting must occur exactly once');
    const value = JSON.parse(matches[0][1]);
    if (setting.name === 'appid' ? typeof value !== 'string' : !Array.isArray(value) || !value.every(owner => typeof owner === 'string')) {
      throw new Error(setting.name + ': invalid source setting');
    }
    patches.push({ name: setting.name, file: 'index.html', find: setting.original, replace: setting.name + ': ' + JSON.stringify(value) });
  }
}
const changes = new Map();
for (const patch of patches) {
  const filename = path.join(outputPath, patch.file);
  const content = changes.get(filename) ?? readFileSync(filename, 'utf8');
  if (!patch.find || content.split(patch.find).length - 1 !== 1) {
    throw new Error(patch.name + ': patch target must occur exactly once in ' + patch.file);
  }
  changes.set(filename, content.replace(patch.find, () => patch.replace));
}
for (const [filename, content] of changes) writeFileSync(filename, content);
for (const filename of manifest.removeFiles || []) unlinkSync(path.join(outputPath, filename));
