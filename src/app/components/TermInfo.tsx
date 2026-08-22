import { useState } from 'react';
import { Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { motion } from 'motion/react';

interface TermInfoProps {
  term: string;
  category: 'timbre' | 'rhythm' | 'taste' | 'scent' | 'pattern' | 'perspective' | 'direction' | 'quality' | 'lightQuality';
}

// Term information database - context-aware for duplicate terms
const lightQualityData: Record<string, {
  description: string;
  visual?: 'animation' | 'image' | 'demo';
}> = {
  'Steady': {
    description: 'Constant, unchanging light that remains stable over time, like a lamp or steady sunlight. This quality suggests reliability and consistency.',
    visual: 'animation',
  },
  'Pulsing': {
    description: 'Light that rhythmically brightens and dims, like a heartbeat or breathing. This creates waves of intensity, suggesting life and rhythm.',
    visual: 'animation',
  },
  'Flickering': {
    description: 'Rapid, irregular variations in brightness, like a candle flame in a breeze or faulty bulb. This creates unstable, unpredictable light suggesting uncertainty or restlessness.',
    visual: 'animation',
  },
  'Glowing': {
    description: 'Soft, diffused radiance that seems to emanate from within, like embers, bioluminescence, or a gentle aura. Suggests inner warmth and presence.',
    visual: 'animation',
  },
  'Shimmering': {
    description: 'Sparkling, wavering light quality with dancing highlights, like light reflecting on water or heat waves rising from pavement. Suggests movement and vitality.',
    visual: 'animation',
  },
  'Radiating': {
    description: 'Light spreading outward from a central point in all directions, like sun rays breaking through clouds or a lighthouse beam. Suggests expansion and influence.',
    visual: 'animation',
  },
  'Fading': {
    description: 'Gradually diminishing in brightness, like sunset or dying embers, moving from light toward darkness. Suggests release, letting go, or ending.',
    visual: 'animation',
  },
  'Intensifying': {
    description: 'Progressively growing brighter and stronger, like sunrise or an increasing spotlight. This builds in power and suggests growth or approaching clarity.',
    visual: 'animation',
  },
};

const rhythmData: Record<string, {
  description: string;
}> = {
  'Steady': {
    description: 'A consistent, unchanging beat, like a metronome or heartbeat at rest.',
  },
  'Syncopated': {
    description: 'Off-beat accents that create unexpected emphasis, like jazz or funk rhythms.',
  },
  'Flowing': {
    description: 'Smooth, continuous movement without clear beats, like a river or gentle breeze.',
  },
  'Staccato': {
    description: 'Short, sharp, detached sounds with clear separation between them.',
  },
  'Irregular': {
    description: 'Unpredictable timing with no consistent pattern, like rainfall or scattered thoughts.',
  },
  'Pulsing': {
    description: 'Rhythmic waves that build and fade, like a throbbing heartbeat or breathing.',
  },
  'Languid': {
    description: 'Slow, relaxed, drawn-out timing, like lazy summer days or drowsiness.',
  },
  'Urgent': {
    description: 'Fast, pressing, insistent rhythm that demands attention, like an alarm or racing pulse.',
  },
};

const termData: Record<string, {
  description: string;
}> = {
  // Sound - Timbres
  'Resonant': {
    description: 'A rich, full sound that seems to vibrate and linger in space, like a bell or deep voice.',
  },
  'Hollow': {
    description: 'An empty, echoing quality, like sound traveling through a tunnel or empty space.',
  },
  'Bright': {
    description: 'Clear, sharp tones with high-frequency energy, like a piccolo or ringing chime.',
  },
  'Warm': {
    description: 'Soft, rounded tones with lower frequencies, like a cello or gentle voice.',
  },
  'Metallic': {
    description: 'Sharp, hard tones with a reflective quality, like striking metal or a triangle.',
  },
  'Breathy': {
    description: 'Airy, soft sounds with audible breath, like a flute or whisper.',
  },
  'Rich': {
    description: 'Complex, layered sounds with many harmonics, like an orchestra or full choir.',
  },
  'Thin': {
    description: 'Light, sparse sounds with few overtones, like a single high note or whistle.',
  },

  // Essence - Tastes
  'Bitter': {
    description: 'Sharp, acrid taste that can be unpleasant or cleansing, like coffee or dark greens.',
  },
  'Sweet': {
    description: 'Pleasant, sugary taste associated with comfort and reward, like honey or ripe fruit.',
  },
  'Sour': {
    description: 'Tart, acidic taste that makes you pucker, like lemon or vinegar.',
  },
  'Salty': {
    description: 'Mineral, briny taste that enhances other flavors, like ocean water or tears.',
  },
  'Umami': {
    description: 'Savory, meaty, deeply satisfying taste, like mushrooms or aged cheese.',
  },
  'Astringent': {
    description: 'Drying, puckering sensation that tightens the mouth, like strong tea or unripe banana.',
  },
  'Pungent': {
    description: 'Strong, sharp, penetrating taste, like garlic, onion, or horseradish.',
  },

  // Essence - Scents
  'Earthy': {
    description: 'Soil-like, grounded aroma, like rain on dirt or mushrooms.',
  },
  'Floral': {
    description: 'Sweet, delicate flower fragrances, like roses or jasmine.',
  },
  'Citrus': {
    description: 'Bright, tangy, uplifting scents, like lemon, orange, or grapefruit.',
  },
  'Woody': {
    description: 'Rich, warm tree aromas, like cedar, sandalwood, or pine.',
  },
  'Smoky': {
    description: 'Burnt, campfire-like scent with depth and complexity.',
  },
  'Musky': {
    description: 'Deep, animalistic, earthy scent with a lingering quality.',
  },
  'Fresh': {
    description: 'Clean, crisp, invigorating scent, like mint or freshly cut grass.',
  },
  'Spicy': {
    description: 'Warm, sharp, tingling aromas, like cinnamon, pepper, or ginger.',
  },
  'Sharp': {
    description: 'Penetrating, intense scent that demands attention, like ammonia or vinegar.',
  },
  'Herbal': {
    description: 'Green, medicinal plant scents, like sage, basil, or thyme.',
  },
  'Ocean': {
    description: 'Salty, breezy, aquatic scent that evokes the sea.',
  },

  // Insight - Patterns
  'Fragmented': {
    description: 'Broken into disconnected pieces, like shattered glass. Your thinking feels scattered with gaps between ideas.',
  },
  'Linear': {
    description: 'Straight-line progression from A to B to C. Like following a single clear path or timeline.',
  },
  'Branching': {
    description: 'One main idea that splits into multiple directions, like a tree. You see options diverging from a central point.',
  },
  'Circular': {
    description: 'Thoughts that loop back to where they started, like a cycle. You keep returning to the same themes.',
  },
  'Layered': {
    description: 'Multiple levels of understanding stacked on top of each other, like geological strata. Depth upon depth.',
  },
  'Web-like': {
    description: 'Everything connects to everything else in a network, like a spider web. No single central point.',
  },
  'Crystalline': {
    description: 'Clear, geometric, symmetrical structure with internal order, like a crystal lattice. Precise and organized.',
  },
  'Fractal': {
    description: 'The same pattern repeats at different scales, like a fern or coastline. Small mirrors large.',
  },
  'Spiraling': {
    description: 'Circular motion that also moves forward or deeper, like a nautilus shell. Progressive cycles that advance with each revolution.',
  },
  'Chaotic': {
    description: 'No apparent order or structure, like turbulent water. Unpredictable and seemingly random.',
  },
  'Unified': {
    description: 'All parts integrated into one coherent whole, like a sphere. Complete and undivided.',
  },

  // Insight - Perspectives (Camera Lens Framework)
  'Narrow': {
    description: 'Like a telephoto lens zoomed in tight - you see one small area in detail but miss the surroundings. Tunnel vision.',
  },
  'Focused': {
    description: 'Like a 50mm lens with shallow depth of field - one subject sharp and clear while everything else blurs. Selective attention.',
  },
  'Panoramic': {
    description: 'Like an ultra-wide angle lens - you see the full sweep of the landscape. Broad view but less detail.',
  },
  'Microscopic': {
    description: 'Like a macro lens - you see tiny details invisible to the naked eye. Deep examination of small things.',
  },
  'Telescopic': {
    description: 'Like a telephoto lens on distant objects - you see far-away things brought close. Long-range vision.',
  },
  'Multi-faceted': {
    description: 'Like looking through a fly\'s compound eye or using multiple cameras - many simultaneous viewpoints creating a mosaic.',
  },
  "Bird's Eye": {
    description: 'Like an aerial drone camera - looking down from above to see patterns and relationships. Elevated overview.',
  },
  'Immersed': {
    description: 'Like a GoPro mounted to your body - you\'re inside the experience, not observing from outside. First-person view.',
  },

  // Movement - Directions
  'Upward': {
    description: 'Rising, lifting, ascending movement. Like smoke, bubbles, or growing plants.',
  },
  'Downward': {
    description: 'Sinking, falling, descending movement. Like rain, leaves falling, or settling.',
  },
  'Inward': {
    description: 'Drawing toward the center, like a whirlpool or taking a breath in.',
  },
  'Outward': {
    description: 'Radiating from center to edges, like ripples on water or exhaling.',
  },
  'Expansive': {
    description: 'Growing larger in all directions, like a balloon inflating or sunrise spreading.',
  },
  'Contracting': {
    description: 'Shrinking, compressing, closing in, like a closing fist or sunset fading.',
  },
  'Oscillating': {
    description: 'Back and forth movement between two points, like a pendulum or breathing.',
  },
  'Flowing': {
    description: 'Smooth, continuous movement without resistance, like a river or gentle breeze.',
  },
  'Stuck': {
    description: 'Blocked, immobile, unable to move despite wanting to. Like being frozen or trapped.',
  },
  'Still': {
    description: 'Peaceful, intentional lack of movement. Like a calm pond or meditation.',
  },

  // Movement - Qualities
  'Fluid': {
    description: 'Smooth, liquid-like movement without resistance, like water flowing.',
  },
  'Jerky': {
    description: 'Sudden, irregular, stop-start movement, like a skipping record or stuttering.',
  },
  'Graceful': {
    description: 'Elegant, effortless, beautiful movement, like dance or gliding.',
  },
  'Forceful': {
    description: 'Powerful, strong, assertive movement that overcomes obstacles.',
  },
  'Hesitant': {
    description: 'Uncertain, tentative, cautious movement, like testing thin ice.',
  },
  'Determined': {
    description: 'Steady, resolved, purposeful movement toward a goal.',
  },
  'Gentle': {
    description: 'Soft, tender, careful movement, like a feather falling or careful touch.',
  },
  'Turbulent': {
    description: 'Chaotic, churning, stormy movement, like rapids or violent weather.',
  },
};

function VisualDemo({ term, category }: { term: string; category: string }) {
  // Get data from the correct source based on category
  let data;
  if (category === 'lightQuality') {
    data = lightQualityData[term];
  } else if (category === 'rhythm') {
    data = rhythmData[term];
  } else {
    data = termData[term];
  }
  
  if (!data || !data.visual) return null;

  // ONLY the SIGHT gateway gets actual animations
  if (category === 'lightQuality') {
    if (term === 'Steady') {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="w-24 h-24 rounded-full bg-primary" />
        </div>
      );
    } else if (term === 'Pulsing') {
      return (
        <div className="flex justify-center items-center py-8">
          <motion.div
            className="w-24 h-24 rounded-full bg-primary"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      );
    } else if (term === 'Flickering') {
      return (
        <div className="flex justify-center items-center py-8">
          <motion.div
            className="w-24 h-24 rounded-full bg-primary"
            animate={{
              opacity: [1, 0.3, 0.8, 0.4, 1, 0.6, 0.9, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              times: [0, 0.1, 0.2, 0.35, 0.5, 0.65, 0.8, 1],
            }}
          />
        </div>
      );
    } else if (term === 'Glowing') {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="relative">
            <motion.div
              className="absolute inset-0 w-24 h-24 rounded-full bg-primary blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <div className="w-24 h-24 rounded-full bg-primary" />
          </div>
        </div>
      );
    } else if (term === 'Shimmering') {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="relative w-24 h-24 rounded-full bg-primary overflow-hidden">
            <motion.div
              className="absolute inset-0 w-full h-full"
              style={{
                background: 'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
              }}
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>
        </div>
      );
    } else if (term === 'Radiating') {
      return (
        <div className="flex justify-center items-center py-8 overflow-hidden">
          <div className="relative w-24 h-24">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 border-2 border-primary rounded-full"
                style={{ rotate: i * 45 }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{
                  scale: [0, 2],
                  opacity: [1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-primary" />
            </div>
          </div>
        </div>
      );
    } else if (term === 'Fading') {
      return (
        <div className="flex justify-center items-center py-8">
          <motion.div
            className="w-24 h-24 rounded-full bg-primary"
            animate={{
              opacity: [1, 0.2],
              scale: [1, 0.9],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        </div>
      );
    } else if (term === 'Intensifying') {
      return (
        <div className="flex justify-center items-center py-8">
          <motion.div
            className="w-24 h-24 rounded-full bg-primary"
            animate={{
              opacity: [0.2, 1],
              scale: [0.9, 1.1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeIn',
            }}
          />
        </div>
      );
    }
  }

  // All other gateways get placeholder images only
  if (data.visual === 'image') {
    return (
      <div className="bg-muted/30 rounded-lg p-8 text-center">
        <div className="text-4xl mb-2">🖼️</div>
        <p className="text-sm text-muted-foreground">
          Visual demonstration placeholder
        </p>
      </div>
    );
  }

  return null;
}

export function TermInfo({ term, category }: TermInfoProps) {
  const [open, setOpen] = useState(false);
  
  // Get data from the correct source based on category
  let data;
  if (category === 'lightQuality') {
    data = lightQualityData[term];
  } else if (category === 'rhythm') {
    data = rhythmData[term];
  } else {
    data = termData[term];
  }

  if (!data) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="size-5 p-0 hover:bg-primary/10"
        onClick={() => setOpen(true)}
      >
        <Info className="size-3.5 text-muted-foreground hover:text-primary" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{term}</DialogTitle>
            <DialogDescription>
              Understanding this sensory quality
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Description */}
            <div>
              <h4 className="text-sm font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {data.description}
              </p>
            </div>

            {/* Visual Demo - only for Sight gateway light qualities */}
            {category === 'lightQuality' && data.visual && (
              <div>
                <h4 className="text-sm font-medium mb-3">Visual Example</h4>
                <VisualDemo term={term} category={category} />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}