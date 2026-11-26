import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

// The mark (owner, 2026-11-15; settings from the editor 2026-11-17): "nenya.biz" with four e's stacked in one letter space. The white e stays; a gold e (in front)
// turns half a circle when the mark first comes into view and rests upside down, so the mark reads nənya.biz, "nunya biz": none of your business. The schwa lives only in
// this mark; in text the name is plain "Nenya". Screen readers hear "nenya.biz" ("Nenya" for the short form, which drops ".biz" on phones).
// In the header and the footer (owner, 2026-11-26): "nənya.biz" where ".biz" shows, "Nənya" where it does not. The e's take the breathing ring's colours for the theme, each kept readable on the page; which e's rest turned, and
// which colour each takes, come from the session ID. Pointing at the mark (or a tap, or its keyboard button where it has one) starts a fidget: a series of half turns of
// one e at a time, chosen at random; it keeps going while the pointer stays. A demonstration, nothing to do with security. With reduced motion or Stop motion it only
// shows its resting state.
// 2026-11-18: the pivot is exact (the middle of the e's own ink, from the layout engine's baseline and the glyph's outline, re-measured when the font arrives and whenever the size
// changes), so an e turns in place and only the owner's small net nudge and rise (nameMark.ts) separate it from the white e: it forms the theta, it does not swing.

import {
  FALLBACK_PIVOT_EM, MARK_FIDGET, MARK_LAYERS, MARK_MOTION, MARK_SETTINGS, SETTLE, fidgetPlan, hexToRgb, inkCentre, markArrangement, markColourIndexes, markColours, type MarkFace as Face,
} from '../../lib/nameMark';
import { getSessionMarkId, subscribeSessionMark } from '../../lib/sessionMarkStore';
import { useMotionStopped } from '../../lib/deviceMemory';
import { PAGE_BACKGROUND } from '../../lib/ringVisibility';
import { useTheme } from './ThemeProvider';
import { useBreathColours } from './ValarBreathingLogo';

const Z = [2, 3, 0, 0]; // the white e; the gold e in front of it; the two more under the white one

