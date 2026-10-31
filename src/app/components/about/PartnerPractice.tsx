import { ArrowLeft, AlertCircle, ArrowRight, Shield, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import NenyaLogo from '../NenyaLogo';
import { AppFooter } from '../AppFooter';

interface PartnerPracticeProps {
  onBack: () => void;
  /** Opens the scripted preview screens. */
  onOpenPreview?: () => void;
}

// What we plan for two-person practice ("Dyadic Cells"). Nothing here is built: the
// preview screens are scripted. This page is where that plan now lives.
export default function PartnerPractice({ onBack, onOpenPreview }: PartnerPracticeProps) {
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
            <NenyaLogo size={80} />
          </div>
          <h1 className="text-3xl md:text-4xl">Partner Practice</h1>
          <p className="text-muted-foreground">Dyadic Cells: two people, one structured conversation</p>
        </div>

        <Card className="border-amber-300 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-900 dark:text-amber-100">
              <strong>Planned, not built.</strong> Partner practice does not exist yet. No one can join a cell, and
              nothing you do in the preview is sent anywhere. This page describes what we hope to build and why.
            </p>
          </div>
        </Card>

        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-xl">
            <Users className="size-5" />
            What it would be
          </h2>
          <p className="text-muted-foreground">
            A Dyadic Cell is a structured space for two people to practice deep listening and authentic dialogue.
            Nenya would act as a process facilitator, guiding turn-taking and reflection without judgment.
          </p>
          <p className="text-muted-foreground">
            It is meant as a way to rehearse a hard conversation with another person, or to hold one with support,
            using the same feelings-and-needs practice as the rest of Nenya.
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
              send plain words while the other reads an NVC+ translation of them, or the reverse. The original message
              stays viewable.
            </li>
            <li>
              The Eagle Protocol would pause a cell if a message signals crisis, and either person could report a
              problem.
            </li>
            <li>
              In keeping with Nenya&rsquo;s privacy design, we would aim to keep as little as possible: no accounts
              required, no stored conversations.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            How access would work, and whether any part would carry a cost, is undecided. The core tool will stay free.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl">For professionals and research</h2>
          <p className="text-muted-foreground">
            We hope Dyadic Cells could become a <em>Structured Integration</em> for therapists, coaches, and other
            professionals. It is not a replacement for professional mental health services. If you need support,
            please consult a qualified professional.
          </p>
        </section>

        <Card className="border-primary/20 bg-primary/5 p-5">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 size-5 shrink-0 text-primary" />
            <div className="space-y-2">
              <h3 className="text-base">Accountability and safety</h3>
              <p className="text-sm text-muted-foreground">
                Dyadic Cells would be a Structured Integration from Nenya, a fiscally sponsored project of Fractured
                Atlas, a nonprofit arts service organization. That structure allows access to be revoked in the event
                of verified, repeated abuse. While Nenya prioritizes privacy and anonymity, this accountability
                mechanism is meant to protect the community from harmful behavior.
              </p>
            </div>
          </div>
        </Card>

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
      </div>
      <AppFooter />
    </div>
  );
}
