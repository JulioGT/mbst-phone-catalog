/**
 * Tests for the architecture rules in .dependency-cruiser.cjs.
 *
 * A rule nobody has seen fail is a rule nobody can trust. Each fixture project
 * below is cruised with the real config:
 *   - `clean/`      follows the hexagonal rules and must produce zero violations.
 *   - `violating/`  breaks every rule exactly once; we assert that each rule fires
 *                   on exactly the files we expect (no more, no less).
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../..');
const depcruiseBin = path.join(
  repoRoot,
  'node_modules/dependency-cruiser/bin/dependency-cruise.mjs',
);
const configPath = path.join(repoRoot, '.dependency-cruiser.cjs');

/** Runs dependency-cruiser inside a fixture project and returns violations grouped by rule. */
function cruise(fixtureName) {
  const cwd = path.join(here, 'fixtures', fixtureName);
  const result = spawnSync(
    process.execPath,
    [depcruiseBin, 'apps', 'packages', '--config', configPath, '--output-type', 'json'],
    { cwd, encoding: 'utf8' },
  );
  assert.ok(result.stdout, `dependency-cruiser produced no output: ${result.stderr}`);
  const report = JSON.parse(result.stdout);
  const byRule = new Map();
  for (const violation of report.summary.violations) {
    // A cycle is reported once; every module taking part in it is at fault.
    const culprits = violation.cycle ? violation.cycle.map((step) => step.name) : [violation.from];
    const files = byRule.get(violation.rule.name) ?? new Set();
    for (const file of culprits) files.add(file);
    byRule.set(violation.rule.name, files);
  }
  return Object.fromEntries(
    [...byRule.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([rule, files]) => [rule, [...files].sort()]),
  );
}

describe('architecture rules', () => {
  it('accept a project that follows the hexagonal layering', () => {
    assert.deepEqual(cruise('clean'), {});
  });

  it('reject every kind of layering violation, and only those', () => {
    assert.deepEqual(cruise('violating'), {
      'apps-are-isolated': ['apps/bff/src/cross.ts'],
      'application-not-to-outer-layers': [
        'apps/bff/src/application/imports-infrastructure.ts',
        'apps/web/src/application/imports-ui.ts',
      ],
      'bff-application-has-no-packages': ['apps/bff/src/application/uses-package.ts'],
      'contracts-are-standalone': ['packages/contracts/src/uses-app.ts'],
      'domain-is-pure': [
        'apps/bff/src/domain/leaks-to-application.ts',
        'apps/bff/src/domain/uses-core-module.ts',
      ],
      'infrastructure-not-to-ui': ['apps/web/src/infrastructure/imports-ui.ts'],
      'no-circular': ['apps/web/src/ui/cycle-a.ts', 'apps/web/src/ui/cycle-b.ts'],
      'ui-not-to-infrastructure': ['apps/web/src/ui/imports-infrastructure.ts'],
      'web-not-to-bff': ['apps/web/src/cross.ts'],
    });
  });
});
