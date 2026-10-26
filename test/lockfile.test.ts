import { describe, expect, it } from 'vitest';
import { parseLockfile } from '../src/core/lockfile.js';

describe('parseLockfile', () => {
  it('throws on invalid JSON', () => {
    expect(() => parseLockfile('not json')).toThrow('not valid JSON');
  });

  it('throws when packages is missing', () => {
    expect(() => parseLockfile('{}')).toThrow('missing packages');
  });

  it('extracts root, nested and scoped packages', () => {
    const lock = JSON.stringify({
      packages: {
        '': { name: 'my-app', version: '1.0.0' },
        'node_modules/lodash': { version: '4.17.21' },
        'node_modules/a/node_modules/lodash': { version: '3.10.1' },
        'node_modules/@types/node': { version: '24.0.0' },
      },
    });
    expect(parseLockfile(lock)).toEqual([
      { name: 'lodash', version: '4.17.21' },
      { name: 'lodash', version: '3.10.1' },
      { name: '@types/node', version: '24.0.0' },
    ]);
  });

  it('skips entries without a version', () => {
    const lock = JSON.stringify({
      packages: { 'node_modules/linked': { link: true, resolved: 'packages/linked' } },
    });
    expect(parseLockfile(lock)).toEqual([]);
  });
});
