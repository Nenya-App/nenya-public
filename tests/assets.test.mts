// Every "/assets/..." path the code refers to must exist in public/, so renaming or converting an image
// cannot leave a silently broken picture behind.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ok } from './helpers.mts';

const root = fileURLToPath(new URL('..', import.meta.url));
const walk = (d: string): string[] => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
const sources = [...walk(join(root, 'src')), join(root, 'index.html'), join(root, 'coach', 'index.html')].filter((f) => /\.(tsx?|css|html)$/.test(f));

const refs = new Map<string, string>();
for (const f of sources) {
  for (const m of readFileSync(f, 'utf8').matchAll(/['"(]\/assets\/([A-Za-z0-9._\-/]+\.(?:png|jpe?g|webp|svg|gif|avif|ico))/g)) refs.set(m[1], f.replace(root, ''));
}
ok('the code refers to at least one public asset', refs.size > 0, `${refs.size} found`);
for (const [name, from] of refs) ok(`/assets/${name} exists (used in ${from})`, existsSync(join(root, 'public', 'assets', name)));

const big = readdirSync(join(root, 'public', 'assets')).filter((n) => statSync(join(root, 'public', 'assets', n)).size > 120 * 1024);
ok('no image in public/assets is over 120 KiB', big.length === 0, big.join(', '));
