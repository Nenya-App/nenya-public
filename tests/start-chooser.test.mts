// The start chooser (owner, 2026-11-15; docs/start-chooser-scope.md): what is here and where to start, before the Terms; breathing leads to the rhythm,
// reflection to the gateways, the coach to the coach page; the tour is no longer offered on its own; the choice is counted at agreement.
import { readFileSync } from 'node:fs';
import { gradeLevel } from '../src/lib/readingLevel.ts';
import { START_COPY, startCopyLines } from '../src/lib/startCopy.ts';
import { isKnownEvent, ALL_EVENTS } from '../src/lib/counters.ts';
import { ok } from './helpers.mts';

const worst = startCopyLines().map((l) => ({ l, g: gradeLevel(l) })).sort((a, b) => b.g - a.g)[0];
ok('every line of the chooser reads at grade 8 or below (WCAG AAA 3.1.5)', worst.g <= 8, `${worst.g.toFixed(1)}: ${worst.l}`);
ok('three choices in this order: breathing, reflection, coach', START_COPY.options.map((o) => o.id).join() === 'breathing,reflection,coach');
ok('the coach option says it is US-only for now, and its "Learn more" that it is an AI, not therapy, not for emergencies', /United States for now/.test(START_COPY.options[2].line) && /It is an AI/.test(START_COPY.options[2].more) && /not therapy/.test(START_COPY.options[2].more) && /not for emergencies/.test(START_COPY.options[2].more));
ok('it suggests breathing without choosing for anyone, and names crisis help', /Breathing is a gentle place to begin/.test(START_COPY.notSure) && /988/.test(START_COPY.crisis));

const flow = readFileSync('src/app/components/OnboardingFlow.tsx', 'utf8');
ok('with the switch on, the panel opens on the chooser (not on a link straight to another page)', /const chooser = startChooserOn\(\) && !skipRhythm && !termsFirst;/.test(flow) && /useState<OnboardingStep>\(chooser \? 'start' :/.test(flow));
ok('breathing goes to the rhythm, the others straight to the Terms', /setStep\(c === 'breathing' \? 'rhythm' : 'terms'\)/.test(flow));
const triad = readFileSync('src/app/components/StartTriad.tsx', 'utf8');
ok('nothing is preselected: three ring buttons in a triangle (Breathe on top), and one closed "Learn more" for all three', /<StartTriad onChoose=\{choose\} \/>/.test(flow) && /onClick=\{\(\) => onChoose\(id\)\}/.test(triad) && !/aria-pressed|aria-checked/.test(triad) && /<RingButton id="breathing"[\s\S]{0,200}<RingButton id="reflection"[\s\S]{0,80}<RingButton id="coach"/.test(triad) && /<details className="rounded-xl border border-border/.test(triad));
ok('the three rings: Breathe white, Reflect blue, Coach red; white keeps a pearl rim on light backgrounds', /breathing: \{ glow: 'rgba\(250, 248, 245/.test(triad) && /rim: '#C9C4BD'/.test(triad) && /reflection: \{ glow: 'rgba\(74, 144, 226/.test(triad) && /coach: \{ glow: 'rgba\(214, 69, 65/.test(triad));
ok('the glow is still under reduced motion, and each ring names its line for screen readers', /prefers-reduced-motion: reduce\) \{ \.start-ring \{ animation: none; \}/.test(triad) && /aria-describedby=\{`start-line-\$\{id\}`\}/.test(triad));
ok('the rhythm and the Terms can go back, and every target is at least 44px', /goTo\('start'\)/.test(flow) && /goTo\(choice === 'breathing' \? 'rhythm' : 'start'\)/.test(flow) && (flow.match(/min-h-11/g) ?? []).length >= 2 && /size-20/.test(triad) && /min-h-11/.test(triad));
ok('the choice and the agreement in progress are handed on at agreement', /onFinish\(chooser \? \(choice \?\? undefined\) : undefined, agreement\)/.test(flow));
ok('without the switch, the earlier panel is unchanged', /'Welcome to Nenya'\}/.test(flow) && /Let’s begin with your breath\./.test(flow));

const app = readFileSync('src/app/App.tsx', 'utf8');
ok('reflection opens the gateway choice; the coach opens /coach/ once the agreement is held', /if \(choice === 'reflection'\) \{\s*navigateTo\('home'\);/.test(app) && /window\.location\.assign\('\/coach\/'\)/.test(app) && /agreement\.finally\(go\)/.test(app));
ok('the tour is offered on its own only without the chooser (it stays in the help menu)', /if \(!choice && currentScreen === 'welcome'\) setTourOffered\(true\);/.test(app));
ok('the choice is counted at agreement, with the rhythm only on the breathing path', /\.\.\.\(choice \? \[`onboarding\.start\.\$\{choice\}`\] : \[\]\)/.test(app) && /\(!choice \|\| choice === 'breathing'\)/.test(app));
ok('the server accepts exactly the three start counts, and the admin view lists them', ['breathing', 'reflection', 'coach'].every((c) => isKnownEvent(`onboarding.start.${c}`) && ALL_EVENTS.includes(`onboarding.start.${c}`)) && !isKnownEvent('onboarding.start.other'));
{
  const { LEGAL_PARTS } = await import('../src/lib/legalDocument.ts');
  ok('the Terms list the start choice among the daily totals', /where visitors choose to start when the site asks \(breathing, reflection or the coach\)/.test(JSON.stringify(LEGAL_PARTS)));
}
ok('the About summary lists it too', /where visitors choose to start/.test(readFileSync('public/about-nenya.html', 'utf8')));
