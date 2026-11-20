// The body map's paintbrush and its paints (owner, 2026-11-17 and 2026-11-18: "one body map for the whole report ... painted with the colors and surfaces a person added";
// "the body map could be a shared card that picks up the lenses as they are picked up for the first time"). Pure: no screen and no storage, so it is tested.
//
// A PAINT is a color or a surface. The lenses give paints when they are added to the report (not before: a lens that is only open has not been added):
//   Sight gives its two colors (present and wish); Touch gives its two surfaces (present and wish), if the person chose them from the pictures.
//   Sound, Essence, Movement and Pattern give no paint (Sound's melody colors reach the body map through Sight, as Sight's starting colors). They are still named as picked up.
// Any color from the picker is always available too ("another color"), with or without a lens.
// A stroke keeps its own copy of the paint (color, surface and names), so taking a lens out of the report removes its brushes but never the marks already made with them.
import { textureById } from './touchTextures.ts';
import { LENS_ORDER, type LensAdded, type LensId } from './lensState.ts';
import { nearestPart, clamp, MAP_W, MAP_H } from './bodyMapParts.ts';
import { sixthLensName } from './vocabulary.ts';

export interface Paint {
  /** Stable within a visit: "sight-1", "sight-2", "touch-<surface id>", "picker-<hex>". */
  id: string;
  kind: 'color' | 'surface';
  /** What it is called: a color's name (or its hex) or a surface's title. */
  label: string;
  /** The color, or a surface's average color (the fallback when its picture is not there). */
  hex: string;
  /** For a surface: the picture's id (public/touch-textures/<id>.jpg). */
  surfaceId?: string;
  /** Where it came from, in words: "Sight, present" or "the color picker". */
  from: string;
}

export interface BrushStroke { paint: Paint; /** Width in map units (the map is 300 by 420). */ size: number; /** Points in map units, one decimal. A single point is a dab. */ pts: [number, number][] }

const HEX = /^#[0-9a-fA-F]{6}$/;

export const LENS_NAMES: Record<LensId, string> = { sight: 'Sight', sound: 'Sound', touch: 'Touch', essence: 'Essence', movement: 'Movement', insight: 'Insight', nature: 'Nature', story: 'Story' };
/** The visitor-facing name of a lens (the sixth is Pattern when the lens words are on). */
export const lensName = (id: LensId): string => (id === 'insight' ? sixthLensName() : LENS_NAMES[id]);

export const MAX_POINTS = 600; // per stroke
export const MAX_STROKES = 300;
export const MIN_STEP = 1; // map units: a pointer point closer than this to the last one is skipped
export const SIZE_MIN = 3, SIZE_MAX = 20, SIZE_DEFAULT = 8;

/** The paints one added lens gives (none for the lenses that have nothing to paint with). */
export function paintsOf(lens: LensId, data: any): Paint[] {
  const out: Paint[] = [];
  if (lens === 'sight') {
    ([['color1', 'color1Name', 'present', 1], ['color2', 'color2Name', 'wish', 2]] as const).forEach(([ck, nk, which, n]) => {
      const hex = data?.[ck];
      if (typeof hex === 'string' && HEX.test(hex)) out.push({ id: `sight-${n}`, kind: 'color', label: (typeof data?.[nk] === 'string' && data[nk].trim()) || hex.toUpperCase(), hex: hex.toUpperCase(), from: `Sight, ${which}` });
    });
  } else if (lens === 'touch') {
    ([['currentSurface', 'present'], ['potentialSurface', 'wish']] as const).forEach(([k, which]) => {
      const t = textureById(data?.[k]);
      if (!t) return;
      const existing = out.find((p) => p.surfaceId === t.id);
      if (existing) { existing.from = 'Touch, present and wish'; return; }
      out.push({ id: `touch-${t.id}`, kind: 'surface', label: t.title, hex: t.hex, surfaceId: t.id, from: `Touch, ${which}` });
    });
  }
  return out;
}

export interface Brush { lens: LensId; paint: Paint }

/** Every brush the added lenses give, in lens order. Reads only what was added, so a lens that was taken out gives none. */
export function brushesFor(added: LensAdded[]): Brush[] {
  const sorted = [...added].sort((a, b) => LENS_ORDER.indexOf(a.gateway) - LENS_ORDER.indexOf(b.gateway));
  return sorted.flatMap((a) => paintsOf(a.gateway, a.data).map((paint) => ({ lens: a.gateway, paint })));
}

/** What a lens gave the map, in words (for the card and the screen reader). */
export function gaveText(lens: LensId, added: LensAdded[]): string {
  const mine = brushesFor(added).filter((b) => b.lens === lens);
  if (!mine.length) return 'nothing to paint with, but it is named in the body map section';
  const colors = mine.filter((b) => b.paint.kind === 'color'), surfaces = mine.filter((b) => b.paint.kind === 'surface');
  const parts: string[] = [];
  if (colors.length) parts.push(`${colors.length === 1 ? 'a color' : `${colors.length} colors`} (${colors.map((b) => b.paint.label).join(', ')})`);
  if (surfaces.length) parts.push(`${surfaces.length === 1 ? 'a surface' : `${surfaces.length} surfaces`} (${surfaces.map((b) => b.paint.label).join(', ')})`);
  return parts.join(' and ');
}

