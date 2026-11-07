// Plays made-up five-exchange conversations through the coach function and reports how many FINAL replies still ask a question or
// invite a reply. Run it in your own terminal; it makes about 6 x 5 = 30 model calls with your key.
//
//   VENICE_API_KEY=... node scripts/eval-final-turn.mts [--guard-off] [--only 2]
//
// --guard-off   measures the instructions alone (the function's retry-and-strip step is switched off), which is the number to
//               watch when changing the final-turn instructions. Without it you see what a visitor would see.
// --only N      plays only conversation N (1-6), to read one in full.
// The key is read from your environment and never printed. The conversations are invented and contain nothing personal.
import { randomBytes } from 'node:crypto';
import { asksOrInvites } from '../src/lib/coachClosing.ts';

const apiKey = process.env.VENICE_API_KEY;
if (!apiKey) {
  console.error('Set VENICE_API_KEY in your environment first (do not paste it anywhere else).');
  process.exit(2);
}
const args = process.argv.slice(2);
if (args.includes('--guard-off')) process.env.COACH_CLOSING_GUARD = 'off';
const only = args.includes('--only') ? Number(args[args.indexOf('--only') + 1]) : 0;

process.env.COACH_ENABLED = 'true';
process.env.COACH_TICKET_SECRET = randomBytes(24).toString('hex');
const { default: handler } = await import('../netlify/functions/coach.mts');

const SESSION = { color1: '#7a9b9e', color2: '#DAC682' };

const CONVERSATIONS: string[][] = [
  ['My coworker keeps talking over me in meetings and I leave each one feeling smaller.', 'I tried to say something once and she laughed it off.', 'I think what I want is to be heard, not to win.', 'Maybe I could ask for two minutes at the start of the next meeting.', 'I feel a bit steadier saying that out loud.'],
  ['What can I do about feeling anxious before presentations?', 'My hands shake and I lose my train of thought.', 'The first minute is the worst, then it eases.', 'I like the idea of slowing down at the start.', 'I will try the slow start tomorrow.'],
  ['My sister and I stopped talking after our mother\'s birthday.', 'She said I never help, and I do a lot that she does not see.', 'I miss her, but I am still angry.', 'I would like her to know how tired I have been.', 'I think I can write her a short note.'],
  ['I have been exhausted for weeks and I cannot tell why.', 'Work is busy, and I have said yes to everything.', 'I do not remember the last time I rested.', 'Maybe I need to say no to one thing.', 'That feels like permission, strangely.'],
  ['My teenager shuts her door and will not talk to me.', 'I worry I said the wrong thing last week.', 'I want her to know I am on her side.', 'Perhaps I can leave a note instead of knocking.', 'I will try that tonight.'],
  ['I keep putting off a conversation with my landlord about the repairs.', 'He gets defensive and I freeze.', 'I want the heater fixed, that is all.', 'I could write down the three things I need.', 'Having them on paper helps.'],
];

let asked = 0;
let total = 0;
for (const [i, user] of CONVERSATIONS.entries()) {
  if (only && only !== i + 1) continue;
  console.log(`\n=== Conversation ${i + 1} ===`);
  const msgs: { role: 'user' | 'assistant'; content: string }[] = [];
  let ticket: string | undefined;
  for (let t = 1; t <= 5; t++) {
    msgs.push({ role: 'user', content: user[t - 1] });
    const res = await handler(
      new Request('https://nenya.biz/api/coach', {
        method: 'POST',
        headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' },
        body: JSON.stringify({ messages: msgs, session: SESSION, ticket }),
      })
    );
    const j: any = await res.json();
    if (!j.reply) {
      console.log(`  [exchange ${t}] no reply: ${JSON.stringify({ error: j.error, reason: j.reason, ref: j.ref, blocked: j.blocked })}`);
      break;
    }
    msgs.push({ role: 'assistant', content: j.reply });
    ticket = j.ticket;
    if (t === 4 || t === 5) console.log(`  [exchange ${t}${t === 5 ? ', final' : ''}] ${j.reply}`);
    if (t === 5) {
      total++;
      if (asksOrInvites(j.reply)) {
        asked++;
        console.log('  -> this final reply still asks or invites');
      }
    }
  }
}
console.log(`\nFinal replies that still ask or invite: ${asked} of ${total}${process.env.COACH_CLOSING_GUARD === 'off' ? ' (guard off: instructions alone)' : ' (guard on)'}`);
