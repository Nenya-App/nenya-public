import { useEffect, useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '../app/components/ui/button';
import { Card } from '../app/components/ui/card';
import { FlagNotice } from './FlagNotice';
import { SealedCoach, SealedError, MAX_SEALED_USER_CHARS } from '../lib/sealedCoach';
import { RELIES_ON_VENICE } from '../lib/enclaveCheck';
import type { SafetyFlag } from '../lib/safetyFlags';
import { MODES } from '../lib/privacyModes';

// A sealed conversation with the coach (src/lib/sealedCoach.ts): every message is checked and encrypted on this device,
// and only the AI model's enclave can read it. The conversation lives only in this component's memory. There is no
// download, no shared reflection and no signed record, because Nenya never sees the words; the screen says so.

interface Line {
  role: 'user' | 'assistant' | 'site';
  text: string;
}
const TURNS = 5;

const failureText = (e: unknown): string => {
  const code = e instanceof SealedError ? e.code : 'network';
  if (code === 'hardware')
    return 'Your device checked the hardware evidence for the AI model’s secure enclave, and it did not pass, so nothing was sent. You can try again, or start a witnessed conversation instead.';
  if (code === 'attestation' || code === 'nonce' || code === 'key')
    return 'Your device could not confirm the AI model’s secure enclave, so nothing was sent. You can try again, or start a witnessed conversation instead.';
  if (code === 'network') return 'The message could not be sent: there was no answer. Check your connection and try again. Nothing was kept.';
  return 'The reply could not be read on your device. Nothing was kept. Please try again in a moment.';
};

export default function SealedChat({ colors, onBack }: { colors: { color1: string; color2: string }; onBack: () => void }) {
  const coach = useRef<SealedCoach | null>(null);
  if (!coach.current) coach.current = new SealedCoach({ session: colors });
  const [lines, setLines] = useState<Line[]>([{ role: 'site', text: 'This conversation is sealed. Your device checks your enclave key first, then encrypts each message before it leaves.' }]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [flag, setFlag] = useState<{ flag: SafetyFlag; text: string } | null>(null);
  const [done, setDone] = useState(false);
  const [checked, setChecked] = useState<'checking' | 'ok' | 'failed'>('checking');
  const [blockedNote, setBlockedNote] = useState<string | null>(null);

  useEffect(() => {
    let on = true;
    coach.current!.attest().then(
      () => on && setChecked('ok'),
      (e) => {
        if (!on) return;
        setChecked('failed');
        setError(failureText(e));
      }
    );
    return () => {
      on = false;
      coach.current?.clear();
    };
  }, []);

  const turns = lines.filter((l) => l.role === 'user').length;

  const send = async () => {
    const text = draft.trim();
    if (!text || busy || done) return;
    setBusy(true);
    setError('');
    setNotice('');
    setBlockedNote(null);
    try {
      const out = await coach.current!.send(text);
      if ('ok' in out) {
        if (out.blocked === 'crisis' && out.flag) {
          setLines((l) => [...l, { role: 'user', text }]);
          setFlag({ flag: out.flag, text });
          setDone(true);
          setDraft('');
        } else if (out.blocked === 'manipulation') {
          setBlockedNote('That message reads like instructions to the coach, so it was not sent. You can reword it.');
        } else if (out.blocked === 'long') {
          setBlockedNote(`Messages can be up to ${MAX_SEALED_USER_CHARS} characters.`);
        }
        return;
      }
      setLines((l) => [...l, { role: 'user', text }, { role: 'assistant', text: out.reply }]);
      setDraft('');
      if (out.done) setDone(true);
    } catch (e) {
      setError(failureText(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col gap-4 overflow-y-auto px-4 py-6">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" onClick={onBack}>← Leave</Button>
        <p className="flex items-center gap-1 text-xs text-muted-foreground" role="status">
          <Lock className="size-3.5" aria-hidden="true" />
          {checked === 'checking' ? 'Checking the enclave…' : checked === 'ok' ? 'Sealed: enclave confirmed by your device' : 'Enclave not confirmed'}
        </p>
      </div>
      <Card className="space-y-1 p-3 text-xs text-muted-foreground">
        <p>{MODES.sealed.checks}</p>
        <p>{MODES.sealed.limits[0]}</p>
        {checked === 'ok' && coach.current!.hardware && (
          <details>
            <summary className="cursor-pointer">What your device checked</summary>
            <ul className="mt-1 list-disc space-y-0.5 pl-5">
              <li>The enclave&rsquo;s hardware report is signed by Intel, up to Intel&rsquo;s root certificate, which is built into this site.</li>
              <li>The key your messages are encrypted to was made inside that machine, for this conversation.</li>
              <li>The machine is not in debug mode.</li>
              <li>Which code it runs. Its fingerprint is <code className="break-all">{coach.current!.hardware.composeHash.slice(0, 16)}</code>.</li>
              {coach.current!.hardware.gpu && <li>The GPU evidence was made for this conversation.</li>}
            </ul>
            <p className="mt-1">Still taken on Venice&rsquo;s word: {RELIES_ON_VENICE.join('; ')}.</p>
          </details>
        )}
      </Card>

      <ol className="flex-1 space-y-3" aria-label="Conversation" aria-live="polite">
        {lines.map((l, i) => (
          <li key={i} className={l.role === 'user' ? 'ml-auto max-w-[85%] rounded-lg p-3 text-sm' : l.role === 'assistant' ? 'max-w-[85%] rounded-lg border border-border p-3 text-sm' : 'rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground'} style={l.role === 'user' ? { background: `linear-gradient(135deg, ${colors.color1}33, ${colors.color2}33)` } : undefined}>
            <p className="sr-only">{l.role === 'user' ? 'You' : l.role === 'assistant' ? 'The AI' : 'The site'}:</p>
            <p className="whitespace-pre-wrap">{l.text}</p>
          </li>
        ))}
      </ol>

      {flag && <FlagNotice flag={flag.flag} flaggedMessage={flag.text} />}
      {error && <p role="alert" className="text-sm">{error}</p>}
      {notice && <p role="status" className="text-sm">{notice}</p>}
      {blockedNote && <p role="status" className="text-sm">{blockedNote}</p>}

      {done ? (
        <Card className="space-y-2 p-4 text-sm">
          <p>{flag ? 'This conversation has ended.' : 'That was the last of the five exchanges.'} Nothing from it was kept, here or anywhere else.</p>
          <Button variant="outline" onClick={onBack}>Back to the start</Button>
        </Card>
      ) : (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <label htmlFor="sealed-draft" className="text-xs text-muted-foreground">
            Exchange {Math.min(turns + 1, TURNS)} of {TURNS}. Please keep names out: the checks on your device catch some, not all.
          </label>
          <textarea id="sealed-draft" className="min-h-24 w-full rounded-md border border-border bg-background p-3 text-sm" maxLength={MAX_SEALED_USER_CHARS} value={draft} onChange={(e) => setDraft(e.target.value)} disabled={busy || checked !== 'ok'} />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{draft.length}/{MAX_SEALED_USER_CHARS}</span>
            <Button type="submit" disabled={busy || !draft.trim() || checked !== 'ok'}>{busy ? 'Sending…' : 'Seal and send'}</Button>
          </div>
        </form>
      )}
      <p className="text-xs text-muted-foreground">The coach is an AI. It is not therapy and it is not for emergencies. In the US, call or text 988.</p>
    </div>
  );
}
