// Renders real pages on the server, because a build can pass while a page still crashes the moment it
// renders (this caught a use-before-declaration bug the build missed). Vite loads the source the same way the
// browser build does; no browser is involved.
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

try {
  const { default: CoachDemo } = await vite.ssrLoadModule('/src/coach/CoachDemo.tsx');
  const colors = { color1: '#7A9B9E', color2: '#DAC682' };

  let h = render(CoachDemo, { colors });
  ok('coach: a fresh visit renders the consent screen', typeof h === 'string' && h.includes('A short conversation with the Nenya coach'), h.error ?? '');

  store['nenya.coach.rest'] = String(Date.now() - 3600000);
  h = render(CoachDemo, { colors });
  ok('coach: inside the 12-hour rest it shows the resting screen with Venice and sharing', typeof h === 'string' && h.includes('resting') && h.includes('Share Nenya') && h.includes('venice.ai/c/nenya-20'), h.error ?? '');

  store['nenya.coach.rest'] = String(Date.now() - 13 * 3600000);
  h = render(CoachDemo, { colors });
  ok('coach: after 12 hours it opens again', typeof h === 'string' && h.includes('A short conversation'), h.error ?? '');

  store['nenya.coach.rest'] = String(Date.now() - 3600000);
  store['nenya.coach.owner'] = '1';
  h = render(CoachDemo, { colors });
  ok('coach: the owner flag skips the rest', typeof h === 'string' && h.includes('A short conversation'), h.error ?? '');
  delete store['nenya.coach.rest']; delete store['nenya.coach.owner'];

  const { default: Review } = await vite.ssrLoadModule('/src/app/components/pages/GatewayReviewPage.tsx');
  const noop = () => {};
  h = render(Review, {
    gatewayData: [{ gateway: 'sight', data: { color1: '#7A9B9E', color2: '#DAC682', color1Qualities: [], color2Qualities: [] } }],
    selectedGateways: ['sight'], bodyMapData: { placements: [], notes: {} }, onEditGateway: noop, onContinue: noop, onBack: noop,
  });
  ok('review page: renders with the Venice link and its disclosure', typeof h === 'string' && h.includes('Take it to Venice') && h.includes('venice.ai/c/nenya-20') && h.includes('referral code'), h.error ?? '');

  // The first-visit panel gates the whole site, so it must be visible in the very first render: no layer may
  // start at opacity 0 waiting for the animation engine to arrive.
  const { default: Onboarding } = await vite.ssrLoadModule('/src/app/components/OnboardingFlow.tsx');
  h = render(Onboarding, { technique: { ih: 5000, hi: 0, ex: 5000, ho: 0 }, onTechniqueChange: noop, onStepChange: noop, onFinish: noop });
  ok('first-visit panel: renders its dialog and the rhythm choice', typeof h === 'string' && h.includes('role="dialog"') && h.includes('onboarding-title'), h.error ?? '');
  ok('first-visit panel: no layer starts invisible', typeof h === 'string' && !/opacity:\s*0(?![.\d])/.test(h.replace(/<style>[\s\S]*?<\/style>/g, '')), 'found an inline opacity: 0');
  ok('first-visit panel: entrance is done with CSS classes', typeof h === 'string' && h.includes('onb-fade-in') && h.includes('onb-card-in') && h.includes('onb-step-in'));

  // The logo: orbit view with the spectral gem and the baked glow. Effects do not run on the server, so this
  // checks the structure; the drawing itself is checked by the breath-clock and glow-bake tests.
  const { default: Logo } = await vite.ssrLoadModule('/src/app/components/NenyaLogo.tsx');
  h = render(Logo, { size: 300, showValarOrbit: true, showLogo: true, glow: true, technique: { ih: 4000, hi: 7000, ex: 8000, ho: 0 }, cycleStart: 0 });
  const canvases = typeof h === 'string' ? (h.match(/<canvas/g) ?? []).length : 0;
  ok('logo (orbit view): renders the gem canvases, the gold bezel and the two glow images', typeof h === 'string' && canvases === 5, h.error ?? `${canvases} canvases`);
  ok('logo (orbit view): the overlay gem layer blends with overlay', typeof h === 'string' && h.includes('mix-blend-mode:overlay'));
  ok('logo (orbit view): the outer orbs carry the box-shadow glow class', typeof h === 'string' && h.includes('nenya-orb-glow'));
  ok('logo (orbit view): the logo isolates its blending', typeof h === 'string' && h.includes('isolation:isolate'));
  h = render(Logo, { size: 32 });
  ok('logo (header mark): a plain flat image, no canvases, no glow', typeof h === 'string' && !h.includes('<canvas') && h.includes('<img'), h.error ?? '');
  h = render(Logo, { size: 300, showValarOrbit: true, showLogo: false, glow: true });
  ok('logo (hidden): no gem and no glow when the logo is hidden', typeof h === 'string' && !h.includes('<canvas'), h.error ?? '');
} finally {
  await vite.close();
}
