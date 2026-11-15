import * as React from 'react';
import { useRef, useState, useEffect, useId } from 'react';
import { Button } from './ui/button';
import { Eraser, Undo2, Pencil, PencilOff, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Shapes } from 'lucide-react';
import { CANVAS_W, CANVAS_H, SHAPES, SIZES, clampPt, describeDrawing, shapeStrokes, type Pt, type ShapeId, type ShapeSize, type Stroke } from '../../lib/drawingModel';

interface DrawingCanvasProps {
  // Falls back to a neutral ink tone when no gateway color is available yet (e.g. Sight hasn't been visited), matching how BodyMapAvatar handles the same situation.
  strokeColor?: string;
  initialDataUrl?: string | null;
  onChange: (dataUrl: string | null) => void;
  placeholder?: string;
}

// The drawing is a list of strokes (src/lib/drawingModel.ts), so it can be made in four ways, all of which work with a keyboard, a switch, voice control or a screen reader:
//  1. a pointer (mouse, finger, pen), as before;
//  2. the keyboard on the drawing area: arrow keys move a cursor, Space puts the pen down or lifts it;
//  3. buttons for every one of those actions, plus "move the cursor to" a place on a 3 by 3 grid;
//  4. whole shapes (line, wave, circle...) added at the cursor.
// The drawing is also described in words, which is the text a screen reader gets for it.
const STEP_X = 16, STEP_Y = 9, FINE = 4;

const PLACES: { label: string; x: number; y: number }[] = [
  { label: 'Top left', x: 0.17, y: 0.17 }, { label: 'Top middle', x: 0.5, y: 0.17 }, { label: 'Top right', x: 0.83, y: 0.17 },
  { label: 'Middle left', x: 0.17, y: 0.5 }, { label: 'Center', x: 0.5, y: 0.5 }, { label: 'Middle right', x: 0.83, y: 0.5 },
  { label: 'Bottom left', x: 0.17, y: 0.83 }, { label: 'Bottom middle', x: 0.5, y: 0.83 }, { label: 'Bottom right', x: 0.83, y: 0.83 },
];

