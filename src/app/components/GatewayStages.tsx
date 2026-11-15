import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

// The Present and Wish states of a gateway are filled in one after the other, not side by side: both are still completed,
// with the same fields as before, but a person sees one set of questions at a time. The hidden one keeps what was entered.
export type PairStage = 'present' | 'wish';

/** One of the two states. The other stays in the page (hidden) so nothing entered is lost when going back and forth. */
export function StageSlot({ stage, current, children }: { stage: PairStage; current: PairStage; children: ReactNode }) {
  return <div hidden={stage !== current}>{children}</div>;
}

/** Says which of the two states this is, so the person knows where they are inside the gateway. */
export function StageIntro({ stage }: { stage: PairStage }) {
  return (
    <p className="mb-4 text-center text-sm text-muted-foreground" aria-live="polite">
      {stage === 'present' ? 'Step 1 of 2: where you are now' : 'Step 2 of 2: how you wish to be'}
    </p>
  );
}

/** Moves between the two states. On the first it offers to continue; on the second, to go back (the gateway's own next button then shows). */
export function StageNav({ stage, onChange }: { stage: PairStage; onChange: (s: PairStage) => void }) {
  return (
    <div className="flex justify-center pt-6">
      {stage === 'present' ? (
        <Button size="lg" onClick={() => onChange('wish')} className="gap-2 px-10">
          Continue to Wish state <ArrowRight className="size-4" />
        </Button>
      ) : (
        <Button variant="ghost" onClick={() => onChange('present')} className="gap-2">
          <ArrowLeft className="size-4" /> Back to Present state
        </Button>
      )}
    </div>
  );
}
