// About, "The Smithy": the "make your own" guides, a list and one guide at a time, each with its own address (/about/smithy/<slug>).
// The text is the owner-approved Markdown in docs/smithy/, built into src/lib/smithyData.ts (docs/smithy-guides-scope.md). Keeps and sends nothing.
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { AppFooter } from '../AppFooter';
import { SmithyBlocks } from '../SmithyBlocks';
import { SMITHY_GUIDES } from '../../../lib/smithyData';
import { smithyPath, smithySlugFromPath } from '../../../lib/aboutRoutes';

export default function Smithy({ onBack }: { onBack: () => void }) {
  const [slug, setSlug] = useState(() => smithySlugFromPath(window.location.pathname) ?? '');
  const at = SMITHY_GUIDES.findIndex((g) => g.slug === slug);
  const guide = at >= 0 ? SMITHY_GUIDES[at] : undefined;

  const open = (next: string) => {
    window.history.pushState(null, '', smithyPath(next));
    setSlug(next);
  };

  // Back and forward between the list and the guides.
  useEffect(() => {
    const onPop = () => {
      const s = smithySlugFromPath(window.location.pathname);
      if (s !== null) setSlug(s);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    document.title = `${guide ? guide.title : 'The Smithy'} — Nenya`;
    document.querySelectorAll('.scroll-container').forEach((el) => el.scrollTo({ top: 0, behavior: 'instant' }));
  }, [guide]);

  return (
    <div className="size-full overflow-y-auto scroll-container bg-background">
      <div className="sticky top-0 z-10 flex flex-wrap gap-2 border-b border-border bg-background px-4 py-3">
        <Button variant="ghost" onClick={onBack} className="min-h-11 gap-2">
          <ArrowLeft className="size-4" />
          Back to About
        </Button>
        {guide && (
          <Button variant="ghost" onClick={() => open('')} className="min-h-11">All guides</Button>
        )}
      </div>

      <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 md:px-6">
        {guide ? (
          <article className="space-y-6">
            <header className="space-y-2">
              <p className="text-sm text-foreground">The Smithy, guide {guide.number}</p>
              <h1 className="text-3xl text-foreground">{guide.title}</h1>
              <p className="text-base text-foreground">{guide.summary}</p>
            </header>
            <SmithyBlocks blocks={guide.blocks} />
            <nav aria-label="Other guides" className="flex flex-wrap justify-between gap-3 border-t border-border pt-4">
              {at > 0 ? (
                <Button variant="outline" onClick={() => open(SMITHY_GUIDES[at - 1]!.slug)} className="min-h-11 h-auto max-w-full shrink gap-2 whitespace-normal py-2 text-left">
                  <ArrowLeft className="size-4" /> Previous: {SMITHY_GUIDES[at - 1]!.title}
                </Button>
              ) : <span />}
              {at < SMITHY_GUIDES.length - 1 && (
                <Button variant="outline" onClick={() => open(SMITHY_GUIDES[at + 1]!.slug)} className="min-h-11 h-auto max-w-full shrink gap-2 whitespace-normal py-2 text-left">
                  Next: {SMITHY_GUIDES[at + 1]!.title} <ArrowRight className="size-4" />
                </Button>
              )}
            </nav>
          </article>
        ) : (
          <>
            <header className="space-y-3">
              <h1 className="text-3xl text-foreground">The Smithy</h1>
              <p className="text-lg text-foreground">Make your own, on your own device.</p>
              <p className="text-base text-foreground">
                Plain guides to building your own copy of this site on your own computer. No developer experience is needed. The AI coach is not part of it.
              </p>
            </header>
            <ol className="space-y-3">
              {SMITHY_GUIDES.map((g) => (
                <li key={g.slug}>
                  <button
                    onClick={() => open(g.slug)}
                    className="min-h-11 w-full rounded-lg border border-border bg-card p-4 text-left text-foreground hover:bg-muted"
                  >
                    <span className="block text-lg">Guide {g.number}: {g.title}</span>
                    <span className="block text-base">{g.summary}</span>
                  </button>
                </li>
              ))}
            </ol>
          </>
        )}

        <AppFooter />
      </div>
    </div>
  );
}
