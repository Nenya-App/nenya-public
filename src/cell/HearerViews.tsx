// The hearer's side (docs/dyad-rephrase-scope.md, section 3, steps 5 and 6): the phrase, marking what they hear in it, and the
// choice of what to send back (send, keep, skip: equal buttons, none preselected). Their marks stay on this device unless they
// choose to send them; stories are left out unless they tick for them.
import { useState } from 'react';
import { Button } from '../app/components/ui/button';
import { compare, sectionLine } from '../lib/rephraseCompare';
import { MAX_NOTE } from '../lib/rephraseProtocol';
import { WORDS } from '../lib/rephraseWords';
import MarkEditor from './MarkEditor';
import PrivateNotice from './PrivateNotice';
import { Box, Choices, H, Quiet, ReportBox, type PanelCtx } from './rephraseShared';

export function Hearing({ ctx }: { ctx: PanelCtx }) {
  const { ctl, run, busy } = ctx;
  const [reviewing, setReviewing] = useState(false);
  const d = ctl.drafts;
  const phrase = ctl.state.round?.phrase ?? '';
  const words = phrase.split(/\s+/).filter(Boolean);
  if (!reviewing)
    return (
      <section aria-labelledby="rp-hear" className="space-y-3">
        <H id="rp-hear">{WORDS.hearTitle}</H>
        <Box label={WORDS.hearTitle}><q className="block text-base">{phrase}</q></Box>
        <Quiet>{WORDS.hearHelp}</Quiet>
        <MarkEditor id="rp-hearer" words={words} marks={d.heardMarks} hearer onMark={(i, k) => ctl.mark('hearer', i, k)} />
        <label htmlFor="rp-note" className="block text-sm">{WORDS.noteLabel}</label>
        <textarea id="rp-note" className="min-h-16 w-full rounded-md border-2 border-border bg-background p-3 text-sm" maxLength={MAX_NOTE} value={d.note} onChange={(e) => { d.note = e.target.value; ctl.touch(); }} />
        <Choices>
          <Button onClick={() => setReviewing(true)}>{WORDS.reviewSend}</Button>
          <Button variant="outline" disabled={busy} onClick={() => run(() => ctl.sendHeard('skip'))}>{WORDS.skipMarks}</Button>
        </Choices>
        <ReportBox ctx={ctx} kind="rp-phrase" />
      </section>
    );
  const own = ctl.marksOf('hearer');
  const flag = ctl.precheck(ctl.pendingTexts('heard'));
  const hasStory = own.some((m) => m[2] === 'story');
  const sections = compare(phrase, own, null, 'hearer').speaker;
  return (
    <section aria-labelledby="rp-ret" className="space-y-3">
      <H id="rp-ret">{WORDS.returnTitle}</H>
      <Box label={WORDS.returnMarks}>
        <b>{WORDS.returnMarks}</b>
        {sections.length ? <ul className="list-disc pl-5">{sections.map((s) => <li key={s.kind}>{sectionLine(s, true)}</li>)}</ul> : <Quiet>{WORDS.nothingMarked}</Quiet>}
        {d.note.trim() && <p>{d.note.trim()}</p>}
      </Box>
      {hasStory && (
        <label className="flex min-h-11 items-center gap-3 text-sm">
          <input type="checkbox" className="size-6" checked={d.includeStories} onChange={(e) => { d.includeStories = e.target.checked; ctl.touch(); }} />
          <span>{WORDS.storiesBox}<span className="block text-xs text-muted-foreground">{WORDS.storiesHelp}</span></span>
        </label>
      )}
      {flag && <PrivateNotice flag={flag} />}
      <Choices>
        <Button variant="outline" disabled={busy} onClick={() => run(() => ctl.sendHeard('send'))}>{WORDS.sendMarks}</Button>
        <Button variant="outline" disabled={busy} onClick={() => run(() => ctl.sendHeard('keep'))}>{WORDS.keepMarks}</Button>
        <Button variant="outline" disabled={busy} onClick={() => run(() => ctl.sendHeard('skip'))}>{WORDS.skipMarks}</Button>
        <Button variant="ghost" onClick={() => setReviewing(false)}>{WORDS.edit}</Button>
      </Choices>
    </section>
  );
}

/** They have sent their reading (or kept it, or skipped): waiting for the speaker's own reveal. */
export function Returned({ ctx }: { ctx: PanelCtx }) {
  const r = ctx.ctl.state.round!;
  const mode = r.heard?.mode;
  return (
    <section aria-labelledby="rp-rtd" className="space-y-3">
      <H id="rp-rtd">{WORDS.waitingTitle}</H>
      <Quiet>{mode === 'send' ? WORDS.returned : mode === 'keep' ? WORDS.returnedKeep : WORDS.returnedSkip}</Quiet>
      <p role="status" className="text-sm">{WORDS.waitingMeant}</p>
    </section>
  );
}