/** The lenses that are newly picked up (added now, not seen before), in lens order, and the new seen list: exactly the added lenses, so a lens taken out and added again counts as new again. */
export function pickupDiff(seen: LensId[], added: LensAdded[]): { fresh: LensId[]; seen: LensId[] } {
  const now = [...new Set(added.map((a) => a.gateway))].sort((a, b) => LENS_ORDER.indexOf(a) - LENS_ORDER.indexOf(b));
  return { fresh: now.filter((l) => !seen.includes(l)), seen: now };
}

/** The sentence a screen reader gets when lenses are picked up for the first time. */
export function pickupAnnouncement(fresh: LensId[], added: LensAdded[]): string {
  if (!fresh.length) return '';
  return fresh.map((l) => `${lensName(l)} picked up by the body map: ${gaveText(l, added)}.`).join(' ');
}

// ---------- strokes
export const round1 = (n: number): number => Math.round(n * 10) / 10;

/** Adds a point to a stroke unless it is nearly where the last one is, or the stroke is full. */
export function addPoint(pts: [number, number][], x: number, y: number): [number, number][] {
  const px = round1(clamp(x, 0, MAP_W)), py = round1(clamp(y, 0, MAP_H));
  const last = pts[pts.length - 1];
  if (last && Math.hypot(last[0] - px, last[1] - py) < MIN_STEP) return pts;
  return pts.length >= MAX_POINTS ? pts : [...pts, [px, py]];
}

/** The stroke width in map units for a brush size chosen at a zoom: the brush keeps its size on the screen, so a finer mark is made by zooming in. */
export const effectiveSize = (size: number, zoom: number): number => Math.max(0.5, round1(clamp(size, SIZE_MIN, SIZE_MAX) / Math.max(1, zoom)));

/** An SVG path for a stroke. A dab (one point) is a zero-length segment, which a round cap draws as a dot. */
export function strokePath(pts: [number, number][]): string {
  if (!pts.length) return '';
  const [x0, y0] = pts[0];
  if (pts.length === 1) return `M${x0} ${y0}l0.01 0`;
  return `M${x0} ${y0}` + pts.slice(1).map(([x, y]) => `L${x} ${y}`).join('');
}

const centroid = (pts: [number, number][]): { x: number; y: number } => ({ x: pts.reduce((s, p) => s + p[0], 0) / pts.length, y: pts.reduce((s, p) => s + p[1], 0) / pts.length });

/** Where a stroke is, in words: the named part nearest its middle. */
export const strokeWhere = (s: BrushStroke): string => { const c = centroid(s.pts); return nearestPart(c.x, c.y).label; };

const plural = (n: number, one: string, many: string): string => `${n} ${n === 1 ? one : many}`;

/** The brush marks as text, one line per paint, with where they are: "Wool (surface): 3 strokes (2 near L. Hand, 1 near Chest)". The text twin of the picture, for the report and the screen reader. */
export function describeStrokes(strokes: BrushStroke[]): string[] {
  const byPaint = new Map<string, BrushStroke[]>();
  for (const s of strokes) byPaint.set(s.paint.id, [...(byPaint.get(s.paint.id) ?? []), s]);
  return [...byPaint.values()].map((list) => {
    const p = list[0].paint;
    const where = new Map<string, number>();
    list.forEach((s) => { const w = strokeWhere(s); where.set(w, (where.get(w) ?? 0) + 1); });
    const places = [...where.entries()].map(([w, n]) => `${n} near ${w}`).join(', ');
    return `${p.label} (${p.kind}, ${p.from}): ${plural(list.length, 'stroke', 'strokes')} (${places})`;
  });
}

/** A short sentence about the strokes for the live region. */
export const strokesSummary = (strokes: BrushStroke[]): string => (strokes.length ? `${plural(strokes.length, 'brush stroke', 'brush strokes')} on the map.` : 'No brush strokes on the map.');

/** Reads strokes saved with a map (or from a saved draft) and drops anything malformed, so a bad draft can never break the map. */
export function cleanStrokes(raw: unknown): BrushStroke[] {
  if (!Array.isArray(raw)) return [];
  const out: BrushStroke[] = [];
  for (const s of raw.slice(0, MAX_STROKES)) {
    const p = s?.paint;
    if (!p || typeof p.id !== 'string' || typeof p.label !== 'string' || !HEX.test(p.hex ?? '') || (p.kind !== 'color' && p.kind !== 'surface')) continue;
    if (p.kind === 'surface' && !textureById(p.surfaceId)) { /* the picture is gone: it still shows in its average color */ }
    if (!Array.isArray(s.pts) || !s.pts.length || typeof s.size !== 'number') continue;
    const pts = (s.pts as unknown[]).slice(0, MAX_POINTS).filter((q): q is [number, number] => Array.isArray(q) && Number.isFinite(q[0]) && Number.isFinite(q[1])).map(([x, y]) => [round1(clamp(x, 0, MAP_W)), round1(clamp(y, 0, MAP_H))] as [number, number]);
    if (!pts.length) continue;
    out.push({ paint: { id: p.id, kind: p.kind, label: String(p.label).slice(0, 60), hex: p.hex, surfaceId: typeof p.surfaceId === 'string' ? p.surfaceId : undefined, from: typeof p.from === 'string' ? p.from.slice(0, 60) : '' }, size: clamp(s.size, 0.5, SIZE_MAX), pts });
  }
  return out;
}
