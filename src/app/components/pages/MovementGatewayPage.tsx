import { useState } from 'react';
import { Button } from '../ui/button';
import { ArrowLeft, ChevronRight, ArrowRight as ArrowRightIcon } from 'lucide-react';
import NenyaLogo from '../NenyaLogo';
import { SnappingSlider } from '../ui/snapping-slider';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { TermInfo } from '../TermInfo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface MovementGatewayPageProps {
  onComplete: (data: any) => void;
  onBack: () => void;
  currentIndex: number;
  totalGateways: number;
  userColors?: { color1?: string; color2?: string };
}

const directions = [
  'Upward',
  'Downward',
  'Inward',
  'Outward',
  'Expansive',
  'Contracting',
  'Spiraling',
  'Oscillating',
  'Flowing',
  'Stuck',
  'Still'
];

const qualities = [
  'Fluid',
  'Jerky',
  'Graceful',
  'Forceful',
  'Hesitant',
  'Determined',
  'Gentle',
  'Turbulent'
];

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

export default function MovementGatewayPage({ onComplete, onBack, currentIndex, totalGateways, userColors }: MovementGatewayPageProps) {
  // Step state
  const [step, setStep] = useState<'instructions' | 'selection'>('instructions');
  const [instructionCardIndex, setInstructionCardIndex] = useState(0);

  // Current state
  const [currentDirections, setCurrentDirections] = useState<string[]>([]);
  const [currentDirectionOther, setCurrentDirectionOther] = useState('');
  const [currentEnergy, setCurrentEnergy] = useState([50]);
  const [currentSpeed, setCurrentSpeed] = useState([50]);
  const [currentQualities, setCurrentQualities] = useState<string[]>([]);
  const [currentQualityOther, setCurrentQualityOther] = useState('');
  const [currentDescription, setCurrentDescription] = useState('');
  
  // Potential state
  const [potentialDirections, setPotentialDirections] = useState<string[]>([]);
  const [potentialDirectionOther, setPotentialDirectionOther] = useState('');
  const [potentialEnergy, setPotentialEnergy] = useState([50]);
  const [potentialSpeed, setPotentialSpeed] = useState([50]);
  const [potentialQualities, setPotentialQualities] = useState<string[]>([]);
  const [potentialQualityOther, setPotentialQualityOther] = useState('');
  const [potentialDescription, setPotentialDescription] = useState('');

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
      currentDirections: currentDirections.length > 0 ? currentDirections : null,
      currentDirectionOther: currentDirectionOther || null,
      currentEnergy: currentEnergy[0],
      currentSpeed: currentSpeed[0],
      currentQualities: currentQualities.length > 0 ? currentQualities : null,
      currentQualityOther: currentQualityOther || null,
      currentDescription: currentDescription || null,
      potentialDirections: potentialDirections.length > 0 ? potentialDirections : null,
      potentialDirectionOther: potentialDirectionOther || null,
      potentialEnergy: potentialEnergy[0],
      potentialSpeed: potentialSpeed[0],
      potentialQualities: potentialQualities.length > 0 ? potentialQualities : null,
      potentialQualityOther: potentialQualityOther || null,
      potentialDescription: potentialDescription || null
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
              <h1 className="text-lg">Movement - Kinesthesia</h1>
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
                  <CardDescription>The kinesthetic qualities of where you are now</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Direction (optional)</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-md p-2">
                    {directions.map((direction) => (
                      <div key={direction} className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`current-direction-${direction}`}
                            checked={currentDirections.includes(direction)}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(direction, checked as boolean, currentDirections, setCurrentDirections)
                            }
                          />
                          <label
                            htmlFor={`current-direction-${direction}`}
                            className="text-xs cursor-pointer"
                          >
                            {direction}
                          </label>
                        </div>
                        <TermInfo term={direction} category="direction" />
                      </div>
                    ))}
                    <div className="flex items-start space-x-2 pt-2 border-t border-border">
                      <Checkbox
                        id="current-direction-other"
                        checked={currentDirectionOther.length > 0}
                        onCheckedChange={(checked) => {
                          if (!checked) setCurrentDirectionOther('');
                        }}
                      />
                      <div className="flex-1">
                        <label htmlFor="current-direction-other" className="text-xs cursor-pointer block mb-1">
                          Other
                        </label>
                        <Input
                          placeholder="Describe..."
                          value={currentDirectionOther}
                          onChange={(e) => setCurrentDirectionOther(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>
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
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-md p-2">
                    {qualities.map((quality) => (
                      <div key={quality} className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`current-quality-${quality}`}
                            checked={currentQualities.includes(quality)}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(quality, checked as boolean, currentQualities, setCurrentQualities)
                            }
                          />
                          <label
                            htmlFor={`current-quality-${quality}`}
                            className="text-xs cursor-pointer"
                          >
                            {quality}
                          </label>
                        </div>
                        <TermInfo term={quality} category="quality" />
                      </div>
                    ))}
                    <div className="flex items-start space-x-2 pt-2 border-t border-border">
                      <Checkbox
                        id="current-quality-other"
                        checked={currentQualityOther.length > 0}
                        onCheckedChange={(checked) => {
                          if (!checked) setCurrentQualityOther('');
                        }}
                      />
                      <div className="flex-1">
                        <label htmlFor="current-quality-other" className="text-xs cursor-pointer block mb-1">
                          Other
                        </label>
                        <Input
                          placeholder="Describe..."
                          value={currentQualityOther}
                          onChange={(e) => setCurrentQualityOther(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>
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
                    <Label className="text-sm">Direction (optional)</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-md p-2">
                    {directions.map((direction) => (
                      <div key={direction} className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`potential-direction-${direction}`}
                            checked={potentialDirections.includes(direction)}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(direction, checked as boolean, potentialDirections, setPotentialDirections)
                            }
                          />
                          <label
                            htmlFor={`potential-direction-${direction}`}
                            className="text-xs cursor-pointer"
                          >
                            {direction}
                          </label>
                        </div>
                        <TermInfo term={direction} category="direction" />
                      </div>
                    ))}
                    <div className="flex items-start space-x-2 pt-2 border-t border-border">
                      <Checkbox
                        id="potential-direction-other"
                        checked={potentialDirectionOther.length > 0}
                        onCheckedChange={(checked) => {
                          if (!checked) setPotentialDirectionOther('');
                        }}
                      />
                      <div className="flex-1">
                        <label htmlFor="potential-direction-other" className="text-xs cursor-pointer block mb-1">
                          Other
                        </label>
                        <Input
                          placeholder="Describe..."
                          value={potentialDirectionOther}
                          onChange={(e) => setPotentialDirectionOther(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>
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
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-md p-2">
                    {qualities.map((quality) => (
                      <div key={quality} className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`potential-quality-${quality}`}
                            checked={potentialQualities.includes(quality)}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(quality, checked as boolean, potentialQualities, setPotentialQualities)
                            }
                          />
                          <label
                            htmlFor={`potential-quality-${quality}`}
                            className="text-xs cursor-pointer"
                          >
                            {quality}
                          </label>
                        </div>
                        <TermInfo term={quality} category="quality" />
                      </div>
                    ))}
                    <div className="flex items-start space-x-2 pt-2 border-t border-border">
                      <Checkbox
                        id="potential-quality-other"
                        checked={potentialQualityOther.length > 0}
                        onCheckedChange={(checked) => {
                          if (!checked) setPotentialQualityOther('');
                        }}
                      />
                      <div className="flex-1">
                        <label htmlFor="potential-quality-other" className="text-xs cursor-pointer block mb-1">
                          Other
                        </label>
                        <Input
                          placeholder="Describe..."
                          value={potentialQualityOther}
                          onChange={(e) => setPotentialQualityOther(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>
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
      </div>
    </div>
  );
}
