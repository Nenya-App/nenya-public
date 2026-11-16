// An admission with only a pronoun ("That's why I hit her") counts when the conversation has already named a partner or a home life (owner, 2026-11-16).
import { checkConversation } from '../src/lib/safetyFlags.ts';
import { ok } from './helpers.mts';
const kind = (msgs: string[]) => { const f = checkConversation(msgs); return f ? `${f.tier}/${f.category}/${f.kind ?? ''}` : null; };
const HOME = 'It has been a rough time at home lately. My temper keeps getting the better of me.';
ok('"I hit her" after a message about home life is an admission to a partner', kind([HOME, "That's why I hit her. I didn't mean to."]) === 'stop/harm-others/admitted-partner', String(kind([HOME, "That's why I hit her."])));
ok('the same after a message that names a partner', kind(['My girlfriend and I fight constantly.', 'Last night I shoved her and she left.']) === 'stop/harm-others/admitted-partner');
ok('"I hit her" with no earlier mention of a partner or home is not stopped', kind(['I hit her last week.']) === null && kind(['I had a bad week.', 'I hit her.']) === null);
ok('where a child is named anywhere in the conversation it is ambiguous, so no partner stop', kind([HOME + ' My son is scared of me.', 'I hit her.']) === null);
ok('a game, a film or an accident in the message is not an admission', kind([HOME, 'In the movie I hit her with a chair.']) === null && kind([HOME, 'I accidentally hit her with the ball while playing.']) === null);
ok('"hurt" and "pushed" are not enough (feelings, a restaurant): no stop', kind([HOME, 'I hurt her feelings.']) === null && kind(['My girlfriend wants a new job.', 'I pushed her to apply.']) === null);
ok('"shoved my girlfriend" is now caught on its own', kind(['I shoved my girlfriend and she will not talk to me.']) === 'stop/harm-others/admitted-partner');
ok('the earlier partner rules still stop as before', kind(['I hit my partner last week.']) === 'stop/harm-others/admitted-partner' && kind(['I hit my wife']) === 'stop/harm-others/admitted-partner');
ok('"I lost my temper and hit my partner" (the act after "and") is caught, for a partner and for a child', kind(['Last week, I lost my temper and hit my partner. They have not spoken to me.']) === 'stop/harm-others/admitted-partner' && kind(['I lost my temper and then hit my son.']) === 'stop/harm-others/admitted-child');
ok('someone else hitting my partner, or a kind act after "and", is not an admission', kind(['My brother lost his temper and hit my partner.']) === null && kind(['I was tired and then kissed my wife goodnight.']) === null && kind(['I lost my keys and hit the brakes near my son.']) === null);
