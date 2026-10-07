import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import test from 'node:test';
import vm from 'node:vm';

const repo = fileURLToPath(new URL('../../', import.meta.url));

test('official release helper rejects a wrong checksum before staging files', () => {
  const temporary = mkdtempSync(path.join(os.tmpdir(), 'classic-release-checksum-'));
  try {
    const archive = path.join(temporary, 'release.zip');
    writeFileSync(archive, 'corrupt release');
    const manifest = path.join(temporary, 'manifest.json');
    writeFileSync(manifest, JSON.stringify({ release: { url: pathToFileURL(archive).href, sha256: '0'.repeat(64), version: 'test' } }));
    const output = path.join(temporary, 'build');
    const result = spawnSync('bash', ['-c', 'source "$1"; stage_official_release "$2" "$3"', '--', path.join(repo, 'scripts/lib/stage-official-release.sh'), manifest, output], { encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stdout + result.stderr, /FAILED|did not match/);
    assert.equal(existsSync(path.join(output, 'index.html')), false);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});

for (const runtime of ['cascade', 'shortlist', 'mapseries']) {
  test(runtime + ' forced release preserves source configuration and records provenance', () => {
    const manifest = JSON.parse(readFileSync(path.join(repo, 'runtimes', runtime, 'runtime-manifest.json'), 'utf8'));
    assert.ok(manifest.release, 'Release provenance is required');
    const temporary = mkdtempSync(path.join(os.tmpdir(), 'classic-forced-release-'));
    try {
      const output = path.join(temporary, 'build');
      const result = spawnSync('bash', ['scripts/build-' + runtime + '-runtime.sh'], {
        cwd: repo, encoding: 'utf8', env: { ...process.env, CLASSIC_RUNTIME_SOURCE: 'release', OUTPUT_PATH: output }
      });
      assert.equal(result.status, 0, result.stdout + result.stderr);
      assert.equal(readFileSync(path.join(output, 'BUILD_SOURCE'), 'utf8').trim(), 'release:' + manifest.release.version);
      for (const filename of ['index.html', 'app/viewer-min.js', 'app/main-config.js']) assert.ok(existsSync(path.join(output, filename)));
      assert.equal(existsSync(path.join(output, '__MACOSX')), false);
      const source = readFileSync(path.join(repo, 'runtimes', runtime, 'upstream/src/index.html'), 'utf8');
      const html = readFileSync(path.join(output, 'index.html'), 'utf8');
      for (const expression of [/\bappid:\s*("[^"]*")/, /\bauthorizedOwners:\s*(\[[^\]]*\])/]) {
        assert.deepEqual(JSON.parse(html.match(expression)[1]), JSON.parse(source.match(expression)[1]));
      }
      const bundle = readFileSync(path.join(output, 'app/viewer-min.js'), 'utf8');
      const start = bundle.indexOf('getAppID:function');
      const end = bundle.indexOf('},get', start);
      assert.ok(start >= 0 && end > start);
      const defaultId = JSON.parse(source.match(/\bappid:\s*("[^"]*")/)[1]);
      const context = vm.createContext({ app: { indexCfg: { appid: defaultId, authorizedOwners: ['*'] } } });
      const getAppID = vm.runInContext('(' + bundle.slice(start + 'getAppID:'.length, end + 1) + ')', context);
      const selectedId = 'ABCDEF0123456789abcdef0123456789';
      for (const candidate of [selectedId, undefined, '', 'bad-id', 'a'.repeat(31), 'g'.repeat(32)]) {
        const selected = getAppID.call({ getUrlParams: () => ({ appid: candidate }), isArcGISHosted: () => false }, true);
        assert.equal(selected, candidate === selectedId ? selectedId : defaultId, runtime + ': URL/default ID precedence');
      }
      for (const patch of manifest.patches || []) {
        assert.equal(bundle.split(patch.find).length - 1, 0);
        assert.equal(bundle.split(patch.replace).length - 1, 1);
      }
    } finally {
      rmSync(temporary, { recursive: true, force: true });
    }
  });

  test(runtime + ' fails when Grunt and the verified release both fail', () => {
    const temporary = mkdtempSync(path.join(os.tmpdir(), 'classic-release-failure-'));
    try {
      const upstream = path.join(temporary, 'upstream');
      mkdirSync(path.join(upstream, 'src'), { recursive: true });
      writeFileSync(path.join(upstream, 'src/index.html'), '<html>raw source</html>');
      const commands = path.join(temporary, 'bin');
      mkdirSync(commands);
      writeFileSync(path.join(commands, 'npm'), '#!/bin/sh\nexit 1\n', { mode: 0o755 });
      const archive = path.join(temporary, 'bad.zip');
      writeFileSync(archive, 'corrupt release');
      const manifest = path.join(temporary, 'manifest.json');
      writeFileSync(manifest, JSON.stringify({ release: { url: pathToFileURL(archive).href, sha256: '0'.repeat(64), version: 'test' } }));
      const result = spawnSync('bash', ['scripts/build-' + runtime + '-runtime.sh'], {
        cwd: repo, encoding: 'utf8', env: { ...process.env, CLASSIC_RUNTIME_SOURCE: 'auto', RUNTIME_PATH: upstream, OUTPUT_PATH: path.join(temporary, 'build'), MANIFEST_PATH: manifest, PATH: commands + path.delimiter + process.env.PATH }
      });
      assert.notEqual(result.status, 0, runtime + ' must not succeed with raw source or cached history');
      assert.match(result.stdout + result.stderr, /FAILED|did not match/);
    } finally {
      rmSync(temporary, { recursive: true, force: true });
    }
  });
}

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
