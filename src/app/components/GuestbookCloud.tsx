import { useEffect, useRef, useState } from 'react';
import { centroid, toRgb } from '../../lib/guestbook';
import { describePlainly } from '../../lib/colorNames';

// The guestbook's 3D view (lifted from the Apiary's handshake geometry, owner 2026-11-15): every signature's point inside the RGB cube, with the same mapping
// as the Apiary renderer (red and green inverted along x and y, blue as depth), and the centroid of them all marked. Drawn on a plain canvas rather than
// three.js (the site loads no outside scripts, and points in a cube need no 3D engine). Drag or use the arrow keys to turn it; it turns slowly on its own
// unless paused or the device asks for reduced motion. A text summary under it says the same in words.

interface Props {
  points: { c: string; d: string }[];
  /** The visitor's own point after signing, ringed. */
  mine?: string | null;
}

// RGB to the cube's own coordinates, -1 to 1 (the Apiary's mapRGBTo3D, scaled).
const toCube = (hex: string): [number, number, number] => {
  const [r, g, b] = toRgb(hex);
  return [1 - (r / 255) * 2, 1 - (g / 255) * 2, -1 + (b / 255) * 2];
};
const CORNERS: [number, number, number][] = [-1, 1].flatMap((x) => [-1, 1].flatMap((y) => [-1, 1].map((z) => [x, y, z] as [number, number, number])));
const EDGES = CORNERS.flatMap((a, i) => CORNERS.slice(i + 1).map((b) => [a, b] as const)).filter(([a, b]) => a.filter((v, k) => v !== b[k]).length === 1);

export function GuestbookCloud({ points, mine }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angle = useRef({ x: -0.5, y: 0.6 });
  const drag = useRef<{ x: number; y: number } | null>(null);
  // The latest draw, so turning by keyboard or drag redraws even when the view is still.
  const drawRef = useRef<() => void>(() => {});
  const reduce = typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [paused, setPaused] = useState(reduce);
  const centre = points.length ? centroid(points.map((p) => p.c)) : null;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    let raf = 0;
    const ink = () => getComputedStyle(canvas).color || '#888';
    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const { x: ax, y: ay } = angle.current;
      const scale = Math.min(w, h) * 0.3;
      const project = ([x, y, z]: [number, number, number]) => {
        const x1 = x * Math.cos(ay) + z * Math.sin(ay);
        const z1 = -x * Math.sin(ay) + z * Math.cos(ay);
        const y1 = y * Math.cos(ax) - z1 * Math.sin(ax);
        const z2 = y * Math.sin(ax) + z1 * Math.cos(ax);
        const p = 4 / (4 + z2);
        return { sx: w / 2 + x1 * scale * p, sy: h / 2 + y1 * scale * p, depth: z2, p };
      };
      // The cube's frame, then its three axes in their own colors (from the corner where all channels are zero... in the Apiary's orientation).
      ctx.strokeStyle = ink();
      ctx.globalAlpha = 0.25;
      ctx.lineWidth = 1;
      for (const [a, b] of EDGES) {
        const pa = project(a);
        const pb = project(b);
        ctx.beginPath();
        ctx.moveTo(pa.sx, pa.sy);
        ctx.lineTo(pb.sx, pb.sy);
        ctx.stroke();
      }
      ctx.globalAlpha = 0.7;
      const origin = project([1, 1, -1]);
      for (const [to, color] of [[[-1, 1, -1], '#ef4444'], [[1, -1, -1], '#22c55e'], [[1, 1, 1], '#3b82f6']] as const) {
        const pt = project(to as [number, number, number]);
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(origin.sx, origin.sy);
        ctx.lineTo(pt.sx, pt.sy);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // The signatures, far ones first.
      const drawn = points.map((p) => ({ c: p.c, ...project(toCube(p.c)) })).sort((a, b) => b.depth - a.depth);
      for (const d of drawn) {
        ctx.beginPath();
        ctx.arc(d.sx, d.sy, 4.5 * d.p, 0, Math.PI * 2);
        ctx.fillStyle = d.c;
        ctx.fill();
        ctx.strokeStyle = ink();
        ctx.globalAlpha = 0.35;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      if (mine) {
        const m = project(toCube(mine));
        ctx.beginPath();
        ctx.arc(m.sx, m.sy, 10 * m.p, 0, Math.PI * 2);
        ctx.strokeStyle = ink();
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.lineWidth = 1;
      }
      if (centre) {
        const c = project(toCube(centre));
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const r = (i % 2 ? 6 : 13) * c.p;
          const a = -Math.PI / 2 + (i * Math.PI) / 5;
          ctx.lineTo(c.sx + r * Math.cos(a), c.sy + r * Math.sin(a));
        }
        ctx.closePath();
        ctx.fillStyle = centre;
        ctx.fill();
        ctx.strokeStyle = '#D4AF87';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.lineWidth = 1;
      }
    };
    drawRef.current = draw;
    const loop = () => {
      if (!paused && !drag.current) angle.current.y += 0.0025;
      draw();
      raf = requestAnimationFrame(loop);
    };
    if (paused) draw();
    else raf = requestAnimationFrame(loop);
    const onResize = () => draw();
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [points, mine, centre, paused]);

  const turn = (dx: number, dy: number) => {
    angle.current.y += dx;
    angle.current.x += dy;
    drawRef.current();
  };

  const summary = points.length
    ? `${points.length} signature${points.length === 1 ? '' : 's'} so far. The centre of them all is ${centre ? describePlainly(centre) : 'unknown'}.`
    : 'No one has signed yet.';

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        tabIndex={0}
        role="img"
        aria-label={`A cube of color with a point for each signature. ${summary} Use the arrow keys to turn it.`}
        className="h-80 w-full cursor-grab touch-none rounded-xl border border-border text-muted-foreground focus-visible:outline-2 focus-visible:outline-nenya-accent-warm sm:h-96"
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, y: e.clientY };
          (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          angle.current.y += (e.clientX - drag.current.x) * 0.008;
          angle.current.x += (e.clientY - drag.current.y) * 0.008;
          drag.current = { x: e.clientX, y: e.clientY };
          drawRef.current();
        }}
        onPointerUp={() => (drag.current = null)}
        onKeyDown={(e) => {
          const step = 0.12;
          if (e.key === 'ArrowLeft') turn(-step, 0);
          else if (e.key === 'ArrowRight') turn(step, 0);
          else if (e.key === 'ArrowUp') turn(0, -step);
          else if (e.key === 'ArrowDown') turn(0, step);
          else return;
          e.preventDefault();
        }}
      />
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>{summary} The star is the centre; {mine ? 'the ring is yours.' : 'drag or use the arrow keys to turn it.'}</p>
        <button type="button" onClick={() => setPaused((p) => !p)} className="min-h-11 rounded-md border border-border px-3">
          {paused ? 'Turn slowly' : 'Pause'}
        </button>
      </div>
    </div>
  );
}
