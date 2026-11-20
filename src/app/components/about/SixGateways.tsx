import { Eye, Music, Hand, Leaf, TrendingUp, Lightbulb, TreePine, BookOpen } from 'lucide-react';
import { activeLenses, lensCountWord, type LensId } from '../../../lib/lensState';
import { Card } from '../ui/card';
import { AppFooter } from '../AppFooter';

interface SixGatewaysProps {
  onBack: () => void;
}

const gateways = [
  {
    id: 'sight',
    name: 'Sight',
    subtitle: 'Chromesthesia',
    icon: Eye,
    description: 'Explore through color & image',
    explanation: 'Visual processing is our dominant sensory pathway. The Sight Lens invites you to choose colors for how you feel. There is no right answer and no color has a fixed meaning: color associations tend to be tied to memory and cultural meaning in ways that are hard to put into words directly.',
    neuroscience: 'Color processing involves the visual cortex and emotional centers in the limbic system — part of why a color can carry a feeling before you consciously name it.',
    color: 'from-blue-500/20 to-purple-500/20',
    iconColor: 'text-blue-400',
  },
  {
    id: 'sound',
    name: 'Sound',
    subtitle: 'Audition',
    icon: Music,
    description: 'Navigate through rhythm & tone',
    explanation: 'Sound and rhythm directly influence our nervous system. The Sound Lens translates emotional states into acoustic qualities—frequency, rhythm, tone—allowing those who think in auditory patterns to access their inner experience.',
    neuroscience: 'Sound engages the auditory cortex and rhythmic processing in the cerebellum, which is part of why music and rhythm can shift a mood so directly.',
    color: 'from-purple-500/20 to-pink-500/20',
    iconColor: 'text-purple-400',
  },
  {
    id: 'touch',
    name: 'Touch',
    subtitle: 'Somatosensation',
    icon: Hand,
    description: 'Feel through texture & sensation',
    explanation: 'Physical sensation grounds us in the present. The Touch Lens uses texture, temperature, and haptic metaphors to help those who process emotions somatically—as bodily sensations rather than thoughts or images.',
    neuroscience: "Touch engages the somatosensory cortex and interoceptive awareness through the insula — the body's own sense of its internal state, separate from thought.",
    color: 'from-pink-500/20 to-orange-500/20',
    iconColor: 'text-pink-400',
  },
  {
    id: 'essence',
    name: 'Essence',
    subtitle: 'Atmosphere',
    icon: Leaf,
    description: 'Sense through flavor & aroma',
    explanation: 'Smell and taste are our most memory-laden senses. The Essence Lens taps into olfactory and gustatory metaphors—fresh, stale, sweet, bitter—to access emotional qualities that are hard to verbalize but deeply felt.',
    neuroscience: 'Smell has a fairly direct line to the hippocampus (memory) and amygdala (emotion), which is part of why a scent can bring a feeling back before you consciously place it.',
    color: 'from-green-500/20 to-emerald-500/20',
    iconColor: 'text-green-400',
  },
  {
    id: 'movement',
    name: 'Movement',
    subtitle: 'Kinesthesia',
    icon: TrendingUp,
    description: 'Discover through flow & momentum',
    explanation: 'Energy moves. The Movement Lens maps emotional states as directional forces—rising, falling, stuck, flowing—perfect for those who experience emotions as physical energies or who think kinesthetically.',
    neuroscience: "Movement engages the motor cortex and proprioceptive awareness in the cerebellum — the body's sense of its own position and motion in space.",
    color: 'from-amber-500/20 to-yellow-500/20',
    iconColor: 'text-amber-400',
  },
  {
    id: 'insight',
    name: 'Pattern',
    subtitle: 'Noesis',
    icon: Lightbulb,
    description: 'Understand through pattern & connection',
    explanation: 'Some of us process emotions as patterns and connections. The Pattern Lens uses metacognition—thinking about thinking—to help analytical minds recognize emotional patterns through conceptual frameworks rather than direct sensation.',
    neuroscience: 'Reflection like this draws on the prefrontal cortex (executive function) and the default mode network — the same circuitry involved in stepping back and reframing a situation.',
    color: 'from-cyan-500/20 to-blue-500/20',
    iconColor: 'text-cyan-400',
  },
  // The seventh and eighth lenses are listed only where they are on (src/lib/lensState.ts). They make no claim about the brain: they say what you do.
  {
    id: 'nature',
    name: 'Nature',
    subtitle: 'The natural world',
    icon: TreePine,
    description: 'Describe it through plants, weather, land and materials',
    explanation: 'Many people find it easier to say how things are by pointing outdoors: a heron standing still, a drizzle, a ridge, something stiff or translucent or flowing. The Nature Lens gives you words for plants and animals, weather and climate, landscapes, and the physical properties of materials, and fills a description in from the words you pick. Nothing in it has a fixed meaning.',
    askNote: 'You pick words from four lists, one list on each card, and you can add words of your own. Each card is optional.',
    color: 'from-green-500/20 to-lime-500/20',
    iconColor: 'text-lime-500',
  },
  {
    id: 'story',
    name: 'Story',
    subtitle: 'A moment, told',
    icon: BookOpen,
    description: 'Tell a moment: where, who, what changes, how it ends',
    explanation: 'A moment is sometimes easier to hold as a short story than as a feeling. The Story Lens asks, one card at a time, where and when it happens, who is in it, what changes and how it ends. It is a way of looking at a moment, not a test and not a treatment, and an unfinished story is a fine answer.',
    askNote: 'You pick words for each part and can write your own. The last card puts them in a few words you can change.',
    color: 'from-orange-500/20 to-rose-500/20',
    iconColor: 'text-orange-500',
  },
];

