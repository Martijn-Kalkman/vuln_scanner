export interface Dependency {
  name: string;
  version: string;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseLockfile(json: string): Dependency[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('Invalid lockfile: not valid JSON');
  }
  if (!isRecord(parsed)) {
    throw new Error('Invalid lockfile: missing packages');
  }
  const packages = parsed.packages;
  if (!isRecord(packages)) {
    throw new Error('Invalid lockfile: missing packages');
  }
  const deps: Dependency[] = [];
  for (const [path, entry] of Object.entries(packages)) {
    if (path === '') continue;
    if (!isRecord(entry) || typeof entry.version !== 'string') continue;

    const marker = 'node_modules/';
    const name = path.slice(path.lastIndexOf(marker) + marker.length);
    deps.push({ name, version: entry.version });
  }
  return deps;
}
