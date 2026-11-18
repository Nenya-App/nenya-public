// The session ID the mark is drawn from, shared between the page that knows it (the gateways, the coach) and the footer that shows the mark.
// Held in memory only: nothing is stored or sent. With no ID set, a random shadow ID is used (src/lib/savedReflection.ts).
import { shadowId } from './savedReflection.ts';

let current: string | null = null;
let fallback: string | null = null;
const subs = new Set<() => void>();

export const getSessionMarkId = (): string => current ?? (fallback ??= shadowId());
export function setSessionMarkId(id: string | null): void {
  if (id === current) return;
  current = id;
  subs.forEach((f) => f());
}
export const subscribeSessionMark = (f: () => void): (() => void) => { subs.add(f); return () => { subs.delete(f); }; };
