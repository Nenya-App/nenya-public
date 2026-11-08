import { useEffect, useRef, useState } from 'react';
import { Download, Send } from 'lucide-react';
import { Button } from '../app/components/ui/button';
import { Textarea } from '../app/components/ui/textarea';
import { readableWithBlock } from '../lib/verifyTranscript';
import {
  downloadText,
  readableTranscript,
  signedJson,
  transcriptFilename,
  type Receipt,
  type SessionColors,
  type SignedTranscript,
  type TranscriptMsg,
} from '../lib/transcript';

const ENDPOINT = '/api/coach';
const MAX_SHARE_CHARS = 19000; // the report form's limit is 20,000

interface TranscriptToolsProps {
  messages: TranscriptMsg[];
  session: SessionColors;
  /** The reflection summary the visitor chose to share, if any. */
  context?: string;
  /** Ticket from the last reply. Absent when the conversation ended on a safety flag. */
  ticket?: string;
}

type Share = 'closed' | 'preview' | 'sending' | 'sent' | 'error';

// Everything here is the visitor's choice. Signing sends the conversation back to
// our server once more (it was already there, turn by turn) so it can confirm it
// is untouched and date it. Nothing is stored. Sharing with Nenya shows exactly
// what would be sent first.
export function TranscriptTools({ messages, session, context = '', ticket }: TranscriptToolsProps) {
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [signed, setSigned] = useState<SignedTranscript | null>(null);
  const signedRef = useRef<SignedTranscript | null>(null); // the latest, for handlers that run before a re-render
  const [signNote, setSignNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [share, setShare] = useState<Share>('closed');
  const [note, setNote] = useState('');

  // A signature covers exactly the messages that existed when it was made. If the
  // conversation moves on, the old one no longer applies.
  useEffect(() => {
    setReceipt(null);
    setSigned(null);
    setSignNote('');
    setShare('closed');
  }, [messages.length]);

  const canSign = !!ticket;

  const getReceipt = async (): Promise<Receipt | null> => {
    if (receipt) return receipt;
    if (!canSign) return null;
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'receipt', messages, session, ...(context ? { context } : {}), ticket }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { receipt: Receipt; transcript: SignedTranscript };
      setReceipt(data.receipt);
      setSigned(data.transcript);
      signedRef.current = data.transcript;
      setSignNote('');
      return data.receipt;
    } catch {
      setSignNote('Signing is not available right now, so this copy is unsigned.');
      return null;
    }
  };

  const downloadSigned = async () => {
    setBusy(true);
    const r = await getReceipt();
    setBusy(false);
    if (r && signedRef.current) downloadText(transcriptFilename(r, 'json'), 'application/json', signedJson(signedRef.current, r));
  };

  const downloadReadable = async () => {
    setBusy(true);
    const r = await getReceipt();
    setBusy(false);
    const readable = readableTranscript(messages, session, r, context, signedRef.current?.meta);
    // A signed copy carries the signed file at its end, so the readable text can be checked against it (see /verify/).
    const text = r && signedRef.current ? readableWithBlock(readable, { transcript: signedRef.current, receipt: r }) : readable;
    downloadText(transcriptFilename(r, 'txt'), 'text/plain', text);
  };

  const openShare = async () => {
    setBusy(true);
    await getReceipt();
    setBusy(false);
    setShare('preview');
  };

  const shareText = readableTranscript(messages, session, receipt, context, signed?.meta);
  const tooLong = shareText.length > MAX_SHARE_CHARS;

  // Only a signed transcript can be sent. The function checks the signature first, then forwards the readable text (rebuilt
  // from the signed transcript, so it is exactly the text shown above) with the signed file.
  const sendToNenya = async () => {
    if (tooLong || share === 'sending' || !receipt || !signedRef.current) return;
    setShare('sending');
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signed: { transcript: signedRef.current, receipt }, note: note.trim() }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setShare('sent');
    } catch {
      setShare('error');
    }
  };

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-card p-5" aria-label="Keep a record">
      <h2 className="text-lg">Keep a record or report a problem</h2>
      <p className="text-sm text-muted-foreground">
        {canSign
          ? 'Nenya can sign and date the conversation so far so no one can alter it afterward. Nothing is stored; you keep the file. You can also send the signed transcript to us, with a note, if something went wrong.'
          : 'This conversation ended before it could be signed. You can still keep a readable copy.'}
      </p>
      <div className="flex flex-wrap gap-2">
        {canSign && (
          <Button variant="outline" size="sm" onClick={downloadSigned} disabled={busy} className="gap-2">
            <Download className="size-4" />
            Signed transcript (.json)
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={downloadReadable} disabled={busy} className="gap-2">
          <Download className="size-4" />
          Readable copy (.txt)
        </Button>
        {canSign && share === 'closed' && (
          <Button variant="outline" size="sm" onClick={openShare} disabled={busy} className="gap-2">
            <Send className="size-4" />
            Report or send verified transcript
          </Button>
        )}
      </div>
      {signNote && <p className="text-xs text-muted-foreground">{signNote}</p>}

      {(share === 'preview' || share === 'sending' || share === 'error') && (
        <div className="space-y-3 rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">
            This is exactly what Nenya would receive, together with the signed file so that we can check it was not changed. Please check it
            contains nothing you want to keep private.
          </p>
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-2 text-xs">{shareText}</pre>
          <label className="block space-y-1 text-xs text-muted-foreground">
            <span>What would you like us to know? (optional, sent with the transcript)</span>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={1000}
              rows={3}
              className="resize-none text-sm"
              placeholder="For example: what felt wrong, or what you would change."
            />
          </label>
          {tooLong && <p className="text-xs text-destructive">This is too long to send. Download it instead.</p>}
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={sendToNenya} disabled={tooLong || share === 'sending'}>
              {share === 'sending' ? 'Sending…' : 'Send'}
            </Button>
            <button
              type="button"
              onClick={() => setShare('closed')}
              className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Cancel
            </button>
          </div>
          {share === 'error' && (
            <p role="alert" className="text-xs text-destructive">
              That did not send. You can email info@nenya.biz instead.
            </p>
          )}
        </div>
      )}
      {share === 'sent' && <p className="text-xs text-muted-foreground">Thank you. Your transcript was sent.</p>}
    </section>
  );
}
