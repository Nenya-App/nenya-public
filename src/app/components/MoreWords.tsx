import { Checkbox } from './ui/checkbox';
import { TermInfo } from './TermInfo';
import { ORIGINAL_WORDS, SENSE_WORDS, type SenseCategory } from '../../lib/senseWords';

interface MoreWordsProps {
  category: Extract<SenseCategory, 'taste' | 'scent'>;
  selected: string[];
  onToggle: (term: string) => void;
  /** Keeps checkbox ids apart where the same list appears twice on a page. */
  idPrefix: string;
}

// The wheel shows the words the list began with; the rest of the words are here, grouped, in a list that opens when asked for. A word picked
// here is stored exactly as a word picked on the wheel, so the two are one selection.
export function MoreWords({ category, selected, onToggle, idPrefix }: MoreWordsProps) {
  const original = new Set(ORIGINAL_WORDS[category]);
  const groups = SENSE_WORDS[category]
    .map((g) => ({ label: g.label, words: g.words.filter((w) => !original.has(w.term)) }))
    .filter((g) => g.words.length > 0);
  const picked = selected.filter((t) => !original.has(t)).length;
  return (
    <details className="rounded-md border border-border px-3 py-2">
      <summary className="cursor-pointer text-xs text-muted-foreground">
        More words{picked > 0 ? ` (${picked} chosen)` : ''}
      </summary>
      <div className="mt-2 max-h-64 space-y-3 overflow-y-auto">
        {groups.map((g) => (
          <fieldset key={g.label} className="space-y-1">
            <legend className="text-[11px] font-medium text-muted-foreground">{g.label}</legend>
            {g.words.map((w) => (
              <div key={w.term} className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id={`${idPrefix}-${w.term}`} checked={selected.includes(w.term)} onCheckedChange={() => onToggle(w.term)} />
                  <label htmlFor={`${idPrefix}-${w.term}`} className="cursor-pointer text-xs">{w.term}</label>
                </div>
                <TermInfo term={w.term} category={category} />
              </div>
            ))}
          </fieldset>
        ))}
      </div>
    </details>
  );
}
