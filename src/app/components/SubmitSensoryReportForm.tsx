import { useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Loader2, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { submitReport } from '../../lib/reportSubmission';

interface SubmitSensoryReportFormProps {
  /** The exact text produced by generateSensoryReport() -- displayed
   *  read-only and sent verbatim. This form never lets the report body
   *  itself be edited; only the separate comments field is user-writable. */
  report: string;
}

type SubmitState = 'idle' | 'sending' | 'sent' | 'error';

export function SubmitSensoryReportForm({ report }: SubmitSensoryReportFormProps) {
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');

  const handleSubmit = async () => {
    if (submitState === 'sending') return;
    setSubmitState('sending');
    try {
      await submitReport({ type: 'sensory-reflection', report, comments });
      setSubmitState('sent');
    } catch {
      setSubmitState('error');
    }
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
            This is entirely optional and separate from downloading your report. If you submit, the exact
            report below — nothing more, nothing edited — is sent to Nenya's team by email, along with any
            comments you add. Nothing is submitted unless you press the button below.
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
              onChange={(e) => setComments(e.target.value)}
              className="min-h-[80px] resize-none text-sm"
              disabled={submitState === 'sending' || submitState === 'sent'}
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
          {submitState === 'error' && (
            <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <AlertCircle className="size-4 mt-0.5 flex-shrink-0" />
              <p>Something went wrong sending this. Please try again in a moment.</p>
            </div>
          )}

          {submitState !== 'sent' && (
            <Button
              onClick={handleSubmit}
              disabled={submitState === 'sending'}
              size="sm"
              className="gap-2"
            >
              {submitState === 'sending' ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Mail className="size-4" />
              )}
              {submitState === 'sending' ? 'Sending…' : 'Submit This Report'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
