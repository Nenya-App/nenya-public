import { useState } from 'react';
import { Download, Send } from 'lucide-react';
import { Button } from '../app/components/ui/button';
import { submitReport } from '../lib/reportSubmission';
import {
  dayStamp,
  downloadText,
  readableTranscript,
  signedJson,
  type Receipt,
  type SessionColors,
  type TranscriptMsg,
} from '../lib/transcript';

const ENDPOINT = '/api/coach';
const MAX_SHARE_CHARS = 19000; // the report form's limit is 20,000

interface TranscriptToolsProps {
  messages: TranscriptMsg[];
  session: SessionColors;
  /** Ticket from the last reply. Absent when the conversation ended on a safety flag. */
  ticket?: string;
}

type Share = 'closed' | 'preview' | 'sending' | 'sent' | 'error';

// Everything here is the visitor's choice. Signing sends the conversation back to
// our server once more (it was already there, turn by turn) so it can confirm it
// is untouched and date it. Nothing is stored. Sharing with Nenya shows exactly
// what would be sent first.
export function TranscriptTools({ messages, session, ticket }: TranscriptToolsProps) {
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [signNote, setSignNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [share, setShare] = useState<Share>('closed');

  const canSign = !!ticket;

  const getReceipt = async (): Promise<Receipt | null> => {
    if (receipt) return receipt;
    if (!canSign) return null;
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'receipt', messages, session, ticket }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { receipt: Receipt };
      setReceipt(data.receipt);
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
    if (r) downloadText(`nenya-coach-transcript-${dayStamp(r.issuedAt)}.json`, 'application/json', signedJson(messages, session, r));
  };

  const downloadReadable = async () => {
    setBusy(true);
    const r = await getReceipt();
    setBusy(false);
    downloadText(`nenya-coach-transcript-${dayStamp(r?.issuedAt)}.txt`, 'text/plain', readableTranscript(messages, session, r));
  };

  const openShare = async () => {
    setBusy(true);
    await getReceipt();
    setBusy(false);
    setShare('preview');
  };

  const shareText = readableTranscript(messages, session, receipt);
  const tooLong = shareText.length > MAX_SHARE_CHARS;

  const sendToNenya = async () => {
    if (tooLong || share === 'sending') return;
    setShare('sending');
    try {
      await submitReport({ type: 'coach-transcript', report: shareText });
      setShare('sent');
    } catch {
      setShare('error');
    }
  };

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-card p-5" aria-label="Keep a record">
      <h2 className="text-lg">Keep a record</h2>
      <p className="text-sm text-muted-foreground">
        {canSign
          ? 'Nenya can sign and date this conversation so no one can alter it afterward. Nothing is stored; you keep the file.'
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
            Send to Nenya
          </Button>
        )}
      </div>
      {signNote && <p className="text-xs text-muted-foreground">{signNote}</p>}

      {(share === 'preview' || share === 'sending' || share === 'error') && (
        <div className="space-y-3 rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">
            This is exactly what Nenya would receive. It goes to us the same way a report does. Please check it
            contains nothing you want to keep private.
          </p>
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-2 text-xs">{shareText}</pre>
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
