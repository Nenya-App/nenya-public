// The speaker's side up to the phrase going out (docs/dyad-rephrase-scope.md, section 3, steps 1, 2, 4): drafting in private, the
// review of the request, the review of the phrase. Nothing here is sent until a button says so, and the writer's own private check
// runs over the words before the phrase goes (it informs; it never blocks and never tells the other person).
import { useState } from 'react';
import { Button } from '../app/components/ui/button';
import { MAX_PHRASE, MAX_REWRITE } from '../lib/rephraseProtocol';
import { NOTICES, WORDS } from '../lib/rephraseWords';
import MarkEditor from './MarkEditor';
import PrivateNotice from './PrivateNotice';
import { Box, Choices, H, Quiet, type PanelCtx } from './rephraseShared';

export function Draft({ ctx }: { ctx: PanelCtx }) {
  const { ctl, run, busy } = ctx;
  const [review, setReview] = useState(false);
  const d = ctl.drafts;
  const words = ctl.words();
  if (review)
    return (
      <section aria-labelledby="rp-rev" className="space-y-3">
        <H id="rp-rev">{WORDS.askReviewTitle}</H>
        <Box label="What will be sent">
          <p>{WORDS.askReviewBody}</p>
          <Quiet>{WORDS.askReviewNote}</Quiet>
        </Box>
        <Choices>
          <Button disabled={busy} onClick={() => { setReview(false); run(() => ctl.ask()); }}>{WORDS.sendRequest}</Button>
          <Button variant="outline" onClick={() => setReview(false)}>{WORDS.notAfterAll}</Button>
        </Choices>
      </section>
    );
  const blocked = ctl.state.asksBlocked;
  return (
    <section aria-labelledby="rp-draft" className="space-y-4">
      <H id="rp-draft">{WORDS.yourPhrase}</H>
      <Quiet>{WORDS.yourPhraseHelp}</Quiet>
      <label htmlFor="rp-phrase" className="block text-sm">{WORDS.phraseBox}</label>
      <textarea id="rp-phrase" className="min-h-24 w-full rounded-md border-2 border-border bg-background p-3 text-sm" maxLength={MAX_PHRASE} value={d.phrase} onChange={(e) => { d.phrase = e.target.value; ctl.touch(); }} />
      {words.length > 0 && <MarkEditor id="rp-speaker" words={words} marks={d.marks} hearer={false} onMark={(i, k) => ctl.mark('speaker', i, k)} />}
      <label htmlFor="rp-rewrite" className="block text-sm">{WORDS.rewriteLabel}</label>
      <Quiet>{WORDS.rewriteHelp}</Quiet>
      <textarea id="rp-rewrite" className="min-h-20 w-full rounded-md border-2 border-border bg-background p-3 text-sm" maxLength={MAX_REWRITE} value={d.rewrite} onChange={(e) => { d.rewrite = e.target.value; ctl.touch(); }} />
      {blocked && <p role="status" className="text-sm">{NOTICES['partner-never']}</p>}
      <Button disabled={busy || blocked || !d.phrase.trim()} onClick={() => setReview(true)}>{WORDS.askButton}</Button>
    </section>
  );
}

/** They said yes: the last look at exactly what will go. */
export function PhraseReview({ ctx }: { ctx: PanelCtx }) {
  const { ctl, run, busy } = ctx;
  const flag = ctl.precheck(ctl.pendingTexts('phrase'));
  return (
    <section aria-labelledby="rp-pr" className="space-y-3">
      <H id="rp-pr">{WORDS.phraseReviewTitle}</H>
      <Box label={WORDS.phraseReviewBody}>
        <b>{WORDS.phraseReviewBody}</b>
        <q className="block text-base">{ctl.drafts.phrase.trim()}</q>
        <Quiet>{WORDS.phraseReviewNote}</Quiet>
      </Box>
      {flag && <PrivateNotice flag={flag} />}
      <Choices>
        <Button disabled={busy} onClick={() => run(() => ctl.sendPhrase())}>{flag ? WORDS.sendAnyway : WORDS.sendPhrase}</Button>
        <Button variant="outline" disabled={busy} onClick={() => run(() => ctl.cancel())}>{flag ? WORDS.edit : WORDS.notAfterAll}</Button>
      </Choices>
    </section>
  );
}
