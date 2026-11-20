// Always-visible controls and the time notices (docs/dyad-rephrase-scope.md, sections 7 and 8): pause, stop rephrasing, close the
// cell; "they may have stepped away" and, after two minutes, "Still there?"; and a notice when about 15 and 5 minutes remain before
// the cell is deleted (a privacy rule that cannot be extended). Announcements go to a polite live region and never read out a phrase.
import { useEffect, useState } from 'react';
import { Pause, Play, X } from 'lucide-react';
import { Button } from '../app/components/ui/button';
import { ANNOUNCE, WORDS } from '../lib/rephraseWords';
import { Choices, type PanelCtx } from './rephraseShared';

export const STILL_THERE_MS = 2 * 60 * 1000;

export function Controls({ ctx, onPause, onResume, onCloseCell }: { ctx: PanelCtx; onPause: () => void; onResume: () => void; onCloseCell: () => void }) {
  const { ctl, run, busy, paused } = ctx;
  return (
    <Choices>
      {paused ? (
        <Button variant="outline" className="gap-2" onClick={onResume}><Play className="size-4" aria-hidden="true" /> Continue</Button>
      ) : (
        <Button variant="outline" className="gap-2" onClick={onPause}><Pause className="size-4" aria-hidden="true" /> {WORDS.pause}</Button>
      )}
      <Button variant="outline" disabled={busy || paused} onClick={() => run(() => ctl.stop())}>{WORDS.stop}</Button>
      <Button variant="outline" className="gap-2" onClick={onCloseCell}><X className="size-4" aria-hidden="true" /> Close and delete the cell</Button>
    </Choices>
  );
}

/** Away, "Still there?", and the minutes left. `now` is for tests. */
export function TimeNotices({ ctx, onCloseCell, now = () => Date.now() }: { ctx: PanelCtx; onCloseCell: () => void; now?: () => number }) {
  const away = ctx.ctl.state.partnerAway;
  const [asked, setAsked] = useState(false);
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    setAsked(false);
    if (!away) return;
    const t = setTimeout(() => setAsked(true), STILL_THERE_MS);
    return () => clearTimeout(t);
  }, [away]);
  const end = ctx.client?.expiresAt ?? null;
  useEffect(() => {
    if (!end) return;
    const tick = () => setLeft(Math.ceil((end - now()) / 60000));
    tick();
    const t = setInterval(tick, 30000);
    return () => clearInterval(t);
  }, [end, now]);
  const stage = left === null ? null : left <= 5 ? 5 : left <= 15 ? 15 : null;
  return (
    <div className="space-y-2">
      {away && !asked && <p role="status" className="text-sm">{WORDS.away}</p>}
      {away && asked && (
        <div role="group" aria-label={WORDS.stillThereTitle} className="space-y-2 rounded-lg border-2 border-border p-3 text-sm">
          <b>{WORDS.stillThereTitle}</b>
          <p>{WORDS.stillThere}</p>
          <Choices>
            <Button variant="outline" onClick={() => setAsked(false)}>{WORDS.keepWaiting}</Button>
            <Button variant="outline" onClick={onCloseCell}>{WORDS.closeCell}</Button>
          </Choices>
        </div>
      )}
      <p role="status" aria-live="polite" className="text-sm">{stage ? WORDS.minutesLeft(stage) : ''}</p>
    </div>
  );
}

/** The sentence for a screen reader after a change in the round, or '' (a phrase's words are never in it). */
export function announcement(a: { side?: 'speaker' | 'hearer'; phase?: string; notice: string | null; away: boolean; paused: boolean }): string {
  if (a.paused) return ANNOUNCE.paused;
  if (a.away) return ANNOUNCE.away;
  if (a.notice && !a.phase) return ANNOUNCE.ended;
  if (a.side === 'hearer' && a.phase === 'deciding') return ANNOUNCE.ask;
  if (a.side === 'hearer' && a.phase === 'hearing') return ANNOUNCE.phrase;
  if (a.side === 'speaker' && a.phase === 'answered') return ANNOUNCE.heard;
  if (a.phase === 'compared' || a.phase === 'revealed') return ANNOUNCE.meant;
  return '';
}
