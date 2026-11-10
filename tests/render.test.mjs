// Renders real pages on the server, because a build can pass while a page still crashes the moment it
// renders (this caught a use-before-declaration bug the build missed). Vite loads the source the same way the
// browser build does; no browser is involved.
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

try {
  const { default: CoachDemo } = await vite.ssrLoadModule('/src/coach/CoachDemo.tsx');
  const colors = { color1: '#7A9B9E', color2: '#DAC682' };

  let h = render(CoachDemo, { colors });
  ok('coach: a fresh visit renders the consent screen', typeof h === 'string' && h.includes('A short conversation with the Nenya coach'), h.error ?? '');

  store['nenya.coach.rest'] = String(Date.now() - 3600000);
  h = render(CoachDemo, { colors });
  ok('coach: inside the 6-hour rest it shows the resting screen with Venice and sharing', typeof h === 'string' && h.includes('resting') && h.includes('Share Nenya') && h.includes('venice.ai/c/nenya-20'), h.error ?? '');

  store['nenya.coach.rest'] = String(Date.now() - 7 * 3600000);
  h = render(CoachDemo, { colors });
  ok('coach: after 6 hours it opens again', typeof h === 'string' && h.includes('A short conversation'), h.error ?? '');

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
  ok('first-visit panel: the steps ease in with a CSS class; the panel itself has no entrance (it is already there, solid, when the loading screen fades)', typeof h === 'string' && h.includes('onb-step-in') && !h.includes('onb-fade-in') && !h.includes('onb-card-in'));
  ok('first-visit panel: Box breathing is one of the four main choices, and there is no skip link', typeof h === 'string' && h.includes('>Box<') && h.includes('>5·5<') && h.includes('>4·6<') && h.includes('>3·3<') && !h.includes('>4·8<') && !h.includes('Skip to terms'), h.error ?? '');
  ok('first-visit panel: says that not choosing is fine', typeof h === 'string' && h.includes('Not choosing is fine'), h.error ?? '');
  {
    const src = readFileSync(new URL('../src/app/components/OnboardingFlow.tsx', import.meta.url), 'utf8');
    const appSrc = readFileSync(new URL('../src/app/App.tsx', import.meta.url), 'utf8');
    ok('first-visit panel: mounted under the loading screen (not after it), and told when the loading screen has gone', /\{!termsAgreed && \(\s*<OnboardingFlow\s+veilGone=\{veilGone\}/.test(appSrc) && !/!termsAgreed && veilGone &&/.test(appSrc));
    ok('first-visit panel: completely solid behind the loading screen, then see-through', /opacity: isExiting \? 0 : veilGone \? 0\.75 : 1/.test(src) && /bg-background backdrop-blur/.test(src) && !/bg-background\/75/.test(src));
    ok('first-visit panel: hidden from assistive technology and the keyboard while the loading screen is over it', /inert: '', 'aria-hidden': 'true'/.test(src) && /if \(!veilGone\) return;/.test(src));
    h = render(Onboarding, { technique: { ih: 5000, hi: 0, ex: 5000, ho: 0 }, onTechniqueChange: noop, onFinish: noop, veilGone: false });
    ok('first-visit panel: rendered under the loading screen, it is inert, aria-hidden and fully solid', typeof h === 'string' && /inert=""/.test(h) && h.includes('aria-hidden="true"') && /opacity:1;transition:opacity 0\.9s/.test(h), h.error ?? '');
    h = render(Onboarding, { technique: { ih: 5000, hi: 0, ex: 5000, ho: 0 }, onTechniqueChange: noop, onFinish: noop, skipRhythm: true });
    ok('first-visit panel: arriving on another page (skipRhythm) opens on the terms, with no rhythm choice and no step dots', typeof h === 'string' && h.includes('Terms of Use') && h.includes('Agree, Enter') && !h.includes('Not choosing is fine') && !h.includes('>Box<') && !h.includes('h-1.5 rounded-full'), h.error ?? '');
    ok('first-visit panel: the App skips the rhythm only when the visitor arrived on an About page, and does not count a rhythm that was never chosen', /skipRhythm=\{arrivedElsewhere\}/.test(appSrc) && /arrivedElsewhere\] = useState\(initialAbout !== null\)/.test(appSrc) && /rhythm && !arrivedElsewhere/.test(appSrc));
    {
      const coachPage = readFileSync(new URL('../src/coach/CoachPage.tsx', import.meta.url), 'utf8');
      ok('the coach page: reached only after the terms are accepted (the same panel, opened on the terms), unless the agreement was remembered for these terms', /useState\(\(\) => termsAcceptedFor\(LEGAL_EFFECTIVE_DATE\)\)/.test(coachPage) && /\{!agreed && <OnboardingFlow skipRhythm/.test(coachPage));
      ok('the coach page: nothing behind the panel is mounted or reachable until then, the Emergency Exit stays reachable, and counting begins only after agreement', /\{!agreed \? null : !colors/.test(coachPage) && /inert: ''/.test(coachPage) && /EmergencyExitDock show=\{popoutOpen \|\| !agreed\}/.test(coachPage) && /if \(agreed\) enableUsageCounts\(\)/.test(coachPage));
    }
    ok('first-visit panel: goes straight from the rhythm to the terms', /STEPS: OnboardingStep\[\] = \['rhythm', 'terms'\]/.test(src) && !/'counter'|'process'/.test(src));
  }
  // Bringing part of a report to the coach: listed in pieces with nothing chosen, never read or sent unless the visitor chooses.
  {
    const { ReportShare } = await vite.ssrLoadModule('/src/coach/ReportShare.tsx');
    const report = { gatewayData: [{ gateway: 'sight', data: { color1: '#1B4F6E', color2: '#123456' } }, { gateway: 'sound', data: { currentPitch: 30, currentVolume: 20, potentialPitch: 60, potentialVolume: 50 } }], bodyMap: { placements: [{ bodyPartId: 'chest', color: '#E3752B' }], notes: {} } };
    h = render(ReportShare, { report, shared: null, onChange: noop });
    ok('report sharing: offered as optional, listed in pieces, and NOTHING is chosen for the visitor', typeof h === 'string' && h.includes('Bring something from a report you made (optional)') && h.includes('Sight - Chromesthesia') && h.includes('Sound - Audition') && h.includes('Body map') && !/checked=""/.test(h) && !h.includes('This is exactly what the coach would be given'), h.error ?? '');
    ok('report sharing: "No thanks" is as plain as "Share these", and the page says no report is needed and what travels how', typeof h === 'string' && h.includes('No thanks, I would rather talk about something else') && h.includes('Share these') && h.includes('You do not need a report') && h.includes('not a measurement'), h.error ?? '');
    h = render(ReportShare, { shared: null, onChange: noop });
    ok('report sharing: with no report in memory a saved one can be pasted instead (and nothing else is shown)', typeof h === 'string' && h.includes('Paste a saved report') && h.includes('Read it') && !h.includes('Choose the pieces'), h.error ?? '');
    const demo = readFileSync(new URL('../src/coach/CoachDemo.tsx', import.meta.url), 'utf8');
    ok('report sharing: the chosen text goes with every request, opens the conversation in place of the greeting, and a flag shows the notice without ending anything', /\.\.\.\(shared \? \{ context: shared\.text \} : \{\}\)/.test(demo) && /shared \? openingText\(shared\.meta\) : GREETING/.test(demo) && /contextFlag && !flag && <FlagNotice flag=\{contextFlag\}/.test(demo) && /setContextFlag\(next \? checkConversation\(\[next\.text\]\) : null\)/.test(demo) && /data\.blocked === 'context'/.test(demo));
  }
  // Suggesting a name for a colour: offered on request, announced to screen readers, nothing loaded or sent before it is pressed.
  {
    const { ColorNameSuggest } = await vite.ssrLoadModule('/src/app/components/ColorNameSuggest.tsx');
    h = render(ColorNameSuggest, { label: 'Current state', hex: '#1B4F6E', onUse: noop });
    ok('colour names: a plain "Suggest a name" button and a polite live region for screen readers, and no suggestion until it is pressed', typeof h === 'string' && h.includes('Suggest a name') && /role="status"[^>]*aria-live="polite"[^>]*class="sr-only"|aria-live="polite"[^>]*role="status"/.test(h) && !h.includes('A name that might fit') && !h.includes('Use this name'), h.error ?? '');
    const sight = readFileSync(new URL('../src/app/components/pages/SightGatewayPage.tsx', import.meta.url), 'utf8');
    ok('colour names: offered for both the current-state and the wish colour, and a chosen name goes into the person\'s own words field', /<ColorNameSuggest label="Current state" hex=\{color1\} onUse=\{\(n\) => setColor1Name/.test(sight) && /<ColorNameSuggest label="Wish" hex=\{color2\} onUse=\{\(n\) => setColor2Name/.test(sight));
    const lib = readFileSync(new URL('../src/lib/colorNames.ts', import.meta.url), 'utf8');
    ok('colour names: the list is a separate file loaded only on request (a dynamic import), never at page load', /import\('color-name-list\/bestof'\)/.test(lib) && !/^import .*color-name-list/m.test(lib));
  }
  // Palettes in the Sight gateway: optional, made on the device by default, and the one online choice says what it sends before it is pressed.
  {
    const { PalettePanel } = await vite.ssrLoadModule('/src/app/components/PalettePanel.tsx');
    h = render(PalettePanel, { color1: '#1B4F6E', color2: '#E3752B', value: null, onChange: noop });
    ok('palettes: optional, with a bridge and the kinds of harmony, and nothing is made or asked until a button is pressed', typeof h === 'string' && h.includes('Make a palette from these colors (optional)') && h.includes('Make a bridge') && h.includes('Make it on my device') && h.includes('Neighbors and opposite') && h.includes('Three evenly spaced') && !h.includes('Keep this palette in my report'), h.error ?? '');
    ok('palettes: the online button says what is sent, to whom, and that nothing else is, before it is pressed', typeof h === 'string' && h.includes('Ask The Color API') && h.includes('sends this one color, as a hex code, through our server to The Color API') && h.includes('Nothing else is sent, and we store nothing') && h.includes('sends nothing anywhere') && h.includes('no color has a fixed meaning'), h.error ?? '');
    h = render(PalettePanel, { color1: '#1B4F6E', color2: '#E3752B', value: { source: 'The Color API', kind: 'analogic', base: 'present', colors: [{ hex: '#1B4F6E', name: 'Seafarer' }, { hex: '#2D6F8E' }] }, onChange: noop });
    { const t = typeof h === 'string' ? h.replace(/<!-- -->/g, '') : ''; ok('palettes: a kept palette is shown with where it was made, and can be removed', t.includes('In your report: Palette you made') && t.includes('generated with The Color API') && t.includes('Seafarer #1B4F6E') && t.includes('Remove it'), h.error ?? ''); }
    const sightSrc = readFileSync(new URL('../src/app/components/pages/SightGatewayPage.tsx', import.meta.url), 'utf8');
    ok('palettes: the Sight gateway carries a kept palette into its data, and clears it when reset', /<PalettePanel color1=\{color1\} color2=\{color2\} value=\{generatedPalette\} onChange=\{setGeneratedPalette\}/.test(sightSrc) && /gradientDirection,\n\s+generatedPalette,/.test(sightSrc) && /setGeneratedPalette\(null\)/.test(sightSrc));
  }
  // The body map on the Sight gateway's page, and a kept palette in the PDF.
  {
    const { BodyMapAvatar } = await vite.ssrLoadModule('/src/app/components/BodyMapAvatar.tsx');
    h = render(BodyMapAvatar, { inline: true, onClose: noop, onSave: noop, userColors: { color1: '#1B4F6E', color2: '#E3752B' } });
    ok('body map, inline: a section of the page (not a full-screen window), with no Close or Save to hunt for', typeof h === 'string' && h.includes('Body emotion map (optional)') && !h.includes('fixed inset-0') && !h.includes('>Save Map<') && !h.includes('>Close<') && h.includes('Download Image') && h.includes('It saves as you go'), h.error ?? '');
    h = render(BodyMapAvatar, { onClose: noop, onSave: noop });
    ok('body map, in the other gateways: still the full-screen window with Close and Save Map', typeof h === 'string' && h.includes('fixed inset-0') && h.includes('Save Map') && h.includes('Close'), h.error ?? '');
    const sightPage = readFileSync(new URL('../src/app/components/pages/SightGatewayPage.tsx', import.meta.url), 'utf8');
    ok('the Sight gateway shows the body map on the page, beside the palette', /<BodyMapAvatar\s+inline/.test(sightPage) && !/setShowBodyMap/.test(sightPage));
    const pdfSrc = readFileSync(new URL('../src/lib/nenyaPdfReport.ts', import.meta.url), 'utf8');
    ok('the PDF report draws a kept palette as colour chips with their names written out in full (wrapped, not cut short)', /generatedPalette\?\.colors/.test(pdfSrc) && /label: `Palette \$\{i \+ 1\}`/.test(pdfSrc) && /caption: c\.name \?\? c\.hex/.test(pdfSrc) && /splitTextToSize\(s\.caption/.test(pdfSrc));
  }
  // The loading screen, the tour offer and the tour.
  const { LoadingVeil } = await vite.ssrLoadModule('/src/app/components/LoadingVeil.tsx');
  h = render(LoadingVeil, { ready: false, onDone: noop });
  ok('loading screen: shows a status message over the page, with no inline opacity of 0 at first', typeof h === 'string' && h.includes('role="status"') && h.includes('Preparing your space') && !/opacity:\s*0(?![.\d])/.test(h.replace(/<style>[\s\S]*?<\/style>/g, '')), h.error ?? '');
  const { preloadLogoAssets } = await vite.ssrLoadModule('/src/lib/preload.ts');
  ok('loading screen: the wait for the logo files always ends (no browser here, so every load fails)', (await Promise.race([preloadLogoAssets(50).then(() => 'done'), new Promise((r) => setTimeout(() => r('hung'), 2000))])) === 'done');
  ok('loading screen: waiting for the gem to draw also ends at the limit if it never does', (await Promise.race([preloadLogoAssets(50, true).then(() => 'done'), new Promise((r) => setTimeout(() => r('hung'), 2000))])) === 'done');
  {
    const logoSrc = readFileSync(new URL('../src/app/components/NenyaLogo.tsx', import.meta.url), 'utf8');
    const gemSrc = readFileSync(new URL('../src/app/components/SpectralGem.tsx', import.meta.url), 'utf8');
    const mainSrc = readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8');
    ok('inner orbs peak at 80% opacity', /INNER_ORB_OPACITY = \[0\.66, 0\.8, 0\.66\]/.test(logoSrc));
    ok('the gem reports its first drawn frame, and the downloads start before the page is drawn', /markGemDrawn\(\)/.test(gemSrc) && /startLogoDownloads\(\)/.test(mainSrc));
  }
  const { TourOffer } = await vite.ssrLoadModule('/src/app/components/TourOffer.tsx');
  h = render(TourOffer, { onAccept: noop, onDecline: noop });
  ok('tour offer: asks, with both a yes and a skip', typeof h === 'string' && h.includes('role="dialog"') && h.includes('Would you like a quick tour?') && h.includes('Show me around') && h.includes('Skip for now'), h.error ?? '');
  const { TUTORIAL_STEPS } = await vite.ssrLoadModule('/src/app/components/WelcomeTutorial.tsx');
  ok('tour: the logo, the counter, the header controls, the menu and accessibility, then the sensory reflection',
    TUTORIAL_STEPS.map((x) => x.id).join() === 'logo,counter,tools,accessibility,reflection');
  ok('tour: every step points at something that exists on the page', TUTORIAL_STEPS.every((x) => x.targetIds.every((id) => {
    const nav = readFileSync(new URL('../src/app/components/GlobalNavigation.tsx', import.meta.url), 'utf8');
    const page = readFileSync(new URL('../src/app/components/pages/WelcomePage.tsx', import.meta.url), 'utf8');
    const app = readFileSync(new URL('../src/app/App.tsx', import.meta.url), 'utf8');
    return [nav, page, app].some((t) => t.includes(`id="${id}"`));
  })));
  {
    const src = readFileSync(new URL('../src/app/components/WelcomeTutorial.tsx', import.meta.url), 'utf8');
    ok('tour: the highlighted part is left sharp (no blur) and the card is centred across the page', !/backdrop-blur/.test(src.split('{/* Card */}')[0]) && /cardLeft = Math\.max\(margin, \(viewportW/.test(src));
    ok('tour: the highlight waits for the scroll to settle before it is drawn', /setSettled\(false\)/.test(src) && /rect && settled/.test(src) && /stable >= 6/.test(src));
    ok('tour: the last step returns to the logo', /Back to the logo/.test(src) && /toTop\(\)/.test(src));
  }

  // The logo: orbit view with the spectral gem and the baked glow. Effects do not run on the server, so this
  // checks the structure; the drawing itself is checked by the breath-clock and glow-bake tests.
  const { default: Logo } = await vite.ssrLoadModule('/src/app/components/NenyaLogo.tsx');
  h = render(Logo, { size: 300, showValarOrbit: true, showLogo: true, glow: true, technique: { ih: 4000, hi: 7000, ex: 8000, ho: 0 }, cycleStart: 0 });
  const canvases = typeof h === 'string' ? (h.match(/<canvas/g) ?? []).length : 0;
  ok('logo (orbit view): renders the gem canvases, the vector bezel image and the two glow images', typeof h === 'string' && canvases === 4 && /<img[^>]*src="[^"]*(bezel|svg)/.test(h), h.error ?? `${canvases} canvases`);
  ok('logo (orbit view): the overlay gem layer blends with overlay', typeof h === 'string' && h.includes('mix-blend-mode:overlay'));
  ok('logo (orbit view): the last inner orbs are cut away where the first ones overlap them', typeof h === 'string' && (h.match(/mask-image:radial-gradient/g) ?? []).length >= 8, `${(h.match(/mask-image:radial-gradient/g) ?? []).length} mask-image uses`);
  ok('logo (orbit view): the outer orbs carry the box-shadow glow class', typeof h === 'string' && h.includes('nenya-orb-glow'));
  ok('logo (orbit view): the logo isolates its blending', typeof h === 'string' && h.includes('isolation:isolate'));
  h = render(Logo, { size: 32 });
  ok('logo (header mark): a plain flat image, no canvases, no glow', typeof h === 'string' && !h.includes('<canvas') && h.includes('<img'), h.error ?? '');
  h = render(Logo, { size: 300, showValarOrbit: true, showLogo: false, glow: true });
  ok('logo (hidden): no gem and no glow when the logo is hidden', typeof h === 'string' && !h.includes('<canvas'), h.error ?? '');

  // The breathing ring's smallest size can be set; by default it is 0.25 of its full size.
  const { ValarBreathingLogo } = await vite.ssrLoadModule('/src/app/components/ValarBreathingLogo.tsx');
  const ringCss = (props) => { const x = render(ValarBreathingLogo, { logoSize: 200, cycleStart: 0, ...props, children: null }); return typeof x === 'string' ? x : ''; };
  ok('breathing ring: its smallest size defaults to 0.25', /scale\(0\.25\)/.test(ringCss({})) && !/scale\(0\.1\)/.test(ringCss({})));
  ok('breathing ring: the smallest size can be set', /scale\(0\.4\)/.test(ringCss({ minScale: 0.4 })) && !/scale\(0\.25\)/.test(ringCss({ minScale: 0.4 })));

  // Forget me: a short button with helper text in the settings window, and the same thing as a link in the footer.
  const { DeviceMemoryControls, ForgetMeLink } = await vite.ssrLoadModule('/src/app/components/DeviceMemoryControls.tsx');
  h = render(DeviceMemoryControls, {});
  ok('settings: the erase button says "Forget me" with helper text under it', typeof h === 'string' && h.includes('>Forget me<') && h.includes('Erases what this device has saved') && !h.includes('Forget everything'), h.error ?? '');
  ok('settings: the helper text says it returns you to the terms', typeof h === 'string' && /where the terms are shown again/.test(h.replace(/<!-- -->/g, '')), h.error ?? '');
  ok('settings: no "Cleared" notice is left (the page reloads instead)', typeof h === 'string' && !h.includes('Your current choices stay'), '');
  h = render(ForgetMeLink, {});
  ok('footer: there is a "Forget me" link too', typeof h === 'string' && h.includes('Forget me') && h.includes('<button'), h.error ?? '');
  // The "Are you sure?" step: the question appears before anything is erased, Cancel comes first, and neither trigger erases on its own.
  const { ForgetMeConfirmPanel } = await vite.ssrLoadModule('/src/app/components/DeviceMemoryControls.tsx');
  h = render(ForgetMeConfirmPanel, { onCancel: noop, onConfirm: noop });
  ok('forget me: the question says "Are you sure?" and offers Cancel and Yes', typeof h === 'string' && h.includes('Are you sure?') && h.includes('>Cancel<') && h.includes('Yes, forget me'), h.error ?? '');
  ok('forget me: Cancel comes before the confirming button (a stray Enter does nothing)', typeof h === 'string' && h.indexOf('>Cancel<') < h.indexOf('Yes, forget me'), '');
  ok('forget me: the panel is a labelled group', typeof h === 'string' && h.includes('role="group"') && h.includes('aria-label="Confirm Forget me"'), '');
  ok('forget me: the settings button shows only the trigger until it is pressed', !render(DeviceMemoryControls, {}).includes('Are you sure?'), '');
  ok('forget me: the footer link shows only the trigger until it is pressed', !render(ForgetMeLink, {}).includes('Are you sure?'), '');
  const { AppFooter } = await vite.ssrLoadModule('/src/app/components/AppFooter.tsx');
  h = render(AppFooter, {});
  ok('every page footer carries the Forget me link', typeof h === 'string' && h.includes('Forget me'), h.error ?? '');
  const { AccessibilitySettingsContent } = await vite.ssrLoadModule('/src/app/components/AccessibilitySettings.tsx');
  h = render(AccessibilitySettingsContent, { breathingEnabled: true, orbitEnabled: true, breathingOpacity: 1, onBreathingToggle: noop, onOrbitToggle: noop, onOpacityChange: noop, cvMode: 'deuteranopia', onCvModeChange: noop });
  ok('vision modes: readable colours come from the theme, not a fixed pale amber', typeof h === 'string' && h.includes('Red-Green (D)') && h.includes('text-foreground') && !h.includes('rgba(232,160,32,0.45)'), h.error ?? '');
  ok('vision modes: the chosen option is marked for screen readers', typeof h === 'string' && h.includes('aria-pressed="true"'), h.error ?? '');

  // A failed turn: a plain sentence, the codes, and a report that sends only the codes.
  const { FailureNotice } = await vite.ssrLoadModule('/src/coach/FailureNotice.tsx');
  h = render(FailureNotice, { turn: 2, info: { message: "The coach's model took too long to answer.", code: 'upstream', reason: 'timeout', ref: 'aabbccdd', status: 502, at: '2026-11-05T22:14:09.000Z' } });
  ok('failed turn: says what happened, with the codes and a report option', typeof h === 'string' && h.includes('took too long') && h.includes('ref aabbccdd') && h.includes('upstream') && h.includes('Report this failure') && h.includes('Nothing you wrote was lost'), h.error ?? '');
  ok('failed turn: the report says it sends only the technical details', typeof h === 'string' && h.includes('does not send what you wrote'), h.error ?? '');

  // The owner's private page: a sign-in field and nothing else until a token is given.
  const { default: AdminPage } = await vite.ssrLoadModule('/src/admin/AdminPage.tsx');
  h = render(AdminPage, {});
  ok('admin page: shows the title, a password field for the token, and no totals yet', typeof h === 'string' && h.includes('Nenya numbers') && h.includes('type="password"') && !h.includes('<table'), h.error ?? '');
  ok('admin page: starts by checking who is signed in, and keeps the token as a fallback', typeof h === 'string' && h.includes('Checking') && h.includes('Use the owner token instead'), h.error ?? '');
  ok('admin page: says the totals hold no information about who produced them', typeof h === 'string' && h.includes('hold no information about who produced them'), h.error ?? '');

  // The logo is decorative by default and says what it is only when asked.
  const { default: NenyaLogo } = await vite.ssrLoadModule('/src/app/components/NenyaLogo.tsx');
  h = render(NenyaLogo, { size: 200 });
  ok('logo: decorative (empty alt) by default, never the old "Nenya Logo"', typeof h === 'string' && /alt=""/.test(h) && !h.includes('Nenya Logo'), h.error ?? '');
  h = render(NenyaLogo, { size: 200, alt: 'A described logo' });
  ok('logo: a passed description is the one image a screen reader meets', typeof h === 'string' && h.includes('alt="A described logo"') && (h.match(/alt="A described logo"/g) ?? []).length === 1, h.error ?? '');

  // Breathing tones: the same switch in three places, off by default, each with a name and a state.
  const { BreathTonesSwitch, TonesAnnouncer } = await vite.ssrLoadModule('/src/app/components/BreathTonesSwitch.tsx');
  for (const variant of ['skip', 'panel', 'counter']) {
    h = render(BreathTonesSwitch, { variant });
    ok(`breathing tones switch (${variant}): a named switch, off by default`, typeof h === 'string' && /role="switch"|data-slot="switch"/.test(h) && /aria-checked="false"|data-state="unchecked"/.test(h) && (/Breathing tones/.test(h)), h.error ?? '');
  }
  h = render(BreathTonesSwitch, { variant: 'skip' });
  ok('breathing tones switch (skip): hidden until focused, and says what pressing does', typeof h === 'string' && h.includes('sr-only focus:not-sr-only') && h.includes('off. Press to turn on.'), h.error ?? '');
  h = render(TonesAnnouncer, {});
  ok('breathing tones announcer: a polite live region, empty until something changes', typeof h === 'string' && h.includes('aria-live="polite"') && h.includes('role="status"'), h.error ?? '');

  // Hearing the signature melody is optional on both coach start screens: the way forward is never disabled by it.
  const { default: SessionKeyPicker } = await vite.ssrLoadModule('/src/coach/SessionKeyPicker.tsx');
  h = render(SessionKeyPicker, { onComplete() {}, onBack() {} });
  const continueBtn = typeof h === 'string' ? (h.match(/<button[^>]*>(?:(?!<\/button>)[\s\S])*Continue<\/button>/) ?? [''])[0] : '';
  ok('session key page: Continue is enabled without playing the sound, and says listening is optional', typeof h === 'string' && continueBtn !== '' && !/\sdisabled=""/.test(continueBtn) && h.includes('Listening is optional') && !h.includes('Hear your sound first'), h.error ?? '');
  h = render(CoachDemo, { colors });
  const startAt = typeof h === 'string' ? h.indexOf('I understand, start') : -1;
  const startBtn = startAt > 0 ? h.slice(h.lastIndexOf('<button', startAt), startAt) : '';
  ok('coach start screen: "I understand, start" is enabled without playing the sound', typeof h === 'string' && startBtn !== '' && !/\sdisabled=""/.test(startBtn), h.error ?? '');

  // The public verifier page: a way to choose a file or paste one, and a plain promise that nothing is uploaded.
  const { default: VerifyPage } = await vite.ssrLoadModule('/src/verify/VerifyPage.tsx');
  h = render(VerifyPage, {});
  ok('verify page: offers a file and a paste box, and says nothing is uploaded', typeof h === 'string' && h.includes('Check a Nenya transcript') && h.includes('type="file"') && h.includes('Nothing is') && h.includes('uploaded'), h.error ?? '');
} finally {
  await vite.close();
}
