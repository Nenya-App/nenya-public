import * as m from 'motion/react-m';
import { useEffect, useRef, useState } from 'react';
// The flat logo (petals, bezel and gem, no orbs) is a 768 px WebP rendered from the vector drawings, and most call
// sites use this component as a small persistent header mark (28-40px), where that is over 25 times more image
// data than the display can show. A pre-resized 128 px WebP is swapped in below for those small sizes instead.
import nenyaLogo from '../../assets/nenya-logo.webp';
import nenyaLogoSmall from '../../assets/nenya-logo-small.webp';
// The orbit view's petals: a vector drawing (two interlaced gold and cream flowers with a bevel and a true over-under
// weave), drawn as an image so the build gives it a versioned filename that can be cached for a long time.
// Its 765-unit box is the logo's size * 0.765, with the outer ring's diameter as 1000 units.
import petalsLayer from '../../assets/logo/petals.svg';
import { valarColors, type BreathingTechnique } from './ValarBreathingLogo';
import SpectralGem, { type GemStats, type LiveGemLook } from './SpectralGem';
import LogoGlow from './LogoGlow';
import { DEFAULT_INNER_ORBIT, DEFAULT_OUTER_ORBIT, type InnerOrbitLook, type OuterOrbitLook } from '../../lib/orbitLook';
import { GEM_ENGINE, type GemEngine } from '../../lib/gemSprite';

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
  liveGem,
  innerOrbit,
  outerOrbit,
  onGemStats,
}: NenyaLogoProps) {
  const flatLogoSrc = size <= SMALL_LOGO_MAX_SIZE ? nenyaLogoSmall : nenyaLogo;
  const inner = { ...DEFAULT_INNER_ORBIT, ...innerOrbit };
  const outer = { ...DEFAULT_OUTER_ORBIT, ...outerOrbit };
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

  // Set once, when the logo first mounts with a clock anchor, so a fresh mount starts the rotation at the
  // correct phase. Deliberately NOT recomputed when the anchor changes later: that happens when the breathing
  // pace changes, and recomputing would snap the orbits back to angle 0 in front of the person.
  const [orbitDelay, setOrbitDelay] = useState(0);
  const orbitSet = useRef(false);
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
        <LogoGlow size={size} orbit={showValarOrbit} maskSrc={showValarOrbit ? petalsLayer : flatLogoSrc} gemEngine={gemEngine} />
      )}

      {/* Logo image - base layer. When the Valar orbit is enabled the flat logo is
          swapped for the vector petals under the gem overlay below. */}
      {showLogo && (
        <img
          src={showValarOrbit ? petalsLayer : flatLogoSrc}
          alt={alt}
          width={showValarOrbit ? size * 0.765 : size * 0.85}
          height={showValarOrbit ? size * 0.765 : size * 0.85}
          className="absolute"
          style={{
            width: showValarOrbit ? size * 0.765 : size * 0.85,
            height: showValarOrbit ? size * 0.765 : size * 0.85,
            zIndex: 10,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%,-50%)',
          }}
        />
      )}
      
      {/* Orbiting Valar - only show if enabled */}
      {showValarOrbit && inner.show && (
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
            mixBlendMode: inner.blend === 'normal' ? undefined : inner.blend,
            willChange: 'transform',
            // Plain CSS animation rather than Motion's JS-driven `animate` --
            // animation-play-state genuinely freezes this on pause, where
            // Motion's `animate={false}` does not reliably cancel an
            // already-running infinite WAAPI loop.
            animation: `nenya-orbit-cw ${ORBIT_DURATION}s linear infinite`,
            animationDelay: `${orbitDelay}s`,
                      }}
        >
          {valarColors.map((valar, index) => {
            // Calculate position on circle
            const angle = (index / valarColors.length) * 2 * Math.PI;
            const x = Math.cos(angle) * orbitRadius;
            const y = Math.sin(angle) * orbitRadius;
            
            // Each orb cycles through its 6-color vector
            const colorCycleDuration = inner.colorCycle; // seconds to cycle through all 6 colors
            const colors = valar.vector;
            
            // Each orb is partly hidden by the ones after it, all the way round. Drawing order gives that for most of
            // the ring, but the last few orbs would otherwise sit whole on top of the first few. So they are cut away
            // wherever one of the first orbs overlaps them, which puts those first orbs on top at the seam.
            const total = valarColors.length;
            const SEAM_REACH = 4; // an orb overlaps about this many neighbours (their centres are closer than a diameter)
            const wrapped = index >= total - SEAM_REACH;
            const pad = orbSize * 0.2; // room for the orb's pulse (it grows by 5%) inside the cut-out wrapper
            const left = orbitRadius - orbSize / 2 + x;
            const top = orbitRadius - orbSize / 2 + y;
            const orb = (
              <m.div
                key={valar.name}
                className="absolute"
                style={{
                  width: orbSize,
                  height: orbSize,
                  left: wrapped ? pad : orbitRadius - orbSize / 2 + x,
                  top: wrapped ? pad : orbitRadius - orbSize / 2 + y,
                  borderRadius: '50%',
                  willChange: 'background, opacity, transform',
                  opacity: INNER_ORB_OPACITY[0],
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'translateZ(0)',
                }}
                animate={{
                  background: [
                    `radial-gradient(circle at 30% 30%, ${colors[0]}ff, ${colors[0]}ee 50%, ${colors[0]}99 80%, ${colors[0]}44)`,
                    `radial-gradient(circle at 30% 30%, ${colors[1]}ff, ${colors[1]}ee 50%, ${colors[1]}99 80%, ${colors[1]}44)`,
                    `radial-gradient(circle at 30% 30%, ${colors[2]}ff, ${colors[2]}ee 50%, ${colors[2]}99 80%, ${colors[2]}44)`,
                    `radial-gradient(circle at 30% 30%, ${colors[3]}ff, ${colors[3]}ee 50%, ${colors[3]}99 80%, ${colors[3]}44)`,
                    `radial-gradient(circle at 30% 30%, ${colors[4]}ff, ${colors[4]}ee 50%, ${colors[4]}99 80%, ${colors[4]}44)`,
                    `radial-gradient(circle at 30% 30%, ${colors[5]}ff, ${colors[5]}ee 50%, ${colors[5]}99 80%, ${colors[5]}44)`,
                    `radial-gradient(circle at 30% 30%, ${colors[0]}ff, ${colors[0]}ee 50%, ${colors[0]}99 80%, ${colors[0]}44)`,
                  ],
                  opacity: INNER_ORB_OPACITY,
                  scale: PULSE,
                  rotate: -360,
                }}
                transition={{
                  background: {
                    duration: colorCycleDuration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 2,
                  },
                  opacity: {
                    duration: inner.pulseSeconds + (index * inner.pulseStep),
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                  scale: {
                    duration: inner.pulseSeconds + (index * inner.pulseStep),
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                  rotate: {
                    duration: ORBIT_DURATION,
                    repeat: Infinity,
                    ease: "linear"
                  }
                }}
              >
                <OrbSurface d={orbSize} glass={inner} />
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
          {valarColors.map((valar, index) => {
            // Calculate position on circle
            const angle = (index / valarColors.length) * 2 * Math.PI;
            const x = Math.cos(angle) * outerOrbitRadius;
            const y = Math.sin(angle) * outerOrbitRadius;
            
            // Each orb cycles through its 6-color vector
            const colorCycleDuration = 30; // seconds to cycle through all 6 colors
            const colors = valar.vector;
            
            return (
              <m.div
                key={`outer-${valar.name}`}
                className={glow ? 'absolute nenya-orb-glow' : 'absolute'}
                style={{
                  width: outerOrbSize,
                  height: outerOrbSize,
                  left: outerOrbitRadius - outerOrbSize / 2 + x,
                  top: outerOrbitRadius - outerOrbSize / 2 + y,
                  borderRadius: '50%',
                  willChange: 'background, opacity, transform',
                  opacity: OUTER_ORB_OPACITY[0],
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'translateZ(0)',
                }}
                animate={{
                  background: [
                    `radial-gradient(circle at 30% 30%, ${colors[0]}ff, ${colors[0]}ee 50%, ${colors[0]}99 80%, ${colors[0]}44)`,
                    `radial-gradient(circle at 30% 30%, ${colors[1]}ff, ${colors[1]}ee 50%, ${colors[1]}99 80%, ${colors[1]}44)`,
                    `radial-gradient(circle at 30% 30%, ${colors[2]}ff, ${colors[2]}ee 50%, ${colors[2]}99 80%, ${colors[2]}44)`,
                    `radial-gradient(circle at 30% 30%, ${colors[3]}ff, ${colors[3]}ee 50%, ${colors[3]}99 80%, ${colors[3]}44)`,
                    `radial-gradient(circle at 30% 30%, ${colors[4]}ff, ${colors[4]}ee 50%, ${colors[4]}99 80%, ${colors[4]}44)`,
                    `radial-gradient(circle at 30% 30%, ${colors[5]}ff, ${colors[5]}ee 50%, ${colors[5]}99 80%, ${colors[5]}44)`,
                    `radial-gradient(circle at 30% 30%, ${colors[0]}ff, ${colors[0]}ee 50%, ${colors[0]}99 80%, ${colors[0]}44)`,
                  ],
                  opacity: OUTER_ORB_OPACITY,
                  scale: [0.95, 1.05, 0.95],
                  rotate: 360,
                }}
                transition={{
                  background: {
                    duration: colorCycleDuration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 2,
                  },
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
          live={liveGem}
          orbitSeconds={inner.orbitSeconds}
          colorCycle={inner.colorCycle}
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