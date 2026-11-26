// Does a built copy of the site send anything off this computer? (docs/smithy-guides-scope.md, guide 6.)
//   npm run build
//   npm i --no-save puppeteer-core                 # once (not a project dependency); needs Google Chrome
//   node scripts/smithy-offline-check.mts          # add --explore to print the buttons on screen at each step
// Serves dist/ on 127.0.0.1 only, drives Chrome through the core tool, and records every request the pages make.
// Prints the outward requests (should be 0) and, separately, calls to this copy's own /api/ addresses (they need server
// functions a plain copy does not run). Exit 1 if anything left the computer or a step could not be done. Keeps nothing.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, mkdtempSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { outwardRequests } from '../src/lib/smithyOffline.ts';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
if (!existsSync(join(dist, 'index.html'))) { console.error('No dist/index.html. Run `npm run build` first.'); process.exit(1); }
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const explore = process.argv.includes('--explore');
const { default: puppeteer } = await import('puppeteer-core').catch(() => { console.error('Run `npm i --no-save puppeteer-core` first.'); process.exit(1); });

const TYPES: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.txt': 'text/plain', '.xml': 'application/xml', '.wasm': 'application/wasm' };
const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname));
  let file = join(dist, path);
  if (!file.startsWith(dist) && file + sep !== dist) { res.writeHead(403).end(); return; }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(404).end(); return; }
  if (!existsSync(file)) file = join(dist, 'index.html');
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise<void>((r) => server.listen(0, '127.0.0.1', () => r()));
const origin = `http://127.0.0.1:${(server.address() as { port: number }).port}`;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--disable-background-networking', '--no-first-run', '--no-default-browser-check'] });
const seen: string[] = [];
const watch = (page: any) => page.on('request', (r: any) => seen.push(r.url()));
browser.on('targetcreated', async (t: any) => { const p = await t.page().catch(() => null); if (p) watch(p); });
const page = await browser.newPage();
watch(page);
// The site asks before leaving once a lens holds something; say yes, so the next address opens.
page.on('dialog', (d: any) => d.accept().catch(() => undefined));
const downloads = mkdtempSync(join(tmpdir(), 'smithy-downloads-'));
await (await page.createCDPSession()).send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads });
await page.setViewport({ width: 1200, height: 900 });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const missed: string[] = [];
const done: string[] = [];

/** Clicks the first visible button or link whose label contains `label`. */
async function click(label: string, step: string): Promise<boolean> {
  const hit = await page.evaluate((want: string) => {
    const el = [...document.querySelectorAll('button, a, [role="button"]')].find((e) => ((e.getAttribute('aria-label') || '') + ' ' + (e.textContent || '')).replace(/\s+/g, ' ').includes(want) && (e as HTMLElement).offsetParent !== null && !(e as HTMLButtonElement).disabled);
    if (!el) return false;
    (el as HTMLElement).click();
    return true;
  }, label);
  await sleep(1500);
  (hit ? done : missed).push(step);
  if (explore) await page.screenshot({ path: `.superpowers/sdd/smithy-guides-plan/shot-${done.length + missed.length}.png` });
  if (explore) console.log(`[${hit ? 'ok' : 'MISSED'}] ${step}\n   ` + (await page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => (b as HTMLElement).offsetParent !== null).map((b) => (b.getAttribute('aria-label') || b.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40)).filter((x) => x && !/Emergency|Share Nenya|Forget me/.test(x)).join(' | '))));
  return hit;
}

await page.goto(origin + '/', { waitUntil: 'networkidle2' });
await sleep(1000);
await click('Read the terms', 'welcome screen: read the Terms');
await page.evaluate(() => { for (const el of document.querySelectorAll('[role="dialog"], [role="dialog"] *')) { if (el.scrollHeight > el.clientHeight + 50) el.scrollTop = el.scrollHeight; } });
await sleep(800);
await click('Agree, Enter', 'agree to the Terms');
await click('Skip for now', 'skip the tour');
await click('Open breathing animation', 'open the breathing panel');
await click('Close the breathing panel', 'close the breathing panel');
await click('Explore Your Senses', 'open the Lenses');
// One whole lens (Sight), through to the report and its download.
for (const [label, step] of [
  ['Sight', 'pick the Sight lens'], ['Begin Journey', 'begin'], ['Next', 'read the first card'], ['Next', 'read the second card'],
  ['Begin Selection', 'start choosing'], ['Surprise Me', 'choose a first colour'], ['Continue to Wish state', 'go to the second colour'],
  ['Surprise Me', 'choose a second colour'], ['Enter Session', 'finish the lens'], ['Download PDF Report', 'download the PDF report'],
  ['Download Text Report', 'download the text report'],
] as const) await click(label, step);
await sleep(4000);
for (const path of ['/about', '/about/privacy-promise', '/about/breathing-tool', '/']) {
  await page.goto(origin + path, { waitUntil: 'networkidle2' });
  await sleep(800);
  done.push(`open ${path}`);
}
const saved = readdirSync(downloads);
await browser.close();
server.close();
if (!saved.some((f) => f.endsWith('.pdf'))) missed.push('no PDF was saved');

const outward = outwardRequests(seen, origin);
const api = seen.filter((u) => u.startsWith(origin + '/api/'));
console.log(`requests seen: ${seen.length}`);
console.log(`files saved: ${saved.join(', ') || 'none'}`);
console.log(`steps done: ${done.length} (${done.join('; ')})`);
if (missed.length) console.log(`steps NOT done: ${missed.join('; ')}`);
console.log(`outward requests: ${outward.length}`);
for (const u of [...new Set(outward)]) console.log('  ' + u);
console.log(`calls to this copy's own /api/ addresses: ${api.length}`);
for (const u of [...new Set(api)]) console.log('  ' + u.slice(origin.length));
process.exit(outward.length || missed.length ? 1 : 0);
