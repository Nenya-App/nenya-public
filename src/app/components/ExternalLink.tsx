import type { CSSProperties, ReactNode } from 'react';
import { linkify, safeExternalHref } from '../../lib/externalLinks';

// The one way the site and the coach show a link to another site: a real anchor that opens in a new tab (so the conversation, which lives only in
// this tab, is not lost), underlined, in the link color that meets AAA contrast on the page, and named "(opens in a new tab)" for a screen reader.
// An address that is not a plain https address is not made into a link at all: the words are shown as text.
export const EXTERNAL_LINK_CLASS = 'text-nenya-gold-text dark:text-nenya-accent-warm underline underline-offset-4 hover:text-foreground';

export function ExternalLink({ href, children, className, style }: { href: string; children: ReactNode; className?: string; style?: CSSProperties }) {
  const safe = safeExternalHref(href);
  if (!safe) return <>{children}</>;
  return (
    <a href={safe} target="_blank" rel="noopener noreferrer" className={className ?? EXTERNAL_LINK_CLASS} style={style}>
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/**
 * Text with its web addresses made into links, drawn as React text nodes and anchors (never as HTML), so it is safe for words the AI wrote.
 * `wrapText` lets a caller wrap the plain pieces (for example in a phone link) without putting one link inside another.
 */
export function LinkedText({ text, wrapText, className }: { text: string; wrapText?: (node: ReactNode, i: number) => ReactNode; className?: string }) {
  return (
    <>
      {linkify(text).map((p, i) =>
        p.kind === 'link'
          ? <ExternalLink key={i} href={p.href} className={className}>{p.text}</ExternalLink>
          : wrapText ? <span key={i}>{wrapText(p.text, i)}</span> : p.text,
      )}
    </>
  );
}
