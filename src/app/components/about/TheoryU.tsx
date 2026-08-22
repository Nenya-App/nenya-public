import { ArrowLeft, TrendingDown, Circle, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useIsMobile } from '../useIsMobile';
import { BloomInstant, BloomOnScroll } from '../BloomOnScroll';
import { ReturnToTop } from '../ReturnToTop';
import React from 'react';

interface TheoryUProps {
  onBack: () => void;
}

export default function TheoryU({ onBack }: TheoryUProps) {
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
              <div className="p-4 bg-purple-500/10 rounded-full">
                <Circle className="size-12 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 bg-clip-text text-transparent">
              Theory U
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Leading from the emerging future through presencing
            </p>
          </BloomInstant>

          <BloomOnScroll>
            <Card className="p-6 md:p-8 bg-muted/30 border-border">
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>
                  <strong className="text-nenya-gold-dark dark:text-nenya-gold-light">Theory U</strong>, developed by Otto Scharmer at MIT, is a framework for transformational change that emphasizes <em>presencing</em>—connecting to your deepest source of knowing and acting from that place.
                </p>
                <p>
                  The U-shaped journey moves through three phases: <strong>sensing</strong> (downloading and observing), <strong>presencing</strong> (connecting to source at the bottom of the U), and <strong>realizing</strong> (prototyping and performing).
                </p>
              </div>
            </Card>
          </BloomOnScroll>

          <BloomOnScroll className="space-y-6">
            <h2 className="text-2xl md:text-3xl text-nenya-gold-dark dark:text-nenya-gold-light">
              The U Journey in Nenya
            </h2>
            
            <div className="space-y-4">
              <Card className="p-6 bg-gradient-to-r from-purple-500/5 to-purple-500/10 border-purple-500/30">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-500/20 rounded-lg shrink-0">
                    <TrendingDown className="size-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg text-foreground">
                      Descending: Sensing & Observing
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      The gateway rituals (color, sound, touch, etc.) guide you inward. You begin by observing your current emotional state without judgment—suspending habitual patterns of thought.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-r from-fuchsia-500/5 to-fuchsia-500/10 border-fuchsia-500/30">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-fuchsia-500/20 rounded-lg shrink-0">
                    <Circle className="size-6 text-fuchsia-600 dark:text-fuchsia-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg text-foreground">
                      Presencing: Connecting to Source
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Through the NVC+ practice, you connect with your authentic feelings and needs. This is the "presencing" moment—where you access your deepest truth beneath reactive patterns.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-r from-pink-500/5 to-pink-500/10 border-pink-500/30">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-pink-500/20 rounded-lg shrink-0">
                    <TrendingUp className="size-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg text-foreground">
                      Ascending: Realizing & Performing
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      From this place of clarity, you can identify actionable requests and strategies that align with your authentic needs—leading from your emerging future rather than your habitual past.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </BloomOnScroll>

          <BloomOnScroll>
            <Card className="p-6 md:p-8 bg-muted/30 border-border">
              <div className="space-y-4 text-foreground leading-relaxed">
                <h3 className="text-xl text-nenya-gold-dark dark:text-nenya-gold-light">
                  Why Theory U Matters for Evolved Leadership
                </h3>
                <p>
                  In a world of accelerating complexity, leaders can no longer rely solely on past experience. Theory U teaches us to sense emerging futures and act from a place of deeper knowing—which requires emotional literacy and connection to our authentic needs.
                </p>
                <p>
                  Nenya provides a daily practice space for this inner work, making the abstract concepts of presencing tangible and accessible.
                </p>
              </div>
            </Card>
          </BloomOnScroll>

          <BloomOnScroll>
            <Card className="p-6 md:p-8 bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5 border-purple-500/30">
              <div className="space-y-4">
                <h3 className="text-xl text-purple-700 dark:text-purple-300">
                  Learn More About Theory U
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Theory U is taught at the Presencing Institute, co-founded by Otto Scharmer. It's used by leaders, educators, and change agents worldwide to navigate complex challenges through deeper listening and collective awareness.
                </p>
                <a 
                  href="https://www.presencing.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-purple-700 dark:text-purple-300 hover:underline"
                >
                  Explore Theory U at the Presencing Institute →
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
