import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { ArrowLeft, ChevronRight, ArrowRight as ArrowRightIcon, User } from 'lucide-react';
import { GatewaySubtitleLink } from '../GatewaySubtitleLink';
import NenyaLogo from '../NenyaLogo';
import { SnappingSlider } from '../ui/snapping-slider';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AppFooter } from '../AppFooter';
import { BodyMapAvatar, BodyMapData } from '../BodyMapAvatar';
import { DrawingCanvas } from '../DrawingCanvas';

import { WordPicker } from '../WordPicker';
import { ShapePicker, MAX_SHAPES } from '../ShapePicker';
interface MovementGatewayPageProps {
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
    title: 'Welcome to the Movement Gateway',
    description: 'Emotions have a kinesthetic quality - they move us. In this gateway, you\'ll explore the directional flow of your inner experience.',
    detail: 'Consider how your feelings want to move: Are they rising, falling, spiraling? What direction and speed do they carry?'
  },
  {
    title: 'Following the Flow',
    description: 'You\'ll describe two kinesthetic states: where you are now (Present) and where you\'re moving toward (Potential).',
    detail: 'Trust the body\'s wisdom. Movement patterns reveal the deeper currents of our emotional landscape.'
  },
  {
    title: 'Everything is Optional',
    description: 'You can describe all dimensions or focus on just what feels most alive. Skip anything that doesn\'t resonate.',
    detail: 'This ritual adapts to whatever level of kinesthetic awareness feels accessible right now.'
  }
];

