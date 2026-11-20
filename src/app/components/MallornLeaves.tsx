import { useEffect, useId, useMemo, useState } from 'react';
import { leafWeave, LOGO_LEAF_COUNT, WEAVE_INNER_WIDTH, WEAVE_OUTER_WIDTH, WEAVE_RIB_WIDTH } from '../../lib/leafWeave';
import { chooseLeafPreset, flowerAnimationStyle, leafMotionCss, readLeafCapability, type LeafPreset } from '../../lib/leafMotion';
import { breathLengthMs } from '../../lib/breathClock';
import type { BreathingTechnique } from './ValarBreathingLogo';

// The logo's petals: woven, outlined, translucent leaves in the original petals' metal finish (the gold and silver-white
// gradients and the lighting filters below are the ones from the original petals drawing). The shapes come from
// src/lib/leafWeave.ts. Drawn in the 765-unit box (the logo's size * 0.765). Each leaf has an id group (leaf-1 ... leaf-N)
// holding its faint fill, so a later menu can make each one a control. Drawing only for now, hidden from assistive
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
  /** 'alternate' (default): even leaves gold outside and silver inside, odd leaves the other way. 'classic': gold outside, silver inside. */
  tones?: 'alternate' | 'classic';
  /** Leaves in the ring. The logo's layout is eight (LOGO_LEAF_COUNT); 6 and 12 also draw cleanly. */
  count?: number;
  /** A hairline midrib on each leaf. On by default. */
  midrib?: boolean;
  className?: string;
  style?: React.CSSProperties;
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

/** The original petals' lighting: a soft bevel and a specular edge, applied to the metal strokes. */
function MetalFilter({ id }: { id: string }) {
  return (
    <filter id={id} filterUnits="userSpaceOnUse" x="-383" y="-383" width="766" height="766" colorInterpolationFilters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="h" />
      <feSpecularLighting in="h" surfaceScale="4.1" specularConstant="0.98" specularExponent="28" lightingColor="#ffffff" result="sp">
        <feDistantLight azimuth="141" elevation="15" />
      </feSpecularLighting>
      <feComposite in="sp" in2="SourceAlpha" operator="in" result="spIn" />
      <feDiffuseLighting in="h" surfaceScale="4.1" diffuseConstant="1" lightingColor="#ffffff" result="df">
        <feDistantLight azimuth="141" elevation="15" />
      </feDiffuseLighting>
      <feBlend in="SourceGraphic" in2="df" mode="multiply" result="mul" />
      <feComposite in="SourceGraphic" in2="mul" operator="arithmetic" k1="0" k2="0.88" k3="0.12" k4="0" result="shaded" />
      <feComposite in="shaded" in2="spIn" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="lit" />
      <feComposite in="lit" in2="SourceAlpha" operator="in" />
    </filter>
  );
}

export default function MallornLeaves({ size, cycleStart, technique = null, preset: forced, breathingEnabled = true, tones = 'alternate', count = LOGO_LEAF_COUNT, midrib = true, className, style }: MallornLeavesProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const chosen = useLeafPreset(forced);
  const preset: LeafPreset = breathingEnabled ? chosen : 'none';
  const breathMs = breathLengthMs(technique);

  // Time since the shared cycle start, read when the anchor or the pace changes (as the ring's own delay is).
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    setElapsed(cycleStart == null ? 0 : Date.now() - cycleStart);
  }, [cycleStart, breathMs]);

  const w = useMemo(() => leafWeave(count), [count]);
  const css = useMemo(() => leafMotionCss(preset, technique), [preset, technique]);
  const flower = flowerAnimationStyle(preset, technique, breathMs, elapsed);
  const id = (n: string) => `${n}${uid}`;

  // Which leaves are silver outside (and gold inside).
  const silverOuter = (i: number) => tones === 'alternate' && i % 2 === 1;
  const idx = w.ids.map((_, i) => i);
  const outerGold = idx.filter((i) => !silverOuter(i));
  const outerSilver = idx.filter(silverOuter);
  const common = { fill: 'none', strokeLinejoin: 'round', strokeLinecap: 'round' } as const;
  const paths = (list: string[], which: number[]) => which.map((i) => <path key={w.ids[i]} d={list[i]} />);

  return (
    <svg className={className} style={style} viewBox="-382.5 -382.5 765 765" width={size} height={size} aria-hidden="true" focusable="false" data-leaf-preset={preset} data-leaf-count={w.count}>
      {css && <style>{css}</style>}
      <defs>
        <linearGradient id={id('gGold')} gradientUnits="userSpaceOnUse" x1="-150.51" y1="-392.1" x2="150.51" y2="392.1">
          <stop offset="0" stopColor="#b8803f" />
          <stop offset="0.2" stopColor="#fcce96" />
          <stop offset="0.56" stopColor="#fff0cf" />
          <stop offset="0.92" stopColor="#fcce96" />
          <stop offset="1" stopColor="#b8803f" />
        </linearGradient>
        <linearGradient id={id('gCream')} gradientUnits="userSpaceOnUse" x1="-150.51" y1="-392.1" x2="150.51" y2="392.1">
          <stop offset="0" stopColor="#b9b09f" />
          <stop offset="0.2" stopColor="#f2ead9" />
          <stop offset="0.56" stopColor="#ffffff" />
          <stop offset="0.92" stopColor="#f2ead9" />
          <stop offset="1" stopColor="#b9b09f" />
        </linearGradient>
        <radialGradient id={id('rFill')} cx="0" cy="0" r="380" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4d4d4d" stopOpacity="0.06" />
          <stop offset="1" stopColor="#4d4d4d" stopOpacity="0.02" />
        </radialGradient>
        <MetalFilter id={id('fGold')} />
        <MetalFilter id={id('fCream')} />
      </defs>
      <g className="lm-flower" style={flower as React.CSSProperties}>
        {/* The faint translucent fill, one group per leaf: the leaf's id and its hit area for a later menu. */}
        {w.ids.map((leafId, i) => (
          <g key={leafId} id={leafId} data-leaf={leafId} data-tone={silverOuter(i) ? 'silver' : 'gold'}>
            <path d={w.fill[i]} fill={`url(#${id('rFill')})`} stroke="none" />
          </g>
        ))}
        {/* The metal outlines, drawn by metal so each filter runs once: outer gold, outer silver, inner silver, inner gold. */}
        <g filter={`url(#${id('fGold')})`}><g {...common} strokeWidth={WEAVE_OUTER_WIDTH} stroke={`url(#${id('gGold')})`}>{paths(w.outer, outerGold)}</g></g>
        <g filter={`url(#${id('fCream')})`}><g {...common} strokeWidth={WEAVE_OUTER_WIDTH} stroke={`url(#${id('gCream')})`}>{paths(w.outer, outerSilver)}</g></g>
        <g filter={`url(#${id('fCream')})`}><g {...common} strokeWidth={WEAVE_INNER_WIDTH} stroke={`url(#${id('gCream')})`}>{paths(w.inner, outerGold)}</g></g>
        <g filter={`url(#${id('fGold')})`}><g {...common} strokeWidth={WEAVE_INNER_WIDTH} stroke={`url(#${id('gGold')})`}>{paths(w.inner, outerSilver)}</g></g>
        {midrib && <g {...common} strokeWidth={WEAVE_RIB_WIDTH} stroke={`url(#${id('gCream')})`} opacity="0.85">{paths(w.rib, idx)}</g>}
      </g>
    </svg>
  );
}
