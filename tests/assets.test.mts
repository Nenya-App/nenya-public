// Every "/assets/..." path the code refers to must exist in public/, so renaming or converting an image
// cannot leave a silently broken picture behind.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ok } from './helpers.mts';

const root = fileURLToPath(new URL('..', import.meta.url));
const walk = (d: string): string[] => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
const sources = [...walk(join(root, 'src')), join(root, 'index.html'), join(root, 'coach', 'index.html'), join(root, 'admin', 'index.html')].filter((f) => /\.(tsx?|css|html)$/.test(f));

// Everything under /assets is served with a one-year "immutable" cache header (see netlify.toml), which is only
// safe because the build gives those files hashed names. A hand-placed file in public/assets would have a fixed
// name and could be stuck in visitors' browsers for a year after a change.
ok('public/assets does not exist (everything in /assets must come from the build, with a hashed name)', !existsSync(join(root, 'public', 'assets')));

// No code may still refer to an /assets/ path by hand.
const refs: string[] = [];
for (const f of sources) {
  for (const m of readFileSync(f, 'utf8').matchAll(/['"(]\/assets\/[A-Za-z0-9._\-/]+/g)) refs.push(`${m[0].slice(1)} in ${f.replace(root, '')}`);
}
ok('no code refers to a hand-placed /assets/ file', refs.length === 0, refs.join('; '));

// Image weight: nothing shipped as an image should be needlessly large.
const imageFiles = [...walk(join(root, 'src', 'assets')), ...walk(join(root, 'public')).filter((f) => !f.includes('/pdf-assets/'))].filter((f) => /\.(png|jpe?g|webp|gif|avif)$/i.test(f));
// The gem's sprite sheet (48 frames in one image) is the one deliberate exception. It is imported only for its URL and
// fetched when the orbit view mounts, never bundled into the page's JavaScript.
const SPRITE = 'diamond-hex-sprite.webp';
ok('the gem sprite sheet exists and stays under 1 MiB', imageFiles.some((f) => f.endsWith(SPRITE)) && statSync(join(root, 'src', 'assets', SPRITE)).size < 1024 * 1024);
const over = imageFiles.filter((f) => !f.endsWith(SPRITE)).filter((f) => statSync(f).size > 160 * 1024).map((f) => f.replace(root, '') + ` (${Math.round(statSync(f).size / 1024)} KiB)`);
ok('no site image is over 160 KiB', over.length === 0, over.join(', '));
ok('site images are WebP, JPEG or PNG only where a PNG is genuinely needed', imageFiles.filter((f) => /\.png$/i.test(f) && statSync(f).size > 60 * 1024).length === 0, 'large PNGs: ' + imageFiles.filter((f) => /\.png$/i.test(f) && statSync(f).size > 60 * 1024).map((f) => f.replace(root, '')).join(', '));
