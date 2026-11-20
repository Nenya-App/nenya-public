import type { Action, ViewState } from '../../../lib/workbenchView';
import { defineWord, nearTo } from '../../../lib/wordLookup';
import { WB } from '../../../lib/workbenchCopy';
import { btn, btnLink, btnOn } from './styles';

// Step 5 and the "What does this word mean?" buttons: short plain meanings from our own lists, and near words, only when asked (docs/phrase-workbench-scope.md, 1.5).
// On this device, nothing sent. A word that is not on the lists is never flagged. No online dictionary in this build.
export function LookupBlock({ s, send }: { s: ViewState; send: (a: Action) => void }) {
  if (!s.lookup) return null;
  const mean = defineWord(s.lookup.word);
  const near = s.lookup.near ? nearTo(s.lookup.word) : [];
  return (
    <div role="note" className="space-y-2 rounded-lg border-l-4 border-foreground bg-muted p-3">
      {mean ? (
        <>
          <p><strong>{mean.word}</strong> <span className="text-sm text-muted-foreground">({mean.where})</span></p>
          <p>{mean.def}</p>
          {mean.note && <p className="text-sm text-muted-foreground">{mean.note}</p>}
        </>
      ) : (
        <p>No short meaning for “{s.lookup.word}” on our lists. Your own word is always welcome.</p>
      )}
      {!s.lookup.near ? (
        <button type="button" onClick={() => send({ t: 'look-near' })} className={`${btn} ${btnLink}`}>Show near words</button>
      ) : (
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{WB.nearNote}</p>
          {near.length ? <ul className="flex flex-wrap gap-2">{near.map((w) => <li key={w}><button type="button" onClick={() => send({ t: 'look', word: w })} className={btn}>{w}</button></li>)}</ul> : <p>None on our lists.</p>}
        </div>
      )}
      <button type="button" onClick={() => send({ t: 'look-close' })} className={btn}>Close</button>
    </div>
  );
}

export function WordsStep({ s, send }: { s: ViewState; send: (a: Action) => void }) {
  return (
    <section aria-labelledby="wb-s4" className="space-y-3">
      <h2 id="wb-s4" className="text-xl">5. Words, on request</h2>
      <p className="text-muted-foreground">{WB.wordsHelp}</p>
      <label htmlFor="wb-word" className="block">A word to look at</label>
      <div className="flex flex-wrap gap-2">
        <input id="wb-word" type="text" value={s.wordDraft} maxLength={40} autoComplete="off" onChange={(e) => send({ t: 'word-draft', text: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); send({ t: 'look', word: s.wordDraft }); } }} className="min-h-11 min-w-0 flex-1 rounded-lg border-2 border-border bg-background px-3" />
        <button type="button" onClick={() => send({ t: 'look', word: s.wordDraft })} className={`${btn} ${btnOn}`}>What does it mean?</button>
      </div>
      <LookupBlock s={s} send={send} />
    </section>
  );
}
