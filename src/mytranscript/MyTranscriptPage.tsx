import { useState } from 'react';
import { EmergencyExitDock } from '../app/components/EmergencyExit';
import { extractSigned, verifySigned, type SignedFile } from '../lib/verifyTranscript';
import { USES, USE_LABELS } from '../lib/transcriptPolicy';
import { CONTACT_EMAIL, KEEP_KEY_PLANNED, KEEP_KEY_POLICY, REVIEW_DAYS } from '../lib/keepTheKey';

// Change or take back what you allowed us to do with a transcript you sent (docs/transcript-consent-scope.md). The signed file is the key: it is checked in
// this browser first, and only when you press the button is it sent to /api/transcript-revoke. A request can only remove permissions. This page is separate
// from /verify/, which sends nothing at all.

type State = { stop: string[]; deleteNow: boolean; sending: boolean; result: string | null };

export default function MyTranscriptPage() {
  const [pasted, setPasted] = useState('');
  const [file, setFile] = useState<SignedFile | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [t, setT] = useState<State>({ stop: [], deleteNow: false, sending: false, result: null });

  const load = async (text: string) => {
    setProblem(null);
    setFile(null);
    setT({ stop: [], deleteNow: false, sending: false, result: null });
    const got = extractSigned(text);
    if (!got) return setProblem('This does not look like a signed Nenya transcript. Use the .json file, or the readable .txt copy that carries it.');
    const outcome = await verifySigned(got.file);
    if (outcome.status !== 'valid') return setProblem(outcome.status === 'invalid' || outcome.status === 'unsupported' ? outcome.message : 'This file could not be checked.');
    setFile(got.file as SignedFile);
  };
  const onFile = (f: File | undefined) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => void load(String(r.result ?? ''));
    r.onerror = () => setProblem('That file could not be read.');
    r.readAsText(f);
  };

  const nothing = !t.deleteNow && t.stop.length === 0;
  const send = async () => {
    if (!file) return;
    setT((x) => ({ ...x, sending: true, result: null }));
    let msg: string;
    try {
      const res = await fetch('/api/transcript-revoke', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ signed: file, stop: t.stop, deleteNow: t.deleteNow }) });
      const j = await res.json().catch(() => ({}));
      msg = res.ok
        ? t.deleteNow
          ? 'Done. Every copy we held, including any public copy, has been deleted now. Only a marker with the transcript\u2019s fingerprint and the date remains. Our notification email never held the conversation.'
          : 'Done. Those permissions are taken back, and a public copy, if you had allowed one, is down now.'
        : res.status === 404
          ? 'We have nothing on record for this transcript. It may never have been sent to us, or it has already been deleted.'
          : j?.reason
            ? `This file was not accepted (${j.reason}). Use the signed .json file or the readable copy that carries it.`
            : 'That did not go through. You can email info@nenya.biz with the file instead.';
    } catch {
      msg = 'That did not go through. You can email info@nenya.biz with the file instead.';
    }
    setT((x) => ({ ...x, sending: false, result: msg }));
  };

  return (
    <div className="fixed inset-0 overflow-y-auto overflow-x-hidden">
      <EmergencyExitDock show />
      <main className="mx-auto max-w-2xl space-y-8 px-4 py-10 text-foreground">
        <header className="space-y-2">
          <h1 className="text-3xl">Change or take back what you allowed</h1>
          <p className="text-sm text-muted-foreground">
            If you sent a coach transcript to Nenya, you chose what we may do with it and for how long. Here you can stop any of those uses, take a public copy down, or ask for it
            to be deleted. Choose the signed file you downloaded (the .json file, or the readable .txt copy). It is checked on your device first; nothing is sent until you press the
            button below. A request can only remove permissions, never add them.
          </p>
        </header>

        <section className="space-y-3" aria-label="Choose a file">
          <label className="block space-y-1 text-sm">
            <span>The signed transcript file</span>
            <input type="file" accept=".json,.txt,application/json,text/plain" onChange={(e) => onFile(e.target.files?.[0])} className="block w-full text-sm" />
          </label>
          <label className="block space-y-1 text-sm">
            <span>Or paste it here</span>
            <textarea value={pasted} onChange={(e) => setPasted(e.target.value)} rows={4} className="w-full rounded-md border border-border bg-background p-2 text-xs" />
          </label>
          <button type="button" className="rounded-md border border-border px-3 py-1.5 text-sm disabled:opacity-50" disabled={!pasted.trim()} onClick={() => void load(pasted)}>Check what I pasted</button>
          {problem && <p role="alert" className="text-sm text-destructive">{problem}</p>}
        </section>

        {file && (
          <section className="space-y-3 rounded-2xl border border-border p-5" aria-label="What to take back">
            <p className="text-sm" role="status">This is a genuine Nenya transcript (signature checked on your device).</p>
            <fieldset className="space-y-2 text-sm">
              <legend className="font-medium">What do you want to take back?</legend>
              {USES.map((u) => (
                <label key={u} className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1 size-4" disabled={t.deleteNow} checked={t.stop.includes(u)} onChange={() => setT((x) => ({ ...x, stop: x.stop.includes(u) ? x.stop.filter((y) => y !== u) : [...x.stop, u] }))} />
                  <span>Stop: {USE_LABELS[u].label.charAt(0).toLowerCase() + USE_LABELS[u].label.slice(1)}</span>
                </label>
              ))}
              <label className="flex items-start gap-2">
                <input type="checkbox" className="mt-1 size-4" checked={t.deleteNow} onChange={() => setT((x) => ({ ...x, deleteNow: !x.deleteNow }))} />
                <span><b>Delete it</b>: remove it from everything we hold and take down any public copy.</span>
              </label>
            </fieldset>
            <button type="button" className="rounded-md border border-border px-3 py-1.5 text-sm disabled:opacity-50" disabled={nothing || t.sending} onClick={() => void send()}>{t.sending ? 'Sending…' : 'Send this request'}</button>
            {t.result && <p role="status" className="text-sm">{t.result}</p>}
          </section>
        )}

        <footer className="space-y-2 text-sm text-muted-foreground">
          <p>If you sent more than one signed copy of the same conversation (for example, one signed partway through and one at the end), each copy is its own submission with its own permissions. Changing or deleting one does not change the others: to change or delete each one, show each file.</p>
          <p>We cannot recall copies other people made of something that was public. Whoever holds the signed file can make this request, so keep it as private as the conversation. The file proves it is genuine; it does not prove who you are.</p>
          <section aria-label="If you no longer have the file" className="space-y-2 rounded-lg border border-border p-3">
            <p className="font-medium text-foreground">If you no longer have the signed file</p>
            <p>{KEEP_KEY_POLICY}</p>
            <p>
              Without the file, email <a className="underline underline-offset-4" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> to ask for a review. We can then only remove permissions
              or delete it. It can take up to {REVIEW_DAYS} days, and you will need to tell us what the conversation contained and when it happened so we can find it.
            </p>
            <p>{KEEP_KEY_PLANNED}</p>
          </section>
          <p>To only check a transcript, with nothing sent anywhere, use <a className="underline underline-offset-4" href="/verify/">nenya.biz/verify</a>.</p>
        </footer>
      </main>
    </div>
  );
}
