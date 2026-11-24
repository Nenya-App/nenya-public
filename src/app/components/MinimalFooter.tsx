import type { ReactNode } from 'react';
import { ForgetMeLink } from './DeviceMemoryControls';
import { NON_AFFILIATION } from '../../lib/tolkienNotice';

// The small footer, for the pages and screens that have no room for the full one (AppFooter): the transcript pages, the partner-practice page,
// and the steps of the coach and the app that come before a conversation. It carries what every page must: the Forget me link (the terms, the privacy
// page and the safety features card say it is at the bottom of every page; tests/forget-me-footers.test.mts keeps that true), the way to reach us, and
// the standing non-affiliation notice. `extra` is for a sentence that belongs beside the link on one page (the partner page says what Forget me does to an open cell).
export function MinimalFooter({ className = '', extra }: { className?: string; extra?: ReactNode }) {
  return (
    <footer className={`shrink-0 border-t border-border bg-background/95 px-4 py-4 text-xs text-muted-foreground ${className}`}>
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-2 text-center">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <ForgetMeLink />
          <a href="mailto:info@nenya.biz" className="underline underline-offset-2 transition-colors hover:text-foreground">
            Contact: info@nenya.biz
          </a>
          <a href="https://github.com/Nenya-App/nenya-public" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 transition-colors hover:text-foreground">
            Open source on GitHub (AGPL-3.0)
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
        {extra}
        <p lang="en">{NON_AFFILIATION}</p>
      </div>
    </footer>
  );
}
