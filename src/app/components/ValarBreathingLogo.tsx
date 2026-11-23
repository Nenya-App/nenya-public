import { useState, useEffect, useMemo, useRef } from 'react';
import { useFadeSwitch } from '../../lib/useFadeSwitch';
import { ringCorrection } from '../../lib/breathClock';
import { useBreathColourChoice, useOrbColourChoice } from '../../lib/deviceMemory';
import { useKeptPalettes } from '../../lib/keptPalettes';
import { breathSequence, orbVectors, resolveColours } from '../../lib/logoColours';
import { DEFAULT_OUTER_ORBIT } from '../../lib/orbitLook';
import { ringAlphas, ringEdgeStart } from '../../lib/breathStrength';

/**
 * The breathing ring grows to the middle of the ring of outer orbs and no further: its full-size diameter is the orb ring's diameter (2 x the orbs' radius, a fraction of the logo's size,
 * 0.5 each way so the same as the logo's size), so its outer edge passes behind the orbs, which are fully opaque and drawn above it. Tied to the orbs' radius so the two cannot drift apart.
 */
export const RING_END_FRACTION = DEFAULT_OUTER_ORBIT.radius * 2;

// Valar Sigils: Dual Focus (Individual/Communal) with 6-Color Chromatic Vectors
// The first color of each palette is its main color. Palettes are starting points, not a measurement.
export const valarColors = [
  // AIR & LIGHT — Perception, Awareness, Order
  {
    name: 'Manwë',
    vector: ['#2C6E9E', '#6EA8D4', '#DCE9F2', '#8F9DB0', '#E9C46A', '#1E3F63'],
    individualFocus: 'Perspective, Clarity, Stepping Back, Letting Go',
    communalFocus: 'Fair Governance, Systemic Oversight, Peaceful Order',
  },
  {
    name: 'Varda',
    vector: ['#F7D44A', '#FFF6D8', '#C9D1E0', '#A9C7F2', '#5B4A96', '#1B2447'],
    individualFocus: 'Hope, Illumination, Self-Worth, Sacredness',
    communalFocus: 'Shared Vision, Guiding Truth, Moral Clarity',
  },

  // WATER & FLOW — Emotion, Communion, Change
  {
    name: 'Ulmo',
    vector: ['#1B4F6E', '#4B8EAA', '#6CBFA6', '#E4F2F0', '#D3C9CF', '#0D2A3F'],
    individualFocus: 'Flow, Intuition, Emotional Depth/Process',
    communalFocus: 'Systemic Connection, Fluid Communication, Collective Rhythm',
  },
  {
    name: 'Nienna',
    vector: ['#8B8B9E', '#6F7F95', '#A8BCCF', '#A58BBE', '#E3E6EC', '#4A4F63'],
    individualFocus: 'Grieving, Self-Compassion, Letting Feelings Move',
    communalFocus: 'Empathy, Shared Lament, Communal Witnessing of Pain',
  },

  // EARTH & CRAFT — Structure, Growth, Material Justice
  {
    name: 'Aulë',
    vector: ['#9C5D3A', '#D9822B', '#5B5F66', '#C9B79C', '#BFC9D6', '#2E2A28'],
    individualFocus: 'Structure, Competence, Mastery, Self-Efficacy',
    communalFocus: 'Functional Systems, Reliable Infrastructure, Shared Resources',
  },
  {
    name: 'Yavanna',
    vector: ['#3B6E47', '#7DAA80', '#CCE3CC', '#D8B24A', '#E0786A', '#6B4E37'],
    individualFocus: 'Nourishment, Health, Embodiment, Personal Vitality',
    communalFocus: 'Ecosystemic Balance, Resource Management, Shared Generativity',
  },
  {
    name: 'Vána',
    vector: ['#A8B84C', '#F2A7B8', '#F6D55C', '#A877CC', '#9DC8E8', '#4F7F34'],
    individualFocus: 'Vibrant Life, Uninhibited Joy, Radiance',
    communalFocus: 'Cultivating Beauty, Aesthetic Generosity, Collective Flourishing',
  },

  // TIME & FATE — Memory, Consequence, Continuity
  {
    name: 'Mandos',
    vector: ['#5C4B6E', '#2B2540', '#8FA0BF', '#D08AA2', '#E4DCCB', '#6F6C7A'],
    individualFocus: 'Endings, Acceptance, Honesty About Limits, Owning Your Choices',
    communalFocus: 'Justice, Accountability, Shared Acknowledgment',
  },
  {
    name: 'Vairë',
    vector: ['#3A6B6B', '#2F4B7A', '#D8B25A', '#B04A50', '#E8DCC4', '#86ACAC'],
    individualFocus: 'Meaning-Making, Memory, Personal Narrative',
    communalFocus: 'History, Cultural Record, Shared Identity',
  },

  // WILD & VITALITY — Instinct, Motion, Freedom
  {
    name: 'Oromë',
    vector: ['#4D6E3B', '#A87D4B', '#E3CFA4', '#E0B04A', '#8BA7B8', '#253A2A'],
    individualFocus: 'Action, Standing Up for Yourself, Clear Boundaries',
    communalFocus: 'Protection, Care for the Vulnerable, Shared Boundaries',
  },
  {
    name: 'Tulkas',
    vector: ['#E3752B', '#F2B84B', '#B8392B', '#FBE2CC', '#6B3A22', '#F2AA74'],
    individualFocus: 'Strength, Vitality, Feeling Capable',
    communalFocus: 'Shared Energy, Resilience, Protecting Life',
  },
  {
    name: 'Nessa',
    vector: ['#D9626B', '#8DBF6A', '#C98B52', '#6BB5B0', '#F8E0E2', '#A63D54'],
    individualFocus: 'Joy, Rhythm, Embodied Movement, Play',
    communalFocus: 'Celebration, Shared Ritual, Collective Merriment',
  },

  // DREAM & REST — Vision, Healing, Inner Worlds
  {
    name: 'Irmo',
    vector: ['#845A9E', '#BB9ED4', '#6F8FD0', '#D9DDF0', '#6FA58A', '#2D2347'],
    individualFocus: 'Imagination, Creative Expression, Vision',
    communalFocus: 'Shared Myth, Collective Dreamscape, Cultural Articulation',
  },
  {
    name: 'Estë',
    vector: ['#5A9C8E', '#C2E0D6', '#7FA0AD', '#E6D8BF', '#D9B8A8', '#2F5F59'],
    individualFocus: 'Restoration, Sanctuary, Deep Peace, Sleep',
    communalFocus: 'Collective Healing, Safe Space creation, Non-Violent Refuge',
  },

  // SHADOW & ENTROPY — Corruption, Decay, Burnout
  {
    name: 'Melkor',
    vector: ['#5C2E2E', '#D9552B', '#6E6A6A', '#A9CFE8', '#EAF2F8', '#1E1818'],
    individualFocus: 'Self-Expression, Personal Strength, Having a Say',
    communalFocus: 'New Ideas, Questioning Old Habits, Fresh Starts',
  },
  {
    name: 'Ungoliant',
    vector: ['#1E1E2A', '#3A3A50', '#8585A0', '#DCDCE8', '#D01C1F', '#B3B3C8'],
    individualFocus: 'Control, Feeling Powerless, Wanting Relief',
    communalFocus: 'Safety, Fairness, Repair',
  },
];

