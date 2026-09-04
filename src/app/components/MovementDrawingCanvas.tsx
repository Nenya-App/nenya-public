import { useRef, useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Eraser } from 'lucide-react';

interface MovementDrawingCanvasProps {
  // Falls back to a neutral ink tone when no gateway color is available yet
  // (e.g. Sight hasn't been visited), matching how BodyMapAvatar handles
  // the same situation.
  strokeColor?: string;
  initialDataUrl?: string | null;
  onChange: (dataUrl: string | null) => void;
  placeholder?: string;
}

// Intrinsic canvas resolution -- independent of its on-screen CSS size, so
// the drawing stays crisp regardless of how the card is laid out. Pointer
// coordinates are mapped through the bounding-rect ratio below rather than
// used raw, which is what keeps the two in sync.
const CANVAS_W = 400;
const CANVAS_H = 180;

export function MovementDrawingCanvas({
  strokeColor = '#4A4440',
  initialDataUrl,
  onChange,
  placeholder = 'Trace the shape this movement takes — a spiral, a straight line, a knot, whatever it is.',
}: MovementDrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const [hasDrawing, setHasDrawing] = useState(!!initialDataUrl);

  // Restore a previously-captured drawing once on mount (e.g. returning to
  // this gateway after visiting another one).
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !initialDataUrl) return;
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    img.src = initialDataUrl;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawing.current = true;
    lastPoint.current = getPoint(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !lastPoint.current) return;
    const point = getPoint(e);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPoint.current = point;
    if (!hasDrawing) setHasDrawing(true);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    lastPoint.current = null;
    onChange(canvasRef.current?.toDataURL('image/png') ?? null);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawing(false);
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <div className="relative rounded-md border border-border bg-muted/20 overflow-hidden" style={{ touchAction: 'none' }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="w-full h-[150px] cursor-crosshair touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
        {!hasDrawing && (
          <p className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground pointer-events-none px-8 text-center">
            {placeholder}
          </p>
        )}
      </div>
      <Button variant="ghost" size="sm" onClick={handleClear} disabled={!hasDrawing} className="gap-2">
        <Eraser className="size-3.5" />
        Clear
      </Button>
    </div>
  );
}