export default function MovementGatewayPage({ onComplete, onBack, currentIndex, totalGateways, userColors, bodyMapData, onUpdateBodyMap }: MovementGatewayPageProps) {
  // Step state
  const [step, setStep] = useState<'instructions' | 'selection'>('instructions');
  const [instructionCardIndex, setInstructionCardIndex] = useState(0);
  const [showBodyMap, setShowBodyMap] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Advancing between steps swaps content inside this same persistently-
  // mounted scroll container -- it never unmounts, so nothing else resets
  // its scroll position when the step changes.
  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [step]);

  // Current state
  const [currentMovementShapes, setCurrentMovementShapes] = useState<string[]>([]);
  const [currentDirections, setCurrentDirections] = useState<string[]>([]);
  const [currentDirectionOther, setCurrentDirectionOther] = useState('');
  const [currentEnergy, setCurrentEnergy] = useState([50]);
  const [currentSpeed, setCurrentSpeed] = useState([50]);
  const [currentQualities, setCurrentQualities] = useState<string[]>([]);
  const [currentQualityOther, setCurrentQualityOther] = useState('');
  const [currentDescription, setCurrentDescription] = useState('');
  const [currentMovementDrawing, setCurrentMovementDrawing] = useState<string | null>(null);

  // Potential state
  const [potentialMovementShapes, setPotentialMovementShapes] = useState<string[]>([]);
  const [potentialDirections, setPotentialDirections] = useState<string[]>([]);
  const [potentialDirectionOther, setPotentialDirectionOther] = useState('');
  const [potentialEnergy, setPotentialEnergy] = useState([50]);
  const [potentialSpeed, setPotentialSpeed] = useState([50]);
  const [potentialQualities, setPotentialQualities] = useState<string[]>([]);
  const [potentialQualityOther, setPotentialQualityOther] = useState('');
  const [potentialDescription, setPotentialDescription] = useState('');
  const [potentialMovementDrawing, setPotentialMovementDrawing] = useState<string | null>(null);

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
      currentMovementShapes: currentMovementShapes.length > 0 ? currentMovementShapes : null,
      potentialMovementShapes: potentialMovementShapes.length > 0 ? potentialMovementShapes : null,
      currentDirections: currentDirections.length > 0 ? currentDirections : null,
      currentDirectionOther: currentDirectionOther || null,
      currentEnergy: currentEnergy[0],
      currentSpeed: currentSpeed[0],
      currentQualities: currentQualities.length > 0 ? currentQualities : null,
      currentQualityOther: currentQualityOther || null,
      currentDescription: currentDescription || null,
      currentMovementDrawing: currentMovementDrawing || null,
      potentialDirections: potentialDirections.length > 0 ? potentialDirections : null,
      potentialDirectionOther: potentialDirectionOther || null,
      potentialEnergy: potentialEnergy[0],
      potentialSpeed: potentialSpeed[0],
      potentialQualities: potentialQualities.length > 0 ? potentialQualities : null,
      potentialQualityOther: potentialQualityOther || null,
      potentialDescription: potentialDescription || null,
      potentialMovementDrawing: potentialMovementDrawing || null
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
                Movement - Kinesthesia
                <GatewaySubtitleLink href="https://open.lib.umn.edu/sensationandperception/chapter/kinesthesia-and-prorioception/" />
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
                  <CardDescription>The kinesthetic qualities of where you are now</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label id="currentMovement-shapes-label" className="text-sm">Choose a drawing that is close (optional)</Label>
                    <ShapePicker set="movement" idPrefix="currentMovement" selected={currentMovementShapes} onToggle={(id) => toggleShape(id, currentMovementShapes, setCurrentMovementShapes)} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Direction (optional)</Label>
                    <WordPicker category="direction" idPrefix="currentDirections" selected={currentDirections} onToggle={(t) => handleCheckboxChange(t, !currentDirections.includes(t), currentDirections, setCurrentDirections)} other={{ value: currentDirectionOther, onChange: setCurrentDirectionOther, placeholder: "Describe..." }} />
                  </div>

                  <SnappingSlider
                    value={currentEnergy}
                    onValueChange={setCurrentEnergy}
                    label="Energy"
                    leftLabel="Depleted"
                    rightLabel="Surging"
                    max={100}
                  />

                  <SnappingSlider
                    value={currentSpeed}
                    onValueChange={setCurrentSpeed}
                    label="Speed"
                    leftLabel="Glacial"
                    rightLabel="Frenetic"
                    max={100}
                  />

                  <div className="space-y-2">
                    <Label className="text-sm">Quality (optional)</Label>
                    <WordPicker category="quality" idPrefix="currentQualities" selected={currentQualities} onToggle={(t) => handleCheckboxChange(t, !currentQualities.includes(t), currentQualities, setCurrentQualities)} other={{ value: currentQualityOther, onChange: setCurrentQualityOther, placeholder: "Describe..." }} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Draw your movement pattern (optional)</Label>
                    <DrawingCanvas
                      strokeColor={color1}
                      onChange={setCurrentMovementDrawing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Describe the movement (optional)</Label>
                    <Textarea
                      placeholder="Describe the kinesthetic qualities..."
                      value={currentDescription}
                      onChange={(e) => setCurrentDescription(e.target.value)}
                      className="min-h-20 resize-none text-sm"
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
                  <CardDescription>The kinesthetic qualities of where you're moving toward</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label id="potentialMovement-shapes-label" className="text-sm">Choose a drawing that is close (optional)</Label>
                    <ShapePicker set="movement" idPrefix="potentialMovement" selected={potentialMovementShapes} onToggle={(id) => toggleShape(id, potentialMovementShapes, setPotentialMovementShapes)} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Direction (optional)</Label>
                    <WordPicker category="direction" idPrefix="potentialDirections" selected={potentialDirections} onToggle={(t) => handleCheckboxChange(t, !potentialDirections.includes(t), potentialDirections, setPotentialDirections)} other={{ value: potentialDirectionOther, onChange: setPotentialDirectionOther, placeholder: "Describe..." }} />
                  </div>

                  <SnappingSlider
                    value={potentialEnergy}
                    onValueChange={setPotentialEnergy}
                    label="Energy"
                    leftLabel="Depleted"
                    rightLabel="Surging"
                    max={100}
                  />

                  <SnappingSlider
                    value={potentialSpeed}
                    onValueChange={setPotentialSpeed}
                    label="Speed"
                    leftLabel="Glacial"
                    rightLabel="Frenetic"
                    max={100}
                  />

                  <div className="space-y-2">
                    <Label className="text-sm">Quality (optional)</Label>
                    <WordPicker category="quality" idPrefix="potentialQualities" selected={potentialQualities} onToggle={(t) => handleCheckboxChange(t, !potentialQualities.includes(t), potentialQualities, setPotentialQualities)} other={{ value: potentialQualityOther, onChange: setPotentialQualityOther, placeholder: "Describe..." }} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Draw your movement pattern (optional)</Label>
                    <DrawingCanvas
                      strokeColor={color2}
                      onChange={setPotentialMovementDrawing}
                      placeholder="Trace the shape you're moving toward instead."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Describe the movement (optional)</Label>
                    <Textarea
                      placeholder="Describe the kinesthetic qualities you're moving toward..."
                      value={potentialDescription}
                      onChange={(e) => setPotentialDescription(e.target.value)}
                      className="min-h-20 resize-none text-sm"
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
