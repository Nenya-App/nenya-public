import { useEffect, useRef, useSyncExternalStore } from 'react';

// The mark (owner, 2026-11-15; settings from the editor 2026-11-17): "nenya.biz" with four e's stacked in one letter space. The white e stays; a gold e (in front) rests
// turned half a circle (upside down), so the mark reads nənya.biz, "nunya biz": none of your business. The schwa lives only in this mark; everywhere else the name is plain
// "Nenya". Screen readers hear "nenya.biz". It is also a visual form of the session ID: the colours come from the session's two colours, which of the other e's rest upside
// down from the ID. NO ANIMATION (owner, 2026-11-18: it looked messy and ugly on small text, "remove it completely for now"): no turn on first sight, no fidget, no play button.
// The resting placement is exactly the editor's (nudge, rise and space after, per face, in src/lib/nameMark.ts). The timings and the fidget stay in nameMark.ts, unused, for if
// the animation returns. Behind VITE_NAME_MARK=on.

import { MARK_LAYERS, MARK_MOTION, MARK_SETTINGS, hexToRgb, markArrangement, markColourIndexes, markPalette, type MarkFace as Face, type Rgb } from '../../lib/nameMark';
import { getSessionMarkId, subscribeSessionMark } from '../../lib/sessionMarkStore';
export { nameMarkOn } from '../../lib/nameMark';

const Z = [2, 3, 0, 0]; // the white e; the gold e in front of it; the two more under the white one

// The point an upside-down e is turned about is the middle of the e's own ink in this font and size (measured on a canvas), so it rests in place, where the editor puts it.
function centreOnInk(el: HTMLElement) {
  const cs = getComputedStyle(el);
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return;
  ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const m = ctx.measureText('e');
  const size = parseFloat(cs.fontSize);
  if (!m.fontBoundingBoxAscent || !size) return;
  const baseline = (size - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 + m.fontBoundingBoxAscent;
  const y = baseline - (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
  const x = (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2 + m.actualBoundingBoxLeft;
  el.style.transformOrigin = `${x}px ${y}px`;
}

/** The page's own colour behind the mark, for keeping the mark's colours readable. */
function pageColour(from: HTMLElement): Rgb {
  for (let n: HTMLElement | null = from; n; n = n.parentElement) {
    const c = getComputedStyle(n).backgroundColor;
    if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') return hexToRgb('#' + c.match(/\d+/g)!.slice(0, 3).map((v) => Number(v).toString(16).padStart(2, '0')).join(''));
  }
  return [245, 241, 237];
}

export function NenyaMark({ face = 'body', className = '' }: { face?: Face; className?: string }) {
  const id = useSyncExternalStore(subscribeSessionMark, getSessionMarkId, getSessionMarkId);
  const markRef = useRef<HTMLSpanElement>(null);
  const layers = useRef<(HTMLSpanElement | null)[]>([]);

  // Rest only: each e is placed once (and again if the session's colours change or the font arrives). An e that rests upside down gets the owner's nudge and rise.
  useEffect(() => {
    const mark = markRef.current;
    const els = layers.current.slice(0, MARK_LAYERS) as HTMLSpanElement[];
    if (!mark || els.length < MARK_LAYERS || els.some((e) => !e)) return;
    const place = MARK_SETTINGS[face];
    let disposed = false;
    const rest = () => {
      const turned = markArrangement(id, face), pal = markPalette(id, pageColour(mark)), pick = markColourIndexes(id, face);
      els.forEach(centreOnInk);
      els.forEach((el, i) => {
        el.style.transform = turned[i] ? `translate(${place.nudge}em, ${-place.rise}em) rotate(${MARK_MOTION[face].way * 180}deg)` : 'none';
        el.style.color = i === 0 ? '' : i === 1 ? (MARK_MOTION[face].goldColour === 'same' ? '' : pal[0]) : pal[pick[i]]; // the white e is the page ink; the gold e per the editor (Cormorant: the ink; Manrope: the pair's first colour)
      });
    };
    rest();
    const ready = typeof document !== 'undefined' && document.fonts ? document.fonts.ready : Promise.resolve();
    void ready.then(() => { if (!disposed) rest(); });
    return () => { disposed = true; };
  }, [face, id]);

  return (
    <span
      ref={markRef}
      role="img"
      aria-label="nenya.biz"
      className={`whitespace-nowrap ${className}`}
      style={face === 'lyric' ? { fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic' } : undefined}
    >
      n
      <span aria-hidden="true" className="relative inline-grid leading-none" style={{ marginRight: `${MARK_SETTINGS[face].after}em` }}>
        {Z.map((z, i) => (
          <span key={i} ref={(el) => { layers.current[i] = el; }} className="relative inline-block leading-none" style={{ gridArea: '1 / 1', zIndex: z }}>
            e
          </span>
        ))}
      </span>
      nya.biz
    </span>
  );
}
