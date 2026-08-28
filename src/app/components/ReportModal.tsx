import { useState } from 'react';
import { AlertCircle, CheckCircle2, FileText, Loader2, Send, Shield } from 'lucide-react';
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
import { submitReport } from '../../lib/reportSubmission';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SubmitState = 'idle' | 'sending' | 'sent' | 'error';

export default function ReportModal({ isOpen, onClose }: ReportModalProps) {
  const [reportText, setReportText] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');

  const handleClose = () => {
    setReportText('');
    setSubmitState('idle');
    onClose();
  };

  const handleSubmit = async () => {
    if (submitState === 'sending') return;
    setSubmitState('sending');
    try {
      // The free-text field here IS the report -- nothing else rides
      // along, and no file upload is offered anywhere in this form.
      // submitReport() strips markup/control characters before sending,
      // so only plain text ever reaches the team's inbox.
      await submitReport({ type: 'error-report', report: reportText });
      setSubmitState('sent');
      setReportText('');
    } catch {
      setSubmitState('error');
    }
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
                <h4 className="text-xs sm:text-sm">What is this for?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This reporting system is primarily for generating user-submitted reports about the behavior of Nenya's AI responses. The same system is used in both solo practice sessions and Dyadic Cells.
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
              <li>General feedback about your experience with Nenya</li>
            </ul>
          </div>

          <div className="bg-muted/20 rounded-lg p-3 text-xs text-muted-foreground">
            <p className="mb-1 text-foreground text-xs sm:text-sm">Privacy Note:</p>
            <p className="leading-relaxed">
              Submitting this form sends what you write below to Nenya's team by email — that's the only thing this does. There's no automated triage or guaranteed response time yet; a person reads it. For the highest-stakes accountability claims, the design calls for a separate <span className="text-foreground">Eagle Protocol Transcript</span> feature that would generate a cryptographically-signed, zero-knowledge proof — but that feature is still just a preview today. Whichever you use, please don't include real personal or identifying details, here or in any system, even one that claims to be secure.
            </p>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs">
            <div className="flex items-start gap-2">
              <Shield className="size-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-foreground mb-1 text-xs sm:text-sm">
                  <strong>For Serious Concerns:</strong> Report AI Deviation (Verified Protocol Required)
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  For the most serious accountability claims (platform misconduct, partner behavior violations, safety concerns), the design calls for only <strong className="text-foreground">cryptographically-signed Eagle Protocol transcripts</strong> to hold legal and ethical weight as verifiable evidence — once that capability exists.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-text">Describe the issue or feedback (Optional)</Label>
            <Textarea
              id="report-text"
              placeholder="Example: The AI kept redirecting me to feelings when I wanted to focus on needs, or: I'd like to submit this conversation as training data for handling grief discussions..."
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={submitState === 'sending' || submitState === 'sent'}
            />
            <p className="text-xs text-muted-foreground">
              You can submit this report with or without additional context. Only plain text is sent — no
              formatting, code, or file attachments are accepted here.
            </p>
          </div>

          {submitState === 'sent' && (
            <div className="flex items-start gap-2 text-xs sm:text-sm text-green-700 dark:text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <CheckCircle2 className="size-4 mt-0.5 flex-shrink-0" />
              <p>Sent. Thank you — a person on the team will read this.</p>
            </div>
          )}
          {submitState === 'error' && (
            <div className="flex items-start gap-2 text-xs sm:text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <AlertCircle className="size-4 mt-0.5 flex-shrink-0" />
              <p>Something went wrong sending this. Please try again in a moment.</p>
            </div>
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
          {submitState !== 'sent' && (
            <Button
              onClick={handleSubmit}
              disabled={submitState === 'sending'}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {submitState === 'sending' ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <Send className="size-4 mr-2" />
              )}
              {submitState === 'sending' ? 'Sending…' : 'Submit Report'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}