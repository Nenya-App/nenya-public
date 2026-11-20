import { useEffect, useId, useMemo, useState } from 'react';
import { LEAF_SET, leafGeometry, leafTransform, type LeafSpec } from '../../lib/leafShape';
import { chooseLeafPreset, leafAnimationStyles, leafMotionCss, readLeafCapability, type LeafPreset } from '../../lib/leafMotion';
import { breathLengthMs } from '../../lib/breathClock';
import type { BreathingTechnique } from './ValarBreathingLogo';

// The six leaves of the logo gem, drawn as vectors in the same 765-unit box the old petals image used (its size is the
// logo's size * 0.765). Colours are the ones the petals already had: warm gold (#b8803f, #fcce96, #fff0cf), silver-white
// (#f2ead9, #ffffff, #b9b09f) and the dark bronze of the old edge shadow (#3a2616). Each leaf is its own group with an id
// (leaf-1 to leaf-6), so a later menu can make each one a button. They are drawing only for now, hidden from assistive
// technology: the logo's name comes from the text beside it or from the alt text NenyaLogo passes.

interface MallornLeavesProps {
  /** Side of the box in px. */
  size: number;
  /** The shared clock anchor (ms epoch) and the breathing technique, as the ring and gem take them. */
  cycleStart?: number;
  technique?: BreathingTechnique | null;
  /** Force a motion preset. Without it the browser's reports decide. */
  preset?: LeafPreset;
  /** Breathing animation switched off: the leaves keep still too. */
  breathingEnabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** The leaves to draw, so a later menu can pass its own. Defaults to all six. */
  leaves?: readonly LeafSpec[];
}

/** The preset for this browser (re-read when the reduced-motion setting changes). */
export function useLeafPreset(force?: LeafPreset): LeafPreset {
  const [preset, setPreset] = useState<LeafPreset>(() => force ?? chooseLeafPreset(readLeafCapability()));
  useEffect(() => {
    if (force) return;
    const update = () => setPreset(chooseLeafPreset(readLeafCapability()));
    update();
    const q = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    q?.addEventListener?.('change', update);
    return () => q?.removeEventListener?.('change', update);
  }, [force]);
  return force ?? preset;
}

export default function MallornLeaves({ size, cycleStart, technique = null, preset: forced, breathingEnabled = true, className, style, leaves = LEAF_SET }: MallornLeavesProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const chosen = useLeafPreset(forced);
  const preset: LeafPreset = breathingEnabled ? chosen : 'none';
  const breathMs = breathLengthMs(technique);

  // Time since the shared cycle start, read when the anchor or the pace changes (as the ring's own delay is).
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    setElapsed(cycleStart == null ? 0 : Date.now() - cycleStart);
  }, [cycleStart, breathMs]);

  const shapes = useMemo(() => leaves.map((s) => ({ spec: s, geo: leafGeometry(s) })), [leaves]);
  const css = useMemo(() => leafMotionCss(preset, technique), [preset, technique]);
  const id = (n: string) => `${n}${uid}`;

  return (
    <svg className={className} style={style} viewBox="-382.5 -382.5 765 765" width={size} height={size} aria-hidden="true" focusable="false" data-leaf-preset={preset}>
      {css && <style>{css}</style>}
      <defs>
        {/* Gold along the blade: bronze at the base, light gold, then pale toward the tip. */}
        <linearGradient id={id('gold')} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="-310">
          <stop offset="0" stopColor="#b8803f" />
          <stop offset="0.3" stopColor="#fcce96" />
          <stop offset="0.65" stopColor="#fff0cf" />
          <stop offset="1" stopColor="#fcce96" />
        </linearGradient>
        <linearGradient id={id('lit')} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="-310">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.42" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id={id('silver')} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="-310">
          <stop offset="0" stopColor="#b9b09f" />
          <stop offset="0.4" stopColor="#f2ead9" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      {shapes.map(({ spec, geo }, i) => {
        const a = leafAnimationStyles(preset, i, technique, breathMs, elapsed);
        return (
          <g key={spec.id} id={spec.id} data-leaf={spec.id} transform={leafTransform(spec)}>
            <g className="lm-sway" style={a.sway as React.CSSProperties}>
              <g className="lm-open" style={a.open as React.CSSProperties}>
                {/* Edge shadow (the old dark bronze, low opacity) under the blade. */}
                <path d={geo.blade} fill="none" stroke="#3a2616" strokeOpacity="0.32" strokeWidth="5" strokeLinejoin="round" />
                <path d={geo.blade} fill={`url(#${id('gold')})`} />
                <path d={geo.litHalf} fill={`url(#${id('lit')})`} />
                {/* Silver-white veins over the gold, with a dark hairline under them so they stay visible on the light gold. */}
                <g fill="none" strokeLinecap="round">
                  <path d={geo.midrib} stroke="#3a2616" strokeOpacity="0.3" strokeWidth="4.6" />
                  {geo.veins.map((d, k) => <path key={`s${k}`} d={d} stroke="#3a2616" strokeOpacity="0.22" strokeWidth="3.2" />)}
                  <path d={geo.midrib} stroke={`url(#${id('silver')})`} strokeWidth="3" />
                  {geo.veins.map((d, k) => <path key={k} d={d} stroke={`url(#${id('silver')})`} strokeWidth="1.8" />)}
                </g>
                <path d={geo.blade} fill="none" stroke={`url(#${id('silver')})`} strokeWidth="1.6" strokeLinejoin="round" strokeOpacity="0.9" />
                <path className="lm-glint" d={geo.sheen} fill="#ffffff" fillOpacity="0.55" style={a.glint as React.CSSProperties} />
              </g>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
