import React from 'react';
import { ArrowLeft, Eye, Palette, Heart, Music, Cloud, Box, Sprout, ExternalLink, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { ReturnToTop } from '../ReturnToTop';
import { AppFooter } from '../AppFooter';
import { Cite, ReferenceList, type AboutReference } from './AboutReferences';

// The numbers in the text match this list (About thesis, chapter 2; docs/about-thesis.md).
const REFERENCES: AboutReference[] = [
  { n: 1, text: "Van Essen D (2003). Organization of Visual Areas in Macaque and Human Cerebral Cortex. The Visual Neurosciences, 2-vol. set.", href: "https://www.cns.nyu.edu/csh/csh04/Articles/Vanessen-03.pdf", linkLabel: "Free copy (author, university or repository page)" },
  { n: 2, text: "Van Essen D, Lewis J, Drury H, Hadjikhani N, Tootell R, Bakircioglu M et al. (2001). Mapping visual cortex in monkeys and humans using surface-based atlases. Vision Research.", href: "https://www.nmr.mgh.harvard.edu/nouchinelab/pdfs/VanEssen&alVisionResearch2001.pdf", linkLabel: "Free copy (author, university or repository page)" },
  { n: 3, text: "Felleman D, Van Essen D (1991). Distributed Hierarchical Processing in the Primate Cerebral Cortex. Cerebral Cortex.", href: "https://chd.ucsd.edu/_files/fall2008/Felleman.1991.CC_Part1.pdf", linkLabel: "Free copy (author, university or repository page)" },
  { n: 4, text: "Jacobs G (2009). Evolution of colour vision in mammals. Philosophical Transactions of the Royal Society B: Biological Sciences.", href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2781854/", linkLabel: "Free full text" },
  { n: 5, text: "Regan B, Julliot C, Simmen B, Viénot F, Charles–Dominique P, Mollon J et al. (2001). Fruits, foliage and the evolution of primate colour vision. Philosophical Transactions of the Royal Society of London. Series B: Biological Sciences.", href: "https://europepmc.org/pmc/articles/PMC1088428", linkLabel: "Free full text" },
  { n: 6, text: "Sumner P, Mollon J (2000). Catarrhine Photopigments are Optimized for Detecting Targets Against a Foliage Background. Journal of Experimental Biology.", href: "https://doi.org/10.1242/jeb.203.13.1963", linkLabel: "Publisher page (may need payment)" },
  { n: 7, text: "Lucas P, Dominy N, Riba-Hernandez P, Stoner K, Yamashita N, Calderön E et al. (2003). Evolution and function of routine trichromatic vision in primates. Evolution.", href: "https://doi.org/10.1111/j.0014-3820.2003.tb01506.x", linkLabel: "Publisher page (may need payment)" },
  { n: 8, text: "Changizi M, Zhang Q, Shimojo S (2006). Bare skin, blood and the evolution of primate colour vision. Biology Letters.", href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC1618887/", linkLabel: "Free full text" },
  { n: 9, text: "Jonauskaite D, Abu-Akel A, Dael N, Oberfeld D, Abdel-Khalek A, Al-Rasheed A et al. (2020). Universal Patterns in Color-Emotion Associations Are Further Shaped by Linguistic and Geographic Proximity. Psychological Science.", href: "http://intellectum.unisabana.edu.co/bitstreams/bb7fa6db-a6b6-4254-bb5a-f7525047dfaf/download", linkLabel: "Free copy (author, university or repository page)" },
  { n: 10, text: "Palmer S, Schloss K (2010). An ecological valence theory of human color preference. Proceedings of the National Academy of Sciences.", href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2889342/", linkLabel: "Free full text" },
  { n: 11, text: "Öhman A, Flykt A, Esteves F (2001). Emotion drives attention: Detecting the snake in the grass. Journal of Experimental Psychology: General.", href: "https://doi.org/10.1037/0096-3445.130.3.466", linkLabel: "Publisher page (may need payment)" },
  { n: 12, text: "Oosterhof N, Todorov A (2008). The functional basis of face evaluation. Proceedings of the National Academy of Sciences.", href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2516255/", linkLabel: "Free full text" },
  { n: 13, text: "Todorov A, Said C, Engell A, Oosterhof N (2008). Understanding evaluation of faces on social dimensions. Trends in Cognitive Sciences.", href: "https://doi.org/10.1016/j.tics.2008.10.001", linkLabel: "Publisher page (may need payment)" },
  { n: 14, text: "Elliot A (2015). Color and psychological functioning: a review of theoretical and empirical work. Frontiers in Psychology.", href: "https://www.frontiersin.org/articles/10.3389/fpsyg.2015.00368/pdf", linkLabel: "Free full text" },
  { n: 15, text: "Elliot A, Maier M (2014). Color Psychology: Effects of Perceiving Color on Psychological Functioning in Humans. Annual Review of Psychology.", href: "https://doi.org/10.1146/annurev-psych-010213-115035", linkLabel: "Publisher page (may need payment)" },
  { n: 16, text: "Valdez P, Mehrabian A (1994). Effects of color on emotions. Journal of Experimental Psychology: General.", href: "https://doi.org/10.1037/0096-3445.123.4.394", linkLabel: "Publisher page (may need payment)" },
  { n: 17, text: "Lieberman M, Eisenberger N, Crockett M, Tom S, Pfeifer J, Way B et al. (2007). Putting Feelings Into Words. Psychological Science.", href: "https://doi.org/10.1111/j.1467-9280.2007.01916.x", linkLabel: "Publisher page (may need payment)" },
  { n: 18, text: "Torre J, Lieberman M (2018). Putting Feelings Into Words: Affect Labeling as Implicit Emotion Regulation. Emotion Review.", href: "https://doi.org/10.1177/1754073917742706", linkLabel: "Publisher page (may need payment)" },
  { n: 19, text: "Creswell J, Way B, Eisenberger N, Lieberman M (2007). Neural Correlates of Dispositional Mindfulness During Affect Labeling. Psychosomatic Medicine.", href: "https://doi.org/10.1184/r1/6617267", linkLabel: "Free full text" },
  { n: 20, text: "Birch J (2012). Worldwide prevalence of red-green color deficiency. Journal of the Optical Society of America A.", href: "https://doi.org/10.1364/josaa.29.000313", linkLabel: "Publisher page (may need payment)" },
  { n: 21, text: "US National Eye Institute. Color blindness (page updated November 5, 2025; read 2026-11-22).", href: "https://www.nei.nih.gov/learn-about-eye-health/eye-conditions-and-diseases/color-blindness", linkLabel: "Free full text" },
  { n: 22, text: "Saysani A, Corballis M, Corballis P (2018). Colour envisioned: concepts of colour in the blind and sighted. Visual Cognition.", href: "https://doi.org/10.1080/13506285.2018.1465148", linkLabel: "Publisher page (may need payment)" },
  { n: 23, text: "Shepard R, Cooper L (1992). Representation of Colors in the Blind, Color-Blind, and Normally Sighted. Psychological Science.", href: "https://doi.org/10.1111/j.1467-9280.1992.tb00006.x", linkLabel: "Publisher page (may need payment)" },
];

const C = ({ n }: { n: number[] }) => <Cite pageId="color" n={n} />;

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
        <h1>Color and Feeling</h1>
      </div>

      {/* Content */}
      <div className="w-full">
        <div className="mx-auto max-w-4xl px-6 py-12 space-y-12">
          
          {/* Section 1: The Evolutionary Primacy of Vision */}
          <section className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl bg-gradient-to-r from-nenya-accent-secondary via-nenya-accent-primary to-nenya-accent-warm bg-clip-text text-transparent">
                Why Nenya starts with color
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                More of the human cortex, the brain&rsquo;s outer layer, is used for vision than for any other sense <C n={[1, 2, 3]} />. Most mammals have two kinds of color-sensing cells in the eye. Humans, apes and Old World monkeys have three. This is called <strong>trichromatic vision</strong> <C n={[4, 5, 6]} />. Why primates evolved three cone types is still debated. Leading ideas are finding ripe fruit, finding young leaves, and reading skin color <C n={[5, 7, 8, 6]} />. In a study of 4,598 people in 30 countries, color and feeling links were much alike, with local differences <C n={[9]} />. Personal experience also shapes which colors people like <C n={[10]} />.
              </p>
            </div>

            <Card className="p-8 bg-gradient-to-br from-background-secondary to-background border-nenya-accent-primary/30">
              <div className="flex items-start gap-6">
                <div className="size-16 rounded-full bg-nenya-accent-primary/10 flex items-center justify-center flex-shrink-0">
                  <Eye className="size-8 text-nenya-gold-text dark:text-nenya-accent-warm" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-foreground">How much of the brain is used for seeing</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Estimates put the share of the human cortex used mainly for vision at about a quarter to a third. One brain-map study gave 27%, and under 10% each for hearing, touch and movement <C n={[1, 2]} />. In one lab study, people found pictures of snakes and spiders faster than pictures of flowers or mushrooms <C n={[11]} />. People quickly judge faces for trust and dominance, though these judgments are often not accurate <C n={[12, 13]} />.
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
                People link colors with feelings in similar ways across countries <C n={[9]} />. Studies of whether seeing a color changes mood or attention are fewer, and the field is still young <C n={[14, 15]} />. In one study, how bright or vivid a color was changed how pleasant or exciting people rated it <C n={[16]} />. Nenya does not use these findings to interpret your choices. It offers color as a language that does not need words. When you select a color to represent a feeling, you are saying something about it in a way that does not have to be explained. The Present and Potential colors, and the ideas on this page, are our own design. They are not a tested measure.
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
                    Your two chosen colors—your <strong>Present</strong> and your <strong>Potential</strong>—are a non-verbal poem you write for yourself. They allow you to show how you feel before you are asked to explain it. It is a way of noticing yourself before you put it into words. Putting a feeling into words may also help. In lab studies, naming a feeling lowered the brain&rsquo;s alarm response a little <C n={[17, 18, 19]} />.
                  </p>
                  <p className="text-sm text-violet-800/80 dark:text-violet-200/80 leading-relaxed">
                    Your colors can be written as hex codes, short codes that name an exact color. They are not an account or an identifier: nothing here is linked to you. The tool offers more than 281 trillion possible pairs of colors, so there is room for whatever you feel.
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
                    To read the research, start with two free papers: Elliot (2015) is a review of color and psychology, and Jonauskaite and colleagues (2020) compare color and feeling links across 30 countries <C n={[14, 9]} />.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 border-indigo-300 dark:border-indigo-700"
                      asChild
                    >
                      <a href="https://www.frontiersin.org/articles/10.3389/fpsyg.2015.00368/pdf" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="size-4" aria-hidden="true" />
                        Elliot (2015): Color and psychological functioning<span className="sr-only"> (free full text, opens in a new tab)</span>
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 border-indigo-300 dark:border-indigo-700"
                      asChild
                    >
                      <a href="https://intellectum.unisabana.edu.co/bitstreams/bb7fa6db-a6b6-4254-bb5a-f7525047dfaf/download" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="size-4" aria-hidden="true" />
                        Jonauskaite and others (2020): Color-emotion links in 30 countries<span className="sr-only"> (free full text, opens in a new tab)</span>
                      </a>
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </section>

          {/* Section 3: Accessibility, Diversity, and Universal Metaphor */}
          <section className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                Beyond Vision: Other Ways to Say It
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We want this tool to be open to as many people as we can reach. Color is not equally open to everyone. In European populations about 8 in 100 men and 4 in 1,000 women have red-green color vision deficiency <C n={[20, 21]} />. Color meanings also differ by culture <C n={[9]} />. People who are blind can know and name colors <C n={[22, 23]} />, but choosing one on screen may need another way in. We believe the useful part is finding your own way to say how you feel. Color is one way to do that. We encourage all users to find the expressive system that works for them.
              </p>
            </div>

            <Card className="p-8 bg-muted/30 border-border">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Heart className="size-6 text-muted-foreground" />
                  <h3 className="text-foreground">Alternative Metaphors for Self-Expression</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  If color does not work for you, you can try one of these other ways to describe a feeling:
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
                <strong>Nenya is a mirror, not an oracle.</strong> It does not tell you what your feelings mean. Use the language, such as color, texture or weather, that shows your feelings most clearly.
              </p>
            </Card>

            {/* Foundational Promise */}
            <Card className="p-6 bg-muted/50 border-border">
              <p className="text-sm text-muted-foreground italic text-center leading-relaxed">
                Our promise is to treat your experience as complex, and not to squeeze it into a single label.
              </p>
            </Card>
          </section>

          <ReferenceList pageId="color" items={REFERENCES} />

          <ReturnToTop onClick={scrollToTop} />
        </div>
      </div>

      <AppFooter />
    </div>
  );
}
