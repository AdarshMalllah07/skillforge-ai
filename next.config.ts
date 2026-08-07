import type { NextConfig } from 'next';
import path from 'path';
import { createHash } from 'crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

/** Fresh id per Next process (each `next build` / `next dev` start). */
function resolveBuildId(): string {
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

function generateServiceWorker(buildId: string): string {
  const cacheVersion = `sf-${buildId}`;
  const root = __dirname;
  const templatePath = path.join(root, 'scripts', 'sw.template.js');
  const outPath = path.join(root, 'public', 'sw.js');
  const metaPath = path.join(root, 'public', 'sw-version.json');

  const template = readFileSync(templatePath, 'utf8');
  const body = template.split('__SF_CACHE_VERSION__').join(cacheVersion);

  mkdirSync(path.dirname(outPath), { recursive: true });
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

  console.log(`[sf] Service worker version → ${cacheVersion}`);
  return cacheVersion;
}

const SF_BUILD_ID = resolveBuildId();
const SF_CACHE_VERSION = generateServiceWorker(SF_BUILD_ID);

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  generateBuildId: async () => SF_BUILD_ID,
  env: {
    // Exposed to client for SW registration cache-busting
    NEXT_PUBLIC_SF_BUILD: SF_BUILD_ID,
    NEXT_PUBLIC_SF_SW_VERSION: SF_CACHE_VERSION,
  },
  // Hide the floating Next.js Dev Tools badge in local development
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/manifest.webmanifest',
        headers: [
          { key: 'Content-Type', value: 'application/manifest+json' },
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
      {
        source: '/sw-version.json',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }],
      },
    ];
  },
};

export default nextConfig;
