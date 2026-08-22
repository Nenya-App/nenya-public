import React from 'react';
import { ArrowLeft, Brain, BookOpen, Heart, DollarSign, Sparkles, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import NenyaLogo from '../NenyaLogo';
import { BloomInstant, BloomOnScroll } from '../BloomOnScroll';
import { ReturnToTop } from '../ReturnToTop';
import { ScrollIndicator } from '../ScrollIndicator';
import { AppFooter } from '../AppFooter';

interface EvolvedLeadershipProps {
  onBack: () => void;
}

export default function EvolvedLeadership({ onBack }: EvolvedLeadershipProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div ref={scrollContainerRef} className="size-full overflow-auto scroll-container bg-background">
      <div className="border-b border-border bg-background px-6 py-4 sticky top-0 z-10">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="size-4" />
          Back to About
        </Button>
      </div>

      <div className="w-full">
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
          {/* Header with Logo */}
          <BloomInstant className="text-center space-y-6">
            <div className="flex justify-center">
              <NenyaLogo size={100} />
            </div>
            <h1 className="text-4xl bg-gradient-to-r from-nenya-accent-secondary via-nenya-accent-primary to-nenya-accent-metallic bg-clip-text text-transparent">
              Evolved Leadership & The Co-evolutionary Imperative
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Leadership is not a fixed title held by a few, but a <strong>co-evolving capacity</strong> that must be cultivated moment-to-moment by every individual.
            </p>
          </BloomInstant>

          {/* AI Disclaimer */}
          <BloomOnScroll>
            <Alert className="border-nenya-accent-primary/40 bg-nenya-accent-primary/5">
            <Sparkles className="size-4 text-nenya-accent-warm" />
            <AlertDescription>
              <strong>Research Transparency:</strong> AI was used in the creation of this content. It is important to always double-check sources and independently validate research and findings whenever possible. All citations include accessible links for your verification.
            </AlertDescription>
            </Alert>
          </BloomOnScroll>

          {/* Revolutionary Concept */}
          <BloomOnScroll>
            <section className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl">The Revolutionary Concept: Leadership Within the People</h2>
                <p className="text-lg text-muted-foreground">
                  The survival of humanity depends on activating a <strong>shared leadership capacity</strong> within "The People." This is not a moral suggestion—it is an evolutionary trajectory.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 border-nenya-accent-primary/30 hover:border-nenya-accent-warm nenya-hover-glow transition-all">
                <h3 className="text-nenya-accent-warm mb-3">Co-evolutionary Leadership</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Leadership is not static; it is a dynamic, shared relationship that co-evolves with our social challenges. It is the practice of <strong>Shared Leadership</strong>, where collective awareness of team strengths and weaknesses is paramount.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  This contrasts with historical, dominant leadership models (coercive power vs. authoritative power).
                </p>
              </Card>

              <Card className="p-6 border-nenya-accent-primary/30 hover:border-nenya-accent-warm nenya-hover-glow transition-all">
                <h3 className="text-nenya-accent-warm mb-3">Spiritual Universality</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The practice of compassion is the most evocative emotion defining "humanity." The commitment to a compassionate alliance is an evolutionary trajectory, not a moral suggestion.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Compassion evolved to protect the weak and facilitate cooperation.
                </p>
              </Card>
            </div>
          </section>

          {/* Three Pillars of Universality */}
          <section className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl bg-gradient-to-r from-nenya-accent-secondary to-nenya-accent-warm bg-clip-text text-transparent">
                The Three Pillars of Universal Leadership
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Leadership capacity is universal across scientific, academic, and spiritual domains
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Pillar 1: Scientific */}
              <Card className="p-6 bg-gradient-to-br from-background-secondary to-background border-nenya-accent-primary/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-12 rounded-full bg-nenya-accent-primary/10 flex items-center justify-center ring-2 ring-nenya-accent-primary/20">
                    <Brain className="size-6 text-nenya-accent-warm" />
                  </div>
                  <h3 className="text-foreground">Scientific Universality</h3>
                </div>
                <div className="space-y-4">
                  <p className="text-sm text-foreground">
                    <strong>The hardware of leadership is shared across all mammalian species.</strong>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Emotions (fear, joy, empathy) are <strong>phylogenetically conserved</strong> and served as adaptive mechanisms to enhance social bonds and cooperation in early humans.
                  </p>
                  <div className="bg-nenya-accent-primary/5 rounded p-3 text-xs text-muted-foreground">
                    <strong>Neuroscience:</strong> Empathy activates the same brain regions (Anterior Insula, Midcingulate Cortex) when we observe pain in others as when we experience it ourselves—a shared representation.
                  </div>
                </div>
              </Card>

              {/* Pillar 2: Academic */}
              <Card className="p-6 bg-gradient-to-br from-background-secondary to-background border-nenya-accent-secondary/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-12 rounded-full bg-nenya-accent-secondary/10 flex items-center justify-center ring-2 ring-nenya-accent-secondary/20">
                    <BookOpen className="size-6 text-nenya-accent-warm" />
                  </div>
                  <h3 className="text-foreground">Academic Universality</h3>
                </div>
                <div className="space-y-4">
                  <p className="text-sm text-foreground">
                    <strong>The historical acknowledgment of Emotional Intelligence (EQ).</strong>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    IQ alone does not dictate success. Research found that individuals with average IQs often outperformed those with the highest IQs, while <strong>90% of top performers possessed high EQ</strong>.
                  </p>
                  <div className="bg-nenya-accent-secondary/5 rounded p-3 text-xs text-muted-foreground">
                    <strong>Social Science:</strong> The social identity model (SIMCA) confirms that collective action is driven by perceived injustice, efficacy, and social identity—all rooted in emotional connection.
                  </div>
                </div>
              </Card>

              {/* Pillar 3: Spiritual */}
              <Card className="p-6 bg-gradient-to-br from-background-secondary to-background border-nenya-accent-metallic/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-12 rounded-full bg-nenya-accent-metallic/10 flex items-center justify-center ring-2 ring-nenya-accent-metallic/20">
                    <Heart className="size-6 text-nenya-accent-warm" />
                  </div>
                  <h3 className="text-foreground">Spiritual Universality</h3>
                </div>
                <div className="space-y-4">
                  <p className="text-sm text-foreground">
                    <strong>The imperative of compassion and connection.</strong>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Compassion is an emotional motivation to help others and alleviate suffering. The ultimate goal is the <strong>Compassionate Alliance</strong>.
                  </p>
                  <div className="bg-nenya-accent-metallic/5 rounded p-3 text-xs text-muted-foreground">
                    <strong>Awe & Connection:</strong> The concept of awe motivates human beings to be more connected to others and act in collaborative ways, transcending self-interest for the greater good.
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* The Cost of Emotional and Spiritual Atrophy */}
          <section className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="size-16 rounded-full bg-nenya-accent-warm/10 flex items-center justify-center ring-2 ring-nenya-accent-warm/20">
                  <DollarSign className="size-8 text-nenya-accent-warm" />
                </div>
              </div>
              <h2 className="text-3xl text-foreground">
                The Trillion-Dollar Cost of Emotional and Spiritual Atrophy
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The economic case for intervention: quantifying the cost of failing to co-evolve emotionally
              </p>
            </div>

            <div className="space-y-4">
              <Card className="p-6 border-nenya-accent-warm/30 bg-nenya-accent-warm/5">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="size-6 text-nenya-accent-warm flex-shrink-0 mt-1" />
                  <div className="space-y-3 flex-1">
                    <div>
                      <h4 className="text-foreground mb-2">Disengagement Cost (Global)</h4>
                      <p className="text-2xl text-nenya-accent-warm mb-2">$8.9 Trillion Annually</p>
                      <p className="text-sm text-muted-foreground">
                        Gallup's 2024 State of the Global Workplace report estimates low engagement costs the global economy $8.9 trillion annually — around 9% of global GDP. The 2025 follow-up found engagement fell further in 2024, erasing an additional $438 billion in productivity.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-5 border-nenya-accent-secondary/30 bg-nenya-accent-secondary/5">
                  <h4 className="text-foreground mb-2">Absenteeism & Morale</h4>
                  <p className="text-xl text-nenya-accent-warm mb-2">$550 Billion + $300 Billion</p>
                  <p className="text-sm text-muted-foreground">
                    Low morale costs businesses $550B annually. Stress and toxic environments driven by lack of empathy contribute an additional $300B in absenteeism.
                  </p>
                </Card>

                <Card className="p-5 border-nenya-accent-primary/30 bg-nenya-accent-primary/5">
                  <h4 className="text-foreground mb-2">Mental Health Burden</h4>
                  <p className="text-xl text-nenya-accent-warm mb-2">$280 Billion Annually</p>
                  <p className="text-sm text-muted-foreground">
                    Cost of untreated mental illness. Lack of self-compassion is strongly linked to anxiety, depression, and stress.
                  </p>
                </Card>
              </div>

              <Card className="p-6 border-nenya-accent-metallic/30 bg-nenya-accent-metallic/5">
                <h4 className="text-foreground mb-3">Societal Friction & Systemic Breakdown</h4>
                <p className="text-sm text-muted-foreground">
                  Political polarization, mass incarceration, and wealth inequality are linked to empathy deficits. The patriarchal devaluation of emotion inhibits the capacity for empathy and social cohesion, creating cascading societal costs.
                </p>
              </Card>
            </div>
          </section>

          {/* Nenya: The Sprinkler System */}
          <section className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <NenyaLogo size={80} />
              </div>
              <h2 className="text-3xl bg-gradient-to-r from-nenya-accent-secondary via-nenya-accent-primary to-nenya-accent-warm bg-clip-text text-transparent">
                Nenya: The Technology that Nurtures Leadership Within
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A "Sprinkler System" designed to reverse emotional and spiritual atrophy through neuroplasticity
              </p>
            </div>

            <Card className="p-8 bg-gradient-to-br from-nenya-accent-primary/5 via-background to-nenya-accent-metallic/5 border-nenya-accent-primary/30">
              <div className="space-y-6">
                <div>
                  <h3 className="text-nenya-accent-warm mb-3 flex items-center gap-2">
                    <Brain className="size-5" />
                    Neuroplasticity Intervention
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Nenya counteracts the <strong>basal psychological devolution</strong> that occurs when stress triggers the amygdala—our brain's alarm system.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="bg-background/80 rounded-lg p-4 border border-nenya-accent-primary/20">
                      <h4 className="mb-2 flex items-center gap-2">
                        <Heart className="size-4 text-rose-600" />
                        <span>NVC Practice as Self-Compassion Training</span>
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        The structured NVC reflection enhances <strong>Vagus Nerve-mediated Heart Rate Variability (HRV)</strong>—the body's internal brake against the fight-or-flight response.
                      </p>
                      <p className="text-xs text-muted-foreground italic">
                        HRV is a key marker of emotional regulation capacity and stress resilience.
                      </p>
                    </div>

                    <div className="bg-background/80 rounded-lg p-4 border border-nenya-gold/20">
                      <h4 className="mb-2 flex items-center gap-2">
                        <Brain className="size-4 text-purple-600" />
                        <span>Mindfulness & Prefrontal Cortex Activation</span>
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        The focused, non-judgmental attention required by NVC increases activation in the <strong>Prefrontal Cortex (PFC)</strong>, literally building capacity for reflective, non-defensive behavior.
                      </p>
                      <p className="text-xs text-muted-foreground italic">
                        For novice users, this strengthens inhibitory control over the amygdala—the biological foundation of emotional intelligence.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-nenya-gold-dark mb-3 flex items-center gap-2">
                    <Sparkles className="size-5" />
                    Countering Consumption Technology
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Nenya is built for <strong>Reflection over Consumption</strong>. It operates on <strong>Safety First</strong>: ephemeral sessions, no data storage, zero-knowledge architecture.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This directly addresses the public's concern that technology is designed to consume their attention and data, providing the secure container necessary for vulnerability.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-nenya-gold/10 to-cyan-500/10 rounded-lg p-6 border border-nenya-gold/30">
                  <h3 className="text-nenya-gold-dark mb-3">The Outcome: Collective Action Capacity</h3>
                  <p className="text-muted-foreground">
                    By mastering individual emotional capacity (Mindfulness, Empathy, Self-Compassion), the user activates the foundational skills required for the broader, necessary <strong>Collective Action</strong>—a leadership that belongs to everyone.
                  </p>
                </div>
              </div>
            </Card>
          </section>

          {/* Tool Safety Caution */}
          <Alert className="border-yellow-500/40 bg-yellow-50/50 dark:bg-yellow-950/20">
            <AlertTriangle className="size-4 text-yellow-600" />
            <AlertDescription className="text-yellow-900 dark:text-yellow-100">
              <strong>Important Safety Notice:</strong> No tool can ever be completely safe. While Nenya is designed with privacy-first principles and safety protocols, it is important to proceed mindfully with its use. Trust your instincts, honor your boundaries, and remember that you are always in control of what you choose to share and explore.
            </AlertDescription>
          </Alert>

          {/* Citations & References */}
          <section className="space-y-4">
            <h3 className="text-xl">References & Further Reading</h3>
            <Card className="p-6 bg-muted/30">
              <div className="space-y-4 text-sm">
                <p className="text-muted-foreground mb-4">
                  The following sources informed this content. Please independently verify all claims and research:
                </p>

                <div className="grid gap-4">
                  <div className="flex items-start gap-2">
                    <ExternalLink className="size-4 text-nenya-gold-dark flex-shrink-0 mt-0.5" />
                    <div>
                      <a 
                        href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3713325/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-nenya-gold-dark hover:underline"
                      >
                        Compassion: An Evolutionary Analysis and Empirical Review
                      </a>
                      <p className="text-xs text-muted-foreground mt-1">Goetz et al. (2010) - Psychological Bulletin</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <ExternalLink className="size-4 text-nenya-gold-dark flex-shrink-0 mt-0.5" />
                    <div>
                      <a 
                        href="https://greatergood.berkeley.edu/article/item/the_compassionate_instinct" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-nenya-gold-dark hover:underline"
                      >
                        The Compassionate Instinct - Greater Good Science Center
                      </a>
                      <p className="text-xs text-muted-foreground mt-1">Keltner, D. - UC Berkeley</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <ExternalLink className="size-4 text-nenya-gold-dark flex-shrink-0 mt-0.5" />
                    <div>
                      <a 
                        href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2555428/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-nenya-gold-dark hover:underline"
                      >
                        The Evolution of Empathy
                      </a>
                      <p className="text-xs text-muted-foreground mt-1">de Waal, F. (2008) - Greater Good Magazine</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <ExternalLink className="size-4 text-nenya-gold-dark flex-shrink-0 mt-0.5" />
                    <div>
                      <a 
                        href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3156028/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-nenya-gold-dark hover:underline"
                      >
                        The Neural Basis of Empathy
                      </a>
                      <p className="text-xs text-muted-foreground mt-1">Lamm et al. (2011) - Annual Review of Psychology</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <ExternalLink className="size-4 text-nenya-gold-dark flex-shrink-0 mt-0.5" />
                    <div>
                      <a 
                        href="https://hbr.org/2017/02/emotional-intelligence-has-12-elements-which-do-you-need-to-work-on" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-nenya-gold-dark hover:underline"
                      >
                        Emotional Intelligence Has 12 Elements
                      </a>
                      <p className="text-xs text-muted-foreground mt-1">Goleman, D. & Boyatzis, R. (2017) - Harvard Business Review</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <ExternalLink className="size-4 text-nenya-gold-dark flex-shrink-0 mt-0.5" />
                    <div>
                      <a 
                        href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3498959/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-nenya-gold-dark hover:underline"
                      >
                        Social Identity and Collective Action
                      </a>
                      <p className="text-xs text-muted-foreground mt-1">van Zomeren et al. (2008) - Journal of Social Issues</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <ExternalLink className="size-4 text-nenya-gold-dark flex-shrink-0 mt-0.5" />
                    <div>
                      <a 
                        href="https://www.gallup.com/workplace/247391/fixable-problem-costs-businesses-trillion.aspx" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-nenya-gold-dark hover:underline"
                      >
                        Employee Engagement & Productivity Costs
                      </a>
                      <p className="text-xs text-muted-foreground mt-1">Gallup Workplace Research</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <ExternalLink className="size-4 text-nenya-gold-dark flex-shrink-0 mt-0.5" />
                    <div>
                      <a 
                        href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3498959/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-nenya-gold-dark hover:underline"
                      >
                        Self-Compassion and Mental Health
                      </a>
                      <p className="text-xs text-muted-foreground mt-1">Neff, K. & Germer, C. (2013) - Clinical Psychology Review</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <ExternalLink className="size-4 text-nenya-gold-dark flex-shrink-0 mt-0.5" />
                    <div>
                      <a 
                        href="https://www.apa.org/pubs/journals/releases/psp-pspi0000018.pdf" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-nenya-gold-dark hover:underline"
                      >
                        Awe, the Small Self, and Prosocial Behavior
                      </a>
                      <p className="text-xs text-muted-foreground mt-1">Piff et al. (2015) - Journal of Personality and Social Psychology</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <ExternalLink className="size-4 text-nenya-gold-dark flex-shrink-0 mt-0.5" />
                    <div>
                      <a 
                        href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5575449/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-nenya-gold-dark hover:underline"
                      >
                        Mindfulness and Prefrontal Cortex Function
                      </a>
                      <p className="text-xs text-muted-foreground mt-1">Tang et al. (2015) - Nature Reviews Neuroscience</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <ExternalLink className="size-4 text-nenya-gold-dark flex-shrink-0 mt-0.5" />
                    <div>
                      <a 
                        href="https://www.heartmath.org/research/science-of-the-heart/heart-rate-variability/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-nenya-gold-dark hover:underline"
                      >
                        Heart Rate Variability & Emotional Regulation
                      </a>
                      <p className="text-xs text-muted-foreground mt-1">HeartMath Institute Research</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-50/50 dark:bg-yellow-950/20 rounded border border-yellow-200 dark:border-yellow-800">
                  <p className="text-xs text-yellow-900 dark:text-yellow-100">
                    <strong>Verification Note:</strong> While these sources are from reputable institutions and peer-reviewed publications, we encourage you to independently verify all claims, read the full papers, and form your own informed understanding. Science is an ongoing conversation, not a final authority.
                  </p>
                </div>
              </div>
            </Card>
            </section>
          </BloomOnScroll>
          
          <ReturnToTop onClick={scrollToTop} />
        </div>
      </div>
      
      {/* Scroll indicator */}
      <ScrollIndicator containerRef={scrollContainerRef} />

      <AppFooter />
    </div>
  );
}