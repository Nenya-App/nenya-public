import React from 'react';
import { ArrowLeft, Eye, Palette, Heart, Music, Cloud, Box, Sprout, ExternalLink, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { BloomInstant, BloomOnScroll } from '../BloomOnScroll';
import { ReturnToTop } from '../ReturnToTop';
import { AppFooter } from '../AppFooter';

interface PowerOfColorProps {
  onBack: () => void;
}

export default function PowerOfColor({ onBack }: PowerOfColorProps) {
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
        <h1>The Power of Color: Mapping the Evolutionary Mind</h1>
      </div>

      {/* Content */}
      <div className="w-full">
        <div className="mx-auto max-w-4xl px-6 py-12 space-y-12">
          
          {/* Section 1: The Evolutionary Primacy of Vision */}
          <section className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl bg-gradient-to-r from-nenya-accent-secondary via-nenya-accent-primary to-nenya-accent-warm bg-clip-text text-transparent">
                Color: Our Oldest Survival Language
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Vision is the most dominant sense in the human brain, an evolutionary gift honed for survival. Primates are among the only placental mammals with <strong>trichromatic vision</strong>—the ability to see red, green, and blue. This capacity didn't evolve for aesthetics; it evolved for crucial survival tasks, such as detecting ripe, nutrient-rich fruits against dense green foliage. This deep, evolutionary history means that <strong>color is wired directly into our threat and reward circuitry</strong>, giving it immense, universal psychological power.
              </p>
            </div>

            <Card className="p-8 bg-gradient-to-br from-background-secondary to-background border-nenya-accent-primary/30">
              <div className="flex items-start gap-6">
                <div className="size-16 rounded-full bg-nenya-accent-primary/10 flex items-center justify-center flex-shrink-0">
                  <Eye className="size-8 text-nenya-accent-warm" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-foreground">The Visual Cortex: A Survival Superpower</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Approximately 30% of the human brain's cortex is devoted to processing visual information—far more than any other sense. This evolutionary investment reflects millions of years of natural selection favoring individuals who could quickly identify food sources, detect threats, and navigate complex social hierarchies through visual cues. Color processing is not a luxury; it's fundamental to how we make sense of the world.
                  </p>
                </div>
              </div>
            </Card>
          </section>

          {/* Section 2: Color Theory and the Emotional Bridge */}
          <section className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl bg-gradient-to-r from-nenya-accent-secondary via-nenya-accent-metallic to-nenya-accent-warm bg-clip-text text-transparent">
                Mapping Your Internal State
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Color theory demonstrates that specific hues are associated with universal psychological effects, affecting mood and motivation across cultures. For example, studies show that blue light increases alertness, while red can increase energy or trigger caution in achievement contexts. Nenya uses color as a language to bypass the analytical, logical brain. When you select a color to represent a feeling, you are using the oldest, most primal part of your visual system to communicate your current internal state.
              </p>
            </div>

            <Card className="p-8 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950 border-violet-200 dark:border-violet-800">
              <div className="flex items-start gap-6">
                <div className="size-16 rounded-full bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                  <Palette className="size-8 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-violet-900 dark:text-violet-100">Color as Emotional Shorthand</h3>
                  <p className="text-sm text-violet-800/80 dark:text-violet-200/80 leading-relaxed">
                    Your two chosen colors—your <strong>Present</strong> and your <strong>Potential</strong>—are a non-verbal poem you write for yourself. They allow you to show how you feel before you are asked to explain it. This act taps into a deeper, more intuitive part of your consciousness, setting the stage for a different kind of conversation.
                  </p>
                  <p className="text-sm text-violet-800/80 dark:text-violet-200/80 leading-relaxed">
                    We use hex codes as your identity because your inner world is too rich and nuanced to be captured by a username. The system offers 281 trillion+ unique color combinations—a philosophical point about the infinite complexity of your emotional landscape.
                  </p>
                </div>
              </div>
            </Card>

            {/* Further Reading Box */}
            <Alert className="border-indigo-500/40 bg-indigo-50 dark:bg-indigo-950/30">
              <Info className="size-4 text-indigo-600 dark:text-indigo-500" />
              <AlertDescription className="text-indigo-900 dark:text-indigo-200">
                <div className="space-y-3">
                  <strong>Further Reading</strong>
                  <p className="text-sm">
                    To learn more about how color affects human psychology and perception, we recommend exploring the research-backed resources on color theory.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-2 border-indigo-300 dark:border-indigo-700"
                    asChild
                  >
                    <a href="https://www.interaction-design.org/literature/topics/color-theory" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-4" />
                      Basic Color Theory: Psychology and Design
                    </a>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </section>

          {/* Section 3: Accessibility, Diversity, and Universal Metaphor */}
          <section className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                Beyond Vision: The Universal Metaphor
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We are committed to creating a truly diverse and accessible tool. We understand that the color metaphor is <strong>not universally accessible</strong> (e.g., to individuals with color blindness, varying neurological wiring, or cultural contexts where color symbolism differs). <strong>The true power lies not in the color, but in the metaphor itself.</strong> We encourage all users to find the expressive system that works for them.
              </p>
            </div>

            <Card className="p-8 bg-muted/30 border-border">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Heart className="size-6 text-muted-foreground" />
                  <h3 className="text-foreground">Alternative Metaphors for Self-Expression</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  If color doesn't resonate with you, or if it's not accessible to you, consider using one of these alternative sensory or conceptual frameworks to map your emotional landscape:
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex gap-4 p-4 rounded-lg bg-background border border-border">
                    <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <Music className="size-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm">Music/Sound</h4>
                      <p className="text-xs text-muted-foreground italic">
                        What is the rhythm or chord of this emotion?
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 rounded-lg bg-background border border-border">
                    <div className="size-10 rounded-full bg-sky-500/10 flex items-center justify-center flex-shrink-0">
                      <Cloud className="size-5 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm">Weather/Climate</h4>
                      <p className="text-xs text-muted-foreground italic">
                        Is this feeling a dense fog, a sudden thunderstorm, or a calm, sunny morning?
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 rounded-lg bg-background border border-border">
                    <div className="size-10 rounded-full bg-stone-500/10 flex items-center justify-center flex-shrink-0">
                      <Box className="size-5 text-stone-600 dark:text-stone-400" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm">Texture/Material</h4>
                      <p className="text-xs text-muted-foreground italic">
                        Does this emotion feel like rough sandpaper, flowing water, or heavy stone?
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 rounded-lg bg-background border border-border">
                    <div className="size-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <Sprout className="size-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm">Living Systems</h4>
                      <p className="text-xs text-muted-foreground italic">
                        Is this feeling a strong tree root, a slow-growing vine, or a sudden forest fire?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Final Call to Action */}
            <Card className="p-6 bg-gradient-to-br from-nenya-gold/10 to-nenya-gold-light/10 border-nenya-gold/30">
              <p className="text-lg text-center text-foreground leading-relaxed">
                <strong>Nenya is a guide to your own wisdom.</strong> Use the language—be it color, texture, or weather—that provides the clearest, most honest window into your emotional landscape.
              </p>
            </Card>

            {/* Foundational Promise */}
            <Card className="p-6 bg-muted/50 border-border">
              <p className="text-sm text-muted-foreground italic text-center leading-relaxed">
                It is our first, and most fundamental, promise to you: we will always honor the complexity of your experience.
              </p>
            </Card>
          </section>

          <ReturnToTop onClick={scrollToTop} />
        </div>
      </div>

      <AppFooter />
    </div>
  );
}
