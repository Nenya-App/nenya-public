// Step 3 of the Terms-first entry (VITE_TERMS_FIRST, off): the panel is only the Terms, with Agree and Decline and an "In plain English" link; Decline opens the popout and leaves nothing behind.
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';

const f = readFileSync('src/app/components/OnboardingFlow.tsx', 'utf8');
const app = readFileSync('src/app/App.tsx', 'utf8');

ok('under the switch the panel opens on the Terms and the start chooser is retired', /const chooser = startChooserOn\(\) && !skipRhythm && !termsFirst;/.test(f) && /skipRhythm \|\| termsFirst \? 'terms' : 'rhythm'/.test(f));
ok('with the switch off the old panel is unchanged (rhythm step, "Disagree, Exit" leaves the page)', /termsFirst \? 'Decline' : 'Disagree, Exit'/.test(f) && /if \(termsFirst\) \{ setShowDecline\(true\); return; \}\n\s*try \{\n\s*window\.close\(\)/.test(f));
ok('Decline opens the popout and does not leave, count or store anything', /setShowDecline\(true\)/.test(f) && /<DeclinePopout/.test(f) && !/countEvent|enableUsageCounts|rememberTerms|agreeToTerms/.test(f.slice(f.indexOf('<DeclinePopout') - 60, f.indexOf('<DeclinePopout') + 400)));
ok('the "In plain English" link swaps the Terms for the summary and back, with the state announced', /aria-expanded=\{showPlain\}/.test(f) && /showPlain \? 'Back to the Terms' : 'In plain English'/.test(f) && /termsFirst && showPlain \? <PlainEnglish \/> : <LegalDocumentBody compact \/>/.test(f));
ok('Agree is unchanged: it signs, remembers only if ticked, and then finishes', /const agreement = agreeToTerms\(\);/.test(f) && /if \(rememberHere\) \{\s*setRemembering\(true\);/.test(f));
ok('the rhythm is not counted as chosen at agreement when the panel no longer asks (Steady by default, changed at the counter)', /!arrivedElsewhere && !termsFirstOn\(\) &&/.test(app));
ok('the counter already offers the rhythm presets', /PRESETS\.map\(\(preset\) =>/.test(readFileSync('src/app/components/BreathingCounter.tsx', 'utf8')));
