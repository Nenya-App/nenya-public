// The small card beneath a reply the site wrote itself as a pre-written answer (src/lib/aboutNenya.ts): the title, the rest of the answer on request,
// and links to the About pages and the repository. Links open in a new tab so the conversation, which lives only in this tab, is not lost.
import { BookOpen } from 'lucide-react';
import { AboutPageLink } from '../app/components/AboutPageLink';
import { EXTERNAL_LINK_CLASS, ExternalLink, LinkedText } from '../app/components/ExternalLink';
import { detailForLabel } from '../lib/pageLinkWords';
import { safeExternalHref } from '../lib/externalLinks';

export interface AnswerCardData {
  id: string;
  title: string;
  more: string[];
  links: { label: string; page?: string; href?: string }[];
  /** True when only the first part of the reply is the site's answer and the rest is the AI's. */
  partial?: boolean;
}

export function AnswerCard({ card }: { card: AnswerCardData }) {
  // A link to an About page or the Terms is a sentence ("You can read about this on the About page"); a link to another site is a labelled external link.
  const links = card.links.filter((l) => (l.page && !l.href) || (l.href && safeExternalHref(l.href)));
  return (
    <aside aria-label={`More about: ${card.title}`} className="ml-9 max-w-[85%] space-y-2 rounded-xl border border-border bg-muted/30 p-3 text-xs leading-relaxed">
      <p className="flex items-center gap-2 text-foreground">
        <BookOpen className="size-3.5 shrink-0" aria-hidden="true" />
        <span>{card.partial ? 'The first part of this reply was written by the site, not the AI' : 'Written by the site, not the AI'}: {card.title}</span>
      </p>
      {card.more.length > 0 && (
        <details>
          <summary className="cursor-pointer text-muted-foreground underline underline-offset-4 hover:text-foreground">Read the full answer</summary>
          <div className="mt-2 space-y-2 text-muted-foreground">
            {card.more.map((p, i) => (
              <p key={i}><LinkedText text={p} /></p>
            ))}
          </div>
        </details>
      )}
      {links.length > 0 && (
        <ul className="space-y-1">
          {links.map((l) => (
            <li key={(l.href ?? l.page) + l.label}>
              {l.href
                ? <ExternalLink href={l.href}>{l.label}</ExternalLink>
                : <AboutPageLink page={l.page!} detail={detailForLabel(l.page!, l.label)} newTab className={EXTERNAL_LINK_CLASS} />}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
