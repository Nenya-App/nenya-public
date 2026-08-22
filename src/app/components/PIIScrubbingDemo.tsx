import { useState } from 'react';
import { Button } from './ui/button';
import { Shield, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from './ui/card';
import { ConversationControls } from './ConversationControls';

interface PIIScrubbingDemoProps {
  onComplete?: () => void;
  onBack?: () => void;
}

type DemoStep = 
  | 'intro'
  | 'example-input'
  | 'detection'
  | 'scrubbing'
  | 'final-output'
  | 'complete';

interface PIIDetection {
  type: string;
  original: string;
  replacement: string;
  start: number;
  end: number;
}

export default function PIIScrubbingDemo({ onComplete, onBack }: PIIScrubbingDemoProps) {
  const [currentStep, setCurrentStep] = useState<DemoStep>('intro');
  const [showExplanation, setShowExplanation] = useState(true);

  // Example user input with PII
  const originalInput = "My name is Sarah Johnson and I live at 123 Oak Street in Portland. My email is sarah.j@email.com and my phone is 503-555-1234. I've been feeling really overwhelmed at work.";

  // Detected PII items
  const detections: PIIDetection[] = [
    { type: 'Name', original: 'Sarah Johnson', replacement: '[NAME]', start: 11, end: 24 },
    { type: 'Address', original: '123 Oak Street', replacement: '[ADDRESS]', start: 39, end: 53 },
    { type: 'Location', original: 'Portland', replacement: '[CITY]', start: 57, end: 65 },
    { type: 'Email', original: 'sarah.j@email.com', replacement: '[EMAIL]', start: 80, end: 97 },
    { type: 'Phone', original: '503-555-1234', replacement: '[PHONE]', start: 115, end: 127 }
  ];

  // Final scrubbed output
  const scrubbedOutput = "My name is [NAME] and I live at [ADDRESS] in [CITY]. My email is [EMAIL] and my phone is [PHONE]. I've been feeling really overwhelmed at work.";

  const getHighlightedText = (text: string, highlights: PIIDetection[], showReplacement: boolean = false) => {
    if (highlights.length === 0) return text;

    const parts: { text: string; isPII: boolean; type?: string }[] = [];
    let lastIndex = 0;

    // Sort by start position
    const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);

    sortedHighlights.forEach((detection) => {
      // Add text before this detection
      if (lastIndex < detection.start) {
        parts.push({ text: text.substring(lastIndex, detection.start), isPII: false });
      }

      // Add the detected PII
      parts.push({
        text: showReplacement ? detection.replacement : detection.original,
        isPII: true,
        type: detection.type
      });

      lastIndex = detection.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({ text: text.substring(lastIndex), isPII: false });
    }

    return (
      <span>
        {parts.map((part, index) => (
          part.isPII ? (
            <span
              key={index}
              className="bg-yellow-200 dark:bg-yellow-900 px-1 rounded relative"
              title={`Detected: ${part.type}`}
            >
              {part.text}
            </span>
          ) : (
            <span key={index}>{part.text}</span>
          )
        ))}
      </span>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'intro':
        return (
          <div className="space-y-6">
            <div className="flex justify-center mb-6">
              <Shield className="size-16 text-primary" />
            </div>
            <h2 className="text-center">Privacy-First Processing</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto">
              Before any conversation begins, Nenya automatically detects and removes personally identifiable information (PII) from your messages. This ensures your privacy while allowing the AI to understand and respond to your emotional needs.
            </p>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto">
              Let's walk through how this works with a real example.
            </p>
          </div>
        );

      case 'example-input':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="size-5 text-primary" />
              <h3>Example User Input</h3>
            </div>
            <Card className="p-6 bg-muted/50">
              <p className="text-sm italic">"{originalInput}"</p>
            </Card>
            {showExplanation && (
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="size-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>What's happening:</strong> This is an example message a user might send. Notice it contains personal information like name, address, email, and phone number alongside the emotional content.
                    </p>
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      Nenya will process this message to protect your privacy while preserving the emotional content that matters.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'detection':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="size-5 text-yellow-600" />
              <h3>PII Detection</h3>
            </div>
            <Card className="p-6 bg-muted/50">
              <p className="text-sm">
                {getHighlightedText(originalInput, detections)}
              </p>
            </Card>
            <div className="space-y-2">
              <p className="text-sm">Detected items:</p>
              <div className="grid gap-2">
                {detections.map((detection, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-950 rounded border border-yellow-200 dark:border-yellow-800"
                  >
                    <CheckCircle2 className="size-4 text-yellow-600" />
                    <span className="text-sm">
                      <strong>{detection.type}:</strong> "{detection.original}"
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {showExplanation && (
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="size-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>What's happening:</strong> Nenya's privacy system has identified 5 pieces of personally identifiable information highlighted in yellow.
                    </p>
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      These items will be replaced with generic placeholders before your message is processed.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'scrubbing':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <EyeOff className="size-5 text-green-600" />
              <h3>Privacy Scrubbing in Progress</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm mb-2 text-muted-foreground">Original (with PII):</p>
                <Card className="p-6 bg-muted/50 opacity-60">
                  <p className="text-sm line-through">
                    {getHighlightedText(originalInput, detections)}
                  </p>
                </Card>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="size-6 text-muted-foreground animate-pulse" />
              </div>

              <div>
                <p className="text-sm mb-2 text-muted-foreground">Scrubbed (PII removed):</p>
                <Card className="p-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <p className="text-sm">
                    {getHighlightedText(scrubbedOutput, detections.map(d => ({
                      ...d,
                      original: d.replacement,
                      start: scrubbedOutput.indexOf(d.replacement),
                      end: scrubbedOutput.indexOf(d.replacement) + d.replacement.length
                    })))}
                  </p>
                </Card>
              </div>
            </div>

            {showExplanation && (
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="size-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>What's happening:</strong> Each piece of PII is being replaced with a generic placeholder. Your actual personal information is discarded and never stored.
                    </p>
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      The emotional content—"I've been feeling really overwhelmed at work"—remains intact because that's what matters for the conversation.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'final-output':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="size-5 text-green-600" />
              <h3>Privacy-Protected Message</h3>
            </div>
            
            <Card className="p-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <p className="text-sm font-medium mb-4">This is what gets processed:</p>
              <p className="text-sm italic">"{scrubbedOutput}"</p>
            </Card>

            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex gap-3">
                <Shield className="size-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm text-green-900 dark:text-green-100">
                    <strong>Your privacy will be protected:</strong> In the planned application, the AI assistant would receive only the scrubbed version. Your personal information would never enter the conversation.
                  </p>
                  <p className="text-sm text-green-900 dark:text-green-100">
                    The AI would still be able to understand and respond to your emotional needs: "feeling really overwhelmed at work."
                  </p>
                </div>
              </div>
            </div>

            {showExplanation && (
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="size-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>What's happening:</strong> This automatic scrubbing happens with every message you send in Nenya, protecting your privacy while maintaining the emotional depth of your communication.
                    </p>
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      You can now proceed to your practice session knowing your personal information is safe.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center mb-6">
              <div className="size-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle2 className="size-10 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h2>Privacy Protection Active</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your conversations in Nenya are now protected. Every message you send will be automatically scrubbed of personal information before processing.
            </p>
            <div className="bg-muted/50 rounded-lg p-6 max-w-2xl mx-auto">
              <h4 className="mb-3">Key Privacy Features:</h4>
              <ul className="text-sm text-muted-foreground space-y-2 text-left">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 flex-shrink-0 mt-0.5 text-green-600" />
                  <span>Automatic PII detection and removal</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 flex-shrink-0 mt-0.5 text-green-600" />
                  <span>Personal information is never stored or logged</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 flex-shrink-0 mt-0.5 text-green-600" />
                  <span>Emotional content remains fully intact</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 flex-shrink-0 mt-0.5 text-green-600" />
                  <span>Anonymous hex code identity (no usernames)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 flex-shrink-0 mt-0.5 text-green-600" />
                  <span>Eagle Protocol available for immediate safety needs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 flex-shrink-0 mt-0.5 text-green-600" />
                  <span>Report system available to submit feedback on AI behavior</span>
                </li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleNext = () => {
    const steps: DemoStep[] = ['intro', 'example-input', 'detection', 'scrubbing', 'final-output', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
      setShowExplanation(true);
    }
  };

  const handleSkip = () => {
    if (onBack) {
      onBack();
    } else {
      onComplete?.();
    }
  };

  const handleComplete = () => {
    if (onBack) {
      onBack();
    } else {
      onComplete?.();
    }
  };

  const handleClearDemo = () => {
    setCurrentStep('intro');
    setShowExplanation(true);
  };

  const getConversationText = () => {
    return `Original: ${originalInput}\n\nScrubbed: ${scrubbedOutput}`;
  };

  const getStepNumber = () => {
    const steps: DemoStep[] = ['intro', 'example-input', 'detection', 'scrubbing', 'final-output', 'complete'];
    return steps.indexOf(currentStep) + 1;
  };

  const getTotalSteps = () => 6;

  return (
    <div className="size-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="size-6 text-primary" />
            <div>
              <h3>Privacy Protection Tutorial</h3>
              <p className="text-sm text-muted-foreground">
                Step {getStepNumber()} of {getTotalSteps()}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSkip}>
            Skip Tutorial
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted h-1">
        <div
          className="bg-primary h-1 transition-all duration-300"
          style={{ width: `${(getStepNumber() / getTotalSteps()) * 100}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {renderStepContent()}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-background px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Conversation Controls */}
          <div className="flex justify-center">
            <ConversationControls 
              onClearConversation={handleClearDemo}
              conversationText={getConversationText()}
              conversationName="pii-scrubbing-demo"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-sm"
            >
              {showExplanation ? 'Hide' : 'Show'} Explanation
            </Button>
            
            <div className="flex gap-3">
              {currentStep === 'complete' ? (
                <Button onClick={handleComplete} size="lg">
                  {onBack ? 'Back to Menu' : 'Begin Practice Session'}
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleNext} size="lg">
                  Continue
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}