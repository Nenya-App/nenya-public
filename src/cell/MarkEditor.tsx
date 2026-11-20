import { useRef, useState, type KeyboardEvent } from 'react';
import { isGuess, kindInfo, KINDS, plainWord, type Cue, type MarkKind } from '../lib/rephraseKinds';
import { ANNOUNCE, CATEGORIES_NOTE, CNVC_URL, EXTENSION_NOTE, WORDS } from '../lib/rephraseWords';

// Marking the words of a phrase (docs/dyad-rephrase-scope.md, section 9). Choose a kind (a radio group), then tap or press a word.
// A mark is never colour alone: it has its name in words under the word, a glyph, and a line style (solid, dotted, double, dashed,
// wavy), and the word's accessible name says it ("tired, marked as a feeling"). No dragging; arrow keys move between words.
// LOCAL stand-in for the solo workbench's marking component, to be swapped when its pure core lands.
const cueStyle = (c: Cue) => ({ textDecorationLine: 'underline' as const, textDecorationStyle: c, textDecorationThickness: '2px', textUnderlineOffset: '5px' });
const kindLabel = (k: MarkKind, hearer: boolean) => `${kindInfo(k).name}${isGuess(k, hearer) ? ' (my guess)' : ''}`;
const shortLabel = (k: MarkKind, hearer: boolean) => `${kindInfo(k).glyph} ${kindInfo(k).short}${isGuess(k, hearer) ? ', a guess' : ''}`;

export const CreditLines = () => (
  <p className="text-xs text-muted-foreground">
    {CATEGORIES_NOTE} <a className="underline underline-offset-4" href={CNVC_URL} target="_blank" rel="noopener noreferrer">CNVC (opens in a new tab)</a>. {EXTENSION_NOTE}
  </p>
);

/** A word with its mark, for reading (not editing). */
export function MarkedWord({ word, kind, hearer }: { word: string; kind: MarkKind | undefined; hearer: boolean }) {
  const info = kind ? kindInfo(kind) : null;
  return (
    <span className={`inline-block min-h-11 rounded-md border-2 px-2 py-1 ${info ? 'border-border bg-muted' : 'border-transparent'}`}>
      <span style={info ? cueStyle(info.cue) : undefined}>{word}</span>
      {kind && <span className="block text-xs font-bold">{shortLabel(kind, hearer)}</span>}
      <span className="sr-only">{`, ${kind ? `marked as ${isGuess(kind, hearer) ? 'a guess at ' : ''}${kindInfo(kind).name.toLowerCase()}` : 'not marked'}`}</span>
    </span>
  );
}

export interface MarkEditorProps {
  id: string;
  words: string[];
  marks: ReadonlyMap<number, MarkKind>;
  /** The hearer's feelings and needs are guesses. */
  hearer: boolean;
  onMark: (index: number, kind: MarkKind) => void;
}

export default function MarkEditor({ id, words, marks, hearer, onMark }: MarkEditorProps) {
  const [kind, setKind] = useState<MarkKind>('saw');
  const [said, setSaid] = useState('');
  const list = useRef<HTMLOListElement>(null);
  const press = (i: number) => {
    const w = plainWord(words[i]);
    const had = marks.get(i);
    onMark(i, kind);
    setSaid(had === kind ? ANNOUNCE.cleared(w) : ANNOUNCE.marked(w, kindLabel(kind, hearer).toLowerCase()));
  };
  const move = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const to = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? words.length - 1 : -1;
    if (to < 0 || to >= words.length) return;
    e.preventDefault();
    list.current?.querySelectorAll<HTMLButtonElement>('button')[to]?.focus();
  };
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{WORDS.tapWords}</p>
      {hearer && <p className="text-sm text-muted-foreground">{WORDS.hearerGuess}</p>}
      <fieldset className="grid gap-1 rounded-lg border-2 border-border p-2">
        <legend className="px-1 text-sm font-bold">{WORDS.markAs}</legend>
        {KINDS.map((k) => (
          <label key={k.id} className={`flex min-h-11 items-center gap-3 rounded-md px-2 ${kind === k.id ? 'bg-muted outline outline-2 outline-foreground' : ''}`}>
            <input type="radio" name={`${id}-kind`} className="size-6 shrink-0" checked={kind === k.id} onChange={() => setKind(k.id)} />
            <span className="text-sm">
              <span style={cueStyle(k.cue)}>{k.glyph} {kindLabel(k.id, hearer)}</span>
              <span className="block text-xs text-muted-foreground">{k.desc}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <ol ref={list} aria-label={WORDS.phraseLabel} className="m-0 flex list-none flex-wrap gap-2 p-0 text-lg leading-loose">
        {words.map((w, i) => {
          const k = marks.get(i);
          const info = k ? kindInfo(k) : null;
          return (
            <li key={i}>
              <button
                type="button"
                aria-pressed={!!k}
                aria-label={`${plainWord(w)}, ${k ? `marked as ${isGuess(k, hearer) ? 'a guess at ' : ''}${kindInfo(k).name.toLowerCase()}` : 'not marked'}`}
                onClick={() => press(i)}
                onKeyDown={(e) => move(e, i)}
                className={`min-h-11 min-w-11 rounded-md border-2 px-2 py-1 text-left ${k ? 'border-border bg-muted' : 'border-transparent hover:border-border'}`}
              >
                <span style={info ? cueStyle(info.cue) : undefined}>{w}</span>
                {k && <span className="block text-xs font-bold">{shortLabel(k, hearer)}</span>}
              </button>
            </li>
          );
        })}
      </ol>
      <p role="status" aria-live="polite" className="sr-only">{said}</p>
      <CreditLines />
    </div>
  );
}
