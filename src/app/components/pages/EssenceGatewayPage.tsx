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

interface EssenceGatewayPageProps {
  onComplete: (data: any) => void;
  onBack: () => void;
  currentIndex: number;
  totalGateways: number;
  userColors?: { color1?: string; color2?: string };
}

const tastes = [
  'Bitter',
  'Sweet',
  'Sour',
  'Salty',
  'Umami',
  'Astringent',
  'Pungent',
  'Metallic'
];

const scents = [
  'Earthy',
  'Floral',
  'Citrus',
  'Woody',
  'Smoky',
  'Musky',
  'Fresh',
  'Spicy',
  'Sweet',
  'Sharp',
  'Herbal',
  'Ocean'
];

const INSTRUCTION_CARDS = [
  {
    title: 'Welcome to the Essence Gateway',
    description: 'Scent and taste evoke memory and emotion in profound ways. In this gateway, you\'ll explore the aromatic qualities of your inner atmosphere.',
    detail: 'Consider the flavors and aromas that capture how you feel. What essences resonate with your current state?'
  },
  {
    title: 'Exploring Your Essence',
    description: 'You\'ll describe two aromatic states: where you are now (Present) and where you\'re moving toward (Potential).',
    detail: 'Trust what arises. The scents and tastes that come to mind carry meaningful information about your experience.'
  },
  {
    title: 'Everything is Optional',
    description: 'You can select from our suggestions or describe your own. Skip anything that doesn\'t resonate.',
    detail: 'This ritual adapts to whatever level of sensory awareness feels accessible right now.'
  }
];

