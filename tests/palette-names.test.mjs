// The sixteen palettes are shown by their outward names only (docs/valar-rename-scope.md): no Tolkien name and not the word "Valar" in anything a visitor
// sees. Pages are rendered the way tests/render.test.mjs does, and the public pages and README are read as text. The internal ids stay in the code.
import { createServer } from 'vite';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { readFileSync, readdirSync } from 'node:fs';
import { ok } from './helpers.mts';

const root = fileURLToPath(new URL('..', import.meta.url));
const store = {};
globalThis.localStorage = { get length() { return Object.keys(store).length; }, key: (i) => Object.keys(store)[i] ?? null, getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } };
globalThis.window ??= { addEventListener() {}, removeEventListener() {}, matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }) };
const require = createRequire(root + 'package.json');
const React = require('react');
const { renderToString } = require('react-dom/server');
const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const text = (html) => html.replace(/<[^>]*>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ');

try {
  const { PALETTE_DISPLAY_NAMES, HIDDEN_NAMES, displayNameFor } = await vite.ssrLoadModule('/src/lib/paletteNames.ts');
  const hidden = new RegExp(`(?<![A-Za-z\u00C0-\u00FF])(?:${HIDDEN_NAMES.map((n) => n.normalize('NFC')).join('|')})(?![A-Za-z\u00C0-\u00FF])`, 'i'); // not inside a longer word (the designer's name is Est\u00EBlle)
  const shows = (s) => hidden.exec(s.normalize('NFC'));

  const outward = [...new Set(Object.values(PALETTE_DISPLAY_NAMES))];
  ok('sixteen outward names, each distinct, none a Tolkien name', outward.length === 16 && new Set(outward.map((n) => n.toLowerCase())).size === 16 && outward.every((n) => !shows(n)), outward.join(', '));
  ok('an id with no outward name is shown as it is (so adding a palette without a name is visible, not silent)', displayNameFor('Unknown') === 'Unknown' && displayNameFor('Manwë') === 'Sky');

  const render = (Component, props) => { try { return renderToString(React.createElement(Component, props)); } catch (e) { return { error: e.message }; } };

  const { ValarColorPicker } = await vite.ssrLoadModule('/src/app/components/ValarColorPicker.tsx');
  const picker = render(ValarColorPicker, { selectedColor: '#7A9B9E', onColorChange() {} });
  ok('the colour picker renders, shows every outward name, and none of the older ones', typeof picker === 'string' && outward.every((n) => text(picker).includes(n)) && !shows(text(picker)), typeof picker === 'string' ? (shows(text(picker)) ?? [''])[0] : picker.error);

  const { default: Pantheon } = await vite.ssrLoadModule('/src/app/components/about/PantheonOfNeeds.tsx');
  const pantheon = render(Pantheon, {});
  ok('the Pantheon of Needs page renders with the outward names and no mention of the Valar', typeof pantheon === 'string' && outward.every((n) => text(pantheon).includes(n)) && !shows(text(pantheon)), typeof pantheon === 'string' ? (shows(text(pantheon)) ?? [''])[0] : pantheon.error);
  const pantheonSrc = readFileSync(root + 'src/app/components/about/PantheonOfNeeds.tsx', 'utf8').replace(/\/\/.*$/gm, '').replace(/^import .*$/gm, '');
  ok('the Pantheon page\'s source, including the text shown only when a card is open, names no palette by its older name', !shows(pantheonSrc), (shows(pantheonSrc) ?? [''])[0]);

  const { default: Founder } = await vite.ssrLoadModule('/src/app/components/about/AboutTheFounder.tsx');
  const founder = render(Founder, { onBack() {} });
  ok('the designer\'s page renders without the older names or "Valar"', typeof founder === 'string' && !shows(text(founder)), typeof founder === 'string' ? (shows(text(founder)) ?? [''])[0] : founder.error);

  const settingsSrc = readFileSync(root + 'src/app/components/AccessibilitySettings.tsx', 'utf8');
  const sightSrc = readFileSync(root + 'src/app/components/pages/SightGatewayPage.tsx', 'utf8');
  ok('the settings label and the Sight page say "Palette Orbit" and "the sixteen palettes"', /Palette Orbit/.test(settingsSrc) && !/>\s*Valar Orbit/.test(settingsSrc) && !/Browse the Valar palettes/.test(sightSrc) && /Browse the sixteen palettes/.test(sightSrc));

  // public documents: the sharing pages and the README
  const pub = readdirSync(root + 'public').filter((f) => f.endsWith('.html'));
  const bad = pub.filter((f) => shows(text(readFileSync(root + 'public/' + f, 'utf8'))));
  ok('the public pages (about-nenya.html, why-nenya.html and the rest) name no palette by its older name and do not say "Valar"', bad.length === 0, bad.map((f) => `${f}: ${(shows(text(readFileSync(root + 'public/' + f, 'utf8'))) ?? [''])[0]}`).join(' | '));
  const fanFacing = pub.filter((f) => /rings of power|amazon|wellness or reflection tool inspired/i.test(text(readFileSync(root + 'public/' + f, 'utf8'))) || /rings of power|inspired by (?:the )?lord of the rings/i.test(readFileSync(root + 'public/' + f, 'utf8')));
  ok('the public pages no longer court fans of the books or the series (no series note, no "tool inspired by The Lord of the Rings" question, in the page or its structured data)', fanFacing.length === 0, fanFacing.join(', '));
  const readme = readFileSync(root + 'README.md', 'utf8');
  ok('the README does not say "Valar"', !/\bValar\b/.test(readme));
  const llms = readFileSync(root + 'public/llms.txt', 'utf8');
  ok('the llms.txt summary for AI crawlers does not either', !shows(llms));
  const manifest = readFileSync(root + 'public/manifest.json', 'utf8');
  ok('nor the web manifest', !shows(manifest));
} finally {
  await vite.close();
}
