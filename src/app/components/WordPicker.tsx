import { useId, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { TermInfo } from './TermInfo';
import { SENSE_WORDS, type SenseCategory } from '../../lib/senseWords';

interface WordPickerProps {
  category: SenseCategory;
  /** The words chosen so far. */
  selected: string[];
  /** Called with a word when it is chosen or unchosen. */
  onToggle: (term: string) => void;
  /** Keeps ids apart where the same list appears twice on a page (current and wish). */
  idPrefix: string;
  /** A word or phrase of the person's own. Optional: not every list has one. */
  other?: { value: string; onChange: (value: string) => void; placeholder?: string };
}

// One picker for every word list in the gateways: the words in labelled groups that open and close, a box to find a word, the words already chosen
// listed at the top (each can be taken off from there), and a place for a word of the person's own. Plain checkboxes and native disclosure
// elements, so the keyboard and screen readers work without extra code; nothing here depends on a pointer, a color or a scroll box.
export function WordPicker({ category, selected, onToggle, idPrefix, other }: WordPickerProps) {
  const groups = SENSE_WORDS[category];
  const [query, setQuery] = useState('');
  const findId = useId();
  const q = query.trim().toLowerCase();
  // Which groups start open: those with a word already chosen. Fixed at the start, so a group does not close under the person's hand when the last word in it is unchosen.
  const [startOpen] = useState(() => new Set(groups.filter((g) => g.words.some((w) => selected.includes(w.term))).map((g) => g.label)));

  const shown = useMemo(
    () =>
      groups
        .map((g) => ({ label: g.label, words: q ? g.words.filter((w) => w.term.toLowerCase().includes(q)) : g.words }))
        .filter((g) => g.words.length > 0),
    [groups, q],
  );
  const matches = shown.reduce((n, g) => n + g.words.length, 0);

  return (
    <div className="space-y-3" role="group">
      {/* The words chosen, always visible, so they need not be hunted for in closed groups. */}
      <div aria-live="polite" className="min-h-6 text-sm">
        {selected.length === 0 ? (
          <span className="text-muted-foreground">No words chosen yet. Choosing none is fine.</span>
        ) : (
          <ul className="flex flex-wrap gap-1.5" aria-label={`Chosen words (${selected.length})`}>
            {selected.map((t) => (
              <li key={t}>
                <button
                  type="button"
                  onClick={() => onToggle(t)}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-xs hover:bg-muted/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  aria-label={`${t}, chosen. Press to remove.`}
                >
                  {t}
                  <X className="size-3" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label htmlFor={`${idPrefix}-${findId}`} className="mb-1 block text-xs text-muted-foreground">
          Find a word
        </label>
        <Input
          id={`${idPrefix}-${findId}`}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Start typing..."
          className="h-9 text-sm"
          autoComplete="off"
        />
        {q && (
          <p className="mt-1 text-xs text-muted-foreground" role="status">
            {matches === 0 ? 'No word matches. You can add your own below.' : `${matches} ${matches === 1 ? 'word matches' : 'words match'}.`}
          </p>
        )}
      </div>

      <div className="space-y-2">
        {shown.map((g) => {
          const chosenHere = g.words.filter((w) => selected.includes(w.term)).length;
          return (
            // Reopened fresh when the search starts or stops, and open at the start if a word in it is already chosen.
            <details key={`${g.label}-${q ? 'find' : 'all'}`} open={q || startOpen.has(g.label) ? true : undefined} className="rounded-md border border-border">
              <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2">
                <span>{g.label}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {g.words.length} {g.words.length === 1 ? 'word' : 'words'}
                  {chosenHere > 0 ? `, ${chosenHere} chosen` : ''}
                </span>
              </summary>
              <ul className="grid gap-x-4 px-3 pb-3 sm:grid-cols-2">
                {g.words.map((w) => {
                  const id = `${idPrefix}-${w.term.replace(/[^a-z0-9]+/gi, '-')}`;
                  return (
                    <li key={w.term} className="flex min-h-10 items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Checkbox id={id} checked={selected.includes(w.term)} onCheckedChange={() => onToggle(w.term)} />
                        <label htmlFor={id} className="cursor-pointer py-1 text-sm">
                          {w.term}
                        </label>
                      </div>
                      <TermInfo term={w.term} category={category} />
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        })}
      </div>

      {other && (
        <div>
          <label htmlFor={`${idPrefix}-other`} className="mb-1 block text-xs text-muted-foreground">
            A word of your own (optional)
          </label>
          <Input
            id={`${idPrefix}-other`}
            value={other.value}
            onChange={(e) => other.onChange(e.target.value)}
            placeholder={other.placeholder ?? 'Describe...'}
            className="h-9 text-sm"
          />
        </div>
      )}
    </div>
  );
}
