// The form check for a message (src/lib/messageGate.ts): too short or no words to read. It errs toward letting messages through.
import { checkMessageForm } from '../src/lib/messageGate.ts';
import { ok } from './helpers.mts';

for (const t of ['', '   ', 'ok', 'hi', 'help', '?', '12345', '🙂🙂🙂']) ok(`short: "${t}"`, checkMessageForm(t) === 'short');
for (const t of ['asdfghjkl', 'asdf jkl', 'aaaaaaa bbbbbbb', 'qwerty zxcvbn', 'hgfdsa lkjhgf', 'xkcd pqrst vwxz']) ok(`unclear: "${t}"`, checkMessageForm(t) !== null);
for (const t of ["I'm sad", 'I feel so alone tonight.', 'my boss yelled at me', 'No no no, please stop.', 'It hurts.', 'we argued', 'I cant sleep', 'strengths and rhythms', 'Je suis fatigué ce soir', 'Estoy muy cansada hoy', 'Ich fühle mich allein', 'я очень устал сегодня', 'أنا حزين جدا اليوم', 'मैं बहुत थका हुआ हूँ', '今日はとても疲れました', '我今天很累', 'ฉันเหนื่อยมากวันนี้', 'sad af tbh', 'u r not listening to me']) ok(`goes through: "${t}"`, checkMessageForm(t) === null);
ok('a typo among real words still goes through', checkMessageForm('I feel so overwhelmd and tierd today') === null);
ok('one mashed word among real words still goes through', checkMessageForm('I feel so asdfgh tired today') === null);
ok('mostly mashed text is unclear', checkMessageForm('asdfgh qwerty I zxcvbn') === 'unclear');
