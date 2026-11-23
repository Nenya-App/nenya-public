import React from 'react';
import { COACH_SERVICE } from '../../../lib/coachService';
import { ArrowLeft, Leaf, Heart, TrendingDown, Users, Cpu, Eye, Circle, ExternalLink, Gauge, BookOpen } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import PanelLogo from '../PanelLogo';
import { useIsMobile } from '../useIsMobile';
import { BloomInstant, BloomOnScroll } from '../BloomOnScroll';
import { ReturnToTop } from '../ReturnToTop';
import HumanCenteredDesign from './HumanCenteredDesign';
import TheoryU from './TheoryU';
import { AppFooter } from '../AppFooter';
import { Cite, ReferenceList } from './AboutReferences';
import { BIOSOCIAL_FURTHER_READING, BIOSOCIAL_REFERENCES } from './biosocialReferences';

// This page was rewritten on 2026-11-22 as part of the About thesis (docs/about-thesis.md): our own idea, labelled as ours, with what research
// supports and what it does not. The numbers after sentences are links to the list of references at the bottom of the page.
interface BioSocialDesignProps {
  onBack: () => void;
}

type SubSection = 'main' | 'hcd' | 'theory-u';

type FootprintId = 'today' | 'goal';

const FOOTPRINT_COLUMNS: { id: FootprintId; title: string; sub: string; tone: string; Icon: typeof Gauge }[] = [
  { id: 'today', title: 'Nenya today', sub: '(hosted prototype, capped)', tone: 'text-amber-800 dark:text-amber-300', Icon: Gauge },
  { id: 'goal', title: 'Not built yet', sub: '(a goal)', tone: 'text-green-800 dark:text-green-300', Icon: Cpu },
];

const FOOTPRINT_ROWS: { feature: string; today: React.ReactNode; goal: React.ReactNode }[] = [
  {
    feature: 'Conversation length',
    today: 'Capped at five short exchanges, then an invitation to breathe. Nothing is built to keep you talking.',
    goal: 'Short and purposeful by design. We keep only anonymous daily totals.',
  },
  {
    feature: 'Energy (per session)',
    today: (
      <>
        The core reflection tools use no AI and run in your browser. The optional coach runs on servers, not on your device, through {COACH_SERVICE.name}. A conversation is small: five short exchanges. We have not measured its footprint. Our rough estimate for five exchanges is 0.06 to 0.6 watt-hours, with wide uncertainty.
      </>
    ),
    goal: (
      <>
        Not built. A small model on your own device would keep your words on the device. That is a privacy goal, not an energy saving: it might not use less energy. In our estimate, downloading one costs as much as hundreds of server conversations. Most of a phone's carbon cost comes from making it. <Cite pageId="biosocial" n={54} />
      </>
    ),
  },
  {
    feature: 'Water',
    today: 'The coach still draws on data-center cooling through ' + COACH_SERVICE.name + ', though conversations are capped and short. Not measured.',
    goal: 'Not built. It would move the computing off data-centre cooling. A phone has its own footprint.',
  },
  {
    feature: 'Data footprint',
    today: 'What you enter stays on your device and is gone when you close the tab. There are three exceptions, all of them your choice. One is settings you choose to remember. Another is a reflection you choose to save to come back to, kept encrypted in your own browser for 24 hours. The third is a transcript, report or message you choose to send to us, which we keep for a limited time (the Terms say how long). Apart from a transcript you send, Nenya does not store your coach conversation, and it logs none of its words. Its web host keeps standard connection logs and gives us anonymous visit totals. Coach messages pass through to ' + COACH_SERVICE.name + ', whose own policies apply. So do any parts of a report you choose to bring to the coach. Nothing is shared automatically.',
    goal: 'Data stays on your device or is ephemeral by design, and minimal data ever leaves it.',
  },
];

