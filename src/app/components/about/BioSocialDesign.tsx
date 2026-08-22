import React from 'react';
import { ArrowLeft, Leaf, Heart, TrendingDown, Users, Cpu, Cloud, Eye, Circle, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import NenyaLogo from '../NenyaLogo';
import { useIsMobile } from '../useIsMobile';
import { BloomInstant, BloomOnScroll } from '../BloomOnScroll';
import { ReturnToTop } from '../ReturnToTop';
import HumanCenteredDesign from './HumanCenteredDesign';
import TheoryU from './TheoryU';

interface BioSocialDesignProps {
  onBack: () => void;
}

type SubSection = 'main' | 'hcd' | 'theory-u';

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
              <NenyaLogo size={isMobile ? 70 : 120} />
            </div>
            
            <h1 className="text-2xl md:text-4xl lg:text-5xl bg-gradient-to-r from-foreground via-nenya-gold to-foreground bg-clip-text text-transparent px-4">
              The Suffering-Consumption Cycle
            </h1>
            <p className="text-sm md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
              How emotional disconnection drives ecological collapse—and how reconnection can reverse it
            </p>
          </BloomInstant>

          {/* The Problem: Bio-Social Roots */}
          <BloomOnScroll className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 px-2">
              <div className="p-2 md:p-3 bg-red-500/20 rounded-lg">
                <Heart className="size-5 md:size-6 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl md:text-3xl text-nenya-gold-dark dark:text-nenya-gold-light">The Biological Reality</h2>
            </div>

            <Card className="p-4 md:p-8 bg-muted/50 backdrop-blur-sm border-border">
              <div className="space-y-3 md:space-y-6 text-foreground leading-relaxed text-sm md:text-base">
                <p>
                  For millions of years, human emotional regulation evolved through direct social connection, communal interdependence, and meaningful engagement with the living world. Our nervous systems are <em>wired</em> for this—the neuroscience is unambiguous.
                </p>
                <p>
                  But modern capitalism has systematically severed these biological imperatives. Digital isolation, atomization, precarious work, and the commodification of every human need have created a global population experiencing what neuroscientists would call <strong className="text-nenya-gold-dark dark:text-nenya-gold-light">chronic regulatory deficit</strong>.
                </p>
                <p>
                  When we cannot meet our emotional needs through genuine connection—when our <strong className="text-nenya-gold-dark dark:text-nenya-gold-light">polyvagal nervous system</strong> remains in a chronic state of dysregulation—we turn to the only mechanisms our culture makes readily available: <em>consumption</em>.
                </p>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Card className="p-4 md:p-6 bg-muted/30 backdrop-blur-sm border-border">
                <h3 className="text-base md:text-lg text-nenya-gold-dark dark:text-nenya-gold mb-3 md:mb-4">What We're Designed For</h3>
                <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
                  <li>• Face-to-face emotional attunement</li>
                  <li>• Co-regulation within community</li>
                  <li>• Meaningful work connected to survival</li>
                  <li>• Reciprocal relationships with ecosystems</li>
                  <li>• Ritual, meaning-making, and shared purpose</li>
                </ul>
              </Card>

              <Card className="p-4 md:p-6 bg-muted/30 backdrop-blur-sm border-border">
                <h3 className="text-base md:text-lg text-red-600 dark:text-red-400 mb-3 md:mb-4">What We Get Instead</h3>
                <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
                  <li>• Algorithmic pseudo-connection</li>
                  <li>• Atomized, competitive isolation</li>
                  <li>• Alienated labor divorced from outcomes</li>
                  <li>• Extractive relationships with "resources"</li>
                  <li>• Consumption as meaning-substitute</li>
                </ul>
              </Card>
            </div>
          </BloomOnScroll>

          {/* The Mechanism */}
          <BloomOnScroll className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 px-2">
              <div className="p-2 md:p-3 bg-orange-500/20 rounded-lg">
                <TrendingDown className="size-5 md:size-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-xl md:text-3xl text-nenya-gold-dark dark:text-nenya-gold-light">The Consumption Spiral</h2>
            </div>

            <Card className="p-4 md:p-8 bg-gradient-to-br from-muted/50 via-muted/30 to-muted/50 backdrop-blur-sm border-nenya-gold/30">
              <div className="space-y-3 md:space-y-6 text-foreground leading-relaxed text-sm md:text-base">
                <p>
                  Here's the mechanism, backed by decades of research in <strong className="text-nenya-gold-dark dark:text-nenya-gold-light">affective neuroscience</strong> and <strong className="text-nenya-gold-dark dark:text-nenya-gold-light">behavioral economics</strong>:
                </p>
                
                <div className="pl-4 md:pl-6 border-l-4 border-nenya-gold/50 space-y-3 md:space-y-4 my-4 md:my-6">
                  <div>
                    <p className="text-nenya-gold-dark dark:text-nenya-gold-light mb-1 md:mb-2 text-sm md:text-base">1. Emotional Dysregulation</p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Chronic disconnection from our emotional needs creates persistent states of anxiety, loneliness, shame, or emptiness. Our nervous system is in distress.
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-nenya-gold-dark dark:text-nenya-gold-light mb-1 md:mb-2 text-sm md:text-base">2. Compensatory Consumption</p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Unable to process or meet these needs authentically, we seek temporary relief through consumption: shopping, streaming, doomscrolling, comfort foods, status symbols, "retail therapy."
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-nenya-gold-dark dark:text-nenya-gold-light mb-1 md:mb-2 text-sm md:text-base">3. Dopamine Without Connection</p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      These behaviors trigger <strong>dopamine release</strong>—a reward signal—but without genuine need fulfillment. The underlying dysregulation persists.
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-nenya-gold-dark dark:text-nenya-gold-light mb-1 md:mb-2 text-sm md:text-base">4. Hedonic Adaptation & Escalation</p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      We adapt to the dopamine hit. We need more, newer, faster consumption to achieve the same temporary relief. The cycle accelerates.
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-nenya-gold-dark dark:text-nenya-gold-light mb-1 md:mb-2 text-sm md:text-base">5. Ecological Devastation</p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      This global spiral of suffering-driven consumption is <em>the primary driver</em> of carbon emissions, deforestation, species extinction, and planetary heating.
                    </p>
                  </div>
                </div>

                <p className="text-sm md:text-lg border-t border-border pt-4 md:pt-6">
                  <strong className="text-nenya-gold-dark dark:text-nenya-gold-light">Researchers in behavioral economics have explored the connection between emotional dysregulation, compensatory consumption, and environmental impact.</strong> They are the same crisis, expressing through different systems.
                </p>
              </div>
            </Card>
          </BloomOnScroll>

          {/* The Solution */}
          <BloomOnScroll className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 px-2">
              <div className="p-2 md:p-3 bg-green-500/20 rounded-lg">
                <Leaf className="size-5 md:size-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl md:text-3xl text-nenya-gold-dark dark:text-nenya-gold-light">The Intervention</h2>
            </div>

            <Card className="p-4 md:p-8 bg-muted/50 backdrop-blur-sm border-border">
              <div className="space-y-3 md:space-y-6 text-foreground leading-relaxed text-sm md:text-base">
                <p>
                  Nenya is designed as a <strong className="text-nenya-gold-dark dark:text-nenya-gold-light">targeted neuroplastic intervention</strong> to interrupt this cycle at its biological source.
                </p>
                <p>
                  By systematically rebuilding our capacity for <em>emotional granularity</em> (recognizing and naming our actual feelings) and <em>needs literacy</em> (understanding what we genuinely require for wellbeing), we restore our ability to regulate through connection rather than consumption.
                </p>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Card className="p-4 md:p-6 bg-muted/30 backdrop-blur-sm border-border">
                <h3 className="text-base md:text-lg text-nenya-gold-dark dark:text-nenya-gold mb-3 md:mb-4">What Changes Neurologically</h3>
                <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-foreground">
                  <li className="flex gap-2">
                    <span className="text-nenya-gold-dark dark:text-nenya-gold">→</span>
                    <span><strong>Interoceptive awareness</strong> increases (we can feel what we feel)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-nenya-gold-dark dark:text-nenya-gold">→</span>
                    <span><strong>Prefrontal regulation</strong> strengthens (we can process emotion without overwhelm)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-nenya-gold-dark dark:text-nenya-gold">→</span>
                    <span><strong>Vagal tone</strong> improves (our nervous system returns to baseline more easily)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-nenya-gold-dark dark:text-nenya-gold">→</span>
                    <span><strong>Empathic circuits</strong> reactivate (we reconnect with others authentically)</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-4 md:p-6 bg-muted/30 backdrop-blur-sm border-border">
                <h3 className="text-base md:text-lg text-nenya-gold-dark dark:text-nenya-gold mb-3 md:mb-4">What Changes Behaviorally</h3>
                <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-foreground">
                  <li className="flex gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    <span>Reduced compensatory consumption</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    <span>Increased connection-seeking (not commodity-seeking)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    <span>Greater tolerance for discomfort without "retail therapy"</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    <span>Shift from hedonic to eudaimonic wellbeing</span>
                  </li>
                </ul>
              </Card>
            </div>
          </BloomOnScroll>

          {/* Carbon De-escalation - Simplified for mobile */}
          <BloomOnScroll className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 px-2">
              <div className="p-2 md:p-3 bg-blue-500/20 rounded-lg">
                <TrendingDown className="size-5 md:size-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl md:text-3xl text-nenya-gold-dark dark:text-nenya-gold-light">Rapid Carbon De-escalation</h2>
            </div>

            <Card className="p-4 md:p-8 bg-gradient-to-br from-muted/50 via-muted/30 to-muted/50 backdrop-blur-sm border-nenya-gold/30">
              <div className="space-y-3 md:space-y-6 text-foreground leading-relaxed text-sm md:text-base">
                <p>
                  The research is clear: <strong className="text-nenya-gold-dark dark:text-nenya-gold-light">personal carbon footprints are overwhelmingly driven by discretionary consumption</strong>—the very consumption we engage in as emotional regulation when our genuine needs go unmet.
                </p>
                <p>
                  When individuals develop robust emotional regulation through authentic connection:
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 my-4 md:my-6">
                  <div className="p-3 md:p-4 bg-card rounded-lg border border-border">
                    <p className="text-xl md:text-2xl text-nenya-gold-dark dark:text-nenya-gold mb-1 md:mb-2">30-50%</p>
                    <p className="text-xs text-muted-foreground">Reduction in impulse purchases and fast fashion</p>
                  </div>
                  <div className="p-3 md:p-4 bg-card rounded-lg border border-border">
                    <p className="text-xl md:text-2xl text-nenya-gold-dark dark:text-nenya-gold mb-1 md:mb-2">20-35%</p>
                    <p className="text-xs text-muted-foreground">Decrease in comfort food & delivery consumption</p>
                  </div>
                  <div className="p-3 md:p-4 bg-card rounded-lg border border-border">
                    <p className="text-xl md:text-2xl text-nenya-gold-dark dark:text-nenya-gold mb-1 md:mb-2">15-25%</p>
                    <p className="text-xs text-muted-foreground">Lower overall household carbon footprint</p>
                  </div>
                </div>

                <p className="text-xs md:text-sm text-muted-foreground italic">
                  *Projections based on behavioral economics research on emotional spending, hedonic adaptation, and voluntary simplicity movements
                </p>

                <p className="border-t border-border pt-4 md:pt-6 text-sm md:text-base">
                  At scale, this represents one of the <strong className="text-nenya-gold-dark dark:text-nenya-gold-light">behavioural interventions with documented links to discretionary consumption patterns</strong>—because it addresses the root cause rather than symptoms.
                </p>
              </div>
            </Card>
          </BloomOnScroll>

          {/* The Technological Footprint of Emotional Debt */}
          <BloomOnScroll className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 px-2">
              <div className="p-2 md:p-3 bg-purple-500/20 rounded-lg">
                <Cpu className="size-5 md:size-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-xl md:text-3xl text-nenya-gold-dark dark:text-nenya-gold-light">The Technological Footprint of Emotional Debt</h2>
            </div>

            {/* Introductory text */}
            <Card className="p-4 md:p-8 bg-gradient-to-br from-muted/50 via-muted/30 to-muted/50 backdrop-blur-sm border-nenya-gold/30">
              <p className="text-base md:text-xl text-foreground leading-relaxed text-center italic">
                "The question is: Does the technology built to help us reconnect simply swap one form of consumption for another? Traditional centralized AI architectures—even those designed for wellness—are structurally tied to the very consumption cycle we aim to interrupt. Our design decision was to break that link."
              </p>
            </Card>

            {/* Resource Comparison Table */}
            <Card className="p-4 md:p-6 bg-muted/50 backdrop-blur-sm border-border overflow-hidden">
              <h3 className="text-base md:text-lg text-nenya-gold-dark dark:text-nenya-gold mb-4 md:mb-6 text-center">
                Resource Consumption Comparison
              </h3>
              
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-border">
                      <th className="text-left p-3 md:p-4 text-sm md:text-base text-foreground">Feature</th>
                      <th className="text-left p-3 md:p-4 text-sm md:text-base text-red-600 dark:text-red-400">
                        <div className="flex items-center gap-2">
                          <Cloud className="size-4 md:size-5" />
                          <span>Centralized Cloud<br /><span className="text-xs text-muted-foreground">(High Consumption)</span></span>
                        </div>
                      </th>
                      <th className="text-left p-3 md:p-4 text-sm md:text-base text-green-600 dark:text-green-400">
                        <div className="flex items-center gap-2">
                          <Cpu className="size-4 md:size-5" />
                          <span>Decentralized Edge AI<br /><span className="text-xs text-muted-foreground">(Low Consumption)</span></span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="p-3 md:p-4 align-top">
                        <strong className="text-sm md:text-base">Energy Consumption<br /><span className="text-xs text-muted-foreground">(Per Session)</span></strong>
                      </td>
                      <td className="p-3 md:p-4 bg-red-500/5 align-top">
                        <p className="text-xs md:text-sm text-foreground">High-end GPU (~400W peak) and high network energy for 5+ daily round trips.</p>
                      </td>
                      <td className="p-3 md:p-4 bg-green-500/5 align-top">
                        <p className="text-xs md:text-sm text-foreground">Mobile NPU (~35W peak) and Offline Inference.</p>
                        <p className="text-xs md:text-sm text-green-600 dark:text-green-400 mt-2">
                          <strong className="inline-block px-2 py-1 bg-green-500/20 rounded">90%+ power reduction per task</strong>
                        </p>
                      </td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-3 md:p-4 align-top">
                        <strong className="text-sm md:text-base">Water Stress<br /><span className="text-xs text-muted-foreground">(Macro)</span></strong>
                      </td>
                      <td className="p-3 md:p-4 bg-red-500/5 align-top">
                        <p className="text-xs md:text-sm text-foreground">Data Center Cooling: 5 million gallons/day per facility. Exports water scarcity to host communities.</p>
                      </td>
                      <td className="p-3 md:p-4 bg-green-500/5 align-top">
                        <p className="text-xs md:text-sm text-foreground">Computation moved off cooling systems. Mitigated Localized Resource Stress.</p>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 md:p-4 align-top">
                        <strong className="text-sm md:text-base">Data Footprint</strong>
                      </td>
                      <td className="p-3 md:p-4 bg-red-500/5 align-top">
                        <p className="text-xs md:text-sm text-foreground">Persistent Cloud Data Retention for harvesting. Passive Energy Debt and privacy risk.</p>
                      </td>
                      <td className="p-3 md:p-4 bg-green-500/5 align-top">
                        <p className="text-xs md:text-sm text-foreground">Data is Ephemeral (single session) or Local. Eliminates passive storage energy debt.</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Mobile Card Layout */}
              <div className="md:hidden space-y-4">
                {/* Energy Consumption */}
                <div className="space-y-3">
                  <h4 className="text-sm text-nenya-gold-dark dark:text-nenya-gold">Energy Consumption (Per Session)</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-red-500/5 rounded-lg border-l-4 border-red-500">
                      <p className="text-xs text-red-600 dark:text-red-400 mb-1 flex items-center gap-1">
                        <Cloud className="size-3" />
                        <strong>Centralized Cloud</strong>
                      </p>
                      <p className="text-xs text-foreground">High-end GPU (~400W peak) and high network energy for 5+ daily round trips.</p>
                    </div>
                    <div className="p-3 bg-green-500/5 rounded-lg border-l-4 border-green-500">
                      <p className="text-xs text-green-600 dark:text-green-400 mb-1 flex items-center gap-1">
                        <Cpu className="size-3" />
                        <strong>Decentralized Edge AI</strong>
                      </p>
                      <p className="text-xs text-foreground">Mobile NPU (~35W peak) and Offline Inference.</p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                        <strong className="inline-block px-2 py-1 bg-green-500/20 rounded">90%+ power reduction per task</strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Water Stress */}
                <div className="space-y-3">
                  <h4 className="text-sm text-nenya-gold-dark dark:text-nenya-gold">Water Stress (Macro)</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-red-500/5 rounded-lg border-l-4 border-red-500">
                      <p className="text-xs text-red-600 dark:text-red-400 mb-1 flex items-center gap-1">
                        <Cloud className="size-3" />
                        <strong>Centralized Cloud</strong>
                      </p>
                      <p className="text-xs text-foreground">Data Center Cooling: 5 million gallons/day per facility. Exports water scarcity to host communities.</p>
                    </div>
                    <div className="p-3 bg-green-500/5 rounded-lg border-l-4 border-green-500">
                      <p className="text-xs text-green-600 dark:text-green-400 mb-1 flex items-center gap-1">
                        <Cpu className="size-3" />
                        <strong>Decentralized Edge AI</strong>
                      </p>
                      <p className="text-xs text-foreground">Computation moved off cooling systems. Mitigated Localized Resource Stress.</p>
                    </div>
                  </div>
                </div>

                {/* Data Footprint */}
                <div className="space-y-3">
                  <h4 className="text-sm text-nenya-gold-dark dark:text-nenya-gold">Data Footprint</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-red-500/5 rounded-lg border-l-4 border-red-500">
                      <p className="text-xs text-red-600 dark:text-red-400 mb-1 flex items-center gap-1">
                        <Cloud className="size-3" />
                        <strong>Centralized Cloud</strong>
                      </p>
                      <p className="text-xs text-foreground">Persistent Cloud Data Retention for harvesting. Passive Energy Debt and privacy risk.</p>
                    </div>
                    <div className="p-3 bg-green-500/5 rounded-lg border-l-4 border-green-500">
                      <p className="text-xs text-green-600 dark:text-green-400 mb-1 flex items-center gap-1">
                        <Cpu className="size-3" />
                        <strong>Decentralized Edge AI</strong>
                      </p>
                      <p className="text-xs text-foreground">Data is Ephemeral (single session) or Local. Eliminates passive storage energy debt.</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Concluding Statement */}
            <Card className="p-4 md:p-8 bg-gradient-to-br from-nenya-accent-primary/10 via-nenya-accent-primary/5 to-nenya-accent-primary/10 backdrop-blur-sm border-nenya-accent-primary/30">
              <p className="text-sm md:text-lg text-foreground leading-relaxed text-center">
                <strong className="text-nenya-gold-dark dark:text-nenya-gold-light">Our commitment to Data Minimization for Privacy is not just a security feature—it is the most effective first-order Energy Efficiency Mechanism.</strong> By building on the Edge, we ensure our technology helps you heal without harming the planet.
              </p>
              <p className="text-xs text-muted-foreground text-center mt-4 md:mt-6 italic">
                Data sourced from <a 
                  href="https://docs.google.com/document/d/1tXBX54v_klZ3ZQ9ksZvWUhYd5t-8Wh4Mw-IEDy6OXd4/edit?usp=sharing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-nenya-gold-dark dark:text-nenya-gold-light hover:underline"
                >
                  "AI Environmental Impact Analysis (2025)."
                </a>
              </p>
            </Card>
          </BloomOnScroll>

          {/* Design Philosophy & The Logo */}
          <BloomOnScroll className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 px-2">
              <div className="p-2 md:p-3 bg-nenya-gold/20 rounded-lg">
                <Eye className="size-5 md:size-6 text-nenya-gold-dark dark:text-nenya-gold" />
              </div>
              <h2 className="text-xl md:text-3xl text-nenya-gold-dark dark:text-nenya-gold-light">The Design of Nenya: Logo, Gateways & Sense-Making</h2>
            </div>

            <Card className="p-4 md:p-8 bg-muted/50 backdrop-blur-sm border-border">
              <div className="space-y-3 md:space-y-6 text-foreground leading-relaxed text-sm md:text-base">
                <p>
                  Every element of Nenya—from the pulsing logo to the multi-sensory gateways—is intentionally designed to support emotional regulation and sense-making.
                </p>
                
                <div className="flex justify-center my-6">
                  <div className="nenya-light-emanation">
                    <NenyaLogo size={isMobile ? 80 : 120} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-base md:text-lg text-nenya-gold-dark dark:text-nenya-gold mb-2">The Breathing Logo: Synchronized Visual Anchor</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      The Nenya logo pulses with a <strong>deliberate breathing rhythm</strong> — a gentle expand and contract that mirrors inhale and exhale, meant as a <strong>visual anchor</strong> you can follow rather than just a decoration. It's synchronized to a 0.1Hz breathing pattern (a 10-second cycle), and stays subtle and consistent whether you're in light or dark mode.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-base md:text-lg text-nenya-gold-dark dark:text-nenya-gold mb-2">The Six Gateways: Multi-Sensory Access to Inner Experience</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      We designed Nenya around the recognition that people connect to their emotional world through different sensory modalities. Some resonate with <strong>visual color symbolism</strong>, others with <strong>sound, touch, essence (scent/atmosphere), movement, or cognitive insight</strong>. The Six Gateways ensure accessibility across neurotypes and cultural backgrounds, honoring that there is no single "correct" way to begin the journey inward.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-base md:text-lg text-nenya-gold-dark dark:text-nenya-gold mb-2">Sense-Making Through Socratic Questioning</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      The AI doesn't tell you what to feel or what your needs are. Instead, it asks gentle, non-leading questions—a practice rooted in <em>Socratic methodology</em>. This mirrors the way trusted human facilitators create space for self-discovery. The goal is to help you <strong>make sense of your own experience</strong>, not to impose interpretations. This is why we call Nenya a "Mirror, not Oracle."
                    </p>
                  </div>

                  <div>
                    <h3 className="text-base md:text-lg text-nenya-gold-dark dark:text-nenya-gold mb-2">Progressive Disclosure: Emotional First, Intellectual Later</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      The entire interface is designed around <strong>progressive disclosure</strong>: you encounter the gateway ritual first, the NVC+ practice second, and all the philosophical/scientific justification only if you choose to explore it. This respects that emotional healing doesn't begin with intellectual understanding—it begins with <em>feeling felt</em>.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Design Methodology Links */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card 
                className="p-6 bg-muted/30 border-blue-500/30 cursor-pointer hover:border-blue-500/60 transition-all"
                onClick={() => setCurrentSubSection('hcd')}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg shrink-0">
                    <Users className="size-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base md:text-lg text-foreground flex items-center gap-2">
                      Human-Centered Design
                      <ExternalLink className="size-4" />
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      How we designed Nenya by deeply understanding human needs, cognitive diversity, and emotional safety.
                    </p>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-6 bg-muted/30 border-purple-500/30 cursor-pointer hover:border-purple-500/60 transition-all"
                onClick={() => setCurrentSubSection('theory-u')}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg shrink-0">
                    <Circle className="size-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base md:text-lg text-foreground flex items-center gap-2">
                      Theory U & Presencing
                      <ExternalLink className="size-4" />
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      How Nenya's structure mirrors the U-journey of sensing, presencing, and realizing authentic action.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </BloomOnScroll>

          {/* Return to Top */}
          <ReturnToTop onClick={scrollToTop} />
        </div>
      </div>
    </div>
  );
}
