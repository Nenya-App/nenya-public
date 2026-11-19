import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { FewerWarning } from './LensCardParts';
import { TAPESTRY_PATTERNS, tapestryNeedsWarning, tapestryWords, stepPoint, pathWords, pathLook, simplifyPoints, type PathPoint, type PathDir } from '../../lib/lensActivities';

// The two optional activities (wireframes: docs/wireframes/lens/pattern-tapestry.html and movement-path.html). Each is controlled by its lens page, lives inside
// "More descriptions", never blocks Add this to my report, and says everything it draws in words. Nothing is sent anywhere.

const reduced = (): boolean => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const selectCls = 'min-h-11 rounded-md border border-border bg-background px-3 text-sm';

/** A stripe look for each pattern word. Decorative: the words beside it are the real content. */
export const PATTERN_BG: Record<string, string> = {
  fragmented: 'linear-gradient(90deg, currentColor 0 20%, transparent 20% 30%, currentColor 30% 45%, transparent 45% 60%, currentColor 60% 70%, transparent 70%)',
  linear: 'repeating-linear-gradient(0deg, currentColor 0 2px, transparent 2px 10px)',
  branching: 'repeating-linear-gradient(60deg, currentColor 0 2px, transparent 2px 14px), repeating-linear-gradient(-60deg, currentColor 0 2px, transparent 2px 14px)',
  circular: 'repeating-radial-gradient(circle at 50% 50%, currentColor 0 2px, transparent 2px 12px)',
  layered: 'repeating-linear-gradient(0deg, currentColor 0 3px, transparent 3px 8px)',
  'web-like': 'repeating-linear-gradient(45deg, currentColor 0 1px, transparent 1px 10px), repeating-linear-gradient(-45deg, currentColor 0 1px, transparent 1px 10px)',
  crystalline: 'repeating-conic-gradient(currentColor 0 8deg, transparent 8deg 45deg)',
  fractal: 'radial-gradient(circle, currentColor 0 2px, transparent 2px 8px)',
  spiraling: 'repeating-conic-gradient(currentColor 0 4deg, transparent 4deg 30deg)',
  chaotic: 'repeating-linear-gradient(13deg, currentColor 0 2px, transparent 2px 9px), repeating-linear-gradient(97deg, currentColor 0 2px, transparent 2px 15px)',
  unified: 'linear-gradient(currentColor, currentColor)',
};

// The layers weave: each layer's pattern drifts slowly, in its own direction and at its own pace, so the design is seen as a living cloth (owner's comment sheet, 2026-11-18: not stripes with only a fade). Still
// under reduced motion; it runs longer than five seconds, so the activity has a pause button.
const WEAVE_CSS = `@keyframes tapWeave { from { background-position: 0 0; } to { background-position: var(--wx) var(--wy); } }
.tap-layer { animation: tapWeave var(--wd) linear infinite; }
.tap-paused .tap-layer { animation: none; }
@media (prefers-reduced-motion: reduce) { .tap-layer { animation: none; } }`;

/** The tapestry as a picture (also used by the PDF thumbnail request: see the hand-over note). */
export function TapestryPicture({ layers, label }: { layers: string[]; label?: string }) {
  return (
    <div role="img" aria-label={label ?? `A small woven design. ${tapestryWords(layers)}.`} className="tap-root relative mx-auto h-44 w-full max-w-xs overflow-hidden rounded border-2 border-foreground bg-background text-foreground">
      <style>{WEAVE_CSS}</style>
      {layers.map((l, i) => (
        <div key={i} className={`tap-layer absolute rounded border-2 border-foreground bg-background ${reduced() ? '' : 'animate-in fade-in duration-300 motion-reduce:animate-none'}`} style={{ ['--wx' as string]: `${i % 2 ? -40 : 40}px`, ['--wy' as string]: `${i % 3 === 0 ? 0 : i % 3 === 1 ? 30 : -30}px`, ['--wd' as string]: `${7 + i * 2}s`, inset: i * 14, backgroundImage: PATTERN_BG[l.toLowerCase()] ?? 'none', backgroundSize: l === 'Fractal' ? '24px 24px' : undefined, opacity: l === 'Unified' ? 0.55 : 1 }} />
      ))}
    </div>
  );
}

