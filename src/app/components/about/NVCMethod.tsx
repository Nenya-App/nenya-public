import React from 'react';
import { ArrowLeft, Heart, Eye, Lightbulb, MessageCircle, Network, Users, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { BloomInstant, BloomOnScroll } from '../BloomOnScroll';
import { ReturnToTop } from '../ReturnToTop';
import { ScrollIndicator } from '../ScrollIndicator';
import { AppFooter } from '../AppFooter';

interface NVCMethodProps {
  onBack: () => void;
}

export default function NVCMethod({ onBack }: NVCMethodProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div ref={scrollContainerRef} className="size-full overflow-auto scroll-container bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border px-6 py-4 sticky top-0 bg-background z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="shrink-0"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h1>NVC+: The Co-evolution of Empathy and Systemic Awareness</h1>
      </div>

      {/* Content */}
      <div className="w-full">
        <div className="mx-auto max-w-4xl px-6 py-12 space-y-12">
          
          {/* Section 1: The Foundational Practice */}
          <section className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl bg-gradient-to-r from-nenya-accent-secondary via-nenya-accent-primary to-nenya-accent-warm bg-clip-text text-transparent">
                Nonviolent Communication: The Four Core Pillars
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                NVC is a communication process developed by Dr. Marshall Rosenberg, rooted in the principle of <em>Ahimsa</em> — the natural state of compassion when violence is absent from the heart. It's a way of understanding ourselves and others by building empathetic connection before jumping to solutions. Nenya uses these four core components as the structure behind every reflection session.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-6 bg-gradient-to-br from-background-secondary to-background border-nenya-accent-primary/30">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-full bg-nenya-accent-primary/10 flex items-center justify-center flex-shrink-0">
                    <Eye className="size-6 text-nenya-accent-warm" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-foreground">1. Observation</h3>
                    <p className="text-sm text-muted-foreground">
                      Stating facts reported by your senses, clearly separated from evaluation or judgment.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-background-secondary to-background border-nenya-accent-secondary/30">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-full bg-nenya-accent-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Heart className="size-6 text-nenya-accent-warm" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-foreground">2. Feelings</h3>
                    <p className="text-sm text-muted-foreground">
                      Identifying physical sensations and emotions, free of story or blame.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-background-secondary to-background border-nenya-accent-metallic/30">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-full bg-nenya-accent-metallic/10 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="size-6 text-nenya-accent-warm" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-foreground">3. Needs</h3>
                    <p className="text-sm text-muted-foreground">
                      Connecting emotions to <strong>universal human needs</strong> (e.g., safety, understanding, rest). Needs are the 'why' behind our behavior.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-background-secondary to-background border-nenya-accent-warm/30">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-full bg-nenya-accent-warm/10 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="size-6 text-nenya-accent-warm" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-foreground">4. Requests</h3>
                    <p className="text-sm text-muted-foreground">
                      Clarifying specific, positive actions intended to contribute to fulfilling a need, framed as an open invitation, not a demand.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Section 2: The Evolutionary Leap */}
          <section className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl bg-gradient-to-r from-nenya-accent-secondary via-nenya-accent-metallic to-nenya-accent-warm bg-clip-text text-transparent">
                NVC+: Adapting to the Emotional Costs of Complexity
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                NVC is a crucial step in the evolution of communication technologies, but to meet the challenges of systemic emotional and spiritual atrophy and global fragmentation, we must incorporate <strong>Systemic Context</strong> and <strong>Communal Needs</strong> into the practice of self-reflection. Nenya's NVC+ framework makes two crucial additions to bridge the gap between individual healing and collective action.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-8 bg-gradient-to-br from-slate-50 to-zinc-50 dark:from-slate-900 dark:to-zinc-900 border-slate-300 dark:border-slate-700">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-slate-500/10 flex items-center justify-center">
                      <Network className="size-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <h3 className="text-slate-900 dark:text-slate-100">1. Systemic Context</h3>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm text-slate-700 dark:text-slate-300">Acknowledging Power and Historical Injustice</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      We explicitly acknowledge that feelings and needs are shaped by systems of power and historical injustice. Your frustration isn't always just personal; it can be a righteous response to an unfair system.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-8 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900 dark:to-purple-900 border-violet-300 dark:border-violet-700">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-violet-500/10 flex items-center justify-center">
                      <Users className="size-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <h3 className="text-violet-900 dark:text-violet-100">2. Communal Needs</h3>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm text-violet-700 dark:text-violet-300">Navigating the Space Between 'Me' and 'We'</h4>
                    <p className="text-sm text-violet-600 dark:text-violet-400 leading-relaxed">
                      We expand beyond individual needs to include <strong>Communal Needs</strong> like justice, equity, and sustainability. This allows us to navigate the space between 'me' and 'we' and realize that contributing to the well-being of others is a fundamental human motivation.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Section 3: Complementary Practice and Resources */}
          <section className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl bg-gradient-to-r from-nenya-gold-dark via-nenya-gold to-nenya-gold-light bg-clip-text text-transparent">
                Nenya: Your Complementary Practice Partner
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Nenya isn't a replacement for what you actually learn from human connection. It's a separate, complementary tool — a way to practice the mechanics of NVC privately, so you can show up for real conversations with a bit more capacity, empathy, and clarity. We think of Classical NVC as the foundational step this builds on, not something it replaces.
              </p>
            </div>

            {/* Trust & Disclaimer Bar */}
            <Alert className="border-orange-500/40 bg-orange-50 dark:bg-orange-950/30">
              <AlertTriangle className="size-4 text-orange-600 dark:text-orange-500" />
              <AlertDescription className="text-orange-900 dark:text-orange-200">
                <div className="space-y-3">
                  <div>
                    <strong>Affiliation Status:</strong> Nenya is an independent project and is <strong>not affiliated with, endorsed by, or a substitute for</strong> the Center for Nonviolent Communication (CNVC.org) or the NVC Academy (NVCacademy.com).
                  </div>
                  <div>
                    <strong>Seek Human Trainers:</strong> We strongly encourage all users to seek out certified human NVC trainers to gain the hands-on, embodied learning essential for mastery.
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {/* Resource Links - Foundational Thinkers */}
            <Card className="p-6 bg-muted/30 border-nenya-gold/20">
              <div className="space-y-4">
                <h3 className="text-foreground">Resources for Exploration</h3>
                <p className="text-sm text-muted-foreground">
                  To deepen your understanding of the principles behind Nenya, we encourage you to explore the work of these foundational thinkers and practitioners. Their work on conflict, communication, and systems thinking directly informs the NVC+ framework.
                </p>
                <div className="space-y-3">
                  <Card className="p-4 bg-background/60 border-border/60">
                    <div className="flex items-start gap-3">
                      <ExternalLink className="size-4 text-nenya-gold-dark mt-1 flex-shrink-0" />
                      <div className="space-y-1">
                        <a 
                          href="https://www.yvetteerasmus.com" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-nenya-gold-dark transition-colors"
                        >
                          <h4 className="text-sm">YvetteErasmus.com</h4>
                        </a>
                        <p className="text-xs text-muted-foreground">
                          Psychologist and conflict facilitator. Explores the intersection of psychology, social justice, and relational dynamics.
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 bg-background/60 border-border/60">
                    <div className="flex items-start gap-3">
                      <ExternalLink className="size-4 text-nenya-gold-dark mt-1 flex-shrink-0" />
                      <div className="space-y-1">
                        <a 
                          href="https://www.mikikashtan.org" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-nenya-gold-dark transition-colors"
                        >
                          <h4 className="text-sm">MikiKashtan.org</h4>
                        </a>
                        <p className="text-xs text-muted-foreground">
                          Co-founder of the Bay Area Nonviolent Communication. Focuses on applying NVC principles to social change, power, and interdependence.
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 bg-background/60 border-border/60">
                    <div className="flex items-start gap-3">
                      <ExternalLink className="size-4 text-nenya-gold-dark mt-1 flex-shrink-0" />
                      <div className="space-y-1">
                        <a 
                          href="https://empathyfactor.com/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-nenya-gold-dark transition-colors"
                        >
                          <h4 className="text-sm">EmpathyFactor.com - Marie Miyashiro</h4>
                        </a>
                        <p className="text-xs text-muted-foreground">
                          Integrating NVC into organizational settings. Author of "The Empathy Factor" on compassionate communication in business.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </Card>

            {/* Resource Links - NVC Training */}
            <Card className="p-6 bg-muted/30">
              <div className="space-y-4">
                <h3 className="text-foreground">Authentic NVC Training & Certification</h3>
                <p className="text-sm text-muted-foreground">
                  For authentic NVC training and certification, we recommend these trusted organizations:
                </p>
                <div className="space-y-3">
                  <Card className="p-4 bg-background/60 border-border/60">
                    <div className="flex items-start gap-3">
                      <ExternalLink className="size-4 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                      <div className="space-y-1">
                        <a 
                          href="https://www.cnvc.org" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-nenya-gold-dark transition-colors"
                        >
                          <h4 className="text-sm">CNVC.org (Center for Nonviolent Communication)</h4>
                        </a>
                        <p className="text-xs text-muted-foreground">
                          The global hub for NVC, founded by Marshall Rosenberg, offering resources, training, and certification.
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 bg-background/60 border-border/60">
                    <div className="flex items-start gap-3">
                      <ExternalLink className="size-4 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                      <div className="space-y-1">
                        <a 
                          href="https://nvctraining.com" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-nenya-gold-dark transition-colors"
                        >
                          <h4 className="text-sm">NVC Academy (Online Training)</h4>
                        </a>
                        <p className="text-xs text-muted-foreground">
                          Provides a comprehensive library of online courses, practice groups, and telecourses.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </Card>

            {/* Final note */}
            <Card className="p-6 bg-gradient-to-br from-nenya-gold/5 to-nenya-gold-light/5 border-nenya-gold/30">
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                Nenya exists to make the <em>practice</em> of NVC+ more accessible and private, not to replace the deep, transformative work that happens in relationship with trained facilitators and communities. Think of us as your training wheels—a safe space to develop muscle memory before you engage in the real, vulnerable work of connection.
              </p>
            </Card>
          </section>

          <ReturnToTop onClick={scrollToTop} />
        </div>
      </div>
      
      {/* Scroll indicator */}
      <ScrollIndicator containerRef={scrollContainerRef} />

      <AppFooter />
    </div>
  );
}