import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('CI runs the Node test harness before building', () => {
  const workflow = readFileSync(
    new URL('../../.github/workflows/deploy-classic-storymaps-pages.yml', import.meta.url),
    'utf8'
  );
  const testStep = workflow.indexOf('run: node --test scripts/tests/');
  const buildStep = workflow.indexOf('- name: Build runtimes, landing, and publish output');

  assert.ok(testStep >= 0, 'CI must run the Node test harness');
  assert.ok(buildStep > testStep, 'Tests must run before the build');
});
