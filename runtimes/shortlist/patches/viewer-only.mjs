import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const output = process.argv[2];
if (!output) throw new Error('Expected a staged Shortlist directory');
const file = path.join(output, 'app/viewer-min.js');
const original = readFileSync(file, 'utf8');
const exports = [...original.matchAll(/hasSwitchBuilderButton:([\w$]+)/g)];
if (exports.length !== 1) throw new Error('Shortlist edit eligibility export must match exactly once');
const name = exports[0][1];
const gate = new RegExp('function ' + name.replace(/\$/g, '\\$') + '\\(\\)\\{(?=[^{}]*app\\.userCanEdit)[^{}]*\\}', 'g');
const transition = /switchToBuilder:function\(\)\{[^{}]*\}(?=,isArcGISHosted:)/g;
if ([...original.matchAll(gate)].length !== 1 || [...original.matchAll(transition)].length !== 1) {
  throw new Error('Shortlist viewer-only targets must match exactly once');
}
const patched = original.replace(gate, 'function ' + name + '(){return false;}')
  .replace(transition, 'switchToBuilder:function(){return false;}');
new vm.Script(patched, { filename: file });
writeFileSync(file, patched);
