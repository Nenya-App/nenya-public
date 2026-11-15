import { useState } from 'react';
import type { SubmitReceipt } from '../../lib/reportSubmission';

// Shown once, after a report or message is sent (src/lib/submissions.ts): the code that deletes it. Nenya keeps only a scrambled copy of the code, so it cannot
// be shown again or recovered. Without it, the message is still deleted after 90 days.
export function DeletionCode({ receipt }: { receipt: SubmitReceipt | null }) {
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
        We keep it until {until}, then it is deleted on its own. To delete it sooner, keep this code. You can use it at{' '}
        <a href="/my-transcript/" className="underline underline-offset-4">nenya.biz/my-transcript</a>. It is shown only once.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <code className="break-all rounded bg-muted px-2 py-1 font-mono">{receipt.code}</code>
        <button type="button" onClick={copy} className="min-h-11 rounded-md border border-border px-3 text-xs">
          {copied ? 'Copied' : 'Copy code'}
        </button>
      </div>
    </div>
  );
}
