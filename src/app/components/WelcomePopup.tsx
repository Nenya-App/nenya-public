import { useState } from 'react';
import { X, Sparkles, BookOpen, Heart, Shield, Users } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';

interface WelcomePopupProps {
  onNavigateToAbout?: (section?: string) => void;
  onDismiss?: () => void;
}

export default function WelcomePopup({ onNavigateToAbout, onDismiss }: WelcomePopupProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleMinimize = () => {
    setIsMinimized(true);
    setIsOpen(false);
    onDismiss?.();
  };

  const handleReopen = () => {
    setIsMinimized(false);
    setIsOpen(true);
  };

  const handleNavigate = (section: string) => {
    onNavigateToAbout?.(section);
    handleMinimize();
  };

  return (
    <>
      {/* Minimized Floating Icon - positioned under emergency exit button */}
      <AnimatePresence>
        {isMinimized && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={handleReopen}
            className="fixed top-[4.5rem] md:top-20 right-4 z-40 p-3 bg-nenya-accent-warm/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-nenya-accent-secondary transition-colors border border-nenya-accent-metallic/30"
            aria-label="Reopen welcome message"
            style={{ animation: 'glimmer-ring 2.5s ease-in-out infinite' }}
          >
            <Sparkles className="size-5 text-background-elevated" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Full Welcome Card */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Radial gradient backdrop - more transparent at edges, 96% max opacity at center */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="fixed inset-0 z-[60] pointer-events-none"
              style={{
                background: 'radial-gradient(circle at center, hsl(var(--background) / 0.96) 0%, hsl(var(--background) / 0.92) 40%, hsl(var(--background) / 0.7) 100%)',
              }}
            />

            {/* Card container */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="fixed inset-0 z-[60] flex items-start md:items-center justify-center p-4 overflow-y-auto"
            >
              <div className="relative w-full max-w-lg my-4 md:my-8 pointer-events-auto">
                {/* Semi-transparent card */}
                <div className="relative backdrop-blur-xl border border-nenya-accent-warm/30 rounded-2xl shadow-2xl overflow-hidden bg-background/80 dark:bg-background/85">
                  {/* Decorative gradient border effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-nenya-accent-warm/20 via-transparent to-nenya-accent-secondary/20 pointer-events-none" />
                
                {/* Content */}
                <div className="relative p-4 sm:p-6 md:p-8 space-y-4 md:space-y-6">
                  {/* Close button */}
                  <button
                    onClick={handleMinimize}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted/50 transition-colors"
                    aria-label="Minimize"
                  >
                    <X className="size-5 text-muted-foreground" />
                  </button>

                  {/* Header with icon */}
                  <div className="flex items-start gap-3 md:gap-4 pr-8">
                    <div className="p-2 sm:p-3 bg-nenya-accent-warm/20 rounded-full flex-shrink-0">
                      <Sparkles className="size-5 sm:size-6 text-nenya-accent-warm" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <h2 className="text-xl sm:text-2xl md:text-3xl">
                        Welcome to Nenya
                      </h2>
                      <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                        Nenya is a private environment for structured self-reflection.
                      </p>
                      <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                        This is a tool to help you listen to yourself. We use a simple, three-step process:
                      </p>
                      <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-sm md:text-base ml-2">
                        <li>Breathe to find your center.</li>
                        <li>Sense your inner state through color, sound, and sensation.</li>
                        <li>Reflect to gain clarity.</li>
                      </ol>
                      <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                        Your journey here is private by design. Nothing you do is recorded, tracked, or stored.
                      </p>
                      <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                        When you are ready, close this card to begin.
                      </p>
                    </div>
                  </div>

                  {/* Main CTA */}
                  <Button
                    onClick={handleMinimize}
                    size="lg"
                    className="w-full bg-nenya-accent-warm hover:bg-nenya-accent-secondary text-background-elevated shadow-md"
                  >
                    Speak, Friend, and Enter.
                  </Button>

                  {/* Footer note */}
                  <p className="text-xs text-center text-muted-foreground italic">
                    You can reopen this message anytime using the sparkle icon.
                  </p>
                </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}