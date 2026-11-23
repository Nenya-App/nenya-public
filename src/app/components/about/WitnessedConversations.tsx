import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { AppFooter } from '../AppFooter';
import { Cite, ReferenceList, type AboutReference } from './AboutReferences';

const REFS: AboutReference[] = [
  {"n": 1, "text": "Brendel J; Cremers C; Jackson D; Zhao M (2021). The Provable Security of Ed25519: Theory and Practice. 2021 IEEE Symposium on Security and Privacy (SP).", "href": "https://doi.org/10.1109/sp40001.2021.00042", "linkLabel": "Free full text"},
  {"n": 2, "text": "Bernstein D; Duif N; Lange T; Schwabe P; Yang B (2012). High-speed high-security signatures. Journal of Cryptographic Engineering.", "href": "https://doi.org/10.1007/s13389-012-0027-1", "linkLabel": "Free full text"},
  {"n": 3, "text": "National Institute of Standards and Technology (2023). FIPS 186-5: Digital Signature Standard (DSS). NIST. Read 22 November 2026.", "href": "https://csrc.nist.gov/pubs/fips/186-5/final", "linkLabel": "Web page"},
  {"n": 4, "text": "Josefsson, S., & Liusvaara, I. (2017). RFC 8032: Edwards-Curve Digital Signature Algorithm (EdDSA). IETF. Read 22 November 2026.", "href": "https://datatracker.ietf.org/doc/html/rfc8032", "linkLabel": "Web page"},
];

const PAGE = 'witnessed-conversations';

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
            Our position: this page is meant as a window of openness and accountability. These are conversations with Nenya&rsquo;s AI coach that the people who had them chose to share, without their names. Here, &ldquo;witnessed&rdquo; means that Nenya&rsquo;s server signed the conversation when the person asked for a signed copy. The signature shows that the text matches an exchange this server produced, and the date it was signed <Cite pageId={PAGE} n={[1, 2, 3, 4]} />. It does not show who typed the person&rsquo;s side, and it cannot check the edited copy shown here. The signature is not an identity check.
          </p>
          <p>
            Before a conversation appears here, the site removes names, emails, phone numbers and addresses, and then a person at Nenya reads and edits it by hand. Software cannot
            promise anonymity, and we do not: names are not always caught, and details can identify someone. We choose to leave a conversation out when we are not sure.
            A conversation in which our safety check stopped a message is never offered for this page.
          </p>
          <p>
            Names were taken out and a person edited the text, so a stranger cannot check the signature on what you read here. Each one carries a short fingerprint that matches the fingerprint of the
            signed file its owner holds. The fingerprint links this copy to that file. It does not prove that the text here is word for word the same. Each message says who wrote it: the person, the AI, or the site. The site wrote the greeting, the closing note, the safety notices and the pre-written answers, not the AI.
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
            shown and for how long, and nothing is shown without a person reading it first. If you send us a conversation, we keep it for the time you choose, even if we never show it. You can take it back at{' '}
            <a className="underline underline-offset-4" href="/my-transcript/">nenya.biz/my-transcript</a>.
          </p>
        </section>

        <h2 className="sr-only">Sources</h2>
        <ReferenceList pageId={PAGE} items={REFS} />
      </div>
      <AppFooter />
    </div>
  );
}
