import { useState } from 'react';
import { Shield, Waves, AlertTriangle, FileText, AlertCircle, Info } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface EagleProtocolDemoProps {
  isActive: boolean;
  onComplete: () => void;
}

type DemoState = 'inactive' | 'eagle-activated' | 'report-prompt' | 'report-form' | 'report-submitted';

// Nienna's Chromatic Sigil - The palette of mercy, compassion, and empathy
const NIENNA_PRIMARY = '#6A5ACD'; // Slate Blue - Compassionate depth
const NIENNA_WARM = '#BC8F8F'; // Rosy Brown - Gentle warmth
const NIENNA_SKY = '#87CEEB'; // Sky Blue - Healing hope
const NIENNA_BACKGROUND = '#FFFFFF'; // White - Pure peace
const NIENNA_TEXT = '#1C1C1C'; // Near Black - Clear text
const NIENNA_EARTH = '#8B4513'; // Saddle Brown - Grounding

// Shown at the top of every state of this flow. This modal makes strong,
// specific claims -- a session ending, a report reaching "our human safety
// team" -- that read as fully real, and it's reachable from a live Session
// screen (via an explicitly-labeled demo-conversation button), not only
// from the About page. Someone who clicks through a couple of demo options
// without registering that label could otherwise take this at face value.
// The crisis resources themselves are real and are left untouched below --
// this note only qualifies the session/reporting narrative around them.
function DemoPreviewNote() {
  return (
    <div
      className="flex items-start gap-2 rounded-lg border-2 p-3 text-xs"
      style={{ borderColor: NIENNA_WARM, background: `${NIENNA_WARM}12`, color: NIENNA_TEXT }}
    >
      <Info className="size-4 mt-0.5 flex-shrink-0" style={{ color: NIENNA_PRIMARY }} />
      <p>
        <strong>You're viewing a demo.</strong> No real session was ended and nothing typed here is sent
        anywhere. The crisis resources below are real — everything else on this screen is a preview of a
        safety system we're building, not something functioning today.
      </p>
    </div>
  );
}

