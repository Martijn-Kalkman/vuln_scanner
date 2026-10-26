import { describe, expect, it, vi } from 'vitest';
import { scanLockfile } from '../src/core/scan.js';

function fakeFetch(body: unknown) {
  return vi
    .fn<typeof fetch>()
    .mockImplementation(() => Promise.resolve(new Response(JSON.stringify(body))));
}

function lockfile(packages: Record<string, { version: string }>): string {
  return JSON.stringify({ packages: { '': { version: '1.0.0' }, ...packages } });
}

describe('scanLockfile', () => {
  it('returns [] when no dependency has vulnerabilities', async () => {
    const json = lockfile({
      'node_modules/a': { version: '1.0.0' },
      'node_modules/b': { version: '2.0.0' },
    });
    const fetchFn = fakeFetch({});
    await expect(scanLockfile(json, fetchFn)).resolves.toEqual([]);
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('returns a finding for a vulnerable dependency', async () => {
    const json = lockfile({ 'node_modules/lodash': { version: '4.17.20' } });
    const fetchFn = fakeFetch({ vulns: [{ id: 'GHSA-1', summary: 'Bad' }] });
    await expect(scanLockfile(json, fetchFn)).resolves.toEqual([
      {
        dependency: { name: 'lodash', version: '4.17.20' },
        vulnerabilities: [{ id: 'GHSA-1', summary: 'Bad' }],
      },
    ]);
  });

  it('rejects when an OSV request fails', async () => {
    const json = lockfile({ 'node_modules/a': { version: '1.0.0' } });
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockImplementation(() => Promise.resolve(new Response('{}', { status: 503 })));
    await expect(scanLockfile(json, fetchFn)).rejects.toThrow('OSV request failed: 503');
  });
});
