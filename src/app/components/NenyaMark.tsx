import { useEffect, useRef } from 'react';

// The mark (owner, 2026-11-15): "nenya.biz" with two e's stacked in one letter space. The white e stays; a gold e behind it turns half a circle,
// counterclockwise, and rests upside down, so the mark reads nənya.biz, "nunya biz": none of your business. The schwa lives only in this mark; everywhere
// else the name is plain "Nenya". Screen readers hear "nenya.biz". It turns once, when it first comes into view; with reduced motion it simply shows the
// resting mark. The owner set every value below by eye on the comparison page. Behind VITE_NAME_MARK=on until approved on staging.

import { MARK_MOTION, MARK_SETTINGS, type MarkFace as Face } from '../../lib/nameMark';
export { nameMarkOn } from '../../lib/nameMark';

const restTransform = (face: Face) => `translate(${MARK_SETTINGS[face].nudge}em, ${-MARK_SETTINGS[face].rise}em) rotate(${MARK_MOTION.degrees}deg)`;

// The turning point is the middle of the e's own ink in this font and size (measured on a canvas), so it turns in place.
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

export function NenyaMark({ face = 'body', className = '' }: { face?: Face; className?: string }) {
  const spinRef = useRef<HTMLSpanElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const spin = spinRef.current;
    const mark = markRef.current;
    if (!spin || !mark) return;
    const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let done = false;
    let observer: IntersectionObserver | null = null;
    const turn = () => {
      if (done) return;
      done = true;
      centreOnInk(spin);
      if (reduce || typeof spin.animate !== 'function') {
        spin.style.transform = restTransform(face);
        return;
      }
      const a = spin.animate([{ transform: 'translate(0em, 0em) rotate(0deg)' }, { transform: restTransform(face) }], {
        duration: MARK_MOTION.durationMs,
        delay: MARK_MOTION.delayMs,
        easing: MARK_MOTION.easing,
        fill: 'forwards',
      });
      a.onfinish = () => {
        spin.style.transform = restTransform(face);
        a.cancel();
      };
    };
    const ready = typeof document !== 'undefined' && document.fonts ? document.fonts.ready : Promise.resolve();
    void ready.then(() => {
      if (typeof IntersectionObserver === 'undefined') return turn();
      observer = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer?.disconnect();
          turn();
        }
      });
      observer.observe(mark);
    });
    return () => observer?.disconnect();
  }, [face]);

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
        <span ref={spinRef} className="relative z-[1] inline-block leading-none text-nenya-gold-text dark:text-nenya-accent-warm" style={{ gridArea: '1 / 1' }}>
          e
        </span>
        <span className="relative z-[2] inline-block leading-none" style={{ gridArea: '1 / 1' }}>
          e
        </span>
      </span>
      nya.biz
    </span>
  );
}
