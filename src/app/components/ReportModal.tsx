import { useState } from 'react';
import { AlertCircle, FileText, Send, Shield } from 'lucide-react';
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

  const handleSubmit = () => {
    // In a real app, this would submit the report
    console.log('Submitting report:', reportText);
    setReportText('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileText className="size-4 sm:size-5 text-primary flex-shrink-0" />
            <span className="leading-tight">Generate User Behavior Report</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Help us improve Nenya by reporting AI behavior and submitting training data.
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
              All reports are reviewed by our human team. If you want to include conversation content, please use the <span className="text-foreground">Eagle Protocol Transcript</span> feature, which generates a cryptographically signed zero-knowledge proof that protects your privacy while allowing us to verify and review the interaction.
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
                  For the most serious accountability claims (platform misconduct, partner behavior violations, safety concerns), only <strong className="text-foreground">cryptographically-signed Eagle Protocol transcripts</strong> hold legal and ethical weight as verifiable evidence.
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
            />
            <p className="text-xs text-muted-foreground">
              You can submit this report with or without additional context.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            <Send className="size-4 mr-2" />
            Submit Report (Disabled in Demo)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}