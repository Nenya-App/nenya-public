import * as m from 'motion/react-m';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
// The flat logo (petals, bezel and gem, no orbs) is a 768 px WebP rendered from the vector drawings, and most call
// sites use this component as a small persistent header mark (28-40px), where that is over 25 times more image
// data than the display can show. A pre-resized 128 px WebP is swapped in below for those small sizes instead.
import nenyaLogo from '../../assets/nenya-logo.webp';
import nenyaLogoSmall from '../../assets/nenya-logo-small.webp';
// The orbit view's petals are eight woven, outlined mallorn-style leaves (MallornLeaves) in a 765-unit box, the logo's
// size * 0.765, with the outer ring's diameter as 1000 units. The glow is cast from a still silhouette of the same outlines
// (built only when a glow is asked for).
const leafMaskUris = new Map<number, string>();
const leafMask = (count: number) => {
  let uri = leafMaskUris.get(count);
  if (!uri) leafMaskUris.set(count, (uri = `data:image/svg+xml;utf8,${encodeURIComponent(weaveSilhouetteSvg(count))}`));
  return uri;
};
import MallornLeaves from './MallornLeaves';
import { weaveSilhouetteSvg } from '../../lib/leafWeave';
import { useOrbVectors, valarColors, type BreathingTechnique } from './ValarBreathingLogo';
import SpectralGem, { type GemStats, type LiveGemLook } from './SpectralGem';
import LogoGlow from './LogoGlow';
import { DEFAULT_INNER_ORBIT, DEFAULT_OUTER_ORBIT, type InnerOrbitLook, type OuterOrbitLook } from '../../lib/orbitLook';
import { GEM_ENGINE, type GemEngine } from '../../lib/gemSprite';
import { liveGemSupported } from '../../lib/gemRenderer';
import { deviceProfile } from '../../lib/deviceProfile';
import { useGemKaleidoscope, useGemKaleidoscopeBreath, useGemKaleidoscopeLook, useGemSidesChoice, useInnerOrbMode, useLeafSway, useLogoLeaves, useOrbHaloSeed, useOrbHaloStyle, useOrbHaloWidth } from '../../lib/deviceMemory';
import { effectiveGemSides, innerOrbsDrawn, innerOrbsMove, randomHaloColors } from '../../lib/logoLook';
import { useZoomedIn } from '../../lib/zoomLite';
import { DEFAULT_KALEIDOSCOPE, KALEIDOSCOPE_PRESETS } from '../../lib/kaleidoscope';
import { lightBreathCss, lightBreathKey, lightMotionFor } from '../../lib/lightMotion';
import { breathLengthMs } from '../../lib/breathClock';

// Above this size, the full-resolution source is used instead -- 128px
// covers up to ~40px CSS at 3x device pixel ratio (the largest "small"
// usage in the app today) with headroom to spare.
const SMALL_LOGO_MAX_SIZE = 48;

// The orbs are glass spheres: a colour that changes over time (animated below) with four fixed layers over it,
// all taken from the design bench. Sizes are fractions of the logo's size; opacities are the animation's
// low and high (the orbs pulse between them).
// The defaults live in src/lib/orbitLook.ts (inner: 6.9% of the logo, opacity 66-80%; outer: opacity 64-87%), so the
// /bench page can tune them. The glass layers: form is the shading toward the lower right edge, shine the highlight at the
// upper left, rim light a bright rim on the upper left edge, rim dark a faint darkening of the whole edge.
type OrbGlass = Pick<InnerOrbitLook, 'form' | 'shine' | 'rimLight' | 'rimDark'>;

