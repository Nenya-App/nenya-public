import { useContext, useEffect, useId, useState, useRef } from 'react';
import { Button } from './ui/button';
import { X, Download, ChevronDown, ChevronRight, ZoomIn, ZoomOut, Maximize2, MapPin as PinIcon, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Paintbrush, Undo2, Eraser, Redo2 } from 'lucide-react';
import { Card } from './ui/card';
import { ValarColorPicker } from './ValarColorPicker';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { sanitizePlainText } from '../../lib/textSanitize';
import { BODY_PARTS, FACE_PARTS, MAP_W, MAP_H, clamp, labelFor, nearestPart, type MapPin } from '../../lib/bodyMapParts';
import { BodyMapBrushContext } from './BodyMapBrushContext';
import { SIZE_DEFAULT, SIZE_MAX, SIZE_MIN, MAX_STROKES, addPoint, cleanStrokes, describeStrokes, effectiveSize, lensName, round1, strokePath, strokesSummary, type BrushStroke, type Paint } from '../../lib/bodyMapBrush';
import { texturePath } from '../../lib/touchTextures';

import { L } from '../../lib/vocabulary';
interface ColorPlacement {
  bodyPartId: string;
  color: string;
  colorName?: string;
}

export interface BodyMapData {
  placements: ColorPlacement[];
  notes: Record<string, string>; // bodyPartId (a part's id or a pin's id) -> sanitized note text
  /** Pins the person placed anywhere on the map; their colors and notes are in placements and notes, under the pin's id. */
  pins?: MapPin[];
  /** Paintbrush marks (lens tray only; src/lib/bodyMapBrush.ts). */
  strokes?: BrushStroke[];
  /** Only in the report's copy of the map (lens tray): the names of the lenses it picked up. */
  pickedUp?: string[];
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
  initialPins?: MapPin[];
  /** Paintbrush marks made before. When not given, the ones the app holds (BodyMapBrushContext) are used, so the lens pages need not pass them. */
  initialStrokes?: BrushStroke[];
  /** Shown as a section of the page (the Sight gateway) instead of a full-screen window. It saves as the person goes, so there is nothing to close or save. */
  inline?: boolean;
}

const NOTE_MAX_LENGTH = 300;
const BRUSH_PICKER = '__brush-picker';
const texCache = new Map<string, Promise<string>>();
/** A small embedded copy of a surface's picture, for the saved image of the map. Empty if it cannot be loaded. */
function textureDataUrl(id: string): Promise<string> {
  if (!id) return Promise.resolve('');
  let p = texCache.get(id);
  if (!p) {
    p = new Promise<string>((resolve) => {
      const img = new Image();
      img.onload = () => { try { const c = document.createElement('canvas'); c.width = 96; c.height = 96; const x = c.getContext('2d'); if (!x) return resolve(''); x.drawImage(img, 0, 0, 96, 96); resolve(c.toDataURL('image/jpeg', 0.8)); } catch { resolve(''); } };
      img.onerror = () => resolve('');
      img.src = texturePath(id);
    });
    texCache.set(id, p);
  }
  return p;
}
const TILE = 24; // a surface's picture repeats every 24 map units inside a stroke
const nearestPartId = (x: number, y: number): string => nearestPart(x, y).id;

