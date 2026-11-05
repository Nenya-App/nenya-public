import { useEffect, useRef } from 'react';
import { useFadeSwitch } from '../../lib/useFadeSwitch';
import { allColors, valarColors } from './ValarBreathingLogo';
import { orbColour } from '../../lib/orbColours';
import { breathFractions, breathLengthMs, gemClock, gemMultiplyColor, type BreathTiming } from '../../lib/breathClock';
import { GEM_CENTRE, GEM_HEX_RADIUS, GEM_TO_PETALS, SPRITE_CELL, frameOrigin, loadGemSprite } from '../../lib/gemSprite';

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

// A double bezel around the edge of the stone, drawn behind it. It copies the petals' strokes: the same two colours
// (a gold line, and a thinner cream line just outside it), the same thickness, the same slight transparency (the
// petals are about 86% opaque, so what shows is a little darker than the plain colour) and the same soft edge.
const BEZEL_WIDTH = 0.032; // of the stone's frame (the petals' line is about 2.8% of the same span)
const BEZEL_COLOR = [252, 206, 150];
const BEZEL_OUTER_WIDTH = 0.012;
const BEZEL_OUTER_COLOR = [255, 249, 238];
const BEZEL_GAP = 0.004; // between the two lines
const BEZEL_ALPHA = 0.86;
const BEZEL_FEATHER = 0.012; // extra width of the soft edge, at a lower alpha
const BEZEL_SHIFT = 0.15; // how far (as a fraction of its width) the gold line sits outside the stone's edge
const BEZEL_CANVAS = 1.12; // the bezel canvas is this much larger than the stone's, so the outer line is not cut off

// The stone's own colour: the colours of the 16 inner orbs laid round it like a colour wheel that turns once every
// two minutes (as the orbit does) and changes as the orbs' colours change. It is applied with the "color" blend,
// which takes the hue from the wheel and keeps the stone's own light and dark, so the facets keep their structure.
const FIELD_ALPHA = 0.45; // 0 = no colour, 1 = full colour
const FIELD_TURN_S = 120;
// Structure: the stone is multiplied by itself a little, which deepens its shadows and lines without darkening its
// highlights, and the overlay layer on top is kept light.
const CONTRAST = 0.6;

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
  clarity = 0.2, // nearly opaque: the colour is made inside the stone, not seen through it
  sparkle = 0.25, // the overlay layer washes an opaque stone toward white, so it is kept light
  tint = 0.2,
  breathingEnabled = true,
}: SpectralGemProps) {
  const bodyRef = useRef<HTMLCanvasElement>(null);
  const lightRef = useRef<HTMLCanvasElement>(null);
  const bezelRef = useRef<HTMLCanvasElement>(null);
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
    // The bezel is static: drawn once per size, on a slightly larger canvas.
    const bezel = bezelRef.current;
    const pxb = Math.round(px * BEZEL_CANVAS);
    if (bezel && bezel.width !== pxb) {
      bezel.width = bezel.height = pxb;
      const z = bezel.getContext('2d');
      if (z) {
        const c = pxb / 2;
        const R = GEM_HEX_RADIUS * px + BEZEL_SHIFT * BEZEL_WIDTH * px;
        const hex = (radius: number) => {
          z.beginPath();
          for (let k = 0; k < 6; k++) {
            const a = -Math.PI / 2 + (k * Math.PI) / 3; // corners at the top and bottom
            const x = c + radius * Math.cos(a), y = c + radius * Math.sin(a);
            if (k === 0) z.moveTo(x, y); else z.lineTo(x, y);
          }
          z.closePath();
        };
        z.lineJoin = 'round';
        z.lineCap = 'round';
        const rgba = (col: number[], a: number) => `rgba(${col[0]},${col[1]},${col[2]},${a})`;
        const line = (radius: number, width: number, col: number[]) => {
          z.strokeStyle = rgba(col, BEZEL_ALPHA * 0.4);
          z.lineWidth = Math.max(1.5, (width + BEZEL_FEATHER) * px);
          hex(radius);
          z.stroke();
          z.strokeStyle = rgba(col, BEZEL_ALPHA);
          z.lineWidth = Math.max(1, width * px);
          hex(radius);
          z.stroke();
        };
        line(R, BEZEL_WIDTH, BEZEL_COLOR);
        line(R + (BEZEL_WIDTH / 2 + BEZEL_GAP + BEZEL_OUTER_WIDTH / 2) * px, BEZEL_OUTER_WIDTH, BEZEL_OUTER_COLOR);
      }
    }
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
      bctx.globalAlpha = 1;
      bctx.clearRect(0, 0, px, px);
      bctx.drawImage(off, 0, 0);
      // Structure: multiply the stone by itself a little. Shadows and lines deepen, highlights stay.
      bctx.globalCompositeOperation = 'multiply';
      bctx.globalAlpha = CONTRAST;
      bctx.drawImage(off, 0, 0);
      // The stone's inner colour: a wheel of the orbs' current colours, applied as hue only ("color" blend), so the
      // stone keeps its own light and dark.
      if (typeof bctx.createConicGradient === 'function') {
        const tSec = reduced ? 0 : (Date.now() - mountTime.current) / 1000;
        const wheel = bctx.createConicGradient(reduced ? 0 : ((tSec / FIELD_TURN_S) % 1) * 2 * Math.PI, px / 2, px / 2);
        const n = valarColors.length;
        for (let i = 0; i <= n; i++) {
          const j = i % n;
          const col = orbColour(valarColors[j].vector, j, tSec);
          wheel.addColorStop(i / n, `rgb(${Math.round(col[0])},${Math.round(col[1])},${Math.round(col[2])})`);
        }
        bctx.globalCompositeOperation = 'color';
        bctx.globalAlpha = FIELD_ALPHA;
        bctx.fillStyle = wheel;
        bctx.fillRect(0, 0, px, px);
      }
      // The breathing tint on top, as before.
      bctx.globalCompositeOperation = 'multiply';
      bctx.globalAlpha = 1;
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
      <canvas ref={bezelRef} aria-hidden="true" style={{ ...place, width: gemSide * BEZEL_CANVAS, height: gemSide * BEZEL_CANVAS, zIndex: 29 }} />
    </>
  );
}
