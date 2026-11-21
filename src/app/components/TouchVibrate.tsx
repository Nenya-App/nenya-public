import { useState } from 'react';
import { Button } from './ui/button';
import { vibrationPattern, type OrbValues } from '../../lib/touchOrb';

// The optional vibration for Touch (tray): shown only where the device can vibrate, off until chosen, and the words always say the same. Nothing happens under reduced motion.
export function TouchVibrate({ values }: { values: OrbValues }) {
  const can = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
  const reduce = typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [on, setOn] = useState(false);
  const [said, setSaid] = useState('');
  if (!can) return null;
  const { pattern, says } = vibrationPattern(values);
  return (
    <fieldset className="space-y-2 rounded-md border border-border p-3">
      <legend className="px-1 text-sm">Vibration (optional, only if your device can)</legend>
      <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={on} onChange={(e) => { setOn(e.target.checked); if (!e.target.checked) { navigator.vibrate(0); setSaid(''); } }} /> Let me feel it as a vibration</label>
      <Button type="button" size="sm" variant="outline" className="min-h-11" onClick={() => { if (!on) { setSaid('Switch the vibration on first.'); return; } if (reduce) { setSaid('Your device asks for less motion, so nothing vibrates. ' + says); return; } navigator.vibrate(pattern); setSaid(says); }}>Try the vibration</Button>
      <p role="status" aria-live="polite" className="text-xs text-muted-foreground">{said}</p>
    </fieldset>
  );
}
