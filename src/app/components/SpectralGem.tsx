import { useEffect, useRef } from 'react';
import { useFadeSwitch } from '../../lib/useFadeSwitch';
import { allColors } from './ValarBreathingLogo';
import { breathFractions, breathLengthMs, gemClock, gemMultiplyColor, type BreathTiming } from '../../lib/breathClock';
import { GEM_CENTRE, GEM_TO_PETALS, SPRITE_CELL, frameOrigin, loadGemSprite } from '../../lib/gemSprite';

interface SpectralGemProps {
  /** The logo's size (the same `size` NenyaLogo takes). */
  size: number;
  /** Shared clock anchor (ms epoch) so the gem stays in phase with the ring and the counter. */
  cycleStart?: number;
  technique?: BreathTiming | null;
  /** 0 = frosted, 1 = fully clear. The stone's body is drawn at opacity 1 - clarity so the orbit shows through. */
  clarity?: number;
  /** Strength of the overlay layer that restores facet contrast and sparkle. Lower lets more of the orbit's colour through. */
  sparkle?: number;
  /** Maximum mix toward the breath colour (at peak inhale). */
  tint?: number;
  /** When the breathing animation is off the stone is not tinted. */
  breathingEnabled?: boolean;
}

const FRAME_INTERVAL_MS = 1000 / 30; // the sparkle moves ~1.6 frames a second; 30 draws a second is plenty smooth

/**
 * The gem: one pre-rendered 48-frame diamond animation, played as three breaths per loop, tinted live to
 * the current breath colour. Drawn on two canvases holding the same pixels: a body layer (partly
 * transparent so the Valar orbit shows through) and an overlay-blended layer that restores facet contrast.
 */
export default function SpectralGem({
  size,
  cycleStart,
  technique = null,
  clarity = 0.72, // was 0.65: a little clearer, so more of the orbit's colour shows through the back
  sparkle = 0.8, // was 1
  tint = 0.2,
  breathingEnabled = true,
}: SpectralGemProps) {
  const bodyRef = useRef<HTMLCanvasElement>(null);
  const lightRef = useRef<HTMLCanvasElement>(null);
  const mountTime = useRef(Date.now());

  const petalsSide = size * 0.765;
  const gemSide = petalsSide * GEM_TO_PETALS;

  // A change of breathing pace fades the gem out, restarts its clock on the new timing, and fades it back in,
  // instead of snapping to the new tint and sparkle position in front of the person.
  const shape = technique ? `${technique.ih}_${technique.hi || 0}_${technique.ex}_${technique.ho || 0}` : 'default';
  const { applied, style: fadeStyle } = useFadeSwitch({ technique, cycleStart }, shape);
  const breathMs = breathLengthMs(applied.technique);
  const { t1, t2, t3 } = breathFractions(applied.technique);
  const anchor = applied.cycleStart;
  const spriteRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const body = bodyRef.current;
    const light = lightRef.current;
    if (!body || !light) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const px = Math.max(8, Math.round(gemSide * dpr));
    // Only resize when the size really changed: resizing clears a canvas, which shows as a flash.
    if (body.width !== px) body.width = body.height = light.width = light.height = px;
    const bctx = body.getContext('2d');
    const lctx = light.getContext('2d');
    const off = document.createElement('canvas');
    off.width = off.height = px;
    const octx = off.getContext('2d');
    if (!bctx || !lctx || !octx) return;

    const f = { t1, t2, t3 };
    const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let sprite: HTMLImageElement | null = spriteRef.current;
    let raf = 0;
    let timer: ReturnType<typeof setInterval> | 0 = 0;
    let last = 0;
    let visible = true;
    let cancelled = false;

    const drawFrame = (i: number) => {
      const [sx, sy] = frameOrigin(i);
      octx.drawImage(sprite!, sx, sy, SPRITE_CELL, SPRITE_CELL, 0, 0, px, px);
    };

    const draw = (reduced: boolean) => {
      if (!sprite) return;
      const elapsed = Date.now() - (anchor ?? mountTime.current);
      const c = gemClock(elapsed, breathMs);
      octx.clearRect(0, 0, px, px);
      octx.globalAlpha = 1;
      if (reduced) {
        drawFrame(0); // hold the first frame, no crossfade
      } else {
        drawFrame(c.f0);
        if (c.a > 0.001) {
          octx.globalAlpha = c.a;
          drawFrame(c.f1);
          octx.globalAlpha = 1;
        }
      }
      const [r, g, b] = gemMultiplyColor(allColors, c.idx, c.p, f, breathingEnabled ? tint : 0, !reduced);
      bctx.globalCompositeOperation = 'source-over';
      bctx.clearRect(0, 0, px, px);
      bctx.drawImage(off, 0, 0);
      bctx.globalCompositeOperation = 'multiply';
      bctx.fillStyle = `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
      bctx.fillRect(0, 0, px, px);
      bctx.globalCompositeOperation = 'destination-in'; // restore the stone's transparent outline
      bctx.drawImage(off, 0, 0);
      bctx.globalCompositeOperation = 'source-over';
      lctx.clearRect(0, 0, px, px);
      lctx.drawImage(body, 0, 0);
    };

    const tick = (now: number) => {
      raf = 0;
      if (cancelled || !visible || document.visibilityState === 'hidden') return;
      if (now - last >= FRAME_INTERVAL_MS) {
        last = now;
        draw(false);
      }
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      stop();
      if (!sprite || cancelled) return;
      if (reduceQuery.matches) {
        draw(true);
        timer = setInterval(() => draw(true), 1000); // only the colour changes, once per breath
      } else if (visible && document.visibilityState !== 'hidden') {
        draw(false); // draw at once, so a restart never leaves a blank frame
        raf = requestAnimationFrame(tick);
      }
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      if (timer) clearInterval(timer);
      timer = 0;
    };

    const onVisibility = () => start();
    document.addEventListener('visibilitychange', onVisibility);
    reduceQuery.addEventListener?.('change', start);
    const io =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver((entries) => {
            visible = entries[entries.length - 1]?.isIntersecting ?? true;
            start();
          })
        : null;
    io?.observe(body);

    loadGemSprite()
      .then((img) => {
        sprite = img;
        spriteRef.current = img;
        start();
      })
      .catch(() => {
        // No sprite, no gem: the petals and orbit still draw.
      });

    return () => {
      cancelled = true;
      stop();
      io?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      reduceQuery.removeEventListener?.('change', start);
    };
    // The clock anchor and timing shape are read inside the loop, so they restart it when they change.
  }, [gemSide, anchor, breathMs, t1, t2, t3, tint, breathingEnabled]);

  const place: React.CSSProperties = {
    position: 'absolute',
    left: `calc(50% + ${(GEM_CENTRE.x - 0.5) * petalsSide}px)`,
    top: `calc(50% + ${(GEM_CENTRE.y - 0.5) * petalsSide}px)`,
    width: gemSide,
    height: gemSide,
    transform: 'translate(-50%,-50%)',
    pointerEvents: 'none',
    userSelect: 'none',
  };

  return (
    <>
      <canvas ref={bodyRef} aria-hidden="true" style={{ ...place, zIndex: 30, opacity: (1 - clarity) * (fadeStyle.opacity as number), transition: fadeStyle.transition }} />
      <canvas ref={lightRef} aria-hidden="true" style={{ ...place, zIndex: 31, mixBlendMode: 'overlay', opacity: sparkle * (fadeStyle.opacity as number), transition: fadeStyle.transition }} />
    </>
  );
}
