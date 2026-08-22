import { motion } from 'motion/react';
import nenyaLogo from 'figma:asset/2d6974b805d90d34c0a281273e556b545b1c5632.png';
import { valarColors } from './ValarBreathingLogo';

interface NenyaLogoProps {
  size?: number;
  className?: string;
  showValarOrbit?: boolean;
  showLogo?: boolean;
}

export default function NenyaLogo({
  size = 80,
  className = '',
  showValarOrbit = false,
  showLogo = true
}: NenyaLogoProps) {
  // Inner orbit - tight orbit creates dense overlapping effect
  const orbitRadius = size * 0.0625; // 37.5px for 600px logo, 12.5px for 200px logo
  const orbSize = Math.max(8.5, size * 0.102); // Reduced by 15% from previous size (0.12 * 0.85 = 0.102)
  
  // Outer orbit - at the edge of the breathing animation (logoSize / 2)
  // Breathing animation expands to 1.4x its base size (logoSize / 1.4), so at peak it reaches logoSize diameter
  const outerOrbitRadius = size / 2; // Half the logo size = outer edge of breathing animation
  const outerOrbSize = orbSize * 0.5; // Half the size of inner orbs
  
  return (
    <div 
      className={`relative ${className}`}
      style={{ 
        width: size, 
        height: size,
      }}
    >
      {/* Logo image - base layer. When the Valar orbit is enabled the flat logo is
          swapped for the separated petals layer (brightened) under the gem overlay below. */}
      {showLogo && (
        <img
          src={showValarOrbit ? '/assets/petals-sep.png' : nenyaLogo}
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
        <motion.div
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
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 120, // 2 minutes for one complete orbit
            repeat: Infinity,
            ease: "linear"
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
            
            return (
              <motion.div
                key={valar.name}
                className="absolute"
                style={{
                  width: orbSize,
                  height: orbSize,
                  left: orbitRadius - orbSize / 2 + x,
                  top: orbitRadius - orbSize / 2 + y,
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
          })}
        </motion.div>
      )}
      
      {/* Outer Orbiting Valar - smaller orbs at breathing animation edge, rotating opposite direction */}
      {showValarOrbit && (
        <motion.div
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
          }}
          animate={{ rotate: -360 }} // Opposite direction
          transition={{
            duration: 120, // Same 2 minutes for one complete orbit
            repeat: Infinity,
            ease: "linear"
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
              <motion.div
                key={`outer-${valar.name}`}
                className="absolute"
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
        </motion.div>
      )}
      
      {/* Opaque logo overlay - creates effect of light emanating from within.
          With the orbit enabled this becomes the separated gem layer with a shimmer animation. */}
      {showLogo && (
        <img
          src={showValarOrbit ? '/assets/gem-sep.png' : nenyaLogo}
          alt=""
          width={showValarOrbit ? size * 0.765 : size * 0.85}
          height={showValarOrbit ? size * 0.765 : size * 0.85}
          className="absolute"
          style={{
            width: showValarOrbit ? size * 0.765 : size * 0.85,
            height: showValarOrbit ? size * 0.765 : size * 0.85,
            zIndex: 30,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%,-50%)',
            animation: showValarOrbit ? 'gem-shimmer 14s ease-in-out infinite' : undefined,
            opacity: 1,
            pointerEvents: 'none',
            display: 'block',
            userSelect: 'none',
            WebkitUserDrag: 'none',
          }}
        />
      )}
    </div>
  );
}