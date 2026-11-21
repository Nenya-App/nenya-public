// The words around an in-app link to an About page or to the Terms, so the sentence always says plainly where the link goes:
// "You can read about this on the About page" (or "...the Terms page"). One place for the wording; the components in
// src/app/components/AboutPageLink.tsx use it, and tests/external-links.test.mts checks it.
import { ABOUT_TITLES, aboutPath } from './aboutRoutes.ts';

export const READ_LEAD = 'You can read about this on the ';

export interface PageLinkWords {
  /** The words before the link. */
  lead: string;
  /** The words that are the link. */
  linkText: 'About page' | 'Terms page';
  /** The title of the page, for a person using a screen reader: the link's name says which page it is. */
  title: string;
  /** The address of the page. */
  href: string;
  /** The words after the link, ending the sentence. */
  tail: string;
}

/** Returns null when the page id is not one of the About pages. `detail` is a visible note after the link, like a section number or the page's name. */
export function pageLinkWords(page: string, detail?: string): PageLinkWords | null {
  const title = ABOUT_TITLES[page];
  if (!title) return null;
  const d = detail?.trim();
  return { lead: READ_LEAD, linkText: page === 'terms' ? 'Terms page' : 'About page', title, href: aboutPath(page), tail: d ? `: ${d}.` : '.' };
}

/** The visible note for a link in a pre-written answer's list: the page's name, or, for the Terms, the section it points to ("Terms, Section 15" gives "Section 15"). */
export function detailForLabel(page: string, label: string): string | undefined {
  if (page === 'terms') return /^Terms,\s*(.+)$/.exec(label)?.[1];
  return label;
}
