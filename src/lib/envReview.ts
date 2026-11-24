// Reviews the PRODUCTION site's environment variables against docs/production-env.md: what must be unset or off, what needs a decision, and what must be present. Pure: the script
// (scripts/check-site-env.mts) fetches the variables and prints this; secret-looking variables are listed by NAME ONLY, their values are never printed.
export interface EnvVar { key: string; /** The value in the production context, when there is one and it is not secret. */ value?: string | null; isSecret?: boolean; /** Present in the production context. */ inProduction: boolean }

export type Finding = { level: 'TURN OFF' | 'REVIEW' | 'MISSING' | 'OK'; key: string; note: string };

const SECRET_LIKE = /SECRET|TOKEN|KEY|HASH|PASSWORD|OWNER/i;
export const showsValue = (v: EnvVar): boolean => !v.isSecret && !SECRET_LIKE.test(v.key) && v.value != null;

/** Variables that must NOT be set on production (docs/production-env.md, "Leave unset" and the switches that are not for production). */
const MUST_BE_UNSET: Record<string, string> = {
  COACH_CARD_DRAFTS: 'owner tool for unapproved card drafts; not for production',
  COACH_CANARY: 'the nightly canary belongs to a site that runs the coach on Workers AI, not production',
  COACH_CANARY_MODEL: 'canary comparison model; not for production',
  COACH_SELECT: 'selection by meaning is dev-only until its Terms wording is approved',
  COACH_SELECT_SECRET: 'selection by meaning is dev-only until its Terms wording is approved (and production needs its own secret then)',
  COACH_INCLUDE_VENICE_PROMPT: "adds Venice's own system prompt; leave off",
  COACH_E2EE_PLAIN_HISTORY: 'a diagnostic for the encrypted route',
  COACH_E2EE_MINIMAL: 'a diagnostic for the encrypted route',
  CELL_ENABLED: 'partner cells are not built for visitors',
  VITE_CELL_ENABLED: 'the Terms describe partner cells (Section 22) only with this on; set only together with CELL_ENABLED, after the owner approves the text',
};

/** Switches that are a decision: fine if the owner chose them, but they were meant to be turned on one at a time after the matching staging test. */
const REVIEW_IF_SET: Record<string, string> = {
  COACH_SCREEN: 'the screening model (shadow counts only; `on` makes it act)',
  COACH_CANARY_PAID_NEURONS: 'staging only: lets the nightly canary spend money (a cap in Neurons beyond the free allowance); not for production',
  COACH_ARC:'the practice arc ("later")',
  COACH_STANCES: 'the Learn stance ("later")',
  COACH_SEALED: 'sealed mode ("later")',
  COACH_MODULES: 'the private module set (upload it to production\'s store first)',
  COACH_LEARNING_OFFERS: 'learning-card offers (cards, list and wording must be approved)',
  COACH_JUDGMENT_CARDS: 'cards about judgment',
  COACH_VALUES: 'the stance on mass violence and contempt',
  COACH_BOUNDARY_GUARD: 'the boundary guards (sentences approved 2026-11-17)',
  VITE_BOUNDARY_GUARD: 'the boundary guards on the sealed path (a build switch)',
  COACH_ADDRESS_GUARD: 'the address guard (a web address the site does not use is swapped for findahelpline.com or taken out); turn on for staging first, production after the owner has read the staging results',
  VITE_ADDRESS_GUARD: 'the address guard on the sealed path (a build switch)',
  VITE_NEED_TALLY: '"What has come up so far" (wording not yet approved)',
  COACH_NEED_FOCUS: 'the need-focus sentence',
  COACH_FINAL_SUMMARY: 'the final-exchange summary',
  COACH_SUMMARY_REQUEST: 'the requested summary',
  VITE_SUMMARY_REQUEST: 'the summary button',
  COACH_TURNSTILE: 'the humanity check (`shadow` counts; `on` refuses a failed first message)',
  WORD_HELP_ENABLED: 'the online word look-up through our server',
  PALETTE_ENABLED: 'the Color API button (the owner decided to use it in production, 2026-11-10)',
};

/** Present on a live production coach. */
const MUST_BE_SET = ['VENICE_API_KEY', 'COACH_TICKET_SECRET', 'COACH_SIGNING_KEY', 'COACH_IP_SECRET', 'COACH_OWNER_TOKEN_HASH', 'COACH_ENABLED'];

export function reviewEnv(vars: EnvVar[]): Finding[] {
  const prod = new Map(vars.filter((v) => v.inProduction).map((v) => [v.key, v]));
  const out: Finding[] = [];
  for (const [key, why] of Object.entries(MUST_BE_UNSET)) if (prod.has(key)) out.push({ level: 'TURN OFF', key, note: `set on production: ${why}` });
  for (const [key, v] of prod) {
    const val = showsValue(v) ? String(v.value).trim().toLowerCase() : null;
    if (/_GUARD$/.test(key) && key !== 'COACH_BOUNDARY_GUARD' && key !== 'VITE_BOUNDARY_GUARD' && key !== 'COACH_ADDRESS_GUARD' && key !== 'VITE_ADDRESS_GUARD' && val === 'off') out.push({ level: 'TURN OFF', key, note: 'a guard switched off: for measuring or an emergency only, not production' });
    if (key === 'COACH_PROVIDER' && val === 'workers-ai') out.push({ level: 'TURN OFF', key, note: 'Venice AI is the default again (2026-11-16); workers-ai makes production run on Cloudflare' });
    if (key === 'VITE_COACH_PROVIDER' && val === 'workers-ai') out.push({ level: 'TURN OFF', key, note: 'makes the pages name Cloudflare; production runs on Venice' });
    if (key === 'TURNSTILE_HOSTNAMES' && val && /localhost|127\.0\.0\.1/.test(val)) out.push({ level: 'TURN OFF', key, note: 'must never include localhost on production' });
    if (key === 'COACH_EXTRA_HOSTS' && val) out.push({ level: 'REVIEW', key, note: 'extra hosts may call the functions (deploy previews only): confirm each is meant' });
    if (REVIEW_IF_SET[key]) out.push({ level: 'REVIEW', key, note: `${REVIEW_IF_SET[key]}${val !== null ? `; value: ${val}` : ''}` });
  }
  for (const key of MUST_BE_SET) if (!prod.has(key)) out.push({ level: 'MISSING', key, note: key === 'COACH_ENABLED' ? 'the coach is off without it (fine only if you meant that)' : 'expected on a live production coach' });
  const instr = prod.get('COACH_INSTRUCTIONS');
  if (!instr) out.push({ level: 'REVIEW', key: 'COACH_INSTRUCTIONS', note: 'unset means v1; the docs say production is set to v2 (v2.1 since 2026-11-16; v2.2 is a draft, not set anywhere)' });
  else if (showsValue(instr)) out.push({ level: 'OK', key: 'COACH_INSTRUCTIONS', note: `value: ${instr.value}` });
  const order = { 'TURN OFF': 0, MISSING: 1, REVIEW: 2, OK: 3 } as const;
  return out.sort((a, b) => order[a.level] - order[b.level] || a.key.localeCompare(b.key));
}
