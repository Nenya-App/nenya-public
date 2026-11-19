import { useState } from 'react';
import { Button } from './ui/button';
import { WORD_HELP_COPY, cleanLookupWord, wordHelpOn, type LookupResult } from '../../lib/wordHelp';

// The online half of word help (docs/word-help-scope.md): where the site has it on, a look-up that sends the ONE word typed, only when this button is pressed, through our server to a dictionary and
// a thesaurus. The button says exactly what is sent. The near words from this device come first and by themselves (see WordPicker); only this needs an opt-in, because only this leaves the device.
export function OnlineLookup({ word: raw, onUse }: { word: string; onUse: (word: string) => void }) {
  const word = cleanLookupWord(raw);
  const [online, setOnline] = useState<LookupResult | null>(null);
  const [state, setState] = useState<'idle' | 'asking' | 'failed'>('idle');
  if (!wordHelpOn()) return null;
  const lookUp = async () => {
    if (!word || state === 'asking') return;
    setState('asking');
    try {
      const res = await fetch('/api/words', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ word, lang: 'en' }) });
      if (!res.ok) throw new Error(String(res.status));
      const j = (await res.json()) as LookupResult;
      setOnline({ words: Array.isArray(j.words) ? j.words : [], meaning: typeof j.meaning === 'string' ? j.meaning : null, sources: Array.isArray(j.sources) ? j.sources : [] });
      setState('idle');
    } catch { setOnline(null); setState('failed'); }
  };
  return (
    <div className="space-y-2">
      <Button type="button" size="sm" variant="outline" onClick={lookUp} disabled={!word || state === 'asking'} className="min-h-11">{state === 'asking' ? 'Looking…' : WORD_HELP_COPY.lookup}</Button>
      {word && <p className="text-xs text-muted-foreground">{WORD_HELP_COPY.sends(word)}</p>}
      <div role="status" aria-live="polite" className="space-y-2">
        {state === 'failed' && <p className="text-sm">{WORD_HELP_COPY.failed}</p>}
        {online && (
          <div className="space-y-2">
            {online.meaning && <p className="text-sm"><strong>Meaning</strong> ({online.sources.join(' and ')}): {online.meaning}</p>}
            {online.words.length > 0 && (
              <ul className="flex flex-wrap gap-1.5" aria-label="Words to add">
                {online.words.map((w) => <li key={w}><button type="button" onClick={() => onUse(w)} className="min-h-11 rounded-full border border-border bg-muted px-3 py-1 text-xs hover:bg-muted/70">Add {w}</button></li>)}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
