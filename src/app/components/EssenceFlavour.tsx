import { useId, useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { WordPicker } from './WordPicker';
import { FewerNote, FewerWarning, MoreDescriptions, AddToReport, PutThisDown } from './LensCardParts';
import { needsFewerWarning } from '../../lib/lensState';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { BASES, DIALS, IDEAS, LINGERS, MOUTH, NOTES, cleanV2, dialSays, dialsLine, differenceLine, emptyDials, figurePoints, randomDials, tastingNote, type BasisId, type Dials, type EssenceV2 } from '../../lib/flavour';

// Essence in the tray (docs/wireframes/lens/essence.html; docs/lens-audit-essence.md): five short cards, not one long page. Where to start, the flavor of your life now (five dials and a shape
// drawn from them), what else is in it and what lingers (notes, feel in the mouth, a tasting note), the flavor you want (two shapes, now dashed and wish solid, and how they differ), and add or put down.
// Nothing needs to be tasted; imagining works. No food or hunger language. Everything optional; what is chosen stays here until it is added. The words twin of every shape is always on screen.
type Card = 'start' | 'now' | 'notes' | 'wish' | 'add';

function Figure({ now, wish, showNow }: { now: Dials; wish?: Dials; showNow: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="mx-auto size-40" role="img" aria-label="A five-pointed figure drawn from the dials. The words below say the same." focusable="false">
      <polygon points={figurePoints({ sweet: 4, sour: 4, salty: 4, bitter: 4, umami: 4 })} fill="none" stroke="currentColor" strokeOpacity="0.2" />
      {showNow && <polygon points={figurePoints(now)} fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray={wish ? '3 2' : undefined} className="motion-safe:transition-all" />}
      {wish && <polygon points={figurePoints(wish)} fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="2" />}
    </svg>
  );
}

function DialRow({ name, value, onChange }: { name: (typeof DIALS)[number]; value: number; onChange: (v: number) => void }) {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm capitalize">{name}</label>
      <input id={id} type="range" min={0} max={4} step={1} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-valuetext={dialSays(name, value)} className="h-8 w-full" />
      <div className="flex justify-between text-xs text-muted-foreground"><span>None</span><span>Very strong</span></div>
    </div>
  );
}

