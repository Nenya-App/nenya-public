import React from 'react';
import { ArrowLeft, Heart, Shield, Sparkles, ExternalLink, Code } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ReturnToTop } from '../ReturnToTop';
import { ScrollHint } from '../ScrollHint';
import { AppFooter } from '../AppFooter';
import { Cite, ReferenceList } from './AboutReferences';

interface StructureProps {
  onBack: () => void;
}

export default function Structure({ onBack }: StructureProps) {
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
        <h1>Our Structure</h1>
      </div>

      <div className="w-full">
        <div className="mx-auto max-w-4xl px-6 py-12 space-y-12">
          {/* An Independent Artistic Project */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="p-3 bg-nenya-gold/20 rounded-lg">
                <Heart className="size-6 text-nenya-gold-text dark:text-nenya-gold" />
              </div>
              <h2 className="text-2xl md:text-3xl text-nenya-gold-text dark:text-nenya-gold-light">An Independent Artistic Project</h2>
            </div>
            <Card className="p-6 md:p-8 bg-muted/50 border-border">
              <div className="space-y-4 text-foreground leading-relaxed text-sm md:text-base">
                <p>
                  Nenya is an independent artistic and technology project. It is a privately held creative work. It aims to build tools for personal reflection and social restoration. We want them to be safe, accessible and ethical.
                </p>
                <p>
                  It is not a startup or a platform company. It is free today.
                </p>
                <p>
                  It is built around our values: design that does not extract, privacy first, and the belief that your inner world belongs to you.
                </p>
                <p>
                  Nenya accepts no equity investors, grants no board seats or approval rights to funders, and does not accept federal government funding.
                </p>
                <p>
                  The project&apos;s creative direction is set by its creator, Estëlle Streiff, who runs Nenya as a sole proprietor. Fractured Atlas, as sponsor, has some oversight of how donated money is spent <Cite pageId="structure" n={[1]} />.
                </p>
              </div>
            </Card>
          </div>

          {/* Fiscal Sponsorship: Fractured Atlas */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="p-3 bg-nenya-gold/20 rounded-lg">
                <Shield className="size-6 text-nenya-gold-text dark:text-nenya-gold" />
              </div>
              <h2 className="text-2xl md:text-3xl text-nenya-gold-text dark:text-nenya-gold-light">Fiscal Sponsorship: Fractured Atlas</h2>
            </div>
            <Card className="p-6 md:p-8 border-border">
              <div className="space-y-6">
                <p className="text-sm md:text-base text-foreground leading-relaxed">
                  Nenya is fiscally sponsored by Fractured Atlas, a 501(c)(3) nonprofit arts service organization.
                </p>
                <p className="text-sm md:text-base text-foreground leading-relaxed">
                  Fiscal sponsorship lets a creative project receive donations that can be tax-deductible. It does not need to form its own nonprofit <Cite pageId="structure" n={[2]} />. Fractured Atlas says projects it sponsors have raised $310 million in all <Cite pageId="structure" n={[3]} />.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="p-5 bg-card border-nenya-gold/30">
                    <h3 className="text-base md:text-lg text-nenya-gold-text dark:text-nenya-gold-light mb-3">What This Means</h3>
                    <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <Shield className="size-3 md:size-4 text-nenya-gold-text flex-shrink-0 mt-0.5" />
                        <span>Donations are tax-deductible to the extent permitted by law</span>
                      </li>
                      <li className="flex gap-2">
                        <Shield className="size-3 md:size-4 text-nenya-gold-text flex-shrink-0 mt-0.5" />
                        <span>Fractured Atlas processes donations. It also provides some oversight of how the money is spent</span>
                      </li>
                      <li className="flex gap-2">
                        <Shield className="size-3 md:size-4 text-nenya-gold-text flex-shrink-0 mt-0.5" />
                        <span>Nenya keeps its creative direction. Fractured Atlas does not own the project&apos;s work. It does review fundraising requests and grant applications.</span>
                      </li>
                      <li className="flex gap-2">
                        <Shield className="size-3 md:size-4 text-nenya-gold-text flex-shrink-0 mt-0.5" />
                        <span>No equity, no board seats, no approval rights conveyed to any funder</span>
                      </li>
                    </ul>
                  </Card>
                  <Card className="p-5 bg-card border-nenya-gold/30">
                    <h3 className="text-base md:text-lg text-nenya-gold-text dark:text-nenya-gold-light mb-3">Fractured Atlas</h3>
                    <p className="text-xs md:text-sm text-muted-foreground mb-4">
                      A 501(c)(3) arts service organization, founded in 1998. It acts as fiscal sponsor for artists and projects across the US <Cite pageId="structure" n={[3, 4]} />.
                    </p>
                    <div className="flex flex-col gap-3">
                      <Button variant="outline" size="sm" className="gap-2 justify-start" asChild>
                        <a href="https://www.fracturedatlas.org" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="size-4" />
                          Fractured Atlas Website
                        </a>
                      </Button>
                      <Button size="sm" className="gap-2 justify-start bg-nenya-gold hover:bg-nenya-gold-light text-primary-foreground" asChild>
                        <a href="https://fundraising.fracturedatlas.org/nenya" target="_blank" rel="noopener noreferrer">
                          <Heart className="size-4" />
                          Donate to Support Nenya
                        </a>
                      </Button>
                      <a href="https://fundraising.fracturedatlas.org/nenya" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '12px' }}>
                        <img
                          alt="Donate now at Fractured Atlas!"
                          src="/badges/fractured-atlas-donate.png"
                          width="120"
                          height="40"
                          style={{ height: '40px', width: 'auto' }}
                        />
                      </a>
                    </div>
                  </Card>
                </div>
              </div>
            </Card>
          </div>

          {/* Why This Approach */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="p-3 bg-nenya-gold/20 rounded-lg">
                <Sparkles className="size-6 text-nenya-gold-text dark:text-nenya-gold" />
              </div>
              <h2 className="text-2xl md:text-3xl text-nenya-gold-text dark:text-nenya-gold-light">Why This Approach</h2>
            </div>
            <Card className="p-6 md:p-8 bg-muted/50 border-border">
              <div className="space-y-4">
                <p className="text-sm md:text-base text-foreground leading-relaxed">
                  Fractured Atlas describes fiscal sponsorship as a way to work under an existing 501(c)(3). A project does not have to form its own nonprofit <Cite pageId="structure" n={[2]} />.
                </p>
                <p className="text-sm md:text-base text-foreground leading-relaxed">
                  For Nenya it is also a choice about values. We want the way Nenya is organized to match the way it is built: no investors, no outside owners with claims on its direction.
                </p>
                <p className="text-sm md:text-base text-foreground leading-relaxed">
                  Fractured Atlas has been a registered 501(c)(3) since 1998 <Cite pageId="structure" n={[4]} />. Working under it gives Nenya a legal home for donations. We believe this does not cost the project its independence. Fractured Atlas does review fundraising requests and how donated money is spent <Cite pageId="structure" n={[1]} />.
                </p>
              </div>
            </Card>
          </div>

          {/* Core Commitments */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="p-3 bg-nenya-gold/20 rounded-lg">
                <Heart className="size-6 text-nenya-gold-text dark:text-nenya-gold" />
              </div>
              <h2 className="text-2xl md:text-3xl text-nenya-gold-text dark:text-nenya-gold-light">Core Commitments</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-5 bg-gradient-to-br from-background-secondary to-background">
                <h3 className="mb-2 text-foreground">Anti-Extractive by Design</h3>
                <p className="text-sm text-muted-foreground">
                  No data mining, no surveillance, no advertising. We do not sell or share data from your use.
                </p>
              </Card>
              <Card className="p-5 bg-gradient-to-br from-background-secondary to-background">
                <h3 className="mb-2 text-foreground">Privacy as Architecture</h3>
                <p className="text-sm text-muted-foreground">Privacy is built into the code, not only promised. We cannot share what we do not keep. We do keep a few things: plain daily totals, and anything you choose to send us. The terms list them.</p>
              </Card>
              <Card className="p-5 bg-gradient-to-br from-background-secondary to-background">
                <h3 className="mb-2 text-foreground">Provided Free</h3>
                <p className="text-sm text-muted-foreground">Nenya is provided free, with no advertising. The plan is for the core breathing and reflection tools to stay free.</p>
              </Card>
              <Card className="p-5 bg-gradient-to-br from-background-secondary to-background">
                <h3 className="mb-2 text-foreground">Independent Direction</h3>
                <p className="text-sm text-muted-foreground">No equity investors and no federal funding. No outsiders hold a claim on how this project grows.</p>
              </Card>
            </div>
          </div>

          {/* Open Source */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="p-3 bg-nenya-gold/20 rounded-lg">
                <Code className="size-6 text-nenya-gold-text dark:text-nenya-gold" />
              </div>
              <h2 className="text-2xl md:text-3xl text-nenya-gold-text dark:text-nenya-gold-light">Open Source</h2>
            </div>
            <Card className="p-6 md:p-8 bg-muted/50 border-border">
              <div className="space-y-4 text-sm md:text-base text-foreground leading-relaxed">
                <p>
                  Nenya's source code is publicly available under the{' '}
                  <a
                    href="https://github.com/Nenya-App/nenya-public/blob/main/LICENSE"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-nenya-gold-text dark:hover:text-nenya-gold transition-colors"
                  >
                    GNU Affero General Public License v3.0
                  </a>
                  .
                </p>
                <p>
                  Every claim about what the site&rsquo;s code does is something you can check by reading the code. Two examples: the reflection tools do not send what you enter, and Nenya stores very little between visits. The terms list the exceptions.
                </p>
                <p>
                  The web host&rsquo;s connection logs and visit totals sit outside the code; Section 13 of the terms describes them.
                </p>
                <p className="text-muted-foreground text-xs md:text-sm">
                  The Nenya name and logo are reserved separately from the code license — see the repository's{' '}
                  <code className="text-xs bg-background px-1.5 py-0.5 rounded">TRADEMARK.md</code> for details.
                </p>
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <a href="https://github.com/Nenya-App/nenya-public" target="_blank" rel="noopener noreferrer">
                    <Code className="size-4" />
                    View source on GitHub
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-6 pb-12">
        <ReferenceList
          pageId="structure"
          items={[
            { n: 1, text: 'Fractured Atlas (2026). Questions To Ask When Finding a Fiscal Sponsor. Fractured Atlas blog.', href: 'https://blog.fracturedatlas.org/questions-finding-a-fiscal-sponsor', linkLabel: 'Source page' },
            { n: 2, text: 'Fractured Atlas (2026). Fiscal sponsorship. fracturedatlas.org.', href: 'https://www.fracturedatlas.org/fiscal-sponsorship', linkLabel: 'Source page' },
            { n: 3, text: 'Fractured Atlas (2026). What we do. fracturedatlas.org.', href: 'https://www.fracturedatlas.org/what-we-do', linkLabel: 'Source page' },
            { n: 4, text: 'ProPublica Nonprofit Explorer (IRS data) (2026). Fractured Atlas Inc (EIN 11-3451703). ProPublica.', href: 'https://projects.propublica.org/nonprofits/organizations/113451703', linkLabel: 'Source page' },
          ]}
        />
      </div>
      <ScrollHint />
      <ReturnToTop onClick={scrollToTop} />

      <AppFooter />
    </div>
  );
}
