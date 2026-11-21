import { useRef, useState } from 'react';
import { Button } from '../app/components/ui/button';
import { SUMMARY_CREDIT, SUMMARY_CREDIT_LINK, SUMMARY_UI, readSummaryAnswer, summaryRequestBody, type SummaryOutcome, type SummaryRequestInput } from '../lib/summaryRequest';
import { ExternalLink } from '../app/components/ExternalLink';

// The "Request a summary" button and the summary block (docs/request-a-summary-scope.md, step 3; VITE_SUMMARY_REQUEST). Shown by the page only after the five exchanges and the closing
// note, on a conversation that was not flagged. Never runs by itself. Order for a screen reader: the closing, the button, then the block. One summary per conversation: once there is one
// the button is gone and no second request is offered. Nothing is stored here; the page keeps {text, proof} and sends them with the signed transcript only if the person asks for it there.
const ENDPOINT = '/api/coach';

export function SummaryRequest({ input, headers, onSummary }: { input: SummaryRequestInput; headers?: Record<string, string>; onSummary: (s: { text: string; proof: string } | null) => void }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [outcome, setOutcome] = useState<SummaryOutcome | null>(null);
  const busy = useRef(false);

  const request = async () => {
    if (busy.current || state === 'done') return;
    busy.current = true;
    setState('loading');
    let result: SummaryOutcome;
    try {
      const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(headers ?? {}) }, body: JSON.stringify(summaryRequestBody(input)) });
      let body: unknown = null;
      try { body = await res.json(); } catch { /* a plain-text answer */ }
      result = readSummaryAnswer(res.status, body);
    } catch {
      result = { kind: 'error', text: SUMMARY_UI.error };
    }
    busy.current = false;
    setOutcome(result);
    if (result.kind === 'ok') { onSummary({ text: result.text, proof: result.proof }); setState('done'); }
    // A refusal or a failure is shown in words; for a failure or an error the person may try once more, for the others the sentence is final.
    else setState(result.kind === 'flagged' || result.kind === 'cap' || result.kind === 'off' ? 'done' : 'idle');
  };

  // The server's switch is off: show nothing at all.
  if (outcome?.kind === 'off') return null;

  return (
    <section aria-label="Request a summary" className="space-y-3">
      {state !== 'done' && (
        <div className="space-y-2">
          <Button type="button" variant="outline" onClick={request} disabled={state === 'loading'} aria-describedby="summary-note" className="min-h-11">
            {SUMMARY_UI.button}
          </Button>
          <p id="summary-note" className="text-xs text-muted-foreground">{SUMMARY_UI.buttonNote}</p>
        </div>
      )}
      {/* Polite, so it is read once without interrupting. */}
      <p role="status" aria-live="polite" className="text-sm text-muted-foreground">{state === 'loading' ? SUMMARY_UI.loading : ''}</p>
      {outcome && outcome.kind !== 'ok' && (
        <p role="status" className="whitespace-pre-wrap rounded-xl border border-border bg-card/50 p-3 text-sm">{outcome.text}</p>
      )}
      {outcome?.kind === 'ok' && (
        <section aria-labelledby="summary-title" className="space-y-2 rounded-2xl border border-border bg-card p-4">
          <h2 id="summary-title" className="text-base">{SUMMARY_UI.label}</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{outcome.summary}</p>
          <p className="text-xs text-muted-foreground">{SUMMARY_UI.note}</p>
          {outcome.credit && (
            <p className="text-xs text-muted-foreground">
              {SUMMARY_CREDIT} <ExternalLink href={SUMMARY_CREDIT_LINK} className="underline underline-offset-4">Feelings and Needs Inventory</ExternalLink>
            </p>
          )}
        </section>
      )}
    </section>
  );
}
