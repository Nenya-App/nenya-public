import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { X, Scroll, Sparkles, Plus, Download } from 'lucide-react';
import { Card } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Badge } from './ui/badge';

interface BodyPart {
  id: string;
  label: string;
  position: { x: number; y: number };
  radius: number;
}

interface ColorPlacement {
  bodyPartId: string;
  color: string;
  colorName?: string;
}

export interface BodyMapData {
  placements: ColorPlacement[];
  imageDataUrl?: string;
}

interface BodyMapAvatarProps {
  userColors: { color1: string; color2: string; color1Name?: string; color2Name?: string };
  onClose: () => void;
  onSave?: (bodyMapData: BodyMapData) => void;
  initialPlacements?: ColorPlacement[];
}

const bodyParts: BodyPart[] = [
  { id: 'head', label: 'Head', position: { x: 150, y: 50 }, radius: 30 },
  { id: 'throat', label: 'Throat', position: { x: 150, y: 95 }, radius: 15 },
  { id: 'chest', label: 'Chest', position: { x: 150, y: 140 }, radius: 35 },
  { id: 'stomach', label: 'Stomach', position: { x: 150, y: 200 }, radius: 30 },
  { id: 'left-shoulder', label: 'L. Shoulder', position: { x: 100, y: 120 }, radius: 20 },
  { id: 'right-shoulder', label: 'R. Shoulder', position: { x: 200, y: 120 }, radius: 20 },
  { id: 'left-arm', label: 'L. Arm', position: { x: 75, y: 180 }, radius: 18 },
  { id: 'right-arm', label: 'R. Arm', position: { x: 225, y: 180 }, radius: 18 },
  { id: 'left-hand', label: 'L. Hand', position: { x: 60, y: 240 }, radius: 15 },
  { id: 'right-hand', label: 'R. Hand', position: { x: 240, y: 240 }, radius: 15 },
  { id: 'pelvis', label: 'Pelvis', position: { x: 150, y: 250 }, radius: 25 },
  { id: 'left-leg', label: 'L. Leg', position: { x: 120, y: 320 }, radius: 18 },
  { id: 'right-leg', label: 'R. Leg', position: { x: 180, y: 320 }, radius: 18 },
  { id: 'left-foot', label: 'L. Foot', position: { x: 110, y: 390 }, radius: 15 },
  { id: 'right-foot', label: 'R. Foot', position: { x: 190, y: 390 }, radius: 15 },
];

