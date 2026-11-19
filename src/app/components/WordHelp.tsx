import { useId, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { WORD_HELP_COPY, cleanLookupWord, localNearWords, wordHelpOn, type LookupResult } from '../../lib/wordHelp';
import type { SenseCategory } from '../../lib/senseWords';

// Word help under "a word of your own" (docs/word-help-scope.md): near words from this site's own lists (nothing is sent), and, when the site has it on, a look-up that sends the ONE word
// typed, only when this button is pressed, through our server to a dictionary and a thesaurus. The button says exactly what is sent. A word picked is added to the person's own words.
export function WordHelp({ category, startWith, onUse }: { category: SenseCategory; startWith: string; onUse: (word: string) => void }) {
  const id = useId();
  const [typed, setTyped] = useState('');
  const word = cleanLookupWord(typed || startWith.split(/[,;]/).pop() || '');
  const [near, setNear] = useState<string[] | null>(null);
  const [online, setOnline] = useState<LookupResult | null>(null);
  const [state, setState] = useState<'idle' | 'asking' | 'failed'>('idle');

  const showNear = () => setNear(word ? localNearWords(word, category) : []);
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
  const chips = (words: string[]) => (
    <ul className="flex flex-wrap gap-1.5" aria-label="Words to use">
      {words.map((w) => <li key={w}><button type="button" onClick={() => onUse(w)} className="min-h-11 rounded-full border border-border bg-muted px-3 py-1 text-xs hover:bg-muted/70">{w}</button></li>)}
    </ul>
  );

  return (
    <details className="rounded-md border border-border p-3">
      <summary className="flex min-h-11 cursor-pointer items-center text-sm underline underline-offset-4">{WORD_HELP_COPY.summary}</summary>
      <div className="mt-2 space-y-3">
        <div>
          <label htmlFor={id} className="mb-1 block text-xs text-muted-foreground">{WORD_HELP_COPY.field}</label>
          <Input id={id} value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={startWith.trim() ? 'Uses your own word above, or type one' : 'Type one word'} className="h-9 text-sm" autoComplete="off" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={showNear} disabled={!word} className="min-h-11">{WORD_HELP_COPY.near}</Button>
          {wordHelpOn() && <Button type="button" size="sm" variant="outline" onClick={lookUp} disabled={!word || state === 'asking'} className="min-h-11">{state === 'asking' ? 'Looking…' : WORD_HELP_COPY.lookup}</Button>}
        </div>
        <p className="text-xs text-muted-foreground">{WORD_HELP_COPY.nearNote}{wordHelpOn() && word ? ` ${WORD_HELP_COPY.sends(word)}` : ''}</p>
        <div role="status" aria-live="polite" className="space-y-2">
          {near && (near.length ? chips(near) : <p className="text-sm text-muted-foreground">{WORD_HELP_COPY.none}</p>)}
          {state === 'failed' && <p className="text-sm">{WORD_HELP_COPY.failed}</p>}
          {online && (
            <div className="space-y-2">
              {online.meaning && <p className="text-sm"><strong>Meaning</strong> ({online.sources.join(' and ')}): {online.meaning}</p>}
              {online.words.length > 0 && chips(online.words)}
            </div>
          )}
        </div>
      </div>
    </details>
  );
}
