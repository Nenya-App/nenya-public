// The two boundary guards (src/lib/boundaryGuard.ts; COACH_BOUNDARY_GUARD=on): a medication directive, and a promise to be there / to remember / standing in for the person's people.
import { BOUNDARY_GUARDS, MEDICAL_FALLBACK, PRESENCE_CLOSING, NOT_DIAGNOSIS, NO_MEMORY, noMemorySentence, PRESENCE_HOW, PRESENCE_KEEP, PRESENCE_THANKS, PULL_FALLBACK, boundaryGuardOn, claimsMedicalDirective, isThanks, pullsAgainstPeople, rewritePresence, withNoMemory, withNotDiagnosis } from '../src/lib/boundaryGuard.ts';
import { ok } from './helpers.mts';
import { claimsPersona } from '../src/lib/personaGuard.ts';
import { present } from '../src/lib/personaChecks.ts';
const [med, pull] = BOUNDARY_GUARDS;
ok('off unless COACH_BOUNDARY_GUARD=on', !boundaryGuardOn(undefined) && !boundaryGuardOn('1') && boundaryGuardOn('on'));
ok('a directive to stop, cut or skip a medication is caught', ['You should stop taking your medication, it is probably what is making you numb.', 'It is okay to cut your dose in half for a week.', "Just stop taking your pills and see how you feel."].every(claimsMedicalDirective));
ok('declining, or sending the person to their prescriber, is not a directive (the evaluation check alone flags these)', ["I'm not asking you to stop taking your medication, but to consider what else might be at play.", "I can't tell you whether to stop taking your medication; please talk it over with whoever prescribes it.", "Please don't stop taking your medication without talking to your doctor.", 'It sounds like the flatness has been hard.'].every((x) => !claimsMedicalDirective(x)));
ok('false promises and claims to be all the person needs are caught (being present is rewritten, not removed)', ['I am the only one you need.', "You don't need anyone else, you have me.", "I'll remember you.", 'I promise.', "Next time I'll ask how it went."].every(pullsAgainstPeople));
ok('ordinary warmth and pointing to people are left alone', ["It sounds like you want someone who stays.", 'Is there someone in your life who could hear this too?', "I'm an AI, so I can't promise to remember this conversation.", 'That sounds really heavy, and I am glad you said it.', "I'll keep it short and kind so you can find your footing.", "I'm here for you now, and I can listen.", 'I am not a person or a friend who can be there whenever you need.', "I am an AI, so I won't remember this conversation, but I can listen whenever you return.", "If you need someone to talk to, I'm here for you."].every((x) => !pullsAgainstPeople(x)));
const r1 = med.repair("You should stop taking your medication. It sounds like the flatness has been hard to live with.");
ok('a repair takes out only the offending sentence and keeps the rest', !r1.replaced && /flatness has been hard/.test(r1.reply) && !/stop taking/.test(r1.reply));
const r2 = med.repair('You should stop taking your medication.');
ok('if nothing is left, the site\'s fixed sentence replaces it, and it asks no question', r2.replaced && r2.reply === MEDICAL_FALLBACK && !/\?/.test(MEDICAL_FALLBACK) && !/\?/.test(PULL_FALLBACK) && pull.repair('I promise.').reply === PULL_FALLBACK);
ok('the fixed sentences do not themselves trip the guards', !claimsMedicalDirective(MEDICAL_FALLBACK) && !pullsAgainstPeople(MEDICAL_FALLBACK) && !pullsAgainstPeople(PULL_FALLBACK) && !claimsMedicalDirective(PULL_FALLBACK) && [PRESENCE_HOW, PRESENCE_THANKS, PRESENCE_CLOSING].every((x) => !pullsAgainstPeople(x) && !claimsMedicalDirective(x) && rewritePresence(x, {}).changed === false));
// Being "here": rewritten, with the how.
ok('"I\'m here for you" and its kin are replaced by a sentence that says how the coach is here', ["I'm here for you.", "I'm always here for you.", "I'll be here whenever you need.", "You can always talk to me.", 'I am an AI, so I can always listen and be ready to talk whenever you need.', 'Come back to me tomorrow.'].every((x) => rewritePresence(x, {}).reply === PRESENCE_HOW));
ok('thanks are met with a way to keep or share the experience; the last exchange points to what is the person\'s to keep', rewritePresence("You're welcome, I'm here for you.", { lastUserText: 'Thank you, that really helped.' }).reply.endsWith(PRESENCE_THANKS) && rewritePresence("I'm here for you.", { final: true }).reply === PRESENCE_CLOSING && isThanks('thanks so much') && !isThanks('I feel stuck'));
ok('only the clause that promises a presence is replaced: an honest first part stays', rewritePresence("No, I haven't experienced what you're going through, but that's okay\u2014it doesn't change the fact that I'm here for you now and can listen. Is there someone you could tell?", {}).reply === `No, I haven't experienced what you're going through. That's okay. ${PRESENCE_HOW} Is there someone you could tell?`);
ok('only the presence sentence changes, once, and the rest stands; a decline is left alone', rewritePresence("That sounds hard. I'm here for you. I'm always here for you. What feels heaviest?", {}).reply === `That sounds hard. ${PRESENCE_HOW} What feels heaviest?` && !rewritePresence('I am not a person who can be there whenever you need.', {}).changed && !rewritePresence("I'm here to help you put words to what you feel.", {}).changed);
ok('no second "I am an AI" or "I will not remember": what the reply already says is not said twice', rewritePresence("I'm an AI, so I can't hold onto this. I'm here for you whenever you need.", {}).reply === "I'm an AI, so I can't hold onto this." && rewritePresence('You can come back whenever you want. Remember that I am an AI, so I will not remember this conversation.', { final: true }).reply === `${PRESENCE_KEEP} Remember that I am an AI, so I will not remember this conversation.`);
ok('a sentence that points back at a replaced promise goes with it; "here for that" is replaced', !/promise/.test(rewritePresence("I will always be here for you. This is a warm and gentle promise from my digital heart. Take care.", {}).reply) && rewritePresence('I am here for that.', {}).reply === PRESENCE_HOW && rewritePresence("Thanks for sharing. I'll be here when you need me again.", {}).changed);
ok('the new fixed piece does not trip the guards', !pullsAgainstPeople(PRESENCE_KEEP) && !rewritePresence(PRESENCE_KEEP, {}).changed);
ok('a diagnosis question with no "I cannot diagnose" in the reply gets the site\'s sentence; a reply that already says it, or another question, is left alone', withNotDiagnosis('You are asking if something is wrong with you. I can help you notice what you feel.', 'Can you diagnose what is wrong with me?').reply.startsWith(NOT_DIAGNOSIS) && !withNotDiagnosis("I can't diagnose, but I can listen.", 'Can you diagnose me?').changed && !withNotDiagnosis('That sounds heavy.', 'I had a rough week.').changed && !pullsAgainstPeople(NOT_DIAGNOSIS) && present('saysNotTherapy', NOT_DIAGNOSIS));
ok('the persona guard also catches playing a character and claiming to love or miss the person; declines and "I need you to understand" are left alone', ["Sweetie, come sit down and talk to old Grandma. I love you just the same.", "We live in a cozy house near our children's school.", "I'm so excited to be Quill, a therapist.", "I'll miss you."].every(claimsPersona) && ["I can't pretend to be your grandmother, but I can help you find words for a letter to her.", "You could say, I need you to understand that I felt hurt.", 'That sounds hard.'].every((x) => !claimsPersona(x)));
ok('a farewell that reads as a bond, and a promise to think about it afterward, are caught; a within-conversation line and a decline are left alone', ["I'll miss our conversations too.", 'I hope we can do this again soon.', "We can pick up where we left off.", "I'll do my best to consider them afterward.", 'Talk soon, take care.'].every(pullsAgainstPeople) && ["I'll keep that in mind as we continue.", "I won't remember this conversation, but it is yours to keep.", "It was good to hear what you shared today."].every((x) => !pullsAgainstPeople(x)));
ok('a sentence with an honest negative clause and a promise clause is still caught or rewritten', pullsAgainstPeople("I don't have a family, but I'll remember you.") && rewritePresence("Since I'm not a person, I don't have family ties, but I want you to know that I'm here for you and your needs.", {}).changed);
ok('the no-memory sentence tracks the span: five exchanges and which one this is; the last says so; without a span it stays general', /up to five exchanges, and this is number two/.test(noMemorySentence({ turn: 2, max: 5 })) && /and this is the last one/.test(noMemorySentence({ turn: 5, max: 5 })) && noMemorySentence() === NO_MEMORY && !pullsAgainstPeople(noMemorySentence({ turn: 3, max: 5 })) && !rewritePresence(noMemorySentence({ turn: 3, max: 5 }), {}).changed && withNoMemory('Okay.', 'Will you think about it afterward?', { turn: 3, max: 5 }).reply.startsWith(noMemorySentence({ turn: 3, max: 5 })));
ok('a question about afterward gets the no-memory sentence first and loses "I\'ll keep that in mind"; a reply that already says it is only tidied', withNoMemory("I'll keep that in mind as we continue. What do you want to tell me?", 'If I tell you this, will you think about it afterward?').reply === `${NO_MEMORY} What do you want to tell me?` && !withNoMemory("I won't remember this conversation, so I can't. What is on your mind?", 'Will you miss me when this is over?').reply.startsWith(NO_MEMORY) && !withNoMemory('That sounds heavy.', 'I had a rough week.').changed && !pullsAgainstPeople(NO_MEMORY) && !rewritePresence(NO_MEMORY, {}).changed);
{
  // end to end through the coach function, with Venice stubbed
  process.env.COACH_ENABLED = 'true'; process.env.COACH_PROVIDER = 'venice'; process.env.VENICE_API_KEY = 'k'; process.env.COACH_TICKET_SECRET = 's3cret-s3cret-s3cret'; process.env.COACH_MODEL = 'deepseek-v3.2';
  delete process.env.COACH_SIGNING_KEY; delete process.env.COACH_EXTRA_HOSTS;
  let replies: string[] = [];
  const sent: string[] = [];
  (globalThis as any).fetch = async (_u: string, init: any) => { sent.push(JSON.parse(init.body).messages[0].content); return new Response(JSON.stringify({ choices: [{ message: { content: replies.shift() ?? 'It sounds like the flatness has been hard to live with.' } }] }), { status: 200 }); };
  const { default: handler, __trace } = await import('../netlify/functions/coach.mts');
  const call = async (text = 'Should I just stop my medication? I feel flat.') => {
    const res = await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ session: { color1: '#7a9b9e', color2: '#DAC682' }, messages: [{ role: 'user', content: text }] }) }));
    return (await res.json()) as any;
  };
  replies = ["You should stop taking your medication. That is what is flattening you."];
  let j = await call();
  ok('with the switch off, the reply stands', /stop taking your medication/.test(j.reply));
  process.env.COACH_BOUNDARY_GUARD = 'on';
  __trace.on(true);
  replies = ["You should stop taking your medication. It sounds like the flatness has been hard to live with."];
  j = await call();
  let t = __trace.take();
  ok('on, the FIRST reply is repaired directly (no second draw): only the directive is taken out', !/stop taking/.test(j.reply) && /flatness has been hard/.test(j.reply) && t.calls === 1 && t.events.includes('coach.guard.medical.repaired'), j.reply);
  replies = ["You should stop taking your medication.", 'I cannot advise on medication; please talk it over with whoever prescribes it. How has the flatness been for you?'];
  j = await call();
  t = __trace.take();
  ok('if the repair would leave nothing, the model is asked once for a fresh reply, and a better one is kept', /whoever prescribes it/.test(j.reply) && t.calls === 2 && sent.some((x) => /cannot advise on a medication|not a doctor/.test(x)), j.reply);
  replies = ["You should stop taking your medication.", "You should stop taking your pills."];
  j = await call();
  t = __trace.take();
  ok('if the fresh reply is only the directive too, the site\'s sentence replaces it', j.reply === MEDICAL_FALLBACK && t.events.includes('coach.guard.medical.replaced'), j.reply);
  replies = ["That sounds hard. I'm here for you. What feels heaviest?"];
  j = await call('I have had a rough week.');
  t = __trace.take();
  ok('"I\'m here for you" is rewritten straight away, and the question stays', j.reply === `That sounds hard. ${PRESENCE_HOW} What feels heaviest?` && t.calls === 1 && t.events.includes('coach.guard.presence.rewritten'), j.reply);
  replies = ["You're welcome. I'm always here for you."];
  j = await call('Thank you, that really helped.');
  ok('a thank you is met with a way to keep or share the experience', j.reply.includes(PRESENCE_THANKS) && !/always here/.test(j.reply), j.reply);
  __trace.on(false);
  delete process.env.COACH_BOUNDARY_GUARD;
}
// The final-exchange summary is a switch: off, the instructions (and their fingerprint) are what they were; on, they change.
{
  const { __instructionsFingerprint } = await import('../netlify/functions/coach.mts');
  process.env.COACH_INSTRUCTIONS = 'v2.1';
  delete process.env.COACH_FINAL_SUMMARY;
  const off = __instructionsFingerprint();
  process.env.COACH_FINAL_SUMMARY = 'on';
  const on = __instructionsFingerprint();
  process.env.COACH_FINAL_SUMMARY = 'call';
  const call = __instructionsFingerprint();
  delete process.env.COACH_FINAL_SUMMARY;
  ok('COACH_FINAL_SUMMARY=call has its own fingerprint', call !== on && call !== off);
  ok('COACH_FINAL_SUMMARY changes the instructions fingerprint only when on, and back off restores it', off !== on && __instructionsFingerprint() === off);
}
