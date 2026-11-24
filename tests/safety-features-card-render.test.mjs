// Renders the safety features card and the safety notice on the server (as tests/render.test.mjs does), to check what a person is given: the card is closed,
// is a real button with the right attributes, holds the approved words, and sits under the help lines only in the abuse notices.
import { createServer } from 'vite';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
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
globalThis.window ??= { addEventListener() {}, removeEventListener() {}, matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }) };

const require = createRequire(root + 'package.json');
const React = require('react');
const { renderToString, renderToStaticMarkup } = require('react-dom/server');
const vite = await createServer({ root, mode: 'test', server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const render = (Component, props, fn = renderToString) => { try { return fn(React.createElement(Component, props)); } catch (e) { return { error: e.message }; } };
const decode = (h) => h.replace(/<[^>]+>/g, ' ').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

try {
  const { SafetyFeaturesCard } = await vite.ssrLoadModule('/src/app/components/SafetyFeaturesCard.tsx');
  const { FlagNotice } = await vite.ssrLoadModule('/src/coach/FlagNotice.tsx');
  const { safetyCardText, SAFETY_CARD_TITLE } = await vite.ssrLoadModule('/src/lib/safetyFeaturesCard.ts');

  const h = render(SafetyFeaturesCard, {});
  ok('the card renders', typeof h === 'string', h.error ?? '');
  ok('it is closed: the button says aria-expanded="false", names its body with aria-controls, and the body is hidden', typeof h === 'string' && /<button[^>]*type="button"[^>]*aria-expanded="false"[^>]*aria-controls="([^"]+)"/.test(h) && /<div id="([^"]+)" role="region" aria-labelledby="([^"]+)" hidden=""/.test(h));
  const ctl = /aria-controls="([^"]+)"/.exec(h)?.[1], body = /<div id="([^"]+)" role="region"/.exec(h)?.[1], lab = /aria-labelledby="([^"]+)"/.exec(h)?.[1], btn = /<button[^>]*id="([^"]+)"/.exec(h)?.[1];
  ok('the ids agree: the button controls the body and the body is named by the button', !!ctl && ctl === body && !!btn && btn === lab);
  ok('the button carries the approved title, in a heading', h.includes(`<h3 class="m-0 text-sm font-medium"><button`) && decode(h).startsWith(SAFETY_CARD_TITLE));
  // The words are in the page (hidden until opened, so a screen reader finds nothing until it is opened), exactly the approved ones.
  const words = decode(h);
  const expected = safetyCardText(false).split('\n').filter((l) => l && !l.startsWith('## ')).map((l) => l.replace(/^- /, '').replace(/'/g, "'"));
  ok('every approved line is on the page in order', (() => { let at = 0; return expected.every((l) => { const i = words.indexOf(decode(l.replace(/&/g, '&amp;')), at); if (i < 0) return false; at = i; return true; }); })(), expected.filter((l) => !words.includes(l)).join(' | '));
  ok('there is nothing to click inside the body: no link, no input, no form, so the card sends nothing and asks for nothing', !/<a |<input|<form|<textarea|<img/.test(h));

  const flag = (category, kind, tier = 'stop') => ({ category, tier, label: category, ...(kind ? { kind } : {}) });
  const notice = (f, props = {}) => render(FlagNotice, { flag: f, flaggedMessage: 'a message', ...props });
  const showing = [flag('abuse', 'partner-or-family'), flag('abuse', 'control-or-fear', 'soften'), flag('abuse', 'child-or-dependent'), flag('abuse', 'sexual'), flag('abuse', 'trafficking'), flag('abuse'), flag('harm-others', 'admitted-partner')];
  const hiding = [flag('self-harm'), flag('self-harm', 'imminent'), flag('self-injury', 'present', 'soften'), flag('self-injury', 'emergency'), flag('distress', undefined, 'soften'), flag('harm-others', 'admitted'), flag('harm-others', 'graphic'), flag('harm-others', 'admitted-child')];
  ok('the abuse notices and the admitted-partner notice show the card', showing.every((f) => { const n = notice(f); return typeof n === 'string' && n.includes('data-safety-card'); }));
  ok('no other notice shows it (suicide, self-harm, hurting yourself, distress, the other admissions, graphic violence)', hiding.every((f) => { const n = notice(f); return typeof n === 'string' && !n.includes('data-safety-card') && !n.includes(SAFETY_CARD_TITLE); }));
  const n = notice(flag('abuse', 'partner-or-family'));
  ok('in the notice the card comes after the help lines, and the help lines are all still there', typeof n === 'string' && n.indexOf('National Domestic Violence Hotline') > 0 && n.indexOf('Immediate danger') > 0 && n.indexOf('data-safety-card') > n.indexOf('Immediate danger') && n.indexOf('data-safety-card') > n.indexOf('National Domestic Violence Hotline'));
  ok('in the notice it is still closed', typeof n === 'string' && /aria-expanded="false"/.test(n));
  ok('a notice for the report source (a part of a report the person chose to share) shows it for abuse as well', typeof notice(flag('abuse', 'control-or-fear', 'soften'), { source: 'report' }) === 'string' && notice(flag('abuse', 'control-or-fear', 'soften'), { source: 'report' }).includes('data-safety-card'));
  ok('the partner cell can turn it off', !notice(flag('abuse', 'partner-or-family'), { safetyCard: false }).includes('data-safety-card'));
  ok('the person\'s own words never reach the card: the flagged message does not appear in the card\'s markup', !/some private words/.test(notice(flag('abuse', 'partner-or-family'), { flaggedMessage: 'some private words' })));
} finally {
  await vite.close();
}
