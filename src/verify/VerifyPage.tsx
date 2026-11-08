import { useState } from 'react';
import { EmergencyExitDock } from '../app/components/EmergencyExit';
import { PUBLISHED_KEY_IDS, extractSigned, readableMatches, verifySigned, type SignedFile, type VerifyOutcome } from '../lib/verifyTranscript';

// A page for checking a signed Nenya coach-demo transcript (the .json file, or the readable .txt copy that carries it).
// Everything happens in this browser: the file is read here and checked here, and nothing is sent anywhere. The page
// counts nothing and stores nothing.

type Shown = { outcome: VerifyOutcome; readable?: 'matches' | 'changed' };

export default function VerifyPage() {
  const [pasted, setPasted] = useState('');
  const [shown, setShown] = useState<Shown | null>(null);
  const [busy, setBusy] = useState(false);

  const check = async (text: string) => {
    setBusy(true);
    setShown(null);
    try {
      const got = extractSigned(text);
      if (!got) {
        setShown({ outcome: { status: 'invalid', reason: 'shape', message: 'This does not look like a signed Nenya transcript. Use the .json file, or the readable .txt copy with the signed block at its end.' } });
        return;
      }
      const outcome = await verifySigned(got.file);
      let readable: Shown['readable'];
      if (outcome.status === 'valid' && got.readableAbove !== undefined) {
        readable = readableMatches(got.readableAbove, got.file as SignedFile) ? 'matches' : 'changed';
      }
      setShown({ outcome, readable });
    } finally {
      setBusy(false);
    }
  };

  const onFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => void check(String(reader.result ?? ''));
    reader.onerror = () => setShown({ outcome: { status: 'invalid', reason: 'shape', message: 'That file could not be read.' } });
    reader.readAsText(file);
  };

  const o = shown?.outcome;
  return (
    <div className="fixed inset-0 overflow-y-auto overflow-x-hidden">
      <EmergencyExitDock show />
      <main className="mx-auto max-w-2xl space-y-8 px-4 py-10 text-foreground">
        <header className="space-y-2">
          <h1 className="text-3xl">Check a Nenya transcript</h1>
          <p className="text-sm text-muted-foreground">
            A signed transcript from the Nenya coach demo carries a signature that proves it has not been edited since it was
            made. Choose the file here (the .json file, or the readable .txt copy) and it is checked on your device. Nothing is
            uploaded, and this page keeps nothing.
          </p>
        </header>

        <section className="space-y-4" aria-label="Choose a file">
          <label className="block space-y-1 text-sm">
            <span className="block">Choose a signed transcript file</span>
            <input type="file" accept=".json,.txt,text/plain,application/json" onChange={(e) => onFile(e.target.files?.[0])} className="block w-full text-sm" />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="block">Or paste its contents</span>
            <textarea value={pasted} onChange={(e) => setPasted(e.target.value)} rows={5} className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs" />
          </label>
          <button type="button" disabled={busy || !pasted.trim()} onClick={() => void check(pasted)} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent disabled:opacity-50">
            Check what I pasted
          </button>
        </section>

        <div role="status" aria-live="polite" className="min-h-6 text-sm text-muted-foreground">
          {busy ? 'Checking…' : ''}
        </div>

        {o?.status === 'valid' && (
          <section className="space-y-3 rounded-2xl border border-border bg-card p-5" aria-label="Result">
            <h2 className="text-xl">Genuine and unedited</h2>
            <p className="text-sm">
              The signature is valid for this exact transcript: its {o.details.messageCount} messages, its date and its colors have not
              changed since Nenya signed it.
            </p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="text-muted-foreground">Signed on</dt>
              <dd>{o.details.issuedAt}</dd>
              <dt className="text-muted-foreground">Key id</dt>
              <dd className="font-mono">{o.details.keyId}</dd>
              <dt className="text-muted-foreground">Session label</dt>
              <dd>
                {o.details.session.color1}.{o.details.session.color2} (a temporary label, not an identity)
              </dd>
              {o.details.meta && (
                <>
                  <dt className="text-muted-foreground">Complete</dt>
                  <dd>{o.details.meta.closed ? 'Yes' : 'No'}, {o.details.meta.exchanges} exchange{o.details.meta.exchanges === 1 ? '' : 's'}</dd>
                  <dt className="text-muted-foreground">Produced by</dt>
                  <dd className="break-words">build {o.details.meta.build}, model {o.details.meta.model}, instructions {o.details.meta.instructions}</dd>
                </>
              )}
            </dl>
            {o.details.publishedKey ? (
              <p className="text-sm">This key is Nenya&rsquo;s published signing key.</p>
            ) : (
              <p role="alert" className="text-sm text-destructive">
                This key is <strong>not</strong> one of Nenya&rsquo;s published keys ({PUBLISHED_KEY_IDS.join(', ')}). The file is intact, but it
                was signed by a different key, such as a test site&rsquo;s. Anyone can sign a made-up transcript with their own key, so do not
                treat it as from Nenya&rsquo;s live site.
              </p>
            )}
            {shown?.readable === 'matches' && <p className="text-sm">The readable text above the signed block matches the signed transcript.</p>}
            {shown?.readable === 'changed' && (
              <p role="alert" className="text-sm text-destructive">
                The readable text in this copy has been changed: it does not match the signed transcript attached to it. Trust only the signed
                transcript.
              </p>
            )}
          </section>
        )}
        {o?.status === 'invalid' && (
          <section className="space-y-2 rounded-2xl border border-destructive p-5" role="alert" aria-label="Result">
            <h2 className="text-xl">Not valid</h2>
            <p className="text-sm">{o.message}</p>
          </section>
        )}
        {o?.status === 'unsupported' && (
          <section className="space-y-2 rounded-2xl border border-border p-5" role="alert" aria-label="Result">
            <h2 className="text-xl">This browser cannot do the check</h2>
            <p className="text-sm">{o.message}</p>
          </section>
        )}

        <footer className="space-y-2 text-sm text-muted-foreground">
          <p>
            What a valid result means, and what it does not, is explained at{' '}
            <a className="underline underline-offset-4" href="https://github.com/Nenya-App/nenya-public/blob/main/docs/coach-transcripts.md" target="_blank" rel="noopener noreferrer">
              docs/coach-transcripts.md
            </a>
            . To check the key id independently, compare it with the published list there.
          </p>
        </footer>
      </main>
    </div>
  );
}
