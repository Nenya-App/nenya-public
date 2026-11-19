import { useState } from 'react';
import { movePreview, patternPreview } from '../../lib/lensPreview';
import { shapeById } from '../../lib/gatewayShapes';

// The live preview on the Movement and Pattern slider cards (tray): a shape that moves, or layers that sharpen, as the sliders say, and the same thing in words that updates politely. Still under reduced
// motion (the drift is shown as ghost outlines instead). The drift runs for longer than five seconds, so there is a button to pause it (WCAG 2.2.2).
const CSS = `
@keyframes lensDrift { from { transform: translate(calc(var(--dx) * var(--amp) * -1), calc(var(--dy) * var(--amp) * -1)); } to { transform: translate(calc(var(--dx) * var(--amp)), calc(var(--dy) * var(--amp))); } }
.lens-drift { animation: lensDrift var(--dur) ease-in-out infinite alternate; }
@keyframes lensDraw { 0% { stroke-dashoffset: 100; } 45% { stroke-dashoffset: 0; } 82% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: -100; } }
.lens-shape svg { width: 100%; height: 100%; stroke-width: var(--sw); }
.lens-shape path, .lens-shape circle { stroke-dasharray: 100; animation: lensDraw var(--draw) ease-in-out infinite; }
.lens-paused .lens-shape path, .lens-paused .lens-shape circle { animation: none; stroke-dasharray: none; }
@media (prefers-reduced-motion: reduce) { .lens-shape path, .lens-shape circle { animation: none; stroke-dasharray: none; } }
.lens-drift.lens-still, .lens-paused .lens-drift { animation: none; }
@media (prefers-reduced-motion: reduce) { .lens-drift { animation: none; box-shadow: calc(var(--dx) * var(--amp) * -1) calc(var(--dy) * var(--amp) * -1) 0 -2px currentColor, calc(var(--dx) * var(--amp) * -2) calc(var(--dy) * var(--amp) * -2) 0 -4px currentColor; } }`;

export function LensPreview(props: { kind: 'movement'; speed: number | null; energy: number | null; direction: string | null; shapeId?: string | null } | { kind: 'pattern'; clarity: number | null; depth: number | null; word: string | null }) {
  const [paused, setPaused] = useState(false);
  const mv = props.kind === 'movement' ? movePreview(props.speed, props.energy, props.direction) : null;
  const pt = props.kind === 'pattern' ? patternPreview(props.clarity, props.depth, props.word) : null;
  return (
    <div className={`flex flex-col items-center gap-2 ${paused ? 'lens-paused' : ''}`}>
      <style>{CSS}</style>
      <div className="grid h-36 w-full max-w-xs place-items-center overflow-hidden rounded-xl border border-border text-foreground">
        {mv && (() => {
          const shape = props.kind === 'movement' && props.shapeId ? shapeById(props.shapeId) : undefined;
          const vars = { ['--dur' as string]: `${mv.durationS}s`, ['--amp' as string]: `${mv.amplitudePx}px`, ['--dx' as string]: String(mv.dx), ['--dy' as string]: String(mv.dy), ['--draw' as string]: `${mv.drawS}s`, ['--sw' as string]: String(mv.strokeWidth), opacity: mv.opacity };
          // The drawing the person chose, drawn and moved by the sliders (Speed: how fast it draws and drifts; Energy: how bold the line and how far it travels); a plain ring until one is chosen.
          return shape ? (
            <div role="img" aria-label={`${shape.label}, drawn and moved as your sliders say; the line below says how`} className={`lens-drift lens-shape relative size-24 text-foreground${mv.still ? ' lens-still' : ''}`} style={vars}
              dangerouslySetInnerHTML={{ __html: shape.svg.replace(/<(path|circle) /g, '<$1 pathLength="100" ') }} />
          ) : (
            <div role="img" aria-label="A shape that moves; the line below says how" className={`lens-drift relative size-20 rounded-full border-4 border-current${mv.still ? ' lens-still' : ''}`} style={vars} />
          );
        })()}
        {pt && (
          <div role="img" aria-label="Layers of a repeating shape; the line below says how" className="relative size-20 motion-safe:transition-[filter]" style={{ filter: `blur(${pt.blurPx}px)` }}>
            {[0, 1, 2].slice(0, pt.layers).map((i) => <span key={i} className="absolute rounded-full border-4 border-current" style={{ inset: `${i * 14}px` }} />)}
          </div>
        )}
      </div>
      <p className="text-center text-xs text-muted-foreground">It looks like: <span role="status" aria-live="polite">{(mv ?? pt)!.words}</span></p>
      {mv && <button type="button" onClick={() => setPaused((p) => !p)} aria-pressed={paused} className="min-h-11 text-xs underline underline-offset-4 text-muted-foreground">{paused ? 'Play the preview' : 'Pause the preview'}</button>}
    </div>
  );
}
