import React from 'react';
import { ArrowLeft, Heart, Shield, Code, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ReturnToTop } from '../ReturnToTop';
import { ScrollHint } from '../ScrollHint';

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
                  <Heart className="size-8 text-nenya-gold" />
                </div>
              </div>
              <div className="space-y-3 text-center">
                <h2 className="text-2xl text-nenya-gold-light">What You're Supporting</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Nenya is a hybrid work of visual art, literature, and contemplative technology — a digital sanctuary built for reflection, emotional
                  regulation, and ethical self-inquiry. The breathing interface, the color gateways, the guided reflection: each element is designed to
                  leave you more present than when you arrived.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  It is free to use without advertising, data collection, or subscription gates. It stays that way because people choose to support it.
                </p>
              </div>
            </Card>
          </section>

          <section className="space-y-4">
            <div className="grid md:grid-cols-3 gap-5">
              <Card className="p-5 space-y-3">
                <div className="size-10 rounded-full bg-nenya-gold/10 flex items-center justify-center">
                  <Shield className="size-5 text-nenya-gold" />
                </div>
                <h4 className="font-medium">Privacy-first</h4>
                <p className="text-sm text-muted-foreground">No surveillance. No data mining. Your inner life stays yours.</p>
              </Card>
              <Card className="p-5 space-y-3">
                <div className="size-10 rounded-full bg-nenya-gold/10 flex items-center justify-center">
                  <Code className="size-5 text-nenya-gold" />
                </div>
                <h4 className="font-medium">Openly built</h4>
                <p className="text-sm text-muted-foreground">Transparent development. No equity, no board seats, no approval rights granted to any funder.</p>
              </Card>
              <Card className="p-5 space-y-3">
                <div className="size-10 rounded-full bg-nenya-gold/10 flex items-center justify-center">
                  <Heart className="size-5 text-nenya-gold" />
                </div>
                <h4 className="font-medium">Free for everyone</h4>
                <p className="text-sm text-muted-foreground">No paywalls. No tiers. The same experience for every person who arrives.</p>
              </Card>
            </div>
          </section>

          <section>
            <Card className="p-8 space-y-6">
              <div className="space-y-3 text-left">
                <h3 className="text-xl">Make a Donation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Nenya is fiscally sponsored by Fractured Atlas, a 501(c)(3) public charity. Donations are processed through Fractured Atlas's secure
                  platform, are tax-deductible to the extent permitted by law, and are handled with full financial transparency.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Contributions go directly toward keeping the platform free and its infrastructure maintained — including the servers, the ongoing
                  development of the reflection and coaching tools, and the research that grounds the work.
                </p>
              </div>
              <div className="flex flex-col items-start gap-4">
                <Button size="lg" className="gap-3 bg-nenya-gold hover:bg-nenya-gold-dark text-background px-8" asChild>
                  <a href="https://fundraising.fracturedatlas.org/nenya" target="_blank" rel="noopener noreferrer">
                    <Heart className="size-5" />
                    Donate via Fractured Atlas
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
                <p className="text-xs text-muted-foreground">
                  Fiscally sponsored by{' '}
                  <a
                    href="https://www.fracturedatlas.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-foreground transition-colors"
                  >
                    Fractured Atlas
                  </a>
                  , a 501(c)(3) public charity. Donations are tax-deductible to the extent permitted by law.
                </p>
              </div>
            </Card>
          </section>
        </div>
      </div>
      <ScrollHint />
      <ReturnToTop onClick={scrollToTop} />
    </div>
  );
}
