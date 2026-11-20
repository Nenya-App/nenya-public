import { useState } from 'react';
import type { Action, ViewState } from '../../../lib/workbenchView';
import { browseFor } from '../../../lib/workbenchView';
import { textOf } from '../../../lib/phraseWorkbench';
import { markInfo } from '../../../lib/workbenchCopy';
import { btn, btnLink, btnOn } from './styles';

// "Say more" for a need or a feeling mark (docs/phrase-workbench-scope.md, section 2). Optional: the mark already stands without it. The first tier is short (seven
// need groups, or two feeling sides); the families and then the words open only when the person asks. Nothing is chosen for them, and the list is the same
// whatever they marked before.
export function SayMore({ s, send }: { s: ViewState; send: (a: Action) => void }) {
  const m = s.wb.marks.find((x) => x.id === s.detailFor);
  const [own, setOwn] = useState('');
  if (!m || (m.kind !== 'need' && m.kind !== 'feeling')) return null;
  const isNeed = m.kind === 'need';
  const b = browseFor(m, s.specOpen);
  const noun = isNeed ? 'needs' : 'feelings';
  return (
    <section aria-labelledby="wb-more-h" className="space-y-3 rounded-lg border border-border p-3">
      <h3 id="wb-more-h" className="text-base">{markInfo(m.kind).name}: “{textOf(s.wb, m)}”</h3>
      <p className="text-sm text-muted-foreground">
        {isNeed ? 'Which group sits closest?' : 'Which side sits closest?'} This is optional, and the mark already stands without it.
      </p>
      <div role="group" aria-label={isNeed ? 'Need groups' : 'Feeling sides'} className="flex flex-wrap gap-2">
        {b.groups.map((g) => (
          <button key={g.name} type="button" aria-pressed={m.detail?.category === g.name} onClick={() => send({ t: 'detail-pick', id: m.id, level: 'category', name: g.name })} className={`${btn} ${m.detail?.category === g.name ? btnOn : ''}`}>
            {g.name}
          </button>
        ))}
      </div>
      {b.chosen && (
        <>
          <p className="text-sm">{b.chosen.name}: {b.chosen.plain}</p>
          <button type="button" aria-expanded={s.specOpen} onClick={() => send({ t: 'spec' })} className={`${btn} ${btnLink}`}>
            {s.specOpen ? `Hide specific ${noun}` : `Open this into specific ${noun}`}
          </button>
        </>
      )}
      {b.chosen && s.specOpen && (
        <div className="space-y-2">
          <div role="group" aria-label={`Families in ${b.chosen.name}`} className="flex flex-wrap gap-2">
            {b.families.map((f) => (
              <button key={f.name} type="button" aria-pressed={m.detail?.family === f.name} onClick={() => send({ t: 'detail-pick', id: m.id, level: 'family', name: f.name })} className={`${btn} ${m.detail?.family === f.name ? btnOn : ''}`}>
                {f.name}
              </button>
            ))}
          </div>
          {b.family && (
            <div role="group" aria-label={`Words in ${b.family.name}`} className="flex flex-wrap gap-2">
              {b.family.words.map((w) => (
                <button key={w} type="button" aria-pressed={m.detail?.word === w} onClick={() => send({ t: 'detail-pick', id: m.id, level: 'word', name: w })} className={`${btn} ${m.detail?.word === w ? btnOn : ''}`}>
                  {w}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="space-y-1">
        <label htmlFor="wb-own" className="block text-sm">A word of your own (optional)</label>
        <div className="flex flex-wrap gap-2">
          <input id="wb-own" type="text" value={own} maxLength={60} onChange={(e) => setOwn(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); send({ t: 'detail-custom', id: m.id, text: own }); setOwn(''); } }} className="min-h-11 min-w-0 flex-1 rounded-lg border-2 border-border bg-background px-3" />
          <button type="button" onClick={() => { send({ t: 'detail-custom', id: m.id, text: own }); setOwn(''); }} className={btn}>Add</button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => send({ t: 'detail-close' })} className={`${btn} ${btnOn}`}>Done</button>
        {m.detail && <button type="button" onClick={() => send({ t: 'detail-clear', id: m.id })} className={btn}>Clear this</button>}
      </div>
    </section>
  );
}
