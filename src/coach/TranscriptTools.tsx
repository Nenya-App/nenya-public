import { useEffect, useRef, useState } from 'react';
import { Download, Send } from 'lucide-react';
import { describeChoices } from '../lib/transcriptPolicy';
import { cardById } from '../lib/learningCards';
import { stopLevelFlagged } from '../lib/publicCopy';
import { TranscriptChoices, choicesToSend, emptyChoices, type ChoiceState } from './TranscriptChoices';
import { Button } from '../app/components/ui/button';
import { Textarea } from '../app/components/ui/textarea';
import { readableWithBlock } from '../lib/verifyTranscript';
import { checkNotesFor, siteMessagesFor } from '../lib/siteMessages';
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
  /** Ticket from the last reply. Absent before the first reply. */
  ticket?: string;
  /** The site ended the conversation by stopping the last message (it never reached the AI). The signed copy then includes that message. */
  stopped?: boolean;
  /** The number of exchanges in a full conversation (the greeting and closing message depend on it). */
  maxTurns?: number;
  /** The replies the site wrote itself as pre-written answers (index in the conversation, and the answer's title). */
  answered?: { index: number; title: string; partial?: boolean }[];
  /** Cards the site offered under replies, with the server's proof of each (the server records only the ones it can prove). */
  offers?: { after: number; id: string; proof: string }[];
}

type Share = 'closed' | 'preview' | 'sending' | 'sent' | 'error';

// Everything here is the visitor's choice. Signing sends the conversation back to
// our server once more (it was already there, turn by turn) so it can confirm it
// is untouched and date it. Nothing is stored. Sharing with Nenya shows exactly
// what would be sent first.
export function TranscriptTools({ messages, session, context = '', ticket, stopped = false, maxTurns = 5, answered = [], offers = [] }: TranscriptToolsProps) {
  const offeredTitles = offers.flatMap((o) => { const t = cardById(o.id)?.title; return t ? [{ after: o.after, title: t }] : []; });
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

  // A conversation stopped on its first message has no earlier exchange, so it has no ticket and needs none.
  const canSign = stopped ? !!ticket || messages.length === 1 : !!ticket;

  const getReceipt = async (): Promise<Receipt | null> => {
    if (receipt) return receipt;
    if (!canSign) return null;
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'receipt', messages, session, ...(offers.length ? { offers } : {}), ...(context ? { context } : {}), ticket, ...(stopped ? { stopped: true } : {}) }),
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
    const readable = readableTranscript(messages, session, r, context, signedRef.current?.meta, signedRef.current?.site ?? siteMessagesFor(messages, maxTurns, answered, context, offeredTitles), signedRef.current?.checks ?? checkNotesFor(messages, context));
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

  const shareText = readableTranscript(messages, session, receipt, context, signed?.meta, signed?.site ?? siteMessagesFor(messages, maxTurns, answered, context, offeredTitles), signed?.checks ?? checkNotesFor(messages, context));
  const tooLong = shareText.length > MAX_SHARE_CHARS;

  // Only a signed transcript can be sent. The function checks the signature first, then forwards the readable text (rebuilt
  // from the signed transcript, so it is exactly the text shown above) with the signed file.
  const [choices, setChoices] = useState<ChoiceState>(emptyChoices());
  const [consentReceipt, setConsentReceipt] = useState<string | null>(null);
  const toSend = choicesToSend(choices);

  const sendToNenya = async () => {
    if (tooLong || share === 'sending' || !receipt || !signedRef.current || !toSend) return;
    setShare('sending');
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signed: { transcript: signedRef.current, receipt }, note: note.trim(), choices: toSend }),
      });
      if (!res.ok) throw new Error(String(res.status));
      // With a signing key the site answers with the person's consent receipt (what they agreed to, signed); they are offered it to keep.
      if (res.status === 200) {
        try {
          const j = (await res.json()) as { consentReceipt?: unknown };
          if (j.consentReceipt) setConsentReceipt(JSON.stringify(j.consentReceipt, null, 2) + '\n');
        } catch {
          /* no receipt; the conversation was still sent */
        }
      }
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
          ? stopped
            ? 'The site stopped your last message with its safety check. If you think that was a mistake, Nenya can sign and date the conversation, including the message that was stopped, so no one can alter it and the check can be shown exactly. The signed copy also shows what the site displayed and, for a flagged message, why the check flagged it. Signing sends the conversation to our server once; nothing is stored, and you keep the file. You can also send the signed transcript to us, with a note.'
            : 'Nenya can sign and date the conversation so far so no one can alter it afterward. It also shows the words the site displayed and, if the safety check flagged a message, why. Nothing is stored; you keep the file. You can also send the signed transcript to us, with a note, if something went wrong.'
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
          <p className="text-xs text-muted-foreground">
            Names and contact details were replaced with placeholders on your device as you wrote, but names are not always caught. What you send is kept in our private store, and a person at Nenya reads it there. If you see a name or detail in the text below that you do not want us to have, close this and download the transcript instead, or delete it afterward at nenya.biz/my-transcript.
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
          <TranscriptChoices value={choices} onChange={setChoices} messages={messages} publishBlocked={stopLevelFlagged(signed ?? signedRef.current)} />
          {tooLong && <p className="text-xs text-destructive">This is too long to send. Download it instead.</p>}
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={sendToNenya} disabled={tooLong || share === 'sending' || !toSend}>
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
      {share === 'sent' && <p className="text-xs text-muted-foreground" role="status">Thank you. Your transcript was sent{toSend ? `. You chose: ${describeChoices({ uses: toSend.uses, keep: toSend.keep, adult: true, terms: toSend.terms, portions: toSend.portions })}` : ''}. To change or take back any of it, keep the signed file you downloaded and show it at nenya.biz/my-transcript.</p>}
      {share === 'sent' && consentReceipt && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Your consent receipt is a small file, signed by Nenya, that says what you agreed to and when. It is your own record, and it does not contain the conversation.</p>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => downloadText(`nenya-consent-receipt-${(receipt?.hash ?? 'transcript').slice(0, 8)}.json`, 'application/json', consentReceipt)}>
            <Download className="size-4" />
            Consent receipt (.json)
          </Button>
        </div>
      )}
    </section>
  );
}
