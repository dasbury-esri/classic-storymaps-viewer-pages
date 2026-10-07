import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { lstatSync, mkdtempSync, readFileSync, readlinkSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function git(directory, args) {
  return execFileSync('git', args, { cwd: directory, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
}

function fileIdentity(filename) {
  let stat;
  try {
    stat = lstatSync(filename);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
  const mode = stat.isSymbolicLink() ? '120000' : stat.isFile() ? (stat.mode & 0o111 ? '100755' : '100644') : 'directory';
  if (mode === 'directory') return { mode, hash: null };
  const content = stat.isSymbolicLink() ? readlinkSync(filename, { encoding: 'buffer' }) : readFileSync(filename);
  const hash = createHash('sha1').update('blob ' + content.length + '\0').update(content).digest('hex');
  return { mode, hash };
}

export function verifyRuntime(repoRoot, runtime, { sourceRepository } = {}) {
  if (!/^[a-z0-9-]+$/.test(runtime)) throw new Error('Invalid runtime name: ' + runtime);
  const root = path.resolve(repoRoot);
  const prefix = 'runtimes/' + runtime + '/upstream/';
  const manifest = JSON.parse(readFileSync(path.join(root, 'runtimes', runtime, 'runtime-manifest.json'), 'utf8'));
  const { owner, repo, ref } = manifest.upstream;
  if (!/^[a-f0-9]{40}$/i.test(ref)) throw new Error('Runtime must have a pinned commit SHA: ' + runtime);
  if (!/^[a-z0-9_.-]+$/i.test(owner) || !/^[a-z0-9_.-]+$/i.test(repo)) throw new Error('Invalid GitHub source repository');
  const temporary = mkdtempSync(path.join(os.tmpdir(), 'classic-runtime-repro-'));
  try {
    git(temporary, ['init', '--quiet']);
    git(temporary, ['fetch', '--quiet', '--depth=1', sourceRepository || 'https://github.com/' + owner + '/' + repo + '.git', ref]);
    git(temporary, ['-c', 'advice.detachedHead=false', 'checkout', '--quiet', '--detach', 'FETCH_HEAD']);
    const actualRef = git(temporary, ['rev-parse', 'HEAD']).trim();
    if (actualRef !== ref.toLowerCase()) throw new Error('Fetched commit does not match manifest');
    const result = { runtime, ref: actualRef, matches: false, patchesApplied: [], patchFailures: [], differences: [] };
    for (const patchFile of manifest.patches.files) {
      const absolutePatch = path.resolve(root, patchFile);
      if (!absolutePatch.startsWith(path.join(root, 'runtimes', runtime, 'patches') + path.sep)) throw new Error('Patch is outside the runtime patch directory');
      try {
        git(temporary, ['apply', '--index', '-p4', absolutePatch]);
        result.patchesApplied.push(patchFile);
      } catch (error) {
        result.patchFailures.push({ patch: patchFile, error: String(error.stderr || error.message).trim().replaceAll(absolutePatch, patchFile) });
      }
    }
    const expected = new Map(git(temporary, ['ls-files', '--stage', '-z']).split('\0').filter(Boolean).map(entry => {
      const separator = entry.indexOf('\t');
      const [mode, hash] = entry.slice(0, separator).split(' ');
      if (mode === '160000') throw new Error('Git submodules require an explicit import policy');
      return [entry.slice(separator + 1), { mode, hash }];
    }));
    const actualPaths = git(root, ['ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', prefix]).split('\0').filter(Boolean).map(filename => filename.slice(prefix.length));
    for (const filename of [...new Set([...expected.keys(), ...actualPaths])].sort()) {
      const wanted = expected.get(filename);
      const actual = fileIdentity(path.join(root, prefix, filename));
      if (!wanted && !actual) continue;
      const kind = !wanted ? 'unexpected' : !actual ? 'missing' : wanted.mode !== actual.mode || wanted.hash !== actual.hash ? 'modified' : null;
      if (kind) result.differences.push({ path: filename, kind });
    }
    result.matches = result.patchFailures.length === 0 && result.differences.length === 0;
    return result;
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const runtimes = process.argv.slice(2);
  const results = [];
  for (const runtime of runtimes.length ? runtimes : ['maptour', 'swipe', 'mapjournal']) {
    try {
      const result = verifyRuntime(root, runtime);
      results.push(result);
      if (!result.matches) process.exitCode = 1;
    } catch (error) {
      results.push({ runtime, error: String(error.stderr || error.message).trim().replaceAll(root + path.sep, '') });
      process.exitCode = 1;
    }
  }
  console.log(JSON.stringify(results, null, 2));
}
