import { useEffect, useRef, useState } from 'react';
// The bezel is a vector drawing, made in the design bench: a double hexagon (gold, and a thinner cream one just
// outside it) with a bevel. Its box is 1.12 times the stone's frame, so the outer line is not cut off.
import bezelSvg from '../../assets/logo/bezel.svg';
import { useFadeSwitch } from '../../lib/useFadeSwitch';
import { allColors, valarColors } from './ValarBreathingLogo';
import { orbColour } from '../../lib/orbColours';
import { breathFractions, breathLengthMs, gemClock, gemMultiplyColor, type BreathTiming } from '../../lib/breathClock';
import { GEM_CENTRE, GEM_ENGINE, GEM_TO_PETALS, SPRITE_CELL, frameOrigin, loadGemSprite, markGemDrawn, type GemEngine } from '../../lib/gemSprite';
import { GEM_LOOP_BREATHS } from '../../lib/breathClock';
import { deviceProfile } from '../../lib/deviceProfile';
import { HIGH_QUALITY, LOW_QUALITY, createGemRenderer, type GemLight, type GemQuality, type GemRenderer } from '../../lib/gemRenderer';
import type { GemCut } from '../../lib/gemCut';
import { kaleidoscopeCut, type KaleidoscopeLook } from '../../lib/kaleidoscope';
import { DEFAULT_INNER_ORBIT } from '../../lib/orbitLook';

/** The live gem's settings (see src/lib/gemRenderer.ts). All optional: the defaults are the tuned starting point. */
export interface LiveGemLook {
  light?: Partial<GemLight>;
  cut?: Partial<GemCut>;
  quality?: Partial<GemQuality>;
  /** Draws per second (the sparkle moves slowly, so 10 to 15 is smooth). */
  fps?: number;
  /** How far the lights turn in one sparkle loop (three breaths), in turns. With six lights, 1/6 brings the pattern round. */
  spin?: number;
  /** The inside of the stone slowly re-cuts itself (src/lib/kaleidoscope.ts). Held still with reduced motion. */
  kaleidoscope?: Partial<KaleidoscopeLook>;
}

/** What the gem reports about itself, about once a second (for the /bench page). */
export interface GemStats {
  engine: 'sprite' | 'live';
  /** Average time to draw one frame, in ms. */
  ms: number;
  /** Why the live gem fell back to the sprite, if it did. */
  fallback?: string;
}

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
  /** How the stone is shaded: contrast deepens its lines, lift brightens it, fieldAlpha is how much of the orbs' colour it takes. */
  contrast?: number;
  lift?: number;
  fieldAlpha?: number;
  /** Which gem to draw. The live one falls back to the sprite where it cannot run. */
  engine?: GemEngine;
  live?: LiveGemLook;
  /** The inner orbit's timing, so the gem's inner colour stays with the orbs when the orbit's options change. */
  orbitSeconds?: number;
  colorCycle?: number;
  onStats?: (s: GemStats) => void;
}

const BEZEL_CANVAS = 1.12; // the bezel image is this much larger than the stone's frame (the bezel.svg viewBox is the same ratio)

// The stone's own colour: the colours of the 16 inner orbs laid round it like a colour wheel that turns once every
// two minutes (as the orbit does) and changes as the orbs' colours change. It is applied with the "color" blend,
// which takes the hue from the wheel and keeps the stone's own light and dark, so the facets keep their structure.
const FIELD_ALPHA = 0.9; // 0 = no colour, 1 = full colour
// The live gem traces the orbs' colour through the stone itself, so it needs far less of the wheel than the sprite.
const LIVE_FIELD_ALPHA = 0.25;
const FIELD_TURN_S = 120;
// Structure: the stone is multiplied by itself a little, which deepens its shadows and lines without darkening its
// highlights, and the overlay layer on top is kept light.
const CONTRAST = 0.9;
// Lift: a little screen with the original, which brightens lights and mid-tones again after the contrast step.
const LIFT = 0.5;

