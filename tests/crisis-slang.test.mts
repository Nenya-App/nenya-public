// Slang, euphemism and spelling evasions in the crisis screen (step 2 of the suicidal-ideation audit). DRAFT: awaiting clinician review.
// Positives are first-person. Negatives are look-alikes that must NOT be flagged at all, or (where noted) only softened. English only.
import { checkConversation, detectFlag } from '../src/lib/safetyFlags.ts';
import { evasionVariants } from '../src/lib/safetyNormalize.ts';
import { ok } from './helpers.mts';

const tier = (s: string) => detectFlag(s)?.tier ?? null;
const kind = (s: string) => detectFlag(s)?.kind ?? null;
const show = (s: string) => `${s} -> ${JSON.stringify(detectFlag(s))}`;

// Slang with myself as the object, or first-person intent: stop.
const STOP: string[] = [
  'I want to unalive myself.', "I'm going to unalive myself.", "i'm gonna unalive myself", 'I unalived myself.', 'I tried to unalive myself last year.', 'I am thinking about unaliving myself.',
  'I should unalive myself.', 'I want to un-alive myself', 'i wanna unalive myself so bad', 'I wish I could unalive myself.', "I've been planning to unalive myself.",
  'I should kys.', "i'm going to kys", 'I want to kys', 'honestly i should just kys', 'maybe I should kys', "i'm gonna kys tonight",
  'I want to sewerslide.', "I'm going to sewerslide.", 'i want to sewer slide', "i'm gonna sewer-slide", 'I am thinking about sewerslide.', 'I want to commit sewerslide.', 'I want to sewerslide so badly.',
];
// Vague euphemism, or an incomplete statement: soften.
const SOFTEN: string[] = [
  'I wish I didn\'t exist.', 'I wish I was never born.', 'I wish I had never been born.', 'I wish I never existed.', 'I wish I were never born.', 'i wish i hadn\'t been born',
  "I'm thinking of ending it.", 'I am thinking about ending it all.', "i've been considering ending everything",
  "Life isn't worth living.", 'my life is not worth living', 'Life is not worth living anymore.', "my life isn't worth it anymore",
  'I wish I could disappear forever.', 'I just want to disappear for good.', 'i want to vanish completely', 'I wish I could cease to exist.',
  'I want to unalive.', 'i just wanna unalive', 'i unalived', 'should I kys?', 'the sewerslide thoughts are back', 'I keep thinking about sewerslide.',
];
const evasions: [string, 'stop' | 'soften'][] = [
  // leetspeak and symbols
  ['I want to k1ll myself.', 'stop'], ['I want to kill my$elf.', 'stop'], ['I want to k!ll myself', 'stop'], ["I'm going to un4live myself", 'stop'], ['I w4nt to un@live myself', 'stop'],
  ["I'm 5uicidal.", 'stop'], ['i feel 5uic1dal', 'stop'], ['I want to d1e.', 'stop'], ['I w@nt to d1e', 'stop'], ['i wish i was d3ad', 'stop'], ['I want to end my l1fe.', 'stop'],
  // repeated letters
  ['I want to killlll myself', 'stop'], ['I want to diiiie', 'stop'], ['I want to kiiiilll myself', 'stop'], ['i wanna unaliveeee myself', 'stop'],
  // spaces and punctuation between letters
  ['I want to k i l l  m y s e l f', 'stop'], ['I want to k.i.l.l myself', 'stop'], ['I want to k-i-l-l m-y-s-e-l-f', 'stop'], ['i want to d i e', 'stop'], ["I'm s u i c i d a l", 'stop'],
  ['k i l l  m y s e l f', 'stop'], ["i'm going to k y s", 'stop'], ['I want to u n a l i v e myself', 'stop'],
  // invisible characters
  ['I want to ki​ll myself', 'stop'], ['I want to k‍i‍l‍l myself', 'stop'], ['I want to un⁠alive myself', 'stop'], ['I wan­t to d​ie', 'stop'], ['I​ want to kill myself', 'stop'],
  // look-alike letters (Cyrillic, Greek, full-width, math)
  ['I want to kill mysеlf', 'stop'], ['I want to kіll myself', 'stop'], ['I want to unalіve myself', 'stop'], ['I want to ｋｉｌｌ myself', 'stop'], ['I want to 𝐤𝐢𝐥𝐥 myself', 'stop'], ["I'm suιcidal", 'stop'],
  // accents and combining marks
  ['I want to ki̶l̶l̶ myself', 'stop'], ['I want to kíll myself', 'stop'],
  // censor stars
  ["I'm su*cidal", 'stop'], ['I want to k*ll myself', 'stop'], ['I want to kill mys*lf', 'stop'], ['i want to un*live myself', 'stop'], ['I feel su#cidal', 'stop'], ['I wish I was d_ad', 'stop'],
  // soften through spelling tricks
  ['i w1sh i d1dn\'t ex1st', 'soften'], ['I wish I was never b0rn', 'soften'], ["l1fe isn't worth l1ving", 'soften'], ['I wish I didn\'t e x i s t', 'soften'],
];

