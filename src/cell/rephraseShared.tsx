// Small pieces shared by the rephrasing screens (docs/dyad-rephrase-scope.md). Theme tokens only (no new colours), every control
// at least 44 px high, text always in words.
import type { ReactNode } from 'react';
import type { CellClient } from '../lib/cellClient';
import type { RephraseController } from '../lib/rephraseController';

/** What every screen is given. */
export interface PanelCtx {
  ctl: RephraseController;
  client: CellClient | null;
  paused: boolean;
  /** Runs a send: shows nothing while it goes, says so plainly if it fails. */
  run: (fn: () => Promise<unknown>) => void;
  busy: boolean;
}

export const H = ({ id, children }: { id?: string; children: ReactNode }) => (
  <h3 id={id} className="text-base">
    {children}
  </h3>
);
export const Box = ({ children, quiet = false, label }: { children: ReactNode; quiet?: boolean; label?: string }) => (
  <div role={label ? 'group' : undefined} aria-label={label} className={`space-y-2 rounded-lg border-2 p-3 text-sm ${quiet ? 'border-dashed border-border' : 'border-border'}`}>
    {children}
  </div>
);
export const Quiet = ({ children }: { children: ReactNode }) => <p className="text-sm text-muted-foreground">{children}</p>;
export const Choices = ({ children }: { children: ReactNode }) => <div className="flex flex-wrap gap-2">{children}</div>;
