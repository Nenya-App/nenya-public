import { useEffect, useMemo, useState } from 'react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { valarColors } from './ValarBreathingLogo';
import { useKeptPalettes } from '../../lib/keptPalettes';
import { setLeafSway, useLeafSway } from '../../lib/deviceMemory';
import { readLeafCapability, swayBlockedReason } from '../../lib/leafMotion';
import {
  PALETTE_NAMES,
  PRESETS,
  colourChoiceDetail,
  colourChoiceLabel,
  colourChoiceSwatches,
  resolveColours,
  savedChoicesFor,
} from '../../lib/logoColours';

// Two more parts of the Logo look group in the settings panel (docs/logo-look.md): the leaves' gentle sway, and the colour choices for the breath and the orbs.
// Both are kept like the other display settings (src/lib/deviceMemory.ts) and shown at once in the logo.

/** Why the leaves cannot sway now, re-read when the device's reduced-motion setting changes ('' when they can). */
function useSwayBlocked(breathingEnabled: boolean): string {
  const [reason, setReason] = useState('');
  useEffect(() => {
    const update = () => setReason(swayBlockedReason(breathingEnabled, readLeafCapability()));
    update();
    const q = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    q?.addEventListener?.('change', update);
    return () => q?.removeEventListener?.('change', update);
  }, [breathingEnabled]);
  return reason;
}

/** The sway switch. Off by default. It can be turned on only where motion is allowed; where it is not, the switch is off and says why. */
export function LeafSwaySwitch({ breathingEnabled, onMessage }: { breathingEnabled: boolean; onMessage: (m: string) => void }) {
  const wish = useLeafSway();
  const blocked = useSwayBlocked(breathingEnabled);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="leaf-sway-toggle" className="cursor-pointer text-sm">Leaves sway gently</Label>
        <Switch
          id="leaf-sway-toggle"
          checked={wish && !blocked}
          disabled={!!blocked}
          onCheckedChange={(on) => {
            setLeafSway(on);
            onMessage(on ? 'The leaves now sway gently.' : 'The leaves now stay still.');
          }}
          aria-describedby="leaf-sway-help"
        />
      </div>
      <p id="leaf-sway-help" className="text-xs text-muted-foreground">
        The leaves rock very slightly, as in a gentle breeze, about one degree and slowly (a full rock takes 18 seconds). Off by default.
        {blocked ? ` ${blocked}` : ''}
      </p>
    </div>
  );
}

/**
 * One group of colour choices (for the breath, or for the orbs). Original; a few named sets; one of the sixteen palettes; and, only while they exist,
 * the palettes the visitor made and kept in the Sight lens (one, the other, or both together). Every choice is named, and says in words which
 * palettes it is made of; the swatches beside the names are decoration.
 */
export function ColourChoiceGroup({
  legend,
  name,
  choice,
  onChoose,
  help,
}: {
  legend: string;
  /** The radio group's name, unique on the page. */
  name: string;
  choice: string;
  onChoose: (choice: string) => void;
  help: string;
}) {
  const kept = useKeptPalettes();
  const effective = useMemo(() => resolveColours(choice, valarColors, kept).choice, [choice, kept]);
  const saved = savedChoicesFor(kept);
  const helpId = `${name}-help`;
  const row = (id: string, detail: string) => (
    <label key={id} className="flex min-h-11 items-start gap-2 py-1 text-sm">
      <input type="radio" name={name} value={id} checked={effective === id} onChange={() => onChoose(id)} className="mt-1" aria-describedby={`${name}-${id.replace(/[^a-z0-9]/gi, '')}-d`} />
      <span>
        <span className="flex flex-wrap items-center gap-2">
          {colourChoiceLabel(id)}
          <span aria-hidden="true" className="inline-flex gap-0.5">
            {colourChoiceSwatches(id, valarColors, kept).map((hex, i) => (
              <span key={`${hex}-${i}`} className="inline-block size-3 rounded-sm border border-foreground/40" style={{ backgroundColor: hex }} />
            ))}
          </span>
        </span>
        <span id={`${name}-${id.replace(/[^a-z0-9]/gi, '')}-d`} className="block text-xs text-muted-foreground">{detail}</span>
      </span>
    </label>
  );
  const single = effective.startsWith('palette:') ? effective.slice('palette:'.length) : '';
  return (
    <fieldset className="space-y-1" aria-describedby={helpId}>
      <legend className="text-xs text-muted-foreground">{legend}</legend>
      <p id={helpId} className="text-xs text-muted-foreground">{help}</p>
      {row('original', colourChoiceDetail('original'))}
      {PRESETS.map((p) => row(`preset:${p.id}`, colourChoiceDetail(`preset:${p.id}`)))}
      <div className="flex min-h-11 flex-wrap items-center gap-2 py-1 text-sm">
        <label htmlFor={`${name}-one`}>One of the sixteen palettes</label>
        <select
          id={`${name}-one`}
          value={single}
          onChange={(e) => e.target.value && onChoose(`palette:${e.target.value}`)}
          className="min-h-11 rounded-md border border-border bg-background px-2 text-sm text-foreground"
        >
          {!single && <option value="">Choose one</option>}
          {PALETTE_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      {saved.length > 0 && (
        <>
          <p className="pt-1 text-xs text-muted-foreground">Palettes you made and kept in the Sight Lens (held for this visit only):</p>
          {saved.map((id) => row(id, colourChoiceDetail(id, kept)))}
        </>
      )}
    </fieldset>
  );
}
