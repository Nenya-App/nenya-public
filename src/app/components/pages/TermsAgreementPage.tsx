import React, { useState } from 'react';
import { Button } from '../ui/button';
import NenyaLogo from '../NenyaLogo';
import { motion } from 'motion/react';
import { ScrollIndicator } from '../ScrollIndicator';
import { LegalDocumentBody } from '../LegalDocumentBody';
import { DownloadLegalPdfButton } from '../DownloadLegalPdfButton';
import { LEGAL_EFFECTIVE_DATE } from '../../../lib/legalDocument';

interface TermsAgreementPageProps {
  onAgree: () => void;
}

export default function TermsAgreementPage({ onAgree }: TermsAgreementPageProps) {
  const [isExiting, setIsExiting] = useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const handleAgree = () => {
    if (isExiting) return;
    setIsExiting(true);
    // Let the exit animation finish before moving on.
    setTimeout(onAgree, 800);
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
              <h1 className="text-base sm:text-lg md:text-xl">Terms of Use & Privacy Policy</h1>
            </div>
            <p className="text-xs text-muted-foreground text-center max-w-md px-2">
              Effective {LEGAL_EFFECTIVE_DATE}. Please read the terms below. Choosing “Agree” means you accept them.
            </p>
            <DownloadLegalPdfButton />
          </div>

          {/* Scrollable Content */}
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto scroll-container px-4 sm:px-5 md:px-6 py-3 sm:py-4 md:py-5 min-h-0 relative"
          >
            <LegalDocumentBody compact />

            {/* Animated scroll indicator */}
            <ScrollIndicator containerRef={scrollContainerRef} hideThreshold={50} />
          </div>

          {/* Footer with Agreement */}
          <div className="border-t border-border px-4 sm:px-5 md:px-6 py-3 sm:py-3 md:py-3.5 pb-4 sm:pb-3 md:pb-3.5 space-y-2.5 sm:space-y-3 flex-shrink-0 bg-background/50 backdrop-blur-sm" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Button
                size="lg"
                onClick={handleAgree}
                className="text-xs sm:text-sm min-h-[44px]"
              >
                Agree, Enter
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
                Disagree, Exit
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}