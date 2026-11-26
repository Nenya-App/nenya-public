// The site's pictures are the sizes they say they are (owner, 2026-11-26): icons and the social picture match what is declared, the header badge is sharp
// enough on dense screens, and pictures drawn at a set size keep their shape.
import { existsSync, readFileSync } from 'node:fs';
import { ok } from './helpers.mts';

function size(path: string): [number, number] {
  const b = readFileSync(path);
  if (path.endsWith('.png')) return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (path.endsWith('.webp')) {
    const kind = b.toString('ascii', 12, 16);
    if (kind === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
    if (kind === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
    const n = b.readUInt32LE(21);
    return [1 + (n & 0x3fff), 1 + ((n >> 14) & 0x3fff)];
  }
  if (path.endsWith('.svg')) { const m = /<svg[^>]*\swidth="([\d.]+)"[^>]*\sheight="([\d.]+)"/.exec(b.toString('utf8'))!; return [Number(m[1]), Number(m[2])]; }
  for (let i = 2; i < b.length - 8; ) {
    const marker = b[i + 1];
    if (marker >= 0xc0 && marker <= 0xc3) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
    i += 2 + b.readUInt16BE(i + 2);
  }
  return [0, 0];
}
const is = (path: string, w: number, h: number) => { const [a, c] = size(path); return a === w && c === h; };
const src = (p: string) => readFileSync(p, 'utf8');
const index = src('index.html');

const manifest = JSON.parse(src('public/manifest.json')) as { icons: { src: string; sizes: string }[] };
ok('every app icon is the size the manifest says', manifest.icons.every((i) => { const [w, h] = i.sizes.split('x').map(Number); return is('public' + i.src, w, h); }));
ok('the browser-tab icons are the sizes the page says', [32, 48].every((n) => index.includes(`sizes="${n}x${n}" href="/icons/favicon-${n}.png"`) && is(`public/icons/favicon-${n}.png`, n, n)));
ok('the home-screen icon for Apple devices is 180 square', is('public/icons/apple-touch-icon.png', 180, 180));
ok('the link preview picture is 1200 by 630, as declared', is('public/og-image.jpg', 1200, 630) && index.includes('og:image:width" content="1200"') && index.includes('og:image:height" content="630"'));
const [bw, bh] = size('src/assets/nenya-badge.webp');
ok('the header badge is square and at least three times its size on screen (44px), without being much larger', bw === bh && bw >= 44 * 3 && bw <= 168, `${bw}x${bh}`);
ok('so is the dark theme\'s header mark', is('src/assets/nenya-header-mark.webp', bw, bh));
ok('the small logo covers its largest use (48px) at least twice over', size('src/assets/nenya-logo-small.webp')[0] >= 96);

const attrs = (text: string, file: string): [number, number] => { const at = text.indexOf(`src="${file}"`); const tag = text.slice(text.lastIndexOf('<img', at), text.indexOf('/>', at)); return [Number(/\swidth="(\d+)"/.exec(tag)?.[1] ?? 0), Number(/\sheight="(\d+)"/.exec(tag)?.[1] ?? 0)]; };
for (const [where, file] of [['src/app/components/AppFooter.tsx', '/badges/netlify-badge.svg'], ['src/app/components/about/Structure.tsx', '/badges/fractured-atlas-donate.png']] as const) {
  const [w, h] = attrs(src(where), file), [nw, nh] = size('public' + file);
  ok(`${file}: has its width and height set, in its own shape (within a pixel)`, w > 0 && h > 0 && Math.abs(w - (h * nw) / nh) <= 1, `${w}x${h} for ${nw}x${nh}`);
}
// The review pictures gathered on 2026-08-25 were never used by the site, so they are not published (removed 2026-11-26; they are in git history).
ok('no unused review pictures are published', !existsSync('public/pdf-assets/visual-aids-review') && !/visual-aids-review/.test(src('public/pdf-assets/ATTRIBUTIONS.md')));