export function EssenceFlavour({ initial, onAdd, onPutDown, added }: { initial: unknown; onAdd: (data: EssenceV2) => void; onPutDown: () => void; added: boolean }) {
  const init = cleanV2(initial);
  const [card, setCard] = useState<Card>('start');
  const [basis, setBasis] = useState<BasisId>(init?.basis ?? 'mood');
  const [now, setNow] = useState<Dials>(init?.now ?? emptyDials());
  const [wish, setWish] = useState<Dials>(init?.wish ?? emptyDials());
  const [notes, setNotes] = useState<string[]>(init?.notes ?? []);
  const [pending, setPending] = useState<string | null>(null);
  const [mouth, setMouth] = useState<string | null>(init?.mouth ?? null);
  const [lingers, setLingers] = useState<string | null>(init?.lingers ?? null);
  const [note, setNote] = useState<string | null>(init?.tastingNote ?? null); // null: composed from the choices; a string: the person's own edit
  const [small, setSmall] = useState(init?.smallThing ?? '');
  const [extra, setExtra] = useState(init?.extra ?? '');
  const [imagine, setImagine] = useState(false);
  // The starting point sets the order of the two flavors (owner, 2026-11-17): a mood begins with now; a memory or a small thing to try begins with the flavor you want. The notes describe the first one.
  const first: 'now' | 'wish' = basis === 'mood' ? 'now' : 'wish';
  const order: Card[] = first === 'now' ? ['start', 'now', 'notes', 'wish', 'add'] : ['start', 'wish', 'notes', 'now', 'add'];
  const at = order.indexOf(card);
  const go = (d: 1 | -1) => setCard(order[Math.max(0, Math.min(order.length - 1, at + d))]);
  const composed = tastingNote({ now: first === 'now' ? now : wish, notes, mouth, lingers });
  const shownNote = note ?? composed;
  const wishLine = dialsLine(wish);
  const basisInfo = BASES.find((b) => b.id === basis)!;
  const toggleNote = (n: string) => {
    if (notes.includes(n)) return setNotes(notes.filter((x) => x !== n));
    if (needsFewerWarning(notes.length)) return setPending(n);
    setNotes([...notes, n]);
  };
  const nav = (nextLabel = 'Next') => (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
      <Button variant="ghost" onClick={() => go(-1)} className="gap-2"><ArrowLeft className="size-4" /> Back</Button>
      <Button onClick={() => go(1)} className="gap-2">{nextLabel}<ArrowRight className="size-4" /></Button>
    </div>
  );
  const index = at;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 px-4 py-6">
      <p className="text-center text-xs text-muted-foreground">{index === 0 ? 'Essence' : `Essence, card ${index} of 4`}</p>

      {card === 'start' && (
        <section aria-labelledby="ess-start" className="space-y-4">
          <h2 id="ess-start" className="text-xl">Where would you like to start?</h2>
          <FewerNote />
          <p className="text-sm text-muted-foreground">Three ways in. They all lead to the same place: the flavor of the life you have, and the one you want.</p>
          <fieldset className="space-y-2"><legend className="sr-only">Start from</legend>
            {BASES.map((b) => (
              <label key={b.id} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-border p-3">
                <input type="radio" name="ess-basis" checked={basis === b.id} onChange={() => setBasis(b.id)} className="mt-1" />
                <span><span className="block">{b.label}</span><span className="block text-sm text-muted-foreground">{b.line}</span></span>
              </label>
            ))}
          </fieldset>
          <div className="flex flex-wrap justify-between gap-3"><Button variant="outline" onClick={onPutDown}>Skip this lens for now</Button><Button onClick={() => go(1)} className="gap-2">Begin<ArrowRight className="size-4" /></Button></div>
        </section>
      )}

      {card === 'now' && (
        <section aria-labelledby="ess-now" className="space-y-4">
          <h2 id="ess-now" className="text-xl">What is the flavor of your life right now?</h2>
          <p className="text-sm">{basisInfo.ask}</p>
          <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={imagine} onChange={(e) => setImagine(e.target.checked)} /> I can&rsquo;t taste or smell right now: imagine instead</label>
          {imagine && <p className="text-sm text-muted-foreground">That works too. Nothing here needs to be tasted.</p>}
          <details className="rounded-md border border-border p-3 text-sm"><summary className="flex min-h-11 cursor-pointer items-center">Need an idea?</summary><ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">{IDEAS.map((i) => <li key={i}>{i}</li>)}</ul></details>
          <Figure now={now} showNow />
          <div className="grid gap-3 sm:grid-cols-2">{DIALS.map((k) => <DialRow key={k} name={k} value={now[k]} onChange={(v) => setNow({ ...now, [k]: v })} />)}</div>
          <p className="text-sm">Right now: <span role="status" aria-live="polite">{dialsLine(now)}</span></p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="outline" onClick={() => setNow(randomDials())}>Surprise me</Button>
            <span className="flex gap-2"><Button variant="ghost" onClick={() => go(1)}>Skip</Button><Button onClick={() => go(1)} className="gap-2">Next<ArrowRight className="size-4" /></Button></span>
          </div>
          <Button variant="ghost" onClick={() => go(-1)} className="gap-2"><ArrowLeft className="size-4" /> Back</Button>
        </section>
      )}

      {card === 'notes' && (
        <section aria-labelledby="ess-notes" className="space-y-4">
          <h2 id="ess-notes" className="text-xl">What else is in it, and what lingers?</h2>
          <fieldset className="space-y-2"><legend className="text-sm">Notes (three is a soft limit)</legend>
            <div className="flex flex-wrap gap-3">{NOTES.map((n) => (
              <label key={n} className="flex min-h-11 items-center gap-2 text-sm capitalize"><input type="checkbox" checked={notes.includes(n)} onChange={() => toggleNote(n)} /> {n}</label>
            ))}</div>
            {pending && <FewerWarning onAdd={() => { setNotes([...notes, pending]); setPending(null); }} onKeep={() => setPending(null)} />}
          </fieldset>
          <MoreDescriptions label="More words">
            <WordPicker category="taste" idPrefix="essTaste" selected={notes} onToggle={toggleNote} />
            <WordPicker category="scent" idPrefix="essScent" selected={notes} onToggle={toggleNote} />
          </MoreDescriptions>
          <fieldset className="space-y-1"><legend className="text-sm">How does it feel in the mouth?</legend>
            <div className="flex flex-wrap gap-3"><label className="flex min-h-11 items-center gap-2 text-sm"><input type="radio" name="ess-mouth" checked={mouth === null} onChange={() => setMouth(null)} /> Skip</label>
              {MOUTH.map((m) => <label key={m} className="flex min-h-11 items-center gap-2 text-sm"><input type="radio" name="ess-mouth" checked={mouth === m} onChange={() => setMouth(m)} /> {m}</label>)}</div></fieldset>
          <fieldset className="space-y-1"><legend className="text-sm">What lingers after?</legend>
            <div className="flex flex-wrap gap-3"><label className="flex min-h-11 items-center gap-2 text-sm"><input type="radio" name="ess-ling" checked={lingers === null} onChange={() => setLingers(null)} /> Skip</label>
              {LINGERS.map((m) => <label key={m} className="flex min-h-11 items-center gap-2 text-sm"><input type="radio" name="ess-ling" checked={lingers === m} onChange={() => setLingers(m)} /> {m}</label>)}</div></fieldset>
          <p className="text-sm">Your tasting note so far: <span role="status" aria-live="polite">{composed || 'nothing yet'}</span></p>
          {nav()}
        </section>
      )}

      {card === 'wish' && (
        <section aria-labelledby="ess-wish" className="space-y-4">
          <h2 id="ess-wish" className="text-xl">What is the flavor of the life you want?</h2>
          <p className="text-sm">Move the dials toward it. The dashed shape is now. The solid shape is what you want.</p>
          <Figure now={now} wish={wish} showNow />
          <div className="grid gap-3 sm:grid-cols-2">{DIALS.map((k) => <DialRow key={k} name={k} value={wish[k]} onChange={(v) => setWish({ ...wish, [k]: v })} />)}</div>
          <p className="text-sm">The life you want: <span role="status" aria-live="polite">{wishLine}</span></p>
          <p className="text-sm text-muted-foreground">From now to what you want: <span role="status" aria-live="polite">{differenceLine(now, wish)}</span></p>
          <table className="sr-only"><caption>The ten dial values</caption><thead><tr><th>Taste</th><th>Now</th><th>Want</th></tr></thead><tbody>{DIALS.map((k) => <tr key={k}><td>{k}</td><td>{now[k]} of 4</td><td>{wish[k]} of 4</td></tr>)}</tbody></table>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="outline" onClick={() => setWish({ ...now })}>Start from my now</Button>
            <span className="flex gap-2"><Button variant="ghost" onClick={() => go(1)}>Skip</Button><Button onClick={() => go(1)} className="gap-2">Next<ArrowRight className="size-4" /></Button></span>
          </div>
          <Button variant="ghost" onClick={() => go(-1)} className="gap-2"><ArrowLeft className="size-4" /> Back</Button>
        </section>
      )}

      {card === 'add' && (
        <section aria-labelledby="ess-add" className="space-y-4">
          <h2 id="ess-add" className="text-xl">Add Essence to your report?</h2>
          <div className="space-y-1 text-sm"><label htmlFor="ess-note" className="block">This is your tasting note (you can change the words):</label>
            <Textarea id="ess-note" value={shownNote} onChange={(e) => setNote(e.target.value)} className="min-h-20 resize-none text-sm" /></div>
          <ul className="space-y-1 text-sm"><li>Now: {dialsLine(now)}</li><li>What you want: {wishLine}</li><li>From now to what you want: {differenceLine(now, wish)}</li></ul>
          <div className="space-y-1 text-sm"><label htmlFor="ess-small" className="block">One small thing that would bring a little of that flavor into today (optional)</label>
            <Textarea id="ess-small" value={small} onChange={(e) => setSmall(e.target.value.slice(0, 200))} className="min-h-16 resize-none text-sm" /></div>
          <MoreDescriptions><div className="space-y-1 text-sm"><label htmlFor="ess-extra" className="block">Anything to change or add? (optional)</label><Textarea id="ess-extra" value={extra} onChange={(e) => setExtra(e.target.value)} className="min-h-20 resize-none text-sm" /></div></MoreDescriptions>
          <AddToReport name="Essence" added={added} onPutDown={onPutDown} onAdd={() => onAdd({ v: 2, basis, now, wish, notes, mouth, lingers, tastingNote: shownNote, smallThing: small.trim(), extra: extra.trim() })} />
          <p className="text-xs text-muted-foreground">If you put it down without adding, your report says: &ldquo;Examined, not included: Essence.&rdquo; Anything you chose stays here for the visit and is never saved unless you add it.</p>
          <Button variant="ghost" onClick={() => go(-1)} className="gap-2"><ArrowLeft className="size-4" /> Back</Button>
        </section>
      )}
      <div className="sr-only" aria-hidden="true"><PutThisDown onClick={onPutDown} /></div>
    </div>
  );
}
