import type { Finding } from './scan.js';

export function formatReport(findings: Finding[]): string {
  if (findings.length === 0) {
    return 'No known vulnerabilities found.';
  }
  const lines = findings.flatMap(({ dependency, vulnerabilities }) => [
    `${dependency.name}@${dependency.version}`,
    ...vulnerabilities.map((v) => `  ${v.id}  ${v.summary || '(no summary)'}`),
  ]);
  return [...lines, '', `${String(findings.length)} vulnerable package(s) found.`].join('\n');
}
