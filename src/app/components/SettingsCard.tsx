import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

// A collapsible card in the breathing and accessibility panel. The heading holds a real button (aria-expanded, aria-controls); the body is a region named by the heading.
// The body is hidden with the `hidden` attribute, so what is inside keeps its state while closed. No animation: the arrow turns at once, so reduced motion has nothing to switch off.
export function SettingsCard({ id, title, status, open, onToggle, children }: { id: string; title: string; /** Words shown beside the title (for example "Motion stopped"), part of the button's name. */ status?: string; open: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-border">
      <h4 className="m-0 text-sm font-medium">
        <button
          type="button"
          id={`${id}-heading`}
          aria-expanded={open}
          aria-controls={`${id}-body`}
          onClick={onToggle}
          className="flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-foreground [touch-action:manipulation]"
        >
          <span>{title}{status ? <span className="ml-2 text-xs font-normal text-muted-foreground">{status}</span> : null}</span>
          <ChevronDown aria-hidden="true" className={`size-4 shrink-0 ${open ? 'rotate-180' : ''}`} />
        </button>
      </h4>
      <div id={`${id}-body`} role="region" aria-labelledby={`${id}-heading`} hidden={!open} className="space-y-4 border-t border-border p-3">
        {children}
      </div>
    </section>
  );
}
