// A short educational card (src/lib/learningCards.ts), shown only after the person says they want to read it. The coach offers it as an invitation under a reply:
// "Read it" opens the card, "No thanks" closes the invitation, and nothing is blocked either way. The words are written by Nenya, drawn from named sources, and
// marked as not written by the AI. Links open in a new tab so the conversation, which lives only in this tab, is not lost.
import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { cardById, othersInSeries, type LearningCard } from '../lib/learningCards';

export function LearningOffer({ cardId }: { cardId: string }) {
  const first = cardById(cardId);
  const [state, setState] = useState<'offered' | 'open' | 'closed'>('offered');
  const [showing, setShowing] = useState<string>(cardId);
  if (!first || state === 'closed') return null;
  const card = cardById(showing) ?? first;
  const next = othersInSeries(card.id)[0];

  if (state === 'offered') {
    return (
      <aside aria-label="An offer to read a short card" className="ml-9 max-w-[85%] space-y-2 rounded-xl border border-border bg-muted/30 p-3 text-xs leading-relaxed">
        <p className="flex items-center gap-2 text-foreground">
          <BookOpen className="size-3.5 shrink-0" aria-hidden="true" />
          <span>Written by Nenya, not the AI: a short read, &ldquo;{first.title}&rdquo;. Only if you would like it.</span>
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={() => setState('open')} className="rounded-md border border-border px-3 py-1.5 hover:bg-accent">Read it</button>
          <button type="button" onClick={() => setState('closed')} className="rounded-md px-3 py-1.5 text-muted-foreground underline underline-offset-4 hover:text-foreground">No thanks</button>
        </div>
      </aside>
    );
  }

  return (
    <article aria-label={card.title} className="ml-9 max-w-[85%] space-y-3 rounded-xl border border-border bg-card p-4 text-sm leading-relaxed">
      <p className="text-xs text-muted-foreground">Written by Nenya, not the AI. A short read.</p>
      <h3 className="text-base" style={{ fontFamily: "'Cinzel',serif" }}>{card.title}</h3>
      {card.contentNote && <p className="text-xs italic text-muted-foreground">{card.contentNote}</p>}
      <p className="font-semibold">{card.key}</p>
      <p>{card.body}</p>
      <p><span className="font-medium">Something to try: </span>{card.tryIt}</p>
      <p className="text-xs text-muted-foreground">
        {card.where}
        {card.url && (
          <>
            {' '}
            <a href={card.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground">
              Read the source<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </>
        )}
      </p>
      {card.more && (
        <details>
          <summary className="cursor-pointer text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground">Read more</summary>
          <div className="mt-2 space-y-2 text-sm">{card.more.split(/\n\n+/).map((p, i) => <p key={i}>{p}</p>)}</div>
        </details>
      )}
      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3 text-xs">
        <button type="button" onClick={() => setState('closed')} className="rounded-md border border-border px-3 py-1.5 hover:bg-accent">Back to the conversation</button>
        {next && <button type="button" onClick={() => setShowing(next.id)} className="rounded-md px-3 py-1.5 text-muted-foreground underline underline-offset-4 hover:text-foreground">Read another: {next.title}</button>}
        <button type="button" onClick={() => setState('closed')} className="rounded-md px-3 py-1.5 text-muted-foreground underline underline-offset-4 hover:text-foreground">Stop here</button>
      </div>
    </article>
  );
}

export type { LearningCard };
