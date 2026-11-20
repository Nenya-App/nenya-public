import { useEffect, useReducer, useState } from 'react';
import type { CellClient } from '../lib/cellClient';
import type { RephraseController } from '../lib/rephraseController';
import { NOTICES, WORDS } from '../lib/rephraseWords';
import { Deciding, FirstUse, Waiting } from './RephraseConsent';
import { Quiet, type PanelCtx } from './rephraseShared';

// Rephrasing in a partner cell (docs/dyad-rephrase-scope.md), shown on /cell only when VITE_REPHRASE is on. One person's view of
// the round on this device: it holds nothing of its own except what is on screen (the controller holds the round and the drafts,
// in memory). Each phase of the round has its own screen; none shows the other person's work before they choose to send it.
export interface RephrasePanelProps {
  ctl: RephraseController;
  client: CellClient | null;
  paused: boolean;
}

export default function RephrasePanel({ ctl, client, paused }: RephrasePanelProps) {
  const [, force] = useReducer((n: number) => n + 1, 0);
  const [understood, setUnderstood] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => ctl.subscribe(force), [ctl]);
  useEffect(() => ctl.setPaused(paused), [ctl, paused]);

  const run = (fn: () => Promise<unknown>) => {
    setError('');
    setBusy(true);
    fn()
      .catch((e: unknown) => setError(e instanceof Error && e.message === 'paused' ? WORDS.paused : WORDS.sendFailed))
      .finally(() => setBusy(false));
  };
  const ctx: PanelCtx = { ctl, client, paused, run, busy };
  const { round, notice } = ctl.state;

  let body;
  if (!understood) body = <FirstUse onUnderstood={() => setUnderstood(true)} />;
  else if (round?.side === 'hearer' && round.phase === 'deciding') body = <Deciding ctx={ctx} />;
  else if (round?.side === 'speaker' && round.phase === 'asked') body = <Waiting text={WORDS.waitingAsk} />;
  else body = null;

  return (
    <section aria-labelledby="rp-title" className="space-y-4 rounded-xl border border-border p-4">
      <h2 id="rp-title" className="text-lg">{WORDS.panelTitle}</h2>
      {understood && !round && <Quiet>{WORDS.panelIntro}</Quiet>}
      {error && <p role="alert" className="rounded-md border border-amber-600 p-3 text-sm">{error}</p>}
      {understood && !round && notice && <p role="status" className="rounded-md border border-border p-3 text-sm">{NOTICES[notice]}</p>}
      <fieldset disabled={paused} className="m-0 min-w-0 space-y-4 border-0 p-0">{body}</fieldset>
    </section>
  );
}
