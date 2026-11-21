import { useState } from 'react';
import { AlreadySent, DeletionCode } from './DeletionCode';
import { SendConsent } from './SendConsent';
import { useSendFlow } from './useSendFlow';
import { AlertCircle, CheckCircle2, FileText, Send, Shield } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportModal({ isOpen, onClose }: ReportModalProps) {
  const [reportText, setReportText] = useState('');
  // The free-text field here IS the report -- nothing else rides along, and no file upload is offered anywhere in this form. submitReport() strips markup and
  // control characters before sending, so only plain text is kept. Pressing the button opens the consent screen; only Send there sends (useSendFlow.ts).
  const flow = useSendFlow('error-report', () => setReportText('')); // the typed text is cleared once it is sent
  const { phase: submitState, receipt } = flow;

  const handleClose = () => {
    setReportText('');
    flow.reset();
    onClose();
  };

  const handleSubmit = () => {
    if (submitState === 'sending' || submitState === 'sent') return;
    void flow.begin(reportText);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileText className="size-4 sm:size-5 text-primary flex-shrink-0" />
            <span className="leading-tight">Report an Issue</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Help us improve Nenya by reporting AI behavior, errors, or feedback.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 sm:p-4 text-xs sm:text-sm">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertCircle className="size-4 sm:size-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1 sm:space-y-2">
                <h4 className="text-sm">What is this for?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This form is for sending Nenya's team a report about the behavior of its AI, an error, or other feedback. The same form is planned for use in partner practice (Dyadic Cells), which is not built yet.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
            <p>
              <span className="text-foreground">Use this to report:</span>
            </p>
            <ul className="space-y-1 sm:space-y-2 ml-3 sm:ml-4 list-disc leading-relaxed">
              <li>AI responses that seem unhelpful, biased, or off-target</li>
              <li>Technical errors or unexpected behavior</li>
              <li>Conversations you'd like to submit as training data</li>
              <li>Violations of our Terms of Service or community guidelines</li>
              <li>Criticism of Nonviolent Communication, of using AI for something like this, or of Nenya itself (all welcome)</li>
              <li>General feedback about your experience with Nenya</li>
            </ul>
          </div>

          <div className="bg-muted/20 rounded-lg p-3 text-xs text-muted-foreground">
            <p className="mb-1 text-foreground text-xs sm:text-sm">Privacy Note:</p>
            <p className="leading-relaxed">
              Submitting this form sends what you write below to Nenya's team by email — that's the only thing this does. There's no automated triage or guaranteed response time yet; a person reads it. If you want a verifiable record of a coach conversation, the coach demo can give you a dated, signed copy of it to keep. Whichever you use, please don't include real personal or identifying details, here or in any system, even one that claims to be secure.
            </p>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs">
            <div className="flex items-start gap-2">
              <Shield className="size-4 text-primary mt-0.5 flex-shrink-0" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-text">Describe the issue or feedback</Label>
            <Textarea
              id="report-text"
              placeholder="Example: The AI kept redirecting me to feelings when I wanted to focus on needs, or: I'd like to submit this conversation as training data for handling grief discussions..."
              value={reportText}
              onChange={(e) => {
                setReportText(e.target.value);
                if (submitState === 'duplicate') flow.reset();
                else if (submitState === 'error') flow.cancel();
              }}
              className="min-h-[120px] resize-none"
              disabled={submitState === 'consent' || submitState === 'sending' || submitState === 'sent'}
            />
            <p className="text-xs text-muted-foreground">
              Only plain text is sent — no
              formatting, code, or file attachments are accepted here.
            </p>
          </div>

          {submitState === 'sent' && (
            <div className="flex items-start gap-2 text-xs sm:text-sm text-green-700 dark:text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <CheckCircle2 className="size-4 mt-0.5 flex-shrink-0" />
              <p>Sent. Thank you — a person on the team will read this.</p>
            </div>
          )}
          {submitState === 'sent' && <DeletionCode receipt={receipt} />}
          {submitState === 'duplicate' && <AlreadySent />}
          {(submitState === 'consent' || submitState === 'sending' || submitState === 'error') && flow.pending && (
            <SendConsent kind="report" parts={[{ label: 'Your report', text: flow.pending.report }]} busy={submitState === 'sending'} failed={submitState === 'error'} onSend={flow.confirm} onCancel={flow.cancel} />
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            {submitState === 'sent' ? 'Close' : 'Cancel'}
          </Button>
          {(submitState === 'idle' || submitState === 'duplicate') && (
            <Button
              onClick={handleSubmit}
              disabled={!reportText.trim()}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              <Send className="size-4 mr-2" />
              Review and send
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}