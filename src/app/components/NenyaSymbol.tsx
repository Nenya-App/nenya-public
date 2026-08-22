import { motion } from 'motion/react';
import nenyaLogo from 'figma:asset/97ae39e7ed6444a186091920628ca9206a54a124.png';

interface NenyaSymbolProps {
  size?: number;
  userColors?: { color1?: string; color2?: string };
  animated?: boolean;
  showPrism?: boolean;
  intensity?: 'subtle' | 'medium' | 'strong';
}

export default function NenyaSymbol({ 
  size = 80, 
  userColors, 
  animated = false,
  showPrism = false,
  intensity = 'medium'
}: NenyaSymbolProps) {
  const color1 = userColors?.color1 || '#0047AB';
  const color2 = userColors?.color2 || '#F5D042';

  const prismOpacity = {
    subtle: 0.15,
    medium: 0.3,
    strong: 0.5
  }[intensity];

  return (
    <motion.div 
      className="relative flex items-center justify-center" 
      style={{ width: size, height: size }}
      initial={animated ? { opacity: 0, scale: 0.5, rotate: -45 } : {}}
      animate={animated ? { opacity: 1, scale: 1, rotate: 0 } : {}}
      transition={animated ? { duration: 1.2, ease: 'easeOut' } : {}}
    >
      {/* Outer prismatic glow ring */}
      {showPrism && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: size * 1.5,
            height: size * 1.5,
            background: `conic-gradient(from 0deg, 
              ${color1}, 
              #FF1493, 
              #FF4500, 
              #FFD700, 
              #00FF00, 
              #00CED1, 
              ${color2}, 
              #9370DB, 
              ${color1})`,
            opacity: prismOpacity * 0.4,
            filter: 'blur(30px)',
          }}
          initial={animated ? { opacity: 0, scale: 0.3 } : {}}
          animate={animated ? { 
            opacity: [0, prismOpacity * 0.4, prismOpacity * 0.3],
            scale: [0.3, 1.6, 1.5],
            rotate: [0, 360]
          } : showPrism ? {
            rotate: 360
          } : {}}
          transition={animated ? { 
            duration: 3, 
            ease: 'easeOut',
            rotate: { duration: 20, repeat: Infinity, ease: 'linear' }
          } : {
            rotate: { duration: 20, repeat: Infinity, ease: 'linear' }
          }}
        />
      )}

      {/* Inner prismatic rays */}
      {showPrism && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: size * 1.2,
            height: size * 1.2,
            background: `radial-gradient(circle, 
              transparent 30%, 
              ${color1}40 40%, 
              #FFD70040 50%,
              ${color2}40 60%,
              transparent 70%)`,
            filter: 'blur(10px)',
            opacity: prismOpacity,
          }}
          initial={animated ? { opacity: 0, scale: 0.5 } : {}}
          animate={animated ? { 
            opacity: [0, prismOpacity, prismOpacity * 0.8],
            scale: [0.5, 1.3, 1.2],
          } : {
            opacity: prismOpacity * 0.8,
            scale: 1.2
          }}
          transition={animated ? { 
            duration: 2,
            ease: 'easeOut'
          } : {}}
        />
      )}

      {/* Hexagonal light rays emanating from diamond */}
      {showPrism && intensity !== 'subtle' && (
        <>
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <motion.div
              key={`ray-${i}`}
              className="absolute origin-center"
              style={{
                width: size * 0.4,
                height: size * 1.8,
                background: `linear-gradient(to bottom, 
                  ${['#FF1493', '#FFD700', '#00FF00', '#00CED1', '#9370DB', color1][i]}60 0%, 
                  transparent 50%)`,
                filter: 'blur(8px)',
                transform: `rotate(${angle}deg) translateY(-${size * 0.5}px)`,
                opacity: prismOpacity * 0.6,
              }}
              initial={animated ? { opacity: 0, scaleY: 0 } : {}}
              animate={animated ? { 
                opacity: [0, prismOpacity * 0.6, prismOpacity * 0.4],
                scaleY: [0, 1, 0.9]
              } : {}}
              transition={animated ? { 
                duration: 1.5,
                delay: 0.3 + i * 0.1,
                ease: 'easeOut'
              } : {}}
            />
          ))}
        </>
      )}

      {/* Gold petal glow (subtle) */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 1.1,
          height: size * 1.1,
          background: `radial-gradient(circle, #D4AF6840 0%, transparent 60%)`,
          filter: 'blur(15px)',
        }}
        initial={animated ? { opacity: 0 } : {}}
        animate={animated ? { 
          opacity: [0, 0.6, 0.4]
        } : { opacity: 0.4 }}
        transition={animated ? { 
          duration: 1.5,
          delay: 0.5
        } : {}}
      />

      {/* The Nenya Logo - main element */}
      <motion.div
        className="relative z-10"
        initial={animated ? { scale: 0.3, opacity: 0 } : {}}
        animate={animated ? { scale: 1, opacity: 1 } : {}}
        transition={animated ? { duration: 1, delay: 0.2, ease: 'easeOut' } : {}}
      >
        <img 
          src={nenyaLogo} 
          alt="Nenya - A Mirror for Your Inner World"
          style={{ width: size, height: size }}
          className="object-contain drop-shadow-lg"
        />
      </motion.div>

      {/* Subtle user color overlay on logo */}
      {userColors && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-full z-20"
          style={{
            width: size,
            height: size,
            background: `radial-gradient(circle, ${color1}15 0%, ${color2}15 50%, transparent 70%)`,
            mixBlendMode: 'overlay',
          }}
          initial={animated ? { opacity: 0 } : {}}
          animate={animated ? { opacity: 1 } : {}}
          transition={animated ? { delay: 0.8, duration: 0.8 } : {}}
        />
      )}

      {/* Prismatic sparkle effect on animation complete */}
      {animated && showPrism && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-full"
          style={{
            width: size,
            height: size,
            background: `radial-gradient(circle, white 0%, transparent 60%)`,
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ 
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.2, 1.5]
          }}
          transition={{ 
            delay: 1.2,
            duration: 0.8,
            ease: 'easeOut'
          }}
        />
      )}
    </motion.div>
  );
}
