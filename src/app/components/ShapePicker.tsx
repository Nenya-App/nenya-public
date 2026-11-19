// Line drawings to choose from in the Movement and Insight gateways (src/lib/gatewayShapes.ts): starting points, never a measurement, and always
// optional. Each drawing has a name and a one-sentence description that a screen reader says; choosing is a plain toggle button. Up to three can be chosen.
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { shapesFor, type ShapeSet } from '../../lib/gatewayShapes';
import { animatedArt, SHAPE_ANIM_CSS } from '../../lib/shapeAnimation';

export const MAX_SHAPES = 3;

// Each drawing is shown as a still picture that is always there (owner, 2026-11-18: the animation is an addition, not a replacement), with an animated copy laid over it:
// each line draws itself in turn and the filled dots fade in, again and again, so the shape is seen being made (src/lib/shapeAnimation.ts). Under reduced motion, or when paused,
// or once a drawing is chosen, only the still picture shows. Because the loop runs for more than five seconds there is a button to pause every drawing (WCAG 2.2.2).

interface Props {
  set: ShapeSet;
  selected: string[];
  onToggle: (id: string) => void;
  /** Distinguishes the present and wish pickers on one page. */
  idPrefix: string;
  /** Tray mode: three is a soft limit (a warning before a fourth, set by the page), not a block. */
  soft?: boolean;
}

export function ShapePicker({ set, selected, onToggle, idPrefix, soft = false }: Props) {
  const [paused, setPaused] = useState(false);
  const shapes = useMemo(() => shapesFor(set).map((x) => ({ ...x, live: animatedArt(x.svg).svg })), [set]);
  const root = useRef<HTMLDivElement>(null);
  // A line draws itself by its own length (measured here, so it does not depend on how a browser handles the path-length attribute).
  useLayoutEffect(() => {
    root.current?.querySelectorAll<SVGGeometryElement>('.sa-draw').forEach((el) => {
      if (typeof el.getTotalLength === 'function') el.style.setProperty('--len', String(Math.ceil(el.getTotalLength()) + 2));
    });
  }, [shapes]);
  const full = !soft && selected.length >= MAX_SHAPES;
  return (
    <div ref={root} className={`space-y-2 shape-anim${paused ? ' shape-paused' : ''}`}>
      <style>{SHAPE_ANIM_CSS}</style>
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
              <span aria-hidden className={`relative block size-14 shape-art${on ? ' shape-chosen' : ''}`}>
                <span className="shape-still block size-full" dangerouslySetInnerHTML={{ __html: s.svg }} />
                <span className="shape-live" dangerouslySetInnerHTML={{ __html: s.live }} />
              </span>
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
