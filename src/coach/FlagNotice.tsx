import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../app/components/ui/button';
import { Textarea } from '../app/components/ui/textarea';
import { noticeIntro, resourcesFor, type SafetyFlag } from '../lib/safetyFlags';
import { submitReport } from '../lib/reportSubmission';

interface FlagNoticeProps {
  flag: SafetyFlag;
  /** The message that was flagged. Only ever sent if the visitor chooses to include it. */
  flaggedMessage: string;
}

type ReportState = 'closed' | 'open' | 'sending' | 'sent' | 'error';

// What the visitor sees when a message is flagged: the notice, resources they can
// tap, and an optional way to tell us the notice was wrong. Nothing is sent
// anywhere unless they press Send on the report.
export function FlagNotice({ flag, flaggedMessage }: FlagNoticeProps) {
  const [state, setState] = useState<ReportState>('closed');
  const [comment, setComment] = useState('');
  const [includeMessage, setIncludeMessage] = useState(false);

  const reportText = [
    'Coach demo: flag report',
    `Notice shown: ${flag.label} (${flag.tier})`,
    `Comment: ${comment.trim() || '(none)'}`,
    `Flagged message: ${includeMessage ? flaggedMessage : '(not included)'}`,
  ].join('\n');

  const send = async () => {
    if (state === 'sending') return;
    setState('sending');
    try {
      await submitReport({ type: 'error-report', report: reportText });
      setState('sent');
    } catch {
      setState('error');
    }
  };

  const stop = flag.tier === 'stop';

  return (
    <section
      role="alert"
      aria-label="Safety notice"
      className={`space-y-4 rounded-2xl border-2 p-5 ${
        stop ? 'border-red-500/60 bg-red-500/5' : 'border-amber-500/60 bg-amber-500/5'
      }`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className={`mt-0.5 size-5 shrink-0 ${stop ? 'text-red-500' : 'text-amber-500'}`}
          aria-hidden="true"
        />
        <p className="text-sm leading-relaxed">{noticeIntro(flag)}</p>
      </div>

      <ul className="space-y-2 text-sm">
        {resourcesFor(flag.category).map((r) => (
          <li key={r.name} className="rounded-lg border border-border bg-card p-3">
            <span className="block text-foreground">{r.name}</span>
            {r.href ? (
              <a
                href={r.href}
                className="text-nenya-accent-warm underline underline-offset-4 hover:text-foreground"
              >
                {r.detail}
              </a>
            ) : (
              <span className="text-muted-foreground">{r.detail}</span>
            )}
          </li>
        ))}
      </ul>

      {state === 'closed' && (
        <button
          type="button"
          onClick={() => setState('open')}
          className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Report a problem with this notice
        </button>
      )}

      {(state === 'open' || state === 'sending' || state === 'error') && (
        <div className="space-y-3 rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">
            Was this notice wrong, or did something else go wrong? Tell us. Nothing is sent unless you press Send, and
            this is exactly what we would receive:
          </p>
          <label htmlFor="flag-comment" className="sr-only">
            Your comment
          </label>
          <Textarea
            id="flag-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Optional: what went wrong?"
            className="resize-none text-sm"
          />
          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={includeMessage}
              onChange={(e) => setIncludeMessage(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              Include the message that was flagged. Only check this if you are comfortable sending it, and please
              remove names or other identifying details first.
            </span>
          </label>
          <pre className="whitespace-pre-wrap rounded-md bg-muted p-2 text-xs text-foreground">{reportText}</pre>
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={send} disabled={state === 'sending'}>
              {state === 'sending' ? 'Sending…' : 'Send report'}
            </Button>
            <button
              type="button"
              onClick={() => setState('closed')}
              className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Cancel
            </button>
          </div>
          {state === 'error' && (
            <p role="alert" className="text-xs text-destructive">
              That did not send. You can email info@nenya.biz instead.
            </p>
          )}
        </div>
      )}

      {state === 'sent' && <p className="text-xs text-muted-foreground">Thank you. Your report was sent.</p>}
    </section>
  );
}
