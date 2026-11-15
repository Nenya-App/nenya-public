// Renders the live gem logo as a frame sequence and encodes it, with no screen capture: the export page (logo-export/index.html) is drawn in headless Chrome whose clock is replaced by one this
// script advances by hand, a frame at a time, so every frame is the exact picture the site would draw at that moment, and the result does not depend on how fast the computer is.
//   npx vite build --config scripts/logo-export.vite.config.mts           # once (npm run logo:render does this too)
//   npm i --no-save puppeteer-core                                        # once; needs Google Chrome
//   node scripts/render-logo-video.mts --mode flat --seconds 3 --fps 15 --bg transparent --size 540 --name test
//     --mode flat | orbit          flat: petals, bezel and the gem; orbit: with the ring of orbs
//     --seconds N                  the length (default: one loop, see --loop)
//     --loop                       length = one gem loop (three breaths, or --loop-breaths N); the orbit, the color cycle, the kaleidoscope and the breath tint go round exactly once, so the clip repeats without a jump
//     --loop-breaths N             breaths in the loop (default 3; the breath tint uses N colours, one per breath)
//     --fps N                      frames per second (default 15, the rate the site draws the gem at)
//     --bg transparent | dark | badge      transparent (alpha), the dark ground, or the dark rounded tile
//     --spin N                     turns of the stone per loop (default 0 with --loop, so the clip repeats without a jump; the site itself turns 1/6 of a turn per loop, which does not close)
//     --glow  --kaleido            the gold glow; the kaleidoscope on
//     --pace ih,hi,ex,ho           breathing pace in milliseconds (default 5000,0,5000,0)
//     --size N                     pixels, square (default 540)
//     --name NAME                  files go to Nenya Research/logo-video/NAME/ (frames) and NAME.webp (animated WebP, with alpha, made with img2webp), plus NAME.mp4/.webm if ffmpeg is installed
// Same inputs, same frames. About one to three seconds a frame at 1080 pixels (software graphics): a loop at 15 fps is a few hundred frames.
import http from 'node:http';
import { readFile, mkdir, rm } from 'node:fs/promises';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, extname } from 'node:path';
import os from 'node:os';

const HOME = os.homedir();
const args = process.argv.slice(2);
const flag = (n: string): string | undefined => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined);
const has = (n: string): boolean => args.includes(n);
const BUILD = process.env.LOGO_EXPORT_OUT || join(HOME, 'Desktop', 'Nenya Research', 'logo-regen', 'export-build');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SETTINGS = process.env.GEM_SETTINGS || join(HOME, 'Desktop', 'Nenya Research', 'logo-regen', 'gem-settings.json');
const GEM_JSON = existsSync(SETTINGS) ? JSON.stringify(JSON.parse(readFileSync(SETTINGS, 'utf8'))) : '';
const mode = flag('--mode') === 'orbit' ? 'orbit' : 'flat';
const size = Math.max(64, Math.min(2160, Number(flag('--size')) || 540));
const fps = Math.max(1, Math.min(60, Number(flag('--fps')) || 15));
const pace = (flag('--pace') ?? '5000,0,5000,0').split(',').map(Number);
const breathMs = (pace[0] + (pace[1] || 0) + pace[2] + (pace[3] || 0)) || 10000;
const loopBreaths = Math.max(3, Math.round(Number(flag('--loop-breaths')) || 3)); // a multiple of GEM_LOOP_BREATHS = 3 (src/lib/breathClock.ts) keeps the gem's own sparkle loop whole
const loopSeconds = (loopBreaths * breathMs) / 1000;
const seconds = Number(flag('--seconds')) || (has('--loop') ? loopSeconds : 3);
const bg = flag('--bg') ?? 'transparent';
const name = (flag('--name') ?? 'logo').replace(/[^a-z0-9._-]/gi, '-');
const frames = Math.round(seconds * fps);
const dir = join(HOME, 'Desktop', 'Nenya Research', 'logo-video', name);
const DARK = '#1A1512';
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

