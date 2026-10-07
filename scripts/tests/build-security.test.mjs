import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
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
    assert.ok(installs.length > 0);
    for (const install of installs) assert.ok(install.includes('--ignore-scripts'), runtime + ': ' + install.trim());
  }
});

test('Cascade rejects altered fallback downloads before using them', () => {
  const temporary = mkdtempSync(path.join(os.tmpdir(), 'cascade-integrity-'));
  try {
    const curl = path.join(temporary, 'curl');
    writeFileSync(curl, '#!/bin/bash\nwhile [[ "$#" -gt 0 ]]; do\n  if [[ "$1" == "-o" ]]; then printf "altered asset" > "$2"; exit 0; fi\n  shift\ndone\nexit 1\n', { mode: 0o755 });
    const script = readFileSync(path.join(repo, 'scripts/build-cascade-runtime.sh'), 'utf8');
    const functions = script.slice(0, script.indexOf('\nrm -rf "$OUTPUT_PATH"'));
    const result = spawnSync('bash', ['-s', '--', path.join(temporary, 'output')], {
      cwd: repo,
      env: { ...process.env, PATH: temporary + path.delimiter + process.env.PATH },
      input: functions + '\nCASCADE_FALLBACK_CHECKSUMS="' + path.join(repo, 'runtimes/cascade/fallback-assets.sha256') + '"\nstage_fallback_lib_assets "$1"\n',
      encoding: 'utf8'
    });
    assert.notEqual(result.status, 0, 'Altered downloads must fail the build');
    assert.match(result.stdout + result.stderr, /FAILED|did not match/);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});