export function BodyMapAvatar({ userColors, onClose, onSave, initialPlacements = [] }: BodyMapAvatarProps) {
  const [placements, setPlacements] = useState<ColorPlacement[]>(initialPlacements);
  const [selectedColor, setSelectedColor] = useState<string>(userColors.color1);
  const [selectedColorName, setSelectedColorName] = useState<string | undefined>(userColors.color1Name);
  const [hasArchivistJournal, setHasArchivistJournal] = useState(false);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [availableColors, setAvailableColors] = useState([
    { color: userColors.color1, name: userColors.color1Name },
    { color: userColors.color2, name: userColors.color2Name },
  ]);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleBodyPartClick = (bodyPartId: string) => {
    // Remove existing placement for this body part
    const filtered = placements.filter(p => p.bodyPartId !== bodyPartId);
    
    // Add new placement
    setPlacements([
      ...filtered,
      { bodyPartId, color: selectedColor, colorName: selectedColorName }
    ]);
  };

  const handleRemovePlacement = (bodyPartId: string) => {
    setPlacements(placements.filter(p => p.bodyPartId !== bodyPartId));
  };

  const handleAddColor = () => {
    if (!hasArchivistJournal) {
      setShowIntegrationModal(true);
    } else {
      // Generate a random color
      const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
      setAvailableColors([...availableColors, { color: randomColor, name: 'Custom Color' }]);
      setSelectedColor(randomColor);
      setSelectedColorName('Custom Color');
    }
  };

  const getPlacementForBodyPart = (bodyPartId: string) => {
    return placements.find(p => p.bodyPartId === bodyPartId);
  };

  const generateBodyMapImage = async (): Promise<string> => {
    if (!svgRef.current) return '';

    try {
      // Clone the SVG to avoid modifying the original
      const svgClone = svgRef.current.cloneNode(true) as SVGSVGElement;
      
      // Convert current color to actual color for the outline
      const computedStyle = getComputedStyle(svgRef.current);
      const currentColor = computedStyle.color || '#000000';
      
      // Replace 'currentColor' with actual color value in the clone
      const allElements = svgClone.querySelectorAll('[stroke="currentColor"]');
      allElements.forEach(el => {
        el.setAttribute('stroke', currentColor);
      });

      // Serialize the SVG
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(svgClone);
      
      // Add white background for better visibility
      svgString = svgString.replace(
        '<svg',
        '<svg style="background-color: white;"'
      );

      // Create a blob from the SVG string
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      // Create an image element to convert SVG to canvas
      const img = new Image();
      
      return new Promise((resolve) => {
        img.onload = () => {
          // Create canvas
          const canvas = document.createElement('canvas');
          canvas.width = 600; // 2x for better quality
          canvas.height = 840; // 2x for better quality
          const ctx = canvas.getContext('2d');

          if (ctx) {
            // Fill white background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw the image
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Convert canvas to data URL
            const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
            URL.revokeObjectURL(url);
            resolve(dataUrl);
          } else {
            URL.revokeObjectURL(url);
            resolve('');
          }
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve('');
        };

        img.src = url;
      });
    } catch (error) {
      console.error('Error generating body map image:', error);
      return '';
    }
  };

  const handleDownloadImage = async () => {
    const imageDataUrl = await generateBodyMapImage();
    if (imageDataUrl) {
      const link = document.createElement('a');
      link.download = `nenya-body-map-${new Date().toISOString().split('T')[0]}.jpg`;
      link.href = imageDataUrl;
      link.click();
    }
  };

  const handleSaveMap = async () => {
    const imageDataUrl = await generateBodyMapImage();
    const bodyMapData: BodyMapData = {
      placements,
      imageDataUrl,
    };
    
    if (onSave) {
      onSave(bodyMapData);
    }
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-background px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2">
                Body Emotion Map
                {!hasArchivistJournal && (
                  <Badge variant="outline" className="gap-1">
                    <Sparkles className="size-3" />
                    Archivist's Journal
                  </Badge>
                )}
              </h2>
              <p className="text-sm text-muted-foreground">Place colors where you feel them in your body</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="size-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scroll-container">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Body Map */}
              <div className="space-y-4">
                <Card className="p-6">
                  <h3 className="mb-4">Your Body</h3>
                  <div className="bg-muted/30 rounded-lg p-4 flex justify-center items-center">
                    <svg ref={svgRef} width="300" height="420" viewBox="0 0 300 420" className="max-w-full h-auto">
                      {/* Simple body outline */}
                      <ellipse cx="150" cy="50" rx="35" ry="40" fill="none" stroke="currentColor" strokeWidth="2" />
                      <line x1="150" y1="90" x2="150" y2="230" stroke="currentColor" strokeWidth="2" />
                      <line x1="150" y1="110" x2="90" y2="150" stroke="currentColor" strokeWidth="2" />
                      <line x1="90" y1="150" x2="70" y2="220" stroke="currentColor" strokeWidth="2" />
                      <line x1="150" y1="110" x2="210" y2="150" stroke="currentColor" strokeWidth="2" />
                      <line x1="210" y1="150" x2="230" y2="220" stroke="currentColor" strokeWidth="2" />
                      <line x1="150" y1="230" x2="130" y2="300" stroke="currentColor" strokeWidth="2" />
                      <line x1="130" y1="300" x2="120" y2="370" stroke="currentColor" strokeWidth="2" />
                      <line x1="150" y1="230" x2="170" y2="300" stroke="currentColor" strokeWidth="2" />
                      <line x1="170" y1="300" x2="180" y2="370" stroke="currentColor" strokeWidth="2" />

                      {/* Clickable body parts */}
                      {bodyParts.map((part) => {
                        const placement = getPlacementForBodyPart(part.id);
                        return (
                          <g key={part.id}>
                            <circle
                              cx={part.position.x}
                              cy={part.position.y}
                              r={part.radius}
                              fill={placement ? placement.color : 'transparent'}
                              stroke={placement ? placement.color : 'currentColor'}
                              strokeWidth="2"
                              opacity={placement ? 0.7 : 0.2}
                              className="cursor-pointer hover:opacity-100 transition-opacity"
                              onClick={() => handleBodyPartClick(part.id)}
                            />
                            {placement && (
                              <text
                                x={part.position.x}
                                y={part.position.y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-xs pointer-events-none"
                                fill="white"
                              >
                                ✓
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    Click on any body part to place your selected color
                  </p>
                </Card>
              </div>

              {/* Controls */}
              <div className="space-y-4">
                {/* Color Selector */}
                <Card className="p-6">
                  <h3 className="mb-4">Available Colors</h3>
                  <div className="space-y-3">
                    {availableColors.map((colorObj, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedColor(colorObj.color);
                          setSelectedColorName(colorObj.name);
                        }}
                        className={`w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                          selectedColor === colorObj.color
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                          style={{ backgroundColor: colorObj.color }}
                        />
                        <div className="flex-1 text-left">
                          <div className="text-sm">{colorObj.name || colorObj.color}</div>
                          <div className="text-xs text-muted-foreground font-mono">{colorObj.color}</div>
                        </div>
                        {selectedColor === colorObj.color && (
                          <div className="text-primary">●</div>
                        )}
                      </button>
                    ))}

                    {/* Add More Colors */}
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={handleAddColor}
                    >
                      <Plus className="size-4" />
                      Add More Colors
                      {!hasArchivistJournal && (
                        <Badge variant="secondary" className="gap-1 ml-auto">
                          <Scroll className="size-3" />
                          Journal
                        </Badge>
                      )}
                    </Button>
                  </div>
                </Card>

                {/* Placed Colors */}
                <Card className="p-6">
                  <h3 className="mb-4">Placed Colors ({placements.length})</h3>
                  {placements.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No colors placed yet. Click on body parts to begin.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {placements.map((placement) => {
                        const bodyPart = bodyParts.find(bp => bp.id === placement.bodyPartId);
                        return (
                          <div
                            key={placement.bodyPartId}
                            className="flex items-center justify-between p-2 rounded bg-muted/50"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full border border-white shadow-sm"
                                style={{ backgroundColor: placement.color }}
                              />
                              <span className="text-sm">{bodyPart?.label}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemovePlacement(placement.bodyPartId)}
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>

                {/* Info */}
                <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>How to use:</strong> Select a color from your palette, then click on body parts where you feel that emotion or sensation. This creates a somatic map of your inner experience.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-background px-4 md:px-6 py-4">
          <div className="flex justify-between gap-2">
            <Button 
              variant="outline" 
              onClick={handleDownloadImage}
              className="gap-2"
            >
              <Download className="size-4" />
              Download Image
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={handleSaveMap}>
                Save Map
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Integration Modal */}
      <Dialog open={showIntegrationModal} onOpenChange={setShowIntegrationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scroll className="size-5 text-nenya-accent-warm" />
              The Archivist's Journal
            </DialogTitle>
            <DialogDescription>
              An optional add-on for tracking your emotional patterns over time with client-side encryption.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-nenya-accent-primary/10 to-nenya-accent-warm/10 rounded-lg p-4 border border-nenya-accent-primary/30">
              <h4 className="flex items-center gap-2 mb-2 text-foreground">
                <Sparkles className="size-4 text-nenya-accent-warm" />
                Journal Features
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                <li>Place unlimited colors on your body map</li>
                <li>Create more nuanced emotional landscapes</li>
                <li>Save and track body maps over time</li>
                <li>Export your data anytime (you own it)</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> The core Nenya platform remains ephemeral by design. The Archivist's Journal is a <em>Structured Integration</em> from Nenya Labs Public Benefit Corporation that provides optional personal archiving while maintaining privacy-first principles.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>In the full application:</strong> You would be able to add the Archivist's Journal to your practice. For this prototype, click below to simulate access.
            </p>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="ghost" onClick={() => setShowIntegrationModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setHasArchivistJournal(true);
                setShowIntegrationModal(false);
                // Auto-add a color after activating
                setTimeout(() => {
                  const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
                  setAvailableColors([...availableColors, { color: randomColor, name: 'Custom Color' }]);
                  setSelectedColor(randomColor);
                  setSelectedColorName('Custom Color');
                }, 300);
              }}
              className="gap-2"
            >
              <Scroll className="size-4" />
              Enable Journal (Demo)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
