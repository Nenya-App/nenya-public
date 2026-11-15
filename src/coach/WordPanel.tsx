import { useState } from 'react';
import { X } from 'lucide-react';
import { CNVC_CREDIT, CNVC_LINK, FEELINGS_MET, FEELINGS_UNMET, NEEDS, filterGroups, type WordGroup, type WordKind } from '../lib/feelingsNeeds';

// The feelings and needs word lists beside the message box. Quiet by design: groups are small pills, only one group's words show at a
// time, and the whole panel folds away (and stays folded, on this device only). Choosing a word puts a sentence the person can edit
// into the box; nothing is sent anywhere and the coach is not told which words were chosen (docs/coach-practice-arc-scope.md).
export interface Picked {
  kind: WordKind;
  word: string;
}

type Side = 'unmet' | 'met';
const sorted = (groups: WordGroup[]): WordGroup[] => [...groups].sort((a, b) => a.family.localeCompare(b.family)).map((x) => ({ family: x.family, words: [...x.words].sort((a, b) => a.localeCompare(b)) }));
const UNMET = sorted(FEELINGS_UNMET);
const MET = sorted(FEELINGS_MET);
const NEED_GROUPS = sorted(NEEDS);

function WordChips({ kind, words, picked, onPick, accent }: { kind: WordKind; words: string[]; picked: Picked[]; onPick: (p: Picked) => void; accent: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {words.map((w) => {
        const on = picked.some((p) => p.kind === kind && p.word === w);
        return (
          <button
            key={w}
            type="button"
            aria-pressed={on}
            onClick={() => onPick({ kind, word: w })}
            style={on ? { backgroundColor: `${accent}33`, borderColor: accent } : undefined}
            className="rounded-full border border-border px-3 py-1 text-sm transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {w}
          </button>
        );
      })}
    </div>
  );
}

/** One kind of word: a row of group pills; the chosen group's words show beneath. Typing in the search shows matches from every group instead. */
function Browser({ kind, groups, query, picked, onPick, accent, label }: { kind: WordKind; groups: WordGroup[]; query: string; picked: Picked[]; onPick: (p: Picked) => void; accent: string; label: string }) {
  const [open, setOpen] = useState<string | null>(null);
  if (query.trim()) {
    const hits = filterGroups(groups, query);
    if (hits.length === 0) return <p className="text-sm text-muted-foreground">Nothing here has those letters. Try fewer, or a different part of the word.</p>;
    return (
      <div className="space-y-2">
        {hits.map((x) => (
          <div key={x.family}>
            <p className="mb-1 text-xs text-muted-foreground">{x.family}</p>
            <WordChips kind={kind} words={x.words} picked={picked} onPick={onPick} accent={accent} />
          </div>
        ))}
      </div>
    );
  }
  const current = groups.find((x) => x.family === open) ?? null;
  return (
    <div className="space-y-3">
      <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
        {groups.map((x) => {
          const chosen = picked.filter((p) => p.kind === kind && x.words.includes(p.word)).length;
          const sel = open === x.family;
          return (
            <button
              key={x.family}
              type="button"
              aria-expanded={sel}
              onClick={() => setOpen(sel ? null : x.family)}
              style={sel ? { backgroundColor: `${accent}22`, borderColor: accent } : undefined}
              className="rounded-lg border border-border bg-background px-3 py-1 text-sm text-foreground/90 transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {x.family}
              {chosen > 0 && <span className="ml-1.5 text-xs text-muted-foreground">· {chosen}</span>}
            </button>
          );
        })}
      </div>
      {current ? <WordChips kind={kind} words={current.words} picked={picked} onPick={onPick} accent={accent} /> : <p className="text-sm text-muted-foreground">Open a group to see its words, or type a few letters above.</p>}
    </div>
  );
}

