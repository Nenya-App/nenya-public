import { useEffect, useId, useRef, useState } from 'react';
import { Button } from './ui/button';

// The screen a person sees before a report, a reflection summary or a message is sent (owner, 2026-11-18). It has the same shape and tone as the choices screen for a
// signed transcript (src/coach/TranscriptChoices.tsx): what is being sent comes first, exactly as it will be sent; then who reads it, what we may do with it, how long
// we keep it, and the deletion code. Sending needs an unticked box, "I am 18 or older"; Send stays off until it is ticked. Send and Don't send look the same.
// Nothing leaves the device until Send is pressed here. Focus moves to the heading when it opens; Escape means Don't send.
export interface ConsentPart {
  label: string;
  text: string;
}

export function SendConsent({ kind, parts, busy = false, failed = false, onSend, onCancel }: { kind: string; parts: ConsentPart[]; busy?: boolean; failed?: boolean; onSend: () => void; onCancel: () => void }) {
  const [adult, setAdult] = useState(false);
  const head = useRef<HTMLHeadingElement>(null);
  const id = useId();
  useEffect(() => {
    head.current?.focus();
  }, []);
  const shown = parts.filter((p) => p.text.trim());
  return (
    <section
      aria-labelledby={`${id}-title`}
      className="space-y-4 rounded-lg border-2 border-border bg-card p-4 text-left text-sm text-foreground"
      onKeyDown={(e) => {
        if (e.key === 'Escape' && !busy) onCancel();
      }}
    >
      <h3 id={`${id}-title`} ref={head} tabIndex={-1} className="text-base font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring">
        Before you send this {kind}
      </h3>
      <p className="text-muted-foreground">Nothing is sent until you press Send. This is exactly what we would receive:</p>
      {shown.map((p) => (
        <div key={p.label} className="space-y-1">
          <p className="font-medium">{p.label}</p>
          <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-2 text-xs text-foreground">{p.text}</pre>
        </div>
      ))}
      <ul className="list-disc space-y-1 pl-5">
        <li><b>Who reads it:</b> a person at Nenya.</li>
        <li><b>What we may do with it:</b> read it, use it to understand problems and improve Nenya, and share it only in a form with nothing that names you.</li>
        <li><b>How long we keep it:</b> 90 days. Then it is deleted on its own.</li>
        <li><b>Deleting it sooner:</b> after you send, we show you a deletion code, once. Keep it. With it, you can delete what you sent at any time, at nenya.biz/my-transcript. We cannot show the code again.</li>
      </ul>
      <p className="text-muted-foreground">Please check that it has no names or contact details you want to keep private. If you would like a reply, say how to reach you in the text itself.</p>
      <label className="flex items-start gap-3">
        <input type="checkbox" className="mt-1 size-5" checked={adult} onChange={(e) => setAdult(e.target.checked)} />
        <span>
          I am 18 or older.
          <span className="block text-xs text-muted-foreground">Sending is for people 18 and over. If you are younger, you are welcome to keep using Nenya, but please do not send this.</span>
        </span>
      </label>
      {!adult && <p role="status" className="text-xs text-muted-foreground">Tick the box above to be able to send.</p>}
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" size="lg" className="min-w-36 border-2" disabled={!adult || busy} onClick={onSend}>
          {busy ? 'Sending…' : 'Send'}
        </Button>
        <Button type="button" variant="outline" size="lg" className="min-w-36 border-2" disabled={busy} onClick={onCancel}>
          Don&rsquo;t send
        </Button>
      </div>
      {failed && (
        <p role="alert" className="text-xs text-destructive">
          That did not send. You can try again, or email info@nenya.biz.
        </p>
      )}
    </section>
  );
}
