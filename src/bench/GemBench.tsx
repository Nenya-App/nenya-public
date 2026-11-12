import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import NenyaLogo from '../app/components/NenyaLogo';
import { useTheme } from '../app/components/ThemeProvider';
import type { GemStats } from '../app/components/SpectralGem';
import { DEFAULT_LIGHT, HIGH_QUALITY, LOW_QUALITY, liveGemSupported, type GemLight, type GemQuality } from '../lib/gemRenderer';
import { DEFAULT_CUT, type GemCut } from '../lib/gemCut';
import { DEFAULT_INNER_ORBIT, DEFAULT_OUTER_ORBIT, type InnerOrbitLook, type OuterOrbitLook } from '../lib/orbitLook';
import { deviceProfile } from '../lib/deviceProfile';
import { DEFAULT_KALEIDOSCOPE, KALEIDOSCOPE_PRESETS, type KaleidoscopeLook, type KaleidoscopePreset } from '../lib/kaleidoscope';

// The gem bench: the current sprite gem and the live, ray-traced gem side by side, with every setting of the live gem
// and of the orbits on sliders. Nothing is saved anywhere: the settings live in this page's address (after the #), so a
// setting can be bookmarked or sent to someone, and "Copy settings" puts them on the clipboard to paste into the code.

/** The 2D finishing the gem gets after it is drawn (the same steps the sprite goes through, in SpectralGem). */
interface Finish {
  clarity: number;
  sparkle: number;
  tint: number;
  contrast: number;
  lift: number;
  fieldAlpha: number;
}
/** The sprite's finishing, as the live site has it. */
const SPRITE_FINISH: Finish = { clarity: 0.5, sparkle: 0.9, tint: 0.2, contrast: 0.9, lift: 0.5, fieldAlpha: 0.9 };
/** The live gem already brings the orbs' colours up through the stone, so it needs much less of the 2D colour wheel. */
const LIVE_FINISH: Finish = { ...SPRITE_FINISH, fieldAlpha: 0.25 };

interface View {
  size: number;
  background: 'dark' | 'light';
  glow: boolean;
  breathing: boolean;
  /** Apply the orbit options to the sprite side too (on), or keep the sprite exactly as the live site draws it (off). */
  orbitBoth: boolean;
}
const DEFAULT_VIEW: View = { size: 420, background: 'dark', glow: false, breathing: true, orbitBoth: true };

interface Motion {
  fps: number;
  spin: number;
  /** Let the gem choose its quality from the device and its first frames, as the site would (the quality panel is then ignored). */
  autoQuality: boolean;
}
const DEFAULT_MOTION: Motion = { fps: 15, spin: 1 / 6, autoQuality: false };

interface Settings {
  view: View;
  finish: Finish;
  light: GemLight;
  cut: GemCut;
  quality: GemQuality;
  motion: Motion;
  inner: InnerOrbitLook;
  outer: OuterOrbitLook;
  kaleidoscope: KaleidoscopeLook;
}
const DEFAULTS: Settings = {
  view: DEFAULT_VIEW,
  finish: LIVE_FINISH,
  light: DEFAULT_LIGHT,
  cut: DEFAULT_CUT,
  quality: HIGH_QUALITY,
  motion: DEFAULT_MOTION,
  inner: DEFAULT_INNER_ORBIT,
  outer: DEFAULT_OUTER_ORBIT,
  kaleidoscope: DEFAULT_KALEIDOSCOPE,
};
type Section = keyof Settings;

/** Only what differs from the defaults, so the address and the copied text stay short. */
function changes(s: Settings): Partial<Record<Section, Record<string, unknown>>> {
  const out: Partial<Record<Section, Record<string, unknown>>> = {};
  for (const k of Object.keys(DEFAULTS) as Section[]) {
    const d = DEFAULTS[k] as unknown as Record<string, unknown>;
    const v = s[k] as unknown as Record<string, unknown>;
    const diff: Record<string, unknown> = {};
    for (const f of Object.keys(d)) if (v[f] !== d[f]) diff[f] = v[f];
    if (Object.keys(diff).length) out[k] = diff;
  }
  return out;
}

