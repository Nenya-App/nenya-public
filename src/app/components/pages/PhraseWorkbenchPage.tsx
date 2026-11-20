import { useEffect, useReducer, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { AppFooter } from '../AppFooter';
import { ExternalLink } from '../ExternalLink';
import { MARKS, WB, CNVC_PAGE, markInfo } from '../../../lib/workbenchCopy';
import { initialView, reduce, selText, SENTENCE_LIMIT, type Action, type StepIndex, type ViewState } from '../../../lib/workbenchView';
import { markLabel, marksFor, textOf, tokensOf } from '../../../lib/phraseWorkbench';
import { shapeStyle } from '../workbench/shapes';
import { SayMore } from '../workbench/SayMore';
import { SliderStep } from '../workbench/SliderStep';
import { FrameStep } from '../workbench/FrameStep';
import { WordsStep, LookupBlock } from '../workbench/WordsStep';
import { btn, btnOn, btnLink } from '../workbench/styles';

// The phrase workbench (docs/phrase-workbench-scope.md; VITE_PHRASE_WORKBENCH, off by default). A sentence becomes tappable words that the person marks
// themselves. Nothing is suggested, graded, kept or sent: the state lives in this page for the visit (src/lib/workbenchView.ts holds what each tap does).
// Tap or key to mark, no dragging. A mark shows as a text tag and a line or box shape, never colour alone, and each change is announced politely.

/** The steps shown so far. Later steps are added as they are built. */
const VISIBLE_STEPS: StepIndex[] = [0, 1, 2, 3, 4];

export default function PhraseWorkbenchPage({ onBack }: { onBack: () => void }) {
  const [s, send] = useReducer(reduce, undefined, initialView);
  const wasMark = useRef<number | null>(null);

  // After a mark is made, focus goes to the first word it covers, so a keyboard or switch user stays where they were.
  useEffect(() => {
    if (s.lastMark != null && s.lastMark !== wasMark.current) {
      const m = s.wb.marks.find((x) => x.id === s.lastMark);
      if (m) document.querySelector<HTMLElement>(`[data-tok="${m.from}"]`)?.focus();
    }
    wasMark.current = s.lastMark;
  }, [s.lastMark, s.wb.marks]);

  return <WorkbenchView s={s} send={send} onBack={onBack} />;
}

/** The page as drawn from a state: no state of its own, so it can be rendered in any state (the tests do this on the server). */
export function WorkbenchView({ s, send, onBack }: { s: ViewState; send: (a: Action) => void; onBack: () => void }) {
  const marksHeading = useRef<HTMLHeadingElement>(null);
  const toks = tokensOf(s.wb);
  const selected = (id: number) => !!s.sel && id >= s.sel.a && id <= s.sel.b;

  return (
    <div className="size-full flex flex-col bg-background">
      <div className="border-b-2 border-border px-4 py-4 md:px-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="min-h-11 gap-2">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </Button>
      </div>
      <div className="scroll-container flex-1 overflow-y-auto">
        <main id="main-content" tabIndex={-1} className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
          <header className="space-y-3">
            <h1 className="text-2xl md:text-3xl">{WB.title}</h1>
            <p className="text-muted-foreground">{WB.intro}</p>
            <p className="rounded-lg border border-border p-3 text-sm">{WB.deviceNote}</p>
          </header>

          <nav aria-label="Steps">
            <ol className="flex flex-wrap gap-2">
              {VISIBLE_STEPS.map((i) => (
                <li key={i}>
                  <button type="button" onClick={() => send({ t: 'step', step: i })} aria-current={s.step === i ? 'step' : undefined} className={`${btn} ${s.step === i ? btnOn : ''}`}>
                    {i + 1}. {WB.steps[i]}
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          <div role="status" aria-live="polite" className="sr-only">{s.announce}</div>

          {s.step === 0 && (
            <section aria-labelledby="wb-s0" className="space-y-3">
              <h2 id="wb-s0" className="text-xl">1. A sentence</h2>
              <p className="text-muted-foreground">{WB.sentenceHelp} This one is an example. Replace it with your own.</p>
              <label htmlFor="wb-sentence" className="block text-sm">{WB.sentenceLabel}</label>
              <textarea id="wb-sentence" value={s.draft} onChange={(e) => send({ t: 'draft', text: e.target.value })} rows={4} aria-describedby="wb-count" className="w-full rounded-lg border-2 border-border bg-background p-3" />
              <p id="wb-count" className="text-sm text-muted-foreground">
                {s.draft.length} of {SENTENCE_LIMIT} characters
                {s.draft.length > SENTENCE_LIMIT ? `. ${WB.tooLong(s.draft.length - SENTENCE_LIMIT)}` : ''}
              </p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => send({ t: 'make' })} className={`${btn} ${btnOn}`}>{WB.make}</button>
                <button type="button" onClick={() => send({ t: 'draft', text: '' })} className={btn}>Clear</button>
              </div>
              <p className="text-sm text-muted-foreground">{WB.elseNote}</p>
            </section>
          )}

          {s.step === 1 && (
            <section aria-labelledby="wb-s1" className="space-y-4">
              <h2 id="wb-s1" className="text-xl">2. Mark what you see in it</h2>
              <p className="text-muted-foreground">{WB.markHelp}</p>
              <p className="sr-only">The sentence reads: {s.wb.sentence}</p>

              <ul className="flex flex-wrap items-start gap-x-1 gap-y-2" aria-label="Your sentence, word by word">
                {toks.map((t) => {
                  if (!t.markable) return <li key={t.id} aria-hidden="true" className="flex min-h-11 items-center">{t.text}</li>;
                  const ms = marksFor(s.wb, t.id);
                  const desc = ms.length ? ms.map(markLabel).join(', ') : 'no mark';
                  const first = ms[0] ? markInfo(ms[0].kind) : null;
                  return (
                    <li key={t.id} className="flex flex-col items-start">
                      <button
                        type="button"
                        data-tok={t.id}
                        aria-pressed={selected(t.id)}
                        aria-label={`${t.text}, ${desc}`}
                        onClick={() => send({ t: 'select', id: t.id })}
                        style={first ? shapeStyle(first.shape) : undefined}
                        className={`min-h-11 min-w-11 rounded-md border-2 px-2.5 py-1.5 text-base ${selected(t.id) ? 'border-foreground bg-muted font-medium' : 'border-transparent bg-muted/60'} hover:bg-muted`}
                      >
                        {t.text}
                      </button>
                      {ms.length > 0 && <span aria-hidden="true" className="max-w-44 px-1 text-xs leading-tight text-muted-foreground">{ms.map((m) => markInfo(m.kind).name.toLowerCase()).join(' + ')}</span>}
                    </li>
                  );
                })}
              </ul>

              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={!s.sel} onClick={() => send({ t: 'extend' })} className={`${btn} disabled:opacity-50`}>Add the next word</button>
                <button type="button" disabled={!s.sel} onClick={() => send({ t: 'unselect' })} className={`${btn} disabled:opacity-50`}>Unselect</button>
                <button type="button" onClick={() => send({ t: 'select-all' })} className={btn}>Select the whole sentence</button>
              </div>

              <div role="group" aria-label="Marks" className="space-y-3 rounded-lg border border-border p-3">
                {!s.sel ? (
                  <p className="text-muted-foreground">Choose a word above to see the marks.</p>
                ) : (
                  <>
                    <p>Selected: <strong>“{selText(s)}”</strong></p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {MARKS.filter((m) => s.more || m.first).map((m) => (
                        <button key={m.kind} type="button" onClick={() => send({ t: 'mark', kind: m.kind })} className={`${btn} h-full flex-col items-start justify-start`}>
                          <span>{m.name}</span>
                          <span className="text-xs font-normal text-muted-foreground">{m.plain}</span>
                        </button>
                      ))}
                    </div>
                    <button type="button" onClick={() => send({ t: 'look-selected' })} className={`${btn} ${btnLink}`}>What does this word mean?</button>
                    <button type="button" onClick={() => send({ t: 'more' })} aria-expanded={s.more} className={`${btn} ${btnLink}`}>
                      {s.more ? 'Fewer marks' : 'More marks'}
                    </button>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <h3 ref={marksHeading} tabIndex={-1} className="text-base">Your marks</h3>
                {s.wb.marks.length === 0 ? (
                  <p className="text-muted-foreground">{WB.noMarks}</p>
                ) : (
                  <ul className="space-y-2">
                    {s.wb.marks.map((m) => (
                      <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2 first:border-t-0 first:pt-0">
                        <span>“{textOf(s.wb, m)}” as <strong>{markLabel(m)}</strong></span>
                        {(m.kind === 'need' || m.kind === 'feeling') && <button type="button" onClick={() => send({ t: 'detail-open', id: m.id })} aria-label={`Say more about ${textOf(s.wb, m)}`} className={btn}>Say more</button>}
                        <button type="button" onClick={() => { send({ t: 'remove', id: m.id }); marksHeading.current?.focus(); }} aria-label={`Remove the mark from ${textOf(s.wb, m)}`} className={btn}>Remove</button>
                      </li>
                    ))}
                  </ul>
                )}
                {s.wb.marks.length > 0 && <button type="button" onClick={() => send({ t: 'clear-marks' })} className={`${btn} ${btnLink}`}>Clear all marks</button>}
              </div>

              <LookupBlock s={s} send={send} />
              <SayMore s={s} send={send} />

              <div className="space-y-2">
                <h3 className="text-base">What the shapes mean</h3>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {MARKS.map((m) => (
                    <li key={m.kind} className="flex items-center gap-3 text-sm">
                      <span aria-hidden="true" style={shapeStyle(m.shape)} className="rounded-md border-2 border-transparent bg-muted px-2 py-0.5">word</span>
                      <span>{m.name} ({m.shapeWords})</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {s.step === 2 && <SliderStep s={s} send={send} onGoMark={() => send({ t: 'step', step: 1 })} />}

          {s.step === 3 && <FrameStep s={s} send={send} />}

          {s.step === 4 && <WordsStep s={s} send={send} />}

          <footer className="space-y-1 text-sm text-muted-foreground">
            <p>{WB.credit}</p>
            <p>
              <ExternalLink href={CNVC_PAGE}>{WB.creditLink}</ExternalLink>. {WB.starting}
            </p>
          </footer>
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
