// The reveal and the two readings (docs/dyad-rephrase-scope.md, sections 3 and 4). The speaker chooses when to show what they
// meant; only then do both devices show both readings. Plain statements per marked word; no counts, no ranking, nothing said about
// unmarked words, and "Neither is the right one." as the only remark.
import { useState } from 'react';
import { Button } from '../app/components/ui/button';
import { compare, sectionLine, type Viewer } from '../lib/rephraseCompare';
import { readings } from '../lib/rephraseRound';
import { WORDS } from '../lib/rephraseWords';
import { CreditLines, MarkedWord } from './MarkEditor';
import PrivateNotice from './PrivateNotice';
import { Box, Choices, H, Quiet, ReportBox, type PanelCtx } from './rephraseShared';

/** The speaker has the hearer's answer; showing what they meant is theirs to choose. */
export function Answered({ ctx }: { ctx: PanelCtx }) {
  const { ctl, run, busy } = ctx;
  const [later, setLater] = useState(false);
  const mode = ctl.state.round?.heard?.mode;
  const flag = ctl.precheck(ctl.pendingTexts('meant'));
  return (
    <section aria-labelledby="rp-ans" className="space-y-3">
      <H id="rp-ans">{WORDS.answeredTitle}</H>
      <Quiet>{later ? WORDS.revealLater : mode === 'send' ? WORDS.answeredSent : mode === 'keep' ? WORDS.answeredKept : WORDS.answeredSkipped}</Quiet>
      <Box label={WORDS.revealBox}>
        <b>{WORDS.revealBox}</b>
        <p>{WORDS.revealBoxBody}</p>
        {ctl.drafts.rewrite.trim() && <q className="block">{ctl.drafts.rewrite.trim()}</q>}
      </Box>
      {flag && <PrivateNotice flag={flag} />}
      <Choices>
        <Button disabled={busy} onClick={() => run(() => ctl.reveal())}>{flag ? WORDS.sendAnyway : WORDS.reveal}</Button>
        {!later && <Button variant="outline" onClick={() => setLater(true)}>{WORDS.notNow}</Button>}
      </Choices>
      <ReportBox ctx={ctx} kind="rp-heard" />
    </section>
  );
}

function Reading({ viewer, ctx }: { viewer: Viewer; ctx: PanelCtx }) {
  const { ctl } = ctx;
  const r = readings(ctl.state);
  if (!r) return null;
  const c = compare(r.phrase, r.meant.marks, r.heard, viewer);
  const meantHead = viewer === 'speaker' ? 'What I meant' : 'What they meant';
  const heardHead = viewer === 'hearer' ? 'What I heard' : 'What they heard';
  const mode = ctl.state.round?.heard?.mode;
  const id = `rp-cmp-${viewer}`;
  return (
    <div className="space-y-4">
      <H>{WORDS.compareTitle}</H>
      <Quiet>{WORDS.compareHint}</Quiet>
      <ol className="m-0 flex list-none flex-wrap gap-1 p-0" aria-label="The phrase, as the speaker marked it">
        {c.words.map((w, i) => (
          <li key={i}><MarkedWord word={w} kind={c.speaker.length ? r.meant.marks.find((m) => i >= m[0] && i <= m[1])?.[2] : undefined} hearer={false} /></li>
        ))}
      </ol>
      <section aria-labelledby={`${id}-1`} className="space-y-1">
        <h4 id={`${id}-1`} className="text-sm font-bold">{meantHead}</h4>
        {c.speaker.length ? <ul className="list-disc pl-5 text-sm">{c.speaker.map((s) => <li key={s.kind}>{sectionLine(s, false)}</li>)}</ul> : <Quiet>{WORDS.nothingMarked}</Quiet>}
      </section>
      <section aria-labelledby={`${id}-2`} className="space-y-1">
        <h4 id={`${id}-2`} className="text-sm font-bold">{heardHead}</h4>
        {c.hearer ? (c.hearer.length ? <ul className="list-disc pl-5 text-sm">{c.hearer.map((s) => <li key={s.kind}>{sectionLine(s, true)}</li>)}</ul> : <Quiet>{WORDS.nothingMarked}</Quiet>) : <Quiet>{mode === 'skip' ? WORDS.skippedOwn : WORDS.keptOwn}</Quiet>}
      </section>
      {c.rows && (
        <section aria-labelledby={`${id}-3`} className="space-y-1">
          <h4 id={`${id}-3`} className="text-sm font-bold">{WORDS.wordByWord}</h4>
          {c.rows.length ? <ul className="space-y-1 text-sm">{c.rows.map((row) => <li key={row.index}><b>{row.word}</b>: {row.text}</li>)}</ul> : <Quiet>{WORDS.noWordsMarked}</Quiet>}
        </section>
      )}
      {r.note && <p className="text-sm"><b>{WORDS.theirNote}:</b> {r.note}</p>}
      {r.meant.rewrite && <Box label={viewer === 'speaker' ? WORDS.yourRewrite : WORDS.theirRewrite}><b>{viewer === 'speaker' ? WORDS.yourRewrite : WORDS.theirRewrite}</b><q className="block text-base">{r.meant.rewrite}</q></Box>}
      {r.meant.sliders && r.meant.sliders.length > 0 && <ul className="list-disc pl-5 text-sm">{r.meant.sliders.map((s) => <li key={s.need}>{s.need}: {['met', 'mostly met', 'partly met', 'mostly not met', 'not met'][s.level]}</li>)}</ul>}
      <CreditLines />
    </div>
  );
}

export function Compared({ ctx, viewer }: { ctx: PanelCtx; viewer: Viewer }) {
  const { ctl, run, busy } = ctx;
  return (
    <section aria-label={WORDS.compareTitle} className="space-y-3">
      <Reading viewer={viewer} ctx={ctx} />
      <Choices><Button disabled={busy} onClick={() => run(() => ctl.done())}>{WORDS.doneButton}</Button></Choices>
      <ReportBox ctx={ctx} kind={viewer === 'hearer' ? 'rp-meant' : 'rp-heard'} />
    </section>
  );
}