const orbGradient = (c: string): string => `radial-gradient(circle at 30% 30%, ${c}ff, ${c}ee 50%, ${c}99 80%, ${c}44)`;
/** A light: a bright core fading smoothly to nothing, with no edge and no highlight. */
const lightGradient = (c: string): string => `radial-gradient(circle closest-side, ${c}ff 0%, ${c}cc 28%, ${c}55 62%, ${c}00 100%)`;
/** An outer orb's own halo: a gradient (never a blur) in its current colour, fading to nothing; in 'palette' mode the rim fades through another colour from its palette. Cheap to draw and it does not grow with zoom the way a large shadow does. The colours are set by CSS (see .nenya-orb-halo), not by script. */
const haloGradient = (palette: boolean): string => `radial-gradient(circle closest-side, color-mix(in srgb, var(--hc) 67%, transparent) 0%, color-mix(in srgb, var(--hc) 40%, transparent) 34%, color-mix(in srgb, var(${palette ? '--hc2' : '--hc'}) 14%, transparent) 66%, transparent 100%)`;
/** An outer orb's sphere, coloured by the fading --hc (the same look as before: bright to a soft rim). */
const ORB_FADE_GRADIENT = 'radial-gradient(circle at 30% 30%, var(--hc), color-mix(in srgb, var(--hc) 93%, transparent) 50%, color-mix(in srgb, var(--hc) 60%, transparent) 80%, color-mix(in srgb, var(--hc) 27%, transparent))';
/** Keyframes for one orb: its colours in order and back to the first, with literal colours so every browser fades between them. */
const hueKeyframes = (name: string, prop: string, cols: readonly string[], shift = 0): string =>
  `@keyframes ${name}{${Array.from({ length: 7 }, (_, k) => `${((k * 100) / 6).toFixed(3)}%{${prop}:${cols[(k + shift) % 6]}}`).join('')}}`;
/** The gem's own easing for a wave (a sine), as a cubic bezier. */
const SINE: [number, number, number, number] = [0.37, 0, 0.63, 1];
const LIGHT_SIZE = 1.6; // a light's diameter as a multiple of an orb's

/** The fixed layers over an orb's changing colour. `d` is the orb's diameter in px. */
function OrbSurface({ d, glass = DEFAULT_INNER_ORBIT }: { d: number; glass?: OrbGlass }) {
  const { form: ORB_FORM, shine: ORB_SHINE, rimLight: ORB_RIM_LIGHT, rimDark: ORB_RIM_DARK } = glass;
  const R = d / 2;
  const fill: React.CSSProperties = { position: 'absolute', inset: 0, borderRadius: '50%', pointerEvents: 'none' };
  const ring = 'radial-gradient(circle closest-side, transparent 86.5%, #000 87%, #000 99%, transparent 99.5%)';
  return (
    <>
      <span aria-hidden="true" style={{ ...fill, background: `radial-gradient(circle ${0.85 * d}px at 30% 30%, rgba(26,15,8,0) ${0.35 * 0.85 * d}px, rgba(26,15,8,${ORB_FORM}) ${0.85 * d}px)` }} />
      <span aria-hidden="true" style={{ ...fill, background: `radial-gradient(circle closest-side, rgba(0,0,0,0) 60%, rgba(0,0,0,${ORB_RIM_DARK}) 100%)` }} />
      <span
        aria-hidden="true"
        style={
          {
            ...fill,
            background: `linear-gradient(135deg, rgba(255,255,255,${ORB_RIM_LIGHT}) 0%, rgba(255,255,255,0) 45%)`,
            maskImage: ring,
            WebkitMaskImage: ring,
          } as React.CSSProperties
        }
      />
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: R - 0.3 * R - 0.42 * R,
          top: R - 0.34 * R - 0.26 * R,
          width: 0.84 * R,
          height: 0.52 * R,
          transform: 'rotate(-38deg)',
          pointerEvents: 'none',
          background: `radial-gradient(ellipse closest-side, rgba(255,255,255,${ORB_SHINE}), rgba(255,255,255,0))`,
        }}
      />
    </>
  );
}

