import * as m from 'motion/react-m';
import { useEffect, useRef, useState } from 'react';
import nenyaLogo from 'figma:asset/2d6974b805d90d34c0a281273e556b545b1c5632.webp';
// The source asset is a 1024x1024 WebP (~69KB) -- appropriate for the large
// welcome-screen breathing logo (rendered up to 400px), but most call sites
// use this component as a small persistent header mark (28-40px), where a
// 1024px source is over 25x more image data than the display size can ever
// show. This pre-resized/re-encoded 128x128 WebP (~5KB) is swapped in below
// for those small sizes instead.
import nenyaLogoSmall from '../../assets/nenya-logo-small.webp';
// The orbit view's two separated layers. Imported (not served from public/) so the build gives them
// versioned filenames and they can be cached for a long time safely.
import petalsLayer from '../../assets/petals-sep.webp';
import { valarColors, type BreathingTechnique } from './ValarBreathingLogo';
import SpectralGem from './SpectralGem';
import LogoGlow from './LogoGlow';

// Above this size, the full-resolution source is used instead -- 128px
// covers up to ~40px CSS at 3x device pixel ratio (the largest "small"
// usage in the app today) with headroom to spare.
const SMALL_LOGO_MAX_SIZE = 48;

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
  /** Overrides for the gem's shading. Used by the design preview only. */
  gemLook?: { clarity?: number; sparkle?: number; contrast?: number; lift?: number; fieldAlpha?: number };
}

const ORBIT_DURATION = 120; // seconds for one complete orbit

export default function NenyaLogo({
  size = 80,
  className = '',
  showValarOrbit = false,
  showLogo = true,
  cycleStart,
  technique = null,
  breathingEnabled = true,
  glow = false,
  gemLook,
}: NenyaLogoProps) {
  const flatLogoSrc = size <= SMALL_LOGO_MAX_SIZE ? nenyaLogoSmall : nenyaLogo;

  // Inner orbit - tight orbit creates dense overlapping effect
  const orbitRadius = size * 0.0625; // 37.5px for 600px logo, 12.5px for 200px logo
  // The inner orbs sit inside the gem, so they are smaller than the outer ones.
  const orbSize = Math.max(8.5, size * 0.085);

  // Outer orbit - at the edge of the breathing animation (logoSize / 2)
  // Breathing animation expands to 1.4x its base size (logoSize / 1.4), so at peak it reaches logoSize diameter
  const outerOrbitRadius = size / 2; // Half the logo size = outer edge of breathing animation
  const outerOrbSize = Math.max(8.5, size * 0.102) * 0.5; // Half the size the inner orbs used to have; unchanged

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
        <LogoGlow size={size} orbit={showValarOrbit} maskSrc={showValarOrbit ? petalsLayer : flatLogoSrc} />
      )}

      {/* Logo image - base layer. When the Valar orbit is enabled the flat logo is
          swapped for the separated petals layer (brightened) under the gem overlay below. */}
      {showLogo && (
        <img
          src={showValarOrbit ? petalsLayer : flatLogoSrc}
          alt="Nenya Logo"
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
            filter: showValarOrbit ? 'brightness(1.4)' : undefined,
          }}
        />
      )}
      
      {/* Orbiting Valar - only show if enabled */}
      {showValarOrbit && (
        <div
          className="absolute pointer-events-none"
          style={{
            width: orbitRadius * 2,
            height: orbitRadius * 2,
            left: '50%',
            top: '50%',
            marginLeft: -orbitRadius,
            marginTop: -orbitRadius,
            zIndex: 20,
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
            const colorCycleDuration = 30; // seconds to cycle through all 6 colors
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
                  opacity: 0.64,
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
                  opacity: [0.584, 0.8, 0.584],
                  scale: [0.95, 1.05, 0.95],
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
              />
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
      {showValarOrbit && (
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
                  opacity: 0.8,
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
                  opacity: [0.73, 1.0, 0.73],
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
              />
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