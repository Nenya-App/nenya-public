// The review of production's environment variables (src/lib/envReview.ts): what must be off, what needs a decision, what is missing, and that no secret value is ever shown.
import { reviewEnv, showsValue, type EnvVar } from '../src/lib/envReview.ts';
import { ok } from './helpers.mts';

const v = (key: string, value: string | null = 'x', extra: Partial<EnvVar> = {}): EnvVar => ({ key, value, inProduction: true, ...extra });
const BASE = ['VENICE_API_KEY', 'COACH_TICKET_SECRET', 'COACH_SIGNING_KEY', 'COACH_IP_SECRET', 'COACH_OWNER_TOKEN_HASH'].map((k) => v(k, 's3cret', { isSecret: true })).concat([v('COACH_ENABLED', 'true'), v('COACH_INSTRUCTIONS', 'v2')]);
const find = (fs: ReturnType<typeof reviewEnv>, key: string) => fs.find((f) => f.key === key);

let r = reviewEnv(BASE);
ok('a healthy production set has nothing to turn off, nothing missing, and no review items', !r.some((f) => f.level !== 'OK'));
r = reviewEnv([...BASE, v('COACH_SELECT', 'shadow'), v('COACH_SELECT_SECRET', 'zzz', { isSecret: true }), v('COACH_CARD_DRAFTS', 'on')]);
ok('selection by meaning and the card-drafts tool are flagged to turn off', find(r, 'COACH_SELECT')?.level === 'TURN OFF' && find(r, 'COACH_SELECT_SECRET')?.level === 'TURN OFF' && find(r, 'COACH_CARD_DRAFTS')?.level === 'TURN OFF');
r = reviewEnv([...BASE, v('COACH_PERSONA_GUARD', 'off'), v('COACH_NAME_GUARD', 'on')]);
ok('a guard switched off is flagged and a guard left on is not', find(r, 'COACH_PERSONA_GUARD')?.level === 'TURN OFF' && !find(r, 'COACH_NAME_GUARD'));
r = reviewEnv([...BASE, v('COACH_PROVIDER', 'workers-ai'), v('VITE_COACH_PROVIDER', 'workers-ai'), v('TURNSTILE_HOSTNAMES', 'nenya.biz,localhost')]);
ok('Cloudflare provider values and localhost in the humanity-check hosts are flagged', find(r, 'COACH_PROVIDER')?.level === 'TURN OFF' && find(r, 'VITE_COACH_PROVIDER')?.level === 'TURN OFF' && find(r, 'TURNSTILE_HOSTNAMES')?.level === 'TURN OFF');
ok('Venice as the provider is fine', !find(reviewEnv([...BASE, v('COACH_PROVIDER', 'venice')]), 'COACH_PROVIDER'));
r = reviewEnv([...BASE, v('COACH_SCREEN', 'shadow'), v('COACH_LEARNING_OFFERS', 'on'), v('PALETTE_ENABLED', 'true')]);
ok('decision switches are listed for review with their values', find(r, 'COACH_SCREEN')?.level === 'REVIEW' && /shadow/.test(find(r, 'COACH_SCREEN')!.note) && find(r, 'COACH_LEARNING_OFFERS')?.level === 'REVIEW' && find(r, 'PALETTE_ENABLED')?.level === 'REVIEW');
r = reviewEnv(BASE.filter((x) => x.key !== 'COACH_SIGNING_KEY' && x.key !== 'COACH_ENABLED'));
ok('a missing signing key and a missing enable switch are reported', find(r, 'COACH_SIGNING_KEY')?.level === 'MISSING' && find(r, 'COACH_ENABLED')?.level === 'MISSING');
ok('an unset COACH_INSTRUCTIONS is reported (it means v1)', find(reviewEnv(BASE.filter((x) => x.key !== 'COACH_INSTRUCTIONS')), 'COACH_INSTRUCTIONS')?.level === 'REVIEW');
r = reviewEnv([...BASE, v('COACH_SELECT', 'shadow', { inProduction: false })]);
ok('a variable set only for another context (not production) is ignored', !find(r, 'COACH_SELECT'));
ok('secret-looking names and flagged secrets never show a value', !showsValue(v('COACH_SIGNING_KEY', 'abc')) && !showsValue(v('ANYTHING', 'abc', { isSecret: true })) && !showsValue(v('NETLIFY_API_TOKEN', 'abc')) && showsValue(v('COACH_SCREEN', 'shadow')));
ok('no finding carries a secret value in its note', reviewEnv([...BASE, v('COACH_SELECT_SECRET', 'TOPSECRETVALUE', { isSecret: true })]).every((f) => !/TOPSECRETVALUE/.test(f.note)));
const order = reviewEnv([...BASE, v('COACH_SELECT', 'shadow'), v('COACH_SCREEN', 'shadow')]).map((f) => f.level);
ok('findings are ordered: turn off first, then missing, review, ok', JSON.stringify(order) === JSON.stringify([...order].sort((a, b) => ['TURN OFF', 'MISSING', 'REVIEW', 'OK'].indexOf(a) - ['TURN OFF', 'MISSING', 'REVIEW', 'OK'].indexOf(b))));

// v2.2: a COACH_INSTRUCTIONS value of v2.2 is shown as set (OK, with the value), not flagged.
{
  const r22 = reviewEnv(BASE.map((x) => (x.key === 'COACH_INSTRUCTIONS' ? v('COACH_INSTRUCTIONS', 'v2.2') : x)));
  ok('the env review accepts COACH_INSTRUCTIONS=v2.2 and shows its value', find(r22, 'COACH_INSTRUCTIONS')?.level === 'OK' && /v2\.2/.test(find(r22, 'COACH_INSTRUCTIONS')?.note ?? ''));
}
