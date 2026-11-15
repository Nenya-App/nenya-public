import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { AppFooter } from '../AppFooter';

// "Witnessed conversations": conversations with the Nenya coach that people chose to share, without their names (docs/transcript-consent-scope.md). Each one was
// anonymized by the site and then read and edited by a person at Nenya before it was shown. It is read live from /api/witnessed, never cached, so a copy that
// its owner takes back (or whose time ends) disappears at once.

interface Item { by: 'person' | 'ai' | 'site'; text: string }
interface Conversation { fingerprint: string; month: string; items: Item[] }

const WRITER: Record<Item['by'], string> = { person: 'The person', ai: 'The AI', site: 'Written by the site, not the AI' };
const monthName = (m: string): string => {
  const d = new Date(`${m}-01T12:00:00Z`);
  return Number.isNaN(d.getTime()) ? m : d.toLocaleDateString(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' });
};

export default function WitnessedConversations({ onBack }: { onBack: () => void }) {
  const [list, setList] = useState<Conversation[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let on = true;
    fetch('/api/witnessed', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j: { conversations: Conversation[] }) => on && setList(j.conversations))
      .catch(() => on && setFailed(true));
    return () => { on = false; };
  }, []);

  return (
    <div className="size-full overflow-auto scroll-container bg-background">
      <div className="flex items-center gap-4 border-b border-border px-6 py-4 sticky top-0 bg-background z-10">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0" aria-label="Back to the About menu">
          <ArrowLeft className="size-5" />
        </Button>
        <h1>Witnessed Conversations</h1>
      </div>

      <div className="mx-auto max-w-3xl space-y-8 px-6 py-10">
        <section className="space-y-3 text-sm leading-relaxed md:text-base">
          <p>
            A window of openness and accountability. These are conversations with Nenya&rsquo;s AI coach that the people who had them chose to share, without their names. Nenya signed
            each conversation when it happened, which is what &ldquo;witnessed&rdquo; means here: the site vouches that it took place as written, before anything was removed.
          </p>
          <p>
            Before a conversation appears here, the site removes names, emails, phone numbers and addresses, and then a person at Nenya reads and edits it by hand. Software cannot
            promise anonymity, and we do not: names are not always caught, and details can identify someone. We choose to leave a conversation out when we are not sure.
            A conversation in which our safety check stopped a message is never offered for this page.
          </p>
          <p>
            Because names were taken out, a stranger cannot check the signature on what you read here. Each one carries a short fingerprint that matches the fingerprint of the
            signed file its owner holds. Each message says who wrote it: the person, the AI, or the site (the greeting, the safety notices and a few pre-written answers are written by
            us, not by the AI).
          </p>
          <p className="text-muted-foreground">
            The coach is an AI. It is not therapy and it is not for emergencies. In the US, call or text 988.
          </p>
        </section>

        {failed && <p role="alert" className="text-sm">The conversations could not be loaded just now. Please try again in a moment.</p>}
        {!failed && list === null && <p role="status" className="text-sm text-muted-foreground">Loading…</p>}
        {list && list.length === 0 && (
          <Card className="p-6 text-sm text-muted-foreground" role="status">No conversations are shown right now. When someone allows one to be shown, and we have read it, it will appear here.</Card>
        )}

        {list && list.length > 0 && (
          <ol className="space-y-8" aria-label="Witnessed conversations">
            {list.map((c) => (
              <li key={c.fingerprint}>
                <Card className="space-y-4 p-6">
                  <header>
                    <h2 className="text-lg">Conversation {c.fingerprint}</h2>
                    <p className="text-xs text-muted-foreground">Shared in {monthName(c.month)}</p>
                  </header>
                  <ul className="space-y-3">
                    {c.items.map((it, i) => (
                      <li key={i} className={`rounded-lg border p-3 text-sm ${it.by === 'person' ? 'border-border bg-muted/40' : it.by === 'site' ? 'border-dashed border-border' : 'border-border'}`}>
                        <p className="mb-1 text-xs font-medium">{WRITER[it.by]}</p>
                        <p className="whitespace-pre-wrap">{it.text}</p>
                      </li>
                    ))}
                  </ul>
                </Card>
              </li>
            ))}
          </ol>
        )}

        <section className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Taking one down.</strong> Anyone who allowed one to be shown can end it at any time, or choose how long it stays, with their signed file at{' '}
            <a className="underline underline-offset-4" href="/my-transcript/">nenya.biz/my-transcript</a>. It comes down at once. If you see something here that identifies you or someone
            you know, write to <a className="underline underline-offset-4" href="mailto:info@nenya.biz">info@nenya.biz</a> and a person will take it down. We cannot recall copies other people make of a public page.
          </p>
          <p>
            <strong className="text-foreground">Adding yours.</strong> After a conversation with the coach, you can download a signed copy and send it to us with the choice to show it. You choose what is
            shown and for how long, and nothing is shown without a person reading it first.
          </p>
        </section>
      </div>
      <AppFooter />
    </div>
  );
}
