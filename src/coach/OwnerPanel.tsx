import { useState } from 'react';
import { startPause } from '../lib/pause';
import { clearOwner, hasOwnerToken, panelVisible, readSettings, saveToken, writeSettings, type OwnerSettings } from '../lib/ownerPanel';

// The owner's testing panel on /coach: skip the rest period, and switch the added distress sentences and the instruction wording for the
// next messages (they take effect only with the owner's token, which the coach checks). It shows only in the owner's browser (a token or the
// rest flag is saved there) or when the address ends in ?owner. Nothing here is shown to or changes anything for a visitor.
export default function OwnerPanel() {
  const [visible] = useState(() => (typeof window === 'undefined' ? false : panelVisible(window.location.search)));
  const [s, setS] = useState<OwnerSettings>(() => readSettings());
  const [token, setToken] = useState('');
  const [hasToken, setHasToken] = useState(() => hasOwnerToken());
  if (!visible) return null;

  const change = (patch: Partial<OwnerSettings>) => {
    const next = { ...s, ...patch };
    setS(next);
    writeSettings(next);
  };
  const radio = <K extends 'distressText' | 'instructions'>(key: K, label: string, options: [OwnerSettings[K], string][]) => (
    <fieldset className="space-y-1">
      <legend className="text-xs text-muted-foreground">{label}</legend>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {options.map(([value, text]) => (
          <label key={value} className="flex items-center gap-1 text-xs">
            <input type="radio" name={`owner-${key}`} checked={s[key] === value} onChange={() => change({ [key]: value } as Partial<OwnerSettings>)} />
            {text}
          </label>
        ))}
      </div>
    </fieldset>
  );

  return (
    <details className="fixed bottom-3 left-3 z-40 max-w-[16rem] rounded-lg border border-border bg-card p-2 text-sm shadow-md">
      <summary className="cursor-pointer text-xs text-muted-foreground">Owner panel</summary>
      <div className="mt-2 space-y-3">
        <label className="flex items-start gap-2 text-xs">
          <input type="checkbox" className="mt-0.5" checked={s.skipRest} onChange={(e) => change({ skipRest: e.target.checked })} />
          <span>Skip the six-hour rest after a conversation (this browser)</span>
        </label>
        <div className="space-y-1">
          <label htmlFor="owner-token" className="text-xs text-muted-foreground">
            Owner token {hasToken ? '(saved in this browser)' : '(not set: the switches below do nothing)'}
          </label>
          <div className="flex gap-2">
            <input id="owner-token" type="password" autoComplete="off" value={token} onChange={(e) => setToken(e.target.value)} className="min-w-0 flex-1 rounded border border-border bg-background px-2 py-1 text-xs" />
            <button type="button" className="rounded border border-border px-2 py-1 text-xs" onClick={() => { saveToken(token); setToken(''); setHasToken(hasOwnerToken()); }}>
              Save
            </button>
          </div>
        </div>
        {radio('distressText', 'Sentences the site adds after a flagged reply', [['site', "Site's setting"], ['on', 'On'], ['off', 'Off']])}
        {radio('instructions', 'Coach instruction wording', [['site', "Site's setting"], ['v1', 'v1 (live)'], ['v2', 'v2 (new)']])}
        <button
          type="button"
          className="rounded border border-border px-2 py-1 text-xs"
          onClick={() => { startPause(); window.location.reload(); }}
        >
          Start a 10-minute pause now (to see the pause screen and quiz)
        </button>
        <p className="text-xs text-muted-foreground">Applies to the next message you send. It is never shown to visitors.</p>
        <button
          type="button"
          className="text-xs text-muted-foreground underline underline-offset-4"
          onClick={() => { clearOwner(); setS(readSettings()); setHasToken(false); }}
        >
          Clear the token and these settings
        </button>
      </div>
    </details>
  );
}
