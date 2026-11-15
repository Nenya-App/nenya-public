// Measures what Nenya's built site sends, and prints the footprint scenarios (src/lib/footprint.ts) with those sizes.
//   npm run build && node scripts/footprint.mjs            a Markdown table
//   node scripts/footprint.mjs --json                      the measurements and rows as JSON
// Sizes are Brotli-compressed, as Netlify serves them. It reads dist/ only and changes nothing.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { brotliCompressSync, constants } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { STAGING_2026_11_11, scenarios, table } from '../src/lib/footprint.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');
if (!existsSync(join(dist, 'index.html'))) {
  console.error('No dist/ build found. Run the build first.');
  process.exit(1);
}
const assets = readdirSync(join(dist, 'assets'));
const already = /\.(webp|avif|jpe?g|png|woff2)$/i; // already compressed: served as they are
const sent = (p) => {
  const b = readFileSync(p);
  return already.test(p) ? b.length : brotliCompressSync(b, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).length;
};
const asset = (prefix) => assets.filter((f) => f.startsWith(prefix)).map((f) => sent(join(dist, 'assets', f))).reduce((a, b) => a + b, 0);

// The first visit: the page, what it references, the logo's images and the fonts the first screen uses.
const html = readFileSync(join(dist, 'index.html'), 'utf8');
const refs = [...html.matchAll(/(?:src|href)="(\/(?:assets|fonts)\/[^"]+)"/g)].map((m) => m[1]);
const logoImages = ['nenya-logo-', 'nenya-logo-small-', 'petals-', 'bezel-'];
let firstVisitBase = sent(join(dist, 'index.html'));
for (const ref of new Set(refs)) firstVisitBase += sent(join(dist, ref));
for (const p of logoImages) firstVisitBase += asset(p);
const sprite = asset('diamond-hex-sprite-');
const coachCode = asset('CoachDemo-');
const liveChunk = assets.find((f) => /gemRenderer/i.test(f));
const measured = {
  ...STAGING_2026_11_11,
  firstVisitBase,
  sprite,
  coachCode: coachCode || STAGING_2026_11_11.coachCode,
  returnVisit: sent(join(dist, 'index.html')),
  liveGemCode: liveChunk ? sent(join(dist, 'assets', liveChunk)) : STAGING_2026_11_11.liveGemCode,
};
const optional = {
  pdf: asset('jspdf') + asset('html2canvas') + asset('purify'),
  about: asset('AboutNenya-'),
  colorNames: asset('colornames'),
  touchTextures: readdirSync(join(dist, 'touch-textures')).reduce((a, f) => a + statSync(join(dist, 'touch-textures', f)).size, 0),
};
const builtAt = statSync(join(dist, 'index.html')).mtime.toISOString();

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ builtAt, measured, optional, rows: scenarios(measured) }, null, 2));
} else {
  const kb = (n) => `${Math.round(n / 1000)} KB`;
  console.log(`# Nenya footprint (build of ${builtAt})\n`);
  console.log(`First visit without the gem: ${kb(measured.firstVisitBase)}. Gem sprite: ${kb(sprite)}. Live gem code: ${kb(measured.liveGemCode)}${liveChunk ? '' : ' (estimate: not a separate file in this build)'}. Return visit: ${kb(measured.returnVisit)}.`);
  console.log(`Loaded only when used: PDF report ${kb(optional.pdf)}, About pages ${kb(optional.about)}, colour names ${kb(optional.colorNames)}, coach ${kb(measured.coachCode)}, touch textures up to ${kb(optional.touchTextures)}.\n`);
  console.log(table(scenarios(measured)));
  console.log('\nRanges, low to high. See src/lib/footprint.ts for every assumption, and check the per-gigabyte figures with CO2.js before citing.');
}
