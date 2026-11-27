// Fixes from the 2026-11-26 spend-down review (owner approved, 2026-11-27): the site's own skip link and the tour's skip button can be seen,
// the first screen survives a renamed pace, the Support page makes no subscription statement, and the front page drops one line.
import { readFileSync, readdirSync } from 'node:fs';
import { PRESETS, firstScreenPaces } from '../src/lib/breathingPresets.ts';
import { ok } from './helpers.mts';

const src = (p: string) => readFileSync(p, 'utf8');
// 2.4.1: no style sheet of ours hides a link or control because it is a skip link, or because it comes first on the page
const css = readdirSync('src/styles').filter((f) => f.endsWith('.css')).map((f) => src(`src/styles/${f}`)).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
const selectors = [...css.matchAll(/([^{}]+)\{/g)].map((m) => m[1].trim());
const hiding = selectors.filter((s) => /skip|#main|#content|a:first-child/i.test(s));
ok('no style rule targets skip links, the main-content link or a first link on the page', hiding.length === 0, hiding.join(' | ').slice(0, 200));

// the first screen's pace list comes from the presets themselves, so editing a preset cannot leave a name looked up and missing
const now = firstScreenPaces(PRESETS);
ok('the first screen shows Steady, Long exhale, Quick and Box, with the other three under More options', now.main.map((p) => p.lb).join() === '6·6,4·6,3·3,Box' && now.more.map((p) => p.lb).join() === '5·5,4·8,4-7-8', `${now.main.map((p) => p.lb)} / ${now.more.map((p) => p.lb)}`);
ok('their names and descriptions are as before', now.main.map((p) => p.name).join() === 'Steady,Long exhale,Quick,Box' && now.more.map((p) => p.name).join() === 'Even,Longer exhale,4-7-8' && now.main[0].blurb === 'Even breaths, about five a minute. A good place to begin.');
const edited = [{ ...PRESETS[0], ih: 7000, ex: 7000, lb: '7·7' }, ...PRESETS.slice(1)];
const after = firstScreenPaces(edited);
ok('a preset with a new label still shows, in its place, with its name', after.main[0].lb === '7·7' && after.main[0].name === 'Steady' && after.main.length + after.more.length === PRESETS.length);
const flow = src('src/app/components/OnboardingFlow.tsx');
ok('the first screen uses that list and looks nothing up by label', /firstScreenPaces\(PRESETS\)/.test(flow) && !/presetByLabel|MAIN_LABELS|RHYTHM_INFO/.test(flow));

ok('the Support page says nothing about subscriptions', !/subscription/i.test(src('src/app/components/about/SupportUs.tsx')));
const welcome = src('src/app/components/pages/WelcomePage.tsx');
ok('the front page invites a breath and no longer says everything else can wait', /Begin with a moment to breathe\./.test(welcome) && !/Everything else can wait/.test(welcome));
