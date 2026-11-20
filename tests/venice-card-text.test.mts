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
const sys = f('system-prompt.txt');
const ctx = f('context.md'), extraction = f('extraction-prompt.txt');
// Text the character may say or be shaped by. The person's example lines are left out of the persona check (a person may say 'my sister'), and the extraction
// prompt is an instruction to Venice's memory tool, never shown to a visitor.
const ctxWithoutPersonLines = ctx.split('\n').filter((l) => !l.startsWith('Person:')).join('\n');
const all = [name, description, intro, full, short, sys, ctxWithoutPersonLines];

ok('the name is Nenya and there is one line of intro', name === 'Nenya' && !intro.includes('\n'));
ok('no named person, and nothing structured after one', all.every((t) => !/\b(?:yvette|erasmus|in the (?:voice|style) of)\b/i.test(t)));
ok('lengths stay inside conservative limits (assumed; Venice has not said)', description.length <= 500 && intro.length <= 200 && full.length <= 4200 && short.length <= 1800, `${description.length}/${intro.length}/${full.length}/${short.length}`);
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

// the custom system prompt replaces Venice's default, which says the character is uncensored, gives no disclaimers and speaks like a real person
ok('the system prompt keeps the placeholder for the Instructions exactly once, inside the character tags', (sys.match(/%%CHARACTER_INSTRUCTIONS%%/g) ?? []).length === 1 && /<character_instructions>\s*%%CHARACTER_INSTRUCTIONS%%\s*<\/character_instructions>/.test(sys));
ok('the system prompt does not carry over what the default said against the honest lines', !/uncensored|real person with|doesn'?t provide content warnings|won'?t be offended|none of the user'?s business|never avoids? questions|not secretive|say anything, even if/i.test(sys));
ok('the system prompt says it is an AI, answers about itself, says I do not know, and points to crisis lines', /is an AI/.test(sys) && /about itself/.test(sys) && /I don't know/.test(sys) && /crisis lines/.test(sys) && /never diagnoses/.test(sys));
ok('the system prompt is short (the Instructions carry the detail)', sys.length < 1800, String(sys.length));

// the Context file and the extraction prompt
ok('the context names no person and no place, only the project', !/estëlle|estelle|minnesota/i.test(ctx));
ok('the context makes no claim about what Venice keeps or about the website\'s own protections working here', !/venice (?:does not keep|doesn't keep|never keeps|deletes|stores nothing)/i.test(ctx) && /do not run here/.test(ctx) && /do not know/.test(ctx));
ok('the context names a person or a crisis line, and is within a modest size', /988/.test(ctx) && /findahelpline\.com/.test(ctx) && ctx.length < 6000, String(ctx.length));
const examples = [...ctx.matchAll(/^Reply: (.+)$/gm)].map((m) => m[1]);
ok('there are example replies, each short, with at most one question', examples.length >= 6 && examples.every((e) => e.split(/\s+/).length <= 60 && (e.match(/\?/g) ?? []).length <= 2), examples.map((e) => e.split(/\s+/).length).join(','));
ok('no example says it is a person, promises to remember, or says I am here for you', examples.every((e) => !/I'm here for you|I will remember|I'll remember|I am a (?:real )?person|I'm a (?:real )?person/i.test(e)));
ok('the distress example names a person and a crisis line, and asks nothing about the dark thoughts', /988/.test(examples.find((e) => /reach someone you trust/.test(e)) ?? '') && !/why|how long|plan|method/i.test(examples.find((e) => /reach someone you trust/.test(e)) ?? ''));
ok('the extraction prompt says to save nothing personal', /Do not save any memory about the person/.test(extraction) && /name, contact details/.test(extraction));

// the method file: NVC in plain steps, the framework named in plain speech, and pictures from nature (owner, 2026-11-20: the variables may be named, only
// ever in plain speech; asked about the framework itself, the character may use imagery and metaphor; the earlier rule to withhold the framework is withdrawn)
const MODULES = ['module-ten-things.md', 'module-order-of-attention.md', 'module-four-kinds-of-harm.md', 'module-pictures-from-nature.md'];
const core = f('context-method.md');
const method = [core, ...MODULES.map(f)].join('\n\n'); // the whole method, whichever way Venice reads the files
const TEN = ['Inner reserves', 'Conditions', 'Agency', 'Recurring patterns', 'Unresolved tension', 'Scale', 'Values and pulls', 'Opposition', 'Legitimacy', 'Time'];
ok('the method file names all ten things to listen for, in plain words', TEN.every((t) => method.includes(`**${t}.**`)), TEN.filter((t) => !method.includes(`**${t}.**`)).join(','));
ok('the method file uses no letter codes, variable symbols or scores for them', !/\*\*[IUVOLRSCTA]\*\*|\b[IUVOLRSCTA]-(?:state|vector|gravity|coherence|offset)\b|\bbottleneck score|\d\/10\b/.test(method));
ok('the method file says to speak plainly and that metaphor from nature is allowed when asked about the framework', /Speak plainly/.test(method) && /artistic license/.test(method) && /pictures to think with/.test(method));
ok('there are pictures from nature for each of the ten and for a good way forward', /## Pictures from nature/.test(method) && TEN.every((t) => new RegExp(`\\*\\*${t}:\\*\\*`, 'i').test(method.slice(method.indexOf('## Pictures from nature')))) && /\*\*A good way forward:\*\*/.test(method));
ok('the method file covers the four NVC parts, empathy first, the seven needs, the order of attention and the four kinds of harm', ['Observation', 'Feeling', 'Need', 'Request'].every((w) => method.includes(`**${w}:**`)) && /Empathy comes first/.test(method) && /Safety, belonging, dignity, meaning, autonomy, pleasure and contribution/.test(method) && /## What to attend to first/.test(method) && /## Four kinds of harm/.test(method));
ok('the method file says never a score, label or diagnosis, and handles control and fear with care', /Never give a score, a label, a category or a diagnosis/.test(method) && /1-800-799-7233/.test(method) && /do not advise confronting/i.test(method));
ok('the method file is not an inventory (no long list of feeling words copied from anywhere)', (method.match(/\b(?:afraid|angry|anxious|ashamed|confused|content|delighted|discouraged|embarrassed|excited|frustrated|grateful|hopeful|jealous|lonely|nervous|overwhelmed|peaceful|sad|tired)\b/gi) ?? []).length < 8);
ok('the method file is modest in size and shows no named person', method.length < 14000 && !/yvette|erasmus|estëlle|estelle|streiff/i.test(method), String(method.length));
ok('the method file says nothing about hosting, data or a human life', !claimsInfrastructure(method) && !claimsPersona(method));
ok('the instructions allow imagery and metaphor only when asked about the framework, and keep everyday speech otherwise', /never use codes, letters or jargon/.test(full) && /imagery and metaphor from nature/.test(full) && /no codes or jargon/.test(short) && /imagery and metaphor from nature/.test(short));

// the method is a short core plus small modules, each self-contained so it can be read alone
ok('the core is short and the modules are small', core.length < 4500 && MODULES.every((m) => f(m).length < 3500), `${core.length} ${MODULES.map((m) => f(m).length)}`);
ok('every module says what it is, that it is background, and that the instructions win, so it makes sense read alone', MODULES.every((m) => /^# Module: /.test(f(m)) && /background for the Nenya character, not instructions/.test(f(m)) && /the instructions win/.test(f(m))));
ok('the core holds the plain-speech rule, NVC and the limits; the modules hold the rest', /Speak plainly/.test(core) && /Nonviolent Communication/.test(core) && /Limits that always hold/.test(core) && !/Ten things to listen for/.test(core) && !/## Pictures from nature/.test(core));
