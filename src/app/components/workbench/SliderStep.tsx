import type { Action, ViewState } from '../../../lib/workbenchView';
import { levelName, levelSpoken, markLabel, textOf } from '../../../lib/phraseWorkbench';
import { LEVEL_NAMES, WB } from '../../../lib/workbenchCopy';
import { btn, btnLink, btnOn } from './styles';

// Step 3: a met-to-unmet slider on a word the person marked as a need, and only if they turn it on (docs/phrase-workbench-scope.md, section 1.3). A native range input
// with a spoken value, and beside it the same seven steps as buttons for anyone who finds a slider hard. It starts unmarked, shows no number, and adds up to nothing.
export function SliderStep({ s, send, onGoMark }: { s: ViewState; send: (a: Action) => void; onGoMark: () => void }) {
  const needs = s.wb.marks.filter((m) => m.kind === 'need');
  return (
    <section aria-labelledby="wb-s2" className="space-y-4">
      <h2 id="wb-s2" className="text-xl">3. A need, met to not met</h2>
      <p className="text-muted-foreground">{WB.sliderHelp}</p>
      {needs.length === 0 && (
        <div className="space-y-2">
          <p>No word is marked as a need yet.</p>
          <button type="button" onClick={onGoMark} className={`${btn} ${btnOn}`}>Go to marking</button>
        </div>
      )}
      {needs.map((m) => {
        const on = !!s.sliderOn[m.id];
        const text = textOf(s.wb, m);
        const rid = `wb-range-${m.id}`;
        const unset = m.level == null;
        return (
          <div key={m.id} className="space-y-3 rounded-lg border border-border p-3">
            <h3 className="text-base">“{text}”{m.detail ? ` (${markLabel(m).replace(/^A need: /, '')})` : ''}</h3>
            <label className="flex min-h-11 items-center gap-3">
              <input type="checkbox" checked={on} onChange={(e) => send({ t: 'slider', id: m.id, on: e.target.checked })} className="size-6" />
              <span>Add a met-to-unmet slider</span>
            </label>
            {on && (
              <>
                <div className="space-y-1">
                  <label htmlFor={rid} className="block">{WB.sliderQuestion}</label>
                  <input
                    id={rid}
                    type="range"
                    min={0}
                    max={LEVEL_NAMES.length - 1}
                    step={1}
                    value={m.level ?? 3}
                    aria-valuetext={levelSpoken(m.level)}
                    aria-describedby={`${rid}-now`}
                    onChange={(e) => send({ t: 'level', id: m.id, level: Number(e.target.value) })}
                    className={`min-h-11 w-full ${unset ? 'opacity-60' : ''}`}
                  />
                  <div className="flex justify-between gap-2 text-sm text-muted-foreground" aria-hidden="true">
                    <span>Not met at all</span>
                    <span>Fully met</span>
                  </div>
                  <p id={`${rid}-now`}>Now: {unset ? 'Not marked yet. Move the slider or pick a step.' : levelName(m.level)}</p>
                </div>
                <div role="group" aria-label={`Or pick a step for ${text}`} className="space-y-2">
                  <p className="text-sm text-muted-foreground">Or pick a step. It is the same thing, as buttons.</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {LEVEL_NAMES.map((n, i) => (
                      <button key={n} type="button" aria-pressed={m.level === i} onClick={() => send({ t: 'level', id: m.id, level: i })} className={`${btn} ${m.level === i ? btnOn : ''}`}>{n}</button>
                    ))}
                  </div>
                </div>
                <button type="button" onClick={() => send({ t: 'level', id: m.id, level: null })} className={`${btn} ${btnLink}`}>Clear this mark</button>
              </>
            )}
          </div>
        );
      })}
    </section>
  );
}
