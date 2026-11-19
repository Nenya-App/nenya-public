import { useId, useState } from 'react';
import { BREATH_LIMITS, PHASE_KEYS, paceLabel, secondsOf, validateCustom, type CustomSeconds } from '../../lib/breathCustom';
import type { BreathingTechnique } from '../../lib/breathingPresets';

// "Set your own pace" (owner, 2026-11-18): four whole-second numbers inside stated limits, applied only when Apply is pressed, so a half-typed number never changes the breathing. The pace is kept with
// the other display settings on this device only when "Remember on this device" is on (the same preference as the presets). What the numbers add up to is said in words before it is applied.
export function CustomBreath({ technique, onApply, steady }: { technique: BreathingTechnique | null; onApply: (t: BreathingTechnique) => void; steady: BreathingTechnique }) {
  const base = technique ?? steady;
  const [draft, setDraft] = useState<Record<string, string>>(() => Object.fromEntries(PHASE_KEYS.map((k) => [k, String(secondsOf(base)[k])])));
  const [applied, setApplied] = useState('');
  const id = useId();
  const check = validateCustom(draft);
  const set = (k: string, v: string) => { setDraft({ ...draft, [k]: v }); setApplied(''); };
  const apply = () => { if (check.technique) { onApply(check.technique); setApplied(`Applied: ${paceLabel(check.technique)} seconds, ${check.perMinute} breaths a minute.`); } };
  const reset = () => { const s = secondsOf(steady) as CustomSeconds; setDraft(Object.fromEntries(PHASE_KEYS.map((k) => [k, String(s[k])]))); onApply(steady); setApplied(`Back to the default: ${paceLabel(steady)} seconds.`); };
  return (
    <details className="mt-3 rounded-md border border-border p-3">
      <summary className="flex min-h-11 cursor-pointer items-center text-xs font-medium underline underline-offset-4">Set your own pace</summary>
      <div className="mt-2 space-y-3">
        <p className="text-xs text-muted-foreground">Whole seconds. Nothing changes until you press Apply.</p>
        <p className="text-xs">Stop and return to normal breathing if you feel dizzy or lightheaded. If a pace feels too long, shorten it and build up gradually. If you have asthma, COPD, a heart or lung condition, or specific symptoms, check with a healthcare professional first.</p>
        <div className="grid grid-cols-2 gap-3">
          {PHASE_KEYS.map((k) => (
            <div key={k} className="space-y-1">
              <label htmlFor={`${id}-${k}`} className="block text-xs">{BREATH_LIMITS[k].label}</label>
              <input id={`${id}-${k}`} type="number" inputMode="numeric" min={BREATH_LIMITS[k].min} max={BREATH_LIMITS[k].max} step={1} value={draft[k]} onChange={(e) => set(k, e.target.value)}
                aria-describedby={`${id}-help`} className="h-11 w-full rounded-md border border-border bg-background px-2 text-sm" />
              <span className="block text-xs text-muted-foreground">{BREATH_LIMITS[k].min} to {BREATH_LIMITS[k].max} seconds</span>
            </div>
          ))}
        </div>
        <p id={`${id}-help`} className="text-xs text-muted-foreground">One whole breath: {BREATH_LIMITS.cycle.min} to {BREATH_LIMITS.cycle.max} seconds.</p>
        <div role="status" aria-live="polite" className="space-y-1 text-xs">
          {check.ok ? <p>This pace: {paceLabel(check.technique!)} seconds, one breath every {check.cycleS} seconds, about {check.perMinute} breaths a minute.</p> : check.problems.map((p) => <p key={p}>{p}</p>)}
          {applied && <p className="font-medium">{applied}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={apply} disabled={!check.ok} className="min-h-11 rounded-md border border-border bg-primary px-4 text-sm text-primary-foreground disabled:opacity-50">Apply</button>
          <button type="button" onClick={reset} className="min-h-11 rounded-md border border-border px-4 text-sm">Back to the default</button>
        </div>
      </div>
    </details>
  );
}
