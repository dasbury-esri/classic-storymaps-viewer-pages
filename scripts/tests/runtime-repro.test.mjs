import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const checkerUrl = new URL('../check-runtime-reproducibility.mjs', import.meta.url);

function fixture(context) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'runtime-repro-test-'));
  context.after(() => rmSync(root, { recursive: true, force: true }));
  const source = path.join(root, 'source');
  const repo = path.join(root, 'repo');
  const upstream = path.join(repo, 'runtimes/demo/upstream');
  const patches = path.join(repo, 'runtimes/demo/patches');
  for (const directory of [path.join(source, 'App'), path.join(upstream, 'App'), patches]) mkdirSync(directory, { recursive: true });
  for (const directory of [source, upstream]) {
    writeFileSync(path.join(directory, '.gitignore'), 'node_modules/\n');
    writeFileSync(path.join(directory, 'App/source.txt'), 'original\n');
    writeFileSync(path.join(directory, 'App/keep.txt'), 'keep\n');
    writeFileSync(path.join(directory, 'App/run.sh'), 'echo fixture\n');
  }
  execFileSync('git', ['init', '--quiet', source]);
  execFileSync('git', ['add', '.'], { cwd: source });
  execFileSync('git', ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', '-c', 'commit.gpgsign=false', 'commit', '--quiet', '-m', 'fixture'], { cwd: source });
  const ref = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: source, encoding: 'utf8' }).trim();
  const patchFiles = ['runtimes/demo/patches/0001.patch', 'runtimes/demo/patches/0002.patch'];
  for (const [index, oldValue, newValue] of [[0, 'original', 'first'], [1, 'first', 'second']]) {
    writeFileSync(path.join(repo, patchFiles[index]), 'diff --git a/runtimes/demo/upstream/App/source.txt b/runtimes/demo/upstream/App/source.txt\n--- a/runtimes/demo/upstream/App/source.txt\n+++ b/runtimes/demo/upstream/App/source.txt\n@@ -1 +1 @@\n-' + oldValue + '\n+' + newValue + '\n');
  }
  writeFileSync(path.join(upstream, 'App/source.txt'), 'second\n');
  const manifest = { appId: 'demo', upstream: { owner: 'fixture', repo: 'source', refType: 'commit', ref, sourceSubpath: 'App' }, patches: { files: patchFiles } };
  writeFileSync(path.join(repo, 'runtimes/demo/runtime-manifest.json'), JSON.stringify(manifest));
  execFileSync('git', ['init', '--quiet', repo]);
  execFileSync('git', ['add', '.'], { cwd: repo });
  mkdirSync(path.join(upstream, 'node_modules'), { recursive: true });
  writeFileSync(path.join(upstream, 'node_modules/local-cache'), 'ignored');
  return { repo, source, upstream, patchFiles, manifest };
}

test('reconstructs the pinned full repository and applies patches in manifest order', async (context) => {
  const { verifyRuntime } = await import(checkerUrl);
  const sample = fixture(context);
  const result = verifyRuntime(sample.repo, 'demo', { sourceRepository: sample.source });
  assert.equal(result.matches, true);
  assert.equal(result.ref, sample.manifest.upstream.ref);
  assert.deepEqual(result.patchFailures, []);
  assert.deepEqual(result.differences, []);
  assert.deepEqual(result.patchesApplied, sample.patchFiles);
  assert.equal(readFileSync(path.join(sample.upstream, 'App/source.txt'), 'utf8'), 'second\n');
});

test('lists modified, missing, additional, and executable-mode differences without changing source', async (context) => {
  const { verifyRuntime } = await import(checkerUrl);
  const sample = fixture(context);
  writeFileSync(path.join(sample.upstream, 'App/source.txt'), 'unrecorded change\n');
  rmSync(path.join(sample.upstream, 'App/keep.txt'));
  writeFileSync(path.join(sample.upstream, 'App/extra.txt'), 'extra\n');
  chmodSync(path.join(sample.upstream, 'App/run.sh'), 0o755);
  const result = verifyRuntime(sample.repo, 'demo', { sourceRepository: sample.source });
  assert.equal(result.matches, false);
  assert.deepEqual(result.differences.map(({ path: file, kind }) => [file, kind]), [
    ['App/extra.txt', 'unexpected'], ['App/keep.txt', 'missing'], ['App/run.sh', 'modified'], ['App/source.txt', 'modified']
  ]);
  assert.equal(readFileSync(path.join(sample.upstream, 'App/source.txt'), 'utf8'), 'unrecorded change\n');
});

test('reports unreplayable patches and does not claim a successful reconstruction', async (context) => {
  const { verifyRuntime } = await import(checkerUrl);
  const sample = fixture(context);
  writeFileSync(path.join(sample.repo, sample.patchFiles[0]), 'not a patch\n');
  const result = verifyRuntime(sample.repo, 'demo', { sourceRepository: sample.source });
  assert.equal(result.matches, false);
  assert.ok(result.patchFailures.length > 0);
  assert.equal(result.patchFailures[0].patch, sample.patchFiles[0]);
  assert.ok(result.differences.some(entry => entry.path === 'App/source.txt'));
});
