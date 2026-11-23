import { useEffect, useState } from 'react';
import { ArrowLeft, AlertCircle, ArrowRight, Lock, Shield, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import PanelLogo from '../PanelLogo';
import { AppFooter } from '../AppFooter';
import { Cite, ReferenceList, type AboutReference } from './AboutReferences';

const REFS: AboutReference[] = [
  {"n": 1, "text": "Shaikh O; Chai V; Gelfand M; Yang D; Bernstein M (2024). Rehearsal: Simulating Conflict to Teach Conflict Resolution. Proceedings of the CHI Conference on Human Factors in Computing Systems.", "href": "https://doi.org/10.1145/3613904.3642159", "linkLabel": "Free full text"},
  {"n": 2, "text": "Sharma A; Lin I; Miner A; Atkins D; Althoff T (2023). Human–AI collaboration enables more empathic conversations in text-based peer-to-peer mental health support. Nature Machine Intelligence.", "href": "https://doi.org/10.1038/s42256-022-00593-2", "linkLabel": "Free full text"},
  {"n": 3, "text": "Hohenstein J; Kizilcec R; DiFranzo D; Aghajari Z; Mieczkowski H; Levy K; et al. (2023). Artificial intelligence in communication impacts language and social relationships. Scientific Reports.", "href": "https://doi.org/10.1038/s41598-023-30938-9", "linkLabel": "Free full text"},
  {"n": 4, "text": "Hancock J; Naaman M; Levy K (2020). AI-Mediated Communication: Definition, Research Agenda, and Ethical Considerations. Journal of Computer-Mediated Communication.", "href": "https://doi.org/10.1093/jcmc/zmz022", "linkLabel": "Publisher page (may need payment)"},
];

const PAGE = 'partner-practice';

interface PartnerPracticeProps {
  onBack: () => void;
  /** Opens the scripted preview screens. */
  onOpenPreview?: () => void;
}

// What we plan for two-person practice ("Dyadic Cells"). The preview screens are scripted; only the early encrypted test cell (/cell) is real,
// and only while the server has it switched on (CELL_ENABLED). The notice at the top follows that same switch, so the page never says
// "no one can join a cell" while the test card below is showing. This page is where the plan lives.
export default function PartnerPractice({ onBack, onOpenPreview }: PartnerPracticeProps) {
  // The real, encrypted cell (/cell) is linked only while the server has it switched on (CELL_ENABLED), for testing.
  const [cellOpen, setCellOpen] = useState(false);
  useEffect(() => {
    let on = true;
    fetch('/api/cell?status', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => on && setCellOpen(j?.enabled === true))
      .catch(() => undefined);
    return () => {
      on = false;
    };
  }, []);
  return (
    <div className="size-full overflow-auto scroll-container bg-background">
      <div className="sticky top-0 z-10 border-b border-border bg-background px-6 py-4 backdrop-blur-sm">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="size-4" />
          Back to About
        </Button>
      </div>

      <div className="mx-auto max-w-3xl space-y-8 px-6 py-12">
        <div className="space-y-5 text-center">
          <div className="flex justify-center">
            <PanelLogo size={80} />
          </div>
          <h1 className="text-3xl md:text-4xl">Partner Practice</h1>
          <p className="text-muted-foreground">Dyadic Cells: two people, one structured conversation</p>
        </div>

        <Card className="border-amber-300 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600" />
            {cellOpen ? (
              <p className="text-sm text-amber-900 dark:text-amber-100">
                <strong>Planned, and only partly built.</strong> An early test version for two people is open (see &ldquo;Being tested&rdquo; below). The rest of this page describes what we hope to build and why. Nothing you do in the scripted preview is sent anywhere.
              </p>
            ) : (
              <p className="text-sm text-amber-900 dark:text-amber-100">
                <strong>Planned, not built for visitors.</strong> Partner practice is not open to visitors yet. No one can join a cell now, and
                nothing you do in the preview is sent anywhere. This page describes what we hope to build and why.
              </p>
            )}
          </div>
        </Card>

        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-xl">
            <Users className="size-5" />
            What it would be
          </h2>
          <p className="text-muted-foreground">
            A Dyadic Cell would be a structured space for two people to take turns speaking and listening. This is a design we have not built for visitors or tested. Nenya&rsquo;s role would be to keep the turns and offer prompts for reflection.
          </p>
          <p className="text-muted-foreground">
            It is meant as a way to rehearse a hard conversation with another person, or to hold one with support. It would use the same feelings-and-needs practice as the rest of Nenya. Two small studies found that AI-supported practice improved difficult conversations <Cite pageId={PAGE} n={[1, 2]} />. We have not tested it with two people.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl">How we imagine it working</h2>
          <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
            <li>
              One person creates a cell and shares a short code; the other joins with it. Each person keeps their own
              two-color session key.
            </li>
            <li>
              Each person chooses, independently, whether to use AI assistance for sending and for receiving. One can
              send plain words while the other reads a translation of them into our approach, or the reverse. AI-written or AI-changed messages can change how partners see each other, and people have been judged more negatively when others suspected AI <Cite pageId={PAGE} n={[3, 4]} />. The original message
              stays viewable.
            </li>
            <li>
              A cell would pause if the crisis check flags a message, and either person could report a
              problem. The crisis check is simple and can miss things.
            </li>
            <li>
              In keeping with Nenya&rsquo;s privacy design, we would aim to keep as little as possible. There would be no accounts. Messages would be kept only while the cell is open, for up to 3 hours in the test version.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            How access would work, and whether any part would carry a cost, is undecided. Our plan is for the core breathing and reflection tools to stay free.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl">For professionals</h2>
          <p className="text-muted-foreground">
            We hope Dyadic Cells could become an add-on that therapists, coaches, and other
            professionals use with the people they work with. No clinician has reviewed this idea. It is not a replacement for professional mental health services. If you need support,
            please consult a qualified professional.
          </p>
        </section>

        <Card className="border-primary/20 bg-primary/5 p-5">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 size-5 shrink-0 text-primary" />
            <div className="space-y-2">
              <h3 className="text-base">Accountability and safety</h3>
              <p className="text-sm text-muted-foreground">
                Dyadic Cells would be an add-on from Nenya. Nenya is a fiscally sponsored project of Fractured
                Atlas, a nonprofit arts service organization. We would like to be able to remove access in cases of
                verified, repeated abuse. We have not worked out how to do this without accounts. Nenya puts privacy first. This safeguard is meant to protect people from harmful behavior.
              </p>
            </div>
          </div>
        </Card>

        {cellOpen && (
          <Card className="border-primary/30 p-5">
            <div className="flex items-start gap-3">
              <Lock className="mt-0.5 size-5 shrink-0 text-primary" />
              <div className="space-y-2">
                <h3 className="text-base">Being tested: a real, encrypted cell</h3>
                <p className="text-sm text-muted-foreground">
                  An early version for two people, with messages encrypted on your devices. It has no AI help yet. Nothing is kept after the cell closes, and nothing is kept longer than 3 hours.
                </p>
                <a href="/cell" className="inline-flex items-center gap-1 text-sm underline underline-offset-4">
                  Open partner practice <ArrowRight className="size-4" />
                </a>
              </div>
            </div>
          </Card>
        )}

        {onOpenPreview && (
          <div className="space-y-3 text-center">
            <p className="text-sm text-muted-foreground">
              A scripted preview shows the idea. It uses no real AI and no second person.
            </p>
            <Button onClick={onOpenPreview} className="gap-2">
              See the scripted preview
              <ArrowRight className="size-4" />
            </Button>
          </div>
        )}

        <ReferenceList pageId={PAGE} items={REFS} />
      </div>
      <AppFooter />
    </div>
  );
}
