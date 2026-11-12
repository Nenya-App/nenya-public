// Draws the logo with the site's live gem (the page logo-export/index.html, built on its own) in headless Chrome and makes every static logo asset from it: the in-app logo (WebP), the
// favicons and app icons, the social preview image, the PDF logo, the print logos, and social avatars. Each output is written under an output folder at the path it will have in the
// project, so putting them in place is a copy. The old files are NOT touched here (see docs/logo-regeneration.md).
//   npx vite build --config scripts/logo-export.vite.config.mts          # once, builds the export page
//   npm i --no-save puppeteer-core                                       # once (not a project dependency); needs Google Chrome and macOS's sips and cwebp
//   node scripts/render-logo-assets.mts [out-folder]        (or: npm run logo:render, which builds the export page first)
// The gem's look comes from a file holding what the /bench/ page's "Copy settings" gives (default: Nenya Research/logo-regen/gem-settings.json, or GEM_SETTINGS=path). Without the file the site's
// own defaults are drawn. At the end a before-and-after sheet (before-after.png, next to the out folder) is made so the new set can be looked at in Finder before anything is replaced.
// The stone is held still (the browser is told to reduce motion), so every asset shows the same cut. Same inputs give the same pictures.
import http from 'node:http';
import { readFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, extname, dirname } from 'node:path';
import os from 'node:os';

const HOME = os.homedir();
const BUILD = process.env.LOGO_EXPORT_OUT || join(HOME, 'Desktop', 'Nenya Research', 'logo-regen', 'export-build');
const OUT = process.argv[2] || join(HOME, 'Desktop', 'Nenya Research', 'logo-regen', 'out');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DARK = '#1A1512';
const SETTINGS = process.env.GEM_SETTINGS || join(HOME, 'Desktop', 'Nenya Research', 'logo-regen', 'gem-settings.json');
const GEM_JSON = existsSync(SETTINGS) ? JSON.stringify(JSON.parse(readFileSync(SETTINGS, 'utf8'))) : '';
console.log(GEM_JSON ? `Using the gem settings in ${SETTINGS}` : `No ${SETTINGS}: drawing the site's default gem`);
const { default: puppeteer } = await import('puppeteer-core').catch(() => { console.error('Run `npm i --no-save puppeteer-core` first.'); process.exit(1); });

const types: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json' };
const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url ?? '/', 'http://x');
    let f = join(BUILD, decodeURIComponent(u.pathname));
    if (u.pathname.endsWith('/')) f = join(f, 'index.html');
    const d = await readFile(f);
    res.writeHead(200, { 'content-type': types[extname(f)] || 'application/octet-stream' });
    res.end(d);
  } catch { res.writeHead(404); res.end(); }
}).listen(0);
const port = (server.address() as { port: number }).port;

await rm(OUT, { recursive: true, force: true });
const out = (rel: string): string => join(OUT, rel);
const ensure = async (rel: string) => mkdir(dirname(out(rel)), { recursive: true });

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--hide-scrollbars', '--allow-file-access-from-files'] });
/** Draws the page at a size and saves a PNG (transparent unless a background is given). */
async function draw(rel: string, params: Record<string, string | number>, w: number, h: number): Promise<void> {
  await ensure(rel);
  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  const q = new URLSearchParams(Object.entries({ ...params, ...(GEM_JSON ? { s: GEM_JSON } : {}) }).map(([k, v]) => [k, String(v)]));
  await page.goto(`http://localhost:${port}/logo-export/index.html?${q}`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 3500));
  try {
    await page.screenshot({ path: out(rel), omitBackground: true }); // a background comes from the page's own box, so rounded corners stay transparent
    console.log('drew', rel);
  } catch (e) {
    console.error('FAILED to draw', rel, String(e).slice(0, 200));
  }
  await page.close();
}
const sips = (...a: string[]) => execFileSync('sips', a, { stdio: 'pipe' });
const resize = (src: string, dst: string, px: number) => { sips('-z', String(px), String(px), out(src), '--out', out(dst)); };

/** The tight box around the non-transparent pixels of a PNG, found in the browser. */
async function bbox(rel: string): Promise<{ x: number; y: number; w: number; h: number }> {
  const page = await browser.newPage();
  const b64 = (await readFile(out(rel))).toString('base64');
  const r = await page.evaluate(async (data: string) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + data; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d')!; g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data; let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
  }, b64);
  await page.close();
  return r;
}

