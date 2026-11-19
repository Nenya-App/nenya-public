// The glow around a Sight color card (owner's comment sheet, 2026-11-18: "Intensity slider should increase or decrease the brightness of the glow"). Intensity is 0 (faint) to 100 (strong), or null when the
// slider was not touched (a middle glow, as before). A stronger intensity makes the glow brighter and wider; a fainter one dims it. Pure, so the mapping is tested.
const clamp = (n: number, a: number, b: number): number => Math.max(a, Math.min(b, n));
export interface Glow { alpha: number; blurPx: number; boxShadow: string; borderAlpha: number }
export function glowFor(hex: string, intensity: number | null): Glow {
  const i = intensity === null || !Number.isFinite(intensity) ? 50 : clamp(intensity, 0, 100);
  const alpha = Number((0.08 + (i / 100) * 0.8).toFixed(2)), blurPx = Math.round(10 + (i / 100) * 38);
  const a2 = (n: number) => Math.round(clamp(n, 0, 1) * 255).toString(16).padStart(2, '0');
  const c = /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#888888';
  return { alpha, blurPx, boxShadow: `0 0 ${blurPx}px ${c}${a2(alpha)}, 0 0 ${blurPx * 2}px ${c}${a2(alpha / 2)}`, borderAlpha: Number((0.25 + (i / 100) * 0.5).toFixed(2)) };
}