// All 96 colours (16 Valar x 6 colours each) in breath order. Shared with the gem, which tints to the
// same colour as the ring.
export const allColors: string[] = valarColors.flatMap((valar) => valar.vector);
const originalOrbVectors: string[][] = valarColors.map((valar) => valar.vector);

/**
 * The colours of the breath ring and of the gem's tint, one a breath: the original 96 unless the visitor chose another set in Settings
 * (src/lib/logoColours.ts). The same array every time while the choice and the palettes they kept stay as they are.
 */
export function useBreathColours(): string[] {
  const choice = useBreathColourChoice();
  const kept = useKeptPalettes();
  return useMemo(() => (choice === 'original' ? allColors : breathSequence(resolveColours(choice, valarColors, kept))), [choice, kept]);
}

/** The six-colour vector of each of the sixteen orbs: each palette's own unless the visitor chose another set in Settings. */
export function useOrbVectors(): string[][] {
  const choice = useOrbColourChoice();
  const kept = useKeptPalettes();
  return useMemo(() => (choice === 'original' ? originalOrbVectors : orbVectors(resolveColours(choice, valarColors, kept), valarColors.length)), [choice, kept]);
}

// Convert hex to rgba
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export interface BreathingTechnique {
  ih: number; // inhale ms
  hi: number; // hold-in ms
  ex: number; // exhale ms
  ho: number; // hold-out ms
}

