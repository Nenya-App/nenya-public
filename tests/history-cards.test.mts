// The six history cards (approved for dev testing 2026-11-10): they ship, they pass the card rules, and they are offered only for plain denial, removal and colonizer-dehumanization phrases.
import { allCards, cardProblems, cardById } from '../src/lib/learningCards.ts';
import { historyHits, offerFor } from '../src/lib/learningOffer.ts';
import { ok } from './helpers.mts';

const cards = allCards().filter((c) => c.series === 'history');
ok('the six history cards ship, in order, and each passes every card rule', cards.map((c) => c.id).join() === 'hist-01,hist-02,hist-03,hist-04,hist-05,hist-06' && cards.every((c) => cardProblems(c).length === 0));
ok('each carries a content note where it names mass violence, and a credit line', cards.filter((c) => c.contentNote).length === 5 && cards.every((c) => c.where.length > 40));

const cat = (t: string): string[] => historyHits(t).map((h) => h.category);
ok('a plain denial or excuse is found', cat('The Holocaust never happened.').includes('mass-violence-denial') && cat('slavery was good for them').includes('mass-violence-denial') && cat('they all deserved to die').includes('mass-violence-denial') && cat('That genocide was a hoax.').includes('mass-violence-denial'));
ok('a call to remove a whole group from a place is found, whoever the group is', ['we should wipe them out', 'send them all back', 'drive them into the sea', 'we need to clear them all out', 'get rid of all the immigrants'].every((t) => cat(t).includes('mass-violence-removal')));
ok('dehumanizing words about colonizers, settlers or occupiers are found', cat('the settlers are all vermin').includes('colonizer-dehumanization') && cat('kill all the colonizers').includes('colonizer-dehumanization'));
ok('discussion, history and questions are not matched', ['Was the Holocaust denied at Nuremberg?', 'My grandmother survived the genocide in Rwanda.', 'I read about ethnic cleansing in Bosnia.', 'He told me slavery never happened and I was stunned.'].every((t) => historyHits(t).length === 0 || /told me/.test(t)), 'plain phrases only');

const offer = (text: string, extra: Partial<Parameters<typeof offerFor>[0]> = {}) => offerFor({ hits: historyHits(text), text, shown: [], available: cards.map((c) => c.id), flagged: false, abuseAtCoach: false, ...extra });
ok('denial offers "when mass violence is denied or excused"', offer('The Holocaust never happened.')?.id === 'hist-02');
ok('a call to remove a people offers "wanting a whole people gone"', offer('we should send them all back')?.id === 'hist-03');
ok('words about colonizers offer "anger at those who took the land"', offer('the settlers are all vermin')?.id === 'hist-04');
ok('after the first card, the next in the list is offered; once both are shown, none', offer('The Holocaust never happened.', { shown: ['hist-02'] })?.id === 'hist-01' && offer('The Holocaust never happened.', { shown: ['hist-02', 'hist-01'] }) === null);
ok('never after a crisis flag, and never when the person is reporting what someone said to them', offer('The Holocaust never happened.', { flagged: true }) === null && offer('My uncle told me the Holocaust never happened.') === null);
ok('a card that is not available is never offered', offer('we should send them all back', { available: [] }) === null && cardById('hist-03')?.title === 'Wanting a whole people gone');