// The turning point of an e is the middle of its own ink, measured exactly: the glyph's outline from a canvas at a large reference size (scaled to the real size, so there is no
// rounding at small sizes), and where the baseline really sits in the box from the layout engine (a zero-size marker on the baseline, read by offsetTop, which a transform does not move).
const REFERENCE = 200;
function measurePivot(el: HTMLElement, face: Face): { x: number; y: number } | null {
  const cs = getComputedStyle(el);
  const size = parseFloat(cs.fontSize);
  const ctx = document.createElement('canvas').getContext('2d');
  const fallback = { x: FALLBACK_PIVOT_EM[face].x * (size || 0), y: FALLBACK_PIVOT_EM[face].y * (size || 0) };
  if (!ctx || !size) return fallback;
  ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${REFERENCE}px ${cs.fontFamily}`;
  const m = ctx.measureText('e');
  if (!m.actualBoundingBoxAscent) return fallback; // a browser that cannot measure the glyph: the measured middle of this face's e, in em
  const k = size / REFERENCE;
  // A hidden copy of the e that no transform or animation touches, with a zero-size marker on its baseline: the marker's bottom edge is where the baseline really sits in the box
  // (read from the layout engine, to a fraction of a pixel, in any browser; ancestors that scale the page cancel out in the ratio).
  const probe = document.createElement('span');
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText = 'position:absolute;left:0;top:0;visibility:hidden;pointer-events:none;display:inline-block;line-height:1;white-space:nowrap;transform:none';
  const marker = document.createElement('i');
  marker.style.cssText = 'display:inline-block;width:0;height:0';
  probe.append('e', marker);
  el.parentElement?.appendChild(probe);
  const pr = probe.getBoundingClientRect();
  // Not on show (the header's other width): nothing can be measured now. It is measured when it appears.
  if (!pr.height) { probe.remove(); return null; }
  const scale = pr.height / size || 1;
  const baseline = (marker.getBoundingClientRect().bottom - pr.top) / scale;
  probe.remove();
  return inkCentre({ left: m.actualBoundingBoxLeft * k, right: m.actualBoundingBoxRight * k, ascent: m.actualBoundingBoxAscent * k, descent: m.actualBoundingBoxDescent * k }, baseline);
}

interface NenyaMarkProps {
  face?: Face;
  className?: string;
  /** "Nənya" without ".biz", for narrow screens. */
  short?: boolean;
  /** The keyboard's "Play the mark" button. Off where the mark sits inside another button. */
  playButton?: boolean;
}

export function NenyaMark({ face = 'body', className = '', short = false, playButton = true }: NenyaMarkProps) {
  const id = useSyncExternalStore(subscribeSessionMark, getSessionMarkId, getSessionMarkId);
  const stopped = useMotionStopped();
  const { theme } = useTheme();
  const coloursFor = useBreathColours();
  // The list of the theme now on show (a far-off breath: the mark is not part of a breath, so it does not wait for the next one).
  const palette = useMemo(() => markColours(coloursFor(Number.MAX_SAFE_INTEGER), hexToRgb(PAGE_BACKGROUND[theme])), [coloursFor, theme]);
  const paletteRef = useRef(palette);
  paletteRef.current = palette;
  const markRef = useRef<HTMLSpanElement>(null);
  const layers = useRef<(HTMLSpanElement | null)[]>([]);
  const [canPlay, setCanPlay] = useState(false);
  const [playing, setPlaying] = useState(false);
  const control = useRef<{ start: (hold: boolean) => void; stop: () => void; repaint: () => void } | null>(null);

  useEffect(() => {
    const mark = markRef.current;
    const els = layers.current.slice(0, MARK_LAYERS) as HTMLSpanElement[];
    if (!mark || els.length < MARK_LAYERS || els.some((e) => !e)) return;
    const reduce = stopped || (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const motion = MARK_MOTION[face], fidgetSet = MARK_FIDGET[face], place = MARK_SETTINGS[face];
    const colourList = () => paletteRef.current;
    const picks = () => markColourIndexes(id, face, colourList().length);
    // Each e rests at a whole number of half turns: an odd number leaves it upside down, and then it gets the owner's nudge and rise so it sits in the letter space.
    const angles = [0, 0, 0, 0];
    const tf = (a: number, scale = 1) => {
      const odd = Math.abs(a % 180) < 1 && Math.abs(Math.round(a / 180)) % 2 === 1;
      return `translate(${odd ? place.nudge : 0}em, ${odd ? -place.rise : 0}em) rotate(${a}deg) scale(${scale})`;
    };
    let tokens = 0;
    let hovering = false;
    let disposed = false;
    let started = false; // the single turn has begun (or will not play)
    const willTurn = !reduce && typeof els[1].animate === 'function';
    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
    const colours: (string | null)[] = [null, null, null, null]; // null: the page ink
    const paint = (i: number) => { els[i].style.transform = tf(angles[i]); els[i].style.color = colours[i] ?? ''; };
    const recolour = () => {
      const pal = colourList(), pick = picks();
      for (let i = 0; i < MARK_LAYERS; i++) {
        colours[i] = i === 0 || (i === 1 && motion.goldColour === 'same') ? null : pal[pick[i]];
        if (i === 1 && willTurn && !started) colours[1] = null; // the gold e waits upright, in the page ink, until it first turns
        paint(i);
      }
    };
    const rest = () => {
      const turned = markArrangement(id, face);
      for (let i = 0; i < MARK_LAYERS; i++) angles[i] = turned[i] ? motion.way * motion.degrees : 0;
      if (willTurn && !started) angles[1] = 0;
      recolour();
    };
    const pivot = () => { const p = measurePivot(els[0], face); if (p && (p.x || p.y)) els.forEach((e) => { e.style.transformOrigin = `${p.x}px ${p.y}px`; }); };
    pivot();
    rest();

    // The single turn of the gold e, once, when the mark first comes into view.
    const firstTurn = () => {
      if (started || disposed) return;
      started = true;
      if (reduce || typeof els[1].animate !== 'function') return;
      const end = motion.way * motion.degrees; // the gold e always ends turned
      angles[1] = 0;
      const ink = getComputedStyle(els[1]).color;
      const to = motion.goldColour === 'turns' ? colourList()[picks()[1]] : ink;
      const quarter = motion.way * 90;
      const frames: Keyframe[] = [{ offset: 0, transform: tf(0), color: ink }];
      const pausing = motion.pauseMs > 0;
      if (pausing) {
        const hold = Math.min(0.5, motion.pauseMs / motion.durationMs), o1 = Math.min(0.45, 0.5 * (1 - hold));
        frames.push({ offset: o1, transform: tf(quarter, motion.lift), color: ink }, { offset: o1 + hold, transform: tf(quarter, motion.lift), color: to });
      } else if (motion.lift !== 1) frames.push({ offset: 0.5, transform: tf(end / 2, motion.lift), color: ink });
      frames.push({ offset: 1, transform: tf(end), color: to });
      const a = els[1].animate(frames, { duration: motion.durationMs, delay: motion.delayMs, easing: motion.easing, fill: 'both' }); // 'both': the upright pose holds through the delay, so it never jumps
      a.onfinish = () => { angles[1] = end; colours[1] = motion.goldColour === 'turns' ? to : null; paint(1); a.cancel(); };
    };

    // The fidget: half turns of one e at a time, in colours from the session's pair; held for as long as it is pointed at, or a fixed number of turns.
    const turn = async (i: number, way: 1 | -1, colour: string): Promise<void> => {
      const from = angles[i], to = from + way * 180;
      angles[i] = to;
      const colourNow = getComputedStyle(els[i]).color;
      colours[i] = colour;
      if (typeof els[i].animate !== 'function') { paint(i); return; }
      els[i].getAnimations().forEach((x) => x.cancel());
      const x = els[i].animate([{ transform: tf(from), color: colourNow }, { transform: tf(to), color: colour }], { duration: fidgetSet.turnMs, easing: SETTLE, fill: 'forwards' });
      await new Promise<void>((res) => { x.onfinish = () => { paint(i); x.cancel(); res(); }; x.oncancel = () => res(); });
    };
    const stop = () => { tokens++; hovering = false; setPlaying(false); };
    const start = async (hold: boolean) => {
      if (reduce || disposed) return;
      const my = ++tokens;
      setPlaying(true);
      const pal = colourList();
      const plan = fidgetPlan(face, Math.random, 1, pal.length);
      for (let n = 0; tokens === my && !disposed; n++) {
        if (!hold && n >= plan.length) break;
        const step = plan[n % plan.length];
        await turn(step.layer, step.way, pal[step.colour]);
        if (tokens !== my) return;
        await sleep(fidgetSet.pauseMs);
        if (hold && !hovering) break;
      }
      if (tokens === my) setPlaying(false);
    };
    control.current = { start: (hold) => { hovering = hold; void start(hold); }, stop, repaint: recolour };

    const enter = () => { hovering = true; void start(true); };
    const leave = () => { hovering = false; };
    const tap = () => { if (!hovering) void start(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') stop(); };
    mark.addEventListener('pointerenter', enter);
    mark.addEventListener('pointerleave', leave);
    mark.addEventListener('pointerdown', tap);
    window.addEventListener('keydown', esc);
    setCanPlay(!reduce);

    let observer: IntersectionObserver | null = null;
    // The pivot is measured with the real font: load it for this e first (a pivot taken from a fallback font is what pushes an e off its place), and measure again whenever the size changes.
    const fontLoaded = (): Promise<unknown> => {
      try {
        const cs = getComputedStyle(els[0]);
        return typeof document !== 'undefined' && document.fonts ? document.fonts.load(`${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`, 'e').then(() => document.fonts.ready) : Promise.resolve();
      } catch { return Promise.resolve(); }
    };
    const resizer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => { if (!disposed) pivot(); }) : null;
    resizer?.observe(mark);
    const ready = fontLoaded();
    void ready.then(() => {
      if (disposed) return;
      pivot();
      if (typeof IntersectionObserver === 'undefined') return firstTurn();
      observer = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) { observer?.disconnect(); firstTurn(); } });
      observer.observe(mark);
    });
    return () => {
      disposed = true; tokens++;
      observer?.disconnect();
      resizer?.disconnect();
      mark.removeEventListener('pointerenter', enter);
      mark.removeEventListener('pointerleave', leave);
      mark.removeEventListener('pointerdown', tap);
      window.removeEventListener('keydown', esc);
      els.forEach((e) => e.getAnimations?.().forEach((x) => x.cancel()));
      control.current = null;
    };
  }, [face, id, stopped]);

  // A change of colours or theme repaints the e's where they are; it does not start the turn again.
  useEffect(() => { control.current?.repaint(); }, [palette]);

  return (
    <>
      <span
        ref={markRef}
        role="img"
        aria-label={short ? 'Nenya' : 'nenya.biz'}
        className={`inline-block whitespace-nowrap ${className}`}
        style={face === 'lyric' ? { fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic' } : undefined}
      >
        {/* A name takes a capital; the address with ".biz" stays in lower case (owner, 2026-11-26). */}
        {short ? 'N' : 'n'}
        <span aria-hidden="true" className="relative inline-grid leading-none" style={{ marginRight: `${MARK_SETTINGS[face].after}em` }}>
          {Z.map((z, i) => (
            <span key={i} ref={(el) => { layers.current[i] = el; }} className="relative inline-block leading-none" style={{ gridArea: '1 / 1', zIndex: z }}>
              e
            </span>
          ))}
        </span>
        nya
        {!short && '.biz'}
      </span>
      {canPlay && playButton && (
        <button
          type="button"
          aria-pressed={playing}
          onClick={() => (playing ? control.current?.stop() : control.current?.start(false))}
          className="sr-only focus-visible:not-sr-only focus-visible:ml-2 focus-visible:rounded focus-visible:px-2 focus-visible:text-xs focus-visible:underline"
        >
          {playing ? 'Stop the mark' : 'Play the mark'}
        </button>
      )}
    </>
  );
}
