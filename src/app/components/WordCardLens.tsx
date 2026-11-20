import { useEffect, useId, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { WordPicker } from './WordPicker';
import { useAutoDescription } from './useAutoDescription';
import { FewerNote, FewerWarning, AddToReport, LensCardNav } from './LensCardParts';
import { needsFewerWarning } from '../../lib/lensState';
import { cleanWordCards, type WordCardLens, type WordCardsData } from '../../lib/lensWordCards';

// One component for Nature (the seventh lens) and Story (the eighth): a run of cards, one activity on each, then a last card that shows the whole in a few words and adds it to the report
// (src/lib/lensWordCards.ts has the cards; docs/lens-story-nature.md has the design). Each activity card is a word bar over its lists plus a description box that fills in from the words chosen
// until the person types in it. All of it is text and plain controls: nothing moves, nothing is a picture, nothing depends on color or a pointer. Everything is optional.

export function WordCardLensCards({ def, initial, added, onAdd, onPutDown }: { def: WordCardLens; initial: unknown; added: boolean; onAdd: (data: WordCardsData) => void; onPutDown: () => void }) {
  const init = cleanWordCards(def, initial);
  const [index, setIndex] = useState(0);
  const [words, setWords] = useState<Record<string, string[]>>(() => Object.fromEntries(def.cards.map((c) => [c.id, init?.words[c.id] ?? []])));
  const [pending, setPending] = useState<{ card: string; word: string } | null>(null);
  // One description box per card. The cards of a lens never change, so the hooks run in the same order every time.
  const descs = def.cards.map((c) => useAutoDescription(init?.texts[c.id] ?? '', words[c.id] ?? []));
  const picked = def.cards.map((c) => words[c.id] ?? []);
  const summary = useAutoDescription(init?.summary ?? '', [], () => def.compose(picked));
  const [wish, setWish] = useState(init?.wish ?? '');
  const total = def.cards.length + 1;
  const last = index === total - 1;
  const card = last ? null : def.cards[index];

  // Each new card starts at its heading, so a keyboard or screen reader user lands on what changed.
  const heading = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } heading.current?.focus(); }, [index]);
  const ids = useId();

  const toggle = (cardId: string, term: string) => {
    const cur = words[cardId] ?? [];
    if (cur.includes(term)) { setWords({ ...words, [cardId]: cur.filter((x) => x !== term) }); return; }
    if (needsFewerWarning(cur.length)) { setPending({ card: cardId, word: term }); return; }
    setWords({ ...words, [cardId]: [...cur, term] });
  };

  const addToReport = () => {
    const w: Record<string, string[]> = {}, t: Record<string, string> = {};
    def.cards.forEach((c, i) => { w[c.id] = words[c.id] ?? []; t[c.id] = descs[i].value.trim(); });
    onAdd({ v: 1, words: w, texts: t, summary: summary.value.trim(), wish: wish.trim() });
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 px-4 py-6">
      {card ? (
        <section aria-labelledby={`${ids}-h`} className="space-y-4">
          <h2 id={`${ids}-h`} ref={heading} tabIndex={-1} className="text-xl outline-none focus-visible:underline">{card.title}</h2>
          {index === 0 && <FewerNote />}
          <p className="text-sm">{card.ask}</p>
          <WordPicker
            category={card.category}
            idPrefix={`${def.id}-${card.id}`}
            selected={words[card.id] ?? []}
            onToggle={(t) => toggle(card.id, t)}
            onAddText={(t) => descs[index].add(t)}
          />
          {pending && pending.card === card.id && (
            <FewerWarning onAdd={() => { setWords({ ...words, [card.id]: [...(words[card.id] ?? []), pending.word] }); setPending(null); }} onKeep={() => setPending(null)} />
          )}
          <div className="space-y-1">
            <label htmlFor={`${ids}-box-${card.id}`} className="block text-sm">{card.boxLabel}</label>
            <Textarea id={`${ids}-box-${card.id}`} value={descs[index].value} onChange={(e) => descs[index].setValue(e.target.value)} className="min-h-20 resize-none text-sm" />
            <p className="text-xs text-muted-foreground">This fills in from the words you choose. Once you type in it, the words are yours.</p>
            {descs[index].edited && <Button type="button" variant="ghost" size="sm" className="min-h-11" onClick={descs[index].reset}>Fill it from my choices again</Button>}
          </div>
          <LensCardNav index={index} total={total} onBack={() => setIndex(index - 1)} onNext={() => setIndex(index + 1)} />
        </section>
      ) : (
        <section aria-labelledby={`${ids}-h`} className="space-y-4">
          <h2 id={`${ids}-h`} ref={heading} tabIndex={-1} className="text-xl outline-none focus-visible:underline">{def.summary.title}</h2>
          <div className="space-y-1">
            <label htmlFor={`${ids}-summary`} className="block text-sm">{def.summary.label}</label>
            <Textarea id={`${ids}-summary`} value={summary.value} onChange={(e) => summary.setValue(e.target.value)} className="min-h-24 resize-none text-sm" />
            {summary.edited && <Button type="button" variant="ghost" size="sm" className="min-h-11" onClick={summary.reset}>Fill it from my choices again</Button>}
          </div>
          <div className="space-y-1">
            <label htmlFor={`${ids}-wish`} className="block text-sm">{def.summary.wishLabel}</label>
            <Textarea id={`${ids}-wish`} value={wish} onChange={(e) => setWish(e.target.value.slice(0, 400))} className="min-h-16 resize-none text-sm" />
          </div>
          <AddToReport name={def.name} added={added} onAdd={addToReport} onPutDown={onPutDown} />
          <p className="text-xs text-muted-foreground">If you put it down without adding, your report says: &ldquo;Examined, not included: {def.name}.&rdquo; Anything you chose stays here for the visit and is never saved unless you add it.</p>
          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={() => setIndex(index - 1)}>Back</Button>
            <span className="text-xs text-muted-foreground" aria-live="polite">Card {index + 1} of {total}</span>
          </div>
        </section>
      )}
    </div>
  );
}
