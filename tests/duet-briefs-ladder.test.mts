import { DUET_BRIEFS, type DuetBrief } from '../src/lib/duetBriefs.ts';
import { ok } from './helpers.mts';
const laddered: DuetBrief = { id: 't', title: 't', brief: 'b', ladder: ['asks once', 'pushes'] };
ok('a brief may carry a ladder of rising pressure, and the existing briefs need none', laddered.ladder!.length === 2 && DUET_BRIEFS.every((b) => b.ladder === undefined || (Array.isArray(b.ladder) && b.ladder.length > 0 && b.ladder.every((x) => typeof x === 'string' && x.length > 0))));
