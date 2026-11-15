// Two ways into the coach (owner, 2026-11-15): opened directly (/coach), a breath and a reflection are offered first, never required;
// arrived through the gateways (in the app, which needs a reflection to get there), the opening acknowledges it and offers nothing again.
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';

const page = readFileSync('src/coach/CoachPage.tsx', 'utf8');
const first = readFileSync('src/coach/BreathFirst.tsx', 'utf8');
const demo = readFileSync('src/coach/CoachDemo.tsx', 'utf8');
const app = readFileSync('src/app/App.tsx', 'utf8');

ok('the /coach page offers the breath first, before the colors and the coach, inside the region check', /<RegionGate[\s\S]*!pastBreath \? \(\s*<BreathFirst onContinue=\{\(\) => setPastBreath\(true\)\} \/>\s*\) : !colors \?/.test(page));
ok('the offer locks nothing: "Go to the coach" is one tap, beside "Breathe here first"', /onClick=\{onContinue\}/.test(first) && /Go to the coach/.test(first) && /Breathe here first/.test(first));
ok('breathing opens on the same page (the shared panel), and a reflection is one link away', /setBreathingPanel\(true\)/.test(first) && /href=\{sectionsOn\(\) \? '\/senses' : '\/'\}[\s\S]{0,200}Start with a reflection instead/.test(first));
ok('it names crisis help, focuses its heading, and meets the 44px target size', /988/.test(first) && /headingRef\.current\?\.focus/.test(first) && (first.match(/min-h-11/g) ?? []).length >= 3);
ok('nothing about the choice is saved or counted', !/localStorage|sessionStorage|usageCount|tally|fetch\(/.test(first));
ok('the in-app coach (reached only through the gateways) never shows the offer', !/BreathFirst/.test(app) && /screen === 'session' && gatewayData\.length === 0/.test(app));
ok('after the gateways, the opening acknowledges the reflection and points to bringing parts of it', /\{report \? 'You have already taken time with your reflection, so this can start right here; below, you can choose to bring parts of it\. ' : ''\}/.test(demo));
