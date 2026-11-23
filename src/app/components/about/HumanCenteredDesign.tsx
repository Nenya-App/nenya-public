import { ArrowLeft, Users, Heart } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useIsMobile } from '../useIsMobile';
import { BloomInstant, BloomOnScroll } from '../BloomOnScroll';
import { ReturnToTop } from '../ReturnToTop';
import React from 'react';
import { Cite, ReferenceList, type AboutReference } from './AboutReferences';

const REFS: AboutReference[] = [
  {"n": 1, "text": "Gould J; Lewis C (1985). Designing for usability: key principles and what designers think. Communications of the ACM.", "href": "https://doi.org/10.1145/3166.3170", "linkLabel": "Free full text"},
  {"n": 2, "text": "Bano M; Zowghi D (2015). A systematic review on the relationship between user involvement and system success. Information and Software Technology.", "href": "https://doi.org/10.1016/j.infsof.2014.06.011", "linkLabel": "Free full text"},
  {"n": 3, "text": "Kujala S (2003). User involvement: A review of the benefits and challenges. Behaviour & Information Technology.", "href": "https://doi.org/10.1080/01449290301782", "linkLabel": "Publisher page (may need payment)"},
  {"n": 4, "text": "International Organization for Standardization (2019). ISO 9241-210:2019 Ergonomics of human-system interaction, Part 210: Human-centred design for interactive systems. ISO. Read 22 November 2026.", "href": "https://www.iso.org/standard/77520.html", "linkLabel": "Web page"},
  {"n": 5, "text": "Aron E; Aron A (1997). Sensory-processing sensitivity and its relation to introversion and emotionality. Journal of Personality and Social Psychology.", "href": "https://doi.org/10.1037/0022-3514.73.2.345", "linkLabel": "Publisher page (may need payment)"},
  {"n": 6, "text": "Acevedo B; Aron E; Aron A; Sangster M; Collins N; Brown L; et al. (2014). The highly sensitive brain: an fMRI study of sensory processing sensitivity and response to others' emotions. Brain and Behavior.", "href": "https://doi.org/10.1002/brb3.242", "linkLabel": "Free full text"},
  {"n": 7, "text": "Jonauskaite D; Abu-Akel A; Dael N; Oberfeld D; Abdel-Khalek A; Al-Rasheed A; et al. (2020). Universal Patterns in Color-Emotion Associations Are Further Shaped by Linguistic and Geographic Proximity. Psychological Science.", "href": "https://doi.org/10.1177/0956797620948810", "linkLabel": "Free full text"},
  {"n": 8, "text": "Birch J (2012). Worldwide prevalence of red-green color deficiency. Journal of the Optical Society of America A.", "href": "https://doi.org/10.1364/josaa.29.000313", "linkLabel": "Publisher page (may need payment)"},
  {"n": 9, "text": "Carroll J; Carrithers C (1984). Training wheels in a user interface. Communications of the ACM.", "href": "https://doi.org/10.1145/358198.358218", "linkLabel": "Free full text"},
  {"n": 10, "text": "McGrenere J; Baecker R; Booth K (2002). An evaluation of a multiple interface design solution for bloated software. Proceedings of the SIGCHI Conference on Human Factors in Computing Systems.", "href": "https://doi.org/10.1145/503376.503406", "linkLabel": "Publisher page (may need payment)"},
  {"n": 11, "text": "Nielsen, J., Nielsen Norman Group (2006). Progressive Disclosure. nngroup.com. Read 22 November 2026.", "href": "https://www.nngroup.com/articles/progressive-disclosure/", "linkLabel": "Web page"},
  {"n": 12, "text": "Newton P (2015). The Learning Styles Myth is Thriving in Higher Education. Frontiers in Psychology.", "href": "https://doi.org/10.3389/fpsyg.2015.01908", "linkLabel": "Free full text"},
  {"n": 13, "text": "Rogowsky B; Calhoun B; Tallal P (2015). Matching learning style to instructional method: Effects on comprehension. Journal of Educational Psychology.", "href": "https://doi.org/10.1037/a0037478", "linkLabel": "Free full text"},
  {"n": 14, "text": "Kirschner P (2017). Stop propagating the learning styles myth. Computers & Education.", "href": "https://doi.org/10.1016/j.compedu.2016.12.006", "linkLabel": "Free full text"},
  {"n": 15, "text": "Cavoukian A (2010). Privacy by design: the definitive workshop. A foreword by Ann Cavoukian, Ph.D. Identity in the Information Society.", "href": "https://doi.org/10.1007/s12394-010-0062-y", "linkLabel": "Free full text"},
  {"n": 16, "text": "Spiekermann S; Cranor L (2009). Engineering Privacy. IEEE Transactions on Software Engineering.", "href": "https://doi.org/10.1109/tse.2008.88", "linkLabel": "Publisher page (may need payment)"},
  {"n": 17, "text": "European Union (2016). Regulation (EU) 2016/679 (GDPR), Article 25: Data protection by design and by default. EUR-Lex; text read on the gdpr-info.eu mirror. Read 22 November 2026.", "href": "https://gdpr-info.eu/art-25-gdpr/", "linkLabel": "Web page"},
  {"n": 18, "text": "Koops B; Leenes R (2013). Privacy regulation cannot be hardcoded. A critical comment on the ‘privacy by design’ provision in data-protection law. International Review of Law, Computers & Technology.", "href": "https://doi.org/10.1080/13600869.2013.801589", "linkLabel": "Free full text"},
  {"n": 19, "text": "Norman, D. A., & Draper, S. W. (Eds.) (1986). User Centered System Design: New Perspectives on Human-Computer Interaction. Lawrence Erlbaum (Taylor & Francis edition DOI 10.1201/b15703).", "href": "https://doi.org/10.1201/b15703", "linkLabel": "Publisher page (may need payment)"},
  {"n": 20, "text": "Johansson‐Sköldberg U; Woodilla J; Çetinkaya M (2013). Design Thinking: Past, Present and Possible Futures. Creativity and Innovation Management.", "href": "https://doi.org/10.1111/caim.12023", "linkLabel": "Publisher page (may need payment)"},
];

