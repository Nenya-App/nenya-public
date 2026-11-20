// The lens ring's geometry and words (docs/eight-sided-gem-scope.md Part 2, section 4). Pure: no screen, no storage. The ring is the logo's leaves used as a radial menu:
// exactly one leaf per available lens, in lens order, clockwise from the top, up to 13 (8 built in plus up to 5 custom). The ring never assumes how many lenses there are;
// the caller passes the list it has at run time. Hit areas are angular sectors, not leaf shapes (neighbouring leaves overlap), and below the size where a sector is 44 CSS px
// the ring is not offered: the text tray is used instead (it is always there as the equal alternative).
//
// All text here is English and written in the lens vocabulary ("lens", "Pattern"). Nothing a visitor typed is sent anywhere; a custom lens's name arrives as plain text from customLens.ts.

export const MAX_RING_LEAVES = 13;
/** AAA target size (WCAG 2.5.5), in CSS px. */
export const TARGET_PX = 44;

/** The ring's leaves stand between these fractions of the ring's radius (the centre is left clear for the gem). */
export const INNER_FRACTION = 0.34;
export const OUTER_FRACTION = 1;

export type RingStatus = 'not-opened' | 'examined' | 'included';

export interface RingItem {
  /** A lens id, or a custom lens's id. */
  id: string;
  /** What the visitor reads and hears: "Sight", "Pattern", or a custom lens's own name (plain text). */
  title: string;
  /** One plain line saying what the lens is. */
  line: string;
  /** True for a custom lens (visit only). */
  custom?: boolean;
}

export const STATUS_WORDS: Record<RingStatus, string> = { 'not-opened': 'not opened', examined: 'examined', included: 'included in my report' };

/** The items the ring draws: the first MAX_RING_LEAVES, in the order given. Anything beyond is left out (callers cap custom lenses so this never happens). */
export const ringItems = <T>(items: readonly T[]): T[] => items.slice(0, MAX_RING_LEAVES);

/** The smallest ring diameter, in CSS px, at which every leaf's sector is a usable target for `count` leaves: the arc at the leaf tips is at least TARGET_PX, and so is the radial depth of the sector. */
export function minRingSize(count: number): number {
  const n = Math.max(1, Math.min(MAX_RING_LEAVES, Math.floor(count)));
  const byArc = n === 1 ? 0 : (TARGET_PX * n) / Math.PI; // 2·r·π/n >= 44 with the diameter 2r
  const byDepth = (2 * TARGET_PX) / (OUTER_FRACTION - INNER_FRACTION);
  return Math.ceil(Math.max(byArc, byDepth));
}

/** True when the ring can be offered at this diameter for this many leaves; false means: use the text list. */
export const ringFits = (size: number, count: number): boolean => count >= 1 && Number.isFinite(size) && size >= minRingSize(count);

/** The angle (degrees, clockwise from the top) at the middle of leaf `i`. */
export const leafAngle = (i: number, count: number): number => (360 / count) * i;

/** The sector a leaf answers touches in: from `start` to `end` degrees clockwise from the top (start may be negative for the first leaf). */
export function sector(i: number, count: number): { start: number; end: number } {
  const half = 180 / count;
  const mid = leafAngle(i, count);
  return { start: mid - half, end: mid + half };
}

/** Which leaf a point belongs to. (x, y) are relative to the ring's centre in CSS px, y down; `size` is the ring's diameter. -1 when the point is in the clear centre or outside. */
export function hitLeaf(x: number, y: number, size: number, count: number): number {
  if (count < 1) return -1;
  const r = Math.hypot(x, y), R = size / 2;
  if (r < R * INNER_FRACTION || r > R * OUTER_FRACTION) return -1;
  let deg = (Math.atan2(x, -y) * 180) / Math.PI; // 0 at the top, clockwise positive
  if (deg < 0) deg += 360;
  return Math.floor((deg + 180 / count) / (360 / count)) % count;
}

/** The accessible name of a leaf: "Sight lens, not opened, 1 of 8". A custom lens says so. */
export function leafName(item: RingItem, index: number, count: number, status: RingStatus): string {
  return `${item.title} lens${item.custom ? ', custom' : ''}, ${STATUS_WORDS[status]}, ${index + 1} of ${count}`;
}

