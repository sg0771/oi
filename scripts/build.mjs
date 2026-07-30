import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { blogDirs } from './site-config.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const distDir = path.join(rootDir, 'dist');

await import('./update-blog-index.mjs');

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

const siteEntries = [
  'index.html',
  'README.md',
  '_sidebar.md',
  '_404.md',
  '.nojekyll',
  ...blogDirs,
];

for (const entry of siteEntries) {
  await cp(path.join(rootDir, entry), path.join(distDir, entry), {
    recursive: true,
    force: true,
  });
}

console.log('Built dist');
