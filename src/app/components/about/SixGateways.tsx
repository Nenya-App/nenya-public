import { Eye, Music, Hand, Leaf, TrendingUp, Lightbulb } from 'lucide-react';
import { Card } from '../ui/card';

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
    explanation: 'Visual processing is our dominant sensory pathway. The Sight Gateway uses color psychology and chromesthesia (seeing emotions as colors) to map your inner landscape. Color associations tend to be tied to memory and cultural meaning in ways that are hard to put into words directly.',
    neuroscience: 'Color processing involves the visual cortex and emotional centers in the limbic system — part of why a color can carry a feeling before you consciously name it.',
    color: 'from-blue-500/20 to-purple-500/20',
    iconColor: 'text-blue-400',
  },
  {
    id: 'sound',
    name: 'Sound',
    subtitle: 'Sonesthesia',
    icon: Music,
    description: 'Navigate through rhythm & tone',
    explanation: 'Sound and rhythm directly influence our nervous system. The Sound Gateway translates emotional states into acoustic qualities—frequency, rhythm, tone—allowing those who think in auditory patterns to access their inner experience.',
    neuroscience: 'Sound engages the auditory cortex and rhythmic processing in the cerebellum, which is part of why music and rhythm can shift a mood so directly.',
    color: 'from-purple-500/20 to-pink-500/20',
    iconColor: 'text-purple-400',
  },
  {
    id: 'touch',
    name: 'Touch',
    subtitle: 'Hapthesthesia',
    icon: Hand,
    description: 'Feel through texture & sensation',
    explanation: 'Physical sensation grounds us in the present. The Touch Gateway uses texture, temperature, and haptic metaphors to help those who process emotions somatically—as bodily sensations rather than thoughts or images.',
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
    explanation: 'Smell and taste are our most memory-laden senses. The Essence Gateway taps into olfactory and gustatory metaphors—fresh, stale, sweet, bitter—to access emotional qualities that are hard to verbalize but deeply felt.',
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
    explanation: 'Energy moves. The Movement Gateway maps emotional states as directional forces—rising, falling, stuck, flowing—perfect for those who experience emotions as physical energies or who think kinesthetically.',
    neuroscience: "Movement engages the motor cortex and proprioceptive awareness in the cerebellum — the body's sense of its own position and motion in space.",
    color: 'from-amber-500/20 to-yellow-500/20',
    iconColor: 'text-amber-400',
  },
  {
    id: 'insight',
    name: 'Insight',
    subtitle: 'Noesis',
    icon: Lightbulb,
    description: 'Understand through pattern & connection',
    explanation: 'Some of us process emotions as patterns and connections. The Insight Gateway uses metacognition—thinking about thinking—to help analytical minds recognize emotional patterns through conceptual frameworks rather than direct sensation.',
    neuroscience: 'Reflection like this draws on the prefrontal cortex (executive function) and the default mode network — the same circuitry involved in stepping back and reframing a situation.',
    color: 'from-cyan-500/20 to-blue-500/20',
    iconColor: 'text-cyan-400',
  },
];

export default function SixGateways({ onBack }: SixGatewaysProps) {
  return (
    <div className="size-full overflow-auto scroll-container bg-background">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="text-nenya-gold-dark hover:text-nenya-gold dark:text-nenya-silver dark:hover:text-nenya-silver-light transition-colors"
        >
          ← Back to About
        </button>
        
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl bg-gradient-to-r from-nenya-gold-dark via-nenya-gold to-nenya-gold-light dark:from-nenya-silver dark:via-yellow-500 dark:to-nenya-silver-light bg-clip-text text-transparent">
            The Six Gateways of Inner Knowing
          </h1>
          <p className="text-lg text-muted-foreground">
            Expanding emotional intelligence beyond the visual—because everyone's inner world speaks a different sensory language.
          </p>
        </div>
      </div>

      {/* Philosophy */}
      <Card className="p-6 sm:p-8 bg-gradient-to-br from-nenya-gold/5 to-nenya-gold/10 border-nenya-gold/30 dark:from-nenya-silver/5 dark:to-yellow-500/10 dark:border-nenya-silver/30">
        <h2 className="text-2xl mb-4 text-nenya-gold-dark dark:text-nenya-silver">Why Six Gateways?</h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            Nenya began with color—the Sight Gateway—because visual metaphor is the most universal. But as we engaged with users, we realized: <strong>not everyone processes emotions visually</strong>.
          </p>
          <p>
            Some feel emotions as <strong>sounds</strong> (musicians, auditory thinkers). Others experience them as <strong>textures</strong> or <strong>temperatures</strong> (highly sensitive, trauma survivors). Some sense them as <strong>atmospheric qualities</strong> or <strong>directional forces</strong>. And some process emotions primarily through <strong>pattern recognition</strong> and conceptual frameworks.
          </p>
          <p>
            The Six Gateways framework recognizes this sensory diversity. Each gateway offers a different entry point to the same NVC+ reflection engine—meeting you where your neurology already lives, rather than forcing you to translate into a language that doesn't fit.
          </p>
          <p className="text-sm italic">
            <strong>Mirror, not Oracle:</strong> We don't tell you what your emotions mean. We offer sensory pathways to help you discover what's already there.
          </p>
        </div>
      </Card>

      {/* The Gateways */}
      <div className="space-y-8">
        <h2 className="text-2xl text-center">The Gateways</h2>
        
        <div className="grid gap-6">
          {gateways.map((gateway) => {
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
                    
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">Neuroscience:</strong> {gateway.neuroscience}
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
            <strong className="text-foreground">Prototype Interface:</strong> The <strong className="text-blue-400">Sight Gateway</strong> demonstrates the most complete interface flow, including color selection and pre-scripted dialogue examples. The NVC+ AI assistant is under separate development and not yet integrated.
          </p>
          <p>
            <strong className="text-foreground">In Development:</strong> The other five gateways are currently demonstrative—showing the interface vision and sensory mapping. All gateways will eventually connect to the NVC+ AI reflection engine once it's completed and integrated. We're building these iteratively based on user needs and feedback.
          </p>
          <p className="text-xs italic">
            <strong className="text-nenya-gold-dark dark:text-nenya-silver">Accessibility Note:</strong> These gateways aren't just about preference—they're about <strong>access</strong>. For blind users, the Sight Gateway is useless. For Deaf users, Sound may be secondary. We're building true multi-modal access to emotional intelligence.
          </p>
        </div>
      </Card>
      </div>
    </div>
  );
}
