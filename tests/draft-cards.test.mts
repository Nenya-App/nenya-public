// Draft cards for testing on a dev site: loaded at run time, marked as drafts, held to the same rules as approved cards, never replacing an approved card, and not served without the switch.
import { LEARNING_CARDS, allCards, cardById, registerExtraCards, __resetExtraCardsForTests } from '../src/lib/learningCards.ts';
import { ok } from './helpers.mts';
const good = { id: 'idea-02', series: 'nvc-ideas', order: 2, title: 'Observation and judgment', contentNote: '', key: 'Saying what happened differs from saying what we think of it.', body: 'When we tell someone what they did, we can describe it as a camera would. When we say what kind of person they are, we are judging. The two are easy to mix up, and the mix often makes the other person defensive. Separating them can make a request easier to hear, and it keeps the facts available for both people to look at.', tryIt: 'Describe the last thing that bothered you without any word of judgment.', where: 'Rosenberg, Nonviolent Communication (2003).', more: '', url: 'https://www.cnvc.org/', license: 'in copyright' };
const before = allCards().length;
ok('with no drafts loaded the cards are the approved ones', allCards() === LEARNING_CARDS && before === LEARNING_CARDS.length);
ok('a valid draft is added and marked as a draft', registerExtraCards([good]) === 1 && allCards().length === before + 1 && cardById('idea-02')?.draft === true);
ok('a card that breaks the rules is left out (a link in the body)', registerExtraCards([{ ...good, id: 'idea-03', body: good.body + ' https://example.com' }]) === 0);
ok('a card with no source address is left out', registerExtraCards([{ ...good, url: '' }]) === 0);
ok('an approved card of the same id is never replaced', registerExtraCards([{ ...good, id: LEARNING_CARDS[0].id }]) === 0 && cardById(LEARNING_CARDS[0].id)?.draft === undefined);
ok('anything that is not a list is ignored', registerExtraCards('x') === 0 && registerExtraCards(null) === 0);
__resetExtraCardsForTests();
ok('resetting returns to the approved cards', allCards() === LEARNING_CARDS);

// the function: nothing without the switch
const { default: serve, __useStoreForTests } = await import('../netlify/functions/card-drafts.mts');
__useStoreForTests({ async get() { return JSON.stringify([good]); } });
delete process.env.COACH_CARD_DRAFTS;
ok('without COACH_CARD_DRAFTS the endpoint does not exist', (await serve(new Request('https://nenya.biz/api/card-drafts'))).status === 404);
process.env.COACH_CARD_DRAFTS = 'on';
const r = await serve(new Request('https://nenyastaging.netlify.app/api/card-drafts'));
ok('with it on, the stored drafts are served', r.status === 200 && (await r.json() as unknown[]).length === 1);
ok('only GET is answered', (await serve(new Request('https://x/api/card-drafts', { method: 'POST' }))).status === 405);