/** Reads settings from the address. Only known fields of the right type are taken. */
function fromHash(hash: string): Settings {
  const s: Settings = structuredClone(DEFAULTS);
  try {
    const raw = JSON.parse(decodeURIComponent(hash.replace(/^#/, '')));
    for (const k of Object.keys(DEFAULTS) as Section[]) {
      const d = DEFAULTS[k] as unknown as Record<string, unknown>;
      const v = raw?.[k];
      if (!v || typeof v !== 'object') continue;
      for (const f of Object.keys(d)) if (typeof v[f] === typeof d[f]) (s[k] as unknown as Record<string, unknown>)[f] = v[f];
    }
  } catch {
    /* no settings, or not readable: the defaults */
  }
  return s;
}

// ── Controls ────────────────────────────────────────────────────────────────

function Range({ label, value, min, max, step, onChange, hint, digits = 2 }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; hint?: string; digits?: number }) {
  return (
    <label className="block space-y-1">
      <span className="flex items-baseline justify-between gap-2 text-xs">
        <span>{label}</span>
        <span className="font-mono tabular-nums text-muted-foreground">{value.toFixed(digits)}</span>
      </span>
      <input type="range" className="w-full accent-[#D4AF37]" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      {hint && <span className="block text-[11px] leading-snug text-muted-foreground">{hint}</span>}
    </label>
  );
}

function Toggle({ label, value, onChange, hint }: { label: string; value: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="flex items-start gap-2 text-xs">
      <input type="checkbox" className="mt-0.5 accent-[#D4AF37]" checked={value} onChange={(e) => onChange(e.target.checked)} />
      <span>
        {label}
        {hint && <span className="block text-[11px] leading-snug text-muted-foreground">{hint}</span>}
      </span>
    </label>
  );
}

function Choice<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly T[]; onChange: (v: T) => void }) {
  return (
    <label className="flex items-center justify-between gap-2 text-xs">
      <span>{label}</span>
      <select className="rounded border border-border bg-background px-2 py-1 text-xs" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function Panel({ title, children, onReset, open = false }: { title: string; children: ReactNode; onReset?: () => void; open?: boolean }) {
  return (
    <details open={open} className="rounded-lg border border-border bg-card/60">
      <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium">{title}</summary>
      <div className="space-y-3 px-3 pb-3">
        {children}
        {onReset && (
          <button type="button" onClick={onReset} className="text-[11px] text-muted-foreground underline underline-offset-2 hover:text-foreground">
            Reset this panel
          </button>
        )}
      </div>
    </details>
  );
}

// The gems report their frame time about once a second. It is shown by this small component on its own, so the report
// never re-renders the logos (which would restart the orbs' animations).
type Sink = { fn: (st: GemStats) => void };
function StatLine({ sink }: { sink: Sink }) {
  const [st, setSt] = useState<GemStats | null>(null);
  useEffect(() => {
    sink.fn = setSt;
    return () => {
      sink.fn = () => {};
    };
  }, [sink]);
  return (
    <p className="font-mono opacity-80">
      {st ? `${st.engine === 'live' ? 'Live' : 'Sprite'} · ${st.ms.toFixed(2)} ms a frame${st.fallback ? ` · fell back: ${st.fallback}` : ''}` : 'Waiting for the first frames…'}
    </p>
  );
}

// ── The page ────────────────────────────────────────────────────────────────

export default function GemBench() {
  const [s, setS] = useState<Settings>(() => fromHash(typeof location !== 'undefined' ? location.hash : ''));
  const [cycleStart] = useState(() => Date.now());
  const [sinks] = useState(() => ({ sprite: { fn: () => {} } as Sink, live: { fn: () => {} } as Sink }));
  const [report] = useState(() => ({ sprite: (st: GemStats) => sinks.sprite.fn(st), live: (st: GemStats) => sinks.live.fn(st) }));
  const [copied, setCopied] = useState('');
  // Each press of "Return to the plain cut" (or loading new settings) adds one; the live gem restarts its kaleidoscope from the plain cut when it changes.
  const [restart, setRestart] = useState(0);
  const { setTheme } = useTheme();
  const supported = useMemo(() => liveGemSupported(), []);

  const set = <K extends Section>(k: K, patch: Partial<Settings[K]>) => setS((prev) => ({ ...prev, [k]: { ...prev[k], ...patch } }));
  const reset = (k: Section) => setS((prev) => ({ ...prev, [k]: structuredClone(DEFAULTS[k]) }));

  // A new address pasted after the # (without reloading the page) loads those settings. The address writing itself back uses replaceState, which does not raise this event, so there is no loop.
  useEffect(() => {
    const onHash = () => {
      setS(fromHash(location.hash));
      setRestart((r) => r + 1);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // The address follows the settings (replaced, not added to the history, so Back still leaves the page).
  const hashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (hashTimer.current) clearTimeout(hashTimer.current);
    hashTimer.current = setTimeout(() => {
      const d = changes(s);
      const h = Object.keys(d).length ? '#' + encodeURIComponent(JSON.stringify(d)) : '';
      try {
        history.replaceState(null, '', location.pathname + location.search + h);
      } catch {
        /* the address just does not update */
      }
    }, 250);
  }, [s]);

  useEffect(() => {
    setTheme(s.view.background);
  }, [s.view.background, setTheme]);

  const copy = async () => {
    const text = JSON.stringify(changes(s), null, 2);
    try {
      await navigator.clipboard.writeText(text);
      setCopied('Copied the settings that differ from the defaults.');
    } catch {
      setCopied('The clipboard is not available here. The settings are also in this page’s address.');
    }
    setTimeout(() => setCopied(''), 4000);
  };

  const L = s.light;
  const C = s.cut;
  const I = s.inner;
  const O = s.outer;
  const F = s.finish;
  const bg = s.view.background === 'dark' ? '#1A1512' : '#F5EFE6';
  const live = useMemo(() => ({ light: s.light, cut: s.cut, quality: s.motion.autoQuality ? undefined : s.quality, fps: s.motion.fps, spin: s.motion.spin, kaleidoscope: s.kaleidoscope, restart }), [s.light, s.cut, s.quality, s.motion, s.kaleidoscope, restart]);
  const profile = useMemo(() => deviceProfile(), []);

  return (
    <div className="flex h-screen flex-col overflow-y-auto bg-background text-foreground lg:flex-row lg:overflow-hidden">
      {/* Controls */}
      <aside className="space-y-3 border-b border-border p-4 lg:w-96 lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <header className="space-y-1">
          <h1 className="text-lg">Gem bench</h1>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Left: the gem as the site draws it today, from an 809 KB sprite sheet. Right: the live gem, ray-traced in the browser from about 50 facet
            planes, with no image. Settings are kept only in this page&rsquo;s address.
          </p>
          <p className="text-[11px] text-muted-foreground">This device: <strong>{profile.tier}</strong> ({profile.reasons.join(', ')}).</p>
          {!supported && <p className="rounded border border-amber-600 p-2 text-xs">This browser has no WebGL2, so the right side shows the sprite (the fallback).</p>}
        </header>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={copy} className="rounded border border-border px-3 py-1.5 text-xs hover:bg-muted">
            Copy settings
          </button>
          <button type="button" onClick={() => setS(structuredClone(DEFAULTS))} className="rounded border border-border px-3 py-1.5 text-xs hover:bg-muted">
            Reset everything
          </button>
        </div>
        {copied && <p role="status" className="text-xs text-muted-foreground">{copied}</p>}

        <Panel title="View" open onReset={() => reset('view')}>
          <Range label="Logo size (px)" value={s.view.size} min={120} max={900} step={10} digits={0} onChange={(v) => set('view', { size: v })} hint="Larger shows the gem's facets in detail; the site uses about 200–420." />
          <Choice label="Background" value={s.view.background} options={['dark', 'light'] as const} onChange={(v) => set('view', { background: v })} />
          <Toggle label="Gold glow" value={s.view.glow} onChange={(v) => set('view', { glow: v })} />
          <Toggle label="Breathing tint" value={s.view.breathing} onChange={(v) => set('view', { breathing: v })} />
          <Toggle label="Orbit options apply to both sides" value={s.view.orbitBoth} onChange={(v) => set('view', { orbitBoth: v })} hint="Off keeps the left side exactly as the live site draws it." />
        </Panel>

        <Panel title="Inner orbit" open onReset={() => reset('inner')}>
          <Toggle label="Show the inner orbit" value={I.show} onChange={(v) => set('inner', { show: v })} />
          <Range label="Ring radius (of logo size)" value={I.radius} min={0} max={0.2} step={0.0025} digits={4} onChange={(v) => set('inner', { radius: v })} />
          <Range label="Orb size (of logo size)" value={I.orbSize} min={0.02} max={0.15} step={0.001} digits={3} onChange={(v) => set('inner', { orbSize: v })} />
          <Range label="Opacity, low" value={I.opacityLow} min={0} max={1} step={0.01} onChange={(v) => set('inner', { opacityLow: v })} />
          <Range label="Opacity, high" value={I.opacityHigh} min={0} max={1} step={0.01} onChange={(v) => set('inner', { opacityHigh: v })} />
          <Range label="Pulse (grow and shrink)" value={I.pulse} min={0} max={0.3} step={0.005} digits={3} onChange={(v) => set('inner', { pulse: v })} />
          <Range label="Pulse length (s)" value={I.pulseSeconds} min={1} max={15} step={0.5} digits={1} onChange={(v) => set('inner', { pulseSeconds: v })} />
          <Range label="Pulse drift per orb (s)" value={I.pulseStep} min={0} max={1} step={0.05} onChange={(v) => set('inner', { pulseStep: v })} hint="Each orb's pulse is this much longer than the one before, so they drift apart." />
          <Range label="Colour cycle (s)" value={I.colorCycle} min={6} max={120} step={1} digits={0} onChange={(v) => set('inner', { colorCycle: v })} hint="Time for each orb to pass through its six colours. The gem's inner colour follows." />
          <Range label="One turn of the ring (s)" value={I.orbitSeconds} min={20} max={600} step={5} digits={0} onChange={(v) => set('inner', { orbitSeconds: v })} hint="The outer ring turns the other way at the same speed." />
          <Range label="Glass: form shading" value={I.form} min={0} max={1} step={0.01} onChange={(v) => set('inner', { form: v })} />
          <Range label="Glass: shine" value={I.shine} min={0} max={1} step={0.01} onChange={(v) => set('inner', { shine: v })} />
          <Range label="Glass: rim light" value={I.rimLight} min={0} max={1} step={0.01} onChange={(v) => set('inner', { rimLight: v })} />
          <Range label="Glass: rim dark" value={I.rimDark} min={0} max={0.5} step={0.01} onChange={(v) => set('inner', { rimDark: v })} />
          <Choice label="Layer" value={I.layer} options={['under', 'over'] as const} onChange={(v) => set('inner', { layer: v })} />
          <Choice label="Blend" value={I.blend} options={['normal', 'screen', 'soft-light', 'overlay', 'plus-lighter'] as const} onChange={(v) => set('inner', { blend: v })} />
        </Panel>

        <Panel title="Outer orbit" onReset={() => reset('outer')}>
          <Toggle label="Show the outer orbit" value={O.show} onChange={(v) => set('outer', { show: v })} />
          <Range label="Ring radius (of logo size)" value={O.radius} min={0.2} max={0.6} step={0.005} digits={3} onChange={(v) => set('outer', { radius: v })} />
          <Range label="Orb size (of logo size)" value={O.orbSize} min={0.01} max={0.12} step={0.001} digits={3} onChange={(v) => set('outer', { orbSize: v })} />
          <Range label="Opacity, low" value={O.opacityLow} min={0} max={1} step={0.01} onChange={(v) => set('outer', { opacityLow: v })} />
          <Range label="Opacity, high" value={O.opacityHigh} min={0} max={1} step={0.01} onChange={(v) => set('outer', { opacityHigh: v })} />
        </Panel>

        <Panel title="Live gem: light and material" open onReset={() => reset('light')}>
          <Range label="Index of refraction" value={L.ior} min={1.5} max={2.8} step={0.01} onChange={(v) => set('light', { ior: v })} hint="Diamond is 2.42. Lower looks like glass or quartz." />
          <Range label="Dispersion (fire)" value={L.dispersion} min={0} max={0.1} step={0.001} digits={3} onChange={(v) => set('light', { dispersion: v })} hint="Real diamond is about 0.012. Needs 'Fire' on under Quality." />
          <Range label="Lights" value={L.lights} min={1} max={8} step={1} digits={0} onChange={(v) => set('light', { lights: v })} />
          <Range label="Light brightness" value={L.lightGain} min={0} max={8} step={0.1} digits={1} onChange={(v) => set('light', { lightGain: v })} />
          <Range label="Light sharpness" value={L.lightSharpness} min={2} max={200} step={1} digits={0} onChange={(v) => set('light', { lightSharpness: v })} hint="Low: broad studio panels. High: small points that sparkle." />
          <Range label="Light height, lowest" value={L.elevationLow} min={0} max={1.5} step={0.01} onChange={(v) => set('light', { elevationLow: v })} />
          <Range label="Light height, highest" value={L.elevationHigh} min={0} max={1.5} step={0.01} onChange={(v) => set('light', { elevationHigh: v })} />
          <Range label="Sky brightness" value={L.sky} min={0} max={1.5} step={0.01} onChange={(v) => set('light', { sky: v })} />
          <Range label="Viewer's shadow, size" value={L.headSize} min={0} max={1} step={0.01} onChange={(v) => set('light', { headSize: v })} hint="The dark reflection of the viewer that gives a diamond its dark facets." />
          <Range label="Viewer's shadow, depth" value={L.headDepth} min={0} max={1} step={0.01} onChange={(v) => set('light', { headDepth: v })} />
          <Range label="Colour from below (orbs)" value={L.below} min={0} max={3} step={0.05} onChange={(v) => set('light', { below: v })} hint="How strongly the orbs' colours come up through the pavilion." />
          <Range label="Colour from the sides" value={L.belowSpread} min={0} max={1} step={0.01} onChange={(v) => set('light', { belowSpread: v })} hint="Raise for more colour at the edges (the girdle)." />
          <Range label="Exposure" value={L.exposure} min={0.2} max={4} step={0.05} onChange={(v) => set('light', { exposure: v })} />
          <Range label="Saturation" value={L.saturation} min={0} max={2} step={0.01} onChange={(v) => set('light', { saturation: v })} />
          <Range label="Viewer distance (0 = flat)" value={L.perspective} min={0} max={20} step={0.5} digits={1} onChange={(v) => set('light', { perspective: v })} hint="Closer gives each facet a gradient, as in a photograph." />
        </Panel>

        <Panel title="Live gem: motion" onReset={() => reset('motion')}>
          <Range label="Draws per second" value={s.motion.fps} min={2} max={60} step={1} digits={0} onChange={(v) => set('motion', { fps: v })} hint="The sparkle moves slowly; fewer draws use less power." />
          <Range label="Light turn per sparkle loop (turns)" value={s.motion.spin} min={0} max={1} step={0.01} onChange={(v) => set('motion', { spin: v })} hint="One sparkle loop is three breaths, as with the sprite." />
        </Panel>

        <Panel title="Live gem: kaleidoscope" open onReset={() => { reset('kaleidoscope'); setRestart((r) => r + 1); }}>
          <Toggle label="Kaleidoscope" value={s.kaleidoscope.on} onChange={(v) => set('kaleidoscope', { on: v })} hint="The inside of the stone slowly re-cuts itself; the outline stays still. Held still when the device asks for reduced motion. Turning it off pauses it where it is." />
          <button type="button" onClick={() => { set('kaleidoscope', { on: false }); setRestart((r) => r + 1); }} className="w-full rounded border border-border px-2 py-1.5 text-xs hover:bg-muted">Return to the plain cut (and turn it off)</button>
          <div className="space-y-1">
            <span className="block text-xs">Preset</span>
            <div className="flex flex-wrap gap-1">
              {(Object.keys(KALEIDOSCOPE_PRESETS) as KaleidoscopePreset[]).map((name) => {
                const p = KALEIDOSCOPE_PRESETS[name];
                const active = (Object.keys(p) as (keyof KaleidoscopeLook)[]).every((f) => f === 'on' || s.kaleidoscope[f] === p[f]);
                return (
                  <button key={name} type="button" aria-pressed={active} onClick={() => set('kaleidoscope', { ...p, on: s.kaleidoscope.on })} className={`rounded border px-2 py-0.5 text-xs capitalize ${active ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-border text-muted-foreground'}`}>
                    {name}
                  </button>
                );
              })}
            </div>
            <span className="block text-[11px] leading-snug text-muted-foreground">Each keeps the stone's structure within limits and lets the pattern move inside them. Full is the original.</span>
          </div>
          <Range label="Structure" value={s.kaleidoscope.structure} min={0} max={1} step={0.01} onChange={(v) => set('kaleidoscope', { structure: v })} hint="How much the overall shape may move (crown, pavilion and girdle angles). Low keeps the stone recognisably the same." />
          <Range label="Pattern" value={s.kaleidoscope.pattern} min={0} max={1} step={0.01} onChange={(v) => set('kaleidoscope', { pattern: v })} hint="How much the star facets inside the table may move." />
          <Range label="Sway (°)" value={s.kaleidoscope.sway} min={0} max={30} step={0.5} digits={1} onChange={(v) => set('kaleidoscope', { sway: v })} hint="How far the facets swing each way before coming back. 0 turns them without end." />
          <Range label="Depth" value={s.kaleidoscope.depth} min={0} max={1} step={0.01} onChange={(v) => set('kaleidoscope', { depth: v })} hint="How far the facet angles move. 1 is the furthest tested to keep the stone whole." />
          <Range label="Slowest wave (s)" value={s.kaleidoscope.periodS} min={10} max={600} step={5} digits={0} onChange={(v) => set('kaleidoscope', { periodS: v })} hint="Higher is slower and calmer." />
          <Range label="Turning" value={s.kaleidoscope.turn} min={0} max={1} step={0.01} onChange={(v) => set('kaleidoscope', { turn: v })} hint="The star and pavilion facets turn in opposite directions. 0 keeps only the angles moving." />
        </Panel>

        <Panel title="Live gem: cut" onReset={() => reset('cut')}>
          <Range label="Crown main angle (°)" value={C.crown} min={15} max={50} step={0.5} digits={1} onChange={(v) => set('cut', { crown: v })} />
          <Range label="Star angle (°)" value={C.star} min={5} max={40} step={0.5} digits={1} onChange={(v) => set('cut', { star: v })} />
          <Range label="Star reach" value={C.starReach} min={0.1} max={0.8} step={0.01} onChange={(v) => set('cut', { starReach: v })} />
          <Range label="Upper girdle angle (°)" value={C.upperGirdle} min={20} max={60} step={0.5} digits={1} onChange={(v) => set('cut', { upperGirdle: v })} />
          <Range label="Pavilion angle (°)" value={C.pavilion} min={30} max={55} step={0.1} digits={1} onChange={(v) => set('cut', { pavilion: v })} hint="About 40.8° returns the most light in a round diamond." />
          <Range label="Lower girdle angle (°)" value={C.lowerGirdle} min={30} max={60} step={0.5} digits={1} onChange={(v) => set('cut', { lowerGirdle: v })} />
          <Range label="Table height" value={C.tableZ} min={0.1} max={0.6} step={0.005} digits={3} onChange={(v) => set('cut', { tableZ: v })} hint="Lower makes a larger table." />
          <Range label="Girdle thickness" value={C.girdle} min={0} max={0.08} step={0.001} digits={3} onChange={(v) => set('cut', { girdle: v })} />
        </Panel>

        <Panel title="Live gem: quality" onReset={() => reset('quality')}>
          <Toggle label="Automatic, as the site would choose" value={s.motion.autoQuality} onChange={(v) => set('motion', { autoQuality: v })} hint="Starts from this device's tier and steps down if the first frames are slow. The settings below are then ignored." />
          <Range label="Internal bounces" value={s.quality.bounces} min={1} max={8} step={1} digits={0} onChange={(v) => set('quality', { bounces: v })} />
          <Toggle label="Fire (trace red, green and blue apart)" value={s.quality.disperse} onChange={(v) => set('quality', { disperse: v })} hint="Three times the work." />
          <Toggle label="Smooth edges (4 samples a pixel)" value={s.quality.supersample} onChange={(v) => set('quality', { supersample: v })} hint="Four times the work." />
          <div className="flex gap-2">
            <button type="button" onClick={() => set('quality', HIGH_QUALITY)} className="rounded border border-border px-2 py-1 text-[11px] hover:bg-muted">High preset</button>
            <button type="button" onClick={() => set('quality', LOW_QUALITY)} className="rounded border border-border px-2 py-1 text-[11px] hover:bg-muted">Low preset (older phones)</button>
          </div>
        </Panel>

        <Panel title="Live gem: 2D finishing" onReset={() => reset('finish')}>
          <p className="text-[11px] leading-snug text-muted-foreground">The steps both gems go through after they are drawn. The left side always uses the site&rsquo;s values.</p>
          <Range label="Clarity (orbit shows through)" value={F.clarity} min={0} max={1} step={0.01} onChange={(v) => set('finish', { clarity: v })} />
          <Range label="Sparkle layer" value={F.sparkle} min={0} max={1} step={0.01} onChange={(v) => set('finish', { sparkle: v })} />
          <Range label="Breathing tint" value={F.tint} min={0} max={1} step={0.01} onChange={(v) => set('finish', { tint: v })} />
          <Range label="Contrast" value={F.contrast} min={0} max={1} step={0.01} onChange={(v) => set('finish', { contrast: v })} />
          <Range label="Lift" value={F.lift} min={0} max={1} step={0.01} onChange={(v) => set('finish', { lift: v })} />
          <Range label="Colour wheel over the stone" value={F.fieldAlpha} min={0} max={1} step={0.01} onChange={(v) => set('finish', { fieldAlpha: v })} hint="The sprite needs 0.9 to look coloured. The live gem traces colour itself." />
        </Panel>
      </aside>

      {/* The two gems */}
      <main className="grid flex-1 grid-cols-1 overflow-auto md:grid-cols-2" style={{ background: bg }}>
        {(['sprite', 'live'] as const).map((side) => {
          const isLive = side === 'live';
          const orbits = isLive || s.view.orbitBoth;
          return (
            <section key={side} className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6" aria-label={isLive ? 'Live gem' : 'Sprite gem'}>
              <div style={{ width: s.view.size, height: s.view.size }} className="relative shrink-0">
                <NenyaLogo
                  size={s.view.size}
                  showValarOrbit
                  glow={s.view.glow}
                  cycleStart={cycleStart}
                  breathingEnabled={s.view.breathing}
                  gemEngine={side}
                  liveGem={isLive ? live : undefined}
                  gemLook={isLive ? F : SPRITE_FINISH}
                  innerOrbit={orbits ? I : undefined}
                  outerOrbit={orbits ? O : undefined}
                  onGemStats={report[side]}
                />
              </div>
              <div className={`space-y-0.5 text-center text-xs ${s.view.background === 'dark' ? 'text-[#E8DCC8]' : 'text-[#3A2F28]'}`}>
                <p className="font-medium">{isLive ? 'Live (ray-traced, about 4 KB of code)' : 'Sprite (809 KB image, today)'}</p>
                <StatLine sink={sinks[side]} />
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
