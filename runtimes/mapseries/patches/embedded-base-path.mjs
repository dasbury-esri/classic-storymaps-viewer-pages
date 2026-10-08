import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const output = process.argv[2];
if (!output) throw new Error('Expected a staged Map Series directory');
const source = readFileSync(path.join(output, 'BUILD_SOURCE'), 'utf8').trim();
if (!source.startsWith('release:')) {
  if (source !== 'grunt') throw new Error('Unknown Map Series build source');
  const target = /"\/templates\/classic-storymaps"(?=,[\w$]+=String\(window\.location\.pathname\|\|""\)\.toLowerCase\(\))/g;
  const replacement = '(function(){var match=String(window.location.pathname||"").match(/^(.*\\/viewers)(?:\\/|$)/i);return match?match[1]:"/templates/classic-storymaps";}())';
  const bundles = ['viewer-min.js', 'builder-min.js']
    .filter(filename => filename === 'viewer-min.js' || existsSync(path.join(output, 'app', filename)))
    .map(filename => {
      const file = path.join(output, 'app', filename);
      const original = readFileSync(file, 'utf8');
      if ([...original.matchAll(target)].length !== 1) throw new Error(file + ': embedded base must match exactly once');
      const patched = original.replace(target, replacement);
      new vm.Script(patched, { filename: file });
      return { file, patched };
    });
  for (const { file, patched } of bundles) writeFileSync(file, patched);
}
