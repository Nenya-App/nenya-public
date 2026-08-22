import { Waves } from 'lucide-react';
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
            The Eagle Protocol
          </DialogTitle>
          <DialogDescription>
            Your safety is our non-negotiable priority.
          </DialogDescription>
        </DialogHeader>
        <div className="pt-2 space-y-4">
          <p className="text-sm text-muted-foreground">
            This is the Eagle Protocol. If you enter a phrase indicating a crisis (self-harm, harm to others), the AI will immediately stop and provide you with direct connections to human emergency resources.
          </p>
          <div className="bg-muted/50 rounded-lg p-4 text-xs space-y-2">
            <p className="text-foreground">Emergency Resources:</p>
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