export function TapestryActivity({ layers, onChange }: { layers: string[]; onChange: (l: string[]) => void }) {
  const [next, setNext] = useState(TAPESTRY_PATTERNS[0]);
  const [warn, setWarn] = useState(false);
  const [paused, setPaused] = useState(false);
  const addRef = useRef<HTMLButtonElement>(null);
  const push = (l: string) => { onChange([...layers, l]); setWarn(false); };
  return (
    <section className="space-y-3" aria-labelledby="tapestry-h" data-tapestry>
      <h3 id="tapestry-h" className="text-sm font-medium">Weave a tapestry (optional)</h3>
      <p className="text-sm text-muted-foreground">Pick a pattern for the base. Then add layers on top, one at a time. There is no right tapestry.</p>
      <div className={`rounded-md border border-border bg-muted p-3 ${paused ? 'tap-paused' : ''}`}><TapestryPicture layers={layers} /></div>
      {layers.length > 0 && <button type="button" onClick={() => setPaused((p) => !p)} aria-pressed={paused} className="min-h-11 text-xs underline underline-offset-4 text-muted-foreground">{paused ? 'Play the weaving' : 'Pause the weaving'}</button>}
      <p className="text-sm">Your tapestry: <span role="status" data-tapestry-words>{tapestryWords(layers)}</span></p>
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1"><label htmlFor="tapestry-next" className="text-sm">{layers.length ? 'Add a layer on top' : 'Pick the base pattern'}</label>
          <select id="tapestry-next" className={selectCls} value={next} onChange={(e) => setNext(e.target.value)}>{TAPESTRY_PATTERNS.map((p) => <option key={p}>{p}</option>)}</select></div>
        <Button ref={addRef} type="button" variant="outline" onClick={() => (tapestryNeedsWarning(layers) && !warn ? setWarn(true) : push(next))}>{layers.length ? 'Add this layer' : 'Use this as the base'}</Button>
      </div>
      {warn && <FewerWarning onAdd={() => { push(next); addRef.current?.focus(); }} onKeep={() => { setWarn(false); addRef.current?.focus(); }} />}
      <p className="text-sm" role="status">{layers.length ? `${layers.length - 1} above the base` : 'No layers yet'}</p>
      <ol className="list-decimal space-y-1 pl-6 text-sm" aria-label="Your layers, from the base up">
        {layers.map((l, i) => (
          <li key={`${l}-${i}`}>{i ? `Layer ${i}` : 'Base'}: {l}{' '}
            <Button type="button" size="sm" variant="outline" aria-label={`Remove ${i ? `layer ${i}` : 'the base'}: ${l}`} onClick={() => { onChange(layers.filter((_, j) => j !== i)); addRef.current?.focus(); }}>Remove</Button></li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" disabled={!layers.length} onClick={() => onChange(layers.slice(0, -1))}>Take off the top layer</Button>
        <Button type="button" variant="outline" disabled={!layers.length} onClick={() => onChange([])}>Start again</Button>
      </div>
    </section>
  );
}

/** The path as a picture: a line with a dot at the end. `dotAt` moves the dot while it replays. */
export function PathPicture({ points, feel, dotAt, label, svgProps }: { points: PathPoint[]; feel: string[]; dotAt?: number; label?: string; svgProps?: React.SVGProps<SVGSVGElement> }) {
  const look = pathLook(feel), d = points[dotAt ?? points.length - 1];
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={label ?? `A path. ${pathWords(points, feel)}.`} className="mx-auto block aspect-square w-full max-w-xs rounded-xl border-2 border-dashed border-border bg-muted text-foreground" {...svgProps}>
      <polyline points={points.map((p) => p.join(',')).join(' ')} fill="none" stroke="currentColor" strokeWidth={look.width} strokeDasharray={look.dash} strokeLinecap="round" strokeLinejoin="round" />
      {d && dotAt !== undefined && <circle cx={d[0]} cy={d[1]} r="3.5" fill="currentColor" stroke="currentColor" />}
    </svg>
  );
}

export function PathActivity({ points, feel, onChange }: { points: PathPoint[]; feel: string[]; onChange: (p: PathPoint[]) => void }) {
  const [dot, setDot] = useState<number | undefined>(undefined);
  const [drawing, setDrawing] = useState(false);
  const timer = useRef<number>(0);
  useEffect(() => () => window.clearInterval(timer.current), []);
  const at = (e: React.PointerEvent<SVGSVGElement>): PathPoint => { const r = e.currentTarget.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100]; };
  const replay = () => {
    window.clearInterval(timer.current);
    if (points.length < 2) return;
    if (reduced()) { setDot(points.length - 1); return; }
    let i = 0; setDot(0);
    timer.current = window.setInterval(() => { i += 1; if (i >= points.length) { window.clearInterval(timer.current); return; } setDot(i); }, Math.max(12, 2500 / points.length));
  };
  const step = (dir: PathDir) => { setDot(undefined); onChange(stepPoint(points, dir)); };
  return (
    <section className="space-y-3" aria-labelledby="path-h" data-path>
      <h3 id="path-h" className="text-sm font-medium">Draw a path of movement (optional)</h3>
      <p className="text-sm text-muted-foreground">Draw a line with a pointer or finger, or build one with the step buttons. Then watch it move. There is no right path.</p>
      <PathPicture points={points} feel={feel} dotAt={dot} svgProps={{
        style: { touchAction: 'none' },
        onPointerDown: (e) => { e.currentTarget.setPointerCapture?.(e.pointerId); setDrawing(true); setDot(undefined); onChange([at(e)]); },
        onPointerMove: (e) => { if (drawing) onChange([...points, at(e)]); },
        onPointerUp: () => { setDrawing(false); onChange(simplifyPoints(points)); },
        onPointerCancel: () => setDrawing(false),
      }} />
      <p className="text-sm">Your path: <span role="status" data-path-words>{pathWords(points, feel)}</span></p>
      <fieldset className="space-y-2"><legend className="text-sm">Add a step</legend>
        <div className="flex flex-wrap gap-2">{(['up', 'down', 'left', 'right'] as PathDir[]).map((d) => <Button key={d} type="button" variant="outline" onClick={() => step(d)}>{d[0].toUpperCase() + d.slice(1)}</Button>)}</div>
      </fieldset>
      <p className="text-sm text-muted-foreground">How it moves comes from the quality words in this list. Choose them there, and the line changes to match.</p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" disabled={points.length < 2} onClick={replay}>Watch it move</Button>
        <Button type="button" variant="outline" disabled={!points.length} onClick={() => { setDot(undefined); onChange(points.slice(0, -1)); }}>Undo</Button>
        <Button type="button" variant="outline" disabled={!points.length} onClick={() => { setDot(undefined); onChange([]); }}>Clear</Button>
      </div>
    </section>
  );
}
