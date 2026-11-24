import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { SAFETY_CARD_FOOTER, SAFETY_CARD_INTRO, SAFETY_CARD_TITLE, safetyCardSections } from '../../lib/safetyFeaturesCard';
import { saveReflectionOn } from '../../lib/savedReflection';

// The safety features card: a collapsed card under the help lines of a safety notice about abuse (src/lib/safetyCardRule.ts says when).
// Pre-written site text (src/lib/safetyFeaturesCard.ts); the model never writes or changes it, and nothing here reads what the visitor typed.
// Built like the settings cards: the heading holds a real button (aria-expanded, aria-controls), the body is a region named by it and is hidden with the
// `hidden` attribute while closed. No animation: the arrow turns at once, so Stop motion and reduced motion have nothing to switch off. The focus outline
// is the site's own (:focus-visible, 3px). The text uses the full foreground color for contrast (AAA).
export function SafetyFeaturesCard({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const headingId = `${id}-heading`;
  const bodyId = `${id}-body`;
  const sections = safetyCardSections(saveReflectionOn());

  return (
    <div data-safety-card className={`rounded-lg border border-border bg-card ${className}`}>
      <h3 className="m-0 text-sm font-medium">
        <button
          type="button"
          id={headingId}
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-foreground underline underline-offset-4 [touch-action:manipulation]"
        >
          <span>{SAFETY_CARD_TITLE}</span>
          <ChevronDown aria-hidden="true" className={`size-4 shrink-0 ${open ? 'rotate-180' : ''}`} />
        </button>
      </h3>
      <div id={bodyId} role="region" aria-labelledby={headingId} hidden={!open} className="space-y-4 border-t border-border p-3 text-sm leading-relaxed text-foreground">
        <p>{SAFETY_CARD_INTRO}</p>
        {sections.map((s) => (
          <div key={s.heading} className="space-y-2">
            {s.heading && <h4 className="m-0 text-sm font-semibold">{s.heading}</h4>}
            {s.parts.map((p, i) => (
              <div key={i} className="space-y-1">
                {p.text !== undefined ? (
                  <p>
                    {p.label && <strong className="font-semibold">{p.label} </strong>}
                    {p.text}
                  </p>
                ) : (
                  <>
                    {p.label && <p className="font-semibold">{p.label}</p>}
                    <ul className="list-disc space-y-1 pl-5">
                      {(p.bullets ?? []).map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ))}
          </div>
        ))}
        <p className="italic">{SAFETY_CARD_FOOTER}</p>
      </div>
    </div>
  );
}