const PAGE = 'human-centered-design';

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
              Designing with the people who will use a thing
            </p>
          </BloomInstant>

          <BloomOnScroll>
            <Card className="p-6 md:p-8 bg-muted/30 border-border">
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>
                  <strong className="text-nenya-gold-text dark:text-nenya-gold-light">Human-Centered Design (HCD)</strong> means involving the people who will use something from the start, testing with them, and changing the design as you learn <Cite pageId={PAGE} n={[1, 2, 3, 4]} />. Studies find that this usually, but not always, helps <Cite pageId={PAGE} n={2} />. We used some ideas from HCD, such as giving several ways in. We have done no user testing, and no study of Nenya has been done. HCD asks for that testing, so Nenya is not human-centered design in the full sense.
                </p>
                <p>
                  We did not want to give one &ldquo;right way&rdquo; to begin reflecting. People differ in how strongly they notice sights, sounds, touch, and movement, and in what colours mean to them <Cite pageId={PAGE} n={[5, 6, 7]} />. So we offer several ways in.
                </p>
              </div>
            </Card>
          </BloomOnScroll>

          <BloomOnScroll className="space-y-6">
            <h2 className="text-2xl md:text-3xl text-nenya-gold-text dark:text-nenya-gold-light">
              HCD in Nenya's Design
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-6 bg-muted/20">
                <h3 className="text-lg text-foreground mb-3 flex items-center gap-2">
                  <Heart className="size-5 text-pink-600 dark:text-pink-400" />
                  Start with people
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We designed the Six Lenses because we expected that colour would not work for everyone. This came from the owner&rsquo;s own use and from comments, not from a formal study. Colour does not work the same way for everyone. About 1 in 12 men of European ancestry has red-green colour deficiency. Links between colour and feeling also vary between people and places <Cite pageId={PAGE} n={[8, 7, 5]} />.
                </p>
              </Card>

              <Card className="p-6 bg-muted/20">
                <h3 className="text-lg text-foreground mb-3">
                  Progressive Disclosure
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The tools start simple, and the longer explanations are one step away. This idea is called progressive disclosure. In a few studies of software, simpler starting layers helped new users learn <Cite pageId={PAGE} n={[9, 10, 11]} />. We have not tested it on Nenya.
                </p>
              </Card>

              <Card className="p-6 bg-muted/20">
                <h3 className="text-lg text-foreground mb-3">
                  Accessibility
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Having several lenses gives more than one way in. We are not claiming that people have fixed &ldquo;styles&rdquo; that a lens can match: research does not support that idea <Cite pageId={PAGE} n={[12, 13, 14]} />. We also have not tested the lenses with disabled users, so we cannot say they make Nenya accessible.
                </p>
              </Card>

              <Card className="p-6 bg-muted/20">
                <h3 className="text-lg text-foreground mb-3">
                  Privacy by Design
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We treat safety as a human need, and we try to collect as little as we can. This follows the idea of privacy by design: build privacy in from the start, not later <Cite pageId={PAGE} n={[15, 16, 17]} />. It does not guarantee privacy, and some scholars doubt that code alone can do this <Cite pageId={PAGE} n={18} />. The Terms list what Nenya keeps.
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
                  The ideas behind human-centered design go back at least to 1985. That year John Gould and Clayton Lewis argued for three steps: focus on users early, measure real use, and redesign again and again <Cite pageId={PAGE} n={1} />. A 1986 book edited by Donald Norman and Stephen Draper helped spread the approach <Cite pageId={PAGE} n={19} />. Later, IDEO and Stanford&rsquo;s d.school made a related idea, called design thinking, popular. Scholars say it means different things to different people <Cite pageId={PAGE} n={20} />. It stresses building and testing early versions with users, and learning what people need instead of guessing <Cite pageId={PAGE} n={[1, 2, 4]} />.
                </p>
                <a 
                  href="https://www.interaction-design.org/literature/topics/human-centered-design"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-blue-700 dark:text-blue-300 hover:underline"
                >
                  Explore Human-Centered Design at Interaction Design Foundation →<span className="sr-only"> (opens an outside site in a new tab)</span>
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
