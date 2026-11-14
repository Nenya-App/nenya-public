import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';

const SITE_URL = 'https://nenya.biz';
const SHARE_TEXT = 'Nenya: a free, private place to pause, breathe, and find words for what you feel.';

interface ShareNenyaProps {
  /** "link" is a quiet text control for footers; "button" is an outlined button; "header" is a small ghost button with the word "Share" and "icon" is the icon alone (for narrow headers). */
  variant?: 'button' | 'link' | 'header' | 'icon';
}

// Invites someone else to try Nenya. Always shares the whole site, never a
// session, a conversation, or anything the visitor entered.
export function ShareNenya({ variant = 'link' }: ShareNenyaProps) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title: 'Nenya', text: SHARE_TEXT, url: SITE_URL });
        return;
      }
      await navigator.clipboard.writeText(SITE_URL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Closing the share sheet is not an error. If copying is blocked there is nothing to report.
    }
  };

  if (variant === 'header' || variant === 'icon') {
    return (
      <button
        type="button"
        onClick={share}
        className={`inline-flex items-center justify-center gap-2 rounded-md text-sm hover:bg-muted ${variant === 'icon' ? 'size-9 max-[359px]:size-8' : 'h-9 px-3'}`}
        aria-label={copied ? 'Link copied' : 'Share Nenya with someone'}
        title="Share Nenya with someone"
      >
        {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
        {variant === 'header' && <span aria-live="polite">{copied ? 'Copied' : 'Share'}</span>}
      </button>
    );
  }

  const base =
    variant === 'button'
      ? 'inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm hover:bg-muted'
      : 'inline-flex items-center gap-1.5 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground';

  return (
    <button type="button" onClick={share} className={base}>
      {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
      <span aria-live="polite">{copied ? 'Link copied' : 'Share Nenya with someone'}</span>
    </button>
  );
}