export default function EagleProtocolDemo({ isActive, onComplete }: EagleProtocolDemoProps) {
  const [demoState, setDemoState] = useState<DemoState>('inactive');
  const [reportText, setReportText] = useState('');

  // Trigger the Eagle Protocol modal
  const triggerEagleProtocol = () => {
    setDemoState('eagle-activated');
  };

  // Handle closing the Eagle Protocol modal
  const handleCloseSession = () => {
    setDemoState('report-prompt');
  };

  // Handle "No, Thank You" - return to start
  const handleNoReport = () => {
    setDemoState('inactive');
    setReportText('');
    onComplete();
  };

  // Handle "Yes, Submit a Report"
  const handleYesReport = () => {
    setDemoState('report-form');
  };

  // Handle report form cancel
  const handleCancelReport = () => {
    setDemoState('report-prompt');
  };

  // Handle report submission
  const handleSubmitReport = () => {
    setDemoState('report-submitted');
  };

  // Handle final completion
  const handleFinalClose = () => {
    setDemoState('inactive');
    setReportText('');
    onComplete();
  };

  // Trigger the demo when activated
  if (isActive && demoState === 'inactive') {
    // Small delay to show the message first
    setTimeout(() => triggerEagleProtocol(), 1000);
  }

  return (
    <>
      {/* Eagle Protocol Activation Modal */}
      <Dialog open={demoState === 'eagle-activated'} onOpenChange={() => {}}>
        <DialogContent 
          className="sm:max-w-lg border-2" 
          onPointerDownOutside={(e) => e.preventDefault()} 
          onEscapeKeyDown={(e) => e.preventDefault()}
          style={{
            background: NIENNA_BACKGROUND,
            borderColor: NIENNA_PRIMARY
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: NIENNA_PRIMARY }}>
              <Waves className="size-6" />
              EAGLE PROTOCOL: INVOKING SAFETY MODE
            </DialogTitle>
            <DialogDescription style={{ color: NIENNA_TEXT }}>
              In the finished version, this session would now be ended for your safety. Please seek human
              support regardless — the resources below are real.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <DemoPreviewNote />
            <div className="rounded-lg p-4 space-y-3" style={{
              background: `${NIENNA_SKY}15`,
              border: `2px solid ${NIENNA_SKY}`
            }}>
              <p className="text-sm" style={{ color: NIENNA_TEXT }}>
                It is very important that you get the human support that you deserve. The conversation you are attempting to have is beyond the scope of any artificial intelligence's capacity, which lacks true understanding and must always defer to human care in matters of crisis.
              </p>
              
              <p className="text-sm" style={{ color: NIENNA_TEXT }}>
                Please contact a crisis hotline, emergency services, mental health services, and/or your support network to seek immediate assistance.
              </p>
              
              <div className="rounded p-4 space-y-3" style={{ 
                background: `${NIENNA_PRIMARY}10`,
                border: `1px solid ${NIENNA_PRIMARY}30`
              }}>
                <div className="flex items-start gap-2">
                  <AlertCircle className="size-5 flex-shrink-0 mt-0.5" style={{ color: NIENNA_PRIMARY }} />
                  <div className="space-y-2" style={{ color: NIENNA_TEXT }}>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl">•</span>
                      <span>
                        <strong style={{ color: NIENNA_PRIMARY }}>Call or Text 988</strong> (in the US & Canada)
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl">•</span>
                      <span>
                        <strong style={{ color: NIENNA_PRIMARY }}>Crisis Text Line:</strong> Text HOME to 741741
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl">•</span>
                      <span>
                        <strong style={{ color: NIENNA_PRIMARY }}>Global helplines:</strong>{' '}
                        <a 
                          href="https://findahelpline.com" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="underline hover:no-underline"
                          style={{ color: NIENNA_PRIMARY }}
                        >
                          findahelpline.com
                        </a>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm" style={{ color: NIENNA_TEXT }}>
                This session is now ended to ensure you are connected to the right resources. You are always welcome to start a new, anonymous session at any time to reflect on your feelings and the needs underlying them.
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <Button 
              onClick={handleCloseSession} 
              className="w-full sm:w-auto hover:opacity-90"
              style={{
                background: NIENNA_PRIMARY,
                color: NIENNA_BACKGROUND
              }}
            >
              I Understand. Close Session.
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Prompt Modal */}
      <Dialog open={demoState === 'report-prompt'} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              Submit a Report?
            </DialogTitle>
            <DialogDescription>
              Preview: in the finished version, this would be your only opportunity to report this
              interaction.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <DemoPreviewNote />

            <p className="text-sm text-muted-foreground">
              In the finished design, the Eagle Protocol would have ended your session to protect your
              safety. This screen previews the optional report you'd then be able to submit about what
              happened.
            </p>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-2 text-sm">
                  <p>
                    Because of our privacy-first infrastructure, Nenya doesn't record or store your
                    conversations — so in the finished design, <strong>this would be your only opportunity to
                    make a report.</strong> That reporting pipeline doesn't exist yet, though: nothing typed
                    on the next screen is actually sent anywhere.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Once built, submitting a report would be the way to verify the AI's behavior, improve its
              safety systems, or take action against platform abuse.
            </p>

            <p className="text-sm">
              Continue the preview of the report flow?
            </p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end">
            <Button variant="outline" onClick={handleNoReport}>
              No, Thank You
            </Button>
            <Button onClick={handleYesReport}>
              Continue Preview
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Form Modal */}
      <Dialog open={demoState === 'report-form'} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Preview: Submit an Anonymous Report</DialogTitle>
            <DialogDescription>
              A preview of the safety-protocol reporting flow we're building
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <DemoPreviewNote />

            <p className="text-sm text-muted-foreground">
              In the finished version, you'd briefly describe what led to the session being ended, helping
              a human team verify system behavior and improve safety protocols.
            </p>

            <div className="space-y-2">
              <Label htmlFor="eagle-report">Your Report (Preview only — input disabled)</Label>
              <Textarea
                id="eagle-report"
                placeholder="Example: I was exploring difficult feelings about self-worth and the system correctly identified crisis language..."
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                className="min-h-[120px] resize-none"
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Text input is disabled here on purpose — this step doesn't send anything anywhere yet.
              </p>
            </div>

            <div className="bg-muted/20 rounded-lg p-3 text-xs text-muted-foreground">
              <p className="mb-1 text-foreground">Privacy Note (Planned):</p>
              <p>
                In the finished design, your report would be completely anonymous and reviewed by a human
                safety team to ensure the Eagle Protocol is functioning correctly and to improve crisis
                detection. No such review pipeline exists yet.
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end">
            <Button variant="outline" onClick={handleCancelReport}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReport}>
              Continue Preview
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Submitted Confirmation Modal */}
      <Dialog open={demoState === 'report-submitted'} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="size-5 text-green-600" />
              Preview Complete
            </DialogTitle>
            <DialogDescription>
              This is where a real report would have been sent, once that pipeline exists.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <DemoPreviewNote />
            <p className="text-sm text-center text-muted-foreground">
              Nothing was actually submitted anywhere — this concludes the demo of the safety system we're
              building.
            </p>
          </div>

          <div className="flex justify-center">
            <Button onClick={handleFinalClose} className="w-full sm:w-auto">
              Return to Demo Start
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