// Colorblind-friendly CSS filters applied to the whole breathing container
const CB_FILTERS: Record<string, string> = {
  deuteranopia: 'brightness(1) contrast(1.3) saturate(2) hue-rotate(-40deg)',
  protanopia: 'brightness(1) contrast(1.3) saturate(2) hue-rotate(-20deg)',
  tritanopia: 'brightness(1) contrast(1.3) saturate(1.8) hue-rotate(170deg)',
  achromatopsia: 'grayscale(1) contrast(2.5) brightness(1.1)',
};

/** The smallest the breathing ring gets. */
export const DEFAULT_MIN_SCALE = 0.25; // was 0.1: stops just outside the gem and the inner orbs, so the breath travels less and looks slower

interface ValarBreathingLogoProps {
  children: React.ReactNode;
  enabled?: boolean;
  opacity?: number; // 0.1 to 1.0
  /** How much stronger than standard the ring is drawn, 1 to 2 (src/lib/breathStrength.ts): a brighter glow with a wider soft edge. The timing is never changed. */
  boost?: number;
  logoSize?: number; // Size of the logo to match breathing animation to
  cycleDuration?: number; // seconds for one complete breath cycle
  technique?: BreathingTechnique | null; // overrides the default even 40/50/50/... timing shape
  cvMode?: string; // colorblind mode key into CB_FILTERS
  /** Shared clock anchor (ms epoch) so this animation's phase matches the
   *  numeric breathing counter instead of timing itself from whenever this
   *  component happened to last mount. */
  cycleStart?: number;
  /** How small the ring gets at the bottom of the breath, as a fraction of its full size (0.1 reaches almost to the centre; the default stops just outside the gem). */
  minScale?: number;
}