// Sizes were measured: on the page, the flat logo's petals are 0.48 of `size` wide (0.55 tall), and the orbit's ring is 1.01 of `size`. The old assets' framing is kept:
// the in-app logo's petals are 0.56 of its canvas wide, the app icon's ring is 0.82 of the canvas, the maskable icon's 0.70, the print logos' ring 0.79.
// ---- 1. the flat logo (petals, bezel and the live gem), transparent: the in-app logo, the small logo, the favicons, the PDF logo
await draw('work/flat-1024.png', { size: 1024 }, 1024, 1024);
await draw('work/flat-768.png', { size: 896, box: 768 }, 768, 768);
await ensure('repo/src/assets/nenya-logo.webp');
execFileSync('cwebp', ['-q', '92', '-alpha_q', '100', '-m', '6', out('work/flat-768.png'), '-o', out('repo/src/assets/nenya-logo.webp')], { stdio: 'pipe' });
resize('work/flat-768.png', 'work/flat-128.png', 128);
execFileSync('cwebp', ['-q', '92', '-alpha_q', '100', '-m', '6', out('work/flat-128.png'), '-o', out('repo/src/assets/nenya-logo-small.webp')], { stdio: 'pipe' });
await draw('work/fav-256.png', { size: 450, box: 256, bg: DARK, round: 22 }, 256, 256); // the flat logo on a rounded dark tile: readable when tiny, on a light or dark tab
await ensure('repo/public/icons/favicon-48.png');
resize('work/fav-256.png', 'repo/public/icons/favicon-48.png', 48);
resize('work/fav-256.png', 'repo/public/icons/favicon-32.png', 32);
const box = await bbox('work/flat-1024.png');
const pad = Math.round(Math.min(box.w, box.h) * 0.02);
const cx = Math.max(0, box.x - pad), cy = Math.max(0, box.y - pad), cw = Math.min(1024 - cx, box.w + 2 * pad), ch = Math.min(1024 - cy, box.h + 2 * pad);
await ensure('repo/public/pdf-assets/nenya-logo.png');
sips('-c', String(ch), String(cw), '--cropOffset', String(cy), String(cx), out('work/flat-1024.png'), '--out', out('repo/public/pdf-assets/nenya-logo.png'));

// ---- 2. the orbit view on the dark ground: app icons, the maskable icon, the Apple touch icon
await draw('work/orbit-512.png', { size: 417, box: 512, orbs: 1, vivid: 1, bg: DARK }, 512, 512);
await draw('work/orbit-512-maskable.png', { size: 355, box: 512, orbs: 1, vivid: 1, bg: DARK }, 512, 512);
await ensure('repo/public/icons/icon-512.png');
sips('-s', 'format', 'png', out('work/orbit-512.png'), '--out', out('repo/public/icons/icon-512.png'));
sips('-s', 'format', 'png', out('work/orbit-512-maskable.png'), '--out', out('repo/public/icons/icon-512-maskable.png'));
resize('work/orbit-512.png', 'repo/public/icons/icon-192.png', 192);
resize('work/orbit-512.png', 'repo/public/icons/apple-touch-icon.png', 180);

// ---- 3. the social preview image (1200 x 630)
await draw('work/og.png', { size: 470, w: 1200, h: 630, orbs: 1, vivid: 1, glow: 1, bg: DARK }, 1200, 630);
await ensure('repo/public/og-image.jpg');
sips('-s', 'format', 'jpeg', '-s', 'formatOptions', '90', out('work/og.png'), '--out', out('repo/public/og-image.jpg'));

// ---- 4. print logos (10 x 10 in at 300 dpi = 3000 px), all the orbit view as before: transparent (with the glow), for light backgrounds (the drawing darkened), on the dark ground, with the glow; and PDFs
const PR = 'assets/print/nenya-logo-10x10in-300dpi-';
await draw(`${PR}transparent.png`, { size: 2370, box: 3000, orbs: 1, vivid: 1, glow: 1 }, 3000, 3000);
await draw(`${PR}badge-for-light-backgrounds.png`, { size: 2370, box: 3000, orbs: 1, vivid: 1, bg: DARK, round: 12 }, 3000, 3000); // on light backgrounds the logo is used as a dark badge
await draw(`${PR}dark-background-clean.png`, { size: 2370, box: 3000, orbs: 1, vivid: 1, bg: DARK }, 3000, 3000);
await draw(`${PR}dark-background-with-glow.png`, { size: 2370, box: 3000, orbs: 1, vivid: 1, glow: 1, bg: DARK }, 3000, 3000);
for (const n of ['dark-background-clean', 'dark-background-with-glow']) {
  if (!existsSync(out(`${PR}${n}.png`))) { console.error('missing', `${PR}${n}.png`, '(no PDF)'); continue; }
  sips('-s', 'dpiWidth', '300', '-s', 'dpiHeight', '300', '-s', 'format', 'pdf', out(`${PR}${n}.png`), '--out', out(`assets/print/nenya-logo-10x10in-${n}.pdf`));
}

