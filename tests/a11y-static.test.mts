// WCAG 2.2 AAA checks that can be made by reading the source: the things an audit found and fixed, so they stay fixed. (Not a replacement for a person using the site: docs/accessibility-standard.md.)
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { ok } from './helpers.mts';
const root = fileURLToPath(new URL('..', import.meta.url));
const src = (f: string) => readFileSync(join(root, f), 'utf8');
const walk = (d: string): string[] => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? (f === 'bench' ? [] : walk(p)) : /\.tsx$/.test(f) ? [p] : []; });
const files = walk(join(root, 'src'));

// A JSX opening tag, read to its closing ">" while skipping braces and quotes (arrow functions contain ">").
function tags(text: string, names: string[]): { text: string; file?: string }[] {
  const out: { text: string }[] = []; const re = new RegExp(`<(${names.join('|')})(?=[\\s/>])`, 'g'); let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    let i = m.index + m[0].length, depth = 0, q = '';
    for (; i < text.length; i++) { const c = text[i]; if (q) { if (c === q && text[i - 1] !== '\\') q = ''; continue; } if (c === '"' || (depth > 0 && (c === "'" || c === '`'))) { q = c; continue; } if (c === '{') depth++; else if (c === '}') depth--; else if (c === '>' && depth === 0 && text[i - 1] !== '=') break; }
    out.push({ text: text.slice(m.index, i + 1) });
  }
  return out;
}

// 1.1.1: every image has alternative text (empty for decoration)
const noAlt = files.flatMap((f) => tags(readFileSync(f, 'utf8'), ['img']).filter((t) => !/\balt=/.test(t.text)).map(() => f.split('/src/')[1]));
ok('every image has an alt attribute', noAlt.length === 0, noAlt.join(', '));

// 1.3.1 / 4.1.2: the controls that were found without a name now have one
ok('the body map note box and the custom color box are named', /aria-label="Note for this body part/.test(src('src/app/components/BodyMapAvatar.tsx')) && /aria-label="Custom color as a hex code/.test(src('src/app/components/ValarColorPicker.tsx')));
// A click-catching overlay is decorative to a screen reader
ok('the click-away backdrops of the menus and dialogs are hidden from assistive technology', ['src/app/components/AddToHomeScreen.tsx', 'src/app/components/TourOffer.tsx', 'src/app/components/EmergencyExit.tsx', 'src/app/components/GlobalNavigation.tsx'].every((f) => /aria-hidden="true"[\s\S]{0,120}(?:fixed|absolute) inset-0/.test(src(f))));

// 2.4.1 bypass blocks: a skip link first on both visitor apps, and a target for it
ok('a skip link is the first thing in the main app and in the coach, and each has a focusable target', /<SkipLink \/>/.test(src('src/app/App.tsx')) && /<SkipLink \/>/.test(src('src/coach/CoachPage.tsx')) && /id="main-content"/.test(src('src/app/App.tsx')) && /id="main-content"/.test(src('src/coach/CoachDemo.tsx')) && /id="main-content"/.test(src('src/coach/SessionKeyPicker.tsx')) && /Skip to main content/.test(src('src/app/components/SkipLink.tsx')));

// 2.4.11, 2.4.12, 2.4.13: a clear focus outline on everything, and focus never hidden behind fixed parts
const css = src('src/styles/globals.css');
ok('every focused control has a solid outline of at least 3px, with a 2px gap', /:focus-visible \{ outline: 3px solid var\(--focus-ring\) !important; outline-offset: 2px !important; \}/.test(css));
const lin = (c: number) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const Y = (h: string) => 0.2126 * lin(parseInt(h.slice(1, 3), 16)) + 0.7152 * lin(parseInt(h.slice(3, 5), 16)) + 0.0722 * lin(parseInt(h.slice(5, 7), 16));
const ratio = (a: string, b: string) => { const [x, y] = [Y(a), Y(b)]; return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const lightRing = /:root \{ --focus-ring: (#[0-9A-F]{6}); \}/.exec(css)![1], darkRing = /\.dark \{ --focus-ring: (#[0-9A-F]{6}); \}/.exec(css)![1];
ok('the focus outline is at least 3:1 against the page, the cards and the dark page (2.4.13)', ratio(lightRing, '#DCD9D6') >= 3 && ratio(lightRing, '#FFFFFF') >= 3 && ratio(darkRing, '#1A1512') >= 3 && ratio(darkRing, '#2D2621') >= 3, `${ratio(lightRing, '#DCD9D6').toFixed(1)}, ${ratio(darkRing, '#1A1512').toFixed(1)}`);
ok('a focused control is scrolled clear of the fixed header and the bottom controls', /scroll-padding-top: 5rem/.test(css) && /scroll-padding-bottom: 6rem/.test(css));

// 2.5.5 target size (AAA): the shared button is 44px or more in every size
const button = src('src/app/components/ui/button.tsx');
const sizeBlock = button.slice(button.indexOf('size: {'), button.indexOf('defaultVariants'));
const sizes = [...sizeBlock.matchAll(/^\s*(?:default|sm|lg|icon): "([^"]*)"/gm)].map((m) => m[1]);
ok('every size of the shared button is at least 44px high (h-11, h-12 or size-11)', sizes.length === 4 && sizes.every((c) => /\b(h-1[1-9]|size-1[1-9])\b/.test(c)), sizes.join(' | '));
ok('the header Share button is 44px', /size-11/.test(src('src/app/components/ShareNenya.tsx')) && /h-11/.test(src('src/app/components/ShareNenya.tsx')));

// 1.4.8 (AAA): lines at most 80 characters, not justified
ok('text lines in the scrolling pages are at most 80 characters wide', /\.scroll-container p:not\(\[class\*="text-center"\]\)[\s\S]*max-width: 80ch/.test(css));
ok('no text is justified', !files.some((f) => /\btext-justify\b/.test(readFileSync(f, 'utf8'))) && !/text-align:\s*justify/.test(css));

// 2.3.3 / 2.2.2: motion stops for people who ask
ok('the stylesheet honors a request for reduced motion', (css.match(/prefers-reduced-motion: reduce/g) ?? []).length >= 3);

// 3.1.1: the language of every page
ok('every page declares its language', ['index.html', 'coach/index.html', 'cell/index.html', 'verify/index.html', 'my-transcript/index.html'].every((f) => /<html lang="en"/.test(src(f))));
// 1.4.4 / 1.4.10: zoom is allowed
ok('pinch zoom is not disabled', !/user-scalable=no/.test(src('index.html')) && !/maximum-scale=1(?:\.0)?[,"]/.test(src('index.html')));
