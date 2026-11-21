// The Touch display (docs/wireframes/lens/touch.html, the "orb"): the surface the person picked, wrapped on a sphere (or laid flat as a circle), changed live by the five sliders, with a
// plain-words twin of the same thing. Pure: levels, words and styles, so they are tested; the component (src/app/components/TouchOrb.tsx) only shows them. 2D only (CSS): no 3D engine.
// Slider values are 0 to 100 or null (not set). The page's sliders run Rough to Smooth (texture) and Frozen to Burning, Loose to Compressed, Weightless to Heavy, Blunt to Sharp.

export interface OrbValues { texture: number | null; temperature: number | null; pressure: number | null; weight: number | null; sharpness: number | null }
export interface OrbLevels { texture: number; temp: number; pressure: number; weight: number; sharp: number }

const lvl = (v: number | null, fallback: number): number => (v === null || !Number.isFinite(v) ? fallback : Math.max(0, Math.min(4, Math.round(v / 25))));

/** The five levels, 0 to 4. Texture counts up toward rough (the slider's left end), the others toward the right end. A slider that was not set rests at neutral and changes nothing. */
export const orbLevels = (v: OrbValues): OrbLevels => ({
  texture: v.texture === null ? 2 : 4 - lvl(v.texture, 2),
  temp: lvl(v.temperature, 2),
  pressure: lvl(v.pressure, 0),
  weight: lvl(v.weight, 0),
  sharp: lvl(v.sharpness, 0),
});

export const ORB_WORDS = {
  texture: ['very smooth', 'smooth', 'lightly textured', 'textured', 'rough'],
  temp: ['frozen', 'cool', 'neutral', 'warm', 'burning'],
  pressure: ['loose', 'light', 'firm', 'tight', 'compressed'],
  weight: ['weightless', 'light', 'medium', 'heavy', 'very heavy'],
  sharp: ['blunt', 'soft-edged', 'neutral', 'pointed', 'sharp'],
} as const;

/** The text twin: only the sliders that were set, in words. */
export function orbWords(v: OrbValues): string {
  const l = orbLevels(v), out: string[] = [];
  if (v.texture !== null) out.push(ORB_WORDS.texture[l.texture]);
  if (v.temperature !== null) out.push(ORB_WORDS.temp[l.temp]);
  if (v.pressure !== null) out.push(ORB_WORDS.pressure[l.pressure]);
  if (v.weight !== null) out.push(ORB_WORDS.weight[l.weight]);
  if (v.sharpness !== null) out.push(ORB_WORDS.sharp[l.sharp]);
  return out.length ? out.join(', ') : 'no sliders moved yet';
}

const star = (inner: number): string => {
  const pts: string[] = [];
  for (let k = 0; k < 24; k++) { const r = k % 2 ? inner : 50, a = (k / 24) * Math.PI * 2; pts.push(`${(50 + r * Math.cos(a)).toFixed(1)}% ${(50 + r * Math.sin(a)).toFixed(1)}%`); }
  return `polygon(${pts.join(',')})`;
};

export type OrbShape = 'sphere' | 'flat';

export interface OrbStyle { orb: Record<string, string>; shadow: Record<string, string> }
/** The look. Texture: how grainy and how close the picture is. Temperature: a cool to warm tint. Pressure: squashed. Weight: it sinks and its shadow grows. Sharpness: round to pointed star. */
export function orbStyle(v: OrbValues, pictureUrl: string | null, shape: OrbShape = 'sphere'): OrbStyle {
  const l = orbLevels(v);
  const light = shape === 'sphere' ? ['radial-gradient(circle at 34% 28%, rgba(255,255,255,.38), transparent 46%)', 'radial-gradient(circle at 66% 72%, rgba(0,0,0,.38), transparent 62%)'] : [];
  const grain = `repeating-radial-gradient(circle at 25% 35%, rgba(0,0,0,${(0.06 * l.texture).toFixed(2)}) 0 2px, transparent 2px 6px)`;
  // The grain sits over the picture too, so the Texture slider is seen on a photographed surface and not only on the plain one.
  const layers = [...light, grain, ...(pictureUrl ? [`url(${pictureUrl})`] : [])];
  const filter = l.temp < 2 ? `hue-rotate(${(2 - l.temp) * 40}deg) saturate(${(0.9 - (2 - l.temp) * 0.15).toFixed(2)})` : `sepia(${((l.temp - 2) * 0.4).toFixed(2)}) saturate(${(1 + (l.temp - 2) * 0.5).toFixed(2)})`;
  return {
    orb: {
      backgroundColor: '#9b8f7c',
      backgroundImage: layers.join(', '),
      backgroundSize: [...light.map(() => '100% 100%'), 'auto', ...(pictureUrl ? [`${100 + l.texture * 18}% ${100 + l.texture * 18}%`] : [])].join(', '),
      backgroundPosition: 'center',
      transform: `translateY(${l.weight * 5}px) scale(${(1 + l.pressure * 0.06).toFixed(2)}, ${(1 - l.pressure * 0.09).toFixed(2)})`,
      borderRadius: l.sharp ? '0' : '50%',
      clipPath: l.sharp ? star(50 - l.sharp * 9) : 'none',
      filter,
    },
    shadow: { transform: `scaleX(${(0.7 + l.weight * 0.15).toFixed(2)})`, opacity: String((0.15 + l.weight * 0.15).toFixed(2)) },
  };
}

/** The optional vibration (the wireframe's "Let me feel it"): only where the device can vibrate, off until chosen, never the only way the surface is told. Pressure sets the strength, weight the
 *  length, texture the pattern (smooth is one long soft pulse, rough is quick short ones). Under reduced motion nothing vibrates. Returns milliseconds on and off, as navigator.vibrate takes them. */
export function vibrationPattern(v: OrbValues): { pattern: number[]; says: string } {
  const l = orbLevels(v), strength = 20 + l.pressure * 25, len = 60 + l.weight * 60;
  return l.texture > 2
    ? { pattern: [strength, 40, strength, 40, strength, 40, strength], says: 'Quick short pulses (rough).' }
    : { pattern: [len * 2], says: 'One long soft pulse (smooth).' };
}
