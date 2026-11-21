// Several needs named in one message (src/lib/needFocus.ts, COACH_NEED_FOCUS=on): one plain sentence recommends one to three.
import { ok } from './helpers.mts';
import { MANY_NEEDS, NEED_FOCUS_REPLY, needsNamed, withNeedFocus, needFocusOn } from '../src/lib/needFocus.ts';

ok('off unless COACH_NEED_FOCUS=on', !needFocusOn({}) && !needFocusOn({ COACH_NEED_FOCUS: '1' }) && needFocusOn({ COACH_NEED_FOCUS: 'on' }));
ok('the needs a message names are found from the CNVC inventory, once each, slash words by part', needsNamed('I need rest, respect, understanding and connection. Connection again.').sort().join() === 'connection,respect,rest,understanding');
ok('words that are also everyday nouns do not make a list of needs', needsNamed('We walked for water and food in the open air, in the space by the shelter.').length === 0);
ok('four or more needs get the sentence, after the reply, once; three or fewer, or a reply that already says it, do not', (() => {
  const four = 'I need rest, respect, understanding and connection.';
  const a = withNeedFocus('That is a lot to carry.', four);
  return MANY_NEEDS === 4 && a.changed && a.reply === `That is a lot to carry.\n\n${NEED_FOCUS_REPLY}` && !withNeedFocus('That is a lot to carry.', 'I need rest, respect and understanding.').changed && !withNeedFocus('Pick one to three to start.', four).changed;
})());

{
  process.env.COACH_ENABLED = 'true'; process.env.COACH_PROVIDER = 'venice'; process.env.VENICE_API_KEY = 'k'; process.env.COACH_TICKET_SECRET = 's3cret-s3cret-s3cret'; process.env.COACH_MODEL = 'deepseek-v3.2';
  delete process.env.COACH_SIGNING_KEY; delete process.env.COACH_EXTRA_HOSTS;
  (globalThis as any).fetch = async () => new Response(JSON.stringify({ choices: [{ message: { content: 'That is a lot to carry, and you named it clearly.' } }] }), { status: 200 });
  const { default: handler } = await import('../netlify/functions/coach.mts');
  const call = async (text: string) => (await (await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ session: { color1: '#7a9b9e', color2: '#DAC682' }, messages: [{ role: 'user', content: text }] }) }))).json()) as any;
  const four = 'Lately I need rest, respect, understanding and connection, all of it at once.';
  delete process.env.COACH_NEED_FOCUS;
  ok('with the switch off the reply is the model\'s own', !/one to three/.test((await call(four)).reply));
  process.env.COACH_NEED_FOCUS = 'on';
  const r = await call(four);
  ok('on, a message naming four needs gets the model\'s reply and then the site\'s sentence', r.reply === `That is a lot to carry, and you named it clearly.\n\n${NEED_FOCUS_REPLY}`, r.reply);
  ok('on, a message naming two needs does not', !/one to three/.test((await call('I need rest and some respect from them.')).reply));
  delete process.env.COACH_NEED_FOCUS;
}
