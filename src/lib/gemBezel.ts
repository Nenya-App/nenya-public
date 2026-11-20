// The bezel round the stone follows the stone's side count. The artwork is src/assets/logo/bezel.svg (a double hexagon with its
// metal gradients and lighting); for any other side count the two outlines are redrawn as regular polygons and everything else in
// the file is kept. Pure (it works on the file's text), so it is tested. Units are the file's: the viewBox is about 268 wide.

const HEX_GOLD = 111.39; // vertex radius of the gold outline for six sides
const HEX_GAP = 119.05 * Math.cos(Math.PI / 6) - HEX_GOLD * Math.cos(Math.PI / 6); // how far the cream outline stands off the gold, measured across a side
const f = (v: number): string => (Math.abs(v) < 0.005 ? 0 : v).toFixed(2);

/** The path of a regular polygon with `n` sides and vertex radius `r`, a corner at the top, going clockwise (the file's own order). */
export function polygonPath(n: number, r: number): string {
  const pts = Array.from({ length: n }, (_, k) => {
    const a = -Math.PI / 2 + (k * 2 * Math.PI) / n;
    return `${f(Math.cos(a) * r)} ${f(Math.sin(a) * r)}`;
  });
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p}`).join('') + 'Z';
}

/**
 * The two outlines' vertex radii for `n` sides. `scale` is stoneRadius(n) / stoneRadius(6): the gold outline sits on the stone's
 * girdle, and the cream one stands off it by the same distance across a side as the hexagon's does.
 */
export function bezelRadii(n: number, scale: number): { gold: number; cream: number } {
  const gold = HEX_GOLD * scale;
  const cream = (gold * Math.cos(Math.PI / n) + HEX_GAP) / Math.cos(Math.PI / n);
  return { gold, cream };
}

/** The distinct outline paths in the file (the gold one, then the cream one), found by size. */
export function bezelOutlines(svgText: string): string[] {
  const ds = [...new Set([...svgText.matchAll(/\bd="(M[^"]*Z)"/g)].map((m) => m[1]))];
  const radius = (d: string): number => Math.max(...(d.match(/-?\d+\.?\d*/g) ?? ['0']).map((v) => Math.abs(Number(v))));
  return ds.sort((a, b) => radius(a) - radius(b));
}

/** `svgText` (bezel.svg) redrawn for `n` sides. Six sides return it unchanged. */
export function bezelFor(svgText: string, n: number, scale: number): string {
  if (n === 6) return svgText;
  const [gold, cream] = bezelOutlines(svgText);
  if (!gold || !cream) return svgText;
  const now = bezelRadii(n, scale);
  return svgText.split(gold).join(polygonPath(n, now.gold)).split(cream).join(polygonPath(n, now.cream));
}

/** The same, as an image address. */
export const bezelDataUri = (svgText: string): string => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;
