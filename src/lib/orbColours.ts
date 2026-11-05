// The colour of one of the inner orbit's orbs at a given moment, reproduced from how the orbs animate in NenyaLogo:
// each orb eases through its six colours over 30 seconds, one every 5 seconds, and starts 2 seconds after the one
// before it. The gem uses these to colour its own light, so its shimmer comes from inside the stone.
import { hexToRgb } from './breathClock.ts';

export const COLOR_CYCLE_S = 30;
export const ORB_DELAY_S = 2;

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export function orbColour(vector: string[], index: number, tSec: number): [number, number, number] {
  const n = vector.length;
  const seg = COLOR_CYCLE_S / n;
  const t = (((tSec - index * ORB_DELAY_S) % COLOR_CYCLE_S) + COLOR_CYCLE_S) % COLOR_CYCLE_S;
  const k = Math.floor(t / seg) % n;
  const f = easeInOut((t - k * seg) / seg);
  const a = hexToRgb(vector[k]);
  const b = hexToRgb(vector[(k + 1) % n]);
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}
