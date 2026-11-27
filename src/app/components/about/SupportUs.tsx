import React from 'react';
import { ArrowLeft, Heart, Shield, Code, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ReturnToTop } from '../ReturnToTop';
import { ScrollHint } from '../ScrollHint';
import { AppFooter } from '../AppFooter';
import { Cite, ReferenceList } from './AboutReferences';

interface SupportUsProps {
  onBack: () => void;
}

export default function SupportUs({ onBack }: SupportUsProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div ref={scrollContainerRef} className="size-full overflow-auto scroll-container bg-background">
      <div className="flex items-center gap-4 border-b border-border px-6 py-4 sticky top-0 bg-background z-10">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="size-5" />
        </Button>
        <h1>Support This Work</h1>
      </div>

      <div className="w-full">
        <div className="mx-auto max-w-3xl px-6 py-12 space-y-10">
          <section className="space-y-4">
            <Card className="p-8 border-nenya-gold/30 space-y-4">
              <div className="flex justify-center">
                <div className="size-16 rounded-full bg-nenya-gold/20 flex items-center justify-center">
                  <Heart className="size-8 text-nenya-gold-text dark:text-nenya-gold" />
                </div>
              </div>
              <div className="space-y-3 text-center">
                <h2 className="text-2xl text-nenya-gold-text dark:text-nenya-gold-light">What You're Supporting</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Nenya is a hybrid work of visual art, literature, and contemplative technology — a digital sanctuary built for reflection, emotional
                  regulation, and ethical self-inquiry.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  The breathing interface, the six lenses and the guided reflection are meant to help you pause and notice. We have not measured whether they do. Studies of mental health apps in general find small effects on average <Cite pageId="support" n={[1]} />, and one large review found no convincing evidence of benefit <Cite pageId="support" n={[2]} />.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  It is provided free, with no advertising and no profiles of visitors. The plan is for the core breathing and reflection tools to stay free, and people who choose to support it help make that possible.
                </p>
              </div>
            </Card>
          </section>

          <section className="space-y-4">
            <div className="grid md:grid-cols-3 gap-5">
              <Card className="p-5 space-y-3">
                <div className="size-10 rounded-full bg-nenya-gold/10 flex items-center justify-center">
                  <Shield className="size-5 text-nenya-gold-text dark:text-nenya-gold" />
                </div>
                <h4 className="font-medium">No account, no ads</h4>
                <p className="text-sm text-muted-foreground">What you enter in the reflection tools stays on your device unless you choose to send it.</p>
              </Card>
              <Card className="p-5 space-y-3">
                <div className="size-10 rounded-full bg-nenya-gold/10 flex items-center justify-center">
                  <Code className="size-5 text-nenya-gold-text dark:text-nenya-gold" />
                </div>
                <h4 className="font-medium">Openly built</h4>
                <p className="text-sm text-muted-foreground">Transparent development. No equity, no board seats, no approval rights granted to any funder.</p>
              </Card>
              <Card className="p-5 space-y-3">
                <div className="size-10 rounded-full bg-nenya-gold/10 flex items-center justify-center">
                  <Heart className="size-5 text-nenya-gold-text dark:text-nenya-gold" />
                </div>
                <h4 className="font-medium">Provided free</h4>
                <p className="text-sm text-muted-foreground">The core breathing and reflection tools are provided free to every person who arrives, and the plan is to keep them that way.</p>
              </Card>
            </div>
          </section>

          <section>
            <Card className="p-8 space-y-6">
              <div className="space-y-3 text-left">
                <h3 className="text-xl">Make a Donation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Nenya is fiscally sponsored by Fractured Atlas, a 501(c)(3) nonprofit. Donations are processed through the Fractured Atlas platform and are tax-deductible to the extent permitted by law <Cite pageId="support" n={[3, 4]} />. Fractured Atlas publishes its own current Form 990 and audit <Cite pageId="support" n={[5]} />. Nenya does not publish separate accounts.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Donations go to Fractured Atlas, which charges sponsored projects an administrative fee on donations <Cite pageId="support" n={[4]} />. What is left after the fee is meant for keeping the core tools free and the site running, including servers and the ongoing work on the reflection and coaching tools.
                </p>
              </div>
              <div className="flex flex-col items-start gap-4">
                <Button size="lg" className="gap-3 bg-nenya-gold hover:bg-nenya-gold-light text-primary-foreground px-8" asChild>
                  <a href="https://fundraising.fracturedatlas.org/nenya" target="_blank" rel="noopener noreferrer">
                    <Heart className="size-5" />
                    Donate via Fractured Atlas
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
                <p className="text-xs text-muted-foreground">
                  Nenya is a sponsored project of{' '}
                  <a
                    href="https://www.fracturedatlas.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-foreground transition-colors"
                  >
                    Fractured Atlas
                  </a>
                  , a non-profit arts service organization. Contributions for the charitable purposes of Nenya must be made payable to “Fractured Atlas” only and are tax-deductible to the extent permitted by law.
                </p>
              </div>
            </Card>
          </section>
          <ReferenceList
            pageId="support"
            items={[
              { n: 1, text: 'Linardon J, Cuijpers P, Carlbring P, Messer M, Fuller‐Tyszkiewicz M (2019). The efficacy of app‐supported smartphone interventions for mental health problems: a meta‐analysis of randomized controlled trials. World Psychiatry.', href: 'https://doi.org/10.1002/wps.20673', linkLabel: 'Free full text' },
              { n: 2, text: 'Goldberg S, Lam S, Simonsson O, Torous J, Sun S (2022). Mobile phone-based interventions for mental health: A systematic meta-review of 14 meta-analyses of randomized controlled trials. PLOS Digital Health.', href: 'https://doi.org/10.1371/journal.pdig.0000002', linkLabel: 'Free full text' },
              { n: 3, text: 'ProPublica Nonprofit Explorer (IRS data) (2026). Fractured Atlas Inc (EIN 11-3451703). ProPublica.', href: 'https://projects.propublica.org/nonprofits/organizations/113451703', linkLabel: 'Source page' },
              { n: 4, text: 'Fractured Atlas (2026). Fiscal sponsorship. fracturedatlas.org.', href: 'https://www.fracturedatlas.org/fiscal-sponsorship', linkLabel: 'Source page' },
              { n: 5, text: 'Fractured Atlas (2026). What we do. fracturedatlas.org.', href: 'https://www.fracturedatlas.org/what-we-do', linkLabel: 'Source page' },
            ]}
          />
        </div>
      </div>
      <ScrollHint />
      <ReturnToTop onClick={scrollToTop} />

      <AppFooter />
    </div>
  );
}
