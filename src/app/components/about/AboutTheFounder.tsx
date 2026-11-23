import React from 'react';
import { ArrowLeft, BookOpen, Quote, Heart } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ReturnToTop } from '../ReturnToTop';
import { ScrollIndicator } from '../ScrollIndicator';
import { ScrollHint } from '../ScrollHint';
import PanelLogo from '../PanelLogo';
import { BloomInstant } from '../BloomOnScroll';
import { valarColors } from '../ValarBreathingLogo';
import { AppFooter } from '../AppFooter';
import { Cite, ReferenceList } from './AboutReferences';

interface AboutTheFounderProps {
  onBack: () => void;
}

export default function AboutTheFounder({ onBack }: AboutTheFounderProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nienna = valarColors[3];
  const glow = nienna.vector[0];

  return (
    <div ref={scrollContainerRef} className="size-full overflow-auto scroll-container bg-background">
      <div className="border-b border-border bg-background px-6 py-4 sticky top-0 z-10 backdrop-blur-sm">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="size-4" />
          Back to About
        </Button>
      </div>

      <div className="w-full">
        <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
          <BloomInstant className="text-center space-y-5">
            <div className="flex justify-center">
              <PanelLogo size={80} />
            </div>
            <h1 className="text-4xl">About the Designer</h1>
            <p className="text-lg text-muted-foreground italic max-w-xl mx-auto">
              "What if technology could help us feel more human, not less?"
            </p>
          </BloomInstant>

          <div className="prose dark:prose-invert max-w-none space-y-4">
            <p className="text-lg">
              Nenya is built by Estëlle Streiff, a Minnesota-based designer, educator, and artist. This page exists mainly as a matter of transparency —
              Nenya isn't an anonymous product — but the intention has always been for the work to stand on its own rather than to center its
              maker.
            </p>
            <p className="text-lg">
              The practice behind it explores the emotional and ethical dimensions of technology, asking what it would mean to build digital tools
              that give more than they take, that make space for reflection rather than demanding attention. Nenya is the current expression of
              that question. It is a hybrid work of visual art, literature and contemplative technology, grounded in Nonviolent Communication.
              It is meant to help you pause and notice.
            </p>
          </div>

          <Card className="p-6 border-nenya-accent-primary/30">
            <div className="flex items-start gap-4">
              <div className="size-10 rounded-full bg-nenya-accent-primary/10 flex items-center justify-center ring-2 ring-nenya-accent-primary/20 flex-shrink-0">
                <BookOpen className="size-5 text-nenya-gold-text dark:text-nenya-accent-warm" />
              </div>
              <div className="space-y-3">
                <h3 className="text-lg">Background</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  M.A. in Organizational Leadership (Saint Mary's University of Minnesota) with graduate research focused on self-compassionate
                  leadership.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A bachelor's degree from the University of Minnesota, Twin Cities, with interdisciplinary coursework in Philosophy, Global Studies,
                  Social Work, Ecology, and Organizational Leadership.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2" style={{ background: `linear-gradient(135deg, ${nienna.vector[0]}10, ${nienna.vector[2]}10)`, borderColor: `${glow}40` }}>
            <div className="flex items-start gap-4">
              <div
                className="size-14 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg"
                style={{ background: `radial-gradient(circle, ${nienna.vector[0]}, ${nienna.vector[1]})` }}
              >
                <Quote className="size-6 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg">Guided by compassion</h3>
                <p className="text-sm text-muted-foreground">
                  The orientation that shapes the work is compassion for grief: not turning away from suffering but witnessing it fully. Some
                  people say they find meaning in loss <Cite pageId="founder" n={[1]} />. We do not promise that.
                </p>
                <p className="text-sm text-muted-foreground">
                  Not fixing, not optimizing, but attending.
                </p>
              </div>
            </div>
          </Card>

          <section className="space-y-4">
            <h2 className="text-2xl">Philosophical Foundations</h2>
            <div className="grid md:grid-cols-3 gap-5">
              <Card className="p-5 border-nenya-accent-primary/30">
                <h4 className="font-semibold mb-2 text-nenya-gold-text dark:text-nenya-accent-warm text-sm">Archetypes of Need</h4>
                <p className="text-xs text-muted-foreground">
                  The sixteen archetypes are our own attempt at a shared, imaginative vocabulary for human needs. We hope it can reach across
                  cultures and languages. We have not tested whether it does. The sixteen are our design, not a validated list.
                </p>
              </Card>
              <Card className="p-5 border-nenya-accent-secondary/30">
                <h4 className="font-semibold mb-2 text-nenya-gold-text dark:text-nenya-accent-warm text-sm">Nonviolent Communication</h4>
                <p className="text-xs text-muted-foreground">
                  Nonviolent Communication (NVC), Marshall Rosenberg's method, holds that beneath every feeling is a need, and that naming needs
                  without blame can help people connect. NVC is the framework behind the coach demo. This is Rosenberg's idea, not a tested finding.
                </p>
              </Card>
              <Card className="p-5 border-nenya-accent-metallic/30">
                <h4 className="font-semibold mb-2 text-nenya-gold-text dark:text-nenya-accent-warm text-sm">Systems Thinking</h4>
                <p className="text-xs text-muted-foreground">
                  Individual emotional health and collective wellbeing are linked <Cite pageId="founder" n={[2, 3, 4]} />. Nenya is designed with that link in mind.
                </p>
              </Card>
            </div>
          </section>

          <Card className="p-7 text-center border-2" style={{ borderColor: `${glow}40` }}>
            <div className="space-y-4 max-w-xl mx-auto">
              <div className="flex justify-center">
                <div
                  className="size-14 rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: `radial-gradient(circle, ${nienna.vector[0]}, ${nienna.vector[1]})` }}
                >
                  <Heart className="size-7 text-white" />
                </div>
              </div>
              <div className="prose dark:prose-invert max-w-none text-sm">
                <p>
                  Nenya is an active practice — a commitment to see yourself clearly, and to offer other people that same patience. What you need
                  isn't a flaw to fix. It's just part of being a person, worth paying attention to rather than pushing past.
                </p>
                <p className="font-semibold">Welcome to Nenya. We are here to help you listen.</p>
              </div>
              <p className="text-xs text-muted-foreground italic">— Estëlle, Designer</p>
            </div>
          </Card>

          <ReferenceList
            pageId="founder"
            items={[
              { n: 1, text: 'Tedeschi R, Calhoun L (2004). Posttraumatic Growth: Conceptual Foundations and Empirical Evidence. Psychological Inquiry.', href: 'https://doi.org/10.1207/s15327965pli1501_01', linkLabel: 'Publisher page (may need payment)' },
              { n: 2, text: 'Holt-Lunstad J, Smith T, Layton J (2010). Social Relationships and Mortality Risk: A Meta-analytic Review. PLoS Medicine.', href: 'https://doi.org/10.1371/journal.pmed.1000316', linkLabel: 'Free full text' },
              { n: 3, text: 'Pickett K, Wilkinson R (2010). Inequality: an underacknowledged source of mental illness and distress. British Journal of Psychiatry.', href: 'https://doi.org/10.1192/bjp.bp.109.072066', linkLabel: 'Publisher page (may need payment)' },
              { n: 4, text: 'Patel V, Saxena S, Lund C, Thornicroft G, Baingana F, Bolton P et al. (2018). The Lancet Commission on global mental health and sustainable development. The Lancet.', href: 'https://doi.org/10.1016/S0140-6736(18)31612-X', linkLabel: 'Free full text' },
            ]}
          />
        </div>
      </div>
      <ScrollHint />
      <ReturnToTop onClick={scrollToTop} />
      <ScrollIndicator containerRef={scrollContainerRef} />

      <AppFooter />
    </div>
  );
}