interface NenyaLogoProps {
  size?: number;
  className?: string;
  showValarOrbit?: boolean;
  showLogo?: boolean;
  /** Shared clock anchor (ms epoch) used to phase-align the orbit's
   *  rotation on mount/resume, the same anchor the breathing pulse uses. */
  cycleStart?: number;
  /** The breathing technique in use. The gem's sparkle loop lasts three of its breaths. */
  technique?: BreathingTechnique | null;
  /** When false (breathing animation off) the gem is not tinted. */
  breathingEnabled?: boolean;
  /** Draw the gold glow around the logo. Only the large welcome and popout logos use it. */
  glow?: boolean;
  /**
   * What a screen reader says about the logo. Empty (the default) means decorative: the logo sits beside the word
   * "Nenya" or inside a control that already has a name, so reading it again would be noise. The large logo on the
   * welcome page and the page that explains the name pass a description (see src/lib/altText.ts).
   */
  alt?: string;
  /** Overrides for the gem's shading. Used by the design preview only. */
  gemLook?: { clarity?: number; sparkle?: number; tint?: number; contrast?: number; lift?: number; fieldAlpha?: number };
  /** Which gem to draw (the sprite, or the live ray-traced one). Defaults to the site-wide choice in gemSprite.ts. */
  gemEngine?: GemEngine;
  /** The gem's number of sides (6 to 12). Defaults to the site's own. */
  gemSides?: number;
  /** The live gem's settings. Used by the /bench page. */
  liveGem?: LiveGemLook;
  /** Options for the inner and outer orbits (src/lib/orbitLook.ts). Used by the /bench page. */
  innerOrbit?: Partial<InnerOrbitLook>;
  outerOrbit?: Partial<OuterOrbitLook>;
  onGemStats?: (s: GemStats) => void;
}

