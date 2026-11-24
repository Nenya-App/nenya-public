import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { useReducedMotionNow } from './useReducedMotionNow';
import {
  setOuterRingBreathPaced,
  setOuterRingBreathTurn,
  setOuterRingDirection,
  setOuterRingSeconds,
  setOuterRingTurning,
  useMotionStopped,
  useOuterRingBreathPaced,
  useOuterRingBreathTurn,
  useOuterRingDirection,
  useOuterRingSeconds,
  useOuterRingTurning,
} from '../../lib/deviceMemory';
import {
  BREATH_TURN_DENOMINATORS,
  DEFAULT_OUTER_RING_SECONDS,
  OUTER_RING_MAX_SECONDS,
  OUTER_RING_MIN_SECONDS,
  OUTER_RING_STEP_SECONDS,
  breathPaceNote,
  breathTurnLabel,
  paceLabel,
  type BreathTurnDenominator,
} from '../../lib/outerRing';
import type { BreathingTechnique } from '../../lib/breathingPresets';

// "Outer ring movement" (owner, 2026-11-24; docs/outer-ring-movement.md): the choices for how the sixteen orbs at the edge of the breathing animation turn. They sit in the Logo look group beside the other
// Palette Orbit choices, apply at once, are kept only while "Remember on this device" is on, and are held still by Stop motion and by reduced motion.

export const OUTER_RING_LEGEND = 'Outer ring movement';

export function OuterRingControls({ technique, onMessage }: { technique?: BreathingTechnique | null; onMessage: (m: string) => void }) {
  const turning = useOuterRingTurning();
  const direction = useOuterRingDirection();
  const seconds = useOuterRingSeconds();
  const breathPaced = useOuterRingBreathPaced();
  const breathTurn = useOuterRingBreathTurn();
  const stopped = useMotionStopped();
  const reduced = useReducedMotionNow();
  const held = stopped || reduced;
  const off = !turning;
  return (
    <fieldset className="space-y-2" aria-describedby="outer-ring-help">
      <legend className="text-xs text-muted-foreground">{OUTER_RING_LEGEND}</legend>
      <p id="outer-ring-help" className="text-xs text-muted-foreground">
        The sixteen orbs at the edge of the animation can turn slowly round the logo. These choices are only about that ring.
        {held ? ' Motion is stopped right now, so the ring is still. These choices will apply when motion is back on.' : ''}
      </p>

      <fieldset className="space-y-1">
        <legend className="text-xs text-muted-foreground">Ring</legend>
        {([true, false] as const).map((v) => (
          <label key={String(v)} className="flex min-h-11 items-center gap-2 text-sm">
            <input type="radio" name="outer-ring-turning" value={v ? 'turning' : 'still'} checked={turning === v} onChange={() => { setOuterRingTurning(v); onMessage(v ? 'The outer ring now turns.' : 'The outer ring now stays still.'); }} />
            {v ? 'Turning' : 'Still'}
          </label>
        ))}
      </fieldset>

      <fieldset className="space-y-1" disabled={off}>
        <legend className="text-xs text-muted-foreground">Direction</legend>
        {([['ccw', 'Counter-clockwise'], ['cw', 'Clockwise']] as const).map(([v, label]) => (
          <label key={v} className="flex min-h-11 items-center gap-2 text-sm">
            <input type="radio" name="outer-ring-direction" value={v} checked={direction === v} disabled={off} onChange={() => { setOuterRingDirection(v); onMessage(`The outer ring now turns ${label.toLowerCase()}.`); }} />
            {label}
          </label>
        ))}
      </fieldset>

      <div className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-x-3">
          <label htmlFor="outer-ring-seconds" className="text-sm">Pace</label>
          <span id="outer-ring-seconds-value" className="text-xs text-foreground">{paceLabel(seconds)}</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="outer-ring-seconds"
            type="range"
            min={OUTER_RING_MIN_SECONDS}
            max={OUTER_RING_MAX_SECONDS}
            step={OUTER_RING_STEP_SECONDS}
            value={seconds}
            disabled={off || breathPaced}
            onChange={(e) => { setOuterRingSeconds(Number(e.target.value)); onMessage(`The outer ring now turns once every ${Number(e.target.value)} seconds.`); }}
            aria-valuetext={paceLabel(seconds)}
            aria-describedby="outer-ring-seconds-help"
            className="h-11 min-w-0 flex-1"
          />
          <button type="button" disabled={off || breathPaced || seconds === DEFAULT_OUTER_RING_SECONDS} onClick={() => { setOuterRingSeconds(DEFAULT_OUTER_RING_SECONDS); onMessage(`The outer ring pace is back to ${DEFAULT_OUTER_RING_SECONDS} seconds per turn.`); }} className="min-h-11 shrink-0 rounded-md border border-border px-2 text-xs disabled:opacity-80">Reset</button>
        </div>
        <p id="outer-ring-seconds-help" className="text-xs text-muted-foreground">
          {breathPaced
            ? 'This is off while "Pace to my breathing" is on, because the ring follows your breath instead.'
            : `Left is faster, right is slower. The fastest is ${OUTER_RING_MIN_SECONDS} seconds per turn (2 turns a minute), and the ring never goes faster than that. The standard pace is ${DEFAULT_OUTER_RING_SECONDS} seconds.`}
        </p>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="outer-ring-breath" className="cursor-pointer text-sm">Pace to my breathing</Label>
          <Switch id="outer-ring-breath" checked={breathPaced} disabled={off} onCheckedChange={(on) => { setOuterRingBreathPaced(on); onMessage(on ? 'The outer ring now follows your breathing.' : 'The outer ring now turns at a steady pace.'); }} aria-describedby="outer-ring-breath-help" />
        </div>
        <p id="outer-ring-breath-help" className="text-xs text-muted-foreground">
          The ring turns the same part of a turn with each full breath. It moves a little faster as you breathe in and eases as you breathe out, but it never stops. It follows whatever breathing pace you chose.
        </p>
        {breathPaced && !off && (
          <>
            <fieldset className="space-y-1">
              <legend className="text-xs text-muted-foreground">How far it turns with each breath</legend>
              {BREATH_TURN_DENOMINATORS.map((d) => (
                <label key={d} className="flex min-h-11 items-center gap-2 text-sm">
                  <input type="radio" name="outer-ring-breath-turn" value={d} checked={breathTurn === d} onChange={() => { setOuterRingBreathTurn(d); onMessage(`The outer ring now turns ${breathTurnLabel(d)} with each breath.`); }} />
                  {breathTurnLabel(d)}{d === 12 ? ' (standard)' : ''}
                </label>
              ))}
            </fieldset>
            <p id="outer-ring-breath-note" className="text-xs text-muted-foreground">{breathPaceNote(technique, breathTurn as BreathTurnDenominator)}</p>
          </>
        )}
      </div>
    </fieldset>
  );
}
