import React from 'react';
import { COACH_SERVICE } from '../../../lib/coachService';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import PanelLogo from '../PanelLogo';
import { useIsMobile } from '../useIsMobile';
import { BloomInstant, BloomOnScroll } from '../BloomOnScroll';
import { ReturnToTop } from '../ReturnToTop';
import { ScrollHint } from '../ScrollHint';
import { AppFooter } from '../AppFooter';
import { LOGO_ALT_LONG } from '../../../lib/altText';
import { Cite, ReferenceList } from './AboutReferences';
import { NON_AFFILIATION } from '../../../lib/tolkienNotice';

interface NamePhilosophyProps {
  onBack: () => void;
}

export default function NamePhilosophy({ onBack }: NamePhilosophyProps) {
  const isMobile = useIsMobile();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div ref={scrollContainerRef} className="size-full overflow-auto scroll-container bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-foreground relative">
      {/* Simplified starfield background */}
      {!isMobile && (
        <div 
          className="fixed inset-0 opacity-5 dark:opacity-20 will-change-transform pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(2px 2px at 20% 30%, currentColor, transparent),
              radial-gradient(1px 1px at 60% 70%, currentColor, transparent),
              radial-gradient(1px 1px at 80% 10%, currentColor, transparent)`,
            backgroundSize: '200% 200%',
            backgroundPosition: '0% 0%'
          }}
        />
      )}

      <div className="border-b border-border bg-background/95 backdrop-blur-sm px-4 md:px-6 py-3 md:py-4 sticky top-0 z-10">
        <Button variant="ghost" onClick={onBack} className="gap-2" size={isMobile ? "sm" : "default"}>
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">Back to About</span>
          <span className="sm:inline md:hidden">Back</span>
        </Button>
      </div>

      <div className="w-full">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-16 space-y-8 md:space-y-16">
          {/* Header */}
          <BloomInstant className="text-center space-y-3 md:space-y-6">
            <div className="flex justify-center mb-3 md:mb-6">
              <PanelLogo size={isMobile ? 70 : 120} alt={LOGO_ALT_LONG} />
            </div>
            
            <h1 className="text-2xl md:text-4xl lg:text-5xl bg-gradient-to-r from-foreground via-nenya-gold to-foreground bg-clip-text text-transparent px-4">
              Where the name comes from
            </h1>
            <p className="text-sm md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
              A ring from Tolkien&rsquo;s Middle-earth, and what we took from it. We borrow the name with respect, and try not to ask more of it than it can carry.
            </p>
          </BloomInstant>

          {/* The name: three short readings, then the question. No heroes and villains: the same craft, two ways of holding what it makes. */}
          <BloomOnScroll className="mx-auto max-w-3xl space-y-8 md:space-y-10">
            <section aria-labelledby="name-ring" className="space-y-3">
              <h2 id="name-ring" className="text-xl md:text-2xl text-foreground">The ring</h2>
              <p className="text-base md:text-lg leading-relaxed text-foreground">
                Nenya is one of the Three Rings of the Elves, worn by Galadriel in Lothlórien. It is called the Ring of Adamant, and sometimes the Ring of Water. Its power was a quiet one. It could not command anyone. It slowed the wearing-away of time, so that a place could stay as it was.
              </p>
              <p className="text-base md:text-lg leading-relaxed text-foreground">
                The Three were made by Celebrimbor, a smith of the Noldor, and Sauron never held them. That did not set them apart from their age: they were made in his shadow, and what they kept could not outlast the age they belonged to.
              </p>
            </section>

            <section aria-labelledby="name-argument" className="space-y-3">
              <h2 id="name-argument" className="text-xl md:text-2xl text-foreground">Why the difference matters</h2>
              <p className="text-base md:text-lg leading-relaxed text-foreground">
                Does what you make work <strong className="text-nenya-gold-text dark:text-nenya-gold-light">on</strong> the person using it, or <strong className="text-nenya-gold-text dark:text-nenya-gold-light">alongside</strong> them? We believe this is the question that matters most about any tool, and that it is more than a matter of taste.
              </p>
              <p className="text-base md:text-lg leading-relaxed text-foreground">
                Some tools are built to watch. Some are built to bring people back and keep them sharing <Cite pageId="name" n={[1, 2, 3]} />. We call these tools that master. A tool that attends can be put down. Research on online surveillance finds that when people believe they are watched, many say, search for and read less of what feels risky <Cite pageId="name" n={[4, 5, 6, 7]} />. The evidence is mixed: in one study of homes, people got used to being watched, though they still opposed it <Cite pageId="name" n={[8]} />. In one classic experiment, children who were filmed while they played later showed less interest in the activity <Cite pageId="name" n={[9]} />.
              </p>
              <p className="text-base md:text-lg leading-relaxed text-foreground">
                The business side is documented too. Most of the health apps checked in two studies sent users&rsquo; data to other companies <Cite pageId="name" n={[10, 11]} />, and a US regulator accused an online counselling service of sharing sensitive data with advertisers <Cite pageId="name" n={[12]} />.
              </p>
              <p className="text-base md:text-lg leading-relaxed text-foreground">
                No study has tested a reflection tool, and studies of technology and well-being find small or mixed effects <Cite pageId="name" n={[13, 14, 15]} />. So what follows is our position, not a finding. We believe a tool for reflection should keep as little as it can, say what it keeps, and publish its code. We try to build Nenya that way. Our Privacy Promise page lists where it does not yet.
              </p>
            </section>

            <section aria-labelledby="name-question" className="space-y-3 rounded-xl border border-nenya-gold/20 bg-white/40 p-6 md:p-8 dark:bg-white/5">
              <h2 id="name-question" className="text-xl md:text-2xl text-foreground">Attending or mastering</h2>
              <p className="text-base md:text-lg leading-relaxed text-foreground">
                People who mean well build both kinds. The difference shows in what the tool is built to keep. Nenya is meant to sit alongside, and the next section says what that means in practice.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                The ring names (Nenya, Vilya, Narya) are Tolkien&rsquo;s. We use them as this project&rsquo;s shorthand, as inspiration. {NON_AFFILIATION}
              </p>
            </section>
          </BloomOnScroll>

          {/* How that shows up in the design */}
          <div className="space-y-6 md:space-y-8 mt-6">
            <div className="bg-white/40 dark:bg-white/5 rounded-xl p-6 md:p-8 border border-nenya-gold/20">
              <div className="space-y-4">
                <h2 className="text-xl md:text-2xl font-medium mb-4 text-foreground">Why Nenya Is Built This Way</h2>
                <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
                  Almost nothing stays between visits. No profile builds up. What you do in the reflection tools stays on your device, apart from a few optional steps. Our Privacy Promise page lists them.
                </p>
                <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
                  The coach demo is the main exception. What you type passes through our server to an outside AI service ({COACH_SERVICE.name}). Nenya does not store it.
                </p>
                <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
                  Our aim is a design where even that could not be kept or sold. Then privacy would be a fact about how Nenya is built, not only a promise. A future team could still change the code, but the code is public, so a change would be visible. The core tool works that way today; the coach demo does not yet.
                </p>
                <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
                  One image behind this project is our own, not Tolkien&rsquo;s: something made with the ground&rsquo;s consent. The first question asked was not "what can I make from this?" but "may I?" The distinction is not between use and non-use. It is between <strong className="text-nenya-gold-text dark:text-nenya-gold-light">extraction</strong> and <strong className="text-nenya-gold-text dark:text-nenya-gold-light">invitation</strong>.
                </p>
                <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
                  The six lenses are our own design, not a tested instrument. They are strategies you try on. In Nonviolent Communication (NVC), a strategy is a specific action we take for the sake of a need. They exist while the page is open, unless you choose &ldquo;Save and return later&rdquo;. They belong to you.
                </p>
                <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
                  That is the architecture. Not a feature. The foundation.
                </p>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-3xl">
            <ReferenceList
              pageId="name"
              items={[
                { n: 1, text: 'Zuboff S (2015). Big other: Surveillance Capitalism and the Prospects of an Information Civilization. Journal of Information Technology.', href: 'https://doi.org/10.1057/jit.2015.5', linkLabel: 'Free full text' },
                { n: 2, text: 'Montag C, Lachmann B, Herrlich M, Zweig K (2019). Addictive Features of Social Media/Messenger Platforms and Freemium Games against the Background of Psychological and Economic Theories. International Journal of Environmental Research and Public Health.', href: 'https://doi.org/10.3390/ijerph16142612', linkLabel: 'Free full text' },
                { n: 3, text: 'Mathur A, Acar G, Friedman M, Lucherini E, Mayer J, Chetty M et al. (2019). Dark Patterns at Scale. Proceedings of the ACM on Human-Computer Interaction.', href: 'https://doi.org/10.1145/3359183', linkLabel: 'Free full text' },
                { n: 4, text: 'Penney J (2016). Chilling Effects: Online Surveillance and Wikipedia Use. Berkeley Technology Law Journal.', href: 'https://doi.org/10.15779/z38ss13', linkLabel: 'Free full text' },
                { n: 5, text: 'Marthews A, Tucker C (2017). The Impact of Online Surveillance on Behavior. The Cambridge Handbook of Surveillance Law.', href: 'https://hdl.handle.net/1721.1/130532', linkLabel: 'Free full text' },
                { n: 6, text: 'Stoycheff E (2016). Under Surveillance. Journalism & Mass Communication Quarterly.', href: 'https://doi.org/10.1177/1077699016630255', linkLabel: 'Publisher page (may need payment)' },
                { n: 7, text: 'Penney J (2017). Internet surveillance, regulation, and chilling effects online: a comparative case study. Internet Policy Review.', href: 'https://doi.org/10.14763/2017.2.692', linkLabel: 'Free full text' },
                { n: 8, text: 'Oulasvirta A, Pihlajamaa A, Perkiö J, Ray D, Vähäkangas T, Hasu T et al. (2012). Long-term effects of ubiquitous surveillance in the home. Proceedings of the 2012 ACM Conference on Ubiquitous Computing.', href: 'https://doi.org/10.1145/2370216.2370224', linkLabel: 'Publisher page (may need payment)' },
                { n: 9, text: 'Lepper M, Greene D (1975). Turning play into work: Effects of adult surveillance and extrinsic rewards on children\'s intrinsic motivation. Journal of Personality and Social Psychology.', href: 'https://doi.org/10.1037/h0076484', linkLabel: 'Publisher page (may need payment)' },
                { n: 10, text: 'Huckvale K, Torous J, Larsen M (2019). Assessment of the Data Sharing and Privacy Practices of Smartphone Apps for Depression and Smoking Cessation. JAMA Network Open.', href: 'https://doi.org/10.1001/jamanetworkopen.2019.2542', linkLabel: 'Free full text' },
                { n: 11, text: 'Grundy Q, Chiu K, Held F, Continella A, Bero L, Holz R et al. (2019). Data sharing practices of medicines related apps and the mobile ecosystem: traffic, content, and network analysis. BMJ.', href: 'https://doi.org/10.1136/bmj.l920', linkLabel: 'Free full text' },
                { n: 12, text: 'US Federal Trade Commission (2023). FTC to Ban BetterHelp from Revealing Consumers\' Data, Including Sensitive Mental Health Information, to Facebook and Others for Targeted Advertising. Press release, 2 March 2023.', href: 'https://www.ftc.gov/news-events/news/press-releases/2023/03/ftc-ban-betterhelp-revealing-consumers-data-including-sensitive-mental-health-information-facebook', linkLabel: 'Free full text' },
                { n: 13, text: 'Orben A, Przybylski A (2019). The association between adolescent well-being and digital technology use. Nature Human Behaviour.', href: 'https://doi.org/10.1038/s41562-018-0506-1', linkLabel: 'Free full text' },
                { n: 14, text: 'Allcott H, Braghieri L, Eichmeyer S, Gentzkow M (2020). The Welfare Effects of Social Media. American Economic Review.', href: 'https://doi.org/10.1257/aer.20190658', linkLabel: 'Free full text' },
                { n: 15, text: 'Hunt M, Marx R, Lipson C, Young J (2018). No More FOMO: Limiting Social Media Decreases Loneliness and Depression. Journal of Social and Clinical Psychology.', href: 'https://doi.org/10.1521/jscp.2018.37.10.751', linkLabel: 'Publisher page (may need payment)' },
              ]}
            />
          </div>

          <ScrollHint />
          <ReturnToTop onClick={scrollToTop} />
        </div>
      </div>

      <AppFooter />
    </div>
  );
}
