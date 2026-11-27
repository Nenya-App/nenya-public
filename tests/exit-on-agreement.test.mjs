// The Emergency Exit on the first agreement screen (owner, 2026-11-27): on a phone the pinned button covered the panel's heading, so there it sits by the
// Agree and Decline buttons instead. Wherever the pinned button and the page's header button would both show, the pinned one lies exactly over the
// header's place and the header's is hidden, so only one is ever seen. Layout itself is checked in a browser, not here.
import { createServer } from 'vite';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';
import { ok } from './helpers.mts';

const root = fileURLToPath(new URL('..', import.meta.url));
globalThis.localStorage = { length: 0, key: () => null, getItem: () => null, setItem() {}, removeItem() {} };
globalThis.window ??= { addEventListener() {}, removeEventListener() {}, matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }) };
const require = createRequire(root + 'package.json');
const React = require('react');
const { renderToString } = require('react-dom/server');
const src = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const vite = await createServer({ root, mode: 'test', server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const noop = () => {};
const panelExit = /<div[^>]*class="[^"]*\bsm:hidden\b[^"]*"[^>]*role="region"[^>]*aria-label="Emergency exit"|<div[^>]*role="region"[^>]*aria-label="Emergency exit"[^>]*class="[^"]*\bsm:hidden\b/;

try {
  const { default: Onboarding } = await vite.ssrLoadModule('/src/app/components/OnboardingFlow.tsx');
  const technique = { ih: 5000, hi: 0, ex: 5000, ho: 0 };
  let h = renderToString(React.createElement(Onboarding, { technique, onTechniqueChange: noop, onFinish: noop, skipRhythm: true }));
  const at = h.search(panelExit);
  ok('the agreement screen holds an Exit for phones only', at > -1);
  ok('it comes after the Agree and Decline buttons', at > h.indexOf('Agree, Enter') && at > h.search(/>(Decline|Disagree, Exit)</));
  ok('it is the Exit itself, with its information button, at the full touch height', /aria-label="Emergency exit - Instant redirect/.test(h.slice(at)) && /aria-label="Emergency exit information"/.test(h.slice(at)) && /min-h-11/.test(h.slice(at)));
  h = renderToString(React.createElement(Onboarding, { technique, onTechniqueChange: noop, onFinish: noop }));
  ok('the rhythm step before it has none (the pinned one is used there)', h.search(panelExit) === -1 && !h.includes('Instant redirect'));

  // Decline leaves the page (owner, 2026-11-27): no popup repeating the plain-English text; that is linked at the bottom of the panel instead.
  const flow = src('src/app/components/OnboardingFlow.tsx');
  ok('Decline leaves the page in both builds, without counting, signing or remembering anything', /const handleDecline = \(\) => \{\s*onEmergencyExit\?\.\(\);\s*try \{\s*window\.close\(\);\s*\} catch \{[^}]*\}\s*window\.location\.replace\('about:blank'\);\s*\};/.test(flow) && /onClick=\{handleDecline\}/.test(flow));
  ok('and there is no popup after it any more', !existsSync(new URL('../src/app/components/DeclinePopout.tsx', import.meta.url)) && !/DeclinePopout|showDecline/.test(flow));
  const bottom = flow.slice(flow.indexOf('Agree, Enter\n'));
  ok('the plain-English text is linked again below the buttons, and opens at its top', /\{termsFirst && \([\s\S]{0,120}onClick=\{togglePlain\}/.test(bottom) && /showPlain \? 'Back to the Terms' : 'In plain English'/.test(bottom) && /const togglePlain = \(\) => \{\s*setShowPlain\(\(v\) => !v\);\s*scrollRef\.current\?\.scrollTo\(\{ top: 0 \}\);\s*\};/.test(flow));
  ok('on short screens only the bottom one shows, so the Terms keep room to be read', flow.slice(0, flow.indexOf('Agree, Enter\n')).includes('[@media(max-height:700px)]:hidden'));
  ok('the scroll arrows stay at the foot of the reading area, not over the buttons or the Exit', /\{termsFirst && showPlain \? <PlainEnglish \/> : <LegalDocumentBody compact \/>\}\s*<\/div>\s*<ScrollIndicator containerRef=\{scrollRef\} hideThreshold=\{50\} className="absolute! bottom-1!" \/>\s*<\/div>/.test(flow));
  ok('the link at the top does the same', (flow.match(/onClick=\{togglePlain\}/g) ?? []).length === 2);

  const app = src('src/app/App.tsx');
  ok('the main page hides its pinned Exit on phones only while the agreement step is showing', /phoneHidden=\{veilGone && !termsAgreed && onboardingStep === 'terms'\}/.test(app) && /onStepChange=\{setOnboardingStep\}/.test(app));
  ok('and the panel’s Exit leaves the same way the others do', /<OnboardingFlow[\s\S]{0,400}?onEmergencyExit=\{\(\) => \{ isEmergencyExiting\.current = true; \}\}/.test(app));
  const coach = src('src/coach/CoachPage.tsx');
  ok('the coach page, which opens on the same panel, does the same', /EmergencyExitDock show=\{popoutOpen \|\| !agreed\} phoneHidden=\{!agreed\}/.test(coach) && /<OnboardingFlow skipRhythm[^\n]*onEmergencyExit=\{/.test(coach));

  const exit = src('src/app/components/EmergencyExit.tsx');
  const nav = src('src/app/components/GlobalNavigation.tsx');
  ok('both header Exits are marked as the places the pinned one covers', /home="desktop"/.test(nav) && /home="mobile"/.test(nav) && /data-exit-home=\{home\}/.test(exit));
  ok('the pinned one takes the header’s place and size, hides the header’s while it shows, and gives it back', /querySelectorAll<HTMLElement>\('\[data-exit-home\]'\)/.test(exit) && /getBoundingClientRect\(\)/.test(exit) && /style\.visibility = 'hidden'/.test(exit) && /style\.visibility = ''/.test(exit) && /MOBILE_HEADER_EXIT_CLASS/.test(exit) && /MOBILE_HEADER_EXIT_CLASS/.test(nav));
} finally {
  await vite.close();
}
