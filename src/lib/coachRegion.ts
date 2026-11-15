// Who may use the coach demo: for now, only connections our host places in the United States, because Venice AI's
// terms say its service is intended for people located there (venice.ai/legal/tos, section 20.9).
//
// The country is not worked out by Nenya. Netlify, our host, looks up the connection's IP address in a location
// database and hands the function a two-letter country code. The function reads that code for this one check, sends it
// back only to the visitor's own page (so the notice can say what it saw), and never stores or logs it.

/** The United States and its territories, which have their own country codes. */
export const COACH_COUNTRIES: readonly string[] = ['US', 'PR', 'GU', 'VI', 'AS', 'MP', 'UM'];

export interface HostGeo {
  country?: { code?: string };
}

export type RegionDecision =
  /** The host placed the connection in the United States. */
  | 'allowed'
  /** The host placed it elsewhere, or could not place it. */
  | 'denied'
  /** No location from the host at all: only when running outside Netlify (local development and tests). */
  | 'unchecked';

export function regionDecision(geo: HostGeo | undefined): RegionDecision {
  if (!geo) return 'unchecked';
  const code = geo.country?.code?.toUpperCase();
  return code && COACH_COUNTRIES.includes(code) ? 'allowed' : 'denied';
}

/** The country code as the host gave it, or null. Only ever returned to the visitor's own page. */
export function countryOf(geo: HostGeo | undefined): string | null {
  const code = geo?.country?.code;
  return typeof code === 'string' && /^[A-Za-z]{2}$/.test(code) ? code.toUpperCase() : null;
}
