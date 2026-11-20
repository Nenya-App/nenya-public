// The "How the checks work" page: its numbers are sane and it says plainly that no outside professional has reviewed the checks.
import { readFileSync } from 'node:fs';
import { CHECKS_MEASURED, FALSE_ALARMS, GROUP_RESULTS } from '../src/lib/checksReport.ts';
import { ok } from './helpers.mts';
const page = readFileSync(new URL('../src/app/components/about/HowChecksWork.tsx', import.meta.url), 'utf8');
ok('every group has a case count and percentages between 0 and 100', GROUP_RESULTS.length >= 7 && GROUP_RESULTS.every((r) => r.cases > 0 && r.caught >= 0 && r.caught <= 100 && r.slursCaught >= 0 && r.slursCaught <= 100));
ok('the table is ordered from most to least caught, so the unevenness reads at once', GROUP_RESULTS.every((r, i) => i === 0 || GROUP_RESULTS[i - 1].caught >= r.caught));
ok('the false-alarm figures are small and the neutral statements are not flagged', FALSE_ALARMS.listHateCheck < 2 && FALSE_ALARMS.listEthos < 2 && FALSE_ALARMS.neutralIdentityStatements === 0);
ok('the measured date is stated', /\d{1,2} [A-Z][a-z]+ 20\d\d/.test(CHECKS_MEASURED) && page.includes('CHECKS_MEASURED'));
ok('the page says no outside professional has reviewed the checks, and invites review', /No outside professional has reviewed these checks/.test(page) && /would like them to be/.test(page));
ok('the page says nothing is kept but daily counts, and that no check reports anyone', /plain daily counts only/.test(page) && /reports you to anyone/.test(page));
ok('the page tells people how to say a check was wrong', /This was a mistake/.test(page));
ok('the page never claims a professional, a counselor or an expert reviewed anything', !/(reviewed|approved|vetted|endorsed|validated) by (a |an |the )?(counselor|clinician|expert|professional|psychologist|lawyer|trainer)/i.test(page));

// The classifier is named and explained in plain terms, and the page does not point to the Terms for something the Terms do not say.
import { SCREEN_STATUS } from '../src/lib/checksReport.ts';
ok('the classifier is named exactly, and its source and licence are credited', /cardiffnlp\/twitter-roberta-base-hate-latest/.test(page) && /CC BY 4\.0/.test(page) && /did not retrain it/.test(page));
ok('the page explains what it reads, what it gives back, what it can change, what it cannot do and what is kept', ['What it is', 'What it reads', 'What it gives back', 'What it can change', 'What it cannot do', 'What is kept'].every((h) => page.includes(h)));
ok('the page says it only gives a band, never ends a conversation, and keeps nothing about a message', /Only a band: high, mid or low/.test(page) && /never ends a conversation/.test(page) && /Nothing about your message or its score/.test(page));
ok('the status line is dated and says whether it is on for the live site', /\d{1,2} [A-Z][a-z]+ 20\d\d/.test(SCREEN_STATUS.asOf) && typeof SCREEN_STATUS.onLiveSite === 'boolean' && page.includes('SCREEN_STATUS'));
ok('the page no longer says the Terms state which checks are on (they do not)', !/is stated in the Terms/.test(page) && !/the Terms say whether it is switched on/.test(page));