export function ValarBreathingLogo({
  children,
  enabled = true,
  opacity = 0.75,
  boost = 1,
  logoSize = 200,
  cycleDuration = 10,
  technique = null,
  cvMode = '',
  cycleStart,
  minScale = DEFAULT_MIN_SCALE,
}: ValarBreathingLogoProps) {
  // Changing the breathing pace fades the ring out, applies the new timing, and fades it back in, instead of
  // snapping. Everything below runs on the applied (possibly still old) setup.
  const shapeKey = technique ? `${technique.ih}_${technique.hi || 0}_${technique.ex}_${technique.ho || 0}` : String(cycleDuration);
  const { applied, style: fadeStyle } = useFadeSwitch({ tech: technique, cycleDur: cycleDuration, start: cycleStart }, shapeKey);
  const { tech, cycleDur, start } = applied;

  // The ring's colours, one a breath: all 96 unless the visitor chose another set (Settings, Logo look, Breathing colours).
  const colours = useBreathColours();

  // Total animation cycle = every colour (96 by default) × cycleDuration seconds each
  const totalDuration = colours.length * cycleDur;

  // Derive the breath's expand/hold/contract/hold shape from the technique's phase
  // fractions (ih/hi/ex/ho in ms); falls back to an even 4-phase split when none is set.
  const totalMs = tech ? tech.ih + (tech.hi || 0) + tech.ex + (tech.ho || 0) : cycleDur * 1000;
  const t1 = tech ? tech.ih / totalMs : 0.5;
  const t2 = tech ? (tech.ih + (tech.hi || 0)) / totalMs : 0.5;
  const t3 = tech ? (tech.ih + (tech.hi || 0) + tech.ex) / totalMs : 1;

  const cvFilter = cvMode && CB_FILTERS[cvMode] ? CB_FILTERS[cvMode] : undefined;

  // Identifies an "epoch" of the pulse animation -- changes only when the
  // animation's actual structure or timing shape changes (on/off, which
  // colors render, the technique's phase proportions). Opacity and
  // colorblind mode are deliberately excluded: they're plain style
  // changes and must not restart the pulse.
  const ringsEpochKey = `valar-breathing-${enabled}-${minScale}-${
    tech ? `${tech.ih}_${tech.hi || 0}_${tech.ex}_${tech.ho || 0}` : cycleDur
  }`;

  // Phase-alignment delay for the CSS animation, computed ONCE per epoch
  // (and once per resume-from-pause, since cycleStart itself shifts then)
  // rather than on every cycle boundary. The CSS animation's own timeline
  // is precise on its own once correctly phase-aligned at the start --
  // re-touching `animation-delay` every cycle was itself the bug: each
  // touch forces the browser to reset the animation's internal clock using
  // a freshly (and setTimeout-jitter-prone) computed value, which is what
  // kept knocking it out of sync with the counter rather than fixing it.
  const [ringDelay, setRingDelay] = useState(0);
  useEffect(() => {
    if (start == null) return;
    const elapsed = (Date.now() - start) / 1000;
    const phaseIntoRing = ((elapsed % cycleDur) + cycleDur) % cycleDur;
    setRingDelay(-phaseIntoRing);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, cycleDur, ringsEpochKey]);

  // Only one ring is ever visually active at a time -- the breath cycles
  // sequentially through all 96 colors, one fully faded out before the next
  // fades in. Previously all 96 were mounted and animating simultaneously,
  // each holding its own compositor layer, which is what was making the
  // pulse stutter on less powerful displays. A single ring, swapped on a
  // schedule, produces the identical visual sequence for a fraction of the
  // cost. This scheduler only ever writes `activeIndex` (a plain
  // `background` style, not part of the `animation` shorthand), so it can
  // never perturb the CSS animation set up above.
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!enabled || start == null) return;
    let timeoutId: ReturnType<typeof setTimeout>;
    const scheduleNext = () => {
      const elapsed = (Date.now() - start) / 1000;
      const cyclePos = ((elapsed % totalDuration) + totalDuration) % totalDuration;
      const idx = Math.floor(cyclePos / cycleDur) % colours.length;
      const phaseIntoRing = cyclePos - idx * cycleDur;
      setActiveIndex(idx);
      const msUntilNext = (cycleDur - phaseIntoRing) * 1000;
      timeoutId = setTimeout(scheduleNext, Math.max(msUntilNext, 16));
    };
    scheduleNext();
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, start, cycleDur, totalDuration, colours, ringsEpochKey]);

  const activeColor = colours[activeIndex % colours.length] ?? colours[0];
  // The ring's soft gradient for the chosen strength: at standard (boost 1) exactly the old alphas and edge; above it brighter and wider.
  const alphas = ringAlphas({ opacity, boost });
  const ringEdge = ringEdgeStart({ opacity, boost });

  // Plain CSS animation instead of Motion's JS-driven `animate` -- CSS's
  // animation-play-state genuinely freezes this on pause, where Motion's
  // `animate={false}` does not reliably cancel an already-running infinite
  // WAAPI loop. The keyframe shape depends on the technique's phase
  // fractions, so it's generated per epoch rather than declared statically.
  const ringAnimName = `nenya-ring-${ringsEpochKey.replace(/[^a-zA-Z0-9]/g, '_')}`;

  // Locked to the shared clock (owner, 2026-11-18: the ring and the counter drifted apart after a while). The ring is a CSS animation on the browser's animation timeline; the counter, the tones and the gem read
  // the wall clock. Once a second, and when the tab comes back, the ring's time is set back to the shared clock if it has drifted by more than 30 ms (src/lib/breathClock.ts ringCorrection). A running ring
  // only: a paused one is left alone, and the delay set once above still places it correctly when it starts.
  const ringRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!enabled || start == null) return;
    const el = ringRef.current;
    if (!el || typeof el.getAnimations !== 'function') return;
    const cycleMs = cycleDur * 1000;
    const lock = () => {
      const a = el.getAnimations().find((x) => (x as CSSAnimation).animationName === ringAnimName);
      if (!a || a.playState !== 'running') return;
      const progress = a.effect?.getComputedTiming?.().progress;
      if (progress == null) return;
      const d = ringCorrection(Date.now() - start, progress, cycleMs);
      if (d !== 0) a.currentTime = Number(a.currentTime ?? 0) + d;
    };
    lock();
    const id = setInterval(lock, 1000);
    const onVisible = () => { if (document.visibilityState === 'visible') lock(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', lock);
    window.addEventListener('pageshow', lock);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVisible); window.removeEventListener('focus', lock); window.removeEventListener('pageshow', lock); };
  }, [enabled, start, cycleDur, ringAnimName]);
  const ringKeyframesCss = `@keyframes ${ringAnimName} {
    0% { transform: scale(${minScale}); opacity: 0; }
    ${t1 * 100}% { transform: scale(1); opacity: ${opacity * 0.6}; }
    ${t2 * 100}% { transform: scale(1); opacity: ${opacity * 0.6}; }
    ${t3 * 100}% { transform: scale(${minScale}); opacity: 0; }
    100% { transform: scale(${minScale}); opacity: 0; }
  }`;

  return (
    <div className="flex items-center justify-center p-8 sm:p-12">
      <div
        className="relative"
        style={{
          width: logoSize,
          height: logoSize,
          // Reserve space for scale(1.5) breathing without producing a square overflow region
          overflow: 'visible',
          filter: cvFilter,
        }}
      >
        {/* Breathing animation - cycles through all 96 colors sequentially,
            one ring at a time. Keyed on its own so changing the breathing
            pulse's settings doesn't also tear down and restart the
            orbit/logo content below, which has nothing to do with the
            breathing timing and should keep running uninterrupted. */}
        <div style={fadeStyle}>
        <div key={ringsEpochKey}>
        {enabled && (
          <>
          <style>{ringKeyframesCss}</style>
          <div
            ref={ringRef}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: logoSize * RING_END_FRACTION,
              height: logoSize * RING_END_FRACTION,
              left: (logoSize * (1 - RING_END_FRACTION)) / 2,
              top: (logoSize * (1 - RING_END_FRACTION)) / 2,
              // Use closest-side so 100% is at the circle edge, then keep colors fully transparent past that
              // This prevents square corner artifacts when the box is scaled/transformed
              background: `radial-gradient(circle closest-side, transparent 0%, transparent ${ringEdge}%, ${hexToRgba(activeColor, alphas[0])} 50%, ${hexToRgba(activeColor, alphas[1])} 70%, ${hexToRgba(activeColor, alphas[2])} 90%, ${hexToRgba(activeColor, alphas[3])} 99%, transparent 100%)`,
              borderRadius: '50%',
              zIndex: 1,
              animation: `${ringAnimName} ${cycleDur}s linear infinite`,
              animationDelay: `${ringDelay}s`,
              willChange: 'transform, opacity',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          />
          </>
        )}
        </div>
        </div>

        {/* Content (logo with orbs) - centered and above breathing.
            Outside the rings' keyed wrapper above, so it stays mounted
            continuously and its own animation (e.g. the Valar orbit)
            keeps running when the breathing pulse's settings change. */}
        <div
          className="absolute"
          style={{
            left: 0,
            top: 0,
            width: logoSize,
            height: logoSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}