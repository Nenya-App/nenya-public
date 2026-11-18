import type { ReactNode } from 'react';
import { Button } from './ui/button';

// Pieces every lens card shares in the tray (VITE_LENS_TRAY; docs/lens-rebuild-audit.md section 4, docs/wireframes/lens/).

/** The line every lens opens with. */
export const FEWER_LINE = 'Choosing fewer can be more helpful than choosing many.';
export const FewerNote = () => <p className="text-sm text-muted-foreground" data-fewer-note>{FEWER_LINE}</p>;

/** Optional words, sliders and extras tucked away, closed until asked for. */
export const MoreDescriptions = ({ children, label = 'More descriptions' }: { children: ReactNode; label?: string }) => (
  <details className="rounded-md border border-border p-3">
    <summary className="cursor-pointer text-sm">{label}</summary>
    <div className="mt-3 space-y-4">{children}</div>
  </details>
);

/** The soft limit: shown before a fourth choice, never a block. */
export function FewerWarning({ onAdd, onKeep }: { onAdd: () => void; onKeep: () => void }) {
  return (
    <div role="alert" className="rounded-md border border-border bg-muted p-3 space-y-2" data-fewer-warning>
      <p className="text-sm"><strong>Fewer can be more helpful.</strong> You have chosen three. Add a fourth anyway?</p>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onAdd}>Add it anyway</Button>
        <Button size="sm" variant="outline" onClick={onKeep}>Keep three</Button>
      </div>
    </div>
  );
}

/** The end of a lens card: add (or update) and put down. Putting down adds nothing; the lens stays "examined". */
export function AddToReport({ added, onAdd, onPutDown, name }: { added: boolean; onAdd: () => void; onPutDown: () => void; name: string }) {
  return (
    <div className="flex flex-wrap justify-center gap-3 pt-4">
      <Button size="lg" onClick={onAdd} className="px-8">{added ? 'Update my report' : 'Add this to my report'}</Button>
      <Button size="lg" variant="outline" onClick={onPutDown} aria-label={`Put ${name} down without adding it`}>Put this down</Button>
    </div>
  );
}
