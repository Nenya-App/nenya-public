// Keeps the written docs in step with the code, for the facts that have drifted before (review of 2026-11-15):
//   1. every environment variable the site's code reads is named in docs/production-env.md (the one list of them);
//   2. the Node version is the same in package.json, netlify.toml, CI and the README;
//   3. every server function is named in the README's project layout, and every script in scripts/README.md.
// Reads files only: no network, no build.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ok } from './helpers.mts';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (p: string): string => readFileSync(root + p, 'utf8');

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(root + dir)) {
    if (name === 'generated' || name === 'node_modules') continue;
    const p = `${dir}/${name}`;
    if (statSync(root + p).isDirectory()) walk(p, out);
    else if (/\.(m?ts|tsx|m?js)$/.test(name)) out.push(p);
  }
  return out;
}

// 1. Environment variables.
const envDoc = read('docs/production-env.md');
const used = new Set<string>();
for (const f of [...walk('netlify'), ...walk('src')]) {
  const text = read(f);
  for (const m of text.matchAll(/(?:process\.env|import\.meta\.env|\benv)\.([A-Z][A-Z0-9_]+)/g)) used.add(m[1]);
  for (const m of text.matchAll(/process\.env\[['"]([A-Z][A-Z0-9_]+)['"]\]/g)) used.add(m[1]);
}
// Set by the platform or the build, not by the owner.
const PLATFORM = new Set(['NODE_ENV', 'DEV', 'PROD', 'MODE', 'SSR', 'BASE_URL', 'CONTEXT', 'URL', 'DEPLOY_URL', 'COMMIT_REF', 'BRANCH']);
const missing = [...used].filter((v) => !PLATFORM.has(v) && !envDoc.includes(v)).sort();
ok('every environment variable the code reads is named in docs/production-env.md', missing.length === 0, missing.join(', '));
ok('the scan found the variables it should (sanity check)', used.has('COACH_ENABLED') && used.has('VENICE_API_KEY'));

// 2. Node version.
const engines = (JSON.parse(read('package.json')) as { engines?: { node?: string } }).engines?.node ?? '';
const major = engines.match(/(\d+)/)?.[1] ?? '';
ok('package.json names a minimum Node version', !!major, engines);
ok('netlify.toml builds with the same Node major', new RegExp(`NODE_VERSION\\s*=\\s*"${major}"`).test(read('netlify.toml')));
ok('CI tests with the same Node major', new RegExp(`node-version:\\s*${major}\\b`).test(read('.github/workflows/ci.yml')));
const readme = read('README.md');
const stated = [...readme.matchAll(/Node(?:\.js\]\([^)]*\))?\s+(\d+(?:\.\d+)*)\s+or newer/g)].map((m) => m[1]);
ok('the README states a Node version', stated.length > 0);
ok('every Node version the README states matches package.json', stated.every((v) => v.split('.')[0] === major), stated.join(', '));

// 3. Functions and scripts are findable.
const fns = readdirSync(root + 'netlify/functions').filter((f) => /\.m?ts$/.test(f));
const unlisted = fns.filter((f) => !readme.includes(f)).sort();
ok('every server function is named in the README', unlisted.length === 0, unlisted.join(', '));
const scripts = readdirSync(root + 'scripts').filter((f) => /\.(m?ts|m?js|py)$/.test(f));
const scriptIndex = read('scripts/README.md');
const unlistedScripts = scripts.filter((f) => !scriptIndex.includes(f)).sort();
ok('every script is named in scripts/README.md', unlistedScripts.length === 0, unlistedScripts.join(', '));