export default function EssenceGatewayPage({ onComplete, onBack, currentIndex, totalGateways, userColors }: EssenceGatewayPageProps) {
  // Step state
  const [step, setStep] = useState<'instructions' | 'selection'>('instructions');
  const [instructionCardIndex, setInstructionCardIndex] = useState(0);

  // Current state
  const [currentTastes, setCurrentTastes] = useState<string[]>([]);
  const [currentTasteOther, setCurrentTasteOther] = useState('');
  const [currentScents, setCurrentScents] = useState<string[]>([]);
  const [currentScentOther, setCurrentScentOther] = useState('');
  const [currentIntensity, setCurrentIntensity] = useState([50]);
  const [currentDescription, setCurrentDescription] = useState('');
  
  // Potential state
  const [potentialTastes, setPotentialTastes] = useState<string[]>([]);
  const [potentialTasteOther, setPotentialTasteOther] = useState('');
  const [potentialScents, setPotentialScents] = useState<string[]>([]);
  const [potentialScentOther, setPotentialScentOther] = useState('');
  const [potentialIntensity, setPotentialIntensity] = useState([50]);
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
      currentTastes: currentTastes.length > 0 ? currentTastes : null,
      currentTasteOther: currentTasteOther || null,
      currentScents: currentScents.length > 0 ? currentScents : null,
      currentScentOther: currentScentOther || null,
      currentIntensity: currentIntensity[0],
      currentDescription: currentDescription || null,
      potentialTastes: potentialTastes.length > 0 ? potentialTastes : null,
      potentialTasteOther: potentialTasteOther || null,
      potentialScents: potentialScents.length > 0 ? potentialScents : null,
      potentialScentOther: potentialScentOther || null,
      potentialIntensity: potentialIntensity[0],
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
              <h1 className="text-lg">Essence - Atmosphere</h1>
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
                  <CardDescription>The aromatic qualities of where you are now</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-sm">Taste (optional)</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-md p-2">
                    {tastes.map((taste) => (
                      <div key={taste} className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`current-taste-${taste}`}
                            checked={currentTastes.includes(taste)}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(taste, checked as boolean, currentTastes, setCurrentTastes)
                            }
                          />
                          <label
                            htmlFor={`current-taste-${taste}`}
                            className="text-xs cursor-pointer"
                          >
                            {taste}
                          </label>
                        </div>
                        <TermInfo term={taste} category="taste" />
                      </div>
                    ))}
                    <div className="flex items-start space-x-2 pt-2 border-t border-border">
                      <Checkbox
                        id="current-taste-other"
                        checked={currentTasteOther.length > 0}
                        onCheckedChange={(checked) => {
                          if (!checked) setCurrentTasteOther('');
                        }}
                      />
                      <div className="flex-1">
                        <label htmlFor="current-taste-other" className="text-xs cursor-pointer block mb-1">
                          Other
                        </label>
                        <Input
                          placeholder="Describe..."
                          value={currentTasteOther}
                          onChange={(e) => setCurrentTasteOther(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Scent (optional)</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-md p-2">
                    {scents.map((scent) => (
                      <div key={scent} className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`current-scent-${scent}`}
                            checked={currentScents.includes(scent)}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(scent, checked as boolean, currentScents, setCurrentScents)
                            }
                          />
                          <label
                            htmlFor={`current-scent-${scent}`}
                            className="text-xs cursor-pointer"
                          >
                            {scent}
                          </label>
                        </div>
                        <TermInfo term={scent} category="scent" />
                      </div>
                    ))}
                    <div className="flex items-start space-x-2 pt-2 border-t border-border">
                      <Checkbox
                        id="current-scent-other"
                        checked={currentScentOther.length > 0}
                        onCheckedChange={(checked) => {
                          if (!checked) setCurrentScentOther('');
                        }}
                      />
                      <div className="flex-1">
                        <label htmlFor="current-scent-other" className="text-xs cursor-pointer block mb-1">
                          Other
                        </label>
                        <Input
                          placeholder="Describe..."
                          value={currentScentOther}
                          onChange={(e) => setCurrentScentOther(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  </div>

                  <SnappingSlider
                    value={currentIntensity}
                    onValueChange={setCurrentIntensity}
                    label="Intensity"
                    leftLabel="Faint"
                    rightLabel="Overwhelming"
                    max={100}
                  />

                  <div className="space-y-2">
                    <Label className="text-sm">Describe the essence (optional)</Label>
                    <Textarea
                      placeholder="What aromas or flavors come to mind?"
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
                  <CardDescription>The aromatic qualities of where you're moving toward</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-sm">Taste (optional)</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-md p-2">
                    {tastes.map((taste) => (
                      <div key={taste} className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`potential-taste-${taste}`}
                            checked={potentialTastes.includes(taste)}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(taste, checked as boolean, potentialTastes, setPotentialTastes)
                            }
                          />
                          <label
                            htmlFor={`potential-taste-${taste}`}
                            className="text-xs cursor-pointer"
                          >
                            {taste}
                          </label>
                        </div>
                        <TermInfo term={taste} category="taste" />
                      </div>
                    ))}
                    <div className="flex items-start space-x-2 pt-2 border-t border-border">
                      <Checkbox
                        id="potential-taste-other"
                        checked={potentialTasteOther.length > 0}
                        onCheckedChange={(checked) => {
                          if (!checked) setPotentialTasteOther('');
                        }}
                      />
                      <div className="flex-1">
                        <label htmlFor="potential-taste-other" className="text-xs cursor-pointer block mb-1">
                          Other
                        </label>
                        <Input
                          placeholder="Describe..."
                          value={potentialTasteOther}
                          onChange={(e) => setPotentialTasteOther(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Scent (optional)</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-md p-2">
                    {scents.map((scent) => (
                      <div key={scent} className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`potential-scent-${scent}`}
                            checked={potentialScents.includes(scent)}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(scent, checked as boolean, potentialScents, setPotentialScents)
                            }
                          />
                          <label
                            htmlFor={`potential-scent-${scent}`}
                            className="text-xs cursor-pointer"
                          >
                            {scent}
                          </label>
                        </div>
                        <TermInfo term={scent} category="scent" />
                      </div>
                    ))}
                    <div className="flex items-start space-x-2 pt-2 border-t border-border">
                      <Checkbox
                        id="potential-scent-other"
                        checked={potentialScentOther.length > 0}
                        onCheckedChange={(checked) => {
                          if (!checked) setPotentialScentOther('');
                        }}
                      />
                      <div className="flex-1">
                        <label htmlFor="potential-scent-other" className="text-xs cursor-pointer block mb-1">
                          Other
                        </label>
                        <Input
                          placeholder="Describe..."
                          value={potentialScentOther}
                          onChange={(e) => setPotentialScentOther(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  </div>

                  <SnappingSlider
                    value={potentialIntensity}
                    onValueChange={setPotentialIntensity}
                    label="Intensity"
                    leftLabel="Faint"
                    rightLabel="Overwhelming"
                    max={100}
                  />

                  <div className="space-y-2">
                    <Label className="text-sm">Describe the essence (optional)</Label>
                    <Textarea
                      placeholder="What aromas or flavors would you like to move toward?"
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
