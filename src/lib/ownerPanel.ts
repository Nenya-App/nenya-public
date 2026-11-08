// The owner's testing switches for the coach, kept in the owner's own browser (see deviceMemory.ts, docs/coach-testing.md):
//   skipRest      skip the six-hour rest after a conversation (the existing nenya.coach.owner flag)
//   distressText  'site' (follow the site's own setting), 'on' or 'off' for the sentences the site adds after a flagged reply
//   instructions  'site', 'v1' (the live wording) or 'v2' (the new wording)
// The two coach switches are sent with each message ONLY when the owner's token is also in this browser, and the coach honours them only
// when it checks the token: a visitor who opens the panel can change nothing about how the coach behaves. Nothing here leaves the device
// except that header and those two values.
import { OVERRIDES_KEY, OWNER_KEY, OWNER_TOKEN_KEY } from './deviceMemory.ts';

export interface OwnerSettings {
  skipRest: boolean;
  distressText: 'site' | 'on' | 'off';
  instructions: 'site' | 'v1' | 'v2';
}

const get = (k: string): string | null => {
  try { return localStorage.getItem(k); } catch { return null; }
};
const set = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } };
const del = (k: string) => { try { localStorage.removeItem(k); } catch { /* nothing to remove */ } };

export const hasOwnerToken = (): boolean => !!get(OWNER_TOKEN_KEY);

/** The panel shows when the owner has set it up here (a token or the rest flag), or opens it with ?owner in the address. */
export const panelVisible = (search: string): boolean => /(?:^|[?&])owner(?:=|&|$)/.test(search) || hasOwnerToken() || get(OWNER_KEY) === '1';

export function readSettings(): OwnerSettings {
  let o: { distressText?: unknown; instructions?: unknown } = {};
  try { const j = JSON.parse(get(OVERRIDES_KEY) ?? '{}'); if (j && typeof j === 'object') o = j; } catch { /* corrupt: use the defaults */ }
  return {
    skipRest: get(OWNER_KEY) === '1',
    distressText: o.distressText === 'on' || o.distressText === 'off' ? o.distressText : 'site',
    instructions: o.instructions === 'v1' || o.instructions === 'v2' ? o.instructions : 'site',
  };
}

export function writeSettings(s: OwnerSettings) {
  if (s.skipRest) set(OWNER_KEY, '1'); else del(OWNER_KEY);
  const o: Record<string, string> = {};
  if (s.distressText !== 'site') o.distressText = s.distressText;
  if (s.instructions !== 'site') o.instructions = s.instructions;
  if (Object.keys(o).length) set(OVERRIDES_KEY, JSON.stringify(o)); else del(OVERRIDES_KEY);
}

export const saveToken = (token: string) => { const t = token.trim(); if (t) set(OWNER_TOKEN_KEY, t); };
export const clearOwner = () => { del(OWNER_TOKEN_KEY); del(OWNER_KEY); del(OVERRIDES_KEY); };

/** What goes in a coach request: the switches that are set, and only if the owner's token is here too. */
export function overridesForRequest(): { overrides?: { distressText?: 'on' | 'off'; instructions?: 'v1' | 'v2' } } {
  if (!hasOwnerToken()) return {};
  const s = readSettings();
  const overrides = { ...(s.distressText !== 'site' ? { distressText: s.distressText } : {}), ...(s.instructions !== 'site' ? { instructions: s.instructions } : {}) };
  return Object.keys(overrides).length ? { overrides } : {};
}
