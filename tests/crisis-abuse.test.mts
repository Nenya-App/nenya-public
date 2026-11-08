// Abuse, partner violence, child abuse and assault: what the crisis check stops (happening now, with a physical or sexual verb), what it
// softens (fear, control, the word "abusive", what happened before), the ordinary sentences it leaves alone, and the kinds that choose the resources.
import { detectFlag, resourcesFor } from '../src/lib/safetyFlags.ts';
import { ok } from './helpers.mts';

const STOP = [
  'My partner is abusing me.', 'My husband hits me.', 'My boyfriend chokes me.', 'My dad beats me when he drinks.', 'He is hitting me.', 'She punches me when she is angry.', 'My wife kicks me.',
  'He pushed me against the wall last night.', 'My ex grabs me by the throat.', 'My stepfather touches me inappropriately.', 'My uncle is raping me.', 'He forces me to have sex.',
  'My partner is abusing my child.', 'My husband hits the kids.', 'She hits my son.', 'My boyfriend hurts my daughter.', 'My stepfather touches my sister inappropriately.',
  'I think my child is being abused.', 'My daughter is being hit by her father.', 'Someone is being hurt in the apartment next door.', 'I am being beaten at home.', 'He locks me in the room.',
];
const SOFTEN = [
  'He is hurting me.', 'My partner hurts me when he is angry.', 'My mother hurts me.', 'My partner is abusive.', 'My marriage is abusive.', 'I am in an abusive relationship.', 'I am a victim of domestic violence.',
  'I am afraid of my husband.', 'I am scared to go home.', 'I am terrified of my dad.', 'I feel like I am walking on eggshells all the time.',
  'He will not let me leave the house.', 'My partner takes my phone and my money.', 'He controls everything I do.', 'She goes through my phone every night.', 'I cannot leave him.',
  'My ex keeps following me and I am afraid.', 'He threatened to take the kids if I leave.', 'My ex keeps showing up at my work.',
  'I was raped last month.', 'I was sexually assaulted at a party.', 'Someone molested me when I was a kid.', 'I am a survivor of childhood abuse.', 'I was abused as a child.',
  'My mom hit me when I was little and I still think about it.', 'My parents hit me.', 'My husband beat me up.',
];
const NEVER = [
  'She slapped me on the back and said well done.', 'My boss pushes me to work harder.', 'He hurts my feelings sometimes.',
  'My husband snores and I am afraid of my husband\'s snoring waking the baby.', 'I am scared of my boss\'s reaction to the news.', 'My mom hurts my feelings when she criticizes my cooking.',
  'My teacher gave us a project on domestic violence awareness.', 'I read an article about child abuse prevention.', 'The documentary was about abusive relationships in history.',
  'We had a loud fight about money and made up.', 'He is a violent storm of a drummer.', 'The kids hit each other with pillows and laughed.',
  'My dad beat the traffic and got home early.', 'She threw me a surprise party.', 'He drags me to the gym every morning and I love it.', 'My partner takes my phone charger and I get annoyed.',
  'I control my own budget.', 'My sister keeps following my advice.', 'My ex keeps calling my mother to say hello.', 'I was drugged by the cold medicine and slept all day.',
  'I was touched by how many people came.', 'My coworker watches me work and gives tips.', 'My wife checks my messages for the grocery list.',
  'My grandmother hits the casino every Friday.', 'The baby kicks me in the ribs; she is due next week.', 'I am afraid of heights.', 'I was attacked by a swarm of mosquitoes.',
];
const tier = (s: string) => detectFlag(s)?.tier ?? null;
const missStop = STOP.filter((s) => tier(s) !== 'stop'); ok('every abuse-now phrase is stopped', missStop.length === 0, missStop.join(' | '));
const missSoft = SOFTEN.filter((s) => tier(s) === null); ok('every fear, control or past-abuse phrase is flagged', missSoft.length === 0, missSoft.join(' | '));
const softStopped = SOFTEN.filter((s) => tier(s) === 'stop'); ok('nothing meant as soften is stopped', softStopped.length === 0, softStopped.join(' | '));
const falsePos = NEVER.filter((s) => detectFlag(s)); ok('no ordinary sentence is flagged', falsePos.length === 0, falsePos.map((s) => `${s} -> ${JSON.stringify(detectFlag(s))}`).join(' | '));
ok('"hit me up" and "beat me at chess" are no longer flagged, and real ones still are', !detectFlag('He hit me up on Instagram yesterday.') && !detectFlag('My brother beat me at chess again.') && !detectFlag('He is hitting me up about the invoice.') && !detectFlag('She is beating me at chess again.') && ['My husband beat me up.', 'He hit me once.', 'She assaulted me.', 'Someone molested me.'].every((x) => detectFlag(x)));
ok('the kind follows the phrase', detectFlag('My stepfather touches my sister inappropriately.')?.kind === 'child-or-dependent' && detectFlag('I was raped last month.')?.kind === 'sexual' && detectFlag('My husband hits me.')?.kind === 'partner-or-family' && detectFlag('I am afraid of my husband.')?.kind === 'control-or-fear');
const names = (s: string) => resourcesFor('abuse', detectFlag(s)?.kind).map((r) => r.name).join(' | ');
ok('child abuse adds Childhelp, sexual assault adds RAINN, and the domestic violence line offers text', /Childhelp/.test(names('My husband hits the kids.')) && /RAINN/.test(names('I was raped last month.')) && !/Childhelp|RAINN/.test(names('My husband hits me.')) && resourcesFor('abuse').some((r) => /88788/.test(r.detail)));
ok('the other categories do not list the abuse lines', !resourcesFor('self-harm').some((r) => /Childhelp|RAINN|Domestic/.test(r.name)));
