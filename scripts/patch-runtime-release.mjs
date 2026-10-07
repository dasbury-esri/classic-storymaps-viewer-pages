import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import path from 'node:path';

const [manifestPath, outputPath] = process.argv.slice(2);
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const changes = new Map();
for (const patch of manifest.patches || []) {
  const filename = path.join(outputPath, patch.file);
  const content = changes.get(filename) ?? readFileSync(filename, 'utf8');
  if (!patch.find || content.split(patch.find).length - 1 !== 1) {
    throw new Error(patch.name + ': patch target must occur exactly once in ' + patch.file);
  }
  changes.set(filename, content.replace(patch.find, () => patch.replace));
}
for (const [filename, content] of changes) writeFileSync(filename, content);
for (const filename of manifest.removeFiles || []) unlinkSync(path.join(outputPath, filename));