export function DrawingCanvas({ strokeColor = '#2A2623', initialDataUrl, onChange, placeholder = 'Trace the shape it takes.' }: DrawingCanvasProps) {
  const uid = useId();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baseImg = useRef<HTMLImageElement | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [open, setOpen] = useState<Stroke | null>(null); // the stroke being drawn
  const [cursor, setCursor] = useState<Pt>({ x: CANVAS_W / 2, y: CANVAS_H / 2 });
  const [penDown, setPenDown] = useState(false);
  const [keyed, setKeyed] = useState(false); // the keyboard or buttons have been used: show the cursor
  const [shape, setShape] = useState<ShapeId>('wave');
  const [size, setSize] = useState<ShapeSize>('medium');
  const [announce, setAnnounce] = useState('');
  const [hasBase, setHasBase] = useState(!!initialDataUrl);
  const pointer = useRef(false);

  const redraw = (list: Stroke[], current: Stroke | null) => {
    const canvas = canvasRef.current; const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (baseImg.current) ctx.drawImage(baseImg.current, 0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = strokeColor; ctx.fillStyle = strokeColor; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const s of current ? [...list, current] : list) {
      if (s.length === 1) { ctx.beginPath(); ctx.arc(s[0].x, s[0].y, 3, 0, Math.PI * 2); ctx.fill(); continue; }
      ctx.beginPath(); s.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.stroke();
    }
  };
  useEffect(() => { redraw(strokes, open); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [strokes, open, strokeColor]);

  // A drawing kept from earlier in the visit (returning to this gateway) is shown as the background; it is not part of the strokes, so it is not described or undone stroke by stroke.
  useEffect(() => {
    if (!initialDataUrl) return;
    const img = new Image();
    img.onload = () => { baseImg.current = img; redraw(strokes, open); };
    img.src = initialDataUrl;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasDrawing = hasBase || strokes.length > 0 || !!open;
  const description = describeDrawing(strokes) + (hasBase && !strokes.length ? 'A drawing from earlier in this visit (not described).' : '');
  const emit = (list: Stroke[]) => { redraw(list, null); onChange(canvasRef.current?.toDataURL('image/png') ?? null); };
  const commit = (s: Stroke | null) => { if (!s) return; const list = [...strokes, s]; setStrokes(list); setOpen(null); setTimeout(() => emit(list), 0); setAnnounce(`Stroke added. ${describeDrawing(list)}`); };

  // 1. pointer
  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>): Pt => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return clampPt({ x: ((e.clientX - rect.left) / rect.width) * CANVAS_W, y: ((e.clientY - rect.top) / rect.height) * CANVAS_H });
  };
  const down = (e: React.PointerEvent<HTMLCanvasElement>) => { e.currentTarget.setPointerCapture(e.pointerId); pointer.current = true; setOpen([getPoint(e)]); };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => { if (pointer.current) setOpen((s) => (s ? [...s, getPoint(e)] : s)); };
  const up = () => { if (!pointer.current) return; pointer.current = false; commit(open); };

  // 2 and 3. keyboard and buttons
  const say = (p: Pt, down: boolean) => setAnnounce(`Pen ${down ? 'down' : 'up'}, ${Math.round((p.x / CANVAS_W) * 100)} percent across, ${Math.round((p.y / CANVAS_H) * 100)} percent down.`);
  const moveTo = (p: Pt) => { const q = clampPt(p); setKeyed(true); setCursor(q); if (penDown) setOpen((s) => (s ? [...s, q] : [q])); say(q, penDown); };
  const nudge = (dx: number, dy: number, fine = false) => moveTo({ x: cursor.x + dx * (fine ? FINE : STEP_X), y: cursor.y + dy * (fine ? FINE : STEP_Y) });
  const togglePen = () => {
    setKeyed(true);
    if (penDown) { setPenDown(false); commit(open); } else { setPenDown(true); setOpen([cursor]); say(cursor, true); }
  };
  const onKey = (e: React.KeyboardEvent) => {
    const k = e.key;
    if (k === 'ArrowLeft') { e.preventDefault(); nudge(-1, 0, e.shiftKey); }
    else if (k === 'ArrowRight') { e.preventDefault(); nudge(1, 0, e.shiftKey); }
    else if (k === 'ArrowUp') { e.preventDefault(); nudge(0, -1, e.shiftKey); }
    else if (k === 'ArrowDown') { e.preventDefault(); nudge(0, 1, e.shiftKey); }
    else if (k === ' ' || k === 'Enter') { e.preventDefault(); togglePen(); }
    else if (k === 'Escape' && penDown) { e.preventDefault(); togglePen(); }
    else if ((k === 'z' || k === 'Z') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); undo(); }
  };

  // 4. shapes
  const addShape = () => {
    if (penDown) { setPenDown(false); commit(open); }
    const added = shapeStrokes(shape, cursor, size);
    const list = [...strokes, ...added]; setStrokes(list); setOpen(null); setTimeout(() => emit(list), 0);
    setAnnounce(`${SHAPES.find((s) => s.id === shape)!.label} added. ${describeDrawing(list)}`);
  };

  const undo = () => {
    const list = strokes.slice(0, -1); setStrokes(list); setOpen(null); setPenDown(false);
    setTimeout(() => emit(list), 0);
    setAnnounce(list.length ? `Last stroke removed. ${describeDrawing(list)}` : hasBase ? 'Last stroke removed.' : 'Last stroke removed. The drawing is empty.');
  };
  const clear = () => {
    baseImg.current = null; setHasBase(false); setStrokes([]); setOpen(null); setPenDown(false);
    const ctx = canvasRef.current?.getContext('2d'); if (ctx) ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    onChange(null); setAnnounce('Drawing cleared.');
  };

  const sel = 'h-11 rounded-md border border-border bg-input-background px-2 text-sm text-foreground';
  return (
    <div className="space-y-3">
      <div className="relative rounded-md border border-border bg-muted/20 overflow-hidden" style={{ touchAction: 'none' }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          tabIndex={0}
          role="img"
          aria-label={`Drawing area. ${description} Focus here and use the arrow keys to move the cursor and Space to put the pen down or lift it.`}
          aria-describedby={`${uid}-help`}
          className="w-full h-[150px] cursor-crosshair touch-none"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerLeave={up}
          onKeyDown={onKey}
          onFocus={() => setKeyed(true)}
        />
        {keyed && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-foreground bg-background"
            style={{ left: `${(cursor.x / CANVAS_W) * 100}%`, top: `${(cursor.y / CANVAS_H) * 100}%`, boxShadow: penDown ? `0 0 0 3px ${strokeColor}` : undefined }}
          />
        )}
        {!hasDrawing && (
          <p className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground pointer-events-none px-8 text-center">{placeholder}</p>
        )}
      </div>
      <p id={`${uid}-help`} className="text-xs text-muted-foreground">
        Draw with a mouse, finger or pen, or without one: focus the drawing area and use the arrow keys (Shift for small steps), Space to put the pen down or lift it, Control or Command + Z to undo. Every action also has a button below.
      </p>
      <p className="text-sm" data-testid="drawing-description"><span className="font-medium">Your drawing, in words: </span>{description}</p>
      <div role="status" aria-live="polite" className="sr-only">{announce}</div>

      <div role="group" aria-label="Drawing controls" className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant={penDown ? 'default' : 'outline'} size="sm" aria-pressed={penDown} onClick={togglePen} className="gap-2">
            {penDown ? <PencilOff className="size-4" /> : <Pencil className="size-4" />}{penDown ? 'Lift the pen' : 'Put the pen down'}
          </Button>
          <Button variant="outline" size="icon" aria-label="Move the cursor left" onClick={() => nudge(-1, 0)}><ArrowLeft className="size-4" /></Button>
          <Button variant="outline" size="icon" aria-label="Move the cursor up" onClick={() => nudge(0, -1)}><ArrowUp className="size-4" /></Button>
          <Button variant="outline" size="icon" aria-label="Move the cursor down" onClick={() => nudge(0, 1)}><ArrowDown className="size-4" /></Button>
          <Button variant="outline" size="icon" aria-label="Move the cursor right" onClick={() => nudge(1, 0)}><ArrowRight className="size-4" /></Button>
          <label className="flex items-center gap-2 text-sm">Move the cursor to
            <select className={sel} value="" onChange={(e) => { const p = PLACES[Number(e.target.value)]; if (p) moveTo({ x: p.x * CANVAS_W, y: p.y * CANVAS_H }); }}>
              <option value="" disabled>Choose a place</option>
              {PLACES.map((p, i) => <option key={p.label} value={i}>{p.label}</option>)}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm">Shape
            <select className={sel} value={shape} onChange={(e) => setShape(e.target.value as ShapeId)}>{SHAPES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
          </label>
          <label className="flex items-center gap-2 text-sm">Size
            <select className={sel} value={size} onChange={(e) => setSize(e.target.value as ShapeSize)}>{(Object.keys(SIZES) as ShapeSize[]).map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}</select>
          </label>
          <Button variant="outline" size="sm" onClick={addShape} className="gap-2"><Shapes className="size-4" />Add the shape at the cursor</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={undo} disabled={!strokes.length} className="gap-2"><Undo2 className="size-4" />Undo the last stroke</Button>
          <Button variant="ghost" size="sm" onClick={clear} disabled={!hasDrawing} className="gap-2"><Eraser className="size-4" />Clear</Button>
        </div>
      </div>
    </div>
  );
}
