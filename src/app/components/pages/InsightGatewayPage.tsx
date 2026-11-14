import { useState, useEffect, useRef } from 'react';
import { StageSlot, StageIntro, StageNav, type PairStage } from '../GatewayStages';
import { GatewayProgress } from '../GatewayProgress';
import { Button } from '../ui/button';
import { unsetSlider, sliderValue } from '../../../lib/optionalSlider';
import { ArrowLeft, ChevronRight, ArrowRight as ArrowRightIcon, User } from 'lucide-react';
import { GatewaySubtitleLink } from '../GatewaySubtitleLink';
import PanelLogo from '../PanelLogo';
import { SnappingSlider } from '../ui/snapping-slider';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AppFooter } from '../AppFooter';
import { BodyMapAvatar, BodyMapData } from '../BodyMapAvatar';
import { DrawingCanvas } from '../DrawingCanvas';

import { WordPicker } from '../WordPicker';
import { ShapePicker, MAX_SHAPES } from '../ShapePicker';
interface InsightGatewayPageProps {
  onComplete: (data: any) => void;
  onBack: () => void;
  currentIndex: number;
  totalGateways: number;
  userColors?: { color1?: string; color2?: string };
  bodyMapData: BodyMapData;
  onUpdateBodyMap: (data: BodyMapData) => void;
}



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

