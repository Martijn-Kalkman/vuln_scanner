import { isRecord, type Dependency } from './lockfile.js';

export interface Vulnerability {
  id: string;
  summary: string;
}

const osvUrl = 'https://api.osv.dev/v1/query';

export async function queryOsv(
  dep: Dependency,
  fetchFn: typeof fetch = fetch,
): Promise<Vulnerability[]> {
  const response = await fetchFn(osvUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      package: { name: dep.name, ecosystem: 'npm' },
      version: dep.version,
    }),
  });

  if (!response.ok) {
    throw new Error(`OSV request failed: ${String(response.status)}`);
  }

  const body: unknown = await response.json();
  if (!isRecord(body)) {
    throw new Error('OSV response is not valid');
  }
  if (body.vulns === undefined) {
    return [];
  }
  if (!Array.isArray(body.vulns)) {
    throw new Error('OSV response is not valid');
  }
  const vulns: Vulnerability[] = [];
  for (const item of body.vulns) {
    if (!isRecord(item) || typeof item.id !== 'string') continue;
    const summary = typeof item.summary === 'string' ? item.summary : '';
    vulns.push({ id: item.id, summary });
  }
  return vulns;
}
