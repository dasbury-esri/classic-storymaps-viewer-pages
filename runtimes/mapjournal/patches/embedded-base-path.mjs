import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const output = process.argv[2];
if (!output) throw new Error('Expected a staged Map Journal directory');
const replacement = '(function(){var match=String(window.location.pathname||"").match(/^(.*\\/viewers)(?:\\/|$)/i);return match?match[1]:"/templates/classic-storymaps";}())';
const minifiedTarget = /"\/templates\/classic-storymaps"(?=,[\w$]+=String\(window\.location\.pathname\|\|""\)\.toLowerCase\(\))/g;
const sourceTarget = /'\/templates\/classic-storymaps'(?=;\s*var pathname = String\(window\.location\.pathname)/g;
const targets = [
  ['app/viewer-min.js', minifiedTarget],
  ['app/builder-min.js', minifiedTarget],
  ['app/storymaps/tpl/ui/MainStage.js', sourceTarget]
].filter(([filename]) => existsSync(path.join(output, filename)));
if (!targets.some(([filename]) => filename !== 'app/builder-min.js')) throw new Error('Map Journal viewer code is missing');
const changes = targets.map(([filename, target]) => {
  const file = path.join(output, filename);
  const original = readFileSync(file, 'utf8');
  if ([...original.matchAll(target)].length !== 1) throw new Error(file + ': embedded base must match exactly once');
  const patched = original.replace(target, replacement);
  new vm.Script(patched, { filename: file });
  return { file, patched };
});
for (const { file, patched } of changes) writeFileSync(file, patched);
