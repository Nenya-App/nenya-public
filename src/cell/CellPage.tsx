import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Copy, Flag, Lock, Pause, Play, X } from 'lucide-react';
import { Button } from '../app/components/ui/button';
import { Card } from '../app/components/ui/card';
import { EmergencyExitDock } from '../app/components/EmergencyExit';
import OnboardingFlow from '../app/components/OnboardingFlow';
import { FlagNotice } from '../coach/FlagNotice';
import { CellClient } from '../lib/cellClient';
import { normalizeCode, type Opened } from '../lib/cellCrypto';
import type { SafetyFlag } from '../lib/safetyFlags';
import { termsAcceptedFor } from '../lib/deviceMemory';
import { LEGAL_EFFECTIVE_DATE } from '../lib/legalDocument';
import { MODES } from '../lib/privacyModes';

// Partner practice ("Dyadic Cells"), for real: two people in an end-to-end encrypted cell (src/lib/cellClient.ts,
// netlify/functions/cell.mts; docs/ghost-footprint-stack.md). The conversation lives only in this page's memory; the
// mailbox holds ciphertext and deletes everything within three hours, or at once when either person closes the cell.
//
// Screens: start (make or join) → waiting for the other person → compare the safety colours → the conversation (with a
// pause both people see when a message is flagged, a report for any message the other person sent, and closing).
// "Send with AI" and "Receive translated" are shown as not available yet: they would send one person's own words to the
// coach route, which is not wired in.

type Stage = 'loading' | 'off' | 'start' | 'waiting' | 'compare' | 'talk' | 'closed';
interface Line {
  from: 'me' | 'them' | 'site';
  text: string;
  opened?: Opened;
  reported?: 'sending' | 'done' | 'failed';
}
const STEADY = { ih: 5000, hi: 0, ex: 5000, ho: 0 };
const noop = () => undefined;
const MAX_CHARS = 1000;

const Swatch = ({ c }: { c: string }) => <span className="inline-block size-10 rounded-full border border-border" style={{ background: c }} aria-label={c} role="img" />;

