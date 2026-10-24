import React from 'react';
import { LEGAL_INTRO, LEGAL_CLOSING, LEGAL_PARTS } from '../../lib/legalDocument';

// Turns bare URLs and the contact email into links; everything else stays text.
const LINK_PATTERN = /(https?:\/\/[^\s)]+[^\s).,]|github\.com\/[^\s)]+[^\s).,]|netlify\.com\/privacy|info@nenya\.biz)/g;

function linkify(text: string): React.ReactNode[] {
  return text.split(LINK_PATTERN).map((part, i) => {
    if (i % 2 === 0) return part;
    const href = part.includes('@') ? `mailto:${part}` : part.startsWith('http') ? part : `https://${part}`;
    return (
      <a
        key={i}
        href={href}
        target={part.includes('@') ? undefined : '_blank'}
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-foreground transition-colors break-words"
      >
        {part}
      </a>
    );
  });
}

interface LegalDocumentBodyProps {
  compact?: boolean;
}

export function LegalDocumentBody({ compact = false }: LegalDocumentBodyProps) {
  const text = compact ? 'text-xs sm:text-sm leading-relaxed' : 'leading-relaxed';
  const headingSize = compact ? 'text-xs sm:text-sm' : '';
  const gap = compact ? 'space-y-3 sm:space-y-4' : 'space-y-6';

  return (
    <div className={`${gap} text-foreground/90`}>
      <p className={`text-center ${compact ? 'text-xs sm:text-sm' : ''}`}>{LEGAL_INTRO}</p>

      {LEGAL_PARTS.map((part) => (
        <div key={part.title} className={gap}>
          <h3 className={`pt-2 ${compact ? 'text-sm sm:text-base' : ''}`}>{part.title}</h3>
          {part.sections.map((section) => (
            <div key={section.number} className="space-y-1.5">
              <h4 className={headingSize}>
                {section.number}. {section.heading}
              </h4>
              {section.paragraphs.map((p, i) => (
                <p key={i} className={text}>
                  {linkify(p)}
                </p>
              ))}
              {section.bullets && (
                <ul className={`list-disc pl-5 space-y-1 ${text}`}>
                  {section.bullets.map((b, i) => (
                    <li key={i}>{linkify(b)}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ))}

      <div className="border-l-4 border-primary/20 bg-muted/50 px-3 sm:px-4 py-2.5 sm:py-3 mt-4 sm:mt-6">
        <p className={`italic ${text}`}>{LEGAL_CLOSING}</p>
      </div>
    </div>
  );
}
