import { useState } from 'react';
import { Shield, Download, FileText, Lock, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Progress } from './ui/progress';

interface EagleProtocolTranscriptFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

type FlowState = 'prompt' | 'processing' | 'complete' | 'discard-confirm';

// Nienna's Chromatic Sigil
const NIENNA_PRIMARY = '#6A5ACD';
const NIENNA_SKY = '#87CEEB';
const NIENNA_WARM = '#BC8F8F';

// Manwë's Golden Crown
const MANWE_GOLD = '#F5A623';

// Aulë's Emerald Vein
const AULE_EMERALD = '#3CB371';

// Mandos Ash Grey
const MANDOS_GREY = '#546E7A';

export default function EagleProtocolTranscriptFlow({ 
  isOpen, 
  onClose 
}: EagleProtocolTranscriptFlowProps) {
  const [flowState, setFlowState] = useState<FlowState>('prompt');
  const [processingStep, setProcessingStep] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [nvcReport, setNvcReport] = useState('');

  const handleGenerate = () => {
    setFlowState('processing');
    
    // Simulate processing steps
    setTimeout(() => {
      setProcessingStep(1);
      setProcessingProgress(25);
    }, 600);
    
    setTimeout(() => {
      setProcessingStep(2);
      setProcessingProgress(50);
    }, 1200);
    
    setTimeout(() => {
      setProcessingStep(3);
      setProcessingProgress(75);
    }, 1800);

    setTimeout(() => {
      setProcessingStep(4);
      setProcessingProgress(100);
    }, 2400);
    
    setTimeout(() => {
      setFlowState('complete');
    }, 3000);
  };

  const handleDiscard = () => {
    setFlowState('discard-confirm');
  };

  const handleConfirmDiscard = () => {
    // Reset and close
    setFlowState('prompt');
    setProcessingStep(0);
    setProcessingProgress(0);
    setNvcReport('');
    onClose();
  };

  const handleCancelDiscard = () => {
    setFlowState('prompt');
  };

  const handleDownload = () => {
    // This flow is a preview, not a working feature -- previously this
    // button silently did nothing (console.log only), which is its own
    // honesty problem: clicking "Download Report" with zero visible result
    // reads as broken, not as "not implemented." Downloading a file that
    // says plainly what it is closes that gap without pretending the real
    // (cryptographically-signed, PII-scrubbed) version exists yet.
    const notice = [
      'NENYA — EAGLE PROTOCOL TRANSCRIPT (DEMO PREVIEW)',
      '='.repeat(50),
      '',
      'This file is a placeholder from a UI preview. It is NOT:',
      '  - cryptographically signed',
      '  - zero-knowledge proved',
      '  - PII-scrubbed by any real pipeline',
      '  - reviewed by, or sent to, any safety team',
      '',
      'No conversation content, transcript, or NVC+ report text was',
      'actually captured, transmitted, or stored by this preview.',
      '',
      `Generated: ${new Date().toLocaleString()}`,
    ].join('\n');
    const blob = new Blob([notice], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nenya-eagle-protocol-DEMO-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    // Reset state
    setFlowState('prompt');
    setProcessingStep(0);
    setProcessingProgress(0);
    setNvcReport('');
    onClose();
  };

  const processingSteps = [
    'Initializing Zero-Knowledge Proofs (ZKP)...',
    'Scrubbing PII on-device...',
    'Generating Cryptographic Signature...',
    'Preparing tone analysis metadata...',
    'Processing Complete. Finalizing Verified Report...'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        {/* Always-visible: this whole flow is a preview of a feature we're
            building, not something functioning today. Shown across every
            state below since the specific claims (cryptographic signing,
            zero-knowledge proofs, a live safety-review team) are dense
            enough that a single top-of-flow disclaimer wouldn't reliably
            reach someone who lands mid-flow. */}
        <div className="mb-4 p-3 sm:p-4 rounded-lg border-2 border-amber-500/60 bg-amber-500/10 flex items-start gap-2 sm:gap-3">
          <AlertTriangle className="size-4 sm:size-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Preview of a feature we're building.</strong> Nothing in this flow is cryptographically signed, zero-knowledge proved, or reviewed by a live safety team yet — this demonstrates the design we're working toward, not something that functions today. Please don't include real personal or identifying details here, or in any system, even one that claims to be secure.
          </p>
        </div>

        {/* PROMPT STATE */}
        {flowState === 'prompt' && (
          <>
            <div className="mb-4 p-3 sm:p-4 rounded-lg border-2" style={{
              background: `${MANWE_GOLD}10`,
              borderColor: MANWE_GOLD
            }}>
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <Sparkles className="size-5 sm:size-6 flex-shrink-0" style={{ color: MANWE_GOLD }} />
                <div>
                  <h3 className="text-xs sm:text-sm" style={{ color: MANWE_GOLD }}>
                    Eagle Protocol: The God in the Machine
                  </h3>
                  <p className="text-xs text-muted-foreground italic mt-1">
                    Your Verified Path to Intervention and Accountability
                  </p>
                </div>
              </div>
            </div>

            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <FileText className="size-4 sm:size-5 flex-shrink-0" />
                <span className="leading-tight">Preview: Generate a Verified Transcript?</span>
              </DialogTitle>
              <DialogDescription className="pt-2 text-xs sm:text-sm">
                You initiated the Emergency Exit. Your session has been terminated and purged from visible history.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
              <div className="rounded-lg p-3 sm:p-4 border" style={{
                background: `${NIENNA_SKY}10`,
                borderColor: NIENNA_SKY
              }}>
                <p className="text-xs sm:text-sm mb-2 sm:mb-3">
                  <strong>The Design Goal:</strong> In the finished version, the system would automatically prepare a <strong style={{ color: NIENNA_PRIMARY }}>cryptographically-signed transcript</strong> of the last 5 minutes of conversation. This preview doesn't do that yet.
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  In that design, this would be the <strong className="text-foreground">only verifiable evidence</strong> Nenya accepts for review, maintaining a clear chain of custody for your data. That review pipeline doesn't exist yet either.
                </p>
              </div>

              <div className="rounded-lg p-3 sm:p-4 border" style={{
                background: `${NIENNA_PRIMARY}08`,
                borderColor: `${NIENNA_PRIMARY}40`
              }}>
                <div className="flex items-start gap-2 sm:gap-3">
                  <Lock className="size-4 sm:size-5 mt-0.5 flex-shrink-0" style={{ color: NIENNA_PRIMARY }} />
                  <div className="space-y-1 sm:space-y-2">
                    <h4 className="text-xs sm:text-sm">Security Summary (Planned)</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      In the finished version, the transcript would be automatically <strong className="text-foreground">scrubbed of PII on your device</strong> before signing, leaving only patterns, tone analysis, and the scrubbed text. This preview doesn't perform real scrubbing or signing — please don't type anything personally identifying below.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg p-3 sm:p-4 border bg-muted/20">
                <h4 className="text-xs sm:text-sm mb-2">Actionable Data Choice (Planned)</h4>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  In the finished design, you'd be able to choose to submit the <strong className="text-foreground">entire log</strong>, or only the <strong className="text-foreground">final segment</strong> — whichever produces the most actionable data for a safety team, once one exists to review it.
                </p>

                <div className="space-y-2 mt-3 sm:mt-4">
                  <Label htmlFor="nvc-report" className="text-xs sm:text-sm" style={{ color: NIENNA_PRIMARY }}>
                    NVC+ Report (Optional — this preview doesn't send it anywhere)
                  </Label>
                  <Textarea
                    id="nvc-report"
                    value={nvcReport}
                    onChange={(e) => setNvcReport(e.target.value)}
                    placeholder="Using NVC+, please identify:&#10;&#10;OBSERVATIONS: What AI behavior did you observe?&#10;FEELINGS: What emotional impact did this have on you?&#10;NEEDS: What needs of yours were unmet?&#10;REQUEST: What specific intervention or review do you need from the safety team?"
                    className="min-h-[120px] sm:min-h-[140px] text-xs resize-none"
                  />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Nothing typed here is sent anywhere — this field only exists to preview the flow. Please don't include real names or other identifying details.
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong>The Design Goal:</strong> once a safety team exists, its primary purpose would be to return you to a path of relational health, using feedback like this to serve you better.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleDiscard}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Purge Draft & Return Home
              </Button>
              <Button
                onClick={handleGenerate}
                className="w-full sm:w-auto order-1 sm:order-2 hover:opacity-90"
                style={{
                  background: AULE_EMERALD,
                  color: 'white'
                }}
              >
                Continue Preview (No Data Sent)
              </Button>
            </DialogFooter>
          </>
        )}

        {/* PROCESSING STATE */}
        {flowState === 'processing' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Shield className="size-4 sm:size-5 animate-pulse flex-shrink-0" style={{ color: NIENNA_PRIMARY }} />
                <span className="leading-tight">Previewing the Verification Flow (Demo)</span>
              </DialogTitle>
            </DialogHeader>

            <div className="py-6 sm:py-8 space-y-4 sm:space-y-6">
              <div className="space-y-4">
                <Progress value={processingProgress} className="h-2" />
                
                <div className="text-center space-y-2">
                  <p className="text-xs sm:text-sm">{processingSteps[processingStep]}</p>
                  <p className="text-xs text-muted-foreground">
                    {processingProgress}% Complete
                  </p>
                </div>
              </div>

              <div className="bg-muted/20 rounded-lg p-4 space-y-2 text-xs text-muted-foreground">
                <div className={processingStep >= 1 ? 'text-foreground flex items-center gap-2' : 'flex items-center gap-2'}>
                  {processingStep >= 1 ? <CheckCircle2 className="size-4 text-green-600" /> : <div className="size-4 rounded-full border-2 border-muted-foreground/30" />}
                  <span>1. Initializing Zero-Knowledge Proofs (ZKP)</span>
                </div>
                <div className={processingStep >= 2 ? 'text-foreground flex items-center gap-2' : 'flex items-center gap-2'}>
                  {processingStep >= 2 ? <CheckCircle2 className="size-4 text-green-600" /> : <div className="size-4 rounded-full border-2 border-muted-foreground/30" />}
                  <span>2. Scrubbing PII On-Device</span>
                </div>
                <div className={processingStep >= 3 ? 'text-foreground flex items-center gap-2' : 'flex items-center gap-2'}>
                  {processingStep >= 3 ? <CheckCircle2 className="size-4 text-green-600" /> : <div className="size-4 rounded-full border-2 border-muted-foreground/30" />}
                  <span>3. Applying Cryptographic Signature</span>
                </div>
                <div className={processingStep >= 4 ? 'text-foreground flex items-center gap-2' : 'flex items-center gap-2'}>
                  {processingStep >= 4 ? <CheckCircle2 className="size-4 text-green-600" /> : <div className="size-4 rounded-full border-2 border-muted-foreground/30" />}
                  <span>4. Finalizing Verified Report</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* COMPLETE STATE */}
        {flowState === 'complete' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <CheckCircle2 className="size-4 sm:size-5 text-green-600 flex-shrink-0" />
                <span className="leading-tight">Demo Complete — This Is a Preview</span>
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                This walked through what generating a cryptographically-signed transcript would look like. No real file, signature, or proof was created.
              </DialogDescription>
            </DialogHeader>

            <div className="py-3 sm:py-4 space-y-3 sm:space-y-4">
              <div className="rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4 border-2" style={{
                background: `linear-gradient(to bottom right, ${NIENNA_PRIMARY}10, ${NIENNA_SKY}10)`,
                borderColor: NIENNA_PRIMARY
              }}>
                <div className="flex items-center gap-2 sm:gap-3 pb-2 sm:pb-3 border-b" style={{ borderColor: `${NIENNA_PRIMARY}40` }}>
                  <Shield className="size-5 sm:size-6 flex-shrink-0" style={{ color: NIENNA_PRIMARY }} />
                  <div>
                    <h3 className="text-sm sm:text-base" style={{ color: NIENNA_PRIMARY }}>
                      Sample Eagle Protocol Transcript (Demo)
                    </h3>
                    <p className="text-xs text-muted-foreground">Not real — nothing below is cryptographically verified</p>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Session ID:</span>
                    <span className="font-mono">EP-{Math.floor(Date.now() / 1000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Protocol Status:</span>
                    <span className="text-amber-600 dark:text-amber-500 flex items-center gap-1">
                      <AlertTriangle className="size-3" />
                      Demo Preview (not verified)
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 sm:items-start">
                    <span className="text-muted-foreground">Sample Signature (not real):</span>
                    <span className="font-mono text-xs text-left sm:text-right sm:max-w-[200px] break-all opacity-60">
                      0x{Array.from({length: 16}, () => Math.floor(Math.random() * 16).toString(16)).join('')}...
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                    <span className="text-muted-foreground">Timestamp:</span>
                    <span className="text-xs sm:text-sm">{new Date().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Format:</span>
                    <span>Planned: .EPT — this demo downloads plain .txt</span>
                  </div>
                </div>
              </div>

              <div className="bg-muted/20 rounded-lg p-3 text-xs text-muted-foreground space-y-2">
                <p className="text-foreground text-xs sm:text-sm">What this is designed to do, once built:</p>
                <ul className="space-y-1 ml-3 sm:ml-4 list-disc leading-relaxed">
                  <li>Be submittable to Nenya's safety team for review — no such team or intake exists yet</li>
                  <li>Keep your actual conversation content PII-scrubbed and encrypted</li>
                  <li>Include only patterns, tone analysis, and cryptographic proofs</li>
                  <li>Leave you in full control over when and how to share the file</li>
                  <li>Serve as the <strong className="text-foreground">sole verifiable evidence</strong> for accountability claims</li>
                </ul>
                <p className="pt-1">None of this happened in this preview — no file was created and nothing was sent anywhere.</p>
              </div>

              {nvcReport && (
                <div className="rounded-lg p-3 border" style={{
                  background: `${AULE_EMERALD}10`,
                  borderColor: AULE_EMERALD
                }}>
                  <p className="text-xs mb-2" style={{ color: AULE_EMERALD }}>
                    <strong>✓ NVC+ Report Text Entered (Demo)</strong>
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    In the finished design, structured feedback like this would be attached to the transcript and help a safety team provide targeted support. It wasn't sent anywhere just now.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Return to Home Screen
              </Button>
              <Button
                onClick={handleDownload}
                className="w-full sm:w-auto order-1 sm:order-2 hover:opacity-90"
                style={{
                  background: NIENNA_PRIMARY,
                  color: 'white'
                }}
              >
                <Download className="size-4 mr-2" />
                Download Demo Placeholder (.txt)
              </Button>
            </DialogFooter>
          </>
        )}

        {/* DISCARD CONFIRMATION STATE */}
        {flowState === 'discard-confirm' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <AlertTriangle className="size-4 sm:size-5 text-destructive flex-shrink-0" />
                <span className="leading-tight">Leave This Preview?</span>
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Nothing has been generated yet, so there's nothing real to lose — this just closes the demo.
              </DialogDescription>
            </DialogHeader>

            <div className="py-3 sm:py-4 space-y-3 sm:space-y-4">
              <p className="text-xs sm:text-sm leading-relaxed">
                Are you sure you want to leave this preview? In the finished design, this step would be where you'd confirm purging a prepared transcript — <strong className="text-foreground">that capability doesn't exist yet</strong>, so nothing is actually being discarded right now.
              </p>

              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                  Once built, purging would mean you could no longer:
                </p>
                <ul className="space-y-1 ml-3 sm:ml-4 list-disc text-xs text-muted-foreground leading-relaxed">
                  <li>Generate a verified transcript of this session</li>
                  <li>Submit cryptographically-signed evidence for safety review</li>
                  <li>Request formal accountability or intervention from Nenya</li>
                  <li>Contribute this interaction to training data improvements</li>
                  <li>Recover any session metadata or tone analysis</li>
                </ul>
              </div>

              <div className="rounded-lg p-3 border" style={{
                background: `${MANDOS_GREY}10`,
                borderColor: MANDOS_GREY
              }}>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Privacy Note:</strong> Nenya doesn't record or store your conversations, so once this pipeline is real, this would be your only opportunity to create a verifiable record.
                </p>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleCancelDiscard}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel - Keep Draft
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDiscard}
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                Yes, Purge Permanently
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
