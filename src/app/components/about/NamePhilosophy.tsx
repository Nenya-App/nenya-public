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

            <section aria-labelledby="name-stones" className="space-y-3">
              <h2 id="name-stones" className="text-xl md:text-2xl text-foreground">The stones</h2>
              <p className="text-base md:text-lg leading-relaxed text-foreground">
                The palantíri were seeing-stones. Someone holding one could look across great distances, or speak with someone holding another. In some tellings they come from the craft of Fëanor, the greatest maker of the Noldor.
              </p>
              <p className="text-base md:text-lg leading-relaxed text-foreground">
                What a stone showed was real, but a stronger will could choose what a weaker one saw. In the story, one stone fell into the hands of a power that used it to bend the minds of those who looked. A window that anyone strong enough can look through is not a neutral thing.
              </p>
            </section>

            <section aria-labelledby="name-craft" className="space-y-3">
              <h2 id="name-craft" className="text-xl md:text-2xl text-foreground">One craft, two ways of holding it</h2>
              <p className="text-base md:text-lg leading-relaxed text-foreground">
                It would be easy to tell this as a good maker and a bad one, and the story does not allow it. The ring and the stones come out of the same line of craft: Celebrimbor was Fëanor&rsquo;s grandson. And what moved Fëanor is not strange to any of us. He made the Silmarils to hold the light of the Two Trees. When the Trees were killed, he would not give the light up, even to heal them. Galadriel knew the same fear. Lothlórien was an effort to keep something beautiful from the wearing of the years.
              </p>
              <p className="text-base md:text-lg leading-relaxed text-foreground">
                The difference lies in what each did with the wish to keep. Fëanor closed his hand, and swore an oath over what he held; it cost many lives. Galadriel was offered the one thing that would have let her keep everything, and she refused it. She chose to grow smaller, to go west, and to remain herself. When her time of keeping ended, the place she had tended faded.
              </p>
              <p className="text-base md:text-lg leading-relaxed text-foreground">
                Neither of them was only one thing. Galadriel was tempted, and Fëanor was grieving. We take from the story no verdict on two people. We take a question that anyone who makes something has to answer.
              </p>
            </section>

            <section aria-labelledby="name-question" className="space-y-3 rounded-xl border border-nenya-gold/20 bg-white/40 p-6 md:p-8 dark:bg-white/5">
              <h2 id="name-question" className="text-xl md:text-2xl text-foreground">Attending or mastering</h2>
              <p className="text-base md:text-lg leading-relaxed text-foreground">
                Does what you have made work <strong className="text-nenya-gold-text dark:text-nenya-gold-light">on</strong> the person using it, or <strong className="text-nenya-gold-text dark:text-nenya-gold-light">alongside</strong> them? Some tools are built to bring people back and keep them sharing <Cite pageId="name" n={[1, 2, 3]} />. We call those tools that master. A tool that attends can be put down. Nothing in it needs the person to stay for it to have been worth making.
              </p>
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