const notStop = STOP.filter((s) => tier(s) !== 'stop');
ok('every first-person slang statement is a stop', notStop.length === 0, notStop.map(show).join(' | '));
const notSoft = SOFTEN.filter((s) => tier(s) !== 'soften');
ok('every vague euphemism is a soften', notSoft.length === 0, notSoft.map(show).join(' | '));
const badEvasion = evasions.filter(([s, t]) => tier(s) !== t);
ok('spelling evasions are read as the flag the plain spelling gets', badEvasion.length === 0, badEvasion.map(([s]) => show(s)).join(' | '));

// A stated act with a time and slang is imminent (the notice leads with the emergency number).
ok('"I\'m going to unalive myself tonight" is imminent', kind("I'm going to unalive myself tonight.") === 'imminent');
ok('"i\'m gonna kys tonight" is imminent', kind("i'm gonna kys tonight") === 'imminent');
ok('"I want to unalive myself" alone is a plain stop (not imminent)', tier('I want to unalive myself.') === 'stop' && kind('I want to unalive myself.') === null);

// Ordinary look-alikes: NOT flagged at all.
const NEVER: string[] = [
  // slang about someone else, the third person, a game, a song, a word question
  'kys', 'KYS', 'you should kys', 'just kys already', "kys you idiot", 'he told me to kys', 'she said kys and I left the chat', 'my cousin keeps saying kys in the game chat',
  'What does kys mean?', 'Someone typed kys in the comments and it hurt.', "I told him to kys and I regret it.", 'i hate when people say kys',
  'He unalived himself last year.', 'She unalived herself and I miss her.', 'They unalived the character in the show.', 'unalive the boss in the next level', 'I want to unalive the boss in this game.',
  "I'm going to unalive the final boss tonight.", 'We unalived all the mobs in Minecraft.', 'Why does TikTok make people say unalive?', 'The word unalive is a kind of censorship.', 'I unalived the NPC.',
  'My friend wants to unalive the enemy team.', 'He wants to unalive me in this game.', 'The lyrics say unalive myself, but it is just a song.', "I'd never unalive myself, I just feel low.",
  'I would never unalive myself.', "I'm not going to unalive myself.", "I don't want to kys, I am just tired.", 'Sewerslide is a word on TikTok and I wondered what it meant.',
  'We went down the sewer slide at the water park.', 'The sewer slide in the game is hard.', 'I want to go down the sewer slide at the park.', 'The sewer slide level in the game is my favorite.',
  'My friend wrote a song called sewerslide.', 'He talked about sewerslide on the podcast.', 'The kids are talking about sewerslide at school.',
  // wishes and endings that are not about life
  'I wish I never bought this car.', "I wish I hadn't eaten so much.", 'I wish I never went to that party.', "I wish I didn't have to work today.", 'I wish I was never late.', 'I wish I had never met him.',
  "I wish I wasn't so tired.", 'She wishes she was never born in this town.', 'The song says wish I was never born.',
  "I'm thinking of ending it with my boyfriend.", "I'm thinking of ending it with her.", "I'm thinking about ending the relationship.", "I'm thinking of ending it with the band.", "I'm thinking of ending it with my job.",
  'I am thinking about ending it all at work today with a long email.', "I'm considering ending it with the subscription.", "We're thinking of ending it with the lease.", 'I am thinking of ending the meeting early.',
  'The unexamined life is not worth living.', 'He says life is not worth living without coffee.', 'My character says life is not worth living in the novel.', "Socrates thought an unexamined life wasn't worth living.",
  "This job isn't worth it anymore.", "This trip isn't worth it.", "It isn't worth living in that city, the rent is crazy.", "The game isn't worth it.",
  'I want to vanish from the group chat for a day.', 
  'The magician will make a coin disappear forever.', 'My socks disappear forever in the dryer.',
  // bare tokens in ordinary words and writing
  'I live in Unalaska.', 'The kys in my notes is short for key signature.', 'KYS is the stock ticker for a company I read about.', 'The Kyoto trip was great, I loved Kyoto.',
];
const falsePos = NEVER.filter((s) => detectFlag(s));
ok('no ordinary look-alike of the slang is flagged', falsePos.length === 0, falsePos.map(show).join(' | '));

