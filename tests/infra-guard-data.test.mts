// The guard on replies that make claims about what happens to the person's data (a dev transcript, 2026-11-09: the model said "I don't keep any
// data... not stored or used in any way" when asked what Nenya does with it). Phrase matching: it catches these and ordinary sentences stand.
import { claimsInfrastructure } from '../src/lib/infraGuard.ts';
import { ok } from './helpers.mts';

const CLAIMS = [
  "I don't keep any data from our conversations, and Nenya doesn't store or use any information about you.",
  'It doesn\'t cost anything, and your data is not stored or used in any way.',
  'Your data is private and secure.', "We don't collect any personal details.", 'Nothing you share is stored.', 'Your conversation is safe with me.',
  'Nenya never sells your data.', "I can't keep what you write, it is deleted afterward.", 'We delete everything when you close the window.',
  'No one is reading this in real time.', 'Nobody sees what you write here.', 'No human is looking at this conversation.',
  'Your information is anonymous.', "It's completely free and always will be.", 'Everything here is confidential.',
  // found 2026-11-26: the past tense, and "details" on their own
  'I was built by OpenAI.', "I've been trained by Google.", 'I have been developed by Anthropic.', 'We never share your details.', "Nenya doesn't sell your details.", "I won't store your details.",
];
const FINE = [
  "It sounds like you don't feel safe at home.", 'You can keep a journal about this if it helps.', 'I hear that the information at work felt overwhelming.',
  'What do you need when you share this with your sister?', "It's okay to save some of that energy for yourself.", 'Your messages from your mom sound heavy.',
  "You don't have to share anything you don't want to.", 'That sounds like a safe place for you.', 'It might help to read the details of the letter together.',
  'What would help you feel private and calm?', "I can't remember what you said, can you say it again?", 'Free time sounds important to you.',
  'No one else needs to hear this right now.', 'Nobody has to read your letter before you are ready.', 'No one can tell you how you should feel about it.', 'I hear that nobody at work saw how hard you tried.',
  "I don't keep any of this conversation.", 'I will not remember this conversation, and Nenya does not keep it.', 'It sounds like you want to be heard.', 'Which of those needs feels closest right now?',
  "You don't have to share your details with anyone.", 'It sounds like you were trained by a strict teacher.', 'I was not sure what you meant about Google.',
  "I won't share your details of that night unless you want to say more.", 'You said you never share your details at work.',
];
ok('every claim about what happens to the data is caught', CLAIMS.every(claimsInfrastructure), CLAIMS.filter((x) => !claimsInfrastructure(x)).join(' | '));
ok('ordinary sentences with the same words are left alone', FINE.every((x) => !claimsInfrastructure(x)), FINE.filter(claimsInfrastructure).join(' | '));
