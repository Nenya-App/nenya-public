import { useState, useEffect, useRef } from 'react';
import { StageSlot, StageIntro, StageNav, type PairStage } from '../GatewayStages';
import { GatewayProgress } from '../GatewayProgress';
import { TextureCredits } from '../TextureCredits';
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
import { TouchSurfaceField } from '../TouchSurfaceField';

interface TouchGatewayPageProps {
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
    title: 'Welcome to the Touch Gateway',
    description: 'Physical sensations carry deep emotional information. In this gateway, you\'ll explore the tactile landscape of your inner experience.',
    detail: 'Consider texture, temperature, pressure, weight, and sharpness. These physical qualities often mirror our emotional states.'
  },
  {
    title: 'Sensing Your States',
    description: 'You\'ll describe two tactile experiences: where you are now (Present) and where you\'re moving toward (Potential).',
    detail: 'Trust your bodily wisdom. The sensations that arise are meaningful, even if you can\'t explain why.'
  },
  {
    title: 'Everything is Optional',
    description: 'You can describe all five dimensions or focus on just one. Skip anything that doesn\'t resonate.',
    detail: 'This ritual adapts to whatever level of somatic awareness feels accessible right now.'
  }
];

export default function TouchGatewayPage({ onComplete, onBack, currentIndex, totalGateways, userColors, bodyMapData, onUpdateBodyMap }: TouchGatewayPageProps) {
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
  const [currentSurface, setCurrentSurface] = useState<string | null>(null);
  const [currentTexture, setCurrentTexture] = useState(() => unsetSlider());
  const [currentTemperature, setCurrentTemperature] = useState(() => unsetSlider());
  const [currentPressure, setCurrentPressure] = useState(() => unsetSlider());
  const [currentWeight, setCurrentWeight] = useState(() => unsetSlider());
  const [currentSharpness, setCurrentSharpness] = useState(() => unsetSlider());
  const [currentDescription, setCurrentDescription] = useState('');

  // Potential state
  const [potentialSurface, setPotentialSurface] = useState<string | null>(null);
  const [potentialTexture, setPotentialTexture] = useState(() => unsetSlider());
  const [potentialTemperature, setPotentialTemperature] = useState(() => unsetSlider());
  const [potentialPressure, setPotentialPressure] = useState(() => unsetSlider());
  const [potentialWeight, setPotentialWeight] = useState(() => unsetSlider());
  const [potentialSharpness, setPotentialSharpness] = useState(() => unsetSlider());
  const [potentialDescription, setPotentialDescription] = useState('');

  const handleNextInstructionCard = () => {
    if (instructionCardIndex < INSTRUCTION_CARDS.length - 1) {
      setInstructionCardIndex(instructionCardIndex + 1);
    } else {
      setStep('selection');
    }
  };

  const handleNext = () => {
    onComplete({
      currentSurface,
      currentTexture: sliderValue(currentTexture),
      currentTemperature: sliderValue(currentTemperature),
      currentPressure: sliderValue(currentPressure),
      currentWeight: sliderValue(currentWeight),
      currentSharpness: sliderValue(currentSharpness),
      currentDescription: currentDescription || null,
      potentialSurface,
      potentialTexture: sliderValue(potentialTexture),
      potentialTemperature: sliderValue(potentialTemperature),
      potentialPressure: sliderValue(potentialPressure),
      potentialWeight: sliderValue(potentialWeight),
      potentialSharpness: sliderValue(potentialSharpness),
      potentialDescription: potentialDescription || null
    });
  };

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
                Touch - Somatosensation
                <GatewaySubtitleLink href="https://www.ncbi.nlm.nih.gov/books/NBK583711/" />
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
                  <CardDescription>The tactile qualities of where you are now</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <TouchSurfaceField stateName="Present" value={currentSurface} onChange={setCurrentSurface} slider={currentTexture[0]} onMatchSlider={(v) => setCurrentTexture([v])} />

                  <SnappingSlider
                    value={currentTexture}
                    onValueChange={setCurrentTexture}
                    label="Texture"
                    leftLabel="Rough"
                    rightLabel="Smooth"
                    max={100}
                  />

                  <SnappingSlider
                    value={currentTemperature}
                    onValueChange={setCurrentTemperature}
                    label="Temperature"
                    leftLabel="Frozen"
                    rightLabel="Burning"
                    max={100}
                  />

                  <SnappingSlider
                    value={currentPressure}
                    onValueChange={setCurrentPressure}
                    label="Pressure"
                    leftLabel="Loose"
                    rightLabel="Compressed"
                    max={100}
                  />

                  <SnappingSlider
                    value={currentWeight}
                    onValueChange={setCurrentWeight}
                    label="Weight"
                    leftLabel="Weightless"
                    rightLabel="Heavy"
                    max={100}
                  />

                  <SnappingSlider
                    value={currentSharpness}
                    onValueChange={setCurrentSharpness}
                    label="Sharpness"
                    leftLabel="Blunt"
                    rightLabel="Sharp"
                    max={100}
                  />

                  <div className="space-y-2">
                    <Label className="text-sm">Describe the sensations (optional)</Label>
                    <Textarea
                      placeholder="Describe the tactile qualities..."
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
                  <CardDescription>The tactile qualities of where you wish to be</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <TouchSurfaceField stateName="Wish" value={potentialSurface} onChange={setPotentialSurface} slider={potentialTexture[0]} onMatchSlider={(v) => setPotentialTexture([v])} />

                  <SnappingSlider
                    value={potentialTexture}
                    onValueChange={setPotentialTexture}
                    label="Texture"
                    leftLabel="Rough"
                    rightLabel="Smooth"
                    max={100}
                  />

                  <SnappingSlider
                    value={potentialTemperature}
                    onValueChange={setPotentialTemperature}
                    label="Temperature"
                    leftLabel="Frozen"
                    rightLabel="Burning"
                    max={100}
                  />

                  <SnappingSlider
                    value={potentialPressure}
                    onValueChange={setPotentialPressure}
                    label="Pressure"
                    leftLabel="Loose"
                    rightLabel="Compressed"
                    max={100}
                  />

                  <SnappingSlider
                    value={potentialWeight}
                    onValueChange={setPotentialWeight}
                    label="Weight"
                    leftLabel="Weightless"
                    rightLabel="Heavy"
                    max={100}
                  />

                  <SnappingSlider
                    value={potentialSharpness}
                    onValueChange={setPotentialSharpness}
                    label="Sharpness"
                    leftLabel="Blunt"
                    rightLabel="Sharp"
                    max={100}
                  />

                  <div className="space-y-2">
                    <Label className="text-sm">Describe the sensations (optional)</Label>
                    <Textarea
                      placeholder="Describe the tactile qualities you're moving toward..."
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
            <TextureCredits />
            {stage === 'wish' && (
            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                onClick={handleNext}
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
