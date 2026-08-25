import { useState } from 'react';
import { Button } from '../ui/button';
import { ArrowLeft, ChevronRight, ArrowRight as ArrowRightIcon } from 'lucide-react';
import { GatewaySubtitleLink } from '../GatewaySubtitleLink';
import NenyaLogo from '../NenyaLogo';
import { SnappingSlider } from '../ui/snapping-slider';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AppFooter } from '../AppFooter';

interface TouchGatewayPageProps {
  onComplete: (data: any) => void;
  onBack: () => void;
  currentIndex: number;
  totalGateways: number;
  userColors?: { color1?: string; color2?: string };
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

export default function TouchGatewayPage({ onComplete, onBack, currentIndex, totalGateways, userColors }: TouchGatewayPageProps) {
  // Step state
  const [step, setStep] = useState<'instructions' | 'selection'>('instructions');
  const [instructionCardIndex, setInstructionCardIndex] = useState(0);

  // Current state
  const [currentTexture, setCurrentTexture] = useState([50]);
  const [currentTemperature, setCurrentTemperature] = useState([50]);
  const [currentPressure, setCurrentPressure] = useState([50]);
  const [currentWeight, setCurrentWeight] = useState([50]);
  const [currentSharpness, setCurrentSharpness] = useState([50]);
  const [currentDescription, setCurrentDescription] = useState('');

  // Potential state
  const [potentialTexture, setPotentialTexture] = useState([50]);
  const [potentialTemperature, setPotentialTemperature] = useState([50]);
  const [potentialPressure, setPotentialPressure] = useState([50]);
  const [potentialWeight, setPotentialWeight] = useState([50]);
  const [potentialSharpness, setPotentialSharpness] = useState([50]);
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
      currentTexture: currentTexture[0],
      currentTemperature: currentTemperature[0],
      currentPressure: currentPressure[0],
      currentWeight: currentWeight[0],
      currentSharpness: currentSharpness[0],
      currentDescription: currentDescription || null,
      potentialTexture: potentialTexture[0],
      potentialTemperature: potentialTemperature[0],
      potentialPressure: potentialPressure[0],
      potentialWeight: potentialWeight[0],
      potentialSharpness: potentialSharpness[0],
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
            <NenyaLogo size={32} />
            <div className="text-center">
              <h1 className="text-lg">
                Touch - Somatosensation
                <GatewaySubtitleLink href="https://www.ncbi.nlm.nih.gov/books/NBK583711/" />
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
                  <CardDescription>The tactile qualities of where you are now</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
            </div>

            {/* Next Button */}
            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                onClick={handleNext}
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
