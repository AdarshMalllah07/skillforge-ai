#!/usr/bin/env node
/**
 * Generates public/sw.js with a fresh CACHE_VERSION on every build/dev start.
 * Prefer (in order): Vercel commit SHA → SOURCE_VERSION → BUILD_ID → timestamp.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const templatePath = join(__dirname, 'sw.template.js');
const outPath = join(root, 'public', 'sw.js');
const metaPath = join(root, 'public', 'sw-version.json');

function resolveBuildId() {
  const fromEnv =
    process.env.SF_BUILD_ID ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.CF_PAGES_COMMIT_SHA ||
    process.env.COMMIT_REF ||
    process.env.SOURCE_VERSION ||
    process.env.BUILD_ID;

  if (fromEnv && String(fromEnv).trim()) {
    return String(fromEnv).trim().slice(0, 16);
  }

  return `${Date.now().toString(36)}-${createHash('sha1')
    .update(String(process.hrtime.bigint()))
    .digest('hex')
    .slice(0, 6)}`;
}

export function generateServiceWorker(explicitId) {
  const buildId = explicitId || resolveBuildId();
  const cacheVersion = `sf-${buildId}`;
  const template = readFileSync(templatePath, 'utf8');
  const body = template.split('__SF_CACHE_VERSION__').join(cacheVersion);

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, body, 'utf8');
  writeFileSync(
    metaPath,
    JSON.stringify(
      {
        version: cacheVersion,
        buildId,
        generatedAt: new Date().toISOString(),
      },
      null,
      2
    ) + '\n',
    'utf8'
  );

  return { cacheVersion, buildId };
}

const isCli =
  Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCli) {
  const { cacheVersion, buildId } = generateServiceWorker();
  console.log(`[sf] Generated sw.js → ${cacheVersion} (build ${buildId})`);
}
