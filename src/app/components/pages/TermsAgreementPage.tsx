import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import NenyaLogo from '../NenyaLogo';
import { motion } from 'motion/react';
import { ScrollIndicator } from '../ScrollIndicator';

interface TermsAgreementPageProps {
  onAgree: () => void;
}

export default function TermsAgreementPage({ onAgree }: TermsAgreementPageProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [hasCheckedBox, setHasCheckedBox] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrolledToBottom = 
      container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
    
    if (scrolledToBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      // Check initial state
      handleScroll();
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleCheckboxChange = (checked: boolean) => {
    setHasCheckedBox(checked);
  };

  const handleButtonClick = () => {
    if (hasScrolledToBottom && hasCheckedBox) {
      // Trigger exit animation
      setIsExiting(true);
      // Store agreement in localStorage and proceed after animation
      localStorage.setItem('nenya_terms_agreed', 'true');
      // Delay the transition to allow animation to complete
      setTimeout(() => {
        onAgree();
      }, 800); // Match the exit animation duration
    }
  };

  return (
    <div className="size-full flex flex-col bg-background relative overflow-hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Animated background */}
      <div className="nenya-background" />
      
      <div className="flex-1 flex flex-col items-center justify-start sm:justify-center px-3 sm:px-4 md:px-6 py-3 sm:py-6 md:py-8 relative z-10">
        <motion.div 
          className="w-full max-w-2xl bg-background-elevated border border-border rounded-lg sm:rounded-2xl shadow-2xl flex flex-col max-h-[calc(100dvh-3rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] sm:max-h-[min(90vh,800px)] md:max-h-[min(85vh,750px)] lg:max-h-[min(80vh,700px)]"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ 
            opacity: isExiting ? 0 : 1, 
            y: isExiting ? 20 : 0, 
            scale: isExiting ? 0.95 : 1 
          }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          {/* Header */}
          <div className="border-b border-border px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-3.5 flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <NenyaLogo size={28} />
              <h1 className="text-base sm:text-lg md:text-xl">Terms of Use</h1>
            </div>
            <p className="text-xs text-muted-foreground text-center max-w-md px-2">
              Please scroll through and read the full terms below. Use the checkbox to agree and enter, or choose to disagree and exit.
            </p>
          </div>

          {/* Scrollable Content */}
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto scroll-container px-4 sm:px-5 md:px-6 py-3 sm:py-4 md:py-5 min-h-0 relative"
          >
            <div className="space-y-3 sm:space-y-4 text-foreground/90">
              <p className="text-center text-xs sm:text-sm">
                Welcome. Please read this before you begin.
              </p>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <h4 className="mb-1.5 sm:mb-2 text-xs sm:text-sm">1. What Nenya Is</h4>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    Nenya is an interactive digital environment designed as a tool for personal reflection and sensory exploration. It is best understood as a form of interactive art—a space to pause, breathe, and engage with your inner world through structured, sensory-based activities. It is a mirror for your own thoughts, not a source of answers.
                  </p>
                </div>
                
                <div>
                  <h4 className="mb-1.5 sm:mb-2 text-xs sm:text-sm">2. What Nenya Is Not</h4>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    Nenya is not a medical device, a therapeutic service, or a substitute for professional care. We make no claims, and offer no treatments, for any medical, psychological, or psychiatric condition. The tool is not designed to diagnose, treat, cure, or manage any illness or emotional distress. If you are experiencing a clinical mental health condition, please seek the support of a qualified human professional.
                  </p>
                </div>
                
                <div>
                  <h4 className="mb-1.5 sm:mb-2 text-xs sm:text-sm">3. Your Privacy & Data</h4>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    This environment is designed around the principle of ephemerality. The reflections you create here are for your personal use. By design, we do not track, record, or store your personal data, your sensory choices, or your reflections on our servers. Any outputs (like a sensory report) are generated on your device and belong to you. You are the sole curator of your experience.
                  </p>
                </div>
                
                <div>
                  <h4 className="mb-1.5 sm:mb-2 text-xs sm:text-sm">4. Your Responsibility</h4>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    By choosing to enter this space, you agree to use it for its intended purpose of personal reflection. You are responsible for your own well-being. If at any point you feel unsettled or overwhelmed, we encourage you to gently disengage and return to your physical surroundings. We invite you to be a gentle steward of your own journey.
                  </p>
                </div>
                
                <div>
                  <h4 className="mb-1.5 sm:mb-2 text-xs sm:text-sm">5. A Note on Crisis</h4>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    This artistic tool is not equipped, and its creators are not qualified, to support individuals in crisis. If you are feeling hopeless, considering harming yourself or others, or are otherwise in distress, please close this window and immediately connect with a human professional. You can reach the 988 Suicide & Crisis Lifeline in the US and Canada by calling or texting 988, or contact local emergency services in your area.
                  </p>
                </div>
                
                <div>
                  <h4 className="mb-1.5 sm:mb-2 text-xs sm:text-sm">6. Intellectual Property</h4>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    The Nenya environment, including its design, concepts, and underlying technology, is a copyrighted artistic work. The personal reflections and reports you generate are your own.
                  </p>
                </div>
              </div>
              
              <div className="border-l-4 border-primary/20 bg-muted/50 px-3 sm:px-4 py-2.5 sm:py-3 mt-4 sm:mt-6">
                <p className="italic text-xs sm:text-sm leading-relaxed">
                  By proceeding, you acknowledge that you have read, understood, and agree to these terms. Thank you for your presence here.
                </p>
              </div>

              {/* Scroll indicator */}
              {!hasScrolledToBottom && (
                <div className="text-center text-xs text-muted-foreground italic py-3 sm:py-4">
                  Please scroll to the bottom to continue
                </div>
              )}
            </div>
            
            {/* Animated scroll indicator */}
            <ScrollIndicator containerRef={scrollContainerRef} hideThreshold={50} />
          </div>

          {/* Footer with Agreement */}
          <div className="border-t border-border px-4 sm:px-5 md:px-6 py-3 sm:py-3 md:py-3.5 pb-4 sm:pb-3 md:pb-3.5 space-y-2.5 sm:space-y-3 flex-shrink-0 bg-background/50 backdrop-blur-sm" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms-agreement"
                onCheckedChange={handleCheckboxChange}
                disabled={!hasScrolledToBottom}
                className="mt-0.5 flex-shrink-0"
              />
              <Label 
                htmlFor="terms-agreement" 
                className={`text-xs sm:text-sm leading-relaxed cursor-pointer ${!hasScrolledToBottom ? 'opacity-50' : ''}`}
              >
                I have read and agree to the Nenya Terms of Use
              </Label>
            </div>
            
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Button
                size="lg"
                onClick={handleButtonClick}
                disabled={!hasScrolledToBottom || !hasCheckedBox}
                className="text-xs sm:text-sm min-h-[44px]"
              >
                I Agree — Enter Nenya
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  try {
                    window.close();
                  } catch (e) {}
                  window.location.replace('about:blank');
                }}
                className="text-xs sm:text-sm min-h-[44px]"
              >
                Disagree — Exit
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}