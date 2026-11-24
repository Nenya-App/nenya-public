// public/forget-me.js gives the two static pages (about-nenya.html, why-nenya.html) a working Forget me, so "a Forget me link at the bottom of every page" is literally true.
// The script cannot import from the app (it is a plain file the site serves as it is), so it repeats the key names; this test fails if they drift from src/lib/deviceMemory.ts.
// It also runs the script against a fake page and fake storage: it erases the same things as wipeDevice({ keepOwner: true }), never throws, makes no request, stores nothing, and says what it did.
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { join } from 'node:path';
import { ok } from './helpers.mts';

const root = new URL('..', import.meta.url).pathname;
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const script = read('public/forget-me.js');
const dm = read('src/lib/deviceMemory.ts');
const constant = (name: string) => new RegExp(`${name} = '([^']+)'`).exec(dm)?.[1];

// 1. The names agree with the app's.
const owner = ['OWNER_KEY', 'OWNER_TOKEN_KEY', 'OVERRIDES_KEY'].map(constant);
const receipt = constant('TERMS_RECEIPT_KEY');
ok('the app names its three owner keys and the terms receipt key (the test can read them)', owner.every(Boolean) && !!receipt);
const inScript = (arr: string) => [...(new RegExp(`${arr}\\s*=\\s*\\[([^\\]]*)\\]`).exec(script)?.[1] ?? '').matchAll(/'([^']+)'/g)].map((m) => m[1]);
ok('the script keeps the same three owner keys as the app (so Forget me here and in the app erase the same things)', JSON.stringify(inScript('KEEP').sort()) === JSON.stringify([...owner].sort()));
ok('the script removes the same terms receipt from the tab\'s session storage as the app', new RegExp(`RECEIPT = '${receipt!.replace(/\./g, '\\.')}'`).test(script));
ok('the script erases every key that starts with "nenya", in any capitals, like wipeDevice', /toLowerCase\(\)/.test(script) && /indexOf\('nenya'\) === 0/.test(script) && /k\.toLowerCase\(\)\.startsWith\('nenya'\)/.test(dm));
ok('the kept palettes are held in memory only (nothing on the device), so a static page has none to clear', /held in memory only|in memory only/.test(read('src/lib/keptPalettes.ts')) && !/localStorage|sessionStorage/.test(read('src/lib/keptPalettes.ts')));

// 2. What the script does not do.
const code = script.replace(/\/\/.*$/gm, '');
ok('no network request, no cookie, no write to storage, no timer, no animation', !/fetch\(|XMLHttpRequest|sendBeacon|WebSocket|new Image|document\.cookie|setItem|setTimeout|setInterval|requestAnimationFrame|\.animate\(|transition|import\s|require\(/.test(code));

// 3. It runs.
type Listener = (e: { preventDefault(): void }) => void;
function page(opts: { blocked?: boolean; ls?: Record<string, string>; ss?: Record<string, string>; withControl?: boolean } = {}) {
  const ls = new Map(Object.entries(opts.ls ?? {}));
  const ss = new Map(Object.entries(opts.ss ?? {}));
  const store = (m: Map<string, string>) => ({
    get length() { if (opts.blocked) throw new Error('blocked'); return m.size; },
    key: (i: number) => { if (opts.blocked) throw new Error('blocked'); return [...m.keys()][i] ?? null; },
    removeItem: (k: string) => { if (opts.blocked) throw new Error('blocked'); m.delete(k); },
    getItem: () => { throw new Error('the script must not read values'); },
    setItem: () => { throw new Error('the script must not store anything'); },
  });
  const listeners: Record<string, Listener[]> = {};
  const els: Record<string, any> = {
    'forget-me-button': { addEventListener: (t: string, f: Listener) => (listeners[t] ??= []).push(f) },
    'forget-me-status': { textContent: '' },
    'forget-me': { hidden: true },
  };
  let domReady: (() => void) | null = null;
  const doc = {
    readyState: 'loading',
    getElementById: (id: string) => (opts.withControl === false ? null : els[id] ?? null),
    addEventListener: (_t: string, f: () => void) => { domReady = f; },
  };
  const win: any = { document: doc };
  Object.defineProperty(win, 'localStorage', { get() { if (opts.blocked) throw new Error('blocked'); return store(ls); } });
  Object.defineProperty(win, 'sessionStorage', { get() { if (opts.blocked) throw new Error('blocked'); return store(ss); } });
  const ctx = { window: win, document: doc, ...win, console };
  Object.defineProperty(ctx, 'localStorage', { get: () => win.localStorage });
  Object.defineProperty(ctx, 'sessionStorage', { get: () => win.sessionStorage });
  runInNewContext(script, ctx);
  domReady?.();
  const click = () => { let prevented = false; (listeners.click ?? []).forEach((f) => f({ preventDefault: () => { prevented = true; } })); return prevented; };
  return { ls, ss, els, click, wired: (listeners.click ?? []).length };
}

const seed = { 'nenya.remember': '1', 'nenya.prefs': '{}', 'Nenya.Terms': 'x', 'NENYA.coach.rest': '1', 'nenya.coach.pause': '1', 'other.site': 'keep', 'nenyaX': 'y', 'my.nenya': 'keep' };
const owners = Object.fromEntries(owner.map((k) => [k!, '1']));
const p = page({ ls: { ...seed, ...owners }, ss: { [receipt!]: 'r', 'nenya.exited': '1', keep: 'k' } });
ok('the control is shown and wired to one click handler once the page is ready', p.wired === 1 && p.els['forget-me'].hidden === false);
ok('before the click, nothing is erased and nothing is said', p.ls.size === Object.keys(seed).length + owner.length && p.els['forget-me-status'].textContent === '');
p.click();
ok('a click erases every nenya key in any capitals, and only those', [...p.ls.keys()].sort().join('|') === ['my.nenya', 'other.site', ...owner as string[]].sort().join('|'), [...p.ls.keys()].join(','));
ok('a click removes the terms receipt from session storage and nothing else there', [...p.ss.keys()].sort().join('|') === 'keep|nenya.exited');
ok('it says so in plain words', p.els['forget-me-status'].textContent === 'Erased what Nenya saved in this browser.');
p.click();
ok('a second click is harmless and says the same', p.els['forget-me-status'].textContent === 'Erased what Nenya saved in this browser.' && p.ls.size === 2 + owner.length);

const b = page({ blocked: true });
let threw = false;
try { b.click(); } catch { threw = true; }
ok('with storage blocked it never throws', !threw);
ok('with storage blocked it says so in plain words, and does not claim it erased anything', b.els['forget-me-status'].textContent === 'Nothing to erase: this browser does not let this page reach what Nenya saved.');
let threw2 = false;
try { page({ withControl: false }); } catch { threw2 = true; }
ok('on a page without the control it does nothing and does not throw', !threw2);
