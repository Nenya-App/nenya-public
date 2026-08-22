import React from 'react';
import { ArrowLeft, Eye, Heart, Crown } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import NenyaLogo from '../NenyaLogo';
import { useIsMobile } from '../useIsMobile';
import { BloomInstant, BloomOnScroll } from '../BloomOnScroll';
import { ReturnToTop } from '../ReturnToTop';
import { ScrollHint } from '../ScrollHint';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import comparisonImage from 'figma:asset/8b1166a7ff9c50323c4170d2aef3f1791b4907f9.png';
import { AppFooter } from '../AppFooter';

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
              <NenyaLogo size={isMobile ? 70 : 120} />
            </div>
            
            <h1 className="text-2xl md:text-4xl lg:text-5xl bg-gradient-to-r from-foreground via-nenya-gold to-foreground bg-clip-text text-transparent px-4">
              Two Creators. Two Philosophies.
            </h1>
            <p className="text-sm md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
              Why we named ourselves after Galadriel's ring—and what it means to be an "Anti-Palantír"
            </p>
          </BloomInstant>

          {/* The Origin Story */}
          <BloomOnScroll className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 px-2">
              <div className="p-2 md:p-3 bg-nenya-gold/20 rounded-lg">
                <Crown className="size-5 md:size-6 text-nenya-gold-dark dark:text-nenya-gold" />
              </div>
              <h2 className="text-xl md:text-3xl text-nenya-gold-dark dark:text-nenya-gold-light">The Tale of Two Makers</h2>
            </div>

            <Card className="p-4 md:p-8 bg-muted/50 backdrop-blur-sm border-border">
              <div className="space-y-3 md:space-y-6 text-foreground leading-relaxed text-sm md:text-base">
                <p>
                  In Tolkien's legendarium, two of the most brilliant Elves ever to walk Middle-earth created objects of immense power. But their creations reflected fundamentally different philosophies about what technology should <em>do</em>.
                </p>
                
                <p>
                  The contrast between these two approaches isn't just mythological—it's the <strong className="text-nenya-gold-dark dark:text-nenya-gold-light">defining choice of our technological age</strong>. Every platform, every tool, every system embodies one of these two philosophies, whether its creators realize it or not.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 py-4 md:py-6">
                  {/* Fëanor */}
                  <div className="space-y-3 md:space-y-4 p-4 md:p-6 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-500/20">
                    <div className="flex items-center gap-3 pb-3 border-b border-red-200 dark:border-red-500/30">
                      <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-lg">
                        <Eye className="size-4 md:size-5 text-red-600 dark:text-red-400" />
                      </div>
                      <h3 className="text-lg md:text-xl text-red-700 dark:text-red-400">Fëanor</h3>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      <strong className="text-foreground">The Technologist of Domination</strong>
                    </p>
                    <p className="text-xs md:text-sm">
                      Fëanor was the greatest craftsman of his age. He created the <strong>Palantíri</strong>—seeing-stones that allowed communication across vast distances and surveillance of distant lands.
                    </p>
                    <p className="text-xs md:text-sm">
                      His genius was unmatched, but so was his pride. He believed his creations were <em>his</em>—to control, to possess, to hoard. The Silmarils, his masterwork, became objects of such obsession that he swore an oath that led to the deaths of thousands.
                    </p>
                    <p className="text-xs md:text-sm">
                      The Palantíri embodied this same philosophy: <strong className="text-red-700 dark:text-red-400">see everything, control everything, trust no one</strong>. They were tools of absolute information dominance—and they could be corrupted, hijacked, weaponized by anyone powerful enough to claim them.
                    </p>
                    <p className="text-xs md:text-sm text-red-700 dark:text-red-400 italic border-t border-red-200 dark:border-red-500/30 pt-3">
                      "His heart burned with fire, and he desired to see and know all things—and to hold them forever."
                    </p>
                  </div>

                  {/* Galadriel */}
                  <div className="space-y-3 md:space-y-4 p-4 md:p-6 rounded-lg bg-amber-50 dark:bg-nenya-gold/5 border border-nenya-gold/40 dark:border-nenya-gold/20">
                    <div className="flex items-center gap-3 pb-3 border-b border-nenya-gold/40 dark:border-nenya-gold/30">
                      <div className="p-2 bg-nenya-gold/30 dark:bg-nenya-gold/20 rounded-lg">
                        <Heart className="size-4 md:size-5 text-nenya-gold-dark dark:text-nenya-gold" />
                      </div>
                      <h3 className="text-lg md:text-xl text-nenya-gold-dark dark:text-nenya-gold">Galadriel</h3>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      <strong className="text-foreground">The Guardian of Preservation</strong>
                    </p>
                    <p className="text-xs md:text-sm">
                      Galadriel wielded <strong>Nenya</strong>, the Ring of Water, the Ring of Adamant—one of the three Elven rings that was never touched by Sauron's corrupting influence.
                    </p>
                    <p className="text-xs md:text-sm">
                      She was no less powerful than Fëanor, no less ancient or wise. But her power was used differently: not to possess, but to <em>cultivate</em>. Not to control, but to <em>protect</em>. With Nenya, she created Lothlórien—a living sanctuary.
                    </p>
                    <p className="text-xs md:text-sm">
                      Her mirror didn't give absolute knowledge or control. It showed possibilities, visions, potential futures—but <strong className="text-nenya-gold-dark dark:text-nenya-gold">it required wisdom to interpret</strong>. It invited reflection, not surveillance. And when the time came to let it all go, she did. She sailed into the West.
                    </p>
                    <p className="text-xs md:text-sm text-nenya-gold-dark dark:text-nenya-gold italic border-t border-nenya-gold/40 dark:border-nenya-gold/30 pt-3">
                      "Her power was not for domination, but for preservation of beauty, for understanding of sorrow, and for the healing of wounds."
                    </p>
                  </div>
                </div>
                
                {/* Visual Comparison - Mobile optimized */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 py-4 md:py-6 border-y border-border">
                  <div className="w-full md:w-48 flex-shrink-0">
                    <ImageWithFallback 
                      src={comparisonImage} 
                      alt="Visual contrast: Nenya (organic, prismatic) vs Palantír (mechanical, all-seeing)" 
                      className="w-full rounded-lg border border-border"
                    />
                    <p className="text-xs text-muted-foreground text-center mt-2 italic">
                      Two visions of power
                    </p>
                  </div>
                  <div className="flex-1 text-xs md:text-sm text-muted-foreground leading-relaxed">
                    <p className="mb-3">
                      The visual language tells the story: Nenya (left) radiates with organic, prismatic life—warm colors, flowing forms, growth and interconnection. The Palantír (right) is cold geometry, mechanical precision, the unblinking eye that sees all.
                    </p>
                    <p>
                      One invites you into a garden. The other places you under surveillance. <strong className="text-nenya-gold-dark dark:text-nenya-gold-light">This is not a metaphor. This is architecture.</strong>
                    </p>
                  </div>
                </div>

                <div className="pt-4 md:pt-6 border-t border-border">
                  <p className="text-sm md:text-lg">
                    Both were driven by <strong className="text-nenya-gold-dark dark:text-nenya-gold-light">unmet needs</strong>—Fëanor's need for control over loss, Galadriel's need for preservation against decay. But their <strong className="text-nenya-gold-dark dark:text-nenya-gold-light">strategies</strong> diverged completely.
                  </p>
                </div>
              </div>
            </Card>
          </BloomOnScroll>

          {/* Closing reflections */}
          <div className="space-y-6 md:space-y-8 mt-6">
            <div className="bg-white/40 dark:bg-white/5 rounded-xl p-6 md:p-8 border border-nenya-gold/20">
              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-medium mb-4 text-foreground">Attending or Mastering</h3>
                <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
                  The contrast between Fëanor and Galadriel is not a contrast of power. Both were among the most gifted minds ever to walk Middle-earth. It is a contrast of <strong className="text-nenya-gold-dark dark:text-nenya-gold-light">orientation</strong>.
                </p>
                <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
                  Fëanor's tools demanded. The Palantíri transmitted sight to whoever was strong enough to dominate the stone. His creations required his permanence to have meaning — when the Silmarils were taken, nothing could release them without unmaking the total pouring that had created them.
                </p>
                <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
                  Nenya could not compel. It tended. It held Lothlórien for three thousand years, and when the time came, Galadriel released it — knowing the trees would wither and the enchantment end — because what she had built was never meant to require her continuity in order to have been <strong className="text-nenya-gold-dark dark:text-nenya-gold-light">worth building</strong>.
                </p>
                <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
                  Every technology eventually answers the same question: does it operate <strong className="text-nenya-gold-dark dark:text-nenya-gold-light">on</strong> the person using it, or <strong className="text-nenya-gold-dark dark:text-nenya-gold-light">alongside</strong> them?
                </p>
              </div>
            </div>
            <div className="bg-white/40 dark:bg-white/5 rounded-xl p-6 md:p-8 border border-nenya-gold/20">
              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-medium mb-4 text-foreground">Why Nenya Is Built This Way</h3>
                <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
                  Nothing persists between sessions. No profile accumulates. Nothing done here can be retained, packaged, or transmitted — because nothing is kept. This is not a policy that could be changed by a future team. It is the structural fact of the design.
                </p>
                <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
                  The Harp of Móru, which gives this project its foundational metaphor, was made with the ground's consent. The first question asked was not "what can I make from this?" but "may I?" The distinction is not between use and non-use. It is between <strong className="text-nenya-gold-dark dark:text-nenya-gold-light">extraction</strong> and <strong className="text-nenya-gold-dark dark:text-nenya-gold-light">invitation</strong>.
                </p>
                <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
                  The six gateways are strategies you are trying on — in NVC terms, the specific actions we take in service of what we need. They exist for the duration of a session. They belong entirely to you.
                </p>
                <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
                  That is the architecture. Not a feature. The foundation.
                </p>
              </div>
            </div>
          </div>

          <ScrollHint />
          <ReturnToTop onClick={scrollToTop} />
        </div>
      </div>

      <AppFooter />
    </div>
  );
}