export default function InsightGatewayPage({ onComplete, onBack, currentIndex, totalGateways, userColors, bodyMapData, onUpdateBodyMap }: InsightGatewayPageProps) {
  // Step state
  const [step, setStep] = useState<'instructions' | 'selection'>('instructions');
  const [instructionCardIndex, setInstructionCardIndex] = useState(0);
  const [showBodyMap, setShowBodyMap] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<PairStage>('present');
  useEffect(() => { scrollContainerRef.current?.scrollTo({ top: 0 }); }, [stage]);

  // Advancing between steps swaps content inside this same persistently-
  // mounted scroll container -- it never unmounts, so nothing else resets
  // its scroll position when the step changes.
  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [step]);

  // Current state
  const [currentPatternShapes, setCurrentPatternShapes] = useState<string[]>([]);
  const [currentPatterns, setCurrentPatterns] = useState<string[]>([]);
  const [currentPatternOther, setCurrentPatternOther] = useState('');
  const [currentClarity, setCurrentClarity] = useState(() => unsetSlider());
  const [currentDepth, setCurrentDepth] = useState(() => unsetSlider());
  const [currentPerspectives, setCurrentPerspectives] = useState<string[]>([]);
  const [currentPerspectiveOther, setCurrentPerspectiveOther] = useState('');
  const [currentDescription, setCurrentDescription] = useState('');
  const [currentPatternDrawing, setCurrentPatternDrawing] = useState<string | null>(null);

  // Potential state
  const [potentialPatternShapes, setPotentialPatternShapes] = useState<string[]>([]);
  const [potentialPatterns, setPotentialPatterns] = useState<string[]>([]);
  const [potentialPatternOther, setPotentialPatternOther] = useState('');
  const [potentialClarity, setPotentialClarity] = useState(() => unsetSlider());
  const [potentialDepth, setPotentialDepth] = useState(() => unsetSlider());
  const [potentialPerspectives, setPotentialPerspectives] = useState<string[]>([]);
  const [potentialPerspectiveOther, setPotentialPerspectiveOther] = useState('');
  const [potentialDescription, setPotentialDescription] = useState('');
  const [potentialPatternDrawing, setPotentialPatternDrawing] = useState<string | null>(null);

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

  const toggleShape = (id: string, list: string[], set: (v: string[]) => void) => {
    set(list.includes(id) ? list.filter((x) => x !== id) : list.length < MAX_SHAPES ? [...list, id] : list);
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
      currentPatternShapes: currentPatternShapes.length > 0 ? currentPatternShapes : null,
      potentialPatternShapes: potentialPatternShapes.length > 0 ? potentialPatternShapes : null,
      currentPatterns: currentPatterns.length > 0 ? currentPatterns : null,
      currentPatternOther: currentPatternOther || null,
      currentClarity: sliderValue(currentClarity),
      currentDepth: sliderValue(currentDepth),
      currentPerspectives: currentPerspectives.length > 0 ? currentPerspectives : null,
      currentPerspectiveOther: currentPerspectiveOther || null,
      currentDescription: currentDescription || null,
      currentPatternDrawing: currentPatternDrawing || null,
      potentialPatterns: potentialPatterns.length > 0 ? potentialPatterns : null,
      potentialPatternOther: potentialPatternOther || null,
      potentialClarity: sliderValue(potentialClarity),
      potentialDepth: sliderValue(potentialDepth),
      potentialPerspectives: potentialPerspectives.length > 0 ? potentialPerspectives : null,
      potentialPerspectiveOther: potentialPerspectiveOther || null,
      potentialDescription: potentialDescription || null,
      potentialPatternDrawing: potentialPatternDrawing || null
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
            <PanelLogo size={32} />
            <div className="text-center">
              <h1 className="text-lg">
                Insight - Noesis
                <GatewaySubtitleLink href="https://en.wikipedia.org/wiki/Noesis" />
              </h1>
              <GatewayProgress index={currentIndex} total={totalGateways} />
            </div>
          </div>
          
          <div className="w-20" />
        </div>
      </div>

      {/* Main Content */}
      <div ref={scrollContainerRef} className="flex-1 overflow-auto scroll-container">
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
            <div className="flex justify-center">
              <Button variant="outline" size="sm" onClick={() => setShowBodyMap(true)} className="gap-2">
                <User className="size-4" />
                Open Body Map
              </Button>
            </div>
            <div className="mx-auto w-full max-w-2xl">
              <StageIntro stage={stage} />
              <StageSlot stage="present" current={stage}>
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
                    <Label id="currentPattern-shapes-label" className="text-sm">Choose a drawing that is close (optional)</Label>
                    <ShapePicker set="pattern" idPrefix="currentPattern" selected={currentPatternShapes} onToggle={(id) => toggleShape(id, currentPatternShapes, setCurrentPatternShapes)} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Pattern (optional)</Label>
                    <WordPicker category="pattern" idPrefix="currentPatterns" selected={currentPatterns} onToggle={(t) => handleCheckboxChange(t, !currentPatterns.includes(t), currentPatterns, setCurrentPatterns)} other={{ value: currentPatternOther, onChange: setCurrentPatternOther, placeholder: "Describe..." }} />
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
                    <WordPicker category="perspective" idPrefix="currentPerspectives" selected={currentPerspectives} onToggle={(t) => handleCheckboxChange(t, !currentPerspectives.includes(t), currentPerspectives, setCurrentPerspectives)} other={{ value: currentPerspectiveOther, onChange: setCurrentPerspectiveOther, placeholder: "Describe..." }} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Draw the shape of this pattern (optional)</Label>
                    <DrawingCanvas
                      strokeColor={color1}
                      onChange={setCurrentPatternDrawing}
                      placeholder="Spiraling, fragmented, web-like, layered — trace it."
                    />
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
                </CardContent>
              </Card>

              </StageSlot>
              <StageSlot stage="wish" current={stage}>
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
                    <Label id="potentialPattern-shapes-label" className="text-sm">Choose a drawing that is close (optional)</Label>
                    <ShapePicker set="pattern" idPrefix="potentialPattern" selected={potentialPatternShapes} onToggle={(id) => toggleShape(id, potentialPatternShapes, setPotentialPatternShapes)} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Pattern (optional)</Label>
                    <WordPicker category="pattern" idPrefix="potentialPatterns" selected={potentialPatterns} onToggle={(t) => handleCheckboxChange(t, !potentialPatterns.includes(t), potentialPatterns, setPotentialPatterns)} other={{ value: potentialPatternOther, onChange: setPotentialPatternOther, placeholder: "Describe..." }} />
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
                    <WordPicker category="perspective" idPrefix="potentialPerspectives" selected={potentialPerspectives} onToggle={(t) => handleCheckboxChange(t, !potentialPerspectives.includes(t), potentialPerspectives, setPotentialPerspectives)} other={{ value: potentialPerspectiveOther, onChange: setPotentialPerspectiveOther, placeholder: "Describe..." }} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Draw the shape of this pattern (optional)</Label>
                    <DrawingCanvas
                      strokeColor={color2}
                      onChange={setPotentialPatternDrawing}
                      placeholder="What shape would you rather your thinking take?"
                    />
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
                </CardContent>
              </Card>
            </StageSlot>
              <StageNav stage={stage} onChange={setStage} />
            </div>

            {/* Next Button */}
            {stage === 'wish' && (
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
            )}
          </div>
        )}

        <AppFooter />
      </div>

      {showBodyMap && (
        <BodyMapAvatar
          userColors={color1 && color2 ? { color1, color2 } : undefined}
          onClose={() => setShowBodyMap(false)}
          onSave={(data) => onUpdateBodyMap(data)}
          initialPlacements={bodyMapData.placements}
          initialNotes={bodyMapData.notes}
        />
      )}
    </div>
  );
}
