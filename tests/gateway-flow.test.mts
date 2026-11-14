// The gateway flow and the main page's header: a progress bar in every gateway, Present and Wish asked one after the other, the tour only in the header of the front
// page, and "Emergency Exit" spelled out everywhere. Source checks, in the style of the other interface tests.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { ok } from './helpers.mts';
const root = fileURLToPath(new URL('..', import.meta.url));
const src = (f: string) => readFileSync(join(root, f), 'utf8');
const GATEWAYS = ['Sight', 'Sound', 'Touch', 'Essence', 'Movement', 'Insight'].map((n) => `src/app/components/pages/${n}GatewayPage.tsx`);

ok('the Emergency Exit button says "Emergency Exit" in the header too, not "Exit"', !/'Exit'/.test(src('src/app/components/EmergencyExit.tsx')) && /^\s*Emergency Exit\s*$/m.test(src('src/app/components/EmergencyExit.tsx')));

const welcome = src('src/app/components/pages/WelcomePage.tsx');
ok('the front page has no tour button under the logo', !/quick tour/i.test(welcome) && !/onStartTutorial/.test(welcome));
const nav = src('src/app/components/GlobalNavigation.tsx');
ok('the header has a visible "Tour" button, shown only where the animation controls are (the front page)', /showAnimationControls && onTutorialReplay[\s\S]{0,400}Tour\s*<\/Button>/.test(nav));
ok('the front page is the only screen that turns those controls on', /showAnimationControls=\{currentScreen === 'welcome'\}/.test(src('src/app/App.tsx')));

const bar = src('src/app/components/GatewayProgress.tsx');
ok('the progress bar is a labelled progressbar that says "Gateway n of N"', /role="progressbar"/.test(bar) && /aria-valuenow=\{n\}/.test(bar) && /Gateway \{n\} of \{total\}/.test(bar));
ok('every gateway shows it in its header', GATEWAYS.every((f) => /<GatewayProgress index=\{currentIndex\} total=\{totalGateways\} \/>/.test(src(f))));

ok('every gateway asks the Present state first and the Wish state second, one at a time', GATEWAYS.every((f) => { const s = src(f); return /<StageSlot stage="present" current=\{stage\}>/.test(s) && /<StageSlot stage="wish" current=\{stage\}>/.test(s) && !/grid md:grid-cols-2 gap-6 md:gap-8/.test(s) && /<StageNav /.test(s); }));
ok('the gateway\'s own next button appears only on the Wish step', GATEWAYS.every((f) => /\{stage === 'wish' && \(\s*<div className="flex justify-center pt-4">\s*<Button/.test(src(f))));
ok('the Present state stays in the page while hidden, so going back loses nothing', /hidden=\{stage !== current\}/.test(src('src/app/components/GatewayStages.tsx')));
ok('the Sight gateway keeps its palettes and body map for the Wish step', /stage === 'wish' && \(\s*<>\s*<PalettePanel/.test(src(GATEWAYS[0])));
