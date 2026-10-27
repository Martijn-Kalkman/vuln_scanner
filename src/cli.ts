#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { formatReport } from './core/report.js';
import { scanLockfile } from './core/scan.js';

async function main(): Promise<void> {
  const path = process.argv[2] ?? 'package-lock.json';
  const json = await readFile(path, 'utf8');
  const findings = await scanLockfile(json);
  console.log(formatReport(findings));
  process.exitCode = findings.length > 0 ? 1 : 0;
}

try {
  await main();
} catch (error: unknown) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 2;
}
