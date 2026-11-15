import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { AppFooter } from '../AppFooter';
import { GuestbookCloud } from '../GuestbookCloud';
import { allColors } from '../ValarBreathingLogo';
import { describePlainly } from '../../../lib/colorNames';
import { guestbookId, isSessionPair, signaturePoint } from '../../../lib/guestbook';

// "Sign Our Guestbook" (owner, 2026-11-15; docs/guestbook-scope.md). The visitor chooses two colors just for the guestbook (never their session colors: the
// page refuses them when it knows them), sees them join the two colors of this moment, and signs. The server keeps only the centroid of the four and the
// day. The page's accents follow the moment's colors, live. Once per visit; a signature cannot be taken back, which the page says before signing.

let signedThisVisit: string | null = null; // the point, if this tab has signed (kept only in memory)

export default function GuestbookPage({ onBack, sessionId }: { onBack: () => void; sessionId?: string | null }) {
  const [points, setPoints] = useState<{ c: string; d: string }[]>([]);
  const [loadNote, setLoadNote] = useState('');
  const [chosen, setChosen] = useState<[string | null, string | null]>([null, null]);
  const [slot, setSlot] = useState<0 | 1>(0);
  const [now, setNow] = useState(() => new Date());
  const [state, setState] = useState<'idle' | 'sending' | 'signed' | 'once' | 'error'>(signedThisVisit ? 'signed' : 'idle');
  const [mine, setMine] = useState<string | null>(signedThisVisit);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    fetch('/api/guestbook', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j: { points: { c: string; d: string }[] }) => setPoints(j.points))
      .catch(() => setLoadNote('The guestbook could not be loaded just now.'));
  }, []);

  const moment = guestbookId(now);
  const pair = chosen[0] && chosen[1] ? ([chosen[0], chosen[1]] as [string, string]) : null;
  const isSession = pair ? isSessionPair(pair, sessionId) : false;
  const preview = pair ? signaturePoint(pair, now) : null;

  const pick = (hex: string) => {
    setChosen((c) => (slot === 0 ? [hex, c[1]] : [c[0], hex]));
    if (slot === 0) setSlot(1);
  };
  const sign = async () => {
    if (!pair || isSession || state === 'sending') return;
    setState('sending');
    try {
      const res = await fetch('/api/guestbook', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ colors: pair, website: '' }) });
      if (res.status === 429) return setState('once');
      if (!res.ok) throw new Error('sign');
      const j = (await res.json()) as { point: string; day: string };
      signedThisVisit = j.point;
      setMine(j.point);
      setPoints((p) => [...p, { c: j.point, d: j.day }]);
      setState('signed');
    } catch {
      setState('error');
    }
  };

  return (
    <div className="size-full flex flex-col bg-background" style={{ ['--moment-a' as string]: moment[0], ['--moment-b' as string]: moment[1] }}>
      <div className="border-b-2 px-4 py-4 md:px-6" style={{ borderImage: `linear-gradient(90deg, ${moment[0]}, ${moment[1]}) 1` }}>
        <Button variant="ghost" size="sm" onClick={onBack} className="min-h-11 gap-2">
          <ArrowLeft className="size-4" />
          Back
        </Button>
      </div>
      <div className="scroll-container flex-1 overflow-y-auto">
        <main className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6">
          <header className="space-y-3">
            <h1 className="text-2xl md:text-3xl">Sign Our Guestbook</h1>
            <p className="text-muted-foreground">
              Leave a mark that you were here. Choose two colors; they join the two colors of this moment, and the point in the middle of the four becomes your
              signature among everyone else’s. Nothing else is kept: no name, no time, no words.
            </p>
          </header>

          <GuestbookCloud points={points} mine={mine} />
          {loadNote && <p role="status" className="text-sm">{loadNote}</p>}

          {state === 'signed' ? (
            <section role="status" className="space-y-2 rounded-lg border border-border p-4">
              <h2 className="text-xl">You left your mark this visit</h2>
              <p className="text-sm text-muted-foreground">Your signature is the ringed point. Thank you for being here.</p>
            </section>
          ) : (
            <section aria-labelledby="sign" className="space-y-4">
              <h2 id="sign" className="text-xl">Leave your mark</h2>
              <p className="rounded-lg border border-border p-3 text-sm">
                These colors are only for the guestbook. Please don’t use your session colors: those are the key to a saved reflection.
              </p>
              <div className="flex flex-wrap items-center gap-3 text-sm" role="group" aria-label="Which color you are choosing">
                {([0, 1] as const).map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSlot(i)}
                    aria-pressed={slot === i}
                    className={`flex min-h-11 items-center gap-2 rounded-lg border px-3 ${slot === i ? 'border-nenya-accent-warm' : 'border-border'}`}
                  >
                    <span className="size-6 rounded-full border border-border" style={{ background: chosen[i] ?? 'transparent' }} aria-hidden="true" />
                    {i === 0 ? 'First color' : 'Second color'}
                    <span className="sr-only">{chosen[i] ? `: ${describePlainly(chosen[i]!)}` : ': not chosen yet'}</span>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-12" role="radiogroup" aria-label={slot === 0 ? 'Choose the first color' : 'Choose the second color'}>
                {allColors.map((hex, i) => (
                  <button
                    key={`${hex}-${i}`}
                    type="button"
                    role="radio"
                    aria-checked={chosen[slot] === hex}
                    aria-label={describePlainly(hex)}
                    onClick={() => pick(hex)}
                    className={`aspect-square min-h-11 rounded-md border-2 ${chosen[slot] === hex ? 'border-foreground' : 'border-transparent'}`}
                    style={{ background: hex }}
                  />
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm" aria-live="polite">
                <span>Your two</span>
                {chosen.map((c, i) => <span key={i} className="size-7 rounded-full border border-border" style={{ background: c ?? 'transparent' }} aria-hidden="true" />)}
                <span>and this moment’s two</span>
                {moment.map((c, i) => <span key={i} className="size-7 rounded-full border border-border" style={{ background: c }} aria-hidden="true" />)}
                {preview && (
                  <>
                    <span>make</span>
                    <span className="size-9 rounded-full border-2 border-foreground" style={{ background: preview }} aria-hidden="true" />
                    <span className="sr-only">{describePlainly(preview)}</span>
                  </>
                )}
              </div>
              {isSession && (
                <p role="alert" className="rounded-lg border border-destructive p-3 text-sm">
                  Those are your session colors, the key to a saved reflection. Please choose two others.
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                One signature per visit. It cannot be taken back, because nothing ties it to you. This moment’s colors come from the date and time (in UTC) and are
                the same for everyone signing now.
              </p>
              <Button type="button" onClick={sign} disabled={!pair || isSession || state === 'sending'} className="min-h-11">
                Sign the guestbook
              </Button>
              {state === 'once' && <p role="status" className="text-sm">This connection has already signed today. Thank you.</p>}
              {state === 'error' && <p role="alert" className="text-sm">That did not go through. Try again in a moment.</p>}
            </section>
          )}
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
