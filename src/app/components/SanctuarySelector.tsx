import { useState } from 'react';
import { ArrowLeft, Mountain, Trees, Ship } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'motion/react';

export type SanctuaryType = 'valley' | 'glade' | 'ship';

export interface SanctuaryPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  name: string;
  gradientStart: string;
  gradientMid: string;
  gradientEnd: string;
}

export const SANCTUARY_PALETTES: Record<SanctuaryType, SanctuaryPalette> = {
  valley: {
    name: 'The Hidden Valley',
    primary: '#2D5B45',
    secondary: '#4A7C5A',
    accent: '#A8D5BA',
    background: '#1A3B2C',
    text: '#FFFFFF',
    gradientStart: '#1A3B2C',
    gradientMid: '#2D5B45',
    gradientEnd: '#4A7C5A',
  },
  glade: {
    name: 'The Secluded Glade',
    primary: '#4A705C',
    secondary: '#8BAE8B',
    accent: '#E8F4E8',
    background: '#2B453A',
    text: '#FFFFFF',
    gradientStart: '#2B453A',
    gradientMid: '#4A705C',
    gradientEnd: '#8BAE8B',
  },
  ship: {
    name: 'The Ship at Sea',
    primary: '#2C4A5B',
    secondary: '#4A708C',
    accent: '#C8E8F8',
    background: '#1A2E3C',
    text: '#FFFFFF',
    gradientStart: '#1A2E3C',
    gradientMid: '#2C4A5B',
    gradientEnd: '#4A708C',
  },
};

interface SanctuaryCardProps {
  sanctuary: SanctuaryType;
  palette: SanctuaryPalette;
  onSelect: (sanctuary: SanctuaryType) => void;
}

function SanctuaryCard({ sanctuary, palette, onSelect }: SanctuaryCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getIcon = () => {
    switch (sanctuary) {
      case 'valley':
        return <Mountain className="w-20 h-20 md:w-24 md:h-24" style={{ color: palette.accent }} />;
      case 'glade':
        return <Trees className="w-20 h-20 md:w-24 md:h-24" style={{ color: palette.accent }} />;
      case 'ship':
        return <Ship className="w-20 h-20 md:w-24 md:h-24" style={{ color: palette.accent }} />;
    }
  };

  const getDescription = () => {
    switch (sanctuary) {
      case 'valley':
        return 'A protected space surrounded by ancient wisdom, where mist softens the edges and depth grounds the spirit.';
      case 'glade':
        return 'An open meadow dappled with gentle light, where natural growth and peaceful stillness meet.';
      case 'ship':
        return 'A steady vessel on endless waters, where horizon and rhythm guide contemplation.';
    }
  };

  return (
    <motion.div
      className="relative rounded-lg overflow-hidden cursor-pointer"
      style={{
        background: `linear-gradient(135deg, ${palette.gradientStart} 0%, ${palette.gradientMid} 50%, ${palette.gradientEnd} 100%)`,
        minHeight: '500px',
        width: '100%',
      }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onSelect(sanctuary)}
    >
      {/* Glow effect on hover */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 rounded-lg"
          style={{
            boxShadow: `0 0 40px ${palette.accent}33`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Card content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center space-y-6">
        {/* Icon with animation */}
        <motion.div
          animate={
            isHovered
              ? sanctuary === 'ship'
                ? { rotate: [0, -2, 2, -2, 0] }
                : { scale: [1, 1.1, 1] }
              : {}
          }
          transition={{
            duration: sanctuary === 'ship' ? 2 : 1.5,
            repeat: isHovered ? Infinity : 0,
            ease: 'easeInOut',
          }}
        >
          {getIcon()}
        </motion.div>

        {/* Title */}
        <h3 className="text-2xl md:text-3xl" style={{ color: palette.text }}>
          {palette.name}
        </h3>

        {/* Description */}
        <p className="text-sm md:text-base opacity-90 max-w-xs" style={{ color: palette.text }}>
          {getDescription()}
        </p>

        {/* Hover prompt */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            variant="outline"
            className="mt-4"
            style={{
              borderColor: palette.accent,
              color: palette.accent,
              backgroundColor: `${palette.background}80`,
            }}
          >
            Enter This Sanctuary
          </Button>
        </motion.div>
      </div>

      {/* Atmospheric overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            sanctuary === 'valley'
              ? 'radial-gradient(circle at 30% 50%, rgba(168, 213, 186, 0.1) 0%, transparent 50%)'
              : sanctuary === 'glade'
              ? 'radial-gradient(circle at 70% 30%, rgba(232, 244, 232, 0.15) 0%, transparent 60%)'
              : 'radial-gradient(circle at 50% 80%, rgba(200, 232, 248, 0.1) 0%, transparent 50%)',
        }}
      />
    </motion.div>
  );
}

interface SanctuarySelectorProps {
  onSelect: (sanctuary: SanctuaryType, palette: SanctuaryPalette) => void;
  onBack: () => void;
}

export default function SanctuarySelector({ onSelect, onBack }: SanctuarySelectorProps) {
  const handleSelect = (sanctuary: SanctuaryType) => {
    const palette = SANCTUARY_PALETTES[sanctuary];
    onSelect(sanctuary, palette);
  };

  return (
    <div className="size-full flex flex-col bg-background overflow-hidden">
      {/* Background with deep space theme */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, #1a2332 0%, #0A0F1C 100%)',
          opacity: 0.6,
        }}
      />

      {/* Header */}
      <div className="relative z-10 border-b border-border px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 overflow-auto scroll-container">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
          {/* Title */}
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 bg-gradient-to-r from-nenya-accent-metallic via-nenya-accent-warm to-nenya-accent-primary bg-clip-text text-transparent">
              Where does your mind feel safest?
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose a sanctuary that resonates with you. This will shape the visual atmosphere of
              your reflection space.
            </p>
          </motion.div>

          {/* Sanctuary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 max-w-6xl mx-auto">
            {(Object.keys(SANCTUARY_PALETTES) as SanctuaryType[]).map((sanctuary, index) => (
              <motion.div
                key={sanctuary}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <SanctuaryCard
                  sanctuary={sanctuary}
                  palette={SANCTUARY_PALETTES[sanctuary]}
                  onSelect={handleSelect}
                />
              </motion.div>
            ))}
          </div>

          {/* Footer note */}
          <motion.div
            className="text-center mt-12 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p>
              Your sanctuary choice will personalize colors and animations throughout your session.
              You can always return and choose a different space.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
