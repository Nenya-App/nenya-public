import { useState } from 'react';
import { Button } from '../ui/button';
import { ArrowLeft, ChevronRight, ArrowRight as ArrowRightIcon } from 'lucide-react';
import { GatewaySubtitleLink } from '../GatewaySubtitleLink';
import NenyaLogo from '../NenyaLogo';
import { SnappingSlider } from '../ui/snapping-slider';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { TermInfo } from '../TermInfo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AppFooter } from '../AppFooter';
import { sanitizePlainText } from '../../../lib/textSanitize';

interface InsightGatewayPageProps {
  onComplete: (data: any) => void;
  onBack: () => void;
  currentIndex: number;
  totalGateways: number;
  userColors?: { color1?: string; color2?: string };
}

const patterns = [
  'Fragmented',
  'Linear',
  'Branching',
  'Circular',
  'Layered',
  'Web-like',
  'Crystalline',
  'Fractal',
  'Spiraling',
  'Chaotic',
  'Unified'
];

const perspectives = [
  'Narrow',
  'Focused',
  'Panoramic',
  'Microscopic',
  'Telescopic',
  'Multi-faceted',
  "Bird's Eye",
  'Immersed'
];

const INSTRUCTION_CARDS = [
  {
    title: 'Welcome to the Insight Gateway',
    description: 'How we organize our understanding shapes our experience. In this gateway, you\'ll explore the patterns of your thinking and knowing.',
    detail: 'Consider the structure of your awareness: Is it clear or foggy? Deep or surface? What patterns and perspectives define how you see?'
  },
  {
    title: 'Mapping Your Understanding',
    description: 'You\'ll describe two cognitive states: where you are now (Present) and where you\'re moving toward (Potential).',
    detail: 'Trust the intelligence of how your mind naturally organizes. These patterns reveal the deeper architecture of your experience.'
  },
  {
    title: 'Everything is Optional',
    description: 'You can describe all dimensions or focus on just what feels most clear. Skip anything that doesn\'t resonate.',
    detail: 'This ritual adapts to whatever level of clarity and depth feels accessible right now.'
  }
];

