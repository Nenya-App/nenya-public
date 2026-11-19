// Line drawings to choose from in the Movement and Insight gateways (src/lib/gatewayShapes.ts): starting points, never a measurement, and always
// optional. Each drawing has a name and a one-sentence description that a screen reader says; choosing is a plain toggle button. Up to three can be chosen.
import { useMemo, useState } from 'react';
import { shapesFor, type ShapeSet } from '../../lib/gatewayShapes';

export const MAX_SHAPES = 3;

interface Props {
  set: ShapeSet;
  selected: string[];
  onToggle: (id: string) => void;
  /** Distinguishes the present and wish pickers on one page. */
  idPrefix: string;
  /** Tray mode: three is a soft limit (a warning before a fourth, set by the page), not a block. */
  soft?: boolean;
}

// The drawings are animated (owner, 2026-11-18: not static): each line draws itself, rests, and is wiped away, again and again, a little later for each line, so the shape
// is seen being made. Every path and circle gets pathLength 100 so one set of keyframes fits them all. Under reduced motion the drawings are still. Because the loop runs for
// more than five seconds, there is a button to pause every drawing (WCAG 2.2.2), and a drawing a person has chosen stays drawn.
const ANIM_CSS = `
@keyframes shapeDraw { 0% { stroke-dashoffset: 100; } 45% { stroke-dashoffset: 0; } 82% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: -100; } }
.shape-anim .shape-art path, .shape-anim .shape-art circle { stroke-dasharray: 100; animation: shapeDraw 4.5s ease-in-out infinite; }
.shape-anim .shape-art path:nth-child(2), .shape-anim .shape-art circle:nth-child(2) { animation-delay: .25s; }
.shape-anim .shape-art path:nth-child(3), .shape-anim .shape-art circle:nth-child(3) { animation-delay: .5s; }
.shape-anim .shape-art path:nth-child(4), .shape-anim .shape-art circle:nth-child(4) { animation-delay: .75s; }
.shape-anim .shape-art path:nth-child(n+5), .shape-anim .shape-art circle:nth-child(n+5) { animation-delay: 1s; }
.shape-anim.shape-paused .shape-art path, .shape-anim.shape-paused .shape-art circle, .shape-anim .shape-chosen path, .shape-anim .shape-chosen circle { animation: none; stroke-dasharray: none; stroke-dashoffset: 0; }
@media (prefers-reduced-motion: reduce) { .shape-anim .shape-art path, .shape-anim .shape-art circle { animation: none; stroke-dasharray: none; stroke-dashoffset: 0; } }`;

export function ShapePicker({ set, selected, onToggle, idPrefix, soft = false }: Props) {
  const [paused, setPaused] = useState(false);
  const shapes = useMemo(() => shapesFor(set).map((x) => ({ ...x, art: x.svg.replace(/<(path|circle) /g, '<$1 pathLength="100" ') })), [set]);
  const full = !soft && selected.length >= MAX_SHAPES;
  return (
    <div className={`space-y-2 shape-anim${paused ? ' shape-paused' : ''}`}>
      <style>{ANIM_CSS}</style>
      <button type="button" onClick={() => setPaused((p) => !p)} aria-pressed={paused} className="min-h-11 text-xs underline underline-offset-4 text-muted-foreground">
        {paused ? 'Play the drawings' : 'Pause the drawings'}
      </button>
      <div role="group" aria-labelledby={`${idPrefix}-shapes-label`} className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {shapes.map((s) => {
          const on = selected.includes(s.id);
          return (
            <button
              key={s.id}
              type="button"
              id={`${idPrefix}-${s.id}`}
              aria-pressed={on}
              aria-label={`${s.label}. ${s.alt}`}
              title={s.alt}
              disabled={!on && full}
              onClick={() => onToggle(s.id)}
              className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-center text-xs transition-colors disabled:opacity-40 ${on ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/50'}`}
            >
              <span aria-hidden className={`block size-14 shape-art${on ? ' shape-chosen' : ''}`} dangerouslySetInnerHTML={{ __html: s.art }} />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground" role="status">
        {soft ? (selected.length === 0 ? 'None chosen. You can skip this.' : `${selected.length} chosen.`) : selected.length === 0 ? 'None chosen. You can choose up to three, or skip this.' : `${selected.length} of ${MAX_SHAPES} chosen${full ? '. Unchoose one to pick another.' : '.'}`}
      </p>
    </div>
  );
}
