// "Sign Our Guestbook" (owner, 2026-11-15; docs/guestbook-scope.md). A signature is two colors the visitor chooses just for the guestbook (never their session
// colors, which are the key to a saved reflection) plus a guestbook ID of two colors made from the moment of signing (so it says when). What is kept is only
// the centroid of the four, one point in RGB space, with the day. The geometry is lifted from the Apiary (its per-channel RGBPoint averaging): each channel is
// averaged on its own. Kept forever (owner). Behind VITE_GUESTBOOK=on.

export const guestbookOn = (): boolean => import.meta.env?.VITE_GUESTBOOK === 'on';

const HEX = /^#?([0-9a-f]{6})$/i;

export const normHex = (h: unknown): string | null => {
  const m = typeof h === 'string' ? HEX.exec(h.trim()) : null;
  return m ? `#${m[1].toLowerCase()}` : null;
};

export const toRgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
export const toHex = ([r, g, b]: [number, number, number]): string =>
  `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')}`;

/** The centroid of colors in RGB space: each channel averaged on its own (not the packed six-digit numbers, which would let one channel spill into the next). */
export function centroid(hexes: string[]): string {
  const pts = hexes.map(toRgb);
  const sum = pts.reduce<[number, number, number]>((a, p) => [a[0] + p[0], a[1] + p[1], a[2] + p[2]], [0, 0, 0]);
  return toHex([sum[0] / pts.length, sum[1] / pts.length, sum[2] / pts.length]);
}

function hslHex(h: number, s: number, l: number): string {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return toHex([f(0) * 255, f(8) * 255, f(4) * 255]);
}

/**
 * The guestbook ID for a moment, in UTC: the first color's hue walks the year (day of the year around the color wheel), the second's walks the day (time of
 * day around the wheel, in 10-minute steps). Lightness and saturation are fixed so both stay readable. Anyone can make it from a time: it is not a secret,
 * and it is never used for anything that needs one.
 */
export function guestbookId(at: Date): [string, string] {
  const start = Date.UTC(at.getUTCFullYear(), 0, 1);
  const days = (Date.UTC(at.getUTCFullYear() + 1, 0, 1) - start) / 86400000;
  const dayOfYear = Math.floor((at.getTime() - start) / 86400000);
  const minutes = Math.floor((at.getUTCHours() * 60 + at.getUTCMinutes()) / 10) * 10;
  return [hslHex((dayOfYear / days) * 360, 0.55, 0.55), hslHex((minutes / 1440) * 360, 0.65, 0.45)];
}

/** A signature's point: the centroid of the two chosen colors and the two of the moment. */
export const signaturePoint = (chosen: [string, string], at: Date): string => centroid([...chosen, ...guestbookId(at)]);

/** Whether the chosen pair is the visitor's session pair (in either order), which the page refuses. */
export function isSessionPair(chosen: [string, string], sessionId: string | null | undefined): boolean {
  if (!sessionId) return false;
  const parts = sessionId.split('.').map(normHex);
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false;
  const [a, b] = [normHex(chosen[0]), normHex(chosen[1])];
  return (a === parts[0] && b === parts[1]) || (a === parts[1] && b === parts[0]);
}

export const STORE_PREFIX = 'guestbook/';
/** Where the once-a-day marker goes: under the connection records (c/), so the coach's daily cleanup deletes it with the rest. */
export const onceKey = (day: string, code: string): string => `c/${day}/g-${code}`;
