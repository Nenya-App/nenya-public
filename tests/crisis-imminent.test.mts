// Plan, means, an act in progress, goodbyes: stop tier, kind "imminent" (the notice leads with the emergency number). DRAFT: awaiting clinician review.
// Positives are first-person, present or near-future statements. Negatives are the look-alikes that must NOT be flagged at all (or, where noted, only softened).
import { checkConversation, detectFlag, resourcesFor, noticeIntro } from '../src/lib/safetyFlags.ts';
import { IMMINENT_LEAD, STOP_LEAD } from '../src/lib/distressText.ts';
import { ok } from './helpers.mts';

const IMMINENT: string[] = [
  // means
  'I have a gun.', 'I have a rope.', 'I have pills.', 'I have a gun and I am going to use it.', 'I have a rope and I know where.', 'I have the pills here with me.',
  'I have a stash of pills saved up.', 'I have a gun here next to me.', 'The pills in front of me are all I can think about.', "I've got a loaded gun in my room.",
  // plan with a time
  'I have a plan for tonight.', 'I have a plan for today.', "I've got a plan for right now.", 'I have a plan for this weekend.', 'I have a plan and it is for tonight.',
  'I know exactly how I am going to do it.',
  // going to / doing it
  "I'm going to do it tonight.", "I'm going to kill myself tonight.", 'I will end it all today.', "I'm going to end my life this weekend.", "I'm doing it right now.",
  "I'm about to jump.", "I'm going to jump right now.", "I'm standing on the ledge.", 'I am standing at the edge of the bridge.',
  // acts
  'I overdosed.', "I've just overdosed.", 'I took the whole bottle of my sleeping pills.', "I'm taking all of my pills.", 'I took all of my pills.', 'I took too many pills.',
  "I'm going to cut my wrists.", "I'm cutting my wrists.", 'I just cut my wrists.', "I'm going to slit my throat.",
  // goodbyes
  'This is my goodbye.', 'This is my final message.', 'By the time you read this I will be gone.', 'By the time you read this...', "I won't be here tomorrow.",
  "I'm giving away my things because I won't need them anymore.", 'I gave my dog away because I will not need him.', 'I am going to overdose.',
];

// Ordinary talk with similar words: NOT flagged at all.
const NEVER: string[] = [
  // plan without intent, or an ordinary plan
  'I have a plan for the weekend.', 'I have a plan for this weekend: hiking and a long lunch.', 'I have a plan for dinner tonight.', 'I have a plan for the budget.', 'I have a plan.',
  'I have a plan for today, and it is to clean the garage.', 'I have a plan for the meeting today.', 'I have a plan for tomorrow.',
  // guns, ropes, pills: not about oneself
  'I read an article about gun violence in schools.', 'The news report said he had a gun.', 'I have a gun safe for hunting season.', 'I have a gun for deer hunting.',
  'I have a hunting rifle at the range.', 'My grandfather has a gun collection in a museum.', 'My grandmother took pills for her heart.', 'My grandmother has pills for her heart.',
  'I have pills for my headache.', 'I have a rope for the boat.', 'I have a rope in the garage for the tire swing.', 'The pills in the pharmacy were on sale.', 'I have a stash of snacks.',
  'He has a gun.', 'My friend overdosed last year and is doing well now.', 'I overdosed on coffee this morning.',
  'I overdosed years ago and have been well since.', 'The character overdosed in the novel.', 'He took the whole bottle of pills in the movie.',
  // jumping, doing it, the edge
  "I'm going to jump in the pool.", "I'm about to jump into the lake.", 'I am going to jump rope today.', 'We are going to jump off the dock tonight.', "I'm going to jump on the trampoline.",
  "I'm going to do it later.", "I'm going to do my homework tonight.", "I'm doing it my way.", "I'm doing it again tomorrow.", "I'm on the edge of my seat.", "I'm on the roof fixing the shingles.",
  "I'm on the bridge to work.", 'I am on the committee.',
  // taking medicine, cutting
  "I'm taking all of my pills with me on the trip.", "I'm taking my pills now.", 'I took my pills this morning.', 'I took all of my pills to the pharmacy to ask about them... no, I took them to the pharmacist for a check.',
  'I cut my wrist on a can.', 'He cut his wrists in the story.', 'I cut my hair.', 'I cut my throat singing too loud.',
  // idioms
  'I could kill for a coffee.', "I'm dying laughing.", "I'm dying to see that film.", 'That joke killed me.', "I'm going to kill this presentation tonight.", "I'm going to kill it at the gym tonight.",
  'My phone is dead.', 'I am dead tired today.',
  // goodbyes that are not
  'This is my goodbye post for the team, I am leaving the job.', "This is my last day at the office.", 'By the time you read this I will be on the plane.', 'By the time you read this, the meeting will be over.',
  "I won't be here tomorrow, I have a doctor appointment.", "I won't be here tomorrow because I'm off work.", "I'm giving away my old clothes because I won't need them after the move.",
  "I'm giving away my things because I am moving.", "I'm giving away the baby clothes because she outgrew them.", "I'm giving my kids' toys away because I don't need them.",
  "I'm saying goodbye to everyone at the office, it is my retirement day.",
];

