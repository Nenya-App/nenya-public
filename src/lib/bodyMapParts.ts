// The body map's geometry and names, shared by the map itself and by the report text (so a pin or a face part reads the same everywhere).
// Coordinates are in the map's own drawing space: 300 wide, 420 high; the head is centered at (150, 50).
export interface BodyPart { id: string; label: string; position: { x: number; y: number }; radius: number; /** Shown only when the map is zoomed in (or when it holds a color or note). */ face?: boolean }

export const MAP_W = 300;
export const MAP_H = 420;

export const BODY_PARTS: BodyPart[] = [
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

// The face, in more detail. Left and right follow the body parts above: "left" is the smaller x, on the left of the picture, like L. Shoulder.
export const FACE_PARTS: BodyPart[] = [
  { id: 'forehead', label: 'Forehead', position: { x: 150, y: 22 }, radius: 7, face: true },
  { id: 'left-temple', label: 'L. Temple', position: { x: 125, y: 33 }, radius: 4.5, face: true },
  { id: 'right-temple', label: 'R. Temple', position: { x: 175, y: 33 }, radius: 4.5, face: true },
  { id: 'left-eyebrow', label: 'L. Eyebrow', position: { x: 138, y: 32 }, radius: 4.5, face: true },
  { id: 'right-eyebrow', label: 'R. Eyebrow', position: { x: 162, y: 32 }, radius: 4.5, face: true },
  { id: 'left-eye', label: 'L. Eye', position: { x: 138, y: 43 }, radius: 4.5, face: true },
  { id: 'right-eye', label: 'R. Eye', position: { x: 162, y: 43 }, radius: 4.5, face: true },
  { id: 'left-ear', label: 'L. Ear', position: { x: 113, y: 52 }, radius: 5, face: true },
  { id: 'right-ear', label: 'R. Ear', position: { x: 187, y: 52 }, radius: 5, face: true },
  { id: 'nose', label: 'Nose', position: { x: 150, y: 54 }, radius: 4.5, face: true },
  { id: 'left-cheek', label: 'L. Cheek', position: { x: 131, y: 61 }, radius: 6, face: true },
  { id: 'right-cheek', label: 'R. Cheek', position: { x: 169, y: 61 }, radius: 6, face: true },
  { id: 'mouth', label: 'Mouth and lips', position: { x: 150, y: 70 }, radius: 6, face: true },
  { id: 'left-jaw', label: 'L. Jaw', position: { x: 127, y: 78 }, radius: 5, face: true },
  { id: 'right-jaw', label: 'R. Jaw', position: { x: 173, y: 78 }, radius: 5, face: true },
  { id: 'chin', label: 'Chin', position: { x: 150, y: 84 }, radius: 5, face: true },
];

export const ALL_PARTS: BodyPart[] = [...BODY_PARTS, ...FACE_PARTS];

/** A pin the person placed anywhere on the map (by clicking, dragging, or the keyboard). Its color and note are kept with the other parts', under its own id. */
export interface MapPin { id: string; x: number; y: number; label?: string }

export const isPinId = (id: string): boolean => /^pin-\d+$/.test(id);

/** The named part whose center is nearest a point (face parts count only for points on the head), so a pin can be described in words. */
export function nearestPart(x: number, y: number): BodyPart {
  const onHead = (x - 150) ** 2 / 38 ** 2 + (y - 50) ** 2 / 43 ** 2 <= 1;
  let best = BODY_PARTS[0], bd = Infinity;
  for (const p of onHead ? ALL_PARTS : BODY_PARTS) {
    const d = (p.position.x - x) ** 2 + (p.position.y - y) ** 2;
    if (d < bd) { bd = d; best = p; }
  }
  return best;
}

/** How a pin reads in a report: its own name if it has one, and always where it is, in words. */
export function pinLabel(pin: MapPin, index: number): string {
  const near = nearestPart(pin.x, pin.y).label;
  const name = pin.label?.trim();
  return name ? `Pin ${index + 1}, "${name}" (near ${near})` : `Pin ${index + 1} (near ${near})`;
}

/** The label of a part or a pin by its id. A pin that is not in the list (it was removed) reads as a plain pin. */
export function labelFor(id: string, pins: MapPin[] = []): string {
  const part = ALL_PARTS.find((p) => p.id === id);
  if (part) return part.label;
  const i = pins.findIndex((p) => p.id === id);
  return i >= 0 ? pinLabel(pins[i], i) : isPinId(id) ? 'Pin' : id;
}

export const clamp = (n: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, n));
