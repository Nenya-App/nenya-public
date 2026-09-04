import * as React from 'react';
import { useRef, useState } from 'react';
import { Button } from './ui/button';
import { Eraser } from 'lucide-react';

interface MelodyContourCanvasProps {
  noteCount: number; // PENTATONIC_FREQS.length -- top of canvas = noteCount - 1, bottom = 0
  accentCurrent: string;
  accentWish: string;
  onDraw: (noteIndices: number[]) => void; // always 6 values, sampled left-to-right
}

const CANVAS_W = 400;
const CANVAS_H = 140;
const SAMPLE_COUNT = 6;

// Drag a contour left-to-right; on release it's sampled into six evenly
// spaced note indices, the same six slots the tap-to-pick NotePicker fills.
// This is an alternate input for the same `melody` array, not a separate
// piece of data -- whichever method someone last used just overwrites it.
export function MelodyContourCanvas({ noteCount, accentCurrent, accentWish, onDraw }: MelodyContourCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const points = useRef<{ x: number; y: number }[]>([]);
  const [hasDrawn, setHasDrawn] = useState(false);

  const paintBackground = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = `${accentCurrent}12`;
    ctx.fillRect(0, 0, CANVAS_W / 2, CANVAS_H);
    ctx.fillStyle = `${accentWish}12`;
    ctx.fillRect(CANVAS_W / 2, 0, CANVAS_W / 2, CANVAS_H);
    ctx.strokeStyle = `${accentWish}30`;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_W / 2, 0);
    ctx.lineTo(CANVAS_W / 2, CANVAS_H);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * CANVAS_W,
      y: ((e.clientY - rect.top) / rect.height) * CANVAS_H,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    paintBackground(ctx);
    isDrawing.current = true;
    points.current = [getPoint(e)];
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const point = getPoint(e);
    const prev = points.current[points.current.length - 1];
    points.current.push(point);
    ctx.strokeStyle = point.x < CANVAS_W / 2 ? accentCurrent : accentWish;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    if (points.current.length < 2) return;
    setHasDrawn(true);

    const sampled: number[] = [];
    for (let i = 0; i < SAMPLE_COUNT; i++) {
      const targetX = ((i + 0.5) / SAMPLE_COUNT) * CANVAS_W;
      let nearest = points.current[0];
      let nearestDist = Infinity;
      for (const p of points.current) {
        const dist = Math.abs(p.x - targetX);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = p;
        }
      }
      // Canvas y grows downward; invert so the top of the drawing is the
      // highest note, matching the NotePicker's tallest-bar-is-highest
      // convention.
      const normalized = 1 - nearest.y / CANVAS_H;
      const noteIndex = Math.max(0, Math.min(noteCount - 1, Math.round(normalized * (noteCount - 1))));
      sampled.push(noteIndex);
    }
    onDraw(sampled);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) paintBackground(ctx);
    points.current = [];
    setHasDrawn(false);
  };

  return (
    <div className="space-y-2">
      <div className="relative rounded-md border border-border overflow-hidden" style={{ touchAction: 'none' }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="w-full h-[120px] cursor-crosshair touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
        {!hasDrawn && (
          <p className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground pointer-events-none px-8 text-center">
            Or drag a contour left to right — high for bright, low for deep. Left half is current, right half is wish.
          </p>
        )}
      </div>
      <Button variant="ghost" size="sm" onClick={handleClear} disabled={!hasDrawn} className="gap-2">
        <Eraser className="size-3.5" />
        Clear
      </Button>
    </div>
  );
}
