// Shared citation pieces for the About pages (the About thesis, 2026-11-22: docs/about-thesis.md).
// <Cite pageId="breath" n={[1, 2]} /> puts "[1, 2]" in a sentence; each number is a real link to its entry in <ReferenceList> at the bottom of the same page.
// The list gives authors, year, title, journal and a free link where one exists. General citations only (no page numbers).
import type { ReactNode } from 'react';

export interface AboutReference {
  /** The number shown in the text and in the list. */
  n: number;
  /** The full reference as plain text: authors (year). Title. Journal. */
  text: string;
  /** A free-to-read link (DOI, PubMed Central or a repository), when there is one. */
  href?: string;
  /** Short words for the link, e.g. "Free full text" or "Publisher page (may need payment)". */
  linkLabel?: string;
}

const entryId = (pageId: string, n: number) => `ref-${pageId}-${n}`;

/** The numbers after a sentence, as links. Reads aloud as "Reference 1" and "Reference 2". */
export function Cite({ pageId, n }: { pageId: string; n: number | number[] }) {
  const list = Array.isArray(n) ? n : [n];
  return (
    <span className="whitespace-nowrap text-xs align-baseline">
      <span aria-hidden="true">[</span>
      {list.map((k, i) => (
        <span key={k}>
          {i > 0 && <span aria-hidden="true">, </span>}
          <a href={`#${entryId(pageId, k)}`} aria-label={`Reference ${k}`} className="underline underline-offset-2">{k}</a>
        </span>
      ))}
      <span aria-hidden="true">]</span>
    </span>
  );
}

/** The numbered list at the bottom of a page. */
export function ReferenceList({ pageId, items, heading = 'References', intro }: { pageId: string; items: AboutReference[]; heading?: string; intro?: ReactNode }) {
  return (
    <section aria-labelledby={`${pageId}-refs-h`} className="space-y-3">
      <h3 id={`${pageId}-refs-h`} className="text-xl">{heading}</h3>
      {intro && <p className="text-sm text-muted-foreground">{intro}</p>}
      <ol className="space-y-2 text-sm text-muted-foreground">
        {items.map((r) => (
          <li key={r.n} id={entryId(pageId, r.n)} value={r.n} className="scroll-mt-24">
            {r.text}{' '}
            {r.href && (
              <a href={r.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                {r.linkLabel ?? 'Link'}<span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
