// "Give feedback" (docs/feedback-scope.md): the parts the page and the server share. Off unless the build has VITE_FEEDBACK=on (and the server has FEEDBACK_ENABLED=true).
// What a submission holds, and nothing else: the page's path (no query, no fragment), the feature or features the person chose (or the one they pointed at), the comment,
// and, only if they typed one, an email address, which is used once for the thank-you and is never kept (netlify/functions/feedback.mts).
import { sixthLensName } from './vocabulary.ts';

/** Read as a static `import.meta.env` name, as Vite needs; on a server there is no env object and it reads as off. */
export const feedbackOn = (): boolean => import.meta.env?.VITE_FEEDBACK === 'on';

export const MAX_COMMENT = 2000;
export const MIN_COMMENT = 3;
export const MAX_ROUTE = 200;
export const MAX_PICKED = 120;
export const MAX_FEATURES = 6;
export const MAX_EMAIL = 254;

/** The list the person chooses from when they do not point. Ids are stable (they are what is kept); labels are what is read. */
export const FEATURE_IDS = [
  'breathing', 'lens-sight', 'lens-sound', 'lens-touch', 'lens-essence', 'lens-movement', 'lens-insight',
  'body-map', 'palette', 'word-help', 'coach', 'report', 'guestbook', 'about', 'terms', 'settings', 'other',
] as const;
export type FeatureId = (typeof FEATURE_IDS)[number];

export function featureLabel(id: FeatureId): string {
  switch (id) {
    case 'breathing': return 'Breathing tool';
    case 'lens-sight': return 'Sight lens';
    case 'lens-sound': return 'Sound lens';
    case 'lens-touch': return 'Touch lens';
    case 'lens-essence': return 'Essence lens';
    case 'lens-movement': return 'Movement lens';
    case 'lens-insight': return `${sixthLensName()} lens`;
    case 'body-map': return 'Body map';
    case 'palette': return 'Colors and palettes';
    case 'word-help': return 'Word help';
    case 'coach': return 'Coach demo';
    case 'report': return 'Report and summary';
    case 'guestbook': return 'Guestbook';
    case 'about': return 'About pages';
    case 'terms': return 'Terms and privacy';
    case 'settings': return 'Settings and accessibility';
    case 'other': return 'Something else';
  }
}

export const isFeatureId = (x: unknown): x is FeatureId => typeof x === 'string' && (FEATURE_IDS as readonly string[]).includes(x);

/** Known ids only, once each, at most MAX_FEATURES, in the order given. Anything else is dropped. */
export function cleanFeatures(x: unknown): FeatureId[] {
  if (!Array.isArray(x)) return [];
  const out: FeatureId[] = [];
  for (const v of x) if (isFeatureId(v) && !out.includes(v)) out.push(v);
  return out.slice(0, MAX_FEATURES);
}

/** A page path only: it must start with "/", has no query and no fragment, and keeps only plain path characters. */
export function cleanRoute(x: unknown): string {
  if (typeof x !== 'string') return '/';
  const path = x.split(/[?#]/)[0].replace(/[^A-Za-z0-9/_.\-~%]/g, '').slice(0, MAX_ROUTE);
  return path.startsWith('/') ? path : '/';
}

/** An address that is safe to hand to a mail sender: one address, no spaces, no line breaks, no angle brackets. */
export function cleanEmail(x: unknown): string {
  if (typeof x !== 'string') return '';
  const e = x.trim();
  if (e.length === 0 || e.length > MAX_EMAIL) return '';
  return /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/.test(e) ? e : '';
}
