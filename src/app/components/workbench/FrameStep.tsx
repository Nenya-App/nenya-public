import type { Action, ViewState } from '../../../lib/workbenchView';
import { FRAMES, fillFrame, frameById, slotChoices, slotsOf } from '../../../lib/workbenchFrames';
import { annotated } from '../../../lib/phraseWorkbench';
import { WB } from '../../../lib/workbenchCopy';
import { btn, btnLink, btnOn } from './styles';

// Step 4: a frame is a sentence with slots (docs/phrase-workbench-scope.md, section 1.4). The person moves their own marked words in by button (no dragging), or types.
// Nothing is filled in for them, and an empty slot stays a blank line. The sentence and the frame are shown side by side, and the frame can be copied: that is the only
// way out, and it leaves nothing here.
export function FrameStep({ s, send }: { s: ViewState; send: (a: Action) => void }) {
  const f = frameById(s.frameId) ?? FRAMES[0];
  const picks = s.picks[f.id] ?? {};
  const filled = fillFrame(f, picks);
  const copy = () => {
    try {
      navigator.clipboard.writeText(filled.text).then(
        () => send({ t: 'announce', text: 'Copied.' }),
        () => send({ t: 'announce', text: 'Could not copy. Select the text instead.' }),
      );
    } catch {
      send({ t: 'announce', text: 'Could not copy. Select the text instead.' });
    }
  };
  return (
    <section aria-labelledby="wb-s3" className="space-y-4">
      <h2 id="wb-s3" className="text-xl">4. Try a frame</h2>
      <p className="text-muted-foreground">{WB.frameHelp}</p>
      <div role="group" aria-label="Frames" className="flex flex-wrap gap-2">
        {FRAMES.map((x) => (
          <button key={x.id} type="button" aria-pressed={x.id === f.id} onClick={() => send({ t: 'frame', id: x.id })} className={`${btn} ${x.id === f.id ? btnOn : ''}`}>{x.title}</button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">{f.note}</p>

      {slotsOf(f).map((slot) => {
        const choices = slotChoices(s.wb, slot);
        const open = s.pickOpen === slot.slot;
        const lid = `wb-slot-${slot.slot}`;
        return (
          <div key={slot.slot} className="space-y-2 rounded-lg border border-border p-3">
            <label htmlFor={lid} className="block">Slot: {slot.label}</label>
            <input id={lid} type="text" value={picks[slot.slot] ?? ''} maxLength={200} autoComplete="off" onChange={(e) => send({ t: 'slot-text', slot: slot.slot, text: e.target.value })} className="min-h-11 w-full rounded-lg border-2 border-border bg-background px-3" />
            <button type="button" aria-expanded={open} onClick={() => send({ t: 'pick-open', slot: slot.slot })} className={btn}>Take from my sentence</button>
            {open && (choices.length === 0 ? (
              <p className="text-muted-foreground">{WB.emptySlot(slot.label)}</p>
            ) : (
              <ul aria-label={`Words you marked as ${slot.label}`} className="flex flex-wrap gap-2">
                {choices.map((c) => (
                  <li key={c.markId}><button type="button" onClick={() => send({ t: 'take', slot: slot.slot, markId: c.markId })} className={btn}>{c.text}</button></li>
                ))}
              </ul>
            ))}
          </div>
        );
      })}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1 rounded-lg border border-border p-3">
          <h3 className="text-base">Your sentence</h3>
          <p>{s.wb.sentence || '(empty)'}</p>
          <p className="text-sm text-muted-foreground">With the marks as words: {annotated(s.wb)}</p>
        </div>
        <div className="space-y-1 rounded-lg border border-border p-3">
          <h3 className="text-base">In the frame</h3>
          <p id="wb-frame-text">{filled.text}</p>
          <p className="text-sm text-muted-foreground">A blank line is a slot with nothing in it yet.</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={copy} className={`${btn} ${btnOn}`}>Copy the frame text</button>
        <button type="button" onClick={() => send({ t: 'clear-frame' })} className={`${btn} ${btnLink}`}>Empty the slots</button>
      </div>
    </section>
  );
}
