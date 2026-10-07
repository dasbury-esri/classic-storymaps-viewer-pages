import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const repo = fileURLToPath(new URL('../../', import.meta.url));

test('Crowdsource release patches are exact, view-only, and published with one builder guard', () => {
  const manifestPath = path.join(repo, 'runtimes/crowdsource/runtime-manifest.json');
  assert.ok(existsSync(manifestPath), 'Crowdsource must declare its verified release and patches');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const temporary = mkdtempSync(path.join(os.tmpdir(), 'classic-crowdsource-release-'));
  const output = path.join(temporary, 'runtimes/crowdsource/build');
  try {
    const build = spawnSync('bash', ['scripts/build-crowdsource-runtime.sh'], {
      cwd: repo, env: { ...process.env, OUTPUT_PATH: output }, encoding: 'utf8'
    });
    assert.equal(build.status, 0, build.stdout + build.stderr);
    for (const patch of manifest.patches) {
      const content = readFileSync(path.join(output, patch.file), 'utf8');
      assert.equal(content.split(patch.find).length - 1, 0, patch.name + ': original removed');
      assert.equal(content.split(patch.replace).length - 1, 1, patch.name + ': replacement occurs once');
    }
    for (const filename of manifest.removeFiles) assert.equal(existsSync(path.join(output, filename)), false);
    assert.equal(readFileSync(path.join(output, 'BUILD_SOURCE'), 'utf8').trim(), 'release:0.10.0');
    const repeat = spawnSync('node', ['scripts/patch-runtime-release.mjs', manifestPath, output], { cwd: repo, encoding: 'utf8' });
    assert.notEqual(repeat.status, 0, 'Missing original targets must stop the patch step');
    assert.match(repeat.stderr, /exactly once/);
    for (const runtime of ['maptour', 'swipe', 'mapjournal', 'mapseries', 'cascade', 'shortlist', 'basic']) {
      const buildPath = path.join(temporary, 'runtimes', runtime, 'build');
      mkdirSync(buildPath, { recursive: true });
      writeFileSync(path.join(buildPath, 'index.html'), '<!doctype html>\n<html>\n<head>\n</head><body></body></html>');
    }
    const publish = spawnSync('bash', [path.join(repo, 'scripts/build-classic-storymaps-runtime-publish.sh')], {
      cwd: temporary, env: { ...process.env, PUBLISH_ROOT: path.join(temporary, 'publish/viewers') }, encoding: 'utf8'
    });
    assert.equal(publish.status, 0, publish.stdout + publish.stderr);
    const html = readFileSync(path.join(temporary, 'publish/viewers/crowdsource/index.html'), 'utf8');
    assert.equal(html.split('classicstorymaps-builder-guard').length - 1, 1);
    assert.doesNotMatch(html, /<%/);
    for (const filename of manifest.removeFiles) assert.equal(existsSync(path.join(temporary, 'publish/viewers/crowdsource', filename)), false);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});