export default function CellPage() {
  const [agreed, setAgreed] = useState(() => termsAcceptedFor(LEGAL_EFFECTIVE_DATE));
  const [stage, setStage] = useState<Stage>('loading');
  const [code, setCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [colors, setColors] = useState<[string, string] | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [draft, setDraft] = useState('');
  const [paused, setPaused] = useState<null | { by: 'me' | 'them'; flag?: SafetyFlag; text?: string }>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [closedWhy, setClosedWhy] = useState('');
  const client = useRef<CellClient | null>(null);
  const exiting = useRef(false);

  useEffect(() => {
    fetch('/api/cell?status', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setStage(j?.enabled === true ? 'start' : 'off'))
      .catch(() => setStage('off'));
  }, []);

  // Leaving with a cell open: close it for both people, so nothing waits on the server.
  useEffect(() => {
    const leave = () => void client.current?.close();
    window.addEventListener('pagehide', leave);
    return () => window.removeEventListener('pagehide', leave);
  }, []);
  useEffect(() => {
    if (stage !== 'talk' && stage !== 'waiting' && stage !== 'compare') return;
    const warn = (e: BeforeUnloadEvent) => {
      if (exiting.current) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [stage]);

  const listen = (c: CellClient) => {
    c.listen({
      onConnected: (cols) => {
        setColors(cols);
        setStage('compare');
      },
      onMessage: (m) => {
        if (m.kind === 'pause') setPaused({ by: 'them' });
        else if (m.kind === 'resume') setPaused(null);
        else if (m.kind === 'text') setLines((l) => [...l, { from: 'them', text: m.text, opened: m }]);
      },
      onFlag: (flag, m) => {
        // A crisis message from the other person: it is shown with resources, and the cell pauses for both.
        setPaused({ by: 'me', flag, text: m.text });
        void c.send({ kind: 'pause', text: '' }).catch(() => undefined);
      },
      onClosed: (why) => {
        setClosedWhy(why === 'me' ? 'You closed the cell.' : why === 'expired' ? 'The cell reached its three-hour limit and was deleted.' : 'The other person closed the cell.');
        setStage('closed');
      },
      onError: () => setError('The connection is having trouble. Nenya will keep trying.'),
    });
  };

  const create = async () => {
    setError('');
    try {
      const c = await CellClient.create();
      client.current = c;
      setCode(c.code);
      setStage('waiting');
      listen(c);
    } catch {
      setError('A cell could not be made just now. Please try again in a moment.');
    }
  };

  const join = async () => {
    setError('');
    const n = normalizeCode(joinCode);
    if (!n) {
      setError('That does not look like a cell code. It is 16 letters and digits, in four groups of four.');
      return;
    }
    try {
      const c = await CellClient.join(n);
      client.current = c;
      setCode(c.code);
      setStage('waiting');
      listen(c);
    } catch (e) {
      const m = e instanceof Error ? e.message : '';
      setError(m === 'taken' ? 'Two people are already in that cell.' : m === 'closed' || m === 'no cell' ? 'There is no open cell with that code. Check it with the person who made it.' : 'You could not join just now. Please try again.');
    }
  };

  const send = async () => {
    const text = draft.trim();
    if (!text || !client.current || paused) return;
    setError('');
    try {
      await client.current.send({ kind: 'text', text });
      setLines((l) => [...l, { from: 'me', text }]);
      setDraft('');
    } catch {
      setError('That message could not be sent. It is still in the box; try again.');
    }
  };

  const report = async (i: number) => {
    const line = lines[i];
    if (!line.opened || !client.current) return;
    setLines((l) => l.map((x, j) => (j === i ? { ...x, reported: 'sending' } : x)));
    try {
      await client.current.report(line.opened);
      setLines((l) => l.map((x, j) => (j === i ? { ...x, reported: 'done' } : x)));
    } catch {
      setLines((l) => l.map((x, j) => (j === i ? { ...x, reported: 'failed' } : x)));
    }
  };

  const close = async () => {
    await client.current?.close();
    client.current = null;
  };

  const pauseMine = async () => {
    setPaused({ by: 'me' });
    await client.current?.send({ kind: 'pause', text: '' }).catch(() => undefined);
  };
  const resume = async () => {
    setPaused(null);
    await client.current?.send({ kind: 'resume', text: '' }).catch(() => undefined);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* the code is on screen to copy by hand */
    }
  };

  return (
    <>
      <EmergencyExitDock show onEmergencyExit={() => { exiting.current = true; void client.current?.close(); }} />
      {!agreed && <OnboardingFlow skipRhythm technique={STEADY} onTechniqueChange={noop} onFinish={() => setAgreed(true)} />}
      <div className="flex size-full flex-col overflow-y-auto bg-background" {...(!agreed ? ({ inert: '' } as Record<string, string>) : {})}>
        <header className="flex items-center gap-3 border-b border-border px-4 py-3">
          <a href="/about/partner-practice" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" aria-hidden="true" /> About partner practice
          </a>
          <h1 className="ml-auto flex items-center gap-2 text-base">
            <Lock className="size-4" aria-hidden="true" /> Partner practice
          </h1>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-8">
          {error && <p role="alert" className="rounded-md border border-amber-600 p-3 text-sm">{error}</p>}

          {stage === 'loading' && <p role="status" className="text-sm text-muted-foreground">Loading…</p>}

          {stage === 'off' && (
            <Card className="space-y-3 p-6">
              <h2 className="text-xl">Not open yet</h2>
              <p className="text-sm text-muted-foreground">Partner practice is being tested and is not open to visitors yet. The About page describes what it will be.</p>
              <a className="text-sm underline underline-offset-4" href="/about/partner-practice">Read about partner practice</a>
            </Card>
          )}

          {stage === 'start' && (
            <>
              <section className="space-y-2">
                <h2 className="text-2xl">Two people, one structured conversation</h2>
                <p className="text-sm text-muted-foreground">{MODES.cell.summary} {MODES.cell.encryption}</p>
                <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                  {MODES.cell.limits.map((l) => <li key={l}>{l}</li>)}
                  <li>Nothing is kept: the cell is deleted when either of you closes it, and within three hours at most.</li>
                </ul>
                <p className="text-xs text-muted-foreground">This is a practice space, not therapy, and not for emergencies. In the US, call or text 988.</p>
              </section>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="space-y-3 p-5">
                  <h3 className="text-lg">Make a cell</h3>
                  <p className="text-sm text-muted-foreground">You get a code to give to one person yourself: in person, by phone, or in a message you trust.</p>
                  <Button onClick={create}>Make a cell</Button>
                </Card>
                <Card className="space-y-3 p-5">
                  <h3 className="text-lg">Join a cell</h3>
                  <label htmlFor="join-code" className="text-sm text-muted-foreground">The code the other person gave you</label>
                  <input id="join-code" className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm uppercase" placeholder="XXXX-XXXX-XXXX-XXXX" autoComplete="off" spellCheck={false} value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
                  <Button variant="outline" onClick={join} disabled={!joinCode.trim()}>Join</Button>
                </Card>
              </div>
            </>
          )}

          {stage === 'waiting' && (
            <Card className="space-y-4 p-6 text-center">
              <h2 className="text-xl">{client.current?.role === 'a' ? 'Give this code to the other person' : 'Joining…'}</h2>
              {client.current?.role === 'a' && (
                <>
                  <p className="font-mono text-2xl tracking-wider" aria-label={`Cell code ${code.split('').join(' ')}`}>{code}</p>
                  <Button variant="outline" onClick={copy} className="gap-2">
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? 'Copied' : 'Copy the code'}
                  </Button>
                  <p className="text-xs text-muted-foreground">Share it only with the person you mean to talk with. Nenya never sees the code itself.</p>
                </>
              )}
              <p role="status" className="text-sm text-muted-foreground">Waiting for the other person…</p>
              <Button variant="ghost" onClick={close}>Cancel and delete the cell</Button>
            </Card>
          )}

          {stage === 'compare' && colors && (
            <Card className="space-y-4 p-6 text-center">
              <h2 className="text-xl">Check that it is really the two of you</h2>
              <div className="flex justify-center gap-3"><Swatch c={colors[0]} /><Swatch c={colors[1]} /></div>
              <p className="font-mono text-sm">{colors[0]} · {colors[1]}</p>
              <p className="text-sm text-muted-foreground">
                Ask the other person which two colours they see, by voice or in person if you can. If they are the same, no one is in between. If they are different,
                close the cell.
              </p>
              <div className="flex justify-center gap-2">
                <Button onClick={() => setStage('talk')}>They match</Button>
                <Button variant="outline" onClick={close}>They do not match: close</Button>
              </div>
            </Card>
          )}

          {stage === 'talk' && (
            <div className="grid gap-6 md:grid-cols-[1fr_16rem]">
              <section className="space-y-4" aria-label="Conversation">
                <ol className="space-y-3" aria-live="polite">
                  {lines.length === 0 && <li className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">You are connected. Take turns: one shares, the other reflects back what they heard.</li>}
                  {lines.map((l, i) => (
                    <li key={i} className={`max-w-[85%] rounded-lg border p-3 text-sm ${l.from === 'me' ? 'ml-auto border-primary/30 bg-primary/5' : 'border-border'}`}>
                      <p className="mb-1 text-xs text-muted-foreground">{l.from === 'me' ? 'You' : 'The other person'}</p>
                      <p className="whitespace-pre-wrap">{l.text}</p>
                      {l.from === 'them' && (
                        <div className="mt-2 text-right">
                          {l.reported === 'done' ? (
                            <span className="text-xs text-muted-foreground">Reported to Nenya</span>
                          ) : l.reported === 'failed' ? (
                            <span className="text-xs">The report could not be sent.</span>
                          ) : (
                            <button type="button" className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-2 hover:underline" onClick={() => void report(i)} disabled={l.reported === 'sending'}>
                              <Flag className="size-3" aria-hidden="true" /> Report this message
                            </button>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ol>

                {paused && (
                  <Card className="space-y-3 border-amber-600 p-4">
                    <p className="text-sm">
                      {paused.flag
                        ? 'A message in this cell may be about someone being in danger. The cell is paused for both of you.'
                        : paused.by === 'me'
                          ? 'You paused the cell. Take the time you need.'
                          : 'The other person paused the cell.'}
                    </p>
                    {paused.flag && paused.text && <FlagNotice flag={paused.flag} flaggedMessage={paused.text} />}
                    <Button variant="outline" className="gap-2" onClick={resume}><Play className="size-4" /> Continue the conversation</Button>
                  </Card>
                )}

                <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); void send(); }}>
                  <label htmlFor="cell-draft" className="text-xs text-muted-foreground">Your message, encrypted on this device before it is sent</label>
                  <textarea id="cell-draft" className="min-h-24 w-full rounded-md border border-border bg-background p-3 text-sm" maxLength={MAX_CHARS} value={draft} onChange={(e) => setDraft(e.target.value)} disabled={!!paused} />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">{draft.length}/{MAX_CHARS}</span>
                    <Button type="submit" disabled={!draft.trim() || !!paused}>Send</Button>
                  </div>
                </form>
              </section>

              <aside className="space-y-4 text-xs">
                <Card className="space-y-2 p-3">
                  <p className="font-medium">Safety colours</p>
                  {colors && <div className="flex gap-2"><Swatch c={colors[0]} /><Swatch c={colors[1]} /></div>}
                </Card>
                <Card className="space-y-1 p-3 text-muted-foreground">
                  <p className="font-medium text-foreground">Facilitation guide</p>
                  <p>Take turns sharing and listening.</p>
                  <p>Reflect back what you heard.</p>
                  <p>Focus on feelings and needs.</p>
                  <p>No advice or solutions.</p>
                </Card>
                <Card className="space-y-1 p-3 text-muted-foreground">
                  <p className="font-medium text-foreground">AI help</p>
                  <p>"Send with AI" and "Receive translated" are not available yet. Your messages go only to the other person.</p>
                </Card>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="gap-2" onClick={pauseMine} disabled={!!paused}><Pause className="size-4" /> Pause</Button>
                  <Button variant="outline" className="gap-2" onClick={close}><X className="size-4" /> Close and delete the cell</Button>
                </div>
              </aside>
            </div>
          )}

          {stage === 'closed' && (
            <Card className="space-y-3 p-6">
              <h2 className="text-xl">The cell is closed</h2>
              <p className="text-sm text-muted-foreground">{closedWhy} Nothing from it was kept on Nenya&rsquo;s side, except any message you chose to report.</p>
              <Button onClick={() => { setLines([]); setColors(null); setPaused(null); setCode(''); setJoinCode(''); setError(''); setStage('start'); }}>Start again</Button>
            </Card>
          )}
        </main>
      </div>
    </>
  );
}
