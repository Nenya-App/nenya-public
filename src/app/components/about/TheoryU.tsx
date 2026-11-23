import { ArrowLeft, TrendingDown, Circle, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useIsMobile } from '../useIsMobile';
import { BloomInstant, BloomOnScroll } from '../BloomOnScroll';
import { ReturnToTop } from '../ReturnToTop';
import React from 'react';
import { Cite, ReferenceList, type AboutReference } from './AboutReferences';

const REFS: AboutReference[] = [
  {"n": 1, "text": "Kühl S (2020). The Blind Spots in Theory U: The Reconstruction of a (Change-) Management Fashion. Journal of Change Management.", "href": "https://doi.org/10.1080/14697017.2020.1744883", "linkLabel": "Free full text"},
  {"n": 2, "text": "Heller P (2018). The Philosophy of Theory U: A Critical Examination. Philosophy of Management.", "href": "https://doi.org/10.1007/s40926-018-0087-0", "linkLabel": "Free full text"},
  {"n": 3, "text": "Calia R; Oliveira M; Demarzo M (2018). Mindfulness and Theory U for the professional sense of purpose. RAM. Revista de Administração Mackenzie.", "href": "https://doi.org/10.1590/1678-6971/eramg180021", "linkLabel": "Free full text"},
  {"n": 4, "text": "Scharmer O (2020). Social Systems as If People Mattered Response to the Kühl Critique of Theory U. Journal of Change Management.", "href": "https://doi.org/10.1080/14697017.2020.1744884", "linkLabel": "Publisher page (may need payment)"},
  {"n": 5, "text": "Presencing Institute (2026). Home page. presencing.org. Read 22 November 2026.", "href": "https://www.presencing.org/", "linkLabel": "Web page"},
];

const PAGE = 'theory-u';

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
              A framework by Otto Scharmer, used here as an analogy
            </p>
          </BloomInstant>

          <BloomOnScroll>
            <Card className="p-6 md:p-8 bg-muted/30 border-border">
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>
                  <strong className="text-nenya-gold-text dark:text-nenya-gold-light">Theory U</strong> is a framework for change made by Otto Scharmer, who teaches at MIT. Its main idea is <em>presencing</em>. Scharmer describes it as reaching a deeper kind of knowing and acting from there.
                </p>
                <p>
                  Here we use a simple version of the U with three parts: <strong>sensing</strong>, <strong>presencing</strong>, and <strong>realizing</strong>. Scharmer&rsquo;s own books go into more detail.
                </p>
                <p>
                  This page is an analogy. It is our own design, not a tested method, and not part of Scharmer&rsquo;s work. Theory U has had very little peer-reviewed testing. In a November 2026 search we found no controlled trial of it, a few small studies of one course or one person, and scholarly critiques <Cite pageId={PAGE} n={[1, 2, 3]} />. Scharmer has replied to one of these critiques and disagrees with it <Cite pageId={PAGE} n={4} />.
                </p>
              </div>
            </Card>
          </BloomOnScroll>

          <BloomOnScroll className="space-y-6">
            <h2 className="text-2xl md:text-3xl text-nenya-gold-text dark:text-nenya-gold-light">
              How Nenya fits the U (an analogy)
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
                      The lenses (color, sound, touch and the rest) invite you to look inward through different senses. In Scharmer&rsquo;s picture, this is the sensing part: noticing what is there without trying to fix it.
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
                      In our approach, you put words to the feelings and needs you notice. We use this as our version of the presencing step. We do not claim it reaches a deeper truth. It is a way to find words for what is happening.
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
                      In the realizing step you think about a small request to make or a small thing to try. Nenya does not follow up, so we cannot know whether this happens.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </BloomOnScroll>

          <BloomOnScroll>
            <Card className="p-6 md:p-8 bg-muted/30 border-border">
              <div className="space-y-4 text-foreground leading-relaxed">
                <h3 className="text-xl text-nenya-gold-text dark:text-nenya-gold-light">
                  Why we use Theory U
                </h3>
                <p>
                  Scharmer says that leaders in new situations cannot rely only on what worked before. He proposes that leaders pause, sense what is happening, and act from a deeper kind of knowing. We think this takes some emotional skill, such as naming what you feel and need. That is our view, not a research finding.
                </p>
                <p>
                  Nenya is a place to practice looking at your own feelings and needs. You can use it as often as you like, and it has no accounts. We have not tested whether it makes presencing easier to grasp.
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
                  The Presencing Institute, co-founded by Scharmer, teaches Theory U. The Institute says it has a network of over 65,000 people and that the approach is used worldwide. We could not check these figures <Cite pageId={PAGE} n={5} />.
                </p>
                <a 
                  href="https://www.presencing.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-purple-700 dark:text-purple-300 hover:underline"
                >
                  Explore Theory U at the Presencing Institute →<span className="sr-only"> (opens an outside site in a new tab)</span>
                </a>
              </div>
            </Card>
          </BloomOnScroll>

          <BloomOnScroll>
            <Card className="p-6 md:p-8 bg-muted/30 border-border">
              <ReferenceList pageId={PAGE} items={REFS} />
            </Card>
          </BloomOnScroll>

          <ReturnToTop onClick={scrollToTop} />
        </div>
      </div>
    </div>
  );
}
