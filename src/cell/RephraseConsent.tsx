// The first-use screen and the hearer's three equal choices (docs/dyad-rephrase-scope.md, section 3, steps 0 and 3).
import { Button } from '../app/components/ui/button';
import { WORDS } from '../lib/rephraseWords';
import { Box, Choices, H, Quiet, type PanelCtx } from './rephraseShared';

export function FirstUse({ onUnderstood }: { onUnderstood: () => void }) {
  return (
    <section aria-labelledby="rp-first" className="space-y-3">
      <H id="rp-first">{WORDS.firstTitle}</H>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        {WORDS.firstPoints.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <Button onClick={onUnderstood}>{WORDS.understand}</Button>
    </section>
  );
}

/** A request has arrived: nothing has been shown, and the three answers have equal weight (none is the default). */
export function Deciding({ ctx }: { ctx: PanelCtx }) {
  const { ctl, run, busy } = ctx;
  return (
    <section aria-labelledby="rp-ask" className="space-y-3">
      <H id="rp-ask">{WORDS.arrivedAsk}</H>
      <Box>
        <p>{WORDS.arrivedAskBody}</p>
      </Box>
      <Choices>
        <Button variant="outline" disabled={busy} onClick={() => run(() => ctl.answer('yes'))}>{WORDS.yes}</Button>
        <Button variant="outline" disabled={busy} onClick={() => run(() => ctl.answer('notnow'))}>{WORDS.notNow}</Button>
        <Button variant="outline" disabled={busy} onClick={() => run(() => ctl.answer('never'))}>{WORDS.never}</Button>
      </Choices>
    </section>
  );
}

export function Waiting({ text }: { text: string }) {
  return <Quiet>{text}</Quiet>;
}
