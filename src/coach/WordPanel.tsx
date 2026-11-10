import { useState } from 'react';
import { CNVC_CREDIT, CNVC_LINK, FEELINGS_MET, FEELINGS_UNMET, NEEDS, filterGroups, type WordGroup, type WordKind } from '../lib/feelingsNeeds';

// The feelings and needs word lists beside the message box. Choosing a word puts a sentence the person can edit into the box; nothing is
// sent anywhere and the coach is not told which words were chosen (docs/coach-practice-arc-scope.md).
export interface Picked {
  kind: WordKind;
  word: string;
}

function Groups({ kind, groups, picked, onPick }: { kind: WordKind; groups: WordGroup[]; picked: Picked[]; onPick: (p: Picked) => void }) {
  if (groups.length === 0) return <p className="text-sm text-muted-foreground">No word here contains those letters. Try fewer, or a different part of the word.</p>;
  return (
    <div className="space-y-3">
      {groups.map((grp) => (
        <div key={grp.family} role="group" aria-label={grp.family}>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{grp.family}</p>
          <div className="flex flex-wrap gap-1.5">
            {grp.words.map((w) => {
              const on = picked.some((p) => p.kind === kind && p.word === w);
              return (
                <button
                  key={w}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onPick({ kind, word: w })}
                  className={`rounded-full border px-2.5 py-0.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${on ? 'border-foreground bg-foreground text-background' : 'border-border hover:bg-muted'}`}
                >
                  {w}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function WordPanel({ open, onToggle, tab, onTab, picked, onPick }: { open: boolean; onToggle: (open: boolean) => void; tab: 'feelings' | 'needs'; onTab: (t: 'feelings' | 'needs') => void; picked: Picked[]; onPick: (p: Picked) => void }) {
  const [query, setQuery] = useState('');
  const tabBtn = (id: 'feelings' | 'needs', label: string) => (
    <button
      type="button"
      role="tab"
      id={`words-tab-${id}`}
      aria-selected={tab === id}
      aria-controls="words-panel"
      onClick={() => onTab(id)}
      className={`rounded-md px-3 py-1 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${tab === id ? 'bg-muted font-medium' : 'text-muted-foreground hover:bg-muted/60'}`}
    >
      {label}
    </button>
  );
  return (
    <details open={open} onToggle={(e) => onToggle((e.currentTarget as HTMLDetailsElement).open)} className="rounded-xl border bg-card p-3">
      <summary className="cursor-pointer text-sm font-medium">Words for feelings and needs</summary>
      <div className="mt-3 space-y-3">
        <p className="text-sm text-muted-foreground">
          You do the finding; the coach asks. Tap a word that is close, even if it is not exact. It adds a sentence to your message that you can change. A wrong guess is still useful.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <div role="tablist" aria-label="Feelings or needs" className="flex gap-1">
            {tabBtn('feelings', 'Feelings')}
            {tabBtn('needs', 'Needs')}
          </div>
          <label className="sr-only" htmlFor="words-search">
            Find a word
          </label>
          <input
            id="words-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a few letters"
            className="min-w-0 flex-1 rounded-md border bg-background px-2 py-1 text-sm"
          />
        </div>
        <div id="words-panel" role="tabpanel" aria-labelledby={`words-tab-${tab}`} className="max-h-72 space-y-4 overflow-y-auto pr-1">
          {tab === 'feelings' ? (
            <>
              <section aria-label="Feelings when needs are met" className="space-y-2">
                <h3 className="text-sm font-medium">When a need is being met</h3>
                <Groups kind="feeling" groups={filterGroups(FEELINGS_MET, query)} picked={picked} onPick={onPick} />
              </section>
              <section aria-label="Feelings when needs are not met" className="space-y-2">
                <h3 className="text-sm font-medium">When a need is not being met</h3>
                <Groups kind="feeling" groups={filterGroups(FEELINGS_UNMET, query)} picked={picked} onPick={onPick} />
              </section>
            </>
          ) : (
            <section aria-label="Needs" className="space-y-2">
              <h3 className="text-sm font-medium">Needs, met or not yet met</h3>
              <Groups kind="need" groups={filterGroups(NEEDS, query)} picked={picked} onPick={onPick} />
            </section>
          )}
        </div>
        {picked.length > 0 && (
          <p className="text-sm" aria-live="polite">
            <span className="text-muted-foreground">Words you have picked: </span>
            {picked.map((p) => p.word).join(', ')}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Nothing you pick is sent until you send your message, and then only the words in it. From the{' '}
          <a href={CNVC_LINK} className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">
            Feelings and Needs Inventory
          </a>
          : {CNVC_CREDIT}. The lists are a starting point, not complete.
        </p>
      </div>
    </details>
  );
}
