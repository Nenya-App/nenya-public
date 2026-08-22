import React from 'react';
import { ArrowLeft, Heart, Shield, Sparkles, ExternalLink, Code } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ReturnToTop } from '../ReturnToTop';
import { ScrollHint } from '../ScrollHint';

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
          {/* A Private Artistic Project */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="p-3 bg-nenya-gold/20 rounded-lg">
                <Heart className="size-6 text-nenya-gold-dark dark:text-nenya-gold" />
              </div>
              <h2 className="text-2xl md:text-3xl text-nenya-gold-dark dark:text-nenya-gold-light">A Private Artistic Project</h2>
            </div>
            <Card className="p-6 md:p-8 bg-muted/50 border-border">
              <div className="space-y-4 text-foreground leading-relaxed text-sm md:text-base">
                <p>
                  Nenya is an independent artistic and technology project — a privately held creative work focused on building safe, accessible,
                  ethical tools for personal reflection and social restoration.
                </p>
                <p>
                  This is not a startup, a platform company, or a commercial product. It is a project built around a specific set of values:
                  anti-extractive design, radical privacy, and the belief that your inner world belongs only to you.
                </p>
                <p>
                  Nenya accepts no equity investors, grants no board seats or approval rights to funders, and does not accept federal government
                  funding. The project's direction is determined solely by its creator.
                </p>
              </div>
            </Card>
          </div>

          {/* Fiscal Sponsorship: Fractured Atlas */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="p-3 bg-nenya-gold/20 rounded-lg">
                <Shield className="size-6 text-nenya-gold-dark dark:text-nenya-gold" />
              </div>
              <h2 className="text-2xl md:text-3xl text-nenya-gold-dark dark:text-nenya-gold-light">Fiscal Sponsorship: Fractured Atlas</h2>
            </div>
            <Card className="p-6 md:p-8 border-border">
              <div className="space-y-6">
                <p className="text-sm md:text-base text-foreground leading-relaxed">
                  Nenya is fiscally sponsored by Fractured Atlas, a 501(c)(3) nonprofit arts service organization. Fiscal sponsorship allows
                  independent creative projects to receive tax-deductible donations without forming their own nonprofit — a model widely used in
                  the arts community to preserve creative autonomy while enabling public support.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="p-5 bg-card border-nenya-gold/30">
                    <h3 className="text-base md:text-lg text-nenya-gold-dark dark:text-nenya-gold-light mb-3">What This Means</h3>
                    <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <Shield className="size-3 md:size-4 text-nenya-gold-dark flex-shrink-0 mt-0.5" />
                        <span>Donations are tax-deductible to the extent permitted by law</span>
                      </li>
                      <li className="flex gap-2">
                        <Shield className="size-3 md:size-4 text-nenya-gold-dark flex-shrink-0 mt-0.5" />
                        <span>Fractured Atlas handles financial administration and accountability</span>
                      </li>
                      <li className="flex gap-2">
                        <Shield className="size-3 md:size-4 text-nenya-gold-dark flex-shrink-0 mt-0.5" />
                        <span>Nenya retains full creative and directional independence</span>
                      </li>
                      <li className="flex gap-2">
                        <Shield className="size-3 md:size-4 text-nenya-gold-dark flex-shrink-0 mt-0.5" />
                        <span>No equity, no board seats, no approval rights conveyed to any funder</span>
                      </li>
                    </ul>
                  </Card>
                  <Card className="p-5 bg-card border-nenya-gold/30">
                    <h3 className="text-base md:text-lg text-nenya-gold-dark dark:text-nenya-gold-light mb-3">Fractured Atlas</h3>
                    <p className="text-xs md:text-sm text-muted-foreground mb-4">
                      A leading 501(c)(3) arts service organization supporting thousands of independent artists and projects across the US since
                      1998.
                    </p>
                    <div className="flex flex-col gap-3">
                      <Button variant="outline" size="sm" className="gap-2 justify-start" asChild>
                        <a href="https://www.fracturedatlas.org" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="size-4" />
                          Fractured Atlas Website
                        </a>
                      </Button>
                      <Button size="sm" className="gap-2 justify-start bg-nenya-gold hover:bg-nenya-gold-dark text-background" asChild>
                        <a href="https://fundraising.fracturedatlas.org/nenya" target="_blank" rel="noopener noreferrer">
                          <Heart className="size-4" />
                          Donate to Support Nenya
                        </a>
                      </Button>
                      <a href="https://fundraising.fracturedatlas.org/nenya" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '12px' }}>
                        <img
                          alt="Donate now at Fractured Atlas!"
                          src="https://fundraising.fracturedatlas.org/images/fundraiser-share-buttons/share-button--dark--alpha.png"
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
                <Sparkles className="size-6 text-nenya-gold-dark dark:text-nenya-gold" />
              </div>
              <h2 className="text-2xl md:text-3xl text-nenya-gold-dark dark:text-nenya-gold-light">Why This Approach</h2>
            </div>
            <Card className="p-6 md:p-8 bg-muted/50 border-border">
              <div className="space-y-4">
                <p className="text-sm md:text-base text-foreground leading-relaxed">
                  Fiscal sponsorship is a well-established model in the arts and nonprofit world, used by independent projects that want to accept
                  charitable donations and maintain financial accountability without the administrative overhead of forming a separate nonprofit
                  entity.
                </p>
                <p className="text-sm md:text-base text-foreground leading-relaxed">
                  For Nenya, it is also an ideological choice. The project's anti-extractive design principles require that its organizational
                  structure match its values: no corporate shell, no investors, no stakeholders with claims on its direction.
                </p>
                <p className="text-sm md:text-base text-foreground leading-relaxed">
                  Fractured Atlas has supported thousands of independent artists and projects since 1998. Their model gives Nenya the credibility
                  and infrastructure of a recognized nonprofit without compromising the creative and ethical independence that makes the project
                  what it is.
                </p>
              </div>
            </Card>
          </div>

          {/* Core Commitments */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="p-3 bg-nenya-gold/20 rounded-lg">
                <Heart className="size-6 text-nenya-gold-dark dark:text-nenya-gold" />
              </div>
              <h2 className="text-2xl md:text-3xl text-nenya-gold-dark dark:text-nenya-gold-light">Core Commitments</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-5 bg-gradient-to-br from-background-secondary to-background">
                <h3 className="mb-2 text-foreground">Anti-Extractive by Design</h3>
                <p className="text-sm text-muted-foreground">
                  No data mining, no surveillance, no advertising. Your use of this tool generates nothing of commercial value for anyone.
                </p>
              </Card>
              <Card className="p-5 bg-gradient-to-br from-background-secondary to-background">
                <h3 className="mb-2 text-foreground">Privacy as Architecture</h3>
                <p className="text-sm text-muted-foreground">The commitment to privacy is structural, not a policy. We cannot share what we do not collect.</p>
              </Card>
              <Card className="p-5 bg-gradient-to-br from-background-secondary to-background">
                <h3 className="mb-2 text-foreground">Free for Everyone</h3>
                <p className="text-sm text-muted-foreground">The core tool is and will remain free. No paywalls, no premium tiers, no engagement metrics.</p>
              </Card>
              <Card className="p-5 bg-gradient-to-br from-background-secondary to-background">
                <h3 className="mb-2 text-foreground">Sovereign Direction</h3>
                <p className="text-sm text-muted-foreground">No equity investors, no federal funding, no outside stakeholders with claims on how this project develops.</p>
              </Card>
            </div>
          </div>

          {/* Open Source */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="p-3 bg-nenya-gold/20 rounded-lg">
                <Code className="size-6 text-nenya-gold-dark dark:text-nenya-gold" />
              </div>
              <h2 className="text-2xl md:text-3xl text-nenya-gold-dark dark:text-nenya-gold-light">Open Source</h2>
            </div>
            <Card className="p-6 md:p-8 bg-muted/50 border-border">
              <div className="space-y-4 text-sm md:text-base text-foreground leading-relaxed">
                <p>
                  Nenya's source code is publicly available under the{' '}
                  <a
                    href="https://github.com/Nenya-App/nenya-public/blob/main/LICENSE"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-nenya-gold-dark dark:hover:text-nenya-gold transition-colors"
                  >
                    GNU Affero General Public License v3.0
                  </a>
                  . Every privacy claim made on this site — that nothing is tracked, that nothing persists between
                  sessions — is something you can verify yourself by reading the code, not just something you have
                  to take our word for.
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
      <ScrollHint />
      <ReturnToTop onClick={scrollToTop} />
    </div>
  );
}
