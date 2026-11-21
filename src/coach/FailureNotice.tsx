import { useState } from 'react';
import { AlreadySent, DeletionCode } from '../app/components/DeletionCode';
import { SendConsent } from '../app/components/SendConsent';
import { useSendFlow } from '../app/components/useSendFlow';
import { Button } from '../app/components/ui/button';
import { Textarea } from '../app/components/ui/textarea';
import { failureDetails, failureLine, type FailureInfo } from '../lib/coachErrors';

// Shown when a turn fails: what happened in plain words, the codes behind it, and a way to report it that sends only
// those codes (and anything the person chooses to add), never their message.
export function FailureNotice({ info, turn }: { info: FailureInfo; turn: number }) {
  const [comments, setComments] = useState('');
  const flow = useSendFlow('error-report', () => setComments('')); // the typed text is cleared once it is sent
  const { phase: state, receipt } = flow;
  const [copied, setCopied] = useState(false);
  const details = failureDetails(info, turn);

  const send = () => {
    if (state === 'sending' || state === 'sent') return;
    void flow.begin(details, comments); // opens the consent screen; nothing is sent yet
  };

  return (
    <div role="alert" className="space-y-2 rounded-lg border border-destructive/50 p-3 text-sm">
      <p>{info.message} Nothing you wrote was lost. You can try again, or go back to the breathing tool.</p>
      <p className="select-all break-words font-mono text-xs text-muted-foreground">{failureLine(info)}</p>
      <details className="text-xs">
        <summary className="cursor-pointer underline underline-offset-2">Report this failure</summary>
        <div className="space-y-2 pt-2">
          <p className="text-muted-foreground">
            This can send only the technical details above, plus anything you add below. It does not send what you wrote or
            what the coach said. You will see exactly what would be sent, and can decide, before anything leaves your device.
          </p>
          <Textarea
            value={comments}
            onChange={(e) => {
              setComments(e.target.value);
              if (state === 'duplicate') flow.reset();
              else if (state === 'error') flow.cancel();
            }}
            readOnly={state === 'consent' || state === 'sending'}
            maxLength={500}
            rows={2}
            aria-label="Anything you want to add (optional)"
            placeholder="Anything you want to add (optional). Please leave out names and personal details."
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" size="sm" disabled={state !== 'idle' && state !== 'duplicate'} onClick={send}>
              Review and send
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
          </p>
          {(state === 'consent' || state === 'sending' || state === 'error') && flow.pending && (
            <SendConsent kind="report" parts={[{ label: 'The details', text: flow.pending.report }, { label: 'What you added', text: flow.pending.comments }]} busy={state === 'sending'} failed={state === 'error'} onSend={flow.confirm} onCancel={flow.cancel} />
          )}
          {state === 'duplicate' && <AlreadySent fromCoach />}
          {state === 'sent' && <DeletionCode receipt={receipt} fromCoach />}
        </div>
      </details>
    </div>
  );
}