export default function BioSocialDesign({ onBack }: BioSocialDesignProps) {
  const isMobile = useIsMobile();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [currentSubSection, setCurrentSubSection] = React.useState<SubSection>('main');

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentSubSection === 'hcd') {
    return <HumanCenteredDesign onBack={() => setCurrentSubSection('main')} />;
  }

  if (currentSubSection === 'theory-u') {
    return <TheoryU onBack={() => setCurrentSubSection('main')} />;
  }

  return (
    <div ref={scrollContainerRef} className="size-full overflow-auto scroll-container bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-foreground relative">
      {/* Simplified background for mobile */}
      {!isMobile && (
        <div 
          className="fixed inset-0 opacity-3 dark:opacity-3 will-change-transform pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 50px,
              rgba(100, 100, 100, 0.03) 50px,
              rgba(100, 100, 100, 0.03) 100px
            )`
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
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-16 space-y-8 md:space-y-16">
          {/* Header */}
          <BloomInstant className="text-center space-y-3 md:space-y-6">
            <div className="flex justify-center mb-3 md:mb-6">
              <PanelLogo size={isMobile ? 70 : 120} />
            </div>
            
            <h1 className="text-2xl md:text-4xl lg:text-5xl bg-gradient-to-r from-foreground via-nenya-gold to-foreground bg-clip-text text-transparent px-4">
              Connection, Spending and the Planet
            </h1>
            <p className="text-sm md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4 italic">
              Our idea, what research supports, and what it does not.
            </p>
          </BloomInstant>

          {/* Opening: this is our idea, nobody has reviewed it */}
          <BloomOnScroll className="space-y-4 md:space-y-6">
            <Card className="p-4 md:p-8 bg-gradient-to-br from-muted/50 via-muted/30 to-muted/50 backdrop-blur-sm border-nenya-gold/30">
              <p className="text-foreground leading-relaxed text-sm md:text-base">
                This page sets out an idea of our own. We think feeling more connected might help people buy less just to feel better, and that this might help the planet. It is our idea, not a finding. Each link has some research behind it, but the whole chain has not been tested. No scientist or clinician has reviewed this page or the idea. No study of Nenya has been done, and it has had no user testing, so its effects on people, spending or the planet have not been measured.
              </p>
            </Card>
          </BloomOnScroll>

          {/* What research says */}
          <BloomOnScroll className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 px-2">
              <div className="p-2 md:p-3 bg-red-500/20 rounded-lg">
                <Heart className="size-5 md:size-6 text-red-700 dark:text-red-300" aria-hidden="true" />
              </div>
              <h2 className="text-xl md:text-3xl text-nenya-gold-text dark:text-nenya-gold-light">What research says about connection and stress</h2>
            </div>

            <Card className="p-4 md:p-8 bg-muted/50 backdrop-blur-sm border-border">
              <div className="space-y-3 md:space-y-6 text-foreground leading-relaxed text-sm md:text-base">
                <p>
                  People are a social species. In lab studies, being near someone we trust calms the body's stress response. <Cite pageId="biosocial" n={[1, 2, 3]} /> One explanation, Social Baseline Theory, says the brain expects company and works harder when alone. It is a theory, and many studies are small.
                </p>
                <p>
                  We believe modern life makes close contact harder for many people. This is our view. Research on loneliness and screen use is mixed. <Cite pageId="biosocial" n={[4, 5, 6]} />
                </p>
                <p>
                  Some writers explain stress and safety with polyvagal theory. <Cite pageId="biosocial" n={[7, 8]} /> Its author says two vagus-nerve pathways support feeling safe and being social. <Cite pageId="biosocial" n={9} /> Critics say its claims about the vagus and evolution do not hold. <Cite pageId="biosocial" n={[10, 11, 12]} /> The theory is contested, so we do not rely on it.
                </p>
              </div>
            </Card>
          </BloomOnScroll>

          {/* Our idea */}
          <BloomOnScroll className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 px-2">
              <div className="p-2 md:p-3 bg-orange-500/20 rounded-lg">
                <TrendingDown className="size-5 md:size-6 text-orange-700 dark:text-orange-300" aria-hidden="true" />
              </div>
              <h2 className="text-xl md:text-3xl text-nenya-gold-text dark:text-nenya-gold-light">Our idea: buying to feel better</h2>
            </div>

            <Card className="p-4 md:p-8 bg-gradient-to-br from-muted/50 via-muted/30 to-muted/50 backdrop-blur-sm border-nenya-gold/30">
              <div className="space-y-3 md:space-y-6 text-foreground leading-relaxed text-sm md:text-base">
                <p>
                  Here is our idea in five steps. It is our own synthesis. Research supports some steps better than others.
                </p>

                <div className="pl-4 md:pl-6 border-l-4 border-nenya-gold/50 space-y-3 md:space-y-4 my-4 md:my-6">
                  <div>
                    <h3 className="text-nenya-gold-text dark:text-nenya-gold-light mb-1 md:mb-2 text-sm md:text-base">1. Feeling cut off</h3>
                    <p className="text-sm text-foreground">
                      Feeling alone goes with more watchfulness for threat and feeling vulnerable. <Cite pageId="biosocial" n={13} /> One large review links some ways of coping with feelings, such as dwelling on them, to more anxiety and depression. <Cite pageId="biosocial" n={14} />
                    </p>
                  </div>

                  <div>
                    <h3 className="text-nenya-gold-text dark:text-nenya-gold-light mb-1 md:mb-2 text-sm md:text-base">2. Buying to feel better</h3>
                    <p className="text-sm text-foreground">
                      Some people spend to feel better or to belong. In experiments, sadness and being left out changed what people chose to buy. <Cite pageId="biosocial" n={[15, 16, 17]} /> Shopping can lift a sad mood for a while. <Cite pageId="biosocial" n={[15, 18]} />
                    </p>
                  </div>

                  <div>
                    <h3 className="text-nenya-gold-text dark:text-nenya-gold-light mb-1 md:mb-2 text-sm md:text-base">3. Wanting more, without lasting relief</h3>
                    <p className="text-sm text-foreground">
                      Researchers separate wanting something from liking it. Dopamine is tied more to the urge to get something than to the pleasure of having it. <Cite pageId="biosocial" n={[19, 20, 21]} /> In one six-year study of over 2,500 people, using possessions as a "happiness medicine" went with more loneliness over time. <Cite pageId="biosocial" n={22} /> More materialistic people report lower well-being in a large review. This shows a link, not proof of cause. <Cite pageId="biosocial" n={23} /> In a small teen experiment, lowering materialism raised self-esteem. <Cite pageId="biosocial" n={24} />
                    </p>
                  </div>

                  <div>
                    <h3 className="text-nenya-gold-text dark:text-nenya-gold-light mb-1 md:mb-2 text-sm md:text-base">4. Getting used to it</h3>
                    <p className="text-sm text-foreground">
                      People often get used to good changes, and the lift fades. <Cite pageId="biosocial" n={[25, 26]} /> The fading is not complete, and it differs from person to person. <Cite pageId="biosocial" n={[27, 28]} /> In one study, rising wishes for even more helped wear away the gain from a positive change. <Cite pageId="biosocial" n={26} /> We did not find studies showing that this drives people to buy more for emotional relief.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-nenya-gold-text dark:text-nenya-gold-light mb-1 md:mb-2 text-sm md:text-base">5. The link to the planet</h3>
                    <p className="text-sm text-foreground">
                      Household consumption is linked to about two-thirds of global greenhouse gas emissions. <Cite pageId="biosocial" n={[29, 30]} /> Demand from consumers, often far away, is also linked to forest loss and to threats to species. <Cite pageId="biosocial" n={[31, 32]} /> Many things drive these harms. We have no evidence that sadness or loneliness is the main reason people buy. Researchers have studied each link on its own. In our searches we did not find a study of the whole chain.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </BloomOnScroll>

          {/* What Nenya is, and what it is not */}
          <BloomOnScroll className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 px-2">
              <div className="p-2 md:p-3 bg-green-500/20 rounded-lg">
                <Leaf className="size-5 md:size-6 text-green-700 dark:text-green-300" aria-hidden="true" />
              </div>
              <h2 className="text-xl md:text-3xl text-nenya-gold-text dark:text-nenya-gold-light">What Nenya is, and what it is not</h2>
            </div>

            <Card className="p-4 md:p-8 bg-muted/50 backdrop-blur-sm border-border">
              <div className="space-y-3 md:space-y-6 text-foreground leading-relaxed text-sm md:text-base">
                <p>
                  Nenya is a tool for slowing down and finding words for what you feel and need. It is not treatment. Brain-change claims are easy to make and hard to prove. In one large trial, an eight-week meditation course produced no measurable change in brain structure. <Cite pageId="biosocial" n={33} /> Researchers also warn that mindfulness findings have been over-stated. <Cite pageId="biosocial" n={34} /> What we hope Nenya helps with is naming feelings and needs more precisely. In studies, people who name feelings precisely tend to cope better with strong emotions. <Cite pageId="biosocial" n={[35, 36]} /> A short teaching exercise made 120 adults better at telling negative emotions apart. <Cite pageId="biosocial" n={37} /> We do not know whether Nenya does this.
                </p>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Card className="p-4 md:p-6 bg-muted/30 backdrop-blur-sm border-border">
                <h3 className="text-base md:text-lg text-nenya-gold-text dark:text-nenya-gold mb-3 md:mb-4">Changes we hope for (not measured in Nenya)</h3>
                <ul className="list-disc pl-5 space-y-2 md:space-y-3 text-sm text-foreground">
                  <li>
                    Noticing body signals better. In one trial, a three-month course of daily body scan and breath practice raised several self-report scores. <Cite pageId="biosocial" n={38} /> Nenya is not that course. <Cite pageId="biosocial" n={39} />
                  </li>
                  <li>
                    Steadying strong feelings by naming them or rethinking them. In lab studies, these methods engage front-of-brain areas and calm the brain's threat response. <Cite pageId="biosocial" n={[40, 41, 42]} />
                  </li>
                  <li>
                    A calmer body. Heart-rate biofeedback is a different practice. In reviews of small trials it lowered self-reported stress and anxiety. <Cite pageId="biosocial" n={[43, 44]} /> Nenya does not measure your heart, and we make no such claim for it.
                  </li>
                  <li>
                    Caring about others. Short compassion-training courses changed brain responses to suffering and raised helping in healthy adults. <Cite pageId="biosocial" n={[45, 46]} /> Nenya is not compassion training.
                  </li>
                </ul>
              </Card>

              <Card className="p-4 md:p-6 bg-muted/30 backdrop-blur-sm border-border">
                <h3 className="text-base md:text-lg text-nenya-gold-text dark:text-nenya-gold mb-3 md:mb-4">Changes we hope for in what people do</h3>
                <p className="text-sm text-foreground mb-2 md:mb-3">These are hopes. No study of Nenya has been done, so none has been measured in people who use it.</p>
                <ul className="list-disc pl-5 space-y-2 md:space-y-3 text-sm text-foreground">
                  <li>Less buying just to feel better</li>
                  <li>More time with people</li>
                  <li>More ability to sit with discomfort without shopping to escape it</li>
                  <li>More weight on meaning and growth, less on quick pleasure</li>
                </ul>
              </Card>
            </div>
          </BloomOnScroll>

          {/* Spending and carbon */}
          <BloomOnScroll className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 px-2">
              <div className="p-2 md:p-3 bg-blue-500/20 rounded-lg">
                <TrendingDown className="size-5 md:size-6 text-blue-700 dark:text-blue-300" aria-hidden="true" />
              </div>
              <h2 className="text-xl md:text-3xl text-nenya-gold-text dark:text-nenya-gold-light">Spending and carbon: what we can and cannot say</h2>
            </div>

            <Card className="p-4 md:p-8 bg-gradient-to-br from-muted/50 via-muted/30 to-muted/50 backdrop-blur-sm border-nenya-gold/30">
              <div className="space-y-3 md:space-y-6 text-foreground leading-relaxed text-sm md:text-base">
                <p>
                  Food, housing and travel make up most household emissions worldwide. In richer countries, travel and manufactured goods count most. <Cite pageId="biosocial" n={[29, 30]} /> The biggest personal cuts studied are living car-free, flying less and eating plant-based. <Cite pageId="biosocial" n={[29, 47]} /> Footprints are very unequal. <Cite pageId="biosocial" n={48} /> Some researchers warn that stressing personal choices can pull attention from systems change. <Cite pageId="biosocial" n={49} />
                </p>
                <p>
                  We have no figures for how much less people would buy, or how much carbon that would save. We will not invent them.
                </p>
              </div>
            </Card>
          </BloomOnScroll>

          {/* The footprint of this tool */}
          <BloomOnScroll className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 px-2">
              <div className="p-2 md:p-3 bg-purple-500/20 rounded-lg">
                <Cpu className="size-5 md:size-6 text-purple-700 dark:text-purple-300" aria-hidden="true" />
              </div>
              <h2 className="text-xl md:text-3xl text-nenya-gold-text dark:text-nenya-gold-light">The footprint of this tool</h2>
            </div>

            <Card className="p-4 md:p-8 bg-gradient-to-br from-muted/50 via-muted/30 to-muted/50 backdrop-blur-sm border-nenya-gold/30">
              <p className="text-sm md:text-lg text-foreground leading-relaxed">
                Does technology built to help us reconnect just swap one kind of consumption for another? Running AI in data centres uses energy and water. <Cite pageId="biosocial" n={[50, 51]} /> The amount varies a lot with the model, the task and the place. <Cite pageId="biosocial" n={[52, 53]} /> Published figures differ widely. Our aim is a small footprint. Today the coach is short and capped at five exchanges. Running a small model on your own device is a plan, not built, and may not save energy (see below).
              </p>
            </Card>

            <Card className="p-4 md:p-6 bg-muted/50 backdrop-blur-sm border-border overflow-hidden">
              <h3 className="text-base md:text-lg text-nenya-gold-text dark:text-nenya-gold mb-2 text-center">
                Energy, water and data
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-4 md:mb-6">
                What we know about Nenya today, and what is only a goal. The right-hand column is a goal, not a feature.
              </p>
              <div className="space-y-3 md:space-y-4 text-sm text-foreground leading-relaxed mb-4 md:mb-6">
                <p>
                  In one test on data-centre GPUs, 1,000 text replies from a language model took about 0.05 kWh. Image generation took far more. <Cite pageId="biosocial" n={52} /> Data centres use water for cooling, and indirectly through the power plants that supply them. Use varies a lot. Fewer than a third of operators measure it. <Cite pageId="biosocial" n={50} /> One study estimated that a large model uses a 500 ml bottle of water for every 10 to 50 medium-length answers. It depends on when and where it runs. <Cite pageId="biosocial" n={53} /> Some data centres are in places short of water. <Cite pageId="biosocial" n={51} />
                </p>
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse">
                  <caption className="sr-only">Nenya today compared with what is not built yet, by feature</caption>
                  <thead>
                    <tr className="border-b-2 border-border">
                      <th scope="col" className="text-left p-3 md:p-4 text-sm md:text-base text-foreground">Feature</th>
                      {FOOTPRINT_COLUMNS.map((c) => (
                        <th scope="col" key={c.id} className={`text-left p-3 md:p-4 text-sm md:text-base ${c.tone}`}>
                          <div className="flex items-center gap-2">
                            <c.Icon className="size-4 md:size-5" aria-hidden="true" />
                            <span>{c.title}<br /><span className="text-xs text-muted-foreground">{c.sub}</span></span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {FOOTPRINT_ROWS.map((r) => (
                      <tr key={r.feature} className="border-b border-border align-top">
                        <th scope="row" className="p-3 md:p-4 text-left"><strong className="text-sm md:text-base">{r.feature}</strong></th>
                        {FOOTPRINT_COLUMNS.map((c) => (
                          <td key={c.id} className="p-3 md:p-4 text-xs md:text-sm text-foreground">{r[c.id]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card Layout */}
              <div className="md:hidden space-y-4">
                {FOOTPRINT_ROWS.map((r) => (
                  <div key={r.feature} className="space-y-2 border-b border-border pb-4 last:border-0">
                    <h4 className="text-sm text-nenya-gold-text dark:text-nenya-gold">{r.feature}</h4>
                    {FOOTPRINT_COLUMNS.map((c) => (
                      <div key={c.id}>
                        <p className={`text-xs mb-1 flex items-center gap-1 ${c.tone}`}>
                          <c.Icon className="size-3" aria-hidden="true" />
                          <strong>{c.title} {c.sub}</strong>
                        </p>
                        <p className="text-xs text-foreground">{r[c.id]}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 md:p-8 bg-gradient-to-br from-nenya-accent-primary/10 via-nenya-accent-primary/5 to-nenya-accent-primary/10 backdrop-blur-sm border-nenya-accent-primary/30">
              <p className="text-sm md:text-lg text-foreground leading-relaxed text-center">
                Collecting little data is mainly a privacy choice. For energy, our own estimates say the biggest factors are page size, whether an AI model is called, and your screen. These are estimates, not measurements. <Cite pageId="biosocial" n={[52, 54, 55]} /> Today, that means a coach that is short and capped, and does not store your conversation unless you send us a transcript. Our goal is to keep this tool's footprint small, and to say plainly what we have and have not measured.
              </p>
            </Card>
          </BloomOnScroll>

          {/* Design Philosophy & The Logo */}
          <BloomOnScroll className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 px-2">
              <div className="p-2 md:p-3 bg-nenya-gold/20 rounded-lg">
                <Eye className="size-5 md:size-6 text-nenya-gold-text dark:text-nenya-gold" aria-hidden="true" />
              </div>
              <h2 className="text-xl md:text-3xl text-nenya-gold-text dark:text-nenya-gold-light">The Design of Nenya: Logo, Lenses & Sense-Making</h2>
            </div>

            <Card className="p-4 md:p-8 bg-muted/50 backdrop-blur-sm border-border">
              <div className="space-y-3 md:space-y-6 text-foreground leading-relaxed text-sm md:text-base">
                <p>
                  We designed the parts of Nenya to help you slow down and reflect. We have not tested whether they do.
                </p>
                
                <div className="flex justify-center my-6">
                  <div className="nenya-light-emanation">
                    <PanelLogo size={isMobile ? 80 : 120} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-base md:text-lg text-nenya-gold-text dark:text-nenya-gold mb-2">The Breathing Logo: A Visual Anchor</h3>
                    <p className="text-sm text-foreground">
                      The Nenya logo is meant as a visual anchor you can follow with your breath, not just a decoration. Select it to open the breathing animation and accessibility settings, where you can choose your breathing pace. The default is six seconds in and six out, a 12-second cycle.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-base md:text-lg text-nenya-gold-text dark:text-nenya-gold mb-2">The Six Lenses: Multi-Sensory Access to Inner Experience</h3>
                    <p className="text-sm text-foreground">
                      We built the Lenses because words are not the easiest way in for everyone. For example, trouble naming feelings (alexithymia) is more common in autistic people. <Cite pageId="biosocial" n={56} /> Links between colours and feelings share a common core but differ by language and place. <Cite pageId="biosocial" n={57} /> Whether one sense suits one person better has not been shown. The six Lenses are Sight, Sound, Touch, Essence, Movement and Pattern. This set is our own design, not a tested list. We aim to offer more than one way in. We have not tested whether the Lenses work across different groups. We believe there is no single correct way to begin.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-base md:text-lg text-nenya-gold-text dark:text-nenya-gold mb-2">Sense-making in your own words</h3>
                    <p className="text-sm text-foreground">
                      The coach is told to use your own words, to say what feeling or need it hears, and not to tell you what to do. It is told to ask at most one question. This is reflective listening, not Socratic questioning, which uses a chain of questions to test a belief. In studies of human therapy, empathic listening goes with better results. <Cite pageId="biosocial" n={[58, 59]} /> This coach has not been studied. The goal is to help you <strong>make sense of your own experience</strong>, not to impose interpretations. This is why we call Nenya a "Mirror, not Oracle."
                    </p>
                  </div>

                  <div>
                    <h3 className="text-base md:text-lg text-nenya-gold-text dark:text-nenya-gold mb-2">Progressive Disclosure: Emotional First, Intellectual Later</h3>
                    <p className="text-sm text-foreground">
                      Nenya is designed around progressive disclosure. You pick up a Lens first, our approach second, and the explanations only if you choose to read them. Showing less at first has helped new users in software studies. <Cite pageId="biosocial" n={[60, 61, 62]} /> We start with feeling and keep the explanations behind a choice. We believe a long explanation can get in the way at the start.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Design Methodology Links */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-muted/30 border-blue-500/30 hover:border-blue-500/60 transition-all">
                <button type="button" onClick={() => setCurrentSubSection('hcd')} className="p-6 text-left w-full min-h-11 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                  <span className="flex items-start gap-3">
                    <span className="p-2 bg-blue-500/20 rounded-lg shrink-0">
                      <Users className="size-5 text-blue-700 dark:text-blue-300" aria-hidden="true" />
                    </span>
                    <span className="block space-y-2">
                      <span className="text-base md:text-lg text-foreground flex items-center gap-2">
                        Human-Centered Design
                        <ExternalLink className="size-4" aria-hidden="true" />
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        How we tried to design around people's needs, differences and safety. This opens a separate page.
                      </span>
                    </span>
                  </span>
                </button>
              </Card>

              <Card className="bg-muted/30 border-purple-500/30 hover:border-purple-500/60 transition-all">
                <button type="button" onClick={() => setCurrentSubSection('theory-u')} className="p-6 text-left w-full min-h-11 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                  <span className="flex items-start gap-3">
                    <span className="p-2 bg-purple-500/20 rounded-lg shrink-0">
                      <Circle className="size-5 text-purple-700 dark:text-purple-300" aria-hidden="true" />
                    </span>
                    <span className="block space-y-2">
                      <span className="text-base md:text-lg text-foreground flex items-center gap-2">
                        Theory U & Presencing
                        <ExternalLink className="size-4" aria-hidden="true" />
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        How we used Otto Scharmer's U-shaped model as an analogy for the order of Nenya. This opens a separate page.
                      </span>
                    </span>
                  </span>
                </button>
              </Card>
            </div>
          </BloomOnScroll>

          {/* Sources */}
          <BloomOnScroll className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 px-2">
              <div className="p-2 md:p-3 bg-nenya-gold/20 rounded-lg">
                <BookOpen className="size-5 md:size-6 text-nenya-gold-text dark:text-nenya-gold" aria-hidden="true" />
              </div>
              <h2 className="text-xl md:text-3xl text-nenya-gold-text dark:text-nenya-gold-light">Sources</h2>
            </div>

            <Card className="p-4 md:p-8 bg-muted/50 backdrop-blur-sm border-border">
              <div className="space-y-6">
                <ReferenceList pageId="biosocial" items={BIOSOCIAL_REFERENCES} />
                <section aria-labelledby="biosocial-further-h" className="space-y-3">
                  <h3 id="biosocial-further-h" className="text-xl">Further reading</h3>
                  <p className="text-sm text-muted-foreground">Read from abstracts only; not cited on this page. The publishers' pages may need payment.</p>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                    {BIOSOCIAL_FURTHER_READING.map((r) => (
                      <li key={r.href}>
                        {r.text}{' '}
                        <a href={r.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                          Publisher page (may need payment)<span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </Card>
          </BloomOnScroll>

          {/* Return to Top */}
          <ReturnToTop onClick={scrollToTop} />
        </div>
      </div>

      <AppFooter />
    </div>
  );
}