export default function NenyaLogo({
  size = 80,
  className = '',
  showValarOrbit = false,
  showLogo = true,
  cycleStart,
  technique = null,
  breathingEnabled = true,
  glow = false,
  alt = '',
  gemLook,
  gemEngine = GEM_ENGINE,
  gemSides: gemSidesProp,
  liveGem,
  innerOrbit,
  outerOrbit,
  onGemStats,
}: NenyaLogoProps) {
  const flatLogoSrc = size <= SMALL_LOGO_MAX_SIZE ? nenyaLogoSmall : nenyaLogo;
  const inner = { ...DEFAULT_INNER_ORBIT, ...innerOrbit };
  // The outer glow's style, width and random seed come from the visitor's settings unless a prop (the bench) sets them.
  const haloStyleChoice = useOrbHaloStyle();
  const haloWidthChoice = useOrbHaloWidth();
  const haloSeedChoice = useOrbHaloSeed();
  const outer = { ...DEFAULT_OUTER_ORBIT, halo: haloStyleChoice, haloWidth: haloWidthChoice, haloSeed: haloSeedChoice, ...outerOrbit };
  // The visitor's look (accessibility panel): the gem follows the leaves unless they chose a number; a prop (the bench) overrides it.
  const sideChoice = useGemSidesChoice();
  const leafChoice = useLogoLeaves();
  // The leaves' gentle sway (Settings, Logo look): the visitor's wish, off by default. MallornLeaves decides whether motion is allowed here.
  const swayWish = useLeafSway();
  // The inner lights behind the gem: moving (they follow the gem's own motion settings), still, or hidden (Settings, Logo look, Inner lights). The shaded
  // orbs (the bench's 'orb' style) keep their old pulse.
  const innerMode = useInnerOrbMode();
  const innerMoves = innerOrbsMove(innerMode);
  const kalVisitor = useGemKaleidoscope();
  const kalLookId = useGemKaleidoscopeLook();
  const kalBreath = useGemKaleidoscopeBreath();
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const q = typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    if (!q) return;
    const update = () => setReducedMotion(q.matches);
    update();
    q.addEventListener?.('change', update);
    return () => q.removeEventListener?.('change', update);
  }, []);
  // The orbs' colours: each palette's own unless the visitor chose another set (Settings, Logo look, Orb colours).
  const orbVecs = useOrbVectors();
  const allOrbColours = useMemo(() => orbVecs.flat(), [orbVecs]);
  const gemSides = gemSidesProp ?? effectiveGemSides(sideChoice, leafChoice, { live: gemEngine === 'live' && liveGemSupported(), low: typeof window !== 'undefined' && deviceProfile().gem.quality === 'low' });
  // While the page is pinch-zoomed the logo is drawn lighter (no glows, halos or blends; the gem holds its last frame): see src/lib/zoomLite.ts.
  const zoomed = useZoomedIn();
  const isLight = inner.style === 'light';
  // The same motion settings the gem reads (its kaleidoscope switch, look and "move with my breathing"), turned into the lights' motion (src/lib/lightMotion.ts).
  const kalLook = { ...DEFAULT_KALEIDOSCOPE, ...liveGem?.kaleidoscope, ...(kalVisitor ? KALEIDOSCOPE_PRESETS[kalLookId] : {}) };
  const lights = lightMotionFor({
    mode: innerMode,
    kaleidoscope: { on: kalVisitor || !!liveGem?.kaleidoscope?.on, periodS: kalLook.periodS, depth: kalLook.depth, pattern: kalLook.pattern, sway: kalLook.sway, turn: kalLook.turn },
    breathSync: kalVisitor && kalBreath,
    sides: gemSides,
    reducedMotion,
  });
  const breathMs = breathLengthMs(technique);
  const ownHalo = glow && !zoomed && outer.halo !== 'shared';
  const ORBIT_DURATION = inner.orbitSeconds > 0 ? inner.orbitSeconds : DEFAULT_INNER_ORBIT.orbitSeconds; // seconds for one complete orbit
  const INNER_ORB_OPACITY = [inner.opacityLow, inner.opacityHigh, inner.opacityLow];
  const OUTER_ORB_OPACITY = [outer.opacityLow, outer.opacityHigh, outer.opacityLow];
  const PULSE = [1 - inner.pulse, 1 + inner.pulse, 1 - inner.pulse];

  // Inner orbit - tight orbit creates dense overlapping effect
  const orbitRadius = size * inner.radius; // 37.5px for 600px logo, 12.5px for 200px logo
  // The inner orbs sit inside the gem, so they are smaller than the outer ones.
  const orbSize = Math.max(8.5, size * inner.orbSize);

  // Outer orbit - at the edge of the breathing animation (logoSize / 2)
  // Breathing animation expands to 1.4x its base size (logoSize / 1.4), so at peak it reaches logoSize diameter
  const outerOrbitRadius = size * outer.radius; // Half the logo size = outer edge of breathing animation
  const outerOrbSize = Math.max(8.5, size * outer.orbSize * 2) * 0.5;
  const haloSize = outerOrbSize * outer.haloWidth;
  // Keyframes for every outer orb's colours (and its halo's): rebuilt only when the glow style or the random seed changes.
  const orbHueCss = useMemo(
    () =>
      orbVecs
        .map((vec, i) => {
          const hc = outer.halo === 'random' ? randomHaloColors(outer.haloSeed, i, allOrbColours) : vec;
          return hueKeyframes(`nho-c-${i}`, '--hc', vec) + hueKeyframes(`nho-h-${i}`, '--hc', hc) + hueKeyframes(`nho-h2-${i}`, '--hc2', hc, 2);
        })
        .join(''),
    [outer.halo, outer.haloSeed, orbVecs, allOrbColours],
  );

  // Set once, when the logo first mounts with a clock anchor, so a fresh mount starts the rotation at the
  // correct phase. Deliberately NOT recomputed when the anchor changes later: that happens when the breathing
  // pace changes, and recomputing would snap the orbits back to angle 0 in front of the person.
  const [orbitDelay, setOrbitDelay] = useState(0);
  const orbitSet = useRef(false);
  // Seconds since the shared clock started, read when the logo mounts (and again when the breathing pace changes, for the lights that follow the breath), so the lights' phase matches the gem's.
  const [clockS, setClockS] = useState(0);
  useEffect(() => {
    setClockS(cycleStart == null ? 0 : (Date.now() - cycleStart) / 1000);
  }, [cycleStart, breathMs]);
  useEffect(() => {
    if (cycleStart == null || orbitSet.current) return;
    orbitSet.current = true;
    const elapsed = (Date.now() - cycleStart) / 1000;
    const phase = ((elapsed % ORBIT_DURATION) + ORBIT_DURATION) % ORBIT_DURATION;
    setOrbitDelay(-phase);
  }, [cycleStart]);
  
  return (
    <div 
      className={`relative ${className}`}
      style={{ 
        width: size, 
        height: size,
        // The gem's overlay layer blends with what is under it; keep that inside the logo.
        isolation: 'isolate',
      }}
    >
      {/* The glow, computed once as an image (see LogoGlow). */}
      {glow && showLogo && (
        <LogoGlow size={size} orbit={showValarOrbit} maskSrc={showValarOrbit ? leafMask(leafChoice) : flatLogoSrc} gemEngine={gemEngine} gemSides={gemSides} />
      )}

      {/* Logo image - base layer. When the Valar orbit is enabled the flat logo is
          swapped for the vector petals under the gem overlay below. */}
      {showLogo && showValarOrbit && (
        <div
          role={alt ? 'img' : undefined}
          aria-label={alt || undefined}
          aria-hidden={alt ? undefined : true}
          className="absolute"
          style={{ width: size * 0.765, height: size * 0.765, zIndex: 10, left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}
        >
          <MallornLeaves size={size * 0.765} count={leafChoice} cycleStart={cycleStart} technique={technique} breathingEnabled={breathingEnabled} sway={swayWish && !zoomed} />
        </div>
      )}
      {showLogo && !showValarOrbit && (
        <img
          src={flatLogoSrc}
          alt={alt}
          width={size * 0.85}
          height={size * 0.85}
          className="absolute"
          style={{
            width: size * 0.85,
            height: size * 0.85,
            zIndex: 10,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%,-50%)',
          }}
        />
      )}
      
      {/* Orbiting Valar - only show if enabled */}
      {showValarOrbit && inner.show && innerOrbsDrawn(innerMode) && (
        <div
          className="absolute pointer-events-none"
          style={{
            width: orbitRadius * 2,
            height: orbitRadius * 2,
            left: '50%',
            top: '50%',
            marginLeft: -orbitRadius,
            marginTop: -orbitRadius,
            zIndex: inner.layer === 'over' ? 32 : 20,
            mixBlendMode: zoomed ? undefined : inner.blend === 'normal' ? (isLight ? 'screen' : undefined) : inner.blend,
            willChange: (isLight ? lights.turn !== 'none' : innerMoves) ? 'transform' : undefined,
            // Plain CSS animation rather than Motion's JS-driven `animate` --
            // animation-play-state genuinely freezes this on pause, where
            // Motion's `animate={false}` does not reliably cancel an
            // already-running infinite WAAPI loop. Still: no turning at all.
            // Lights: the ring turns as the gem's facets do (steadily, or swinging back and forth and coming home), or not at all.
            ...(isLight
              ? lights.turn === 'steady'
                ? { animation: `nenya-orbit-cw ${lights.turnPeriodS}s linear infinite`, animationDelay: `${-(clockS % lights.turnPeriodS)}s` }
                : lights.turn === 'sway'
                  ? { animation: `nenya-lights-sway ${lights.turnPeriodS}s cubic-bezier(0.37,0,0.63,1) infinite`, animationDelay: `${-(clockS % lights.turnPeriodS)}s`, ['--sway' as string]: `${lights.turnDeg}deg` }
                  : { animation: undefined }
              : { animation: innerMoves ? `nenya-orbit-cw ${ORBIT_DURATION}s linear infinite` : undefined, animationDelay: innerMoves ? `${orbitDelay}s` : undefined }),
                      }}
        >
          {isLight && lights.rise === 'breath' && <style>{lightBreathCss(technique)}</style>}
          {valarColors.map((valar, index) => {
            // Calculate position on circle
            const angle = (index / valarColors.length) * 2 * Math.PI;
            const x = Math.cos(angle) * orbitRadius;
            const y = Math.sin(angle) * orbitRadius;
            
            // Each orb cycles through its 6-color vector
            const colorCycleDuration = inner.colorCycle; // seconds to cycle through all 6 colors
            const colors = orbVecs[index];
            
            // Each orb is partly hidden by the ones after it, all the way round. Drawing order gives that for most of
            // the ring, but the last few orbs would otherwise sit whole on top of the first few. So they are cut away
            // wherever one of the first orbs overlaps them, which puts those first orbs on top at the seam.
            const total = valarColors.length;
            const SEAM_REACH = 4; // an orb overlaps about this many neighbours (their centres are closer than a diameter)
            const wrapped = !isLight && index >= total - SEAM_REACH;
            const pad = orbSize * 0.2; // room for the orb's pulse (it grows by 5%) inside the cut-out wrapper
            const left = orbitRadius - orbSize / 2 + x;
            const top = orbitRadius - orbSize / 2 + y;
            const d = isLight ? orbSize * LIGHT_SIZE : orbSize; // a light is a little larger than an orb: its edge is a fade
            const off = (d - orbSize) / 2;
            // A light's own rise and fade: on the gem's wave, with the breath, or at rest (the lights hold still).
            const lightPeriod = lights.risePeriodS + index * lights.riseStepS;
            const lightBg = [0, 1, 2, 3, 4, 5, 0].map((k) => lightGradient(colors[k]));
            const lightAnimate =
              lights.rise === 'gem'
                ? { background: lightBg, opacity: [lights.depth, 1, lights.depth], scale: [lights.scale, 1, lights.scale], rotate: 0 }
                : lights.rise === 'breath'
                  ? { background: lightBg }
                  : { background: lightBg, opacity: (1 + lights.depth) / 2, scale: (1 + lights.scale) / 2, rotate: 0 };
            const lightTransition =
              lights.rise === 'gem'
                ? {
                    background: { duration: colorCycleDuration, repeat: Infinity, ease: 'easeInOut' as const, delay: index * 2 },
                    opacity: { duration: lightPeriod, repeat: Infinity, ease: SINE },
                    scale: { duration: lightPeriod, repeat: Infinity, ease: SINE },
                  }
                : { background: { duration: colorCycleDuration, repeat: Infinity, ease: 'easeInOut' as const, delay: index * 2 }, default: { duration: 0 } };
            const orb = (
              <m.div
                key={valar.name}
                className={isLight && lights.rise === 'breath' ? 'absolute nenya-light-breath' : 'absolute'}
                style={{
                  width: d,
                  height: d,
                  left: wrapped ? pad : orbitRadius - orbSize / 2 + x - off,
                  top: wrapped ? pad : orbitRadius - orbSize / 2 + y - off,
                  borderRadius: '50%',
                  willChange: zoomed ? undefined : (isLight ? lights.rise !== 'none' : innerMoves) ? 'background, opacity, transform' : 'background',
                  opacity: isLight ? (lights.rise === 'none' ? (1 + lights.depth) / 2 : lights.depth) : INNER_ORB_OPACITY[0],
                  ...(isLight && lights.rise === 'breath'
                    ? { animation: `nl-breath-${lightBreathKey(technique)} ${breathMs}ms ease-in-out infinite`, animationDelay: `${-Math.round((clockS * 1000) % breathMs)}ms`, ['--nl-depth' as string]: lights.depth, ['--nl-scale' as string]: lights.scale }
                    : {}),
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'translateZ(0)',
                }}
                animate={
                  isLight
                    ? lightAnimate
                    : innerMoves
                    ? {
                        background: [0, 1, 2, 3, 4, 5, 0].map((k) => (isLight ? lightGradient(colors[k]) : orbGradient(colors[k]))),
                        opacity: isLight ? [inner.emergeDepth, 1, inner.emergeDepth] : INNER_ORB_OPACITY,
                        scale: isLight ? [inner.emergeScale, 1, inner.emergeScale] : PULSE,
                        rotate: isLight ? 0 : -360,
                      }
                    : {
                        // Still: the colours keep fading, nothing else moves; the light rests at the middle of its rise and fade.
                        background: [0, 1, 2, 3, 4, 5, 0].map((k) => (isLight ? lightGradient(colors[k]) : orbGradient(colors[k]))),
                        opacity: isLight ? (inner.emergeDepth + 1) / 2 : (inner.opacityLow + inner.opacityHigh) / 2,
                        scale: isLight ? (inner.emergeScale + 1) / 2 : 1,
                        rotate: 0,
                      }
                }
                transition={
                  isLight
                    ? lightTransition
                    : innerMoves
                    ? {
                        background: { duration: colorCycleDuration, repeat: Infinity, ease: "easeInOut", delay: index * 2 },
                        opacity: { duration: isLight ? inner.emergeSeconds + index * inner.emergeStep : inner.pulseSeconds + (index * inner.pulseStep), repeat: Infinity, ease: "easeInOut" },
                        scale: { duration: isLight ? inner.emergeSeconds + index * inner.emergeStep : inner.pulseSeconds + (index * inner.pulseStep), repeat: Infinity, ease: "easeInOut" },
                        rotate: { duration: ORBIT_DURATION, repeat: Infinity, ease: "linear" },
                      }
                    : {
                        background: { duration: colorCycleDuration, repeat: Infinity, ease: "easeInOut", delay: index * 2 },
                        default: { duration: 0 },
                      }
                }
              >
                {!isLight && <OrbSurface d={orbSize} glass={inner} />}
              </m.div>
            );
            if (!wrapped) return orb;
            const rr = orbSize / 2;
            const holes = Array.from({ length: index + SEAM_REACH - total + 1 }, (_, k) => k);
            const mask = holes
              .map((j) => {
                const aj = (j / total) * 2 * Math.PI;
                const cx = Math.cos(aj) * orbitRadius - x + orbSize / 2 + pad;
                const cy = Math.sin(aj) * orbitRadius - y + orbSize / 2 + pad;
                return `radial-gradient(circle at ${cx}px ${cy}px, transparent ${rr * 0.9}px, #000 ${rr}px)`;
              })
              .join(', ');
            return (
              <div
                key={`seam-${valar.name}`}
                className="absolute"
                style={
                  {
                    left: left - pad,
                    top: top - pad,
                    width: orbSize + pad * 2,
                    height: orbSize + pad * 2,
                    maskImage: mask,
                    WebkitMaskImage: mask,
                    maskComposite: 'intersect',
                    WebkitMaskComposite: 'source-in',
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat',
                  } as React.CSSProperties
                }
              >
                {orb}
              </div>
            );
          })}
        </div>
      )}

      {/* Outer Orbiting Valar - smaller orbs at breathing animation edge, rotating opposite direction */}
      {showValarOrbit && outer.show && (
        <div
          className="absolute pointer-events-none"
          style={{
            width: outerOrbitRadius * 2,
            height: outerOrbitRadius * 2,
            left: '50%',
            top: '50%',
            marginLeft: -outerOrbitRadius,
            marginTop: -outerOrbitRadius,
            zIndex: 5, // Below inner orbit (20) but above base logo (10)
            willChange: 'transform',
            animation: `nenya-orbit-ccw ${ORBIT_DURATION}s linear infinite`, // Opposite direction
            animationDelay: `${orbitDelay}s`,
                      }}
        >
          <style>{orbHueCss}</style>
          {valarColors.map((valar, index) => {
            // Calculate position on circle
            const angle = (index / valarColors.length) * 2 * Math.PI;
            const x = Math.cos(angle) * outerOrbitRadius;
            const y = Math.sin(angle) * outerOrbitRadius;
            
            // Each orb cycles through its 6-color vector
            const colorCycleDuration = 30; // seconds to cycle through all 6 colors
            const colors = orbVecs[index];
            
            const haloColors = outer.halo === 'random' ? randomHaloColors(outer.haloSeed, index, allOrbColours) : colors;
            const halo = ownHalo ? (
              <div
                key={`halo-${valar.name}`}
                aria-hidden="true"
                className="absolute nenya-orb-halo"
                style={{
                  width: haloSize,
                  height: haloSize,
                  left: outerOrbitRadius - haloSize / 2 + x,
                  top: outerOrbitRadius - haloSize / 2 + y,
                  borderRadius: '50%',
                  pointerEvents: 'none',
                  background: haloGradient(outer.halo === 'palette' || outer.halo === 'random'),
                  ['--p0' as string]: haloColors[0], ['--p1' as string]: haloColors[1], ['--p2' as string]: haloColors[2],
                  ['--p3' as string]: haloColors[3], ['--p4' as string]: haloColors[4], ['--p5' as string]: haloColors[5],
                  ['--hc' as string]: haloColors[0], ['--hc2' as string]: haloColors[2],
                  ['--halo-lo' as string]: outer.opacityLow, ['--halo-hi' as string]: outer.opacityHigh,
                  opacity: outer.opacityLow,
                  // Linear, so the colour is always fading and never rests or snaps; the negative delay puts each orb part way round the cycle from the first frame.
                  animation: `nho-h-${index} ${colorCycleDuration}s linear -${index * 2}s infinite, nho-h2-${index} ${colorCycleDuration}s linear -${index * 2}s infinite, nenya-halo-breathe ${4 + index * 0.3}s ease-in-out infinite`,
                }}
              />
            ) : null;
            const planet = (
              <m.div
                key={`outer-${valar.name}`}
                className={glow && !zoomed && !ownHalo ? 'absolute nenya-orb-hued nenya-orb-glow' : 'absolute nenya-orb-hued'}
                style={{
                  width: outerOrbSize,
                  height: outerOrbSize,
                  left: outerOrbitRadius - outerOrbSize / 2 + x,
                  top: outerOrbitRadius - outerOrbSize / 2 + y,
                  borderRadius: '50%',
                  willChange: zoomed ? undefined : 'opacity, transform',
                  opacity: OUTER_ORB_OPACITY[0],
                  // The colour is the browser's own fade (registered --hc, keyframes nho-c-N), not a script swapping gradient strings.
                  background: ORB_FADE_GRADIENT,
                  ['--hc' as string]: colors[0],
                  animation: `nho-c-${index} ${colorCycleDuration}s linear -${index * 2}s infinite`,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'translateZ(0)',
                }}
                animate={{
                  opacity: OUTER_ORB_OPACITY,
                  scale: [0.95, 1.05, 0.95],
                  rotate: 360,
                }}
                transition={{
                  opacity: {
                    duration: 4 + (index * 0.3),
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                  scale: {
                    duration: 4 + (index * 0.3),
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                  rotate: {
                    duration: 120,
                    repeat: Infinity,
                    ease: "linear"
                  }
                }}
              >
                <OrbSurface d={outerOrbSize} />
              </m.div>
            );
            return halo ? (
              <Fragment key={`outer-pair-${valar.name}`}>
                {halo}
                {planet}
              </Fragment>
            ) : (
              planet
            );
          })}
        </div>
      )}

      {/* Light emanating from within. With the orbit enabled this is the spectral gem; otherwise the
          flat logo drawn again over the orbs. */}
      {showLogo && showValarOrbit && (
        <SpectralGem
          size={size}
          cycleStart={cycleStart}
          technique={technique}
          breathingEnabled={breathingEnabled}
          engine={gemEngine}
          sides={gemSides}
          live={liveGem}
          orbitSeconds={inner.orbitSeconds}
          colorCycle={inner.colorCycle}
          emerge={inner}
          paused={zoomed}
          orbsStill={!innerMoves}
          lights={isLight ? lights : undefined}
          onStats={onGemStats}
          {...gemLook}
        />
      )}
      {showLogo && !showValarOrbit && (
        <img
          src={flatLogoSrc}
          alt=""
          width={size * 0.85}
          height={size * 0.85}
          className="absolute"
          style={{
            width: size * 0.85,
            height: size * 0.85,
            zIndex: 30,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%,-50%)',
            opacity: 1,
            pointerEvents: 'none',
            display: 'block',
            userSelect: 'none',
            // Vendor-prefixed and missing from the CSS typings, but still honored by WebKit and Blink.
            ...({ WebkitUserDrag: 'none' } as React.CSSProperties),
          }}
        />
      )}
    </div>
  );
}