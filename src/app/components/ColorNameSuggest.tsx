// "Suggest a name" for a colour, in the Sight gateway (docs/color-tools-scope.md). The names are a bundled MIT list (color-name-list, David Aerne) loaded only
// when this is pressed; nothing is sent anywhere. The suggestion is announced to screen readers by default and says what the colour is in plain words, so for
// someone who cannot see it the words stand in for the colour. A name is only a suggestion: use it, change it, or keep your own.
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { describePlainly, loadColorNames, speakSuggestion, suggestName, type NameSuggestion } from '../../lib/colorNames';
import { describePalette } from '../../lib/paletteInfo';
import { paletteOfHex } from './paletteLookup';

interface ColorNameSuggestProps {
  /** What this colour is called on the page, for the announcement ("Current state", "Wish"). */
  label: string;
  hex: string;
  /** The person chose to use the suggested name as their own words. */
  onUse: (name: string) => void;
}

export function ColorNameSuggest({ label, hex, onUse }: ColorNameSuggestProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [suggestion, setSuggestion] = useState<NameSuggestion | null>(null);
  const [index, setIndex] = useState(0);
  const [said, setSaid] = useState('');

  // A different colour needs a fresh suggestion.
  useEffect(() => {
    setState('idle');
    setSuggestion(null);
    setIndex(0);
    setSaid('');
  }, [hex]);

  const ask = async () => {
    setState('loading');
    try {
      const list = await loadColorNames();
      const s = suggestName(hex, list);
      setSuggestion(s);
      setIndex(0);
      setState('ready');
      setSaid(speakSuggestion(label, hex, s));
    } catch {
      setState('error');
      setSaid(`${label}: ${describePlainly(hex)}. The name suggestions could not be loaded.`);
    }
  };

  const names = suggestion ? [suggestion.name, ...suggestion.others] : [];
  const current = names[index];
  const palette = paletteOfHex(hex);
  const stop = (e: { stopPropagation: () => void }) => e.stopPropagation(); // the card around this opens the colour picker when clicked

  return (
    <div className="space-y-2" onClick={stop}>
      <Button type="button" size="sm" variant="outline" onClick={ask} disabled={state === 'loading'}>
        {state === 'loading' ? 'Finding a name…' : state === 'ready' ? 'Suggest again' : 'Suggest a name'}
      </Button>
      {/* Announced by default: the suggestion, its plain description and how well it fits. */}
      <p role="status" aria-live="polite" className="sr-only">{said}</p>
      {state === 'ready' && current && (
        <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3 text-sm">
          <p>
            <span className="text-muted-foreground">{describePlainly(hex)}. A name that might fit: </span>
            <strong className="font-medium">{current}</strong>
            {index === 0 && suggestion && <span className="text-muted-foreground">{suggestion.closeness === 'close' ? ' (a close match)' : suggestion.closeness === 'rough' ? ' (a near match)' : ' (only a rough match)'}</span>}
          </p>
          {palette && <p className="text-xs text-muted-foreground">{describePalette(palette)}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" size="sm" onClick={() => onUse(current)}>Use this name</Button>
            {names.length > 1 && (
              <button
                type="button"
                className="text-xs underline underline-offset-4 hover:text-foreground"
                onClick={() => {
                  const next = (index + 1) % names.length;
                  setIndex(next);
                  setSaid(`Another name that might fit: ${names[next]}.`);
                }}
              >
                Another name
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Only a suggestion. Use it, change it, or keep your own words. The names come from a list kept with this site; nothing is sent anywhere.</p>
        </div>
      )}
      {state === 'error' && <p className="text-xs text-muted-foreground">The suggestions could not be loaded. You can still name or describe the color yourself.</p>}
    </div>
  );
}
