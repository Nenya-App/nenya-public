// Renders the new screens on the server (as tests/render.test.mjs does): the coach's mode choice, the sealed
// conversation, and partner practice, so a screen that crashes on first render is caught without a browser.
import { createServer } from 'vite';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';

const root = fileURLToPath(new URL('..', import.meta.url));
const store = {};
globalThis.localStorage = {
  get length() { return Object.keys(store).length; },
  key: (i) => Object.keys(store)[i] ?? null,
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
};
globalThis.window ??= {
  addEventListener() {}, removeEventListener() {},
  matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
};
const require = createRequire(root + 'package.json');
const React = require('react');
const { renderToString } = require('react-dom/server');
const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const render = (Component, props) => {
  try { return renderToString(React.createElement(Component, props)); } catch (e) { return { error: e.message }; }
};
const src = (p) => readFileSync(root + p, 'utf8');

try {
  const { default: ModeChooser } = await vite.ssrLoadModule('/src/coach/ModeChooser.tsx');
  let h = render(ModeChooser, { onChoose() {}, onBack() {} });
  ok('mode choice renders both modes, with who can read and whether a record can be signed', typeof h === 'string' && h.includes('Witnessed') && h.includes('Sealed') && h.includes('Who can read your words') && h.includes('cannot sign them'), h.error ?? '');
  ok('mode choice never calls the witnessed coach end-to-end', typeof h === 'string' && h.includes('Not end-to-end'));

  const { default: SealedChat } = await vite.ssrLoadModule('/src/coach/SealedChat.tsx');
  h = render(SealedChat, { colors: { color1: '#7A9B9E', color2: '#DAC682' }, onBack() {} });
  ok('the sealed conversation renders, checking the enclave first and with sending disabled until then', typeof h === 'string' && h.includes('Checking the enclave') && h.includes('Seal and send') && /<button[^>]*disabled[^>]*type="submit"|type="submit"[^>]*disabled/.test(h), h.error ?? '');

  const { default: CellPage } = await vite.ssrLoadModule('/src/cell/CellPage.tsx');
  h = render(CellPage, {});
  ok('partner practice renders (loading, until it asks whether cells are open)', typeof h === 'string' && h.includes('Partner practice') && h.includes('Loading'), h.error ?? '');

  ok('the coach page offers the choice only when the server says sealed mode is on', /fetch\('\/api\/coach\?modes'/.test(src('src/coach/CoachPage.tsx')) && /sealedOffered && mode === null/.test(src('src/coach/CoachPage.tsx')));
  ok('the /cell page is built, rewritten like /coach, and not indexed', /cell: path\.resolve\(__dirname, 'cell\/index\.html'\)/.test(src('vite.config.ts')) && /from = "\/cell"\s+to = "\/cell\/index\.html"/.test(src('netlify.toml')) && /noindex/.test(src('cell/index.html')));
  ok('the About page links to /cell only when cells are open', /fetch\('\/api\/cell\?status'/.test(src('src/app/components/about/PartnerPractice.tsx')) && /cellOpen &&/.test(src('src/app/components/about/PartnerPractice.tsx')));
  ok('the Terms draft exists and is not applied', /a draft, not applied/.test(src('docs/drafts/terms-sealed-and-partner-draft.md')) && !/Partner Practice/.test(src('src/lib/legalDocument.ts').replace(/'Partner Practice'/g, '')));
} finally {
  await vite.close();
}
