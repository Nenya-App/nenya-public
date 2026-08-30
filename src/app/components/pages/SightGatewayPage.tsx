import { useState } from 'react';
import { Button } from '../ui/button';
import { ArrowLeft, Shuffle, User, Palette, ChevronRight, ArrowRight as ArrowRightIcon } from 'lucide-react';
import { GatewaySubtitleLink } from '../GatewaySubtitleLink';
import NenyaLogo from '../NenyaLogo';
import { ValarColorPicker } from '../ValarColorPicker';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { UserColors } from '../../App';
import { useTheme } from '../ThemeProvider';
import { BodyMapAvatar, BodyMapData } from '../BodyMapAvatar';
import { TermInfo } from '../TermInfo';
import { ScrollIndicator } from '../ScrollIndicator';
import { AppFooter } from '../AppFooter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface SightGatewayPageProps {
  onComplete: (data: UserColors & { gradientDirection?: string }) => void;
  onBack: () => void;
  currentIndex: number;
  totalGateways: number;
  bodyMapData: BodyMapData;
  onUpdateBodyMap: (data: BodyMapData) => void;
}

const generateRandomColor = () => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 60 + Math.floor(Math.random() * 30);
  const lightness = 40 + Math.floor(Math.random() * 30);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const hslToHex = (hsl: string): string => {
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return hsl;
  
  const h = parseInt(match[1]) / 360;
  const s = parseInt(match[2]) / 100;
  const l = parseInt(match[3]) / 100;
  
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const LIGHT_QUALITIES = [
  'Steady',
  'Pulsing',
  'Flickering',
  'Glowing',
  'Shimmering',
  'Radiating',
  'Fading',
  'Intensifying',
];

const MAX_DESCRIPTION_LENGTH = 150;

const INSTRUCTION_CARDS = [
  {
    title: 'Welcome to the Sight Gateway',
    description: 'Color is a language deeper than words. In this gateway, you\'ll select two colors to represent your inner landscape.',
    detail: 'There are no right or wrong choices. Trust your immediate response to color.'
  },
  {
    title: 'Two Colors, Two States',
    description: 'You\'ll choose one color for where you are now (Current), and one for how you wish to feel (Wish).',
    detail: 'These colors will personalize your session space and help you explore your emotional landscape.'
  },
  {
    title: 'Everything is Optional',
    description: 'You can name your colors, describe their qualities, or skip these entirely. You can even randomize your selection.',
    detail: 'The ritual adapts to whatever level of reflection feels right for you in this moment.'
  }
];

export default function SightGatewayPage({ onComplete, onBack, currentIndex, totalGateways, bodyMapData, onUpdateBodyMap }: SightGatewayPageProps) {
  const { theme } = useTheme();

  // Step state: 'instructions' or 'selection'
  const [step, setStep] = useState<'instructions' | 'selection'>('instructions');
  const [instructionCardIndex, setInstructionCardIndex] = useState(0);

  // Set default colors based on theme: dark mode = white, light mode = black
  const [color1, setColor1] = useState(theme === 'dark' ? '#FFFFFF' : '#000000');
  const [color2, setColor2] = useState(theme === 'dark' ? '#FFFFFF' : '#000000');
  const [color1Name, setColor1Name] = useState('');
  const [color2Name, setColor2Name] = useState('');
  const [color1Qualities, setColor1Qualities] = useState<string[]>([]);
  const [color2Qualities, setColor2Qualities] = useState<string[]>([]);
  const [color1Intensity, setColor1Intensity] = useState(50);
  const [color2Intensity, setColor2Intensity] = useState(50);
  const [gradientDirection, setGradientDirection] = useState('to-right');
  const [showBodyMap, setShowBodyMap] = useState(false);
  const [activeColorPicker, setActiveColorPicker] = useState<'present' | 'potential' | null>(null);
  // bodyMapData/onUpdateBodyMap come from props -- shared App-level state
  // accessible from every gateway, not local to Sight.

  const handleSurpriseMe = () => {
    const randomColor1 = generateRandomColor();
    const randomColor2 = generateRandomColor();
    setColor1(hslToHex(randomColor1));
    setColor2(hslToHex(randomColor2));
    setColor1Name('');
    setColor2Name('');
    setColor1Qualities([]);
    setColor2Qualities([]);
    setColor1Intensity(50);
    setColor2Intensity(50);
  };

  const handleNext = () => {
    onComplete({
      color1: color1,
      color2: color2,
      color1Name: color1Name.trim() || null,
      color2Name: color2Name.trim() || null,
      color1Random: !color1Name.trim(),
      color2Random: !color2Name.trim(),
      color1Qualities: color1Qualities.length > 0 ? color1Qualities : null,
      color2Qualities: color2Qualities.length > 0 ? color2Qualities : null,
      color1Intensity,
      color2Intensity,
      gradientDirection,
    });
  };

  const toggleQuality = (colorNum: 1 | 2, quality: string) => {
    if (colorNum === 1) {
      setColor1Qualities(prev =>
        prev.includes(quality)
          ? prev.filter(q => q !== quality)
          : [...prev, quality]
      );
    } else {
      setColor2Qualities(prev =>
        prev.includes(quality)
          ? prev.filter(q => q !== quality)
          : [...prev, quality]
      );
    }
  };

  const handleNextInstructionCard = () => {
    if (instructionCardIndex < INSTRUCTION_CARDS.length - 1) {
      setInstructionCardIndex(instructionCardIndex + 1);
    } else {
      setStep('selection');
    }
  };

  const canContinue = true; // All fields are optional

  return (
    <>
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
                  Sight - Chromesthesia
                  <GatewaySubtitleLink href="https://en.wikipedia.org/wiki/Chromesthesia" />
                </h1>
                <p className="text-xs text-muted-foreground">
                  Gateway {currentIndex + 1} of {totalGateways}
                </p>
              </div>
            </div>

            <div className="w-20" /> {/* Spacer for balance */}
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
            /* Color Selection */
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12 space-y-6 sm:space-y-8">
              {/* Quick Actions */}
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleSurpriseMe}
                  className="gap-2"
                >
                  <Shuffle className="size-4" />
                  Surprise Me
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowBodyMap(true)}
                  className="gap-2"
                >
                  <User className="size-4" />
                  Map Colors to Body
                </Button>
              </div>

              {/* Two Color Cards Side by Side */}
              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                {/* Present State Card */}
                <Card
                  className="cursor-pointer transition-all hover:shadow-lg overflow-hidden"
                  style={{
                    boxShadow: `0 0 20px ${color1}40, 0 0 40px ${color1}20`,
                    borderColor: `${color1}60`,
                    borderWidth: '2px'
                  }}
                  onClick={() => setActiveColorPicker('present')}
                >
                  <div
                    className="h-32 md:h-40 relative group"
                    style={{ backgroundColor: color1 }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                      <Palette className="size-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Current State
                      <code className="text-xs text-muted-foreground font-mono">{color1}</code>
                    </CardTitle>
                    <CardDescription>
                      Where you are now
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Name or Describe */}
                    <div className="space-y-2">
                      <Label htmlFor="color1-name" className="text-sm">
                        Name or describe <span className="text-muted-foreground italic">(optional)</span>
                      </Label>
                      <Textarea
                        id="color1-name"
                        placeholder="e.g., 'Dawn Breaking' or 'Like autumn leaves'"
                        value={color1Name}
                        onChange={(e) => {
                          if (e.target.value.length <= MAX_DESCRIPTION_LENGTH) {
                            setColor1Name(e.target.value);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="resize-none h-20 text-sm"
                        maxLength={MAX_DESCRIPTION_LENGTH}
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {color1Name.length}/{MAX_DESCRIPTION_LENGTH}
                      </p>
                    </div>

                    {/* Light Qualities */}
                    <div className="space-y-2">
                      <Label className="text-sm">Quality of this light (optional)</Label>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-border rounded-md p-2">
                        {LIGHT_QUALITIES.map((quality) => (
                          <div key={quality} className="flex items-center space-x-2">
                            <Checkbox
                              id={`color1-${quality}`}
                              checked={color1Qualities.includes(quality)}
                              onCheckedChange={(checked) => {
                                toggleQuality(1, quality);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <label
                              htmlFor={`color1-${quality}`}
                              className="text-xs cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {quality}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Intensity Slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="color1-intensity" className="text-sm">
                          Intensity
                        </Label>
                        <span className="text-xs text-muted-foreground">
                          {color1Intensity}
                        </span>
                      </div>
                      <Slider
                        id="color1-intensity"
                        min={0}
                        max={100}
                        step={1}
                        value={[color1Intensity]}
                        onValueChange={(values) => setColor1Intensity(values[0])}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Potential State Card */}
                <Card
                  className="cursor-pointer transition-all hover:shadow-lg overflow-hidden"
                  style={{
                    boxShadow: `0 0 20px ${color2}40, 0 0 40px ${color2}20`,
                    borderColor: `${color2}60`,
                    borderWidth: '2px'
                  }}
                  onClick={() => setActiveColorPicker('potential')}
                >
                  <div
                    className="h-32 md:h-40 relative group"
                    style={{ backgroundColor: color2 }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                      <Palette className="size-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Wish State
                      <code className="text-xs text-muted-foreground font-mono">{color2}</code>
                    </CardTitle>
                    <CardDescription>
                      How you wish to feel
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Name or Describe */}
                    <div className="space-y-2">
                      <Label htmlFor="color2-name" className="text-sm">
                        Name or describe <span className="text-muted-foreground italic">(optional)</span>
                      </Label>
                      <Textarea
                        id="color2-name"
                        placeholder="e.g., 'Ocean Depth' or 'Like sunlight through honey'"
                        value={color2Name}
                        onChange={(e) => {
                          if (e.target.value.length <= MAX_DESCRIPTION_LENGTH) {
                            setColor2Name(e.target.value);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="resize-none h-20 text-sm"
                        maxLength={MAX_DESCRIPTION_LENGTH}
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {color2Name.length}/{MAX_DESCRIPTION_LENGTH}
                      </p>
                    </div>

                    {/* Light Qualities */}
                    <div className="space-y-2">
                      <Label className="text-sm">Quality of this light (optional)</Label>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-border rounded-md p-2">
                        {LIGHT_QUALITIES.map((quality) => (
                          <div key={quality} className="flex items-center space-x-2">
                            <Checkbox
                              id={`color2-${quality}`}
                              checked={color2Qualities.includes(quality)}
                              onCheckedChange={(checked) => {
                                toggleQuality(2, quality);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <label
                              htmlFor={`color2-${quality}`}
                              className="text-xs cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {quality}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Intensity Slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="color2-intensity" className="text-sm">
                          Intensity
                        </Label>
                        <span className="text-xs text-muted-foreground">
                          {color2Intensity}
                        </span>
                      </div>
                      <Slider
                        id="color2-intensity"
                        min={0}
                        max={100}
                        step={1}
                        value={[color2Intensity]}
                        onValueChange={(values) => setColor2Intensity(values[0])}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full"
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
                  {currentIndex + 1 < totalGateways ? 'Next Gateway' : 'Enter Session'}
                </Button>
              </div>
            </div>
          )}

          <AppFooter />
        </div>
        <ScrollIndicator />
      </div>

      {/* Body Map Avatar Modal */}
      {showBodyMap && (
        <BodyMapAvatar
          userColors={{ color1, color2, color1Name, color2Name }}
          onClose={() => setShowBodyMap(false)}
          onSave={(data) => onUpdateBodyMap(data)}
          initialPlacements={bodyMapData.placements}
          initialNotes={bodyMapData.notes}
        />
      )}

      {/* Present Color Picker Dialog */}
      <Dialog open={activeColorPicker === 'present'} onOpenChange={(open) => !open && setActiveColorPicker(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto w-[95vw] sm:w-auto">
          <DialogHeader>
            <DialogTitle>Select Current State Color</DialogTitle>
            <DialogDescription>
              Choose a color that represents where you are now. Browse the Valar palettes or enter a custom color below.
            </DialogDescription>
          </DialogHeader>
          <ValarColorPicker
            selectedColor={color1}
            onColorChange={(color) => {
              setColor1(color);
            }}
            size="md"
            otherColor={color2}
            onClose={() => setActiveColorPicker(null)}
          />
        </DialogContent>
      </Dialog>

      {/* Potential Color Picker Dialog */}
      <Dialog open={activeColorPicker === 'potential'} onOpenChange={(open) => !open && setActiveColorPicker(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto w-[95vw] sm:w-auto">
          <DialogHeader>
            <DialogTitle>Select Wish State Color</DialogTitle>
            <DialogDescription>
              Choose a color for how you wish to feel. Browse the Valar palettes or enter a custom color below.
            </DialogDescription>
          </DialogHeader>
          <ValarColorPicker
            selectedColor={color2}
            onColorChange={(color) => {
              setColor2(color);
            }}
            size="md"
            otherColor={color1}
            onClose={() => setActiveColorPicker(null)}
          />
        </DialogContent>
      </Dialog>

    </>
  );
}