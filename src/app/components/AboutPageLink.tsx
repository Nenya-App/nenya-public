import { pageLinkWords } from '../../lib/pageLinkWords';

// The one way the site links to an About page or to the Terms: the words around the link say it plainly ("You can read about this on the About page",
// or "...the Terms page"), and the link is part of the sentence. Where the app handles the move itself, pass `onOpen` and a button is drawn in the
// same words; otherwise it is a real link to the page's address. With `inline`, only the link is drawn, for a sentence of your own that has
// "the" in front of it. `newTab` is for places where the visitor's place in a conversation must not be lost.
export const PAGE_LINK_CLASS = 'underline underline-offset-4 hover:text-foreground';

export function AboutPageLink({ page, detail, inline, newTab, onOpen, className }: {
  page: string;
  /** A visible note after the link: the page's name, or a section number. */
  detail?: string;
  inline?: boolean;
  newTab?: boolean;
  onOpen?: () => void;
  className?: string;
}) {
  const w = pageLinkWords(page, detail);
  if (!w) return null;
  const cls = className ?? PAGE_LINK_CLASS;
  const name = (
    <>
      {w.linkText}
      <span className="sr-only">, {w.title}{newTab ? ' (opens in a new tab)' : ''}</span>
    </>
  );
  const link = onOpen
    ? <button type="button" onClick={onOpen} className={cls}>{name}</button>
    : <a href={w.href} className={cls} {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{name}</a>;
  if (inline) return link;
  return <>{w.lead}{link}{w.tail}</>;
}
