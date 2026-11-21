import { useEffect, useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { AlreadySent, DeletionCode } from './DeletionCode';
import { SendConsent } from './SendConsent';
import { useSendFlow } from './useSendFlow';

interface SubmitSensoryReportFormProps {
  /** The exact text produced by generateSensoryReport() -- displayed
   *  read-only and sent verbatim. This form never lets the report body
   *  itself be edited; only the separate comments field is user-writable. */
  report: string;
}

export function SubmitSensoryReportForm({ report }: SubmitSensoryReportFormProps) {
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState('');
  const flow = useSendFlow('sensory-reflection', () => setComments('')); // the typed comments are cleared once it is sent
  const { phase: submitState, receipt, checkAlreadySent } = flow;
  // The report itself is fixed text: if this tab already sent exactly it (and the page was reopened, or restored by Back), say so instead of offering it again.
  useEffect(() => {
    void checkAlreadySent(report, '');
  }, [report, checkAlreadySent]);

  const handleSubmit = () => {
    if (submitState === 'sending' || submitState === 'sent') return;
    void flow.begin(report, comments); // opens the consent screen; nothing is sent yet
  };

  return (
    <div className="bg-muted/20 border border-border rounded-lg max-w-2xl mx-auto text-left">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left"
      >
        <span className="flex items-center gap-2 text-sm">
          <Mail className="size-4 text-muted-foreground flex-shrink-0" />
          Voluntarily share this report with our team
        </span>
        {expanded ? (
          <ChevronUp className="size-4 flex-shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 flex-shrink-0 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            This is entirely optional and separate from downloading your report. If you choose to send it, you will first see exactly what would be sent, with
            the report and any comments you add, and what we do with it. Nothing is sent until you press Send on that screen.
          </p>

          <div className="space-y-1.5">
            <Label className="text-xs">Report to be sent (exactly as generated, not editable)</Label>
            <pre className="max-h-40 overflow-y-auto text-xs bg-background border border-border rounded-md p-3 whitespace-pre-wrap font-mono text-muted-foreground">
              {report}
            </pre>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sensory-report-comments" className="text-xs">
              Comments (optional)
            </Label>
            <Textarea
              id="sensory-report-comments"
              placeholder="Anything you'd like to add for context..."
              value={comments}
              onChange={(e) => {
                setComments(e.target.value);
                if (submitState === 'duplicate' && e.target.value.trim()) flow.reset(); // adding comments makes it a different send
                else if (submitState === 'error') flow.cancel();
              }}
              className="min-h-[80px] resize-none text-sm"
              disabled={submitState === 'consent' || submitState === 'sending' || submitState === 'sent'}
            />
            <p className="text-xs text-muted-foreground">
              Only plain text is sent — no formatting, code, or file attachments are accepted here.
            </p>
          </div>

          {submitState === 'sent' && (
            <div className="flex items-start gap-2 text-xs text-green-700 dark:text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <CheckCircle2 className="size-4 mt-0.5 flex-shrink-0" />
              <p>Sent. Thank you for sharing this.</p>
            </div>
          )}
          {submitState === 'sent' && <DeletionCode receipt={receipt} />}
          {submitState === 'duplicate' && <AlreadySent />}
          {(submitState === 'consent' || submitState === 'sending' || submitState === 'error') && flow.pending && (
            <SendConsent
              kind="report"
              parts={[{ label: 'Your report', text: flow.pending.report }, { label: 'Your comments', text: flow.pending.comments }]}
              busy={submitState === 'sending'}
              failed={submitState === 'error'}
              onSend={flow.confirm}
              onCancel={flow.cancel}
            />
          )}

          {submitState === 'idle' && (
            <Button onClick={handleSubmit} size="sm" className="gap-2">
              <Mail className="size-4" />
              Review and send this report
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