export default function SixGateways({ onBack }: SixGatewaysProps) {
  const lenses = gateways.filter((g) => activeLenses().includes(g.id as LensId));
  const count = lensCountWord(), Count = count[0].toUpperCase() + count.slice(1);
  return (
    <div className="size-full overflow-auto scroll-container bg-background">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="text-nenya-gold-text hover:text-foreground dark:text-nenya-silver dark:hover:text-nenya-silver-light transition-colors"
        >
          ← Back to About
        </button>
        
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl bg-gradient-to-r from-nenya-gold-dark via-nenya-gold to-nenya-gold-light dark:from-nenya-silver dark:via-yellow-500 dark:to-nenya-silver-light bg-clip-text text-transparent">
            The {Count} Lenses of Inner Knowing
          </h1>
          <p className="text-lg text-muted-foreground">
            Expanding emotional intelligence beyond the visual—because everyone's inner world speaks a different sensory language.
          </p>
        </div>
      </div>

      {/* Philosophy */}
      <Card className="p-6 sm:p-8 bg-gradient-to-br from-nenya-gold/5 to-nenya-gold/10 border-nenya-gold/30 dark:from-nenya-silver/5 dark:to-yellow-500/10 dark:border-nenya-silver/30">
        <h2 className="text-2xl mb-4 text-nenya-gold-text dark:text-nenya-silver">Why {Count} Lenses?</h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            Nenya began with color—the Sight Lens—because visual metaphor is the most universal. But as we engaged with users, we realized: <strong>not everyone processes emotions visually</strong>.
          </p>
          <p>
            Some feel emotions as <strong>sounds</strong> (musicians, auditory thinkers). Others experience them as <strong>textures</strong> or <strong>temperatures</strong> (highly sensitive, trauma survivors). Some sense them as <strong>atmospheric qualities</strong> or <strong>directional forces</strong>. And some process emotions primarily through <strong>pattern recognition</strong> and conceptual frameworks.
          </p>
          <p>
            The {Count} Lenses framework recognizes this sensory diversity. Each lens offers a different way of looking at the same feeling, grounded in NVC+—meeting you where your neurology already lives, rather than forcing you to translate into a language that doesn't fit.
          </p>
          <p>
            <strong>You pick up a lens, look, and decide.</strong> Open any lens, in any order, as many or as few as you like. Choosing fewer can be more helpful than choosing many, so Nenya asks you to stop and think before a fourth choice on one card, and never stops you. The main choice and two sliders come first; extra words and your own description wait under “More descriptions”. Nothing goes into your report until you press “Add this to my report”. If you only looked through a lens, you can put it down, and the report says so in one plain line: “Examined, not included”.
          </p>
          <p className="text-sm italic">
            <strong>Mirror, not Oracle:</strong> We don't tell you what your emotions mean. We offer sensory pathways to help you discover what's already there.
          </p>
        </div>
      </Card>

      {/* The Gateways */}
      <div className="space-y-8">
        <h2 className="text-2xl text-center">The Lenses</h2>
        
        <div className="grid gap-6">
          {lenses.map((gateway) => {
            const Icon = gateway.icon;
            return (
              <Card 
                key={gateway.id} 
                className={`relative overflow-hidden p-6 sm:p-8 border-2 transition-all duration-300 hover:scale-[1.02]`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${gateway.color} opacity-30`} />
                
                <div className="relative space-y-4">
                  <div className="flex items-start gap-4">
                    <Icon className={`size-10 sm:size-12 ${gateway.iconColor} flex-shrink-0`} />
                    <div className="flex-1">
                      <div className="flex items-baseline gap-3 mb-1">
                        <h3 className="text-xl sm:text-2xl">{gateway.name}</h3>
                        <span className="text-sm text-muted-foreground italic">{gateway.subtitle}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{gateway.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <p className="leading-relaxed">{gateway.explanation}</p>
                    
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        {'neuroscience' in gateway ? <><strong className="text-foreground">Neuroscience:</strong> {gateway.neuroscience}</> : <><strong className="text-foreground">What you do:</strong> {gateway.askNote}</>}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Current Status */}
      <Card className="p-6 sm:p-8 border-nenya-gold/20 dark:border-nenya-silver/20">
        <h2 className="text-2xl mb-4">Development Status</h2>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">What exists today:</strong> All {count} lenses work as self-directed reflection, in any order and any number. What you choose to add stays in your browser and can be turned into a downloadable report, or saved on your own device for up to 24 hours, locked with your passcode. A lens you only looked through stays out of the report. When you are ready, you can optionally continue to an early coach demo: a short, five-exchange conversation with an AI that runs on an outside service (Venice AI). It is a prototype, not therapy, and it is the only part of Nenya that sends what you type to an AI.
          </p>
          <p>
            <strong className="text-foreground">Two optional activities:</strong> a tapestry, where you layer patterns one at a time (in Pattern), and a path of movement, which you draw or build with direction buttons and can watch move (in Movement). Each adds words to your report, and a small picture to the PDF; the coach reads words only.
          </p>
          <p>
            <strong className="text-foreground">What we hope to build:</strong> A fuller NVC+ reflection companion that works with what you enter in each lens, running on your own device rather than in the cloud, with stronger safety and privacy protections than the demo has. None of that exists yet. We're building iteratively based on user needs and feedback.
          </p>
          <p className="text-xs italic">
            <strong className="text-nenya-gold-text dark:text-nenya-silver">Accessibility Note:</strong> These lenses aren't just about preference—they're about <strong>access</strong>. For blind users, the Sight Lens is useless. For Deaf users, Sound may be secondary. We're building true multi-modal access to emotional intelligence.
          </p>
        </div>
      </Card>
      </div>

      <AppFooter />
    </div>
  );
}