export function WordPanel({ open, onToggle, tab, onTab, picked, have, onPick, onUnpick, accent }: { open: boolean; onToggle: (open: boolean) => void; tab: 'feelings' | 'needs'; onTab: (t: 'feelings' | 'needs') => void; picked: Picked[]; have: { feeling: boolean; need: boolean }; onPick: (p: Picked) => void; onUnpick: (p: Picked) => void; accent: string }) {
  const [query, setQuery] = useState('');
  const [side, setSide] = useState<Side>('unmet');
  const seg = (active: boolean, onClick: () => void, label: string, id?: string) => (
    <button
      type="button"
      id={id}
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={active ? { backgroundColor: `${accent}26` } : undefined}
      className={`rounded-md px-3 py-1 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? 'font-medium' : 'text-muted-foreground hover:bg-muted/60'}`}
    >
      {label}
    </button>
  );
  return (
    <details open={open} onToggle={(e) => onToggle((e.currentTarget as HTMLDetailsElement).open)} className="rounded-xl border border-border bg-card/60 px-3 py-2">
      <summary className="cursor-pointer select-none text-sm text-muted-foreground">
        Looking for words? <span className="text-foreground">Feelings and needs</span>
        {picked.length > 0 && <span> · {picked.length} picked</span>}
      </summary>
      <div className="mt-3 space-y-3 pb-1">
        <p className="text-sm text-muted-foreground">Only if they help. Tap a word that is close, even if it is not exact; it adds a sentence you can change. One way to put it, if that helps: <em>when I notice (what happened), I feel (a feeling) because I need (a need). What could help?</em></p>
        {/* A soft pointer to the piece that has not come up yet. Never required. */}
        {have.feeling && !have.need && (
          <p className="text-sm">
            A need that goes with that feeling?{' '}
            {tab !== 'needs' && (
              <button type="button" onClick={() => onTab('needs')} className="underline underline-offset-2">
                Look in Needs
              </button>
            )}
          </p>
        )}
        {have.need && !have.feeling && (
          <p className="text-sm">
            A feeling that goes with that need?{' '}
            {tab !== 'feelings' && (
              <button type="button" onClick={() => onTab('feelings')} className="underline underline-offset-2">
                Look in Feelings
              </button>
            )}{' '}
            <span className="text-muted-foreground">What happened, as a camera would see it, can go in your message.</span>
          </p>
        )}
        {have.feeling && have.need && <p className="text-sm text-muted-foreground">If you like, you can add what you could ask for, from yourself or someone else.</p>}

        {picked.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Words you picked">
            {picked.map((p) => (
              <li key={`${p.kind}-${p.word}`}>
                <button type="button" onClick={() => onUnpick(p)} aria-label={`Remove ${p.word}`} style={{ backgroundColor: `${accent}33`, borderColor: accent }} className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {p.word}
                  <X className="size-3" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <div role="tablist" aria-label="Feelings or needs" className="flex gap-1 rounded-lg bg-muted/50 p-0.5">
            {seg(tab === 'feelings', () => onTab('feelings'), 'Feelings')}
            {seg(tab === 'needs', () => onTab('needs'), 'Needs')}
          </div>
          <label className="sr-only" htmlFor="words-search">
            Find a word
          </label>
          <input id="words-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type a few letters" className="min-w-0 flex-1 rounded-md border border-border bg-background px-2.5 py-1 text-sm" />
        </div>

        {tab === 'feelings' ? (
          <div className="space-y-3">
            {!query.trim() && (
              <div role="tablist" aria-label="Feelings when a need is met or not met" className="flex w-fit gap-1 rounded-lg bg-muted/50 p-0.5">
                {seg(side === 'unmet', () => setSide('unmet'), 'A need is not being met')}
                {seg(side === 'met', () => setSide('met'), 'A need is being met')}
              </div>
            )}
            {query.trim() ? (
              <>
                <Browser kind="feeling" groups={[...UNMET.map((x) => ({ family: `${x.family} · not met`, words: x.words })), ...MET.map((x) => ({ family: `${x.family} · met`, words: x.words }))]} query={query} picked={picked} onPick={onPick} accent={accent} label="Feelings" />
              </>
            ) : (
              <Browser key={side} kind="feeling" groups={side === 'unmet' ? UNMET : MET} query="" picked={picked} onPick={onPick} accent={accent} label={side === 'unmet' ? 'Feelings when a need is not met' : 'Feelings when a need is met'} />
            )}
          </div>
        ) : (
          <Browser kind="need" groups={NEED_GROUPS} query={query} picked={picked} onPick={onPick} accent={accent} label="Needs, met or not yet met" />
        )}

        <p className="text-xs text-muted-foreground">
          Nothing you pick is sent until you send your message, and then only the words in it. From the{' '}
          <a href={CNVC_LINK} className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">
            Feelings and Needs Inventory
          </a>
          : {CNVC_CREDIT}. A starting point, not a complete list.
        </p>
      </div>
    </details>
  );
}