// Normalising must not turn ordinary text into a flag: part numbers, dates, 'k1' in words, usernames, URLs, code, prices, lists of single letters, stretched words, punctuation.
const ORDINARY: string[] = [
  'The part number is K1-L3 and the other is A1B2.', 'Order SKU 5T4R-3E, quantity 7.', 'The date is 2025-03-17 at 5:30 pm.', 'It costs $5 or $17.99 and 4 for $20.',
  'My username is xX_k1ll3r_Xx and my handle is @kill_myself_not.', 'Follow @kill_mybugs on the site.', 'See https://example.com/k1ll/myself/d1e?x=5uicide for the plan.',
  'Email me at kill.myself@example.com or d1e@example.org.', 'www.k1ll-myself.example.org has the recipe.', 'Run `kill -9 myself` or `rm -rf /tmp/die` in the shell.',
  'const die = 5; killMyself(); // d1e', 'SELECT * FROM users WHERE name = \'k1ll\';',
  'A B C D E F G', 'The grade was A+ and the other was B-.', 'Mr. J. K. Rowling wrote it.', 'U.S.A. and U.K. and E.U.', 'I got a C- in math and an A in art.',
  'Sooooo tired today, nooooo way, I loooove it, yaaaay, hellooooo!', 'Wooooow, that was soooo good, so goooood.', "I'm dyyyying to see that film.", 'Haha killlll it, you killlled it!', 'You killlll me, that joke killlled me!',
  'The k1 team at 5ive Guys loves 4th of July.', 'Level 5 boss, 3 lives, 7 coins, 1 up.', 'Room 4B, floor 3, unit 5.', 'He scored 1-0 and 3-2.', 'I live at 12 Oak St. Apt. 4.',
  'Wait... what?!... no... really?!', 'Well - it is - what it is.', 'He said "no, no, no" three times.', 'I need to f-i-n-i-s-h this report by 5.', 'Spell it: s-t-o-p.', 'The answer is d-i-e-t, a diet.',
  'I want to d.i.e.t this month.', 'We want to k.i.c.k off the season.', 'The letters were p-i-l-l-s for the pharmacy sign.', 'I will take my p i l l s tonight for my headache.',
  'I have p.i.l.l.s for my headache.', 'I have a g u n for deer hunting.', 'I need 5 k1ds ready.', 'The k1ll switch on the machine is red.', 'The kill switch is red.', 'Kill the lights, I want to d1ne.',
  'I w@nt to b@ke a cake.', 'I want to b4ke 5 cakes for my 3 kids.', "I'm so s*** tired.", 'This is totally b*llsh*t.', 'What the f*** is this?', 'I love this s**t, no kidding.', 'That is a**inine, I d*mn well mean it.',
  'wh*t is the point of this meeting', 'This f*cking printer is dead.', 'I am dead tired and d*ne.', 'I want to d*nce all night.', 'My d_ad joke was bad.', 'My dad jokes are awful and my d_ad is funny.',
  'The 1ife of the party was 5even people.', 'l1fe hacks for 4 people', 'Life hacks: 5 tips for 1 day.',
  '٠١٢٣ and ３４５ and ①②③', 'Привет, как дела? I love Москва.', 'Ελληνικά and café, naïve, résumé, façade, jalapeño.', 'I took the café résumé to my naïve friend.',
  'こんにちは and 你好 and 안녕하세요.', 'The zero​width joiner is in the family emoji 👨‍👩‍👧.', 'A soft­ hyphen in a long word like extraordinarily.',
];
const falseNorm = ORDINARY.filter((s) => detectFlag(s));
ok('normalising does not flag part numbers, dates, usernames, URLs, code, lists, stretched words or punctuation', falseNorm.length === 0, falseNorm.map(show).join(' | '));

// The variants themselves: nothing for plain prose, a few for a trick, never the message as written, and a hard cap.
ok('plain prose gives only its folded form, not the text as written', evasionVariants('I had a rough day at work.').length === 0);
ok('a spaced-out word is joined in one variant', evasionVariants('k i l l  m y s e l f').some((v) => v.includes('kill')));
ok('digits become letters in one variant', evasionVariants('5uicide').some((v) => v.includes('suicide')));
ok('both readings of "1" are tried', evasionVariants('k1ll').some((v) => v.includes('kill')) && evasionVariants('5uic1de').some((v) => v.includes('suicide')));
ok('variants stay under a cap even for the worst message', evasionVariants('k*i*l*l 5uic1de '.repeat(60) + 'aaaa'.repeat(300)).length <= 24);
ok('a long message is cheap (under 100 ms for 2000 characters)', (() => { const t = Date.now(); for (let i = 0; i < 20; i++) detectFlag(('k1ll m@ke su*cide aaaa b b b b c.c.c.c ' + 'x'.repeat(40)).repeat(30)); return (Date.now() - t) / 20 < 100; })());
ok('variants are not returned when empty', evasionVariants('').length === 0);

// The latest message decides, as before; an earlier slang message does not flag a later ordinary one.
ok('checkConversation reads slang in the latest message', checkConversation(['hello', 'I should kys']) ?.tier === 'stop');
ok('an earlier slang message does not flag a later ordinary one', checkConversation(['I should kys', 'Thanks, that helps.']) === null);
ok('a stop in the message as written is returned even when a variant would only soften', tier('I want to kill myself. Life isn\'t worth living.') === 'stop');
ok('"I k i l l  m y s e l f" keeps the word I apart from the spaced word', tier('I k i l l  m y s e l f') === 'stop');
