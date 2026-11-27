// Step 3 of the Terms-first entry (VITE_TERMS_FIRST, off): the panel is only the Terms, with Agree and Decline and an "In plain English" link; Decline leaves the page and leaves nothing behind
// (owner, 2026-11-27; it opened a popout before).
import { readFileSync, existsSync } from 'node:fs';
import { ok } from './helpers.mts';

const f = readFileSync('src/app/components/OnboardingFlow.tsx', 'utf8');
const app = readFileSync('src/app/App.tsx', 'utf8');

ok('under the switch the panel opens on the Terms, and the start chooser no longer exists anywhere in the panel or the app', /skipRhythm \|\| termsFirst \? 'terms' : 'rhythm'/.test(f) && !/startChooserOn|StartTriad|START_COPY|chooser =/.test(f + app) && !existsSync('src/app/components/StartTriad.tsx') && !existsSync('src/lib/startCopy.ts'));
ok('with the switch off the old panel is unchanged (rhythm step, "Disagree, Exit")', /termsFirst \? 'Decline' : 'Disagree, Exit'/.test(f));
ok('Decline leaves, and does not count, sign or remember anything', /const handleDecline = [\s\S]*?window\.location\.replace\('about:blank'\)/.test(f) && !/countEvent|enableUsageCounts|rememberTerms|agreeToTerms|setRemembering/.test(f.slice(f.indexOf('const handleDecline'), f.indexOf("window.location.replace('about:blank')"))));
ok('the "In plain English" link swaps the Terms for the summary and back, with the state announced', /aria-expanded=\{showPlain\}/.test(f) && /showPlain \? 'Back to the Terms' : 'In plain English'/.test(f) && /termsFirst && showPlain \? <PlainEnglish \/> : <LegalDocumentBody compact \/>/.test(f));
ok('Agree is unchanged: it signs, remembers only if ticked, and then finishes', /const agreement = agreeToTerms\(\);/.test(f) && /if \(rememberHere\) \{\s*setRemembering\(true\);/.test(f));
ok('the rhythm is not counted as chosen at agreement when the panel no longer asks (Steady by default, changed at the counter); no start choice is counted or acted on', /!arrivedElsewhere && !termsFirstOn\(\) \?/.test(app) && !/onboarding\.start|choice === '(reflection|coach)'/.test(app));
ok('the counter already offers the rhythm presets', /PRESETS\.map\(\(preset\) =>/.test(readFileSync('src/app/components/BreathingCounter.tsx', 'utf8')));
