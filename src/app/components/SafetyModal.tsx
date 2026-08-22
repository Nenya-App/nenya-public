import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Shield, Phone, MessageSquare, ExternalLink } from 'lucide-react';

interface SafetyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SafetyModal({ open, onOpenChange }: SafetyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-[90vw]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="size-6 text-primary" />
            <DialogTitle>Your Safety is Our Priority</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            Nenya is a reflection tool, not a crisis service. If you are in distress, please reach out to a human professional immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="bg-muted rounded-lg p-4 space-y-4">
            <div className="flex items-start gap-3">
              <Phone className="size-5 mt-0.5 text-primary" />
              <div className="flex-1">
                <h4 className="mb-1">National Suicide Prevention Lifeline</h4>
                <p className="text-muted-foreground mb-2">24/7 crisis support and suicide prevention</p>
                <a 
                  href="tel:988" 
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  Call or text: 988
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>

            <div className="border-t border-border pt-4 flex items-start gap-3">
              <MessageSquare className="size-5 mt-0.5 text-primary" />
              <div className="flex-1">
                <h4 className="mb-1">Crisis Text Line</h4>
                <p className="text-muted-foreground mb-2">Free, 24/7 support via text message</p>
                <a 
                  href="sms:741741?&body=HOME" 
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  Text HOME to 741741
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="bg-accent rounded-lg p-4">
            <h4 className="mb-2">The Eagle Protocol</h4>
            <p className="text-sm text-muted-foreground">
              Nenya is designed with ethical boundaries. If our conversation approaches territory that requires professional intervention, we'll pause and provide you with appropriate resources. Your wellbeing always comes first.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={() => onOpenChange(false)}>
            I Understand. Return to Chat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