await rm(dir, { recursive: true, force: true });
await mkdir(dir, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--hide-scrollbars', '--allow-file-access-from-files'] });
const page = await browser.newPage();
await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
// The page's clock: Date.now, performance.now and requestAnimationFrame are replaced, and every animation on the page is set to the same time, so nothing runs by itself.
await page.evaluateOnNewDocument(() => {
  const BASE = 1_800_000_000_000;
  let T = 0, id = 0;
  const cbs = new Map<number, FrameRequestCallback>();
  Date.now = () => BASE + T;
  performance.now = () => T;
  window.requestAnimationFrame = (f: FrameRequestCallback) => { cbs.set(++id, f); return id; };
  window.cancelAnimationFrame = (i: number) => { cbs.delete(i); };
  // The page's animation library (Motion) never lets one frame advance its animations by more than 40 ms, however much time has passed: a 15 fps clip (66.7 ms a frame) would run them at 60% speed
  // and nothing would line up with the loop. So time is advanced in pieces of at most 16 ms, each one a full animation frame, and the page is only photographed after the last.
  (window as unknown as { __step: (dt: number) => number }).__step = (dt: number) => {
    let remaining = dt;
    do {
      const d = Math.min(remaining, 16);
      T += d; remaining -= d;
      const list = [...cbs.values()]; cbs.clear();
      for (const f of list) { try { f(T); } catch { /* a frame's error must not stop the clip */ } }
    } while (remaining > 0.001);
    for (const a of document.getAnimations()) { try { a.pause(); a.currentTime = T; } catch { /* some animations cannot be set */ } }
    return T;
  };
});
const params = new URLSearchParams({ size: String(Math.round(size * (mode === 'flat' ? 1.22 : 0.78))), box: String(size), video: '1', gemfps: String(fps * 1.1), breathe: '1', pace: pace.join(','), ...(mode === 'flat' ? { flat: '1' } : { orbs: '1', vivid: '1' }), ...(has('--glow') ? { glow: '1' } : {}), ...(has('--kaleido') ? { kaleido: '1' } : {}), ...(has('--loop') ? { loop: String(loopSeconds), breathcolors: String(loopBreaths) } : {}), ...(flag('--spin') !== undefined ? { spin: String(Number(flag('--spin'))) } : has('--loop') ? { spin: '0' } : {}), ...(bg === 'dark' ? { bg: DARK } : bg === 'badge' ? { bg: DARK, round: '12' } : {}), ...(GEM_JSON ? { s: GEM_JSON } : {}) });
page.on('pageerror', (e) => console.log('page error:', String(e).slice(0, 160)));
await page.goto(`http://localhost:${port}/logo-export/index.html?${params}`, { waitUntil: 'load', timeout: 60000 });
await new Promise((r) => setTimeout(r, 1500)); // the page's own start-up, in real time, before the clock is driven
const step = 1000 / fps;
console.log(`${mode}, ${size}px, ${frames} frames (${seconds}s at ${fps} fps), background ${bg}${has('--loop') ? ', loops every ' + loopSeconds + 's' : ''}`);
const t0 = Date.now();
// A second of warm-up on the page's own clock first, so the start-up transitions (the page's background fades from white to its own color) are finished before the first frame is kept.
for (let w = 0; w < 24; w++) { await page.evaluate(() => (window as unknown as { __step: (n: number) => number }).__step(50)); await new Promise((r) => setTimeout(r, 15)); }
for (let i = 0; i < frames; i++) {
  await page.evaluate((dt) => (window as unknown as { __step: (n: number) => number }).__step(dt), i === 0 ? 0 : step);
  await new Promise((r) => setTimeout(r, 25)); // let the page paint what the frame drew
  await page.screenshot({ path: join(dir, `f${String(i).padStart(5, '0')}.png`), omitBackground: true });
  if (i % 15 === 14 || i === frames - 1) console.log(`  ${i + 1}/${frames} frames, ${Math.round((Date.now() - t0) / 1000)}s`);
}
await browser.close();
server.close();

// Encode. Animated WebP (alpha kept) needs img2webp (Homebrew's webp package); MP4 and WebM need ffmpeg. Frames are kept either way.
const webp = join(HOME, 'Desktop', 'Nenya Research', 'logo-video', `${name}.webp`);
const files = readdirSync(dir).filter((f) => f.endsWith('.png')).sort().map((f) => join(dir, f));
try {
  execFileSync('img2webp', ['-loop', '0', '-lossy', '-q', '88', '-d', String(Math.round(1000 / fps)), ...files, '-o', webp], { stdio: 'pipe' });
  console.log(`animated WebP: ${webp}`);
} catch { console.log('img2webp not found: no WebP made (brew install webp). The frames are in ' + dir); }
try {
  execFileSync('ffmpeg', ['-y', '-framerate', String(fps), '-i', join(dir, 'f%05d.png'), ...(bg === 'transparent' ? ['-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '0', '-crf', '28', join(HOME, 'Desktop', 'Nenya Research', 'logo-video', `${name}.webm`)] : ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '16', join(HOME, 'Desktop', 'Nenya Research', 'logo-video', `${name}.mp4`)])], { stdio: 'pipe' });
  console.log('video file written next to the WebP');
} catch { console.log('ffmpeg not found: no MP4 or WebM made (brew install ffmpeg).'); }