export function BodyMapAvatar({ userColors, onClose, onSave, initialPlacements = [], initialNotes = {}, initialPins = [], initialStrokes, inline = false }: BodyMapAvatarProps) {
  const [placements, setPlacements] = useState<ColorPlacement[]>(initialPlacements);
  const [notes, setNotes] = useState<Record<string, string>>(initialNotes);
  const [pins, setPins] = useState<MapPin[]>(initialPins);
  const [expandedPartId, setExpandedPartId] = useState<string | null>(null);
  // The view: where the map is centered and how far it is zoomed in (1 is the whole body).
  const [view, setView] = useState({ cx: MAP_W / 2, cy: MAP_H / 2, z: 1 });
  const vw = MAP_W / view.z, vh = MAP_H / view.z;
  const vx = clamp(view.cx - vw / 2, 0, MAP_W - vw), vy = clamp(view.cy - vh / 2, 0, MAP_H - vh);
  const zoomTo = (z: number, cx = view.cx, cy = view.cy) => setView({ z: clamp(z, 1, 6), cx, cy });
  const panBy = (dx: number, dy: number) => setView((v) => ({ ...v, cx: clamp(v.cx + dx * (MAP_W / v.z), MAP_W / v.z / 2, MAP_W - MAP_W / v.z / 2), cy: clamp(v.cy + dy * (MAP_H / v.z), MAP_H / v.z / 2, MAP_H - MAP_H / v.z / 2) }));
  const showFace = view.z >= 2;
  const nextPinId = useRef(initialPins.reduce((m, p) => Math.max(m, Number(p.id.slice(4)) + 1), 1));
  const dragging = useRef<{ id: string; moved: boolean } | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>(userColors?.color1 || '#DDB88C');
  const [, setSelectedColorName] = useState<string | undefined>(userColors?.color1Name);
  const svgRef = useRef<SVGSVGElement>(null);

  // ---- the paintbrush (lens tray only): paints come from the lenses added to the report, plus any color from the picker.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const bm = useContext(BodyMapBrushContext);
  const brushOn = bm.enabled;
  const [strokes, setStrokes] = useState<BrushStroke[]>(() => cleanStrokes(initialStrokes ?? bm.strokes));
  const [tool, setTool] = useState<'pins' | 'brush'>('pins');
  const brushing = brushOn && tool === 'brush';
  const [paintKey, setPaintKey] = useState<string>('');
  const [customHex, setCustomHex] = useState<string>((userColors?.color1 || '#DDB88C').toUpperCase());
  const [brushSize, setBrushSize] = useState(SIZE_DEFAULT);
  const [openStroke, setOpenStroke] = useState<BrushStroke | null>(null);
  const openRef = useRef<BrushStroke | null>(null);
  const activePointer = useRef<number | null>(null);
  const [cursor, setCursor] = useState({ x: MAP_W / 2, y: MAP_H / 2 });
  const [brushDown, setBrushDown] = useState(false);
  const [cursorShown, setCursorShown] = useState(false);
  const [announce, setAnnounce] = useState('');
  const [cleared, setCleared] = useState<BrushStroke[] | null>(null);
  const [undone, setUndone] = useState<BrushStroke[]>([]);
  const customPaint: Paint = { id: `picker-${customHex}`, kind: 'color', label: customHex, hex: customHex, from: 'the color picker' };
  const paintChoices: { key: string; paint: Paint; lens?: string }[] = [
    ...bm.brushes.map((b) => ({ key: b.paint.id, paint: b.paint, lens: lensName(b.lens) })),
    { key: 'picker', paint: customPaint },
  ];
  const chosen = paintChoices.find((c) => c.key === paintKey) ?? paintChoices[0];
  const paint = chosen.paint;

  // Choosing a body part opens the color picker for it (a popup), so there is no going back and forth on the screen.
  const [pickingPart, setPickingPart] = useState<string | null>(null);

  const handleBodyPartClick = (bodyPartId: string) => {
    setPickingPart(bodyPartId);
  };

  // A point on the map from a pointer position, in the map's own coordinates (works at any zoom).
  const mapPoint = (e: { clientX: number; clientY: number }) => {
    const svg = svgRef.current; const m = svg?.getScreenCTM();
    if (!svg || !m) return null;
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const q = pt.matrixTransform(m.inverse());
    return { x: clamp(q.x, 0, MAP_W), y: clamp(q.y, 0, MAP_H) };
  };
  // The brush. Points are in the map's own coordinates, so a stroke lands under the pointer at any zoom; the width is chosen on the screen and kept there (effectiveSize).
  const say = (t: string) => setAnnounce(t);
  const beginStroke = (x: number, y: number) => {
    const s0: BrushStroke = { paint, size: effectiveSize(brushSize, view.z), pts: [[round1(x), round1(y)]] };
    openRef.current = s0; setOpenStroke(s0);
  };
  const extendStroke = (x: number, y: number) => {
    const cur = openRef.current; if (!cur) return;
    const pts = addPoint(cur.pts, x, y); if (pts === cur.pts) return;
    const next = { ...cur, pts }; openRef.current = next; setOpenStroke(next);
  };
  const endStroke = () => {
    const cur = openRef.current; openRef.current = null; setOpenStroke(null);
    if (!cur) return;
    if (strokes.length >= MAX_STROKES) { say(`The map is full of brush strokes (${MAX_STROKES}). Undo some or clear them to paint more.`); return; }
    const list = [...strokes, cur];
    setStrokes(list); setUndone([]); setCleared(null);
    say(`Stroke added in ${cur.paint.label}. ${strokesSummary(list)}`);
  };
  const undoStroke = () => {
    openRef.current = null; setOpenStroke(null); setBrushDown(false);
    if (!strokes.length) { say('There is no stroke to undo.'); return; }
    const last = strokes[strokes.length - 1], list = strokes.slice(0, -1);
    setStrokes(list); setUndone((u) => [...u, last]);
    say(`Last stroke removed. ${strokesSummary(list)}`);
  };
  const redoStroke = () => {
    if (!undone.length) return;
    const back = undone[undone.length - 1], list = [...strokes, back];
    setUndone((u) => u.slice(0, -1)); setStrokes(list);
    say(`Stroke put back. ${strokesSummary(list)}`);
  };
  const clearStrokes = () => {
    openRef.current = null; setOpenStroke(null); setBrushDown(false);
    if (!strokes.length) return;
    setCleared(strokes); setStrokes([]); setUndone([]);
    say('All brush strokes cleared. You can put them back. Your colored places, pins and notes are untouched.');
  };
  const restoreStrokes = () => { if (cleared) { setStrokes(cleared); say(`Brush strokes put back. ${strokesSummary(cleared)}`); setCleared(null); } };
  const brushPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!brushing || (e.pointerType === 'mouse' && e.button !== 0) || activePointer.current !== null) return;
    const q = mapPoint(e); if (!q) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    activePointer.current = e.pointerId; setCursorShown(false); beginStroke(q.x, q.y);
  };
  const brushPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (activePointer.current !== e.pointerId) return;
    const evs = (e.nativeEvent as PointerEvent).getCoalescedEvents?.() ?? [];
    for (const ev of evs.length ? evs : [e.nativeEvent as PointerEvent]) { const q = mapPoint(ev); if (q) extendStroke(q.x, q.y); }
  };
  const brushPointerEnd = (e: React.PointerEvent<SVGSVGElement>) => {
    if (activePointer.current !== e.pointerId) return;
    activePointer.current = null;
    if (e.type === 'pointerup') { const q = mapPoint(e); if (q) extendStroke(q.x, q.y); }
    endStroke();
  };
  // Without a pointer: a cursor moved by the arrow keys or the buttons; Space or the button puts the brush down or lifts it; "Dab here" makes one dot.
  const keepInView = (x: number, y: number) => ({ x: clamp(x, vx, vx + vw), y: clamp(y, vy, vy + vh) });
  const moveCursor = (x: number, y: number) => {
    const q = keepInView(x, y); setCursor(q); setCursorShown(true);
    if (brushDown) extendStroke(q.x, q.y);
    say(`Brush at ${Math.round((q.x / MAP_W) * 100)} percent across, ${Math.round((q.y / MAP_H) * 100)} percent down, near ${labelFor(nearestPartId(q.x, q.y), pins)}${brushDown ? ', painting' : ''}.`);
  };
  const nudgeCursor = (dx: number, dy: number, fine = false) => { const step = (fine ? 2 : 8) / Math.max(1, view.z); moveCursor(cursor.x + dx * step, cursor.y + dy * step); };
  const toggleBrush = () => {
    setCursorShown(true);
    if (brushDown) { setBrushDown(false); endStroke(); }
    else { setBrushDown(true); beginStroke(cursor.x, cursor.y); say(`Brush down in ${paint.label}.`); }
  };
  const dabHere = () => {
    setCursorShown(true);
    if (brushDown) { setBrushDown(false); endStroke(); }
    const s0: BrushStroke = { paint, size: effectiveSize(brushSize, view.z), pts: [[round1(cursor.x), round1(cursor.y)]] };
    if (strokes.length >= MAX_STROKES) { say(`The map is full of brush strokes (${MAX_STROKES}). Undo some or clear them to paint more.`); return; }
    const list = [...strokes, s0]; setStrokes(list); setUndone([]); setCleared(null);
    say(`Dab added in ${paint.label}. ${strokesSummary(list)}`);
  };
  const goToPlace = (id: string) => {
    const part = [...BODY_PARTS, ...FACE_PARTS].find((p) => p.id === id); const pin = pins.find((p) => p.id === id);
    const at = part ? part.position : pin ? { x: pin.x, y: pin.y } : null; if (!at) return;
    if (part?.face && view.z < 2) { zoomTo(3.75, at.x, at.y); } else if (at.x < vx || at.x > vx + vw || at.y < vy || at.y > vy + vh) zoomTo(view.z, at.x, at.y);
    setCursor(at); setCursorShown(true);
    if (brushDown) extendStroke(at.x, at.y);
    say(`Brush moved to ${labelFor(id, pins)}${brushDown ? ', painting' : ''}.`);
  };
  const onMapKeyDown = (e: React.KeyboardEvent<SVGSVGElement>) => {
    if (!brushing || e.target !== e.currentTarget) return;
    const k = e.key;
    if (k === 'ArrowLeft') { e.preventDefault(); nudgeCursor(-1, 0, e.shiftKey); }
    else if (k === 'ArrowRight') { e.preventDefault(); nudgeCursor(1, 0, e.shiftKey); }
    else if (k === 'ArrowUp') { e.preventDefault(); nudgeCursor(0, -1, e.shiftKey); }
    else if (k === 'ArrowDown') { e.preventDefault(); nudgeCursor(0, 1, e.shiftKey); }
    else if (k === ' ' || k === 'Enter') { e.preventDefault(); toggleBrush(); }
    else if (k === 'Escape' && brushDown) { e.preventDefault(); toggleBrush(); }
    else if ((k === 'z' || k === 'Z') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); undoStroke(); }
  };
  // A new view (zoom or move) keeps the cursor inside it; switching away from the brush lifts it.
  useEffect(() => { setCursor((c) => keepInView(c.x, c.y)); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [view.z, view.cx, view.cy]);
  useEffect(() => { if (!brushing && openRef.current) { setBrushDown(false); endStroke(); } /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [brushing]);

  const addPin = (x: number, y: number) => {
    const id = `pin-${nextPinId.current++}`;
    setPins((prev) => [...prev, { id, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 }]);
    setPlacements((prev) => [...prev, { bodyPartId: id, color: selectedColor }]);
    setExpandedPartId(id);
    setPickingPart(id);
  };
  const movePin = (id: string, x: number, y: number) => setPins((prev) => prev.map((p) => (p.id === id ? { ...p, x: clamp(x, 0, MAP_W), y: clamp(y, 0, MAP_H) } : p)));
  const removePin = (id: string) => {
    setPins((prev) => prev.filter((p) => p.id !== id));
    setPlacements((prev) => prev.filter((p) => p.bodyPartId !== id));
    setNotes((prev) => { const { [id]: _gone, ...rest } = prev; return rest; });
    setExpandedPartId((e) => (e === id ? null : e));
  };
  const renamePin = (id: string, label: string) => setPins((prev) => prev.map((p) => (p.id === id ? { ...p, label: sanitizePlainText(label, 40) } : p)));

  const placeColor = (bodyPartId: string, color: string, colorName?: string) => {
    if (bodyPartId === BRUSH_PICKER) { setCustomHex(color.toUpperCase()); setPaintKey('picker'); return; } // the color picker was opened for the brush, not for a place
    setSelectedColor(color);
    setSelectedColorName(colorName);
    setPlacements((prev) => [...prev.filter((p) => p.bodyPartId !== bodyPartId), { bodyPartId, color, colorName }]);
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

      // The picture is always the whole body, whatever the zoom, with pins at their usual size and without the click-catching background.
      svgClone.setAttribute('viewBox', `0 0 ${MAP_W} ${MAP_H}`);
      svgClone.removeAttribute('style'); // the paintbrush gives the live map a style attribute; a second one added below would make the picture unreadable
      svgClone.querySelectorAll('[data-pin-dot]').forEach((el) => el.setAttribute('r', '7'));
      svgClone.querySelectorAll('[data-map-bg], [data-brush-cursor]').forEach((el) => el.remove());
      // A picture drawn inside an SVG that is turned into an image cannot load files, so each surface's picture is put in as a small embedded copy.
      await Promise.all([...svgClone.querySelectorAll('image[data-tex]')].map(async (el) => {
        const data = await textureDataUrl(el.getAttribute('data-tex') || '');
        if (data) el.setAttribute('href', data); else el.remove(); // the pattern's rect under it carries the surface's average color
      }));

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
      pins,
      ...(brushOn ? { strokes } : {}),
      imageDataUrl,
    };

    if (onSave) {
      onSave(bodyMapData);
    }
    onClose();
  };

  // Inline (the Sight gateway): save as the person goes, a moment after the last change, including the picture that goes into the report.
  const savedFirst = useRef(true);
  useEffect(() => {
    if (!inline || !onSave) return;
    if (savedFirst.current) { savedFirst.current = false; return; }
    let cancelled = false;
    const t = setTimeout(async () => {
      const imageDataUrl = await generateBodyMapImage();
      if (!cancelled) onSave({ placements, notes, pins, ...(brushOn ? { strokes } : {}), imageDataUrl });
    }, 700);
    return () => { cancelled = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placements, notes, pins, strokes, inline]);

  // Everything that can hold a color or a note: the pins first, then the body, then the face's parts.
  const listItems: { id: string; label: string; group: 'pins' | 'body' | 'face'; pin?: MapPin }[] = [
    ...pins.map((pin) => ({ id: pin.id, label: labelFor(pin.id, pins), group: 'pins' as const, pin })),
    ...BODY_PARTS.map((p) => ({ id: p.id, label: p.label, group: 'body' as const })),
    ...FACE_PARTS.map((p) => ({ id: p.id, label: p.label, group: 'face' as const })),
  ];
  const GROUP_TITLE = { pins: 'Your pins', body: 'Body', face: 'Face, in detail' } as const;

  return (
    <div className={inline ? 'rounded-2xl border border-border bg-card/50' : 'fixed inset-0 bg-background z-50 flex flex-col'}>
      {/* Header */}
      <div className={inline ? 'px-4 md:px-6 pt-4' : 'border-b border-border bg-background px-4 md:px-6 py-3 md:py-4'}>
        <div className="flex items-center justify-between">
          <div>
            {inline ? <h3 className="text-lg">Body emotion map (optional)</h3> : <h2>Body Emotion Map</h2>}
            <p className="text-sm text-muted-foreground">Place colors and notes where you feel them in your body{inline ? '. It saves as you go.' : ''}</p>
          </div>
          {!inline && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="size-5" />
            </Button>
          )}
        </div>
      </div>

      <div className={inline ? '' : 'flex-1 overflow-y-auto scroll-container'}>
        <div className={inline ? 'px-4 md:px-6 py-4' : 'max-w-6xl mx-auto px-4 md:px-6 py-8'}>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Body Map */}
            <div className="space-y-4">
              <Card className="p-6">
                <h3 className="mb-4">Your Body</h3>
                {brushOn && (
                  <div className="mb-4 space-y-3 rounded-lg border border-border p-3" data-brush-panel>
                    <fieldset className="flex flex-wrap items-center gap-x-4">
                      <legend className="text-sm font-medium">What a click or a drag does</legend>
                      <label className="flex min-h-11 items-center gap-2 text-sm"><input type="radio" name="bm-tool" className="size-5" checked={tool === 'pins'} onChange={() => setTool('pins')} /> Place pins and choose body parts</label>
                      <label className="flex min-h-11 items-center gap-2 text-sm"><input type="radio" name="bm-tool" className="size-5" checked={tool === 'brush'} onChange={() => setTool('brush')} data-tool-brush /> <Paintbrush className="size-4" aria-hidden /> Paintbrush: drag on the map to paint</label>
                    </fieldset>
                    {tool === 'brush' && (
                      <>
                        <fieldset className="space-y-1">
                          <legend className="text-sm font-medium">Paint with</legend>
                          <div className="flex flex-wrap gap-2">
                          {paintChoices.map((c) => (
                            <label key={c.key} className={`flex min-h-11 items-center gap-2 rounded-md border px-2 text-sm ${chosen.key === c.key ? 'border-foreground bg-muted' : 'border-border'}`}>
                              <input type="radio" name="bm-paint" className="size-5" checked={chosen.key === c.key} onChange={() => setPaintKey(c.key)} data-paint={c.key} />
                              {c.paint.surfaceId
                                ? <img src={texturePath(c.paint.surfaceId)} alt="" width={28} height={28} className="size-7 rounded border border-border object-cover" />
                                : <span aria-hidden className="inline-block size-7 rounded border border-border" style={{ background: c.paint.hex }} />}
                              <span>{c.key === 'picker' ? 'Another color' : `${c.paint.label} (${c.paint.kind}, ${c.paint.from})`}</span>
                              {c.key === 'picker' && <Button type="button" variant="outline" size="sm" className="min-h-11" onClick={() => { setPaintKey('picker'); setPickingPart(BRUSH_PICKER); }}>Choose a color</Button>}
                            </label>
                          ))}
                          </div>
                          {bm.brushes.length === 0 && <p className="text-xs text-muted-foreground">When you add Sight (two colors) or Touch (a surface) to your report, they become paints here.</p>}
                        </fieldset>
                        <div className="flex flex-wrap items-center gap-3">
                          <label className="flex items-center gap-2 text-sm" htmlFor={`${uid}-size`}>Brush size
                            <input id={`${uid}-size`} type="range" min={SIZE_MIN} max={SIZE_MAX} step={1} value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="h-11 w-40" aria-valuetext={`${brushSize} of ${SIZE_MAX}`} data-brush-size />
                          </label>
                          <svg width="80" height="28" viewBox="0 0 80 28" aria-hidden="true">
                            {paint.surfaceId && <defs><pattern id={`${uid}-prev`} patternUnits="userSpaceOnUse" width="24" height="24"><rect width="24" height="24" fill={paint.hex} /><image href={texturePath(paint.surfaceId)} width="24" height="24" preserveAspectRatio="xMidYMid slice" /></pattern></defs>}
                            <path d="M8 14h64" stroke={paint.surfaceId ? `url(#${uid}-prev)` : paint.hex} strokeWidth={Math.min(26, effectiveSize(brushSize, view.z))} strokeLinecap="round" />
                          </svg>
                          <span className="text-xs text-muted-foreground">The brush keeps this size on the screen, so zoom in for finer marks.</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
                <div role="group" aria-label="Zoom and move the map" className="mb-3 flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="icon" aria-label="Zoom in" onClick={() => zoomTo(view.z * 1.5)} disabled={view.z >= 6}><ZoomIn className="size-4" /></Button>
                  <Button variant="outline" size="icon" aria-label="Zoom out" onClick={() => zoomTo(view.z / 1.5)} disabled={view.z <= 1}><ZoomOut className="size-4" /></Button>
                  <Button variant="outline" size="icon" aria-label="Show the whole body" onClick={() => zoomTo(1, MAP_W / 2, MAP_H / 2)} disabled={view.z === 1}><Maximize2 className="size-4" /></Button>
                  <span className="mx-1 h-6 w-px bg-border" aria-hidden />
                  <Button variant="outline" size="icon" aria-label="Move the view left" onClick={() => panBy(-0.25, 0)} disabled={view.z === 1}><ArrowLeft className="size-4" /></Button>
                  <Button variant="outline" size="icon" aria-label="Move the view up" onClick={() => panBy(0, -0.25)} disabled={view.z === 1}><ArrowUp className="size-4" /></Button>
                  <Button variant="outline" size="icon" aria-label="Move the view down" onClick={() => panBy(0, 0.25)} disabled={view.z === 1}><ArrowDown className="size-4" /></Button>
                  <Button variant="outline" size="icon" aria-label="Move the view right" onClick={() => panBy(0.25, 0)} disabled={view.z === 1}><ArrowRight className="size-4" /></Button>
                </div>
                <div role="group" aria-label="Go to an area" className="mb-3 flex flex-wrap gap-2">
                  <Button variant="ghost" size="sm" onClick={() => zoomTo(3.75, 150, 48)}>Face</Button>
                  <Button variant="ghost" size="sm" onClick={() => zoomTo(2, 150, 150)}>Upper body</Button>
                  <Button variant="ghost" size="sm" onClick={() => zoomTo(3, 60, 240)}>Left hand</Button>
                  <Button variant="ghost" size="sm" onClick={() => zoomTo(3, 240, 240)}>Right hand</Button>
                  <Button variant="ghost" size="sm" onClick={() => zoomTo(2.5, 150, 375)}>Feet</Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => addPin(vx + vw / 2, vy + vh / 2)}><PinIcon className="size-4" /> Add a pin here</Button>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 flex justify-center items-center">
                  <svg
                    ref={svgRef}
                    width="300"
                    height="420"
                    viewBox={`${vx} ${vy} ${vw} ${vh}`}
                    className={`max-w-full h-auto ${brushing ? 'cursor-crosshair focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2' : ''}`}
                    style={brushing ? { touchAction: 'none' } : undefined}
                    {...(brushing ? { tabIndex: 0, role: 'group', 'aria-label': `Body map, paintbrush on, painting with ${paint.label}. Drag to paint. Or focus here and use the arrow keys to move the brush (Shift for small steps), Space to put it down or lift it, Control or Command + Z to undo. The buttons above do the same.` } : {})}
                    onKeyDown={onMapKeyDown}
                    onFocus={(e) => { if (brushing && e.target === e.currentTarget) setCursorShown(true); }}
                    onPointerDown={brushPointerDown}
                    onPointerMove={(e) => {
                      if (brushing) { brushPointerMove(e); return; }
                      const d = dragging.current; if (!d) return;
                      const q = mapPoint(e); if (!q) return;
                      d.moved = true; movePin(d.id, q.x, q.y);
                    }}
                    onPointerUp={(e) => { dragging.current = null; brushPointerEnd(e); }}
                    onPointerCancel={brushPointerEnd}
                    onPointerLeave={() => { dragging.current = null; }}
                  >
                    {/* The surfaces in use, as patterns the brush can paint with (the color underneath is the surface's average, in case its picture is not there) */}
                    <defs>
                      {[...new Map([...strokes, ...(openStroke ? [openStroke] : [])].filter((st) => st.paint.surfaceId).map((st) => [st.paint.surfaceId as string, st.paint])).values()].map((pt) => (
                        <pattern key={pt.surfaceId} id={`${uid}-tex-${pt.surfaceId}`} patternUnits="userSpaceOnUse" width={TILE} height={TILE}>
                          <rect width={TILE} height={TILE} fill={pt.hex} />
                          <image data-tex={pt.surfaceId} href={texturePath(pt.surfaceId as string)} width={TILE} height={TILE} preserveAspectRatio="xMidYMid slice" />
                        </pattern>
                      ))}
                    </defs>
                    {/* Clicking an empty spot places a pin there */}
                    <rect data-map-bg x="0" y="0" width={MAP_W} height={MAP_H} fill="transparent" className="cursor-crosshair"
                      onClick={(e) => { if (brushing) return; const q = mapPoint(e); if (q) addPin(q.x, q.y); }} />
                    {/* Simple body outline */}
                    <g className="pointer-events-none">
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
                    </g>
                    {/* The brush marks (the same marks are listed as text under the map) */}
                    {brushOn && (
                      <g aria-hidden="true" className="pointer-events-none" fill="none" strokeLinecap="round" strokeLinejoin="round" data-brush-strokes>
                        {[...strokes, ...(openStroke ? [openStroke] : [])].map((st, i) => (
                          <path key={i} d={strokePath(st.pts)} strokeWidth={st.size} stroke={st.paint.surfaceId ? `url(#${uid}-tex-${st.paint.surfaceId})` : st.paint.hex} opacity={0.9} data-stroke-paint={st.paint.id} />
                        ))}
                      </g>
                    )}
                    {/* The face's outline, drawn lightly, when zoomed in */}
                    {showFace && (
                      <g className="pointer-events-none" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5">
                        <path d="M130 32 q8 -4 15 0 M155 32 q8 -4 15 0" />
                        <ellipse cx="138" cy="43" rx="6" ry="3" /><ellipse cx="162" cy="43" rx="6" ry="3" />
                        <path d="M150 46 q-4 10 -3 11 q3 2 6 0 q1 -1 -3 -11" />
                        <path d="M142 70 q8 4 16 0 q-8 -3 -16 0" />
                      </g>
                    )}

                    {/* Clickable body parts (the face's parts only when zoomed in, or when they hold a color or note) */}
                    {[...BODY_PARTS, ...FACE_PARTS].filter((part) => !part.face || showFace || getPlacementForBodyPart(part.id) || notes[part.id]).map((part) => {
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
                            strokeWidth={(hasNote && !placement ? 2.5 : 2) * (part.face ? 0.4 : 1)}
                            strokeDasharray={hasNote && !placement ? '4 2' : undefined}
                            opacity={placement ? 0.7 : hasNote ? 0.4 : 0.2}
                            className={`${brushing ? 'pointer-events-none' : 'cursor-pointer'} hover:opacity-100 focus:opacity-100 transition-opacity`}
                            role="button"
                            tabIndex={0}
                            aria-label={`${part.label}: ${placement ? `color ${placement.colorName || placement.color}. ` : 'no color yet. '}Choose a color`}
                            onClick={(e) => { e.stopPropagation(); handleBodyPartClick(part.id); }}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleBodyPartClick(part.id); } }}
                          />
                          {placement && (
                            <text
                              x={part.position.x}
                              y={part.position.y}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="text-xs pointer-events-none"
                              fontSize={part.face ? 6 : undefined}
                              fill="white"
                            >
                              ✓
                            </text>
                          )}
                        </g>
                      );
                    })}

                    {/* Pins: placed anywhere, dragged or moved with the arrow keys */}
                    {pins.map((pin, i) => {
                      const placement = getPlacementForBodyPart(pin.id);
                      const r = 7 / view.z;
                      return (
                        <g key={pin.id}>
                          <circle
                            data-pin-dot
                            cx={pin.x}
                            cy={pin.y}
                            r={r}
                            fill={placement?.color ?? selectedColor}
                            stroke="white"
                            strokeWidth={2 / view.z}
                            className={`${brushing ? 'pointer-events-none' : 'cursor-grab active:cursor-grabbing'} focus:outline-none`}
                            style={{ filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.9))', touchAction: 'none' }}
                            role="button"
                            tabIndex={0}
                            aria-label={`Pin ${i + 1}${pin.label ? `, ${pin.label}` : ''}, near ${labelFor(pin.id, pins)}. Arrow keys move it, Enter opens it, Delete removes it.`}
                            onPointerDown={(e) => { e.stopPropagation(); (e.target as Element).setPointerCapture?.(e.pointerId); dragging.current = { id: pin.id, moved: false }; }}
                            onPointerUp={(e) => { e.stopPropagation(); const d = dragging.current; dragging.current = null; if (d && !d.moved) { setExpandedPartId(pin.id); setPickingPart(pin.id); } }}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                              const step = (e.shiftKey ? 10 : 2) / Math.max(1, view.z / 2);
                              if (e.key === 'ArrowLeft') { e.preventDefault(); movePin(pin.id, pin.x - step, pin.y); }
                              else if (e.key === 'ArrowRight') { e.preventDefault(); movePin(pin.id, pin.x + step, pin.y); }
                              else if (e.key === 'ArrowUp') { e.preventDefault(); movePin(pin.id, pin.x, pin.y - step); }
                              else if (e.key === 'ArrowDown') { e.preventDefault(); movePin(pin.id, pin.x, pin.y + step); }
                              else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedPartId(pin.id); setPickingPart(pin.id); }
                              else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); removePin(pin.id); }
                            }}
                          />
                          <text x={pin.x} y={pin.y} textAnchor="middle" dominantBaseline="central" fontSize={8 / view.z} fill="white" stroke="rgba(0,0,0,0.6)" strokeWidth={0.4 / view.z} paintOrder="stroke" className="pointer-events-none">{i + 1}</text>
                        </g>
                      );
                    })}
                    {brushing && cursorShown && (
                      <g data-brush-cursor className="pointer-events-none" aria-hidden="true">
                        <circle cx={cursor.x} cy={cursor.y} r={Math.max(1.5, effectiveSize(brushSize, view.z) / 2)} fill="none" stroke="white" strokeWidth={1.6 / view.z} />
                        <circle cx={cursor.x} cy={cursor.y} r={Math.max(1.5, effectiveSize(brushSize, view.z) / 2)} fill="none" stroke="black" strokeWidth={0.8 / view.z} strokeDasharray={brushDown ? undefined : `${3 / view.z} ${2 / view.z}`} />
                        <path d={`M${cursor.x - 4 / view.z} ${cursor.y}h${8 / view.z}M${cursor.x} ${cursor.y - 4 / view.z}v${8 / view.z}`} stroke="black" strokeWidth={1 / view.z} />
                      </g>
                    )}
                  </svg>
                </div>
                {brushOn && (
                  <div className="mt-4 space-y-3" data-brush-below>
                        <div role="group" aria-label="Paint without a pointer" className={`${tool === 'brush' ? 'flex' : 'hidden'} flex-wrap items-center gap-2`}>
                          <Button type="button" variant={brushDown ? 'default' : 'outline'} size="sm" className="min-h-11 gap-2" aria-pressed={brushDown} onClick={toggleBrush} data-brush-toggle>{brushDown ? 'Lift the brush' : 'Put the brush down'}</Button>
                          <Button type="button" variant="outline" size="sm" className="min-h-11" onClick={dabHere} data-brush-dab>Dab here</Button>
                          <Button type="button" variant="outline" size="icon" className="size-11" aria-label="Move the brush left" onClick={() => nudgeCursor(-1, 0)}><ArrowLeft className="size-4" /></Button>
                          <Button type="button" variant="outline" size="icon" className="size-11" aria-label="Move the brush up" onClick={() => nudgeCursor(0, -1)}><ArrowUp className="size-4" /></Button>
                          <Button type="button" variant="outline" size="icon" className="size-11" aria-label="Move the brush down" onClick={() => nudgeCursor(0, 1)}><ArrowDown className="size-4" /></Button>
                          <Button type="button" variant="outline" size="icon" className="size-11" aria-label="Move the brush right" onClick={() => nudgeCursor(1, 0)}><ArrowRight className="size-4" /></Button>
                          <label className="flex items-center gap-2 text-sm">Move the brush to
                            <select className="h-11 rounded-md border border-border bg-input-background px-2 text-sm text-foreground" value="" onChange={(e) => e.target.value && goToPlace(e.target.value)} data-brush-goto>
                              <option value="" disabled>Choose a place</option>
                              {[...BODY_PARTS, ...FACE_PARTS].map((pt) => <option key={pt.id} value={pt.id}>{pt.label}</option>)}
                              {pins.map((pin) => <option key={pin.id} value={pin.id}>{labelFor(pin.id, pins)}</option>)}
                            </select>
                          </label>
                        </div>
                    <p className="text-xs text-muted-foreground">These buttons (and the arrow keys with the map focused) paint without a pointer. Choose Paintbrush above to use them.</p>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="ghost" size="sm" className="min-h-11 gap-2" onClick={undoStroke} disabled={!strokes.length} data-brush-undo><Undo2 className="size-4" />Undo the last stroke</Button>
                      <Button type="button" variant="ghost" size="sm" className="min-h-11 gap-2" onClick={redoStroke} disabled={!undone.length}><Redo2 className="size-4" />Put the stroke back</Button>
                      <Button type="button" variant="ghost" size="sm" className="min-h-11 gap-2" onClick={clearStrokes} disabled={!strokes.length} data-brush-clear><Eraser className="size-4" />Clear the brush marks</Button>
                      {cleared && <Button type="button" variant="outline" size="sm" className="min-h-11" onClick={restoreStrokes}>Put the cleared marks back</Button>}
                    </div>
                    <div role="status" aria-live="polite" className="sr-only" data-brush-live>{announce}</div>
                    <div className="text-sm" data-brush-text>
                      <span className="font-medium">Brush marks, in words: </span>
                      {strokes.length ? describeStrokes(strokes).join('; ') + '.' : 'none yet.'}
                    </div>
                  </div>
                )}
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Click or tap anywhere on an empty spot to drop a pin there, or choose a body part to pick its color. Drag a pin to move it, or focus it and use the arrow keys. Zoom in to the face for its parts. A dashed outline means a part has a note but no color.
                </p>
              </Card>
            </div>

            {/* Body Part Details */}
            <div className="space-y-4">
              <Card className="p-6">
                <h3 className="mb-4">Body Part Details</h3>
                <div className="space-y-2">
                  {listItems.map((part, idx) => {
                    const placement = getPlacementForBodyPart(part.id);
                    const note = notes[part.id] || '';
                    const isExpanded = expandedPartId === part.id;
                    return (
                      <div key={part.id}>
                      {(idx === 0 || listItems[idx - 1].group !== part.group) && <p className="mb-1 mt-3 text-sm font-medium first:mt-0">{GROUP_TITLE[part.group]}</p>}
                      <div className="rounded-lg border border-border overflow-hidden">
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
                            <div className="flex flex-wrap items-center gap-2 pt-2">
                              <Button variant="outline" size="sm" onClick={() => setPickingPart(part.id)}>{placement ? 'Change color' : 'Choose a color'}</Button>
                              {part.pin && <Button variant="outline" size="sm" onClick={() => removePin(part.id)}><X className="size-3.5 mr-1" />Remove pin</Button>}
                            </div>
                            {part.pin && (
                              <input
                                type="text"
                                aria-label={`Name for ${part.label} (optional)`}
                                value={part.pin.label ?? ''}
                                maxLength={40}
                                onChange={(e) => renamePin(part.id, e.target.value)}
                                placeholder="Name this pin (optional), such as “tight spot”"
                                className="w-full rounded border border-border bg-background p-2 text-sm"
                              />
                            )}
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
                              aria-label="Note for this body part (optional)"
                              onChange={(e) => handleNoteChange(part.id, e.target.value)}
                              onBlur={() => handleNoteBlur(part.id)}
                              placeholder="Add a note for this body part (optional)..."
                              className="w-full min-h-16 resize-none text-sm p-2 rounded border border-border bg-background"
                              maxLength={NOTE_MAX_LENGTH}
                            />
                          </div>
                        )}
                      </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Info */}
              <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>How to use:</strong> Choose a body part where you feel an emotion or sensation, then pick its color in the window that opens. Expand any body part to add a short note, with or without a color. This map is shared across every {L('gateway')} — open it from any of them to keep adding to the same picture.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={pickingPart !== null} onOpenChange={(open) => !open && setPickingPart(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto w-[95vw] sm:w-auto">
          <DialogHeader>
            <DialogTitle>Choose a color for {pickingPart === BRUSH_PICKER ? 'the paintbrush' : pickingPart ? labelFor(pickingPart, pins) : 'this body part'}</DialogTitle>
            <DialogDescription>
              The color is placed as you choose it. Browse the sixteen palettes or enter a color of your own, then close this window.
            </DialogDescription>
          </DialogHeader>
          {userColors?.color1 && userColors?.color2 && (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => pickingPart && placeColor(pickingPart, userColors.color1, userColors.color1Name || undefined)}>
                <span aria-hidden className="mr-2 inline-block size-3 rounded-full border border-border" style={{ background: userColors.color1 }} />Use my current color
              </Button>
              <Button variant="outline" size="sm" onClick={() => pickingPart && placeColor(pickingPart, userColors.color2, userColors.color2Name || undefined)}>
                <span aria-hidden className="mr-2 inline-block size-3 rounded-full border border-border" style={{ background: userColors.color2 }} />Use my wish color
              </Button>
            </div>
          )}
          <ValarColorPicker
            selectedColor={pickingPart === BRUSH_PICKER ? customHex : (pickingPart && getPlacementForBodyPart(pickingPart)?.color) || selectedColor}
            onColorChange={(color) => pickingPart && placeColor(pickingPart, color)}
            size="md"
            onClose={() => setPickingPart(null)}
          />
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <div className={inline ? 'px-4 md:px-6 pb-4' : 'border-t border-border bg-background px-4 md:px-6 py-4'}>
        <div className="flex justify-between gap-2">
          <Button
            variant="outline"
            onClick={handleDownloadImage}
            className="gap-2"
          >
            <Download className="size-4" />
            Download Image
          </Button>
          {!inline && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={handleSaveMap}>
                Save Map
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
