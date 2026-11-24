import { useEffect, useRef, type RefObject } from 'react';
import { continuityOffset, ringAngleDeg, wrapDeg, type RingMotion } from '../../lib/outerRing';

/**
 * Turns the outer ring of orbs (src/lib/outerRing.ts has the maths). One requestAnimationFrame loop writes one transform on one element, only while the ring is allowed to move; nothing is
 * drawn or measured otherwise. The angle comes from the shared breathing clock (`cycleStart`), so two logos on a page agree and a breath-paced ring follows the breath. When a setting changes
 * (pace, direction, mode, breathing pace) the ring carries on from where it was drawn, so it never jumps; when it is held still it is drawn at rest (no transform), as it always was.
 * Not run on the server: the first draw is in an effect.
 */
export function useOuterRingTurn(ref: RefObject<HTMLElement | null>, moving: boolean, motion: RingMotion, cycleStart: number | undefined): void {
  const lastDeg = useRef<number | null>(null);
  const { direction, seconds, breathPaced, breathTurn, technique } = motion;
  const ih = technique?.ih, hi = technique?.hi, ex = technique?.ex, ho = technique?.ho;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!moving) {
      el.style.transform = '';
      lastDeg.current = 0;
      return;
    }
    const anchor = cycleStart ?? Date.now();
    const m: RingMotion = { direction, seconds, breathPaced, breathTurn, technique: ih === undefined ? null : { ih, hi, ex: ex as number, ho } };
    const raw = () => ringAngleDeg(m, Date.now() - anchor);
    // The first time, follow the shared clock as it is; after that, carry on from the last angle drawn.
    const offset = lastDeg.current === null ? 0 : continuityOffset(lastDeg.current, raw());
    let frame = 0;
    const draw = () => {
      const deg = raw() + offset;
      lastDeg.current = deg;
      el.style.transform = `rotate(${wrapDeg(deg).toFixed(3)}deg)`;
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [ref, moving, direction, seconds, breathPaced, breathTurn, ih, hi, ex, ho, cycleStart]);
}
