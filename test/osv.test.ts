import { describe, expect, it, vi } from 'vitest';
import { queryOsv } from '../src/core/osv.js';

const dep = { name: 'lodash', version: '4.17.20' };

function fakeFetch(body: unknown, status = 200) {
  return vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(body), { status }));
}

describe('queryOsv', () => {
  it('returns [] when OSV finds nothing', async () => {
    await expect(queryOsv(dep, fakeFetch({}))).resolves.toEqual([]);
  });

  it('maps vulnerabilities and defaults a missing summary', async () => {
    const fetchFn = fakeFetch({ vulns: [{ id: 'GHSA-1', summary: 'Bad' }, { id: 'GHSA-2' }] });
    await expect(queryOsv(dep, fetchFn)).resolves.toEqual([
      { id: 'GHSA-1', summary: 'Bad' },
      { id: 'GHSA-2', summary: '' },
    ]);
  });

  it('throws on a non-OK response', async () => {
    await expect(queryOsv(dep, fakeFetch({}, 500))).rejects.toThrow('OSV request failed: 500');
  });

  it('throws when vulns is not an array', async () => {
    await expect(queryOsv(dep, fakeFetch({ vulns: 'oops' }))).rejects.toThrow('not valid');
  });
});
