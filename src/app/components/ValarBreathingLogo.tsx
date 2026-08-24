import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

// Valar Sigils: Dual Focus (Individual/Communal) with 6-Color Chromatic Vectors
// Gravity Well (first color) is the primary diagnostic color
export const valarColors = [
  // AIR & LIGHT — Perception, Awareness, Order
  {
    name: 'Manwë',
    vector: ['#2C6E9E', '#4A8BC2', '#6EA8D4', '#96C4E5', '#C2E0F2', '#E6F2F8'],
    individualFocus: 'Perspective, Clarity, Non-Attachment, Detachment',
    communalFocus: 'Fair Governance, Systemic Oversight, Peaceful Order',
  },
  {
    name: 'Varda',
    vector: ['#F7D44A', '#F9DF6C', '#FBE88E', '#FDF0B4', '#FFF6D8', '#FFFFFF'],
    individualFocus: 'Hope, Illumination, Self-Worth, Sacredness',
    communalFocus: 'Shared Vision, Guiding Truth, Moral Clarity',
  },

  // WATER & FLOW — Emotion, Communion, Change
  {
    name: 'Ulmo',
    vector: ['#1B4F6E', '#2D6F8E', '#4B8EAA', '#72AEC6', '#A1CDE0', '#D4ECF2'],
    individualFocus: 'Flow, Intuition, Emotional Depth/Process',
    communalFocus: 'Systemic Connection, Fluid Communication, Collective Rhythm',
  },
  {
    name: 'Nienna',
    vector: ['#8B8B9E', '#A2A2B8', '#BCBCD0', '#D6D6E4', '#ECECF0', '#F8F8FA'],
    individualFocus: 'Grief Processing, Self-Compassion, Emotional Release',
    communalFocus: 'Empathy, Shared Lament, Communal Witnessing of Pain',
  },

  // EARTH & CRAFT — Structure, Growth, Material Justice
  {
    name: 'Aulë',
    vector: ['#9C5D3A', '#B8784B', '#D29B6E', '#E6BE9A', '#F2DFC8', '#FAF2E8'],
    individualFocus: 'Structure, Competence, Mastery, Self-Efficacy',
    communalFocus: 'Functional Systems, Reliable Infrastructure, Shared Resources',
  },
  {
    name: 'Yavanna',
    vector: ['#3B6E47', '#5B8C63', '#7DAA80', '#A4C8A4', '#CCE3CC', '#EDF5E8'],
    individualFocus: 'Nourishment, Health, Embodiment, Personal Vitality',
    communalFocus: 'Ecosystemic Balance, Resource Management, Shared Generativity',
  },
  {
    name: 'Vána',
    vector: ['#A8B84C', '#C0CC6E', '#D4DD94', '#E8EDBC', '#F2F5DE', '#F9FAD8'],
    individualFocus: 'Vibrant Life, Uninhibited Joy, Radiance',
    communalFocus: 'Cultivating Beauty, Aesthetic Generosity, Collective Flourishing',
  },

  // TIME & FATE — Memory, Consequence, Continuity
  {
    name: 'Mandos',
    vector: ['#5C4B6E', '#7A6790', '#9B88AE', '#BBAECE', '#D9D2E5', '#F0ECF2'],
    individualFocus: 'Finality, Acceptance, Non-Attachment, Reckoning',
    communalFocus: 'Justice, Accountability, Collective Reckoning',
  },
  {
    name: 'Vairë',
    vector: ['#3A6B6B', '#5E8A8A', '#86ACAC', '#B0C8C8', '#D4E4E4', '#EEF4F4'],
    individualFocus: 'Meaning-Making, Memory, Personal Narrative',
    communalFocus: 'Historiography, Cultural Record, Collective Identity/History',
  },

  // WILD & VITALITY — Instinct, Motion, Freedom
  {
    name: 'Oromë',
    vector: ['#4D6E3B', '#6B8F55', '#8EB073', '#B2CF9A', '#D5E6C4', '#F0F5E8'],
    individualFocus: 'Action, Ethical Defense, Clear Boundaries',
    communalFocus: 'Just Protection, Ethical Vigilance, Enforcing Shared Boundaries',
  },
  {
    name: 'Tulkas',
    vector: ['#E3752B', '#EB8F4D', '#F2AA74', '#F6C89E', '#FBE2CC', '#FEF2E8'],
    individualFocus: 'Strength, Vitality, Uncomplicated Physical Power',
    communalFocus: 'Collective Vigor, Energetic Defense, Uncomplicated Action',
  },
  {
    name: 'Nessa',
    vector: ['#D9626B', '#E27F88', '#EC9EA5', '#F2C0C4', '#F8E0E2', '#FDF2F2'],
    individualFocus: 'Joy, Rhythm, Embodied Movement, Play',
    communalFocus: 'Celebration, Shared Ritual, Collective Merriment',
  },

  // DREAM & REST — Vision, Healing, Inner Worlds
  {
    name: 'Irmo',
    vector: ['#845A9E', '#9E7AB8', '#BB9ED4', '#D4C2E8', '#ECE2F4', '#F8F4FC'],
    individualFocus: 'Imagination, Creative Expression, Vision',
    communalFocus: 'Shared Myth, Collective Dreamscape, Cultural Articulation',
  },
  {
    name: 'Estë',
    vector: ['#5A9C8E', '#7BB5A8', '#9ECCC0', '#C2E0D6', '#E2F0EA', '#F2F8F5'],
    individualFocus: 'Restoration, Sanctuary, Deep Peace, Sleep',
    communalFocus: 'Collective Healing, Safe Space creation, Non-Violent Refuge',
  },

  // SHADOW & ENTROPY — Corruption, Decay, Burnout
  {
    name: 'Melkor',
    vector: ['#5C2E2E', '#7E4646', '#A06464', '#C28A8A', '#E2B8B8', '#F2E0E0'],
    individualFocus: 'Raw Power, Sovereignty, Radical Self-Will',
    communalFocus: 'Disruptive Innovation, Challenging Orthodoxy, Unconstrained Creation',
  },
  {
    name: 'Ungoliant',
    vector: ['#1E1E2A', '#3A3A50', '#5C5C78', '#8585A0', '#B3B3C8', '#DCDCE8'],
    individualFocus: 'Fixed Corruption, Despair, Self-Domination',
    communalFocus: 'Oppression, Nihilism, Systematic Destruction (Need for release)',
  },
];

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

