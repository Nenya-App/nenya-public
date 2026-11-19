import { useState } from 'react';
import { DUPLICATE_MESSAGE, type SubmitReceipt } from '../../lib/reportSubmission';

/** Puts the person back where they were in the conversation (focus and scroll), without reloading: the conversation lives in this tab's page. */
export function backToConversation(): void {
  const el = document.getElementById('coach-input') ?? document.getElementById('coach-title') ?? document.getElementById('main-content');
  if (!el) return;
  el.scrollIntoView({ block: 'center' });
  (el as HTMLElement).focus({ preventScroll: true });
}

/** Where to go next after sending: the transcript page (to take back or change what was sent) and, from the coach, a way back to the conversation. */
export function AfterSending({ fromCoach = false }: { fromCoach?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href="/my-transcript/"
        {...(fromCoach ? { target: '_blank', rel: 'noopener' } : {})}
        className="inline-flex min-h-11 items-center underline underline-offset-4"
      >
        Go to your transcript page{fromCoach ? ' (opens in a new tab, so your conversation stays here)' : ''}
      </a>
      {fromCoach && (
        <button type="button" onClick={backToConversation} className="min-h-11 rounded-md border border-border px-3 text-xs">
          Back to your conversation
        </button>
      )}
    </div>
  );
}

/** Shown instead of the form when exactly this was already sent (refused by the server, or remembered by this tab). */
export function AlreadySent({ fromCoach = false }: { fromCoach?: boolean }) {
  return (
    <div className="space-y-2 rounded-lg border border-border p-3 text-xs sm:text-sm" role="status">
      <p>{DUPLICATE_MESSAGE}</p>
      <AfterSending fromCoach={fromCoach} />
    </div>
  );
}

// Shown once, after a report or message is sent (src/lib/submissions.ts): the code that deletes it. Nenya keeps only a scrambled copy of the code, so it cannot
// be shown again or recovered. Without it, the message is still deleted after 90 days.
export function DeletionCode({ receipt, fromCoach = false }: { receipt: SubmitReceipt | null; fromCoach?: boolean }) {
  const [copied, setCopied] = useState(false);
  if (!receipt) return null;
  const until = new Date(receipt.keepUntil).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(receipt.code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="space-y-2 rounded-lg border border-border p-3 text-xs sm:text-sm" role="status">
      <p>
        We keep it until {until}, then it is deleted on its own. To delete it sooner, keep this code. You can use it at nenya.biz/my-transcript. It is shown only once.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <code className="break-all rounded bg-muted px-2 py-1 font-mono">{receipt.code}</code>
        <button type="button" onClick={copy} className="min-h-11 rounded-md border border-border px-3 text-xs">
          {copied ? 'Copied' : 'Copy code'}
        </button>
      </div>
      <AfterSending fromCoach={fromCoach} />
    </div>
  );
}
