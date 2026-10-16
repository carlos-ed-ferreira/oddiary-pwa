import { afterEach, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const folders: string[] = [];
afterEach(() =>
  folders
    .splice(0)
    .forEach((path) => rmSync(path, { recursive: true, force: true })),
);

function publish(scenario: Record<string, unknown> = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'oddiary-publish-test-'));
  folders.push(dir);
  writeFileSync(join(dir, 'scenario.json'), JSON.stringify(scenario));
  writeFileSync(join(dir, 'calls.jsonl'), '');
  const stub = resolve('tests/frontend/publish/command-stub.mjs');
  for (const name of ['git', 'gh', 'make', 'docker']) {
    writeFileSync(
      join(dir, name),
      `#!/bin/sh\nexec node '${stub}' '${name}' "$@"\n`,
      { mode: 0o755 },
    );
  }
  const result = spawnSync('bash', ['scripts/publish.sh'], {
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: `${dir}:${process.env.PATH}`,
      PUBLISH_FIXTURE: dir,
      PR_TITLE: 'Technical pilot',
    },
  });
  const calls: string[][] = readFileSync(join(dir, 'calls.jsonl'), 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  return {
    ...result,
    calls,
    pushes: calls.filter((c) => c[0] === 'git' && c[1] === 'push'),
  };
}

it.each([
  { branch: 'main' },
  { branch: '' },
  { dirty: true },
  { remote: 'https://github.com/other/repository.git' },
  { pushRemote: 'https://github.com/other/repository.git' },
  { unauthenticated: true },
  { validationFails: true },
  { changedHead: true },
  { changedTree: true },
  { emptyBranch: true },
])('refuses unsafe publication: %j', (scenario) => {
  const result = publish(scenario);
  expect(result.status).not.toBe(0);
  expect(result.pushes).toHaveLength(0);
});

it('uses the complete local gate until CI on main is proven', () => {
  const result = publish();
  expect(result.status, result.stderr).toBe(0);
  expect(result.calls).toContainEqual(['make', 'quality']);
  expect(result.pushes[0]).toEqual([
    'git',
    'push',
    '--set-upstream',
    'origin',
    'abc123:refs/heads/chore/pilot',
  ]);
  expect(
    result.calls.some(
      (c) => c[0] === 'gh' && c[1] === 'pr' && c[2] === 'create',
    ),
  ).toBe(true);
});

it('uses the quick gate when the active CI and protection are proven', () => {
  const result = publish({ reliableCI: true });
  expect(result.status, result.stderr).toBe(0);
  expect(result.calls).toContainEqual(['make', 'check']);
});

it('updates the existing PR without creating a duplicate', () => {
  const result = publish({ existing: true });
  expect(result.status, result.stderr).toBe(0);
  expect(result.calls.some((c) => c[1] === 'api' && c.includes('PATCH'))).toBe(
    true,
  );
  expect(result.calls.some((c) => c[2] === 'create')).toBe(false);
});

it('reports pending remote checks without approving or merging', () => {
  const result = publish({ pending: true });
  expect(result.status, result.stderr).toBe(0);
  expect(result.stdout).toContain('pendentes');
  expect(result.calls.some((c) => ['merge', 'review'].includes(c[2]))).toBe(
    false,
  );
});

it('reports newly created PRs before checks are registered', () => {
  const result = publish({ noChecks: true });
  expect(result.status, result.stderr).toBe(0);
  expect(result.stdout).toContain('pendentes de registro');
});

it('keeps the complete gate while main has no successful CI execution', () => {
  const result = publish({ reliableCI: true, unprovenMain: true });
  expect(result.status, result.stderr).toBe(0);
  expect(result.calls).toContainEqual(['make', 'quality']);
});

it('updates PR metadata when the installed gh edit API is deprecated', () => {
  const result = publish({ existing: true, deprecatedEdit: true });
  expect(result.status, result.stderr).toBe(0);
  expect(result.calls.some((c) => c[2] === 'create')).toBe(false);
});