// ---- 5. social avatars (the ring sits inside a circular crop) and small versions for other materials
await draw('assets/social/nenya-avatar-1080.png', { size: 770, box: 1080, orbs: 1, vivid: 1, glow: 1, bg: DARK }, 1080, 1080); // with the glow, as the old avatar had
resize('assets/social/nenya-avatar-1080.png', 'assets/social/nenya-avatar-400.png', 400);
resize('assets/social/nenya-avatar-1080.png', 'assets/social/nenya-avatar-small.png', 256);
await draw('assets/social/nenya-logo-transparent-500.png', { size: 500 }, 500, 500);


// ---- the before-and-after sheet (old files in the project on the left, the new ones on the right), for looking at in Finder
{
  const root = join(import.meta.dirname, '..');
  const A = join(HOME, 'Desktop', 'Nenya Assets');
  const rows: [string, string, string, number][] = [
    ['In-app logo (WebP)', join(root, 'src/assets/nenya-logo.webp'), out('repo/src/assets/nenya-logo.webp'), 240],
    ['App icon 512', join(root, 'public/icons/icon-512.png'), out('repo/public/icons/icon-512.png'), 240],
    ['Maskable icon', join(root, 'public/icons/icon-512-maskable.png'), out('repo/public/icons/icon-512-maskable.png'), 240],
    ['Apple touch 180', join(root, 'public/icons/apple-touch-icon.png'), out('repo/public/icons/apple-touch-icon.png'), 180],
    ['Favicon 48 (at 96)', join(root, 'public/icons/favicon-48.png'), out('repo/public/icons/favicon-48.png'), 96],
    ['PDF logo', join(root, 'public/pdf-assets/nenya-logo.png'), out('repo/public/pdf-assets/nenya-logo.png'), 240],
    ['Social preview', join(root, 'public/og-image.jpg'), out('repo/public/og-image.jpg'), 150],
    ['Print: dark, glow', join(A, 'Print Logos/nenya-logo-10x10in-300dpi-dark-background-with-glow.png'), out(`${PR}dark-background-with-glow.png`), 220],
    ['Print: for light backgrounds (badge)', join(A, 'Print Logos/nenya-logo-10x10in-300dpi-transparent-for-light-backgrounds.png'), out(`${PR}badge-for-light-backgrounds.png`), 220],
    ['Print: transparent', join(A, 'Print Logos/nenya-logo-10x10in-300dpi-transparent.png'), out(`${PR}transparent.png`), 220],
    ['Social avatar', join(HOME, 'Desktop/Logo/Nenya Logo Contracted New Small Avatar.png'), out('assets/social/nenya-avatar-1080.png'), 200],
  ];
  const check = 'repeating-conic-gradient(#ddd 0 25%,#fff 0 50%) 0 0/16px 16px';
  const cell = (f: string, h: number) => existsSync(f) ? `<div style="background:${check};padding:6px;display:inline-block"><img src="file://${f}" style="height:${h}px;display:block"></div>` : '<i>(no old file)</i>';
  const html = `<body style="margin:0;background:#8a8a8a;font:13px sans-serif;padding:12px"><table cellspacing=10><tr><th></th><th>OLD</th><th>NEW</th></tr>${rows.map(([l, a, b, h]) => `<tr><td style="width:150px">${l}</td><td>${cell(a, h)}</td><td>${cell(b, h)}</td></tr>`).join('')}</table></body>`;
  const htmlPath = out('work/before-after.html');
  await writeFile(htmlPath, html);
  const sheetPage = await browser.newPage();
  await sheetPage.setViewport({ width: 900, height: 900 });
  await sheetPage.goto(`file://${htmlPath}`);
  await new Promise((r) => setTimeout(r, 1500));
  await sheetPage.screenshot({ path: join(dirname(OUT), 'before-after.png'), fullPage: true });
  await sheetPage.close();
  console.log('Made', join(dirname(OUT), 'before-after.png'));
}

await browser.close();
server.close();
await writeFile(out('MANIFEST.txt'), `Made ${new Date().toISOString()} by scripts/render-logo-assets.mts from the live gem (logo-export page, build ${BUILD}).\n`);
console.log('Done. Outputs are in', OUT);