const FRAME_INTERVAL_MS = 1000 / 30; // the sparkle moves ~1.6 frames a second; 30 draws a second is plenty smooth
const LIVE_FPS = 15;
// Without a chosen quality, the live gem starts at the device's tier (src/lib/deviceProfile.ts) and steps down to the low
// setting if its first frames take longer than this on average.
const SLOW_FRAME_MS = 8;
const TIMED_FRAMES = 12;
const LIVE_SPIN = 1 / 6;

/**
 * The gem: one pre-rendered 48-frame diamond animation, played as three breaths per loop, tinted live to
 * the current breath colour. Drawn on two canvases holding the same pixels: a body layer (partly
 * transparent so the Valar orbit shows through) and an overlay-blended layer that restores facet contrast.
 */
export default function SpectralGem({
  size,
  cycleStart,
  technique = null,
  clarity = 0.5, // half clear
  sparkle = 0.9, // the overlay layer's strength
  tint = 0.2,
  breathingEnabled = true,
  contrast = CONTRAST,
  lift = LIFT,
  fieldAlpha,
  engine = GEM_ENGINE,
  live,
  orbitSeconds = DEFAULT_INNER_ORBIT.orbitSeconds,
  colorCycle = DEFAULT_INNER_ORBIT.colorCycle,
  onStats,
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
  // The live settings are read on every frame, so changing them does not restart the loop. Only a change of quality
  // (which rebuilds the shader) does.
  const liveRef = useRef(live);
  liveRef.current = live;
  const statsRef = useRef(onStats);
  statsRef.current = onStats;
  const timingRef = useRef({ orbitSeconds, colorCycle });
  timingRef.current = { orbitSeconds, colorCycle };
  // The orbit's phase is set once, when the logo mounts (NenyaLogo does not move it later), so the gem keeps the same anchor.
  const orbitAnchor = useRef<number | null>(null);
  if (orbitAnchor.current === null) orbitAnchor.current = cycleStart ?? mountTime.current;
  const [steppedDown, setSteppedDown] = useState(false);
  const autoQuality = !live?.quality;
  const startLow = autoQuality && (steppedDown || (typeof window !== 'undefined' && deviceProfile().gem.quality === 'low'));
  const quality: GemQuality = { ...(startLow ? LOW_QUALITY : HIGH_QUALITY), ...live?.quality };
  const qualityKey = `${quality.bounces}|${quality.disperse}|${quality.supersample}`;

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
    let renderer: GemRenderer | null = null;
    let fallback: string | undefined;
    if (engine === 'live') {
      renderer = createGemRenderer(px, quality);
      if (!renderer) fallback = 'WebGL2 is not available here, or the shader did not build';
    }
    let spent = 0;
    let frames = 0;
    let reported = performance.now();
    let timed = 0;
    let timedMs = 0;
    let warm = 0; // the first two frames may include the driver finishing the shader, so they are not timed
    let raf = 0;
    let timer: ReturnType<typeof setInterval> | 0 = 0;
    let last = 0;
    let visible = true;
    let cancelled = false;

    const drawFrame = (i: number) => {
      const [sx, sy] = frameOrigin(i);
      octx.drawImage(sprite!, sx, sy, SPRITE_CELL, SPRITE_CELL, 0, 0, px, px);
    };

    const loadSprite = () => {
      loadGemSprite()
        .then((img) => {
          sprite = img;
          spriteRef.current = img;
          start();
        })
        .catch(() => {
          // No sprite, no gem: the petals and orbit still draw.
        });
    };

    const report = (t0: number) => {
      const took = performance.now() - t0;
      spent += took;
      frames++;
      // The first frames decide whether this device should use the low setting (only when no quality was chosen).
      if (renderer && autoQuality && !startLow && timed < TIMED_FRAMES && ++warm > 2) {
        timed++;
        timedMs += took;
        if (timed === TIMED_FRAMES && timedMs / TIMED_FRAMES > SLOW_FRAME_MS) setSteppedDown(true);
      }
      const now = performance.now();
      if (statsRef.current && now - reported >= 1000) {
        statsRef.current({ engine: renderer ? 'live' : 'sprite', ms: frames ? spent / frames : 0, ...(fallback ? { fallback } : {}) });
        spent = 0;
        frames = 0;
        reported = now;
      }
    };

    const draw = (reduced: boolean) => {
      if (renderer && renderer.lost()) {
        // The browser took the graphics context away: carry on with the sprite.
        renderer = null;
        fallback = 'the graphics context was lost';
        loadSprite();
      }
      if (!sprite && !renderer) return;
      const t0 = performance.now();
      const elapsed = Date.now() - (anchor ?? mountTime.current);
      const c = gemClock(elapsed, breathMs);
      octx.clearRect(0, 0, px, px);
      octx.globalAlpha = 1;
      if (renderer) {
        const L = liveRef.current;
        const { orbitSeconds: oS, colorCycle: cS } = timingRef.current;
        const tSec = reduced ? 0 : (Date.now() - mountTime.current) / 1000;
        const orbitT = (Date.now() - (orbitAnchor.current ?? mountTime.current)) / 1000;
        const loops = reduced ? 0 : elapsed / (GEM_LOOP_BREATHS * breathMs);
        renderer.render({
          turn: loops * 2 * Math.PI * (L?.spin ?? LIVE_SPIN),
          orbit: reduced ? 0 : (((orbitT / (oS > 0 ? oS : 120)) % 1) * 2 * Math.PI),
          orbs: valarColors.map((v, j) => orbColour(v.vector, j, tSec, cS)),
          light: L?.light,
          cut: !reduced && L?.kaleidoscope?.on ? kaleidoscopeCut(tSec, L?.cut, L.kaleidoscope) : L?.cut,
        });
        octx.drawImage(renderer.canvas, 0, 0, px, px);
      } else if (reduced) {
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
      bctx.globalAlpha = contrast;
      bctx.drawImage(off, 0, 0);
      bctx.globalCompositeOperation = 'screen';
      bctx.globalAlpha = lift;
      bctx.drawImage(off, 0, 0);
      // The stone's inner colour: a wheel of the orbs' current colours, applied as hue only ("color" blend), so the
      // stone keeps its own light and dark.
      if (typeof bctx.createConicGradient === 'function') {
        const tSec = reduced ? 0 : (Date.now() - mountTime.current) / 1000;
        const turnS = timingRef.current.orbitSeconds > 0 ? timingRef.current.orbitSeconds : FIELD_TURN_S;
        const wheel = bctx.createConicGradient(reduced ? 0 : ((tSec / turnS) % 1) * 2 * Math.PI, px / 2, px / 2);
        const n = valarColors.length;
        for (let i = 0; i <= n; i++) {
          const j = i % n;
          const col = orbColour(valarColors[j].vector, j, tSec, timingRef.current.colorCycle);
          wheel.addColorStop(i / n, `rgb(${Math.round(col[0])},${Math.round(col[1])},${Math.round(col[2])})`);
        }
        bctx.globalCompositeOperation = 'color';
        bctx.globalAlpha = fieldAlpha ?? (renderer ? LIVE_FIELD_ALPHA : FIELD_ALPHA);
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
      markGemDrawn();
      report(t0);
    };

    const tick = (now: number) => {
      raf = 0;
      if (cancelled || !visible || document.visibilityState === 'hidden') return;
      const interval = renderer ? 1000 / Math.max(1, liveRef.current?.fps ?? LIVE_FPS) : FRAME_INTERVAL_MS;
      if (now - last >= interval) {
        last = now;
        draw(false);
      }
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      stop();
      if ((!sprite && !renderer) || cancelled) return;
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

    if (renderer) start();
    else loadSprite();

    return () => {
      cancelled = true;
      stop();
      renderer?.dispose();
      io?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      reduceQuery.removeEventListener?.('change', start);
    };
    // The clock anchor and timing shape are read inside the loop, so they restart it when they change.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `quality` is captured through qualityKey
  }, [gemSide, anchor, breathMs, t1, t2, t3, tint, breathingEnabled, contrast, lift, fieldAlpha, engine, qualityKey]);

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
      <img src={bezelSvg} alt="" aria-hidden="true" draggable={false} style={{ ...place, width: gemSide * BEZEL_CANVAS, height: gemSide * BEZEL_CANVAS, zIndex: 29 }} />
    </>
  );
}
