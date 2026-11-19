import { useState } from 'react';
import { AlreadySent, DeletionCode } from '../app/components/DeletionCode';
import { SendConsent } from '../app/components/SendConsent';
import { useSendFlow } from '../app/components/useSendFlow';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../app/components/ui/button';
import { Textarea } from '../app/components/ui/textarea';
import { admitsHarm, noticeIntro, REPORTING_FACTS, resourcesFor, type SafetyFlag } from '../lib/safetyFlags';

interface FlagNoticeProps {
  flag: SafetyFlag;
  /** The message that was flagged. Only ever sent if the visitor chooses to include it. */
  flaggedMessage: string;
  /** Where the flag came from. 'report' means the part of a report the visitor chose to share, not one of their messages: the notice says so, and nothing is ended. */
  source?: 'message' | 'report';
}

// What the visitor sees when a message is flagged: the notice, resources they can
// tap, and an optional way to tell us the notice was wrong. Nothing is sent
// anywhere unless they press Send on the report.
export function FlagNotice({ flag, flaggedMessage, source = 'message' }: FlagNoticeProps) {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState('');
  const flow = useSendFlow('error-report', () => {
    setComment('');
    setOpen(false);
  }); // the typed text is cleared once it is sent
  const { phase, receipt } = flow;
  const [includeMessage, setIncludeMessage] = useState(false);

  const reportText = [
    'Coach demo: flag report',
    `Notice shown: ${flag.label}${flag.kind ? ` / ${flag.kind}` : ''} (${flag.tier})`,
    `Comment: ${comment.trim() || '(none)'}`,
    `Flagged message: ${includeMessage ? flaggedMessage : '(not included)'}`,
  ].join('\n');

  const send = () => {
    if (phase === 'sending' || phase === 'sent') return;
    void flow.begin(reportText); // opens the consent screen; nothing is sent yet
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
        <p className="text-sm leading-relaxed">{source === 'report' ? noticeIntro(flag).replace(/^This message/, 'The part of the report you shared') : noticeIntro(flag)}</p>
      </div>

      <ul className="space-y-2 text-sm">
        {resourcesFor(flag.category, flag.kind).map((r) => (
          <li key={r.name} className="rounded-lg border border-border bg-card p-3">
            <span className="block text-foreground">{r.name}</span>
            {r.href ? (
              <a
                href={r.href}
                className="text-nenya-gold-text dark:text-nenya-accent-warm underline underline-offset-4 hover:text-foreground"
              >
                {r.detail}
              </a>
            ) : (
              <span className="text-muted-foreground">{r.detail}</span>
            )}
          </li>
        ))}
      </ul>

      {/* Only when the message admits an act: what reporting involves, as facts, closed until opened (docs/harm-disclosure-directions.md). */}
      {admitsHarm(flag) && (
        <details className="rounded-lg border border-border bg-card p-3 text-sm">
          <summary className="min-h-11 cursor-pointer py-2 text-foreground underline underline-offset-4">What reporting involves</summary>
          <dl className="mt-2 space-y-3">
            {REPORTING_FACTS.map((f) => (
              <div key={f.heading}>
                <dt className="font-medium text-foreground">{f.heading}</dt>
                <dd className="text-muted-foreground">{f.text}</dd>
              </div>
            ))}
          </dl>
        </details>
      )}

      {!open && phase === 'idle' && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Report a problem with this notice
        </button>
      )}

      {open && (phase === 'idle' || phase === 'duplicate') && (
        <div className="space-y-3 rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">
            Was this notice wrong, or did something else go wrong? Tell us. Before anything is sent, you will see exactly what we would receive, and
            you decide then:
          </p>
          <label htmlFor="flag-comment" className="sr-only">
            Your comment
          </label>
          <Textarea
            id="flag-comment"
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              if (phase === 'duplicate') flow.reset();
            }}
            maxLength={500}
            rows={3}
            placeholder="Optional: what went wrong?"
            className="resize-none text-sm"
          />
          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={includeMessage}
              onChange={(e) => {
                setIncludeMessage(e.target.checked);
                if (phase === 'duplicate') flow.reset();
              }}
              className="mt-0.5"
            />
            <span>
              Include the message that was flagged. Only check this if you are comfortable sending it, and please
              remove names or other identifying details first.
            </span>
          </label>
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={send}>
              Review and send
            </Button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {phase === 'duplicate' && <AlreadySent fromCoach />}
      {(phase === 'consent' || phase === 'sending' || phase === 'error') && flow.pending && (
        <SendConsent kind="report" parts={[{ label: 'Your report', text: flow.pending.report }]} busy={phase === 'sending'} failed={phase === 'error'} onSend={flow.confirm} onCancel={flow.cancel} />
      )}

      {phase === 'sent' && <p className="text-xs text-muted-foreground">Thank you. Your report was sent.</p>}
      {phase === 'sent' && <DeletionCode receipt={receipt} fromCoach />}
    </section>
  );
}
