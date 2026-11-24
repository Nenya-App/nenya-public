// When the safety features card may appear (owner approved the proposal on 2026-11-24; docs/safety-features-card.md).
//
// The card is about keeping a visit private from someone who may be watching the device: the Emergency Exit button and Forget me. So it goes with
// the notices about abuse, where a person may be watched, and with the three coercion modules (switched off for now) so that it follows them when they are turned on.
// It never appears for suicide, self-harm, hurting yourself on purpose, distress, violence toward others in general, or any other topic, and it never replaces the help lines.
//
//   abuse, every kind: partner-or-family, control-or-fear, child-or-dependent, sexual, trafficking, and the older abuse rules that carry no kind. The person may be
//     the one being watched, or may be a parent or friend writing about a child who is; a trafficked or controlled person is the likeliest to be monitored.
//   harm-others, kind "admitted-partner": the person says they have hurt a partner. The owner included this case. The other admissions (a child, sexual harm,
//     trafficking, a killing) and graphic violence are not about a person being watched, so they are left out.
//   the coercion modules: coercion_name_pattern, coercion_steadiness, coercion_own_behavior (src/lib/coachModules.ts, off in production).
import type { SafetyFlag } from './safetyFlags.ts';

// Copied, not imported, so the page does not load the coach's module code just to show a card; tests/safety-features-card.test.mts checks that this list equals COERCION_IDS.
export const SAFETY_CARD_MODULE_IDS: readonly string[] = ['coercion_name_pattern', 'coercion_steadiness', 'coercion_own_behavior'];

type FlagLike = Pick<SafetyFlag, 'category' | 'kind'> | null | undefined;

/** True for the abuse flags (any kind, either tier) and the admitted-partner case. False for everything else, including no flag. */
export function flagWantsSafetyCard(flag: FlagLike): boolean {
  if (!flag) return false;
  if (flag.category === 'abuse') return true;
  return flag.category === 'harm-others' && flag.kind === 'admitted-partner';
}

/** `flags`: one flag, a list of flags (for example everything the checks found), or none. `moduleId`: the coach module chosen for the reply, if any. */
export function shouldShowSafetyCard(flags?: FlagLike | readonly FlagLike[], moduleId?: string | null): boolean {
  if (moduleId && SAFETY_CARD_MODULE_IDS.includes(moduleId)) return true;
  const list: readonly FlagLike[] = Array.isArray(flags) ? flags : [flags as FlagLike];
  return list.some(flagWantsSafetyCard);
}