const tier = (s: string) => detectFlag(s)?.tier ?? null;
const kind = (s: string) => detectFlag(s)?.kind ?? null;

const notImminent = IMMINENT.filter((s) => tier(s) !== 'stop' || kind(s) !== 'imminent');
ok('every plan, means, act and goodbye is a stop with kind imminent', notImminent.length === 0, notImminent.map((s) => `${s} -> ${JSON.stringify(detectFlag(s))}`).join(' | '));
const falsePos = NEVER.filter((s) => detectFlag(s));
ok('no ordinary look-alike is flagged', falsePos.length === 0, falsePos.map((s) => `${s} -> ${JSON.stringify(detectFlag(s))}`).join(' | '));

ok('"going to overdose on caffeine" is not a stop (a soften at most)', tier("I'm going to overdose on caffeine at this rate.") !== 'stop');
ok('"I am on the edge of my seat" and "I am on the edge" are not flagged', detectFlag("I'm on the edge of my seat.") === null && detectFlag("I'm on the edge of tears.") === null);

// Said alone, saying goodbye to everyone or giving things away is a soften, not a stop.
ok('"I am saying goodbye to everyone" is a soften', tier("I'm saying goodbye to everyone.") === 'soften');
ok('"I am giving away my things" is a soften', tier("I'm giving away my things.") === 'soften');

// Through checkConversation as the server calls it: the latest message decides; earlier harmless messages change nothing.
const conv = checkConversation(['I had a rough week.', 'I have a plan for tonight.']);
ok('checkConversation stops a plan for tonight in the latest message', conv?.tier === 'stop' && conv.kind === 'imminent' && conv.category === 'self-harm');
ok('checkConversation does not stop on a plan in an earlier message about hiking', checkConversation(['I have a plan for the weekend.', 'Thanks, that helps.']) === null);

// An existing stop keeps its tier and category; it now leads the notice with the emergency number only where it states a plan, means or an act.
ok('"I want to die" stays a stop without kind imminent', tier('I want to die.') === 'stop' && kind('I want to die.') === null);
ok('a stated method is imminent', kind("I'm going to hang myself.") === 'imminent');

// Resources: emergency number first for imminent; unchanged order for other suicide stops; the notice text is the existing stop text.
const imminent = detectFlag('I have a plan for tonight.')!;
const first = resourcesFor(imminent.category, imminent.kind)[0];
ok('imminent resources lead with the emergency number', first.name === 'Immediate danger' && /911/.test(first.detail));
ok('imminent resources still include 988 and Crisis Text Line', resourcesFor('self-harm', 'imminent').some((r) => /988/.test(r.name)) && resourcesFor('self-harm', 'imminent').some((r) => /Crisis Text Line/.test(r.name)));
ok('plain suicide stop keeps 988 first', /988/.test(resourcesFor('self-harm')[0].name));
ok('imminent has its own notice (blend of B and C), different from the generic stop text', noticeIntro(imminent) === IMMINENT_LEAD && noticeIntro(imminent) !== noticeIntro({ ...imminent, kind: undefined }));
ok('the imminent notice names 911, Poison Help and 988, and says it is an AI', /911/.test(IMMINENT_LEAD) && /1-800-222-1222/.test(IMMINENT_LEAD) && /988/.test(IMMINENT_LEAD) && /I'm an AI/.test(IMMINENT_LEAD));
ok('the imminent notice says a text is enough, and mentions someone nearby and distance', /text HOME to 741741/.test(IMMINENT_LEAD) && /someone is near you/.test(IMMINENT_LEAD) && /distance/.test(IMMINENT_LEAD));
ok('a plain suicide stop keeps the generic stop text', noticeIntro(detectFlag('I want to die.')!) === STOP_LEAD);
ok('imminent resources: emergency, then Poison Help, then 988', (() => { const l = resourcesFor('self-harm', 'imminent'); return l[0].name === 'Immediate danger' && /Poison Help/.test(l[1].name) && /988/.test(l[2].name); })());
ok('other suicide stops do not list Poison Help', !resourcesFor('self-harm').some((r) => /Poison/.test(r.name)));
