import { useState } from 'react';
import { Button } from '../app/components/ui/button';
import { Textarea } from '../app/components/ui/textarea';
import { failureDetails, failureLine, type FailureInfo } from '../lib/coachErrors';
import { submitReport } from '../lib/reportSubmission';

// Shown when a turn fails: what happened in plain words, the codes behind it, and a way to report it that sends only
// those codes (and anything the person chooses to add), never their message.
export function FailureNotice({ info, turn }: { info: FailureInfo; turn: number }) {
  const [comments, setComments] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [copied, setCopied] = useState(false);
  const details = failureDetails(info, turn);

  const send = async () => {
    setState('sending');
    try {
      await submitReport({ type: 'error-report', report: details, comments });
      setState('sent');
    } catch {
      setState('error');
    }
  };

  return (
    <div role="alert" className="space-y-2 rounded-lg border border-destructive/50 p-3 text-sm">
      <p>{info.message} Nothing you wrote was lost. You can try again, or go back to the breathing tool.</p>
      <p className="select-all break-words font-mono text-xs text-muted-foreground">{failureLine(info)}</p>
      <details className="text-xs">
        <summary className="cursor-pointer underline underline-offset-2">Report this failure</summary>
        <div className="space-y-2 pt-2">
          <p className="text-muted-foreground">
            This sends only the technical details above, plus anything you add below. It does not send what you wrote or
            what the coach said.
          </p>
          <Textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            maxLength={500}
            rows={2}
            aria-label="Anything you want to add (optional)"
            placeholder="Anything you want to add (optional). Please leave out names and personal details."
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" size="sm" disabled={state === 'sending' || state === 'sent'} onClick={send}>
              {state === 'sending' ? 'Sending…' : 'Send report'}
            </Button>
            <button
              type="button"
              className="underline underline-offset-2"
              onClick={() => {
                navigator.clipboard?.writeText(details).then(() => setCopied(true), () => setCopied(false));
              }}
            >
              {copied ? 'Copied' : 'Copy details'}
            </button>
          </div>
          <p role="status" className="text-muted-foreground">
            {state === 'sent' && 'Sent. Thank you.'}
            {state === 'error' && 'The report could not be sent. You can copy the details and email them to info@nenya.biz.'}
          </p>
        </div>
      </details>
    </div>
  );
}
