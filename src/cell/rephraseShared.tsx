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

// Reporting what the other person sent (docs/dyad-rephrase-scope.md, section 6): says exactly what will be revealed, and sends
// nothing until the person confirms. Uses the cell's own report route, so the message must be the one that arrived.
import { useState } from 'react';
import { Button } from '../app/components/ui/button';
import type { RephraseKind } from '../lib/rephraseProtocol';
import { WORDS } from '../lib/rephraseWords';

export function ReportBox({ ctx, kind }: { ctx: PanelCtx; kind: RephraseKind }) {
  const [phase, setPhase] = useState<'idle' | 'asking' | 'sending' | 'done' | 'failed'>('idle');
  const m = ctx.ctl.received[kind];
  if (!m || !ctx.client) return null;
  if (phase === 'done') return <p role="status" className="text-sm text-muted-foreground">{WORDS.reportDone}</p>;
  if (phase === 'idle' || phase === 'failed')
    return (
      <div>
        {phase === 'failed' && <p role="alert" className="text-sm">{WORDS.reportFailed}</p>}
        <button type="button" className="min-h-11 text-sm text-muted-foreground underline underline-offset-4" onClick={() => setPhase('asking')}>{WORDS.report}</button>
      </div>
    );
  return (
    <Box label={WORDS.report}>
      <p>{WORDS.reportExplain}</p>
      <Choices>
        <Button
          disabled={phase === 'sending'}
          onClick={() => {
            setPhase('sending');
            ctx.client!.report(m).then(() => setPhase('done'), () => setPhase('failed'));
          }}
        >
          {WORDS.reportConfirm}
        </Button>
        <Button variant="outline" onClick={() => setPhase('idle')}>{WORDS.reportCancel}</Button>
      </Choices>
    </Box>
  );
}
