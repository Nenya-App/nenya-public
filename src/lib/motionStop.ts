// "Stop motion": one press stops the decorative movement of the logo, and a second press (Resume motion) brings back what the visitor had (owner, 2026-11-22).
// The stopped state is a display setting of its own (`motionStopped`, src/lib/deviceMemory.ts). It wins over every individual motion setting WITHOUT changing them: the
// pure function below says what moves, from all the motion settings plus the stopped state, so Resume has nothing to restore.
//
// What it stops (the decorative movement):
//   the leaves' sway; the inner lights' turning, rising and fading (they hold still, drawn); the gem's kaleidoscope (the stone holds its plain cut);
//   the outer orbs' size pulse and slow turn, and the turning of their ring; the glow round the outer orbs (its slow swell, and the swell when the logo is hovered).
// What it keeps:
//   the breathing guidance. The breath ring is the visual cue for the breath, so it keeps its rhythm (it grows and fades with the breath); the counter and its words and the
//   breathing tones are untouched. A visitor who wants the ring still as well can use the Breathing Emanation switch. Colours keep changing slowly (a fade, not a movement):
//   the orbs' and halos' colours and the gem's tint.
// The device's own request for reduced motion does the same as stopped, and the button then shows as stopped and cannot be pressed.
import type { InnerOrbMode } from './logoLook.ts';

export interface MotionSettings {
  /** The visitor pressed Stop motion. */
  stopped: boolean;
  /** The device asks for reduced motion. */
  reducedMotion: boolean;
  leafSway: boolean;
  kaleidoscope: boolean;
  innerLights: InnerOrbMode;
}
export interface MotionPlan {
  /** Whether the decorative motion is held still, by the visitor or by the device. */
  held: boolean;
  /** What the logo may do now. */
  leafSway: boolean;
  kaleidoscope: boolean;
  /** The inner lights as drawn: Hidden stays hidden; Moving becomes Still while held. */
  innerLights: InnerOrbMode;
  /** The outer orbs' pulse and turn, the turn of their ring, and the glow's swell. */
  outerOrbsMove: boolean;
  glowSwells: boolean;
  /** The breath ring and the counter: always as the breath settings say. */
  breathGuidance: true;
}

export function motionPlan(s: MotionSettings): MotionPlan {
  const held = s.stopped || s.reducedMotion;
  return {
    held,
    leafSway: s.leafSway && !held,
    kaleidoscope: s.kaleidoscope && !held,
    innerLights: held && s.innerLights === 'moving' ? 'still' : s.innerLights,
    outerOrbsMove: !held,
    glowSwells: !held,
    breathGuidance: true,
  };
}

/** The words for the button and the live message. */
export const motionButtonLabel = (stopped: boolean): string => (stopped ? 'Resume motion' : 'Stop motion');
export const motionMessage = (stopped: boolean): string => (stopped ? 'Motion stopped' : 'Motion resumed');
export const MOTION_STOPPED_STATUS = 'Motion stopped';
export const MOTION_REDUCED_REASON = 'Your device asks for reduced motion, so motion is already stopped.';
