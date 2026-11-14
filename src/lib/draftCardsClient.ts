// Draft learning cards for TESTING on a dev site: the page fetches them from the site's own function (netlify/functions/card-drafts.mts), which serves them only where COACH_CARD_DRAFTS is on. The page asks only
// when it was BUILT with VITE_CARD_DRAFTS=on, so on production (where neither is set) nothing is requested and no draft text is in the build.
import { registerExtraCards } from './learningCards';

export const draftCardsOn = (): boolean => (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_CARD_DRAFTS === 'on';

export async function loadDraftCards(): Promise<number> {
  if (!draftCardsOn()) return 0;
  try {
    const r = await fetch('/api/card-drafts');
    return r.ok ? registerExtraCards(await r.json()) : 0;
  } catch {
    return 0;
  }
}
