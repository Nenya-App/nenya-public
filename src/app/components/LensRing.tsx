import { useEffect, useRef, useState } from 'react';
import { announceLeaf, leafAngle, leafCaption, leafDescription, leafName, leafPath, nextIndex, pressAction, ringFits, ringItems, sectorPath, INNER_FRACTION, type RingItem, type RingStatus } from '../../lib/lensRing';

// The lens ring (docs/eight-sided-gem-scope.md Part 2, section 4), behind VITE_LENS_RING=on. The leaves are a menu: one leaf per lens, in lens order clockwise from the top.
// Touch and mouse: the first tap on a leaf shows what it is (name, status, one line); a second tap on the same leaf picks the lens up. Keyboard: Tab enters the ring as one stop,
// arrows/Home/End move (focus shows the information), Enter or Space picks up, Escape clears the information and returns focus to where it came from.
// Every leaf is a real <button> with an accessible name and description, clipped to its angular sector (so touches go to the sector, not to the overlapping leaf shapes).
// Nothing animates, so reduced motion needs no special case. The text tray stays beside it as the equal alternative; below the size where a sector is 44 CSS px the ring is not drawn.

interface Props {
  items: readonly RingItem[];
  statusOf: (id: string) => RingStatus;
  onPick: (id: string) => void;
}

const MAX_SIZE = 360;

export function LensRing({ items: all, statusOf, onPick }: Props) {
  const items = ringItems(all);
  const n = items.length;
  const [width, setWidth] = useState(() => (typeof window === 'undefined' ? MAX_SIZE : window.innerWidth));
  const [selected, setSelected] = useState<number | null>(null);
  const [roving, setRoving] = useState(0);
  const [live, setLive] = useState('');
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const wrap = useRef<HTMLDivElement>(null);
  const pointer = useRef(false); // a pointer press is about to focus a button: that focus is not "information" by itself
  const cameFrom = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const on = () => setWidth(window.innerWidth);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);

  const size = Math.min(MAX_SIZE, width - 32);
  if (n === 0 || !ringFits(size, n)) return null; // too small: the text list is the way in
  const R = size / 2, rm = R * ((INNER_FRACTION + 1) / 2);
  const cur = selected !== null && selected < n ? selected : null;
  const idx = roving < n ? roving : 0;

  const inform = (i: number, speak: boolean) => { setSelected(i); setRoving(i); setLive(speak ? announceLeaf(items[i], i, n, statusOf(items[i].id)) : ''); };
  const press = (i: number) => {
    pointer.current = false;
    if (pressAction(cur, i) === 'pick-up') { setSelected(null); setLive(''); onPick(items[i].id); } else inform(i, true);
  };
  const key = (e: React.KeyboardEvent, i: number) => {
    if (e.key === 'Escape') {
      e.preventDefault(); setSelected(null); setLive('');
      const back = cameFrom.current; if (back && document.contains(back)) back.focus(); else (document.activeElement as HTMLElement | null)?.blur();
      return;
    }
    const next = nextIndex(e.key, i, n);
    if (next === null) return;
    e.preventDefault(); refs.current[next]?.focus();
  };

  const caption = cur !== null ? leafCaption(items[cur], statusOf(items[cur].id)) : null;
  return (
    <section aria-label="Lens ring" className="flex flex-col items-center gap-3" ref={wrap}
      onFocusCapture={(e) => { const from = e.relatedTarget as HTMLElement | null; if (from && !wrap.current?.contains(from)) cameFrom.current = from; }}>
      <p className="text-sm text-muted-foreground text-center max-w-md">The leaves are the same lenses as the list below. Choose a leaf to read about it; choose it again to pick it up.</p>
      <div style={{ position: 'relative', width: size, height: size }} role="group" aria-label="Lenses, one leaf each" aria-describedby="lens-ring-help">
        <span id="lens-ring-help" className="sr-only">Use the arrow keys to move between leaves, Home and End to jump. Press Enter or Space to pick a lens up. Escape clears the information.</span>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" focusable="false" style={{ position: 'absolute', inset: 0 }}>
          {items.map((it, i) => {
            const st = statusOf(it.id), on = i === cur, a = (leafAngle(i, n) * Math.PI) / 180;
            const cx = R + rm * Math.sin(a), cy = R - rm * Math.cos(a);
            return (
              <g key={it.id}>
                <path d={leafPath(i, n, size)} fill={it.custom ? (it.color ?? '#9bb0c9') : i % 2 ? '#C9CED8' : 'var(--nenya-accent-warm)'} fillOpacity={st === 'not-opened' ? 0.55 : 0.95} stroke={on ? 'var(--foreground)' : 'var(--border)'} strokeWidth={on ? 4 : 1.5} />
                {st === 'examined' && <circle cx={cx} cy={cy} r={7} fill="none" stroke="#1a1a1a" strokeWidth={2.5} />}
                {st === 'included' && <><circle cx={cx} cy={cy} r={9} fill="#1a1a1a" /><path d={`M${cx - 4.5} ${cy} l3.2 3.4 l5.8 -6.6`} fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" /></>}
              </g>
            );
          })}
        </svg>
        {items.map((it, i) => <span key={`d${it.id}`} id={`lens-ring-d-${i}`} className="sr-only">{leafDescription(it)}</span>)}
        {items.map((it, i) => (
          <button
            key={it.id}
            ref={(el) => { refs.current[i] = el; }}
            type="button"
            tabIndex={i === idx ? 0 : -1}
            aria-label={leafName(it, i, n, statusOf(it.id))}
            aria-describedby={`lens-ring-d-${i}`}
            onPointerDown={() => { pointer.current = true; }}
            onFocus={() => { setRoving(i); if (!pointer.current) inform(i, false); }}
            onClick={() => press(i)}
            onKeyDown={(e) => key(e, i)}
            style={{ position: 'absolute', inset: 0, width: size, height: size, padding: 0, border: 0, background: 'transparent', cursor: 'pointer', clipPath: `path('${sectorPath(i, n, size)}')`, WebkitClipPath: `path('${sectorPath(i, n, size)}')`, outline: 'none' }}
          />
        ))}
      </div>
      <div className="min-h-[5.5rem] text-center max-w-md">
        {caption ? (<><p className="text-lg">{caption.title}</p><p className="text-sm">{caption.status}</p><p className="text-sm text-muted-foreground">{caption.line}</p><p className="text-sm">Choose it again to pick it up.</p></>) : <p className="text-sm text-muted-foreground">Nothing chosen yet.</p>}
      </div>
      <p role="status" aria-live="polite" className="sr-only">{live}</p>
    </section>
  );
}
