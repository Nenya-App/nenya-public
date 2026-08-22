import { useState } from 'react';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight, Shuffle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import NenyaLogo from '../NenyaLogo';
import { HexagonColorPicker } from '../HexagonColorPicker';
import { Input } from '../ui/input';
import { UserColors } from '../../App';
import { useTheme } from '../ThemeProvider';

interface InterfaceColorSelectionProps {
  onComplete: (colors: UserColors) => void;
  onBack: () => void;
}

type ColorPage = 'color1' | 'color2';

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

export default function InterfaceColorSelection({ onComplete, onBack }: InterfaceColorSelectionProps) {
  const { theme } = useTheme();
  const defaultColor = theme === 'dark' ? '#000000' : '#FFFFFF';
  
  const [currentPage, setCurrentPage] = useState<ColorPage>('color1');
  const [color1, setColor1] = useState(defaultColor);
  const [color2, setColor2] = useState(defaultColor);
  const [color1Name, setColor1Name] = useState('');
  const [color2Name, setColor2Name] = useState('');

  const handleSurpriseMe1 = () => {
    const randomColor = generateRandomColor();
    setColor1(hslToHex(randomColor));
    setColor1Name('');
  };

  const handleSurpriseMe2 = () => {
    const randomColor = generateRandomColor();
    setColor2(hslToHex(randomColor));
    setColor2Name('');
  };

  const handleNextPage = () => {
    if (color1) {
      setCurrentPage('color2');
    }
  };

  const handleBackPage = () => {
    setCurrentPage('color1');
  };

  const handleApply = () => {
    if (color1 && color2) {
      onComplete({
        color1,
        color2,
        color1Name: color1Name || undefined,
        color2Name: color2Name || undefined,
        color1Random: !color1Name,
        color2Random: !color2Name
      });
    }
  };

  const canContinuePresent = !!color1;
  const canApply = color1 && color2;

  return (
    <div className="size-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={currentPage === 'color1' ? onBack : handleBackPage}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          
          <div className="flex items-center gap-3">
            <NenyaLogo size={32} />
            <h1 className="text-lg">UI Colors & Hex ID</h1>
          </div>
          
          <div className="w-20" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto scroll-container">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 sm:space-y-8">
          {/* Page Indicator */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage('color1')}
              className={`h-2 w-2 rounded-full transition-all hover:scale-125 ${currentPage === 'color1' ? 'bg-primary w-8' : 'bg-muted'}`}
              aria-label="Go to first color"
            />
            <button
              onClick={() => color1 ? setCurrentPage('color2') : null}
              disabled={!color1}
              className={`h-2 w-2 rounded-full transition-all hover:scale-125 ${currentPage === 'color2' ? 'bg-primary w-8' : 'bg-muted'} ${!color1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Go to second color"
            />
          </div>

          {/* FIRST COLOR PAGE */}
          <AnimatePresence mode="wait">
            {currentPage === 'color1' && (
              <motion.div
                key="color1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Instructions */}
                <div className="text-center space-y-3">
                <h2 className="text-2xl md:text-3xl">
                  First UI Color
                </h2>
                <p className="text-muted-foreground">
                  Pick your first interface color. This will customize your session space and contribute to your temporary hex code identity.
                </p>
              </div>

              {/* Color Picker */}
              <div className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <HexagonColorPicker
                    selectedColor={color1}
                    onColorChange={setColor1}
                    size="lg"
                  />
                  <div className="text-center space-y-2 w-full max-w-xs">
                    <code className="text-sm text-muted-foreground">{color1}</code>
                    <Input
                      type="text"
                      placeholder="Optional: Name this color"
                      value={color1Name}
                      onChange={(e) => setColor1Name(e.target.value)}
                      className="text-center"
                    />
                  </div>
                </div>

                {/* Random Button */}
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleSurpriseMe1}
                    className="gap-2 px-8"
                  >
                    <Shuffle className="size-4" />
                    Random Color
                  </Button>
                </div>
              </div>

              {/* Next Button */}
              <div className="flex justify-center pt-4">
                <Button
                  size="lg"
                  onClick={handleNextPage}
                  disabled={!canContinuePresent}
                  className="gap-2 px-12"
                >
                  Next Color
                  <ArrowRight className="size-4" />
                </Button>
              </div>
              </motion.div>
            )}

            {/* SECOND COLOR PAGE */}
            {currentPage === 'color2' && (
              <motion.div
                key="color2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Instructions */}
                <div className="text-center space-y-3">
                <h2 className="text-2xl md:text-3xl">
                  Second UI Color
                </h2>
                <p className="text-muted-foreground">
                  Pick your second interface color to complete your hex code identity: {color1}.{color2 || '#______'}
                </p>
              </div>

              {/* Color Picker */}
              <div className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <HexagonColorPicker
                    selectedColor={color2}
                    onColorChange={setColor2}
                    size="lg"
                  />
                  <div className="text-center space-y-2 w-full max-w-xs">
                    <code className="text-sm text-muted-foreground">{color2}</code>
                    <Input
                      type="text"
                      placeholder="Optional: Name this color"
                      value={color2Name}
                      onChange={(e) => setColor2Name(e.target.value)}
                      className="text-center"
                    />
                  </div>
                </div>

                {/* Random Button */}
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleSurpriseMe2}
                    className="gap-2 px-8"
                  >
                    <Shuffle className="size-4" />
                    Random Color
                  </Button>
                </div>
              </div>

              {/* Apply Button */}
              <div className="flex justify-center pt-4">
                <Button
                  size="lg"
                  onClick={handleApply}
                  disabled={!canApply}
                  className="px-12"
                >
                  Apply & Enter Session
                </Button>
              </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
