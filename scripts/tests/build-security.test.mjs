import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const repo = fileURLToPath(new URL('../../', import.meta.url));
const workflow = readFileSync(path.join(repo, '.github/workflows/deploy-classic-storymaps-pages.yml'), 'utf8');

test('workflow tests branches and confines deployment permissions to main deploys', () => {
  const build = workflow.slice(workflow.indexOf('  build:'), workflow.indexOf('  deploy:'));
  const deploy = workflow.slice(workflow.indexOf('  deploy:'));
  const header = workflow.slice(0, workflow.indexOf('jobs:'));
  assert.doesNotMatch(header, /pages: write|id-token: write/);
  assert.match(build, /permissions:\n      contents: read/);
  assert.doesNotMatch(build, /pages: write|id-token: write/);
  assert.match(deploy, /if: github\.ref == 'refs\/heads\/main'/);
  assert.match(deploy, /pages: write/);
  assert.match(deploy, /id-token: write/);
  assert.match(header, /cancel-in-progress: false/);
  assert.match(header, /branches:\n      - ['"]\*\*['"]/);
});

test('workflow actions are immutable release pins', () => {
  const actions = Array.from(workflow.matchAll(/uses:\s+(\S+)/g), (match) => match[1]);
  assert.ok(actions.length >= 3);
  for (const action of actions) assert.match(action, /^actions\/[a-z-]+@[a-f0-9]{40}$/);
  assert.match(workflow, /node-version: ['"]?24/);
});

test('all npm runtime installs disable lifecycle scripts', () => {
  for (const runtime of ['maptour', 'swipe', 'mapjournal', 'mapseries', 'cascade', 'shortlist', 'crowdsource']) {
    const script = readFileSync(path.join(repo, 'scripts/build-' + runtime + '-runtime.sh'), 'utf8');
    const installs = script.split('\n').filter((line) => /\bnpm (?:ci|install)\b/.test(line));
    if (runtime === 'crowdsource') assert.equal(installs.length, 0, 'Crowdsource uses only the verified release');
    else assert.ok(installs.length > 0);
    for (const install of installs) assert.ok(install.includes('--ignore-scripts'), runtime + ': ' + install.trim());
  }
});

test('publish output is untracked and ignored', () => {
  const tracked = spawnSync('git', ['ls-files', '-z', '--', 'publish/'], { cwd: repo, encoding: 'utf8' });
  assert.equal(tracked.status, 0, tracked.stderr);
  assert.equal(tracked.stdout.length, 0, 'Generated publish files must not be tracked');
  const ignored = spawnSync('git', ['check-ignore', '--no-index', 'publish/index.html'], { cwd: repo, encoding: 'utf8' });
  assert.equal(ignored.status, 0, 'Generated publish files must be ignored');
});
