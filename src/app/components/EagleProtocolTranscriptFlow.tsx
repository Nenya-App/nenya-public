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
    // In a real app, this would trigger a download
    console.log('Downloading Cryptographically-Signed Eagle Protocol Transcript...');
    console.log('NVC+ Report:', nvcReport);
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
                <span className="leading-tight">Generate Cryptographically-Signed Transcript?</span>
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
                  <strong>The Sole Verifiable Evidence:</strong> The system has automatically prepared a <strong style={{ color: NIENNA_PRIMARY }}>Cryptographically-Signed Transcript</strong> of the last 5 minutes of conversation.
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  This is the <strong className="text-foreground">only verifiable evidence</strong> that Nenya Labs will accept for review, maintaining the integrity of the "Chain of Custody" for your data.
                </p>
              </div>

              <div className="rounded-lg p-3 sm:p-4 border" style={{
                background: `${NIENNA_PRIMARY}08`,
                borderColor: `${NIENNA_PRIMARY}40`
              }}>
                <div className="flex items-start gap-2 sm:gap-3">
                  <Lock className="size-4 sm:size-5 mt-0.5 flex-shrink-0" style={{ color: NIENNA_PRIMARY }} />
                  <div className="space-y-1 sm:space-y-2">
                    <h4 className="text-xs sm:text-sm">Security Summary</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Before signing, the transcript was automatically <strong className="text-foreground">scrubbed of all PII on your device</strong>. Only patterns, tone analysis, and the scrubbed text remain. We trust your device's signature over any external claim.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg p-3 sm:p-4 border bg-muted/20">
                <h4 className="text-xs sm:text-sm mb-2">Actionable Data Choice</h4>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  You may choose to submit the <strong className="text-foreground">entire log</strong>, or only the <strong className="text-foreground">final segment</strong>, based on what produces the most actionable data for the safety team.
                </p>
                
                <div className="space-y-2 mt-3 sm:mt-4">
                  <Label htmlFor="nvc-report" className="text-xs sm:text-sm" style={{ color: NIENNA_PRIMARY }}>
                    NVC+ Report (Optional - Highly Recommended)
                  </Label>
                  <Textarea
                    id="nvc-report"
                    value={nvcReport}
                    onChange={(e) => setNvcReport(e.target.value)}
                    placeholder="Using NVC+, please identify:&#10;&#10;OBSERVATIONS: What AI behavior did you observe?&#10;FEELINGS: What emotional impact did this have on you?&#10;NEEDS: What needs of yours were unmet?&#10;REQUEST: What specific intervention or review do you need from the safety team?"
                    className="min-h-[120px] sm:min-h-[140px] text-xs resize-none"
                  />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong>Invitation to Re-engage:</strong> The safety team's primary goal is to return you to a path of relational health. Your structured feedback helps us serve you better.
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
                Submit Signed Report & Request Review
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
                <span className="leading-tight">Processing Secure Transcript</span>
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
                <span className="leading-tight">Verified Transcript Ready for Download</span>
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Your cryptographically-signed Eagle Protocol transcript has been generated successfully.
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
                      Official Eagle Protocol Transcript
                    </h3>
                    <p className="text-xs text-muted-foreground">Cryptographically Verified & PII-Scrubbed</p>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Session ID:</span>
                    <span className="font-mono">EP-{Math.floor(Date.now() / 1000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Protocol Status:</span>
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="size-3" />
                      Zero-Knowledge Verified
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 sm:items-start">
                    <span className="text-muted-foreground">Device Signature:</span>
                    <span className="font-mono text-xs text-left sm:text-right sm:max-w-[200px] break-all">
                      0x{Array.from({length: 16}, () => Math.floor(Math.random() * 16).toString(16)).join('')}...
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                    <span className="text-muted-foreground">Timestamp:</span>
                    <span className="text-xs sm:text-sm">{new Date().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Format:</span>
                    <span>.EPT (Eagle Protocol Transcript)</span>
                  </div>
                </div>
              </div>

              <div className="bg-muted/20 rounded-lg p-3 text-xs text-muted-foreground space-y-2">
                <p className="text-foreground text-xs sm:text-sm">What happens next?</p>
                <ul className="space-y-1 ml-3 sm:ml-4 list-disc leading-relaxed">
                  <li>This transcript can be submitted to Nenya's safety team for review</li>
                  <li>Your actual conversation content remains PII-scrubbed and encrypted</li>
                  <li>Only patterns, tone analysis, and cryptographic proofs are included</li>
                  <li>You maintain full control over when and how to share this file</li>
                  <li>This is the <strong className="text-foreground">sole verifiable evidence</strong> for accountability claims</li>
                </ul>
              </div>

              {nvcReport && (
                <div className="rounded-lg p-3 border" style={{
                  background: `${AULE_EMERALD}10`,
                  borderColor: AULE_EMERALD
                }}>
                  <p className="text-xs mb-2" style={{ color: AULE_EMERALD }}>
                    <strong>✓ NVC+ Report Included</strong>
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your structured feedback using the NVC+ framework has been attached to the transcript and will help the safety team provide targeted support.
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
                Download Report (.EPT)
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
                <span className="leading-tight">Confirm Permanent Purge</span>
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <div className="py-3 sm:py-4 space-y-3 sm:space-y-4">
              <p className="text-xs sm:text-sm leading-relaxed">
                Are you sure you want to permanently purge the prepared Eagle Protocol transcript? This is your <strong className="text-foreground">only opportunity</strong> to generate verifiable evidence of this interaction.
              </p>

              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                  Once purged, you will not be able to:
                </p>
                <ul className="space-y-1 ml-3 sm:ml-4 list-disc text-xs text-muted-foreground leading-relaxed">
                  <li>Generate a verified transcript of this session</li>
                  <li>Submit cryptographically-signed evidence for safety review</li>
                  <li>Request formal accountability or intervention from Nenya Labs</li>
                  <li>Contribute this interaction to training data improvements</li>
                  <li>Recover any session metadata or tone analysis</li>
                </ul>
              </div>

              <div className="rounded-lg p-3 border" style={{
                background: `${MANDOS_GREY}10`,
                borderColor: MANDOS_GREY
              }}>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Privacy Note:</strong> Because of our privacy-first infrastructure, we do not record or store your conversations. This means this is your only opportunity to create a verifiable record.
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
