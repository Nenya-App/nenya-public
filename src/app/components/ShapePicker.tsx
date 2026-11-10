// Line drawings to choose from in the Movement and Insight gateways (src/lib/gatewayShapes.ts): starting points, never a measurement, and always
// optional. Each drawing has a name and a one-sentence description that a screen reader says; choosing is a plain toggle button. Up to three can be chosen.
import { shapesFor, type ShapeSet } from '../../lib/gatewayShapes';

export const MAX_SHAPES = 3;

interface Props {
  set: ShapeSet;
  selected: string[];
  onToggle: (id: string) => void;
  /** Distinguishes the present and wish pickers on one page. */
  idPrefix: string;
}

export function ShapePicker({ set, selected, onToggle, idPrefix }: Props) {
  const shapes = shapesFor(set);
  const full = selected.length >= MAX_SHAPES;
  return (
    <div className="space-y-2">
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
              <span aria-hidden className="block size-14" dangerouslySetInnerHTML={{ __html: s.svg }} />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground" role="status">
        {selected.length === 0 ? 'None chosen. You can choose up to three, or skip this.' : `${selected.length} of ${MAX_SHAPES} chosen${full ? '. Unchoose one to pick another.' : '.'}`}
      </p>
    </div>
  );
}
