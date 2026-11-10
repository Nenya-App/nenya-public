// "Make a palette from these colors" in the Sight gateway (docs/color-tools-scope.md). Optional, and made on the device unless the person chooses otherwise:
//  - a bridge from the current color to the wish color, and the same eight kinds of harmony The Color API offers, all computed here (no network);
//  - one online choice, "Ask The Color API", whose button says what is sent before it is pressed. If the service cannot be reached, the same kind of
//    palette is made on the device instead and the page says so. A palette the person keeps goes into their report as colors of their own, with its source.
// Every color is shown with its hex code, a plain description and a suggested name, and the result is announced to screen readers, so the palette can be used
// without seeing it.
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { bridge, describePalettePlainly, fetchScheme, localScheme, MODE_LABELS, SCHEME_MODES, type GeneratedPalette, type SchemeMode } from '../../lib/colorSchemes';
import { describePlainly, loadColorNames, suggestName } from '../../lib/colorNames';

interface PalettePanelProps {
  color1: string;
  color2: string;
  value: GeneratedPalette | null;
  onChange: (next: GeneratedPalette | null) => void;
}

type Draft = Omit<GeneratedPalette, 'colors'> & { colors: string[] };

export function PalettePanel({ color1, color2, value, onChange }: PalettePanelProps) {
  const [mode, setMode] = useState<SchemeMode>('analogic');
  const [base, setBase] = useState<'present' | 'wish'>('present');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [names, setNames] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [said, setSaid] = useState('');

  // New colors make an old draft stale.
  useEffect(() => { setDraft(null); setNotice(''); setSaid(''); }, [color1, color2]);

  const show = async (d: Draft, lead: string) => {
    setDraft(d);
    let named: Record<string, string> = {};
    try {
      const list = await loadColorNames();
      for (const hex of d.colors) { const s = suggestName(hex, list); if (s) named[hex] = s.name; }
    } catch { /* the palette is still shown, with hex codes and plain descriptions */ }
    setNames(named);
    setSaid(`${lead} ${d.colors.map((h, i) => `${i + 1}: ${named[h] ? named[h] + ', ' : ''}${describePlainly(h)}`).join('. ')}.`);
  };

  const makeBridge = () => { setNotice(''); void show({ source: 'device', kind: 'bridge', colors: bridge(color1, color2) }, 'A bridge from your current color to your wish color. Five colors.'); };
  const makeLocal = () => { setNotice(''); void show({ source: 'device', kind: mode, base, colors: localScheme(base === 'wish' ? color2 : color1, mode) }, `${MODE_LABELS[mode].label}, made on your device. Five colors.`); };
  const askOnline = async () => {
    setBusy(true);
    setNotice('');
    const seed = base === 'wish' ? color2 : color1;
    try {
      const colors = await fetchScheme(seed, mode);
      await show({ source: 'The Color API', kind: mode, base, colors }, `${MODE_LABELS[mode].label}, from The Color API. ${colors.length} colors.`);
    } catch {
      setNotice('The Color API is not available right now, so this one was made on your device instead.');
      await show({ source: 'device', kind: mode, base, colors: localScheme(seed, mode) }, `${MODE_LABELS[mode].label}, made on your device because The Color API was not available. Five colors.`);
    } finally {
      setBusy(false);
    }
  };

  // Every color is kept with its suggested name, so the report names the colors of the palette (the names were found when it was shown; any that are
  // missing are found now).
  const keep = async () => {
    if (!draft) return;
    let all = names;
    if (draft.colors.some((hex) => !names[hex])) {
      try {
        const list = await loadColorNames();
        all = { ...names };
        for (const hex of draft.colors) if (!all[hex]) { const s = suggestName(hex, list); if (s) all[hex] = s.name; }
      } catch { /* the report then carries hex codes for those */ }
    }
    onChange({ source: draft.source, kind: draft.kind, ...(draft.base ? { base: draft.base } : {}), colors: draft.colors.map((hex) => ({ hex, ...(all[hex] ? { name: all[hex] } : {}) })) });
    setSaid('Palette kept in your report, with the names of its colors.');
  };

  return (
    <details className="rounded-2xl border border-border bg-card/50 p-4">
      <summary className="cursor-pointer text-sm text-foreground">Make a palette from these colors (optional)</summary>
      <div className="mt-3 space-y-4 text-sm text-muted-foreground">
        <p>A palette is only another way to look at your colors. It does not say anything about you, and no color has a fixed meaning. Nothing here is needed to continue.</p>

        <div className="space-y-2">
          <p className="text-foreground">A bridge from where you are to where you wish to be</p>
          <Button type="button" size="sm" variant="outline" onClick={makeBridge}>Make a bridge</Button>
          <p className="text-xs">Made on your device. Five colors, from your current color to your wish color.</p>
        </div>

        <div className="space-y-2">
          <p className="text-foreground">A palette around one of your colors</p>
          <div className="flex flex-wrap items-end gap-3">
            <label className="space-y-1">
              <span className="block text-xs">Around</span>
              <select value={base} onChange={(e) => setBase(e.target.value as 'present' | 'wish')} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground">
                <option value="present">my current color</option>
                <option value="wish">my wish color</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="block text-xs">Kind</span>
              <select value={mode} onChange={(e) => setMode(e.target.value as SchemeMode)} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground">
                {SCHEME_MODES.map((m) => <option key={m} value={m}>{MODE_LABELS[m].label}</option>)}
              </select>
            </label>
          </div>
          <p className="text-xs">{MODE_LABELS[mode].blurb}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" size="sm" variant="outline" onClick={makeLocal}>Make it on my device</Button>
            <Button type="button" size="sm" variant="outline" onClick={askOnline} disabled={busy}>{busy ? 'Asking…' : 'Ask The Color API'}</Button>
          </div>
          <p className="text-xs">
            Making it on your device sends nothing anywhere. &ldquo;Ask The Color API&rdquo; sends this one color, as a hex code, through our server to The Color API
            (thecolorapi.com, by Josh Beckman), a service we do not control. Nothing else is sent, and we store nothing.
          </p>
        </div>

        <p role="status" aria-live="polite" className="sr-only">{said}</p>
        {notice && <p role="status" className="text-xs text-foreground">{notice}</p>}

        {draft && (
          <div className="space-y-2">
            <p className="text-foreground">
              {draft.kind === 'bridge' ? 'A bridge from your current color to your wish color' : MODE_LABELS[draft.kind].label}
              <span className="text-muted-foreground">, {draft.source === 'The Color API' ? 'generated with The Color API' : 'made on your device'}</span>
            </p>
            <ol className="space-y-1.5">
              {draft.colors.map((hex) => (
                <li key={hex} className="flex items-center gap-3">
                  <span aria-hidden="true" className="size-8 shrink-0 rounded-md border border-border" style={{ backgroundColor: hex }} />
                  <span>
                    <span className="text-foreground">{names[hex] ?? describePlainly(hex)}</span>
                    <span className="text-xs"> {hex}{names[hex] ? `, ${describePlainly(hex)}` : ''}</span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" size="sm" onClick={keep}>Keep this palette in my report</Button>
              <button type="button" className="text-xs underline underline-offset-4 hover:text-foreground" onClick={() => setDraft(null)}>Discard</button>
            </div>
          </div>
        )}

        {value && (
          <p role="status" className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-foreground">
            In your report: {describePalettePlainly(value)}.{' '}
            <button type="button" className="underline underline-offset-4" onClick={() => onChange(null)}>Remove it</button>
          </p>
        )}
      </div>
    </details>
  );
}