interface ValarBreathingLogoProps {
  children: React.ReactNode;
  enabled?: boolean;
  selectedValarIndices?: number[]; // empty array = all colors in sequence, array with indices = only those colors
  opacity?: number; // 0.1 to 1.0
  logoSize?: number; // Size of the logo to match breathing animation to
  cycleDuration?: number; // seconds for one complete breath cycle
  technique?: BreathingTechnique | null; // overrides the default even 40/50/50/... timing shape
  cvMode?: string; // colorblind mode key into CB_FILTERS
  /** Shared clock anchor (ms epoch) so this animation's phase matches the
   *  numeric breathing counter instead of timing itself from whenever this
   *  component happened to last mount. */
  cycleStart?: number;
}

export function ValarBreathingLogo({
  children,
  enabled = true,
  selectedValarIndices = [],
  opacity = 0.75,
  logoSize = 200,
  cycleDuration = 10,
  technique = null,
  cvMode = '',
  cycleStart,
}: ValarBreathingLogoProps) {
  // Build array of all 96 colors (16 Valar × 6 colors each) in order
  const allColors: string[] = [];
  valarColors.forEach((valar) => {
    valar.vector.forEach((color) => {
      allColors.push(color);
    });
  });

  // Total animation cycle = 96 colors × cycleDuration seconds each
  const totalDuration = allColors.length * cycleDuration;

  // Derive the breath's expand/hold/contract/hold shape from the technique's phase
  // fractions (ih/hi/ex/ho in ms); falls back to an even 4-phase split when none is set.
  const totalMs = technique ? technique.ih + (technique.hi || 0) + technique.ex + (technique.ho || 0) : cycleDuration * 1000;
  const t1 = technique ? technique.ih / totalMs : 0.5;
  const t2 = technique ? (technique.ih + (technique.hi || 0)) / totalMs : 0.5;
  const t3 = technique ? (technique.ih + (technique.hi || 0) + technique.ex) / totalMs : 1;
  const times = [0, t1, t2, t3, 1];

  const cvFilter = cvMode && CB_FILTERS[cvMode] ? CB_FILTERS[cvMode] : undefined;

  // How far into the shared cycle we already are, so a remount (triggered
  // by the key below) resumes at the correct phase instead of restarting
  // the pulse from scratch -- this is what keeps it aligned with the
  // numeric counter even when opacity/colorblind-mode/etc. change.
  const elapsedSec = cycleStart != null ? ((Date.now() - cycleStart) / 1000) % totalDuration : 0;

  return (
    <div className="flex items-center justify-center p-8 sm:p-12">
      <div
        // Only remount for changes that actually alter the animation's
        // structure or timing shape (on/off, which colors render, the
        // technique's phase proportions). Opacity and colorblind mode are
        // plain style changes and must NOT restart the pulse -- they used
        // to be in this key, which is what caused the visual to fall out
        // of sync with the counter whenever either was adjusted.
        key={`valar-breathing-${enabled}-${selectedValarIndices.join(',')}-${
          technique ? `${technique.ih}_${technique.hi || 0}_${technique.ex}_${technique.ho || 0}` : cycleDuration
        }`}
        className="relative"
        style={{
          width: logoSize,
          height: logoSize,
          // Reserve space for scale(1.5) breathing without producing a square overflow region
          overflow: 'visible',
          filter: cvFilter,
        }}
      >
        {/* Breathing animation - cycles through all 96 colors sequentially */}
        {enabled && allColors.map((color, index) => {
          return (
            <motion.div
              key={`breath-${index}`}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: logoSize,
                height: logoSize,
                left: 0,
                top: 0,
                // Use closest-side so 100% is at the circle edge, then keep colors fully transparent past that
                // This prevents square corner artifacts when the box is scaled/transformed
                background: `radial-gradient(circle closest-side, transparent 0%, transparent 30%, ${hexToRgba(color, opacity * 0.08)} 50%, ${hexToRgba(color, opacity * 0.15)} 70%, ${hexToRgba(color, opacity * 0.25)} 90%, ${hexToRgba(color, opacity * 0.4)} 99%, transparent 100%)`,
                borderRadius: '50%',
                zIndex: 1,
                willChange: 'transform, opacity',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
              initial={{ scale: 0.1, opacity: 0 }}
              animate={{
                scale: [0.1, 1.0, 1.0, 0.1, 0.1],
                opacity: [0, opacity * 0.6, opacity * 0.6, 0, 0],
              }}
              transition={{
                duration: cycleDuration,
                repeat: Infinity,
                times,
                ease: "linear",
                // Negative delay is intentional -- Framer Motion starts the
                // animation partway through when this is negative, which is
                // what lets a fresh mount resume mid-cycle instead of
                // restarting at phase 0.
                delay: index * cycleDuration - elapsedSec,
                repeatDelay: totalDuration - cycleDuration,
              }}
            />
          );
        })}

        {/* Content (logo with orbs) - centered and above breathing */}
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