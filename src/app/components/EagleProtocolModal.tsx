import { AlertTriangle, Waves } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface EagleProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EagleProtocolModal({ isOpen, onClose }: EagleProtocolModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Waves className="size-5 text-primary" />
            The Eagle Protocol (Planned Feature)
          </DialogTitle>
          <DialogDescription>
            Your safety is a non-negotiable priority in the design we're building toward.
          </DialogDescription>
        </DialogHeader>
        <div className="pt-2 space-y-4">
          <div className="flex items-start gap-2 rounded-lg border-2 border-amber-500/50 bg-amber-500/10 p-3 text-xs">
            <AlertTriangle className="size-4 mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-500" />
            <p className="text-muted-foreground">
              <strong className="text-foreground">Mostly not built yet.</strong> The free tool has no AI reading
              your conversation. A basic version of the crisis check runs only in the optional coach demo
              (nenya.biz/coach): it matches simple phrases, so it can miss things and can flag harmless words.
              If you're in crisis, please don't rely on it: reach out directly using the resources below.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            The Eagle Protocol is the safety system we're designing: if a message indicated a crisis
            (self-harm, harm to others), the AI would immediately stop and connect you with human emergency
            resources. In the demo, a clear message is never sent to the AI and the conversation ends with
            resources. The rest of the design (human review, careful resets) isn't built.
          </p>
          <div className="bg-muted/50 rounded-lg p-4 text-xs space-y-2">
            <p className="text-foreground">Emergency Resources (real, available now):</p>
            <p className="text-muted-foreground">• National Suicide Prevention Lifeline: 988</p>
            <p className="text-muted-foreground">• Crisis Text Line: Text HOME to 741741</p>
            <p className="text-muted-foreground">• International Association for Suicide Prevention: <span className="text-foreground">iasp.info</span></p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            I Understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}