import { useMemo } from 'react';
import { manyNeedsSoFar, tallyOf, type TallyEntry } from '../lib/conversationTally';
import { NEED_FOCUS_SUMMARY } from '../lib/needFocus';
import { NEED_TALLY_UI } from '../lib/needTallyView';
import { SUMMARY_CREDIT, SUMMARY_CREDIT_LINK } from '../lib/summaryWords';
import { ExternalLink } from '../app/components/ExternalLink';

// The running tally (VITE_NEED_TALLY): a quiet, optional, closed-by-default control that shows the feelings and needs the person has named in their own messages so far. Computed here from
// the messages the page already holds, on every render: never stored (no localStorage, sessionStorage or cookie), never sent, gone with the tab. Hidden when nothing has come up. The changes
// are announced politely and never move focus. At four or more different needs it adds the site's one recommendation sentence.
const list = (es: TallyEntry[]) => es.map((e) => (e.count > 1 ? `${e.word} (${e.count})` : e.word)).join(', ');

export function NeedTally({ userTexts }: { userTexts: readonly string[] }) {
  const tally = useMemo(() => tallyOf(userTexts), [userTexts.join('\u0000')]);
  if (tally.feelings.length === 0 && tally.needs.length === 0) return null;
  return (
    <details className="rounded-2xl border border-border bg-card/50 px-4 py-3 text-sm">
      <summary className="min-h-11 cursor-pointer py-2 text-muted-foreground">{NEED_TALLY_UI.label}</summary>
      <div aria-live="polite" className="space-y-2 pt-1">
        {tally.feelings.length > 0 && <p><strong>{NEED_TALLY_UI.feelings}:</strong> {list(tally.feelings)}</p>}
        {tally.needs.length > 0 && <p><strong>{NEED_TALLY_UI.needs}:</strong> {list(tally.needs)}</p>}
        {manyNeedsSoFar(tally) && <p>{NEED_FOCUS_SUMMARY}</p>}
        <p className="text-xs text-muted-foreground">{NEED_TALLY_UI.note}</p>
        <p className="text-xs text-muted-foreground">
          {SUMMARY_CREDIT} <ExternalLink href={SUMMARY_CREDIT_LINK} className="underline underline-offset-4">Feelings and Needs Inventory</ExternalLink>
        </p>
      </div>
    </details>
  );
}