export default function InsightGatewayPage({ onComplete, onBack, currentIndex, totalGateways, userColors }: InsightGatewayPageProps) {
  // Step state
  const [step, setStep] = useState<'instructions' | 'selection'>('instructions');
  const [instructionCardIndex, setInstructionCardIndex] = useState(0);

  // Current state
  const [currentPatterns, setCurrentPatterns] = useState<string[]>([]);
  const [currentPatternOther, setCurrentPatternOther] = useState('');
  const [currentClarity, setCurrentClarity] = useState([50]);
  const [currentDepth, setCurrentDepth] = useState([50]);
  const [currentPerspectives, setCurrentPerspectives] = useState<string[]>([]);
  const [currentPerspectiveOther, setCurrentPerspectiveOther] = useState('');
  const [currentDescription, setCurrentDescription] = useState('');
  const [currentBodyLocation, setCurrentBodyLocation] = useState('');

  // Potential state
  const [potentialPatterns, setPotentialPatterns] = useState<string[]>([]);
  const [potentialPatternOther, setPotentialPatternOther] = useState('');
  const [potentialClarity, setPotentialClarity] = useState([50]);
  const [potentialDepth, setPotentialDepth] = useState([50]);
  const [potentialPerspectives, setPotentialPerspectives] = useState<string[]>([]);
  const [potentialPerspectiveOther, setPotentialPerspectiveOther] = useState('');
  const [potentialDescription, setPotentialDescription] = useState('');
  const [potentialBodyLocation, setPotentialBodyLocation] = useState('');

  const handleCheckboxChange = (
    value: string,
    checked: boolean,
    currentValues: string[],
    setter: (values: string[]) => void
  ) => {
    if (checked) {
      setter([...currentValues, value]);
    } else {
      setter(currentValues.filter(v => v !== value));
    }
  };

  const handleNextInstructionCard = () => {
    if (instructionCardIndex < INSTRUCTION_CARDS.length - 1) {
      setInstructionCardIndex(instructionCardIndex + 1);
    } else {
      setStep('selection');
    }
  };

  const handleNext = () => {
    onComplete({
      currentPatterns: currentPatterns.length > 0 ? currentPatterns : null,
      currentPatternOther: currentPatternOther || null,
      currentClarity: currentClarity[0],
      currentDepth: currentDepth[0],
      currentPerspectives: currentPerspectives.length > 0 ? currentPerspectives : null,
      currentPerspectiveOther: currentPerspectiveOther || null,
      currentDescription: currentDescription || null,
      currentBodyLocation: currentBodyLocation ? sanitizePlainText(currentBodyLocation, 300) : null,
      potentialPatterns: potentialPatterns.length > 0 ? potentialPatterns : null,
      potentialPatternOther: potentialPatternOther || null,
      potentialClarity: potentialClarity[0],
      potentialDepth: potentialDepth[0],
      potentialPerspectives: potentialPerspectives.length > 0 ? potentialPerspectives : null,
      potentialPerspectiveOther: potentialPerspectiveOther || null,
      potentialDescription: potentialDescription || null,
      potentialBodyLocation: potentialBodyLocation ? sanitizePlainText(potentialBodyLocation, 300) : null
    });
  };

  const canContinue = true; // All fields are optional

  const color1 = userColors?.color1;
  const color2 = userColors?.color2;

  return (
    <div className="size-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          
          <div className="flex items-center gap-3">
            <NenyaLogo size={32} />
            <div className="text-center">
              <h1 className="text-lg">
                Insight - Noesis
                <GatewaySubtitleLink href="https://en.wikipedia.org/wiki/Noesis" />
              </h1>
              <p className="text-xs text-muted-foreground">
                Gateway {currentIndex + 1} of {totalGateways}
              </p>
            </div>
          </div>
          
          <div className="w-20" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto scroll-container">
        {step === 'instructions' ? (
          /* Instruction Cards */
          <div className="h-full flex items-center justify-center px-4 sm:px-6 py-8">
            <div className="max-w-2xl w-full">
              <Card
                className="cursor-pointer transition-all hover:shadow-lg border-2"
                onClick={handleNextInstructionCard}
              >
                <CardHeader>
                  <CardTitle className="text-2xl md:text-3xl">
                    {INSTRUCTION_CARDS[instructionCardIndex].title}
                  </CardTitle>
                  <CardDescription className="text-base md:text-lg">
                    {INSTRUCTION_CARDS[instructionCardIndex].description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {INSTRUCTION_CARDS[instructionCardIndex].detail}
                  </p>
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-muted-foreground">
                      {instructionCardIndex + 1} of {INSTRUCTION_CARDS.length}
                    </p>
                    <Button variant="ghost" className="gap-2">
                      {instructionCardIndex < INSTRUCTION_CARDS.length - 1 ? (
                        <>
                          Next <ChevronRight className="size-4" />
                        </>
                      ) : (
                        <>
                          Begin Selection <ArrowRightIcon className="size-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Selection Cards */
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {/* Present State Card */}
              <Card
                className="transition-all"
                style={
                  color1
                    ? {
                        boxShadow: `0 0 20px ${color1}40, 0 0 40px ${color1}20`,
                        borderColor: `${color1}60`,
                        borderWidth: '2px'
                      }
                    : undefined
                }
              >
                <CardHeader>
                  <CardTitle>Present State</CardTitle>
                  <CardDescription>The patterns of understanding where you are now</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-sm">Pattern (optional)</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-md p-2">
                    {patterns.map((pattern) => (
                      <div key={pattern} className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`current-pattern-${pattern}`}
                            checked={currentPatterns.includes(pattern)}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(pattern, checked as boolean, currentPatterns, setCurrentPatterns)
                            }
                          />
                          <label
                            htmlFor={`current-pattern-${pattern}`}
                            className="text-xs cursor-pointer"
                          >
                            {pattern}
                          </label>
                        </div>
                        <TermInfo term={pattern} category="pattern" />
                      </div>
                    ))}
                    <div className="flex items-start space-x-2 pt-2 border-t border-border">
                      <Checkbox
                        id="current-pattern-other"
                        checked={currentPatternOther.length > 0}
                        onCheckedChange={(checked) => {
                          if (!checked) setCurrentPatternOther('');
                        }}
                      />
                      <div className="flex-1">
                        <label htmlFor="current-pattern-other" className="text-xs cursor-pointer block mb-1">
                          Other
                        </label>
                        <Input
                          placeholder="Describe..."
                          value={currentPatternOther}
                          onChange={(e) => setCurrentPatternOther(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  </div>

                  <SnappingSlider
                    value={currentClarity}
                    onValueChange={setCurrentClarity}
                    label="Clarity"
                    leftLabel="Foggy"
                    rightLabel="Crystal Clear"
                    max={100}
                  />

                  <SnappingSlider
                    value={currentDepth}
                    onValueChange={setCurrentDepth}
                    label="Depth"
                    leftLabel="Surface"
                    rightLabel="Profound"
                    max={100}
                  />

                  <div className="space-y-2">
                    <Label className="text-sm">Perspective (optional)</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-md p-2">
                    {perspectives.map((perspective) => (
                      <div key={perspective} className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`current-perspective-${perspective}`}
                            checked={currentPerspectives.includes(perspective)}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(perspective, checked as boolean, currentPerspectives, setCurrentPerspectives)
                            }
                          />
                          <label
                            htmlFor={`current-perspective-${perspective}`}
                            className="text-xs cursor-pointer"
                          >
                            {perspective}
                          </label>
                        </div>
                        <TermInfo term={perspective} category="perspective" />
                      </div>
                    ))}
                    <div className="flex items-start space-x-2 pt-2 border-t border-border">
                      <Checkbox
                        id="current-perspective-other"
                        checked={currentPerspectiveOther.length > 0}
                        onCheckedChange={(checked) => {
                          if (!checked) setCurrentPerspectiveOther('');
                        }}
                      />
                      <div className="flex-1">
                        <label htmlFor="current-perspective-other" className="text-xs cursor-pointer block mb-1">
                          Other
                        </label>
                        <Input
                          placeholder="Describe..."
                          value={currentPerspectiveOther}
                          onChange={(e) => setCurrentPerspectiveOther(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Describe the patterns (optional)</Label>
                    <Textarea
                      placeholder="Describe the patterns and perspectives..."
                      value={currentDescription}
                      onChange={(e) => setCurrentDescription(e.target.value)}
                      className="min-h-20 resize-none text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Where do you feel this in your body? (optional)</Label>
                    <Textarea
                      placeholder="e.g., head, gut, chest..."
                      value={currentBodyLocation}
                      onChange={(e) => setCurrentBodyLocation(e.target.value)}
                      className="min-h-16 resize-none text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Potential State Card */}
              <Card
                className="transition-all"
                style={
                  color2
                    ? {
                        boxShadow: `0 0 20px ${color2}40, 0 0 40px ${color2}20`,
                        borderColor: `${color2}60`,
                        borderWidth: '2px'
                      }
                    : undefined
                }
              >
                <CardHeader>
                  <CardTitle>Wish State</CardTitle>
                  <CardDescription>The patterns of understanding you're moving toward</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-sm">Pattern (optional)</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-md p-2">
                    {patterns.map((pattern) => (
                      <div key={pattern} className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`potential-pattern-${pattern}`}
                            checked={potentialPatterns.includes(pattern)}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(pattern, checked as boolean, potentialPatterns, setPotentialPatterns)
                            }
                          />
                          <label
                            htmlFor={`potential-pattern-${pattern}`}
                            className="text-xs cursor-pointer"
                          >
                            {pattern}
                          </label>
                        </div>
                        <TermInfo term={pattern} category="pattern" />
                      </div>
                    ))}
                    <div className="flex items-start space-x-2 pt-2 border-t border-border">
                      <Checkbox
                        id="potential-pattern-other"
                        checked={potentialPatternOther.length > 0}
                        onCheckedChange={(checked) => {
                          if (!checked) setPotentialPatternOther('');
                        }}
                      />
                      <div className="flex-1">
                        <label htmlFor="potential-pattern-other" className="text-xs cursor-pointer block mb-1">
                          Other
                        </label>
                        <Input
                          placeholder="Describe..."
                          value={potentialPatternOther}
                          onChange={(e) => setPotentialPatternOther(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  </div>

                  <SnappingSlider
                    value={potentialClarity}
                    onValueChange={setPotentialClarity}
                    label="Clarity"
                    leftLabel="Foggy"
                    rightLabel="Crystal Clear"
                    max={100}
                  />

                  <SnappingSlider
                    value={potentialDepth}
                    onValueChange={setPotentialDepth}
                    label="Depth"
                    leftLabel="Surface"
                    rightLabel="Profound"
                    max={100}
                  />

                  <div className="space-y-2">
                    <Label className="text-sm">Perspective (optional)</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-md p-2">
                    {perspectives.map((perspective) => (
                      <div key={perspective} className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`potential-perspective-${perspective}`}
                            checked={potentialPerspectives.includes(perspective)}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(perspective, checked as boolean, potentialPerspectives, setPotentialPerspectives)
                            }
                          />
                          <label
                            htmlFor={`potential-perspective-${perspective}`}
                            className="text-xs cursor-pointer"
                          >
                            {perspective}
                          </label>
                        </div>
                        <TermInfo term={perspective} category="perspective" />
                      </div>
                    ))}
                    <div className="flex items-start space-x-2 pt-2 border-t border-border">
                      <Checkbox
                        id="potential-perspective-other"
                        checked={potentialPerspectiveOther.length > 0}
                        onCheckedChange={(checked) => {
                          if (!checked) setPotentialPerspectiveOther('');
                        }}
                      />
                      <div className="flex-1">
                        <label htmlFor="potential-perspective-other" className="text-xs cursor-pointer block mb-1">
                          Other
                        </label>
                        <Input
                          placeholder="Describe..."
                          value={potentialPerspectiveOther}
                          onChange={(e) => setPotentialPerspectiveOther(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Describe the patterns (optional)</Label>
                    <Textarea
                      placeholder="Describe the patterns and perspectives you're moving toward..."
                      value={potentialDescription}
                      onChange={(e) => setPotentialDescription(e.target.value)}
                      className="min-h-20 resize-none text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Where would you feel this in your body? (optional)</Label>
                    <Textarea
                      placeholder="e.g., head, gut, chest..."
                      value={potentialBodyLocation}
                      onChange={(e) => setPotentialBodyLocation(e.target.value)}
                      className="min-h-16 resize-none text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Next Button */}
            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                onClick={handleNext}
                disabled={!canContinue}
                className="px-12"
              >
                {currentIndex + 1 < totalGateways ? 'Next Gateway' : 'Continue'}
              </Button>
            </div>
          </div>
        )}

        <AppFooter />
      </div>
    </div>
  );
}
