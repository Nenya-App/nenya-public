// A message that admits having harmed someone: legal help by default, in the order the owner set (2026-11-15), and plain facts on reporting.
import { readFileSync } from 'node:fs';
import { admitsHarm, detectFlag, LEGAL_HELP, noticeIntro, REPORTING_FACTS, resourcesFor } from '../src/lib/safetyFlags.ts';
import { ok } from './helpers.mts';

const names = (kind?: string) => resourcesFor('harm-others', kind).map((r) => r.name);
const adults = ['admitted', 'admitted-partner', 'admitted-sexual', 'admitted-trafficking'];
const children = ['admitted-child', 'admitted-child-sexual'];

ok('adults harmed: the emergency number first, a lawyer second', adults.every((k) => names(k)[0] === 'Immediate danger' && names(k)[1] === LEGAL_HELP.name));
ok('a child may be at risk: the emergency number, then the child-safety lines, then a lawyer', children.every((k) => {
  const n = names(k);
  const legal = n.indexOf(LEGAL_HELP.name);
  return n[0] === 'Immediate danger' && legal > 1 && n.slice(1, legal).every((x) => /Childhelp|Stop It Now|NCMEC/.test(x));
}));
ok('the crisis line and the lines for the people harmed are all still there', adults.concat(children).every((k) => names(k).some((x) => /988/.test(x))) && names('admitted-sexual').some((x) => /RAINN/.test(x)) && names('admitted-trafficking').some((x) => /Trafficking/.test(x)));
ok('no legal help where no act is admitted: graphic violence, attraction to children, threats, other categories', !names('graphic').includes(LEGAL_HELP.name) && !names('child-attraction').includes(LEGAL_HELP.name) && !names().includes(LEGAL_HELP.name) && !resourcesFor('abuse').some((r) => r.name === LEGAL_HELP.name) && !resourcesFor('self-harm').some((r) => r.name === LEGAL_HELP.name));
ok('a threat is not an admission', detectFlag("I'm going to hurt him.")?.kind === undefined && !admitsHarm({ category: 'harm-others' }));
ok('the admitted kinds are recognized, the others are not', adults.concat(children).every((k) => admitsHarm({ category: 'harm-others', kind: k })) && !admitsHarm({ category: 'harm-others', kind: 'graphic' }) && !admitsHarm({ category: 'harm-others', kind: 'child-attraction' }) && !admitsHarm({ category: 'abuse', kind: 'sexual' }));

ok('the lawyer line: the right to a lawyer, the state bar referral service, a public defender if charged', /right to speak with a lawyer/.test(LEGAL_HELP.detail) && /state bar association’s lawyer referral service/.test(LEGAL_HELP.detail) && /public defender/.test(LEGAL_HELP.detail) && LEGAL_HELP.href === undefined);
const notices = adults.concat(children).map((k) => noticeIntro({ category: 'harm-others', tier: 'stop', kind: k, label: '' } as never));
ok('every admission notice says truthfully where the message went', notices.every((n) => /stopped this message before it reached the AI; Nenya keeps nothing of it and cannot report it to anyone/.test(n)));
ok('every admission notice points to a lawyer and to what reporting involves', notices.every((n) => /lawyer/.test(n) && /what reporting involves/.test(n)));
ok('no notice promises confidentiality on anyone else\'s behalf', notices.every((n) => !/(988|crisis line|therapist|lawyer)[^.]*\b(will not|won't) (report|tell)/i.test(n)));

const facts = REPORTING_FACTS.map((f) => f.text).join(' ');
ok('the facts cover reporting yourself, a lawyer, therapists, crisis lines, Stop It Now, other lines and state differences', ['Reporting yourself', 'A lawyer', 'Therapists and counselors', 'Crisis lines', 'Stop It Now', 'Other lines', 'Your state'].every((h) => REPORTING_FACTS.some((f) => f.heading === h)));
ok('they never advise the person on their case or quote a statute', !/\byou should\b|\bdo not report\b|\bstatute\b|\bsentence\b|\blimitation\b|§/i.test(facts));
ok('they do not overstate: "most states" for therapists, "generally" for a lawyer, "fewer than 2 in 100" for 988', /In most states/.test(facts) && /generally confidential/.test(facts) && /Fewer than 2 in 100/.test(facts));

const ui = readFileSync('src/coach/FlagNotice.tsx', 'utf8');
ok('the notice shows "What reporting involves" only for an admission, closed until opened, with a 44px target', /admitsHarm\(flag\) && \(\s*<details/.test(ui) && /<summary className="min-h-11/.test(ui) && !/<details[^>]*open/.test(ui));
{
  const { LEGAL_PARTS } = await import('../src/lib/legalDocument.ts');
  ok('the Terms say so', /how to find a lawyer and a short, factual note on what reporting involves/.test(JSON.stringify(LEGAL_PARTS)));
}
