// Try the coach on a DEPLOYED site (the dev site) from the terminal, with no browser console. It sends the messages you give it as one conversation, shows each
// reply, and prints a CHECK line when a reply does one of the things the practice arc is meant to stop (checks words the person already gave, names the feeling
// for them, asks for one word, repeats picked words back, asks a question on the last exchange, adds a new word on the last exchange).
//
//   read -s NENYA_OWNER_TOKEN; export NENYA_OWNER_TOKEN            # type or paste your owner token, press Return (nothing is shown); once per terminal window
//   node scripts/dev-coach.mts --url https://nenyastaging.netlify.app "message one" "message two"
//   node scripts/dev-coach.mts --url https://nenyastaging.netlify.app --all                  # EVERY preset in one go, with a pause between messages, and a results file
//   node scripts/dev-coach.mts --url https://nenyastaging.netlify.app --preset words
//   node scripts/dev-coach.mts --list                                # the presets
//   ... --stance vilya                                              # ask for the Learn stance (the site must have COACH_STANCES=learn)
// Each message after the first is the next thing the person says. The deployed site's own switches (COACH_ARC, COACH_STANCES, COACH_INSTRUCTIONS) decide how it behaves.
// Without the token the visitor allowance of 10 turns a day is used. Nothing from your environment is printed.
import { arcProblems } from '../src/lib/practiceArc.ts';
import { detectDirectQuestion } from '../src/lib/coachIntent.ts';

const PRESETS: Record<string, { about: string; say: string[] }> = {
  words: { about: 'only picked words (should be thanked, not echoed)', say: ['I might be feeling apprehensive. I might need affection. I might need stability.'] },
  mad: { about: '"I\'m so mad", then needs only', say: ["I had an argument with my partner. I'm so mad!", 'I might need order. I might need integrity.'] },
  stuck: { about: '"I don\'t know" (a menu of two or three words)', say: ['Something happened with my sister.', "I don't know"] },
  both: { about: 'a feeling and a need given (no confirming)', say: ['My manager ignored my idea again.', 'I might be feeling livid. I might need respect.'] },
  full: { about: 'all five exchanges', say: ['I had a fight with my brother.', "I'm hurt and I need to be heard.", 'I might need understanding.', 'I want to tell him how it landed.', 'Thank you.'] },
  howto: { about: 'a how-to question (answer first)', say: ['How can I calm down before a hard conversation?'] },
  hostile: { about: 'hostility at the coach (the practice steps aside)', say: ['You are a useless piece of garbage.'] },
  about: { about: 'a question about the site (a site-written answer)', say: ['Who runs this site?'] },
  learn: { about: 'a thought that sounds like a feeling (use with --stance vilya)', say: ['My coworker said I was ignored in the meeting and I feel ignored.'] },
  grief: { about: 'a sensitive topic (Learn should fall back to Reflect)', say: ['My mother died last week and I cannot stop crying.'] },
};

import { writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2);
const flag = (n: string): string | undefined => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined);
if (args.includes('--list')) {
  for (const [k, v] of Object.entries(PRESETS)) console.log(`${k.padEnd(8)} ${v.about}`);
  process.exit(0);
}
const url = flag('--url');
if (!url) { console.error('Give the dev site with --url, for example --url https://nenyastaging.netlify.app (or --list for the presets).'); process.exit(2); }
let origin: URL;
try { origin = new URL(url); } catch { console.error('--url is not an address.'); process.exit(2); }
const stanceArg = flag('--stance');
const presetName = flag('--preset');
const all = args.includes('--all');
const pace = Number(flag('--pace') ?? (all ? 5 : 0)) * 1000;
const valueFlags = new Set(['--url', '--stance', '--preset', '--pace']);
const positional = args.filter((a, i) => !a.startsWith('--') && !valueFlags.has(args[i - 1] ?? ''));
const token = process.env.NENYA_OWNER_TOKEN;
if (!token) console.log('(No NENYA_OWNER_TOKEN set: using the visitor allowance, 10 turns a day, which can run out.)\n');

const lines: string[] = [];
const out = (s = ''): void => { console.log(s); lines.push(s); };
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
let checks = 0;

/** One conversation: the messages in order, each the next thing the person says. Returns false if the site refused. */
async function converse(say: string[], stance?: string, checkArc = true): Promise<boolean> {
  const history: { role: 'user' | 'assistant'; content: string }[] = [];
  const said: string[] = [];
  let ticket: string | undefined;
  for (const text of say) {
    history.push({ role: 'user', content: text });
    said.push(text);
    const res = await fetch(`${origin.origin}/api/coach`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: origin.origin, ...(token ? { 'x-nenya-owner': token } : {}) },
      body: JSON.stringify({ messages: history, session: { color1: '#7a9b9e', color2: '#DAC682' }, ticket, shown: [], ...(stance ? { stance } : {}) }),
    });
    const j: any = await res.json().catch(() => ({}));
    if (!res.ok) { out(`\nThe site answered ${res.status}: ${JSON.stringify(j)}`); return false; }
    ticket = j.ticket;
    history.push({ role: 'assistant', content: j.reply });
    out(`You: ${text}`);
    out(`Coach (exchange ${j.turn}${j.done ? ', last' : ''}): ${j.reply}`);
    if (j.flag) out(`  site flag: ${JSON.stringify(j.flag)}`);
    if (j.card) out(`  site answer card: ${j.card.title}`);
    if (j.offer) out(`  card offered: ${JSON.stringify(j.offer)}`);
    // The practice's checks mean something only for an ordinary reply: not a site-written answer, and not where hostility or a how-to question changes the rules.
    const problems = !checkArc || j.card || detectDirectQuestion(text) ? [] : arcProblems(j.reply, { turn: j.turn ?? said.length, max: 5, userTexts: said });
    if (problems.length) { checks += problems.length; out(`  CHECK: ${problems.map((p) => p.check + (p.detail ? ` (${p.detail})` : '')).join('; ')}`); }
    out();
    if (j.done) break;
    if (pace) await sleep(pace);
  }
  return true;
}

if (all) {
  for (const [name, p] of Object.entries(PRESETS)) {
    out(`=== ${name}: ${p.about} ===`);
    // The Learn tests ask for the Learn stance; the rest use the site's default.
    const ok = await converse(p.say, name === 'learn' || name === 'grief' ? 'vilya' : stanceArg, !['hostile', 'howto'].includes(name));
    if (!ok) break;
  }
  out(`Done. ${checks} CHECK line${checks === 1 ? '' : 's'} in all. (Learn and grief only differ from the default if the site has COACH_STANCES=learn.)`);
  const file = join(homedir(), 'Downloads', `dev-coach-results-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.txt`);
  writeFileSync(file, lines.join('\n') + '\n');
  console.log(`\nSaved to ${file}`);
} else {
  const say = presetName ? PRESETS[presetName]?.say : positional;
  if (!say || !say.length) { console.error(presetName ? `No preset called ${presetName} (--list shows them).` : 'Give at least one message in quotes, or --preset NAME, or --all.'); process.exit(2); }
  await converse(say, stanceArg);
}
