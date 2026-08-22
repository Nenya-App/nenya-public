import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Copy, Check, Sparkles, Shield, AlertCircle } from 'lucide-react';

interface DyadicCellCreationProps {
  onCreateCell: (code: string) => void;
  onBack: () => void;
}

const generateCellCode = () => {
  const words = [
    'Blue', 'Dolphin', 'Sunset', 'Quiet', 'River', 'Mountain',
    'Ocean', 'Forest', 'Meadow', 'Willow', 'Amber', 'Crystal',
    'Silver', 'Golden', 'Gentle', 'Peaceful', 'Bright', 'Calm'
  ];
  
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 5);
  const number = Math.floor(Math.random() * 10);
  
  return `${selected.join('-')}-${number}`;
};

export default function DyadicCellCreation({ onCreateCell, onBack }: DyadicCellCreationProps) {
  const [cellCode] = useState(generateCellCode());
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cellCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="size-full overflow-y-auto flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-background to-muted/20 scroll-container">
      <div className="max-w-2xl w-full text-center space-y-6 sm:space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <h1 className="text-3xl sm:text-4xl">Create a Dyadic Cell</h1>
            <Badge variant="secondary" className="text-sm px-2 py-1">
              <Sparkles className="size-3.5 mr-1" />
              Structured Integration
            </Badge>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto">
            Create a private, facilitated space for dialogue. Share this code with one person to begin.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 space-y-6 shadow-lg">
          <div className="space-y-3">
            <label className="text-sm text-muted-foreground">Your Cell Code</label>
            <div className="bg-muted rounded-lg p-6 border-2 border-primary/20">
              <code className="text-2xl break-all">{cellCode}</code>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={handleCopy}
              className="min-w-32"
            >
              {copied ? (
                <>
                  <Check className="size-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="size-4 mr-2" />
                  Copy Code
                </>
              )}
            </Button>
            <Button
              onClick={() => onCreateCell(cellCode)}
              className="min-w-32"
            >
              Create Cell
            </Button>
          </div>
        </div>

        <div className="max-w-xl mx-auto space-y-4 pt-4">
          <div className="bg-accent/50 rounded-lg p-4 text-left">
            <h4 className="mb-2">What is a Dyadic Cell?</h4>
            <p className="text-sm text-muted-foreground">
              A Dyadic Cell is a structured space for two people to practice deep listening and authentic dialogue. 
              Nenya acts as a process facilitator, guiding turn-taking and reflection without judgment.
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-left">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="text-sm text-amber-900 dark:text-amber-100">For Professionals & Research</h4>
                <p className="text-xs text-amber-900 dark:text-amber-100">
                  Dyadic Cells are a <em>Structured Integration</em> being developed for potential use by therapists, coaches, and other professionals. <strong>This is currently a demonstration prototype and not a functional tool.</strong> It is not intended as a replacement for professional mental health services. If you need support, please consult a qualified mental health professional.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-left">
            <div className="flex items-start gap-3">
              <Shield className="size-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="text-sm">Accountability & Safety</h4>
                <p className="text-xs text-muted-foreground">
                  Dyadic Cells are a <em>Structured Integration</em> from Nenya Labs Public Benefit Corporation. This allows for revocation of access in the event of verified, repeated abuse. While Nenya prioritizes privacy and anonymity, this accountability mechanism helps protect the community from harmful behavior.
                </p>
              </div>
            </div>
          </div>

          <Button variant="ghost" onClick={onBack} className="w-full sm:w-auto">
            ← Back to Solo Practice
          </Button>
        </div>
      </div>
    </div>
  );
}
