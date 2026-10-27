import { describe, expect, it } from 'vitest';
import { formatReport } from '../src/core/report.js';

describe('formatReport', () => {
  it('reports a clean scan', () => {
    expect(formatReport([])).toBe('No known vulnerabilities found.');
  });

  it('lists each vulnerable package with its vulnerabilities', () => {
    const report = formatReport([
      {
        dependency: { name: 'lodash', version: '4.17.20' },
        vulnerabilities: [
          { id: 'GHSA-1', summary: 'Prototype pollution' },
          { id: 'GHSA-2', summary: '' },
        ],
      },
    ]);
    expect(report).toBe(
      [
        'lodash@4.17.20',
        '  GHSA-1  Prototype pollution',
        '  GHSA-2  (no summary)',
        '',
        '1 vulnerable package(s) found.',
      ].join('\n'),
    );
  });
});
