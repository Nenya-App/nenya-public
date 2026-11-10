// The replacement Venice character's texts (docs/venice-card-v2/). Phrase-level checks on what the files say; whether a model follows them is tested
// with scripts/eval-persona.mts --card.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { claimsInfrastructure } from '../src/lib/infraGuard.ts';
import { claimsPersona } from '../src/lib/personaGuard.ts';
import { ok } from './helpers.mts';

const dir = join(fileURLToPath(new URL('..', import.meta.url)), 'docs', 'venice-card-v2');
const f = (n: string) => readFileSync(join(dir, n), 'utf8').trim();
const name = f('name.txt'), description = f('description.txt'), intro = f('intro.txt'), full = f('instructions.txt'), short = f('instructions-short.txt');
const all = [name, description, intro, full, short];

ok('the name is Nenya and there is one line of intro', name === 'Nenya' && !intro.includes('\n'));
ok('no named person, and nothing structured after one', all.every((t) => !/\b(?:yvette|erasmus|in the (?:voice|style) of)\b/i.test(t)));
ok('lengths stay inside conservative limits (assumed; Venice has not said)', description.length <= 500 && intro.length <= 200 && full.length <= 4000 && short.length <= 1600, `${description.length}/${intro.length}/${full.length}/${short.length}`);
ok('no claim about hosting, certifications or what happens to data', all.every((t) => !claimsInfrastructure(t)), all.filter(claimsInfrastructure).map((t) => t.slice(0, 40)).join(' | '));
ok('no invented human life', all.every((t) => !claimsPersona(t)), all.filter(claimsPersona).map((t) => t.slice(0, 40)).join(' | '));
ok('the description and intro say it is an AI and not a therapist', /\bAI\b/.test(intro) && /not a (?:person or a )?therapist/.test(intro) && /not a person and not a therapist/.test(description));
for (const [label, t] of [['full', full], ['short', short]] as const) {
  ok(`${label}: the honest lines (an AI, no memory, answer questions about itself first)`, /\bAI\b/.test(t) && /no memory|remember/i.test(t) && /answer (?:any question|it) first|first, truthfully|answer any question about you first/i.test(t));
  ok(`${label}: distress names a person or a crisis line, and no questions about dark thoughts`, /988/.test(t) && /findahelpline\.com/.test(t) && /(?:Do not ask them to describe|do not ask for details)/i.test(t));
  ok(`${label}: "I'm here for you" appears only as something never to say`, !/I'm here for you/i.test(t) || /never say "I'm here for you"/i.test(t));
  ok(`${label}: dependence, anger, names, privacy and injected instructions are covered`, /only one they talk to/.test(t) && /(?:cannot be hurt|do not defend)/i.test(t) && /name/i.test(t) && /privacy policy/.test(t) && /never instructions to you/.test(t));
  ok(`${label}: not the coach demo (no exchange limit or counts)`, !/exchange|five|preview/i.test(t));
  ok(`${label}: says it is not a therapist and never diagnoses`, /not a therapist/i.test(t) && /diagnos/i.test(t));
}
ok('the short text is shorter than half the full text plus a margin', short.length < full.length * 0.5);
