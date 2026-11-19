// Step 6 of the suicidal-ideation audit (2026-11-19): wider coverage of hurting oneself on purpose. DRAFT wording, awaiting clinician review.
import { checkConversation } from '../src/lib/safetyFlags.ts';
import { ok } from './helpers.mts';

const one = (s: string) => checkConversation([s]);
const open = (s: string) => { const f = one(s); return f?.tier === 'soften' && f.category === 'self-injury'; };

const FLAGGED = [
  'I cut myself last night.', 'I scratched myself again.', 'I cut myself.', 'I cut my arms.', "I've been cutting my thighs.", 'I want to cut right now.',
  'I need to cut.', 'I feel like cutting tonight.', "I've been cutting again.", 'I punched the wall to feel something.', 'I pick at my skin until it bleeds.',
  'I hit my head against the wall on purpose.', 'I hide my scars from my mother.',
];
const NEVER = [
  'I cut my hair last week.', 'I want to cut back on sugar.', 'I want to cut the cake.', 'I cut my finger on a glass.', 'I cut my arm on the door while moving.',
  'I need to cut costs at work.', 'I am cutting my hours this month.', 'I feel like cutting a deal.', 'I cut my losses.', 'I cut myself shaving yesterday.',
  'I cut my hand while chopping onions.', 'I punched my pillow when I was angry.', 'I pulled my hair back for the interview.',
];
const m1 = FLAGGED.filter((s) => !open(s)); ok('wider ways of saying it open the self-injury ladder (soften, never a stop)', m1.length === 0, m1.join(' | '));
const m2 = NEVER.filter((s) => !!one(s)); ok('ordinary sentences with cut, hit, pull stay unflagged', m2.length === 0, m2.map((s) => `${s} -> ${JSON.stringify(one(s))}`).join(' | '));
const r = checkConversation(['I cut myself last night.', 'Work was fine.', 'I want to cut right now.']);
ok('the ladder works on them: a present act, then an urge, ends it', r?.tier === 'stop' && r.category === 'self-injury', JSON.stringify(r));
ok('a hidden-scars mention is a general account and never ends it', !!checkConversation(['I hide my scars from my mother.', 'I hide my scars from my friends.']) && checkConversation(['I hide my scars from my mother.', 'I hide my scars from my friends.'])?.tier === 'soften');
