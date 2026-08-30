import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { X, Download, ChevronDown, ChevronRight } from 'lucide-react';
import { Card } from './ui/card';
import { ValarColorPicker } from './ValarColorPicker';
import { sanitizePlainText } from '../../lib/textSanitize';

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
  notes: Record<string, string>; // bodyPartId -> sanitized note text
  imageDataUrl?: string;
}

interface BodyMapAvatarProps {
  // Optional -- the body map is reachable from every gateway, not only
  // Sight, so there may be no chosen colors yet to seed the picker with.
  userColors?: { color1?: string; color2?: string; color1Name?: string; color2Name?: string };
  onClose: () => void;
  onSave?: (bodyMapData: BodyMapData) => void;
  initialPlacements?: ColorPlacement[];
  initialNotes?: Record<string, string>;
}

const NOTE_MAX_LENGTH = 300;

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

export function BodyMapAvatar({ userColors, onClose, onSave, initialPlacements = [], initialNotes = {} }: BodyMapAvatarProps) {
  const [placements, setPlacements] = useState<ColorPlacement[]>(initialPlacements);
  const [notes, setNotes] = useState<Record<string, string>>(initialNotes);
  const [expandedPartId, setExpandedPartId] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>(userColors?.color1 || '#DDB88C');
  const [selectedColorName, setSelectedColorName] = useState<string | undefined>(userColors?.color1Name);
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

  const handleNoteChange = (bodyPartId: string, value: string) => {
    setNotes(prev => ({ ...prev, [bodyPartId]: value }));
  };

  const handleNoteBlur = (bodyPartId: string) => {
    setNotes(prev => {
      const sanitized = sanitizePlainText(prev[bodyPartId] || '', NOTE_MAX_LENGTH);
      if (!sanitized) {
        const { [bodyPartId]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [bodyPartId]: sanitized };
    });
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
      notes,
      imageDataUrl,
    };

    if (onSave) {
      onSave(bodyMapData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-background px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2>Body Emotion Map</h2>
            <p className="text-sm text-muted-foreground">Place colors and notes where you feel them in your body</p>
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
                      const hasNote = !!notes[part.id];
                      return (
                        <g key={part.id}>
                          <circle
                            cx={part.position.x}
                            cy={part.position.y}
                            r={part.radius}
                            fill={placement ? placement.color : 'transparent'}
                            stroke={placement ? placement.color : 'currentColor'}
                            strokeWidth={hasNote && !placement ? 2.5 : 2}
                            strokeDasharray={hasNote && !placement ? '4 2' : undefined}
                            opacity={placement ? 0.7 : hasNote ? 0.4 : 0.2}
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
                  Click on any body part to place your selected color. A dashed outline means a part has a note but no color.
                </p>
              </Card>

              {/* Color Selector -- the same Valar palette browser the Sight
                  gateway uses, so color choice works identically here even
                  if Sight hasn't been visited yet. Fully open-ended: every
                  palette color plus a custom hex input, no unlock gate. */}
              <Card className="p-6">
                <h3 className="mb-4">Choose a Color</h3>
                <ValarColorPicker
                  selectedColor={selectedColor}
                  onColorChange={(color) => {
                    setSelectedColor(color);
                    setSelectedColorName(undefined);
                  }}
                  size="sm"
                />
              </Card>
            </div>

            {/* Body Part Details */}
            <div className="space-y-4">
              <Card className="p-6">
                <h3 className="mb-4">Body Part Details</h3>
                <div className="space-y-2">
                  {bodyParts.map((part) => {
                    const placement = getPlacementForBodyPart(part.id);
                    const note = notes[part.id] || '';
                    const isExpanded = expandedPartId === part.id;
                    return (
                      <div key={part.id} className="rounded-lg border border-border overflow-hidden">
                        <button
                          onClick={() => setExpandedPartId(isExpanded ? null : part.id)}
                          className="w-full flex items-center justify-between p-2.5 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {placement ? (
                              <div
                                className="w-4 h-4 rounded-full border border-white shadow-sm flex-shrink-0"
                                style={{ backgroundColor: placement.color }}
                              />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-dashed border-muted-foreground/50 flex-shrink-0" />
                            )}
                            <span className="text-sm truncate">{part.label}</span>
                            {!placement && note && (
                              <span className="text-xs text-muted-foreground flex-shrink-0">No color chosen</span>
                            )}
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="size-4 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <ChevronRight className="size-4 text-muted-foreground flex-shrink-0" />
                          )}
                        </button>
                        {isExpanded && (
                          <div className="p-3 pt-0 space-y-2 border-t border-border">
                            {placement && (
                              <div className="flex items-center justify-between pt-2">
                                <span className="text-xs text-muted-foreground">
                                  {placement.colorName || placement.color}
                                </span>
                                <Button variant="ghost" size="sm" onClick={() => handleRemovePlacement(part.id)}>
                                  <X className="size-3.5 mr-1" />
                                  Remove color
                                </Button>
                              </div>
                            )}
                            <textarea
                              value={note}
                              onChange={(e) => handleNoteChange(part.id, e.target.value)}
                              onBlur={() => handleNoteBlur(part.id)}
                              placeholder="Add a note for this body part (optional)..."
                              className="w-full min-h-16 resize-none text-sm p-2 rounded border border-border bg-background"
                              maxLength={NOTE_MAX_LENGTH}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Info */}
              <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>How to use:</strong> Choose a color, then click on body parts where you feel that emotion or sensation. Expand any body part to add a short note, with or without a color. This map is shared across every gateway — open it from any of them to keep adding to the same picture.
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
  );
}
