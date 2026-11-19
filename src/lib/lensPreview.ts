// The live previews on the Movement and Pattern slider cards (docs/wireframes/lens/wire.js, the "prev" boxes): a shape that moves as Speed and Energy say, and layers that sharpen and deepen as Clarity and Depth say,
// each with the same thing in words. Pure, so the mapping is tested; src/app/components/LensPreview.tsx shows it. Slider values are 0 to 100 or null (not set: neutral).
const lv = (v: number | null): number => (v === null || !Number.isFinite(v) ? 2 : Math.max(0, Math.min(4, Math.round(v / 25))));

export const SPEED_WORDS = ['glacial', 'slow', 'steady', 'fast', 'frenetic'] as const;
export const ENERGY_WORDS = ['depleted', 'low', 'moderate', 'strong', 'surging'] as const;
export const CLARITY_WORDS = ['foggy', 'hazy', 'fairly clear', 'sharp', 'crystal clear'] as const;
export const DEPTH_WORDS = ['surface', 'shallow', 'middling', 'deep', 'profound'] as const;
const DIR: Record<string, [number, number]> = { upward: [0, -1], downward: [0, 1], inward: [0, 0], outward: [0, 0], spiraling: [1, -1], oscillating: [1, 0], flowing: [1, 0], stuck: [0, 0], still: [0, 0] };

export interface MovePreview { durationS: number; amplitudePx: number; dx: number; dy: number; opacity: number; still: boolean; words: string }
/** How the shape drifts: Speed sets how long a drift takes, Energy how far and how strong it shows, the first direction word which way. */
export function movePreview(speed: number | null, energy: number | null, direction: string | null): MovePreview {
  const a = lv(speed), b = lv(energy), d = (direction && DIR[direction.toLowerCase()]) || [0, 0];
  const still = !!direction && ['still', 'stuck'].includes(direction.toLowerCase());
  return { durationS: [9, 5, 2.5, 1.2, 0.5][a], amplitudePx: 8 + b * 10, dx: d[0], dy: d[1], opacity: Number((0.45 + b * 0.14).toFixed(2)), still, words: [direction ? direction.toLowerCase() : null, SPEED_WORDS[a], ENERGY_WORDS[b]].filter(Boolean).join(', ') };
}
export interface PatternPreview { blurPx: number; layers: number; words: string }
/** How the layers look: Clarity sets the blur (foggy is blurred), Depth how many layers show. */
export function patternPreview(clarity: number | null, depth: number | null, word: string | null): PatternPreview {
  const a = lv(clarity), b = lv(depth);
  return { blurPx: (4 - a) * 1.5, layers: 1 + Math.floor(b / 2), words: [word ? word.toLowerCase() : null, CLARITY_WORDS[a], DEPTH_WORDS[b]].filter(Boolean).join(', ') };
}
