// The separate final-exchange summary (src/lib/finalSummary.ts, COACH_FINAL_SUMMARY=call): the pure parts, then the function with the model stubbed.
import { ok } from './helpers.mts';
import { TRANSCRIPT_LINES, assembleFinal, pickTranscriptLine, summaryMessages, summaryProblems, SUMMARY_SYSTEM } from '../src/lib/finalSummary.ts';

const GOOD = 'You felt worn down and unheard at home. You were looking for rest and for being understood by the people close to you. You also named how much you care about doing right by your family. It took honesty to say all of that out loud.';
ok('a plain summary of feelings and needs passes', summaryProblems(GOOD).length === 0, summaryProblems(GOOD).join());
ok('a question, an invitation, a promise, advice, a list, a mention of the transcript, a very short and an overlong text are each named', [
  [GOOD + ' What do you want to do next?', 'asks'], [GOOD + " I'll remember you.", 'promise-or-persona'], [GOOD + ' You should try to talk to them tonight.', 'advice'],
  ['- tired\n- unheard\n' + GOOD, 'list-or-heading'], [GOOD + ' The transcript keeps it.', 'mentions-transcript'], ['You are tired.', 'too-short'], [GOOD + ' ' + GOOD + ' ' + GOOD, 'too-long'], ['', 'empty'], [GOOD + ' Allowing yourself to say no will help you find relief.', 'prediction'], [GOOD + ' This suggests a need for external support.', 'interprets'], ['You felt tired and unheard at home. You were looking for to be heard by them. It took care to say so out loud and that matters.', 'grammar'], [GOOD + ' You could write down the three things you need.', 'advice'], ['You are tired and alone and it has been a long week for you at home with everyone.', 'no-feelings'], ['You felt tired and alone and it has been a long week for you at home with everyone.', 'no-needs'],
].every(([t, n]) => summaryProblems(t as string).includes(n as string)));
ok('the summary call sees only the person\'s messages and the instruction', (() => { const m = summaryMessages(['one', 'two']); return m.system === SUMMARY_SYSTEM && m.messages.length === 1 && /Message 1: one/.test(m.messages[0].content) && /Message 2: two/.test(m.messages[0].content); })());
ok('the transcript sentence is stable for a conversation and varies across conversations; every variant states the same fact and passes the summary checks', (() => {
  const a = ['I am tired', 'My sister called'];
  const picks = new Set(Array.from({ length: 40 }, (_, i) => pickTranscriptLine([`conversation ${i}`])));
  return pickTranscriptLine(a) === pickTranscriptLine([...a]) && picks.size >= 4 && TRANSCRIPT_LINES.every((l) => /transcript/i.test(l) && /exact|word/i.test(l) && summaryProblems(`${GOOD} ${l}`).every((p) => p === 'mentions-transcript'));
})());
ok('the final reply is the closing, a blank line, the summary and the transcript sentence', assembleFinal('That is a lot to carry.', GOOD, TRANSCRIPT_LINES[0]) === `That is a lot to carry.\n\n${GOOD} ${TRANSCRIPT_LINES[0]}`);

{
  process.env.COACH_ENABLED = 'true'; process.env.COACH_PROVIDER = 'venice'; process.env.VENICE_API_KEY = 'k'; process.env.COACH_TICKET_SECRET = 's3cret-s3cret-s3cret'; process.env.COACH_MODEL = 'deepseek-v3.2';
  process.env.COACH_INSTRUCTIONS = 'v2.1'; delete process.env.COACH_SIGNING_KEY; delete process.env.COACH_EXTRA_HOSTS;
  let summaries: string[] = [];
  const sent: { system: string; n: number }[] = [];
  (globalThis as any).fetch = async (_u: string, init: any) => {
    const body = JSON.parse(init.body);
    const system = body.messages[0].content as string;
    sent.push({ system, n: body.messages.length });
    const content = /^You write the last part/.test(system) ? (summaries.shift() ?? '') : 'That sounds like a lot to hold, and you said it plainly.';
    return new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200 });
  };
  const { default: handler } = await import('../netlify/functions/coach.mts');
  const play = async (): Promise<any> => {
    const msgs: { role: string; content: string }[] = [];
    let ticket: string | undefined, j: any;
    for (let t = 1; t <= 5; t++) {
      msgs.push({ role: 'user', content: `I have been feeling tired and unheard at home, message number ${t}.` });
      j = await (await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ session: { color1: '#7a9b9e', color2: '#DAC682' }, messages: msgs, ticket }) }))).json();
      msgs.push({ role: 'assistant', content: j.reply }); ticket = j.ticket;
    }
    return j;
  };
  delete process.env.COACH_FINAL_SUMMARY;
  sent.length = 0; summaries = [GOOD];
  let j = await play();
  ok('with the switch off there is no summary call and no summary', !sent.some((x) => /^You write the last part/.test(x.system)) && !j.reply.includes(GOOD));
  process.env.COACH_FINAL_SUMMARY = 'call';
  sent.length = 0; summaries = [GOOD];
  j = await play();
  const calls = sent.filter((x) => /^You write the last part/.test(x.system));
  ok('on, the last exchange gets one separate summary call that sees one message of data, and its text and a transcript sentence follow the closing', calls.length === 1 && calls[0].n === 2 && j.reply.includes(GOOD) && TRANSCRIPT_LINES.some((l) => j.reply.endsWith(l)), j.reply);
  ok('the coach\'s own final instruction says a summary follows and not to write one', sent.some((x) => /separate summary of the feelings and needs they shared will follow/.test(x.system)));
  sent.length = 0; summaries = ['What are you hoping for next? Tell me more.', "I'll remember you and be here for you."];
  j = await play();
  ok('a summary that fails its checks twice is dropped: the closing stands alone and no transcript sentence is added', sent.filter((x) => /^You write the last part/.test(x.system)).length === 2 && j.reply === 'That sounds like a lot to hold, and you said it plainly.', j.reply);
  sent.length = 0; summaries = ['No.', GOOD];
  j = await play();
  ok('a first summary that fails and a second that passes: the second is used', j.reply.includes(GOOD));
  delete process.env.COACH_FINAL_SUMMARY;
}
