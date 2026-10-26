import { parseLockfile, type Dependency } from './lockfile.js';
import { queryOsv, type Vulnerability } from './osv.js';

export interface Finding {
  dependency: Dependency;
  vulnerabilities: Vulnerability[];
}

export async function scanLockfile(
  json: string,
  fetchFn: typeof fetch = fetch,
): Promise<Finding[]> {
  const deps = parseLockfile(json);
  const results = await Promise.all(
    deps.map(async (dependency) => ({
      dependency,
      vulnerabilities: await queryOsv(dependency, fetchFn),
    })),
  );
  return results.filter((finding) => finding.vulnerabilities.length > 0);
}
