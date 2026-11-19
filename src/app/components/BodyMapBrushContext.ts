import { createContext } from 'react';
import type { Brush, BrushStroke } from '../../lib/bodyMapBrush';

// What the body map needs from the rest of the app without every lens page passing it along (docs/lens-rewrite-scope.md, the shared body map; behind VITE_LENS_TRAY):
// whether the paintbrush is offered at all, the brushes the added lenses give, and the strokes already on the map (the lens pages pass the other saved parts to it, not these).
// The default is "off", so a body map with no provider (the switch off) is exactly as it was.
export interface BodyMapBrushValue { enabled: boolean; brushes: Brush[]; strokes: BrushStroke[] }
export const BodyMapBrushContext = createContext<BodyMapBrushValue>({ enabled: false, brushes: [], strokes: [] });