/** The accessible description of a leaf: what the lens is, and what a second press does. */
export const leafDescription = (item: RingItem): string => `${item.line} Choose it again to pick it up.`;

/** The caption shown under the ring when a leaf is selected or focused (first tap: information). */
export function leafCaption(item: RingItem, status: RingStatus): { title: string; status: string; line: string } {
  return { title: `${item.title} lens`, status: STATUS_WORDS[status][0].toUpperCase() + STATUS_WORDS[status].slice(1), line: item.line };
}

/** The line a screen reader hears when a leaf's information appears (a polite live region). */
export const announceLeaf = (item: RingItem, index: number, count: number, status: RingStatus): string =>
  `${item.title} lens, ${STATUS_WORDS[status]}, ${index + 1} of ${count}. ${item.line} Press Enter or Space again to pick it up.`;

/** Roving focus: the next index for a key, or null if the key is not the ring's. Arrows wrap; Home and End jump. */
export function nextIndex(key: string, current: number, count: number): number | null {
  if (count < 1) return null;
  switch (key) {
    case 'ArrowRight': case 'ArrowDown': return (current + 1) % count;
    case 'ArrowLeft': case 'ArrowUp': return (current - 1 + count) % count;
    case 'Home': return 0;
    case 'End': return count - 1;
    default: return null;
  }
}

/** What a press on a leaf does. First press on a leaf selects it (information); a press on the already selected leaf picks it up. */
export const pressAction = (selected: number | null, index: number): 'inform' | 'pick-up' => (selected === index ? 'pick-up' : 'inform');

/** A leaf's outline as an SVG path, in a square of side `size` centred on the ring: a pointed oval along the leaf's angle between the inner and outer fraction. */
export function leafPath(i: number, count: number, size: number): string {
  const R = size / 2, c = R, a = (leafAngle(i, count) * Math.PI) / 180;
  const r0 = R * (INNER_FRACTION + 0.03), r1 = R * 0.97, rm = (r0 + r1) / 2;
  // half-width at the middle: fits inside the sector at that radius with a small gap
  const w = Math.min((R * (OUTER_FRACTION - INNER_FRACTION)) * 0.32, rm * Math.sin(Math.PI / count) * 0.85);
  const p = (r: number, off: number): string => `${(c + r * Math.sin(a) + off * Math.cos(a)).toFixed(1)} ${(c - r * Math.cos(a) + off * Math.sin(a)).toFixed(1)}`;
  return `M${p(r0, 0)} Q${p(rm, w * 2)} ${p(r1, 0)} Q${p(rm, -w * 2)} ${p(r0, 0)}Z`;
}

/** The ring is drawn only when VITE_LENS_RING=on (off by default; mounted only where the lens tray shows). */
export const lensRingOn = (): boolean => import.meta.env?.VITE_LENS_RING === 'on';

/** A leaf's hit sector as an SVG/CSS path (an annular wedge) in a square of side `size`, for clipping a button to exactly the sector that answers touches. */
export function sectorPath(i: number, count: number, size: number): string {
  const R = size / 2, { start, end } = sector(i, count);
  const pt = (r: number, deg: number): string => `${(R + r * Math.sin((deg * Math.PI) / 180)).toFixed(2)} ${(R - r * Math.cos((deg * Math.PI) / 180)).toFixed(2)}`;
  const ro = R * OUTER_FRACTION, ri = R * INNER_FRACTION, large = end - start > 180 ? 1 : 0;
  if (count === 1) return `M${pt(ro, 0)} A${ro} ${ro} 0 1 1 ${pt(ro, 180)} A${ro} ${ro} 0 1 1 ${pt(ro, 360)} L${pt(ri, 360)} A${ri} ${ri} 0 1 0 ${pt(ri, 180)} A${ri} ${ri} 0 1 0 ${pt(ri, 0)}Z`;
  return `M${pt(ri, start)} L${pt(ro, start)} A${ro} ${ro} 0 ${large} 1 ${pt(ro, end)} L${pt(ri, end)} A${ri} ${ri} 0 ${large} 0 ${pt(ri, start)}Z`;
}
