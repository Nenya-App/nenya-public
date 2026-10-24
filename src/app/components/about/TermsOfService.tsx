import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { ReturnToTop } from '../ReturnToTop';
import { AppFooter } from '../AppFooter';
import { LegalDocumentBody } from '../LegalDocumentBody';
import { DownloadLegalPdfButton } from '../DownloadLegalPdfButton';
import { LEGAL_EFFECTIVE_DATE } from '../../../lib/legalDocument';

interface TermsOfServiceProps {
  onBack: () => void;
}

export default function TermsOfService({ onBack }: TermsOfServiceProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div ref={scrollContainerRef} className="size-full overflow-auto scroll-container bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border px-6 py-4 sticky top-0 bg-background z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="shrink-0"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h1>Terms of Use & Privacy Policy</h1>
      </div>

      {/* Content */}
      <div className="w-full">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <section>
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2>Nenya Terms of Use & Privacy Policy</h2>
              <DownloadLegalPdfButton />
            </div>
            <p className="mb-6 text-sm text-muted-foreground">Effective {LEGAL_EFFECTIVE_DATE}</p>
            <LegalDocumentBody />
          </section>

          <ReturnToTop onClick={scrollToTop} />
        </div>
      </div>

      <AppFooter />
    </div>
  );
}