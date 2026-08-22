import { ArrowLeft, Users, Heart } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useIsMobile } from '../useIsMobile';
import { BloomInstant, BloomOnScroll } from '../BloomOnScroll';
import { ReturnToTop } from '../ReturnToTop';
import React from 'react';

interface HumanCenteredDesignProps {
  onBack: () => void;
}

export default function HumanCenteredDesign({ onBack }: HumanCenteredDesignProps) {
  const isMobile = useIsMobile();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div ref={scrollContainerRef} className="size-full overflow-auto scroll-container bg-background text-foreground relative">
      <div className="border-b border-border bg-background/95 backdrop-blur-sm px-4 md:px-6 py-3 md:py-4 sticky top-0 z-10">
        <Button variant="ghost" onClick={onBack} className="gap-2" size={isMobile ? "sm" : "default"}>
          <ArrowLeft className="size-4" />
          <span>Back to Bio-Social Design</span>
        </Button>
      </div>

      <div className="w-full">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-16 space-y-8 md:space-y-12">
          
          <BloomInstant className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-blue-500/10 rounded-full">
                <Users className="size-12 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Human-Centered Design
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Designing with deep empathy for human needs, contexts, and experiences
            </p>
          </BloomInstant>

          <BloomOnScroll>
            <Card className="p-6 md:p-8 bg-muted/30 border-border">
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>
                  <strong className="text-nenya-gold-dark dark:text-nenya-gold-light">Human-Centered Design (HCD)</strong> is a creative problem-solving approach that starts with understanding the people you're designing for and ends with solutions tailored to meet their needs.
                </p>
                <p>
                  Nenya's design process is deeply rooted in HCD principles. Rather than imposing a single "right way" to begin self-reflection, we recognized that people connect with their inner experience through different sensory modalities.
                </p>
              </div>
            </Card>
          </BloomOnScroll>

          <BloomOnScroll className="space-y-6">
            <h2 className="text-2xl md:text-3xl text-nenya-gold-dark dark:text-nenya-gold-light">
              HCD in Nenya's Design
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-6 bg-muted/20">
                <h3 className="text-lg text-foreground mb-3 flex items-center gap-2">
                  <Heart className="size-5 text-pink-600 dark:text-pink-400" />
                  Empathy First
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We designed the Six Gateways after observing that not everyone resonates with visual color symbolism. Some people are more attuned to sound, touch, or movement.
                </p>
              </Card>

              <Card className="p-6 bg-muted/20">
                <h3 className="text-lg text-foreground mb-3">
                  Progressive Disclosure
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Complex philosophy and methodology are hidden behind simple, emotionally resonant entry points. You can go as deep as you want, when you want.
                </p>
              </Card>

              <Card className="p-6 bg-muted/20">
                <h3 className="text-lg text-foreground mb-3">
                  Accessibility
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Multi-modal gateways ensure the experience is accessible to people with different cognitive styles, sensory preferences, and neurodivergent experiences.
                </p>
              </Card>

              <Card className="p-6 bg-muted/20">
                <h3 className="text-lg text-foreground mb-3">
                  Privacy by Design
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Understanding that safety is a human need, we built privacy and anonymity into the core architecture rather than as an afterthought.
                </p>
              </Card>
            </div>
          </BloomOnScroll>

          <BloomOnScroll>
            <Card className="p-6 md:p-8 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/30">
              <div className="space-y-4">
                <h3 className="text-xl text-blue-700 dark:text-blue-300">
                  Learn More About HCD
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Human-Centered Design is a methodology pioneered by IDEO and taught at institutions like Stanford's d.school. It emphasizes iterative prototyping, user testing, and designing for real human needs rather than assumed ones.
                </p>
                <a 
                  href="https://www.interaction-design.org/literature/topics/human-centered-design"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-blue-700 dark:text-blue-300 hover:underline"
                >
                  Explore Human-Centered Design at Interaction Design Foundation →
                </a>
              </div>
            </Card>
          </BloomOnScroll>

          <ReturnToTop onClick={scrollToTop} />
        </div>
      </div>
    </div>
  );
}
