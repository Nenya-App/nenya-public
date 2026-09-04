import * as React from 'react';
import { useRef, useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Eraser } from 'lucide-react';

interface ColorBlendCanvasProps {
  color1: string; // present state, left edge
  color2: string; // wish state, right edge
  initialDataUrl?: string | null;
  onChange: (dataUrl: string | null) => void;
}

const CANVAS_W = 500;
const CANVAS_H = 220;

function hexToRgb(hex: string): [number, number, number] {
  const clean = (hex || '').replace('#', '').padEnd(6, '0');
  return [parseInt(clean.slice(0, 2), 16) || 0, parseInt(clean.slice(2, 4), 16) || 0, parseInt(clean.slice(4, 6), 16) || 0];
}

function lerpColor(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

// A paint surface rather than a single-color line: the stroke color is
// derived from horizontal position, blending from color1 at the left edge
// to color2 at the right, so painting freely produces a custom gradient
// between the two chosen states instead of picking an abstract direction
// from a list.
export function ColorBlendCanvas({ color1, color2, initialDataUrl, onChange }: ColorBlendCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const [hasPainted, setHasPainted] = useState(!!initialDataUrl);

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
    const t = Math.max(0, Math.min(1, point.x / canvas.width));
    ctx.strokeStyle = lerpColor(color1, color2, t);
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPoint.current = point;
    if (!hasPainted) setHasPainted(true);
  };

  const handlePointerUp = () => {
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
    setHasPainted(false);
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <div
        className="relative rounded-md border border-border overflow-hidden"
        style={{ touchAction: 'none', background: `linear-gradient(to right, ${color1}15, ${color2}15)` }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="w-full h-[180px] cursor-crosshair touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
        {!hasPainted && (
          <p className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground pointer-events-none px-8 text-center">
            Paint freely — the color shifts from your present state on the left to your wish state on the right, wherever you paint.
          </p>
        )}
      </div>
      <Button variant="ghost" size="sm" onClick={handleClear} disabled={!hasPainted} className="gap-2">
        <Eraser className="size-3.5" />
        Clear
      </Button>
    </div>
  );
}
