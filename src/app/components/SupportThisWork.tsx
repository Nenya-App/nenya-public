import { ExternalLink, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ShareNenya } from './ShareNenya';

// The "Support This Work" section shown on the front page and on the coach page.
// One copy, so the wording and the donation link cannot drift apart.
export function SupportThisWork() {
  return (
    <div className="text-center space-y-8 max-w-3xl w-full">
      <div className="space-y-4">
        <h2 className="text-3xl md:text-4xl lg:text-5xl">
          Support This Work
        </h2>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Nenya is free to use and privately run — no advertising, no accounts,
          no subscription required. It stays that way because people choose to support it.
        </p>
      </div>

      <Card className="p-8 bg-card/80 dark:bg-card/50 backdrop-blur-sm border-nenya-gold/30 space-y-6">
        <div className="flex justify-center">
          <div className="size-16 rounded-full bg-nenya-gold/20 flex items-center justify-center">
            <Heart className="size-8 text-nenya-gold" />
          </div>
        </div>

        <div className="space-y-4 text-left">
          <h3 className="text-2xl text-nenya-gold-light text-center">
            What You're Supporting
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Nenya is a hybrid work of visual art, literature, and contemplative
            technology — a digital sanctuary built for reflection, emotional
            regulation, and ethical self-inquiry. The breathing interface, the
            color gateways, the guided reflection: each element is designed to
            leave you more present than when you arrived.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            It is built by Estëlle, a Minnesota-based designer, educator, and
            artist — though the intention has always been for the work to
            speak for itself. The practice behind it asks what technology
            could look like if it helped us feel more human rather than
            less. Nenya models that answer: a free, open tool that gives
            more than it takes.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Nenya is fiscally sponsored by Fractured Atlas, a 501(c)(3) public
            charity. Donations are tax-deductible to the extent permitted by law
            and handled with full financial transparency.
          </p>
        </div>

        <Button
          size="lg"
          className="gap-3 bg-nenya-gold hover:bg-nenya-gold-dark text-background-elevated px-8 py-6 text-lg w-full sm:w-auto"
          asChild
        >
          <a
            href="https://fundraising.fracturedatlas.org/nenya"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Heart className="size-5" />
            Donate via Fractured Atlas
            <ExternalLink className="size-4" />
          </a>
        </Button>

        <div className="flex justify-center">
          <ShareNenya variant="button" />
        </div>

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
      </Card>
    </div>
  );
}
