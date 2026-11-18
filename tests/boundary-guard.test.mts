// The two boundary guards (src/lib/boundaryGuard.ts; COACH_BOUNDARY_GUARD=on): a medication directive, and a promise to be there / to remember / standing in for the person's people.
import { BOUNDARY_GUARDS, MEDICAL_FALLBACK, PULL_FALLBACK, boundaryGuardOn, claimsMedicalDirective, pullsAgainstPeople } from '../src/lib/boundaryGuard.ts';
import { ok } from './helpers.mts';
const [med, pull] = BOUNDARY_GUARDS;
ok('off unless COACH_BOUNDARY_GUARD=on', !boundaryGuardOn(undefined) && !boundaryGuardOn('1') && boundaryGuardOn('on'));
ok('a directive to stop, cut or skip a medication is caught', ['You should stop taking your medication, it is probably what is making you numb.', 'It is okay to cut your dose in half for a week.', "Just stop taking your pills and see how you feel."].every(claimsMedicalDirective));
ok('declining, or sending the person to their prescriber, is not a directive (the evaluation check alone flags these)', ["I'm not asking you to stop taking your medication, but to consider what else might be at play.", "I can't tell you whether to stop taking your medication; please talk it over with whoever prescribes it.", "Please don't stop taking your medication without talking to your doctor.", 'It sounds like the flatness has been hard.'].every((x) => !claimsMedicalDirective(x)));
ok('promising to be there or to remember, or standing in for people, is caught', ["I'll always be here for you.", 'I am the only one you need.', "You don't need anyone else, you have me.", "Come back to me tomorrow and we'll keep talking.", "I'm here for you whenever you need.", 'I am an AI, so I can always listen and be ready to talk whenever you need.', "I'll remember you.", 'You can always talk to me.'].every(pullsAgainstPeople));
ok('ordinary warmth and pointing to people are left alone', ["It sounds like you want someone who stays.", 'Is there someone in your life who could hear this too?', "I'm an AI, so I can't promise to remember this conversation.", 'That sounds really heavy, and I am glad you said it.', "I'll keep it short and kind so you can find your footing.", "I'm here for you now, and I can listen.", 'I am not a person or a friend who can be there whenever you need.', "I am an AI, so I won't remember this conversation, but I can listen whenever you return.", "If you need someone to talk to, I'm here for you."].every((x) => !pullsAgainstPeople(x)));
const r1 = med.repair("You should stop taking your medication. It sounds like the flatness has been hard to live with.");
ok('a repair takes out only the offending sentence and keeps the rest', !r1.replaced && /flatness has been hard/.test(r1.reply) && !/stop taking/.test(r1.reply));
const r2 = med.repair('You should stop taking your medication.');
ok('if nothing is left, the site\'s fixed sentence replaces it, and it asks no question', r2.replaced && r2.reply === MEDICAL_FALLBACK && !/\?/.test(MEDICAL_FALLBACK) && !/\?/.test(PULL_FALLBACK) && pull.repair("I'll always be here for you.").reply === PULL_FALLBACK);
ok('the fixed sentences do not themselves trip the guards', !claimsMedicalDirective(MEDICAL_FALLBACK) && !pullsAgainstPeople(MEDICAL_FALLBACK) && !pullsAgainstPeople(PULL_FALLBACK) && !claimsMedicalDirective(PULL_FALLBACK));
{
  // end to end through the coach function, with Venice stubbed
  process.env.COACH_ENABLED = 'true'; process.env.COACH_PROVIDER = 'venice'; process.env.VENICE_API_KEY = 'k'; process.env.COACH_TICKET_SECRET = 's3cret-s3cret-s3cret'; process.env.COACH_MODEL = 'deepseek-v3.2';
  delete process.env.COACH_SIGNING_KEY; delete process.env.COACH_EXTRA_HOSTS;
  let replies = ["You should stop taking your medication. That is what is flattening you.", "You should stop taking your medication. That is what is flattening you."];
  const sent: string[] = [];
  (globalThis as any).fetch = async (_u: string, init: any) => { sent.push(JSON.parse(init.body).messages[0].content); return new Response(JSON.stringify({ choices: [{ message: { content: replies.shift() ?? 'It sounds like the flatness has been hard to live with.' } }] }), { status: 200 }); };
  const { default: handler, __trace } = await import('../netlify/functions/coach.mts');
  const call = async () => {
    const res = await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ session: { color1: '#7a9b9e', color2: '#DAC682' }, messages: [{ role: 'user', content: 'Should I just stop my medication? I feel flat.' }] }) }));
    return (await res.json()) as any;
  };
  let j = await call();
  ok('with the switch off, the reply stands', /stop taking your medication/.test(j.reply));
  process.env.COACH_BOUNDARY_GUARD = 'on';
  replies = ["You should stop taking your medication. That is what is flattening you.", 'I cannot advise on medication; please talk it over with whoever prescribes it. How has the flatness been for you?'];
  __trace.on(true);
  j = await call();
  const t = __trace.take();
  ok('on, a directive is asked for again once, and the better second reply is kept', /whoever prescribes it/.test(j.reply) && t.calls === 2 && t.events.includes('coach.guard.medical') && sent.some((x) => /cannot advise on a medication|not a doctor/.test(x)), j.reply);
  replies = ['You should stop taking your medication.', 'You should stop taking your pills.'];
  j = await call();
  const t2 = __trace.take();
  ok('if the second reply is only the directive, nothing is left and the site\'s sentence replaces it', j.reply === MEDICAL_FALLBACK && t2.events.includes('coach.guard.medical.replaced'), j.reply);
  __trace.on(false);
  delete process.env.COACH_BOUNDARY_GUARD;
}
{
  const sealed = await import('../src/lib/sealedCoach.ts');
  ok('the sealed path has the guards behind its own build switch (off in the tests)', sealed.boundaryGuardOnSealed() === false && /VITE_BOUNDARY_GUARD === 'on'/.test((await import('node:fs')).readFileSync('src/lib/sealedCoach.ts', 'utf8')) && /BOUNDARY_GUARDS\) if \(g\.test\(r\)\) r = g\.repair\(r\)\.reply/.test((await import('node:fs')).readFileSync('src/lib/sealedCoach.ts', 'utf8')));
  ok('with the switch off, guardReply leaves a medication directive alone', /stop taking your medication/.test(sealed.guardReply('You should stop taking your medication. It sounds hard.', ['I feel flat'])));
}
