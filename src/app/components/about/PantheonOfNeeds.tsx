import * as m from 'motion/react-m';
import { useState, RefObject } from 'react';
import { ChevronDown, ChevronUp, User, Users } from 'lucide-react';
import { valarColors } from '../ValarBreathingLogo';
import { ScrollIndicator } from '../ScrollIndicator';

interface PantheonOfNeedsProps {
  /** The ancestor scroll container that actually scrolls this page (this
   *  component doesn't own its own scroll wrapper -- its parent, AboutNenya,
   *  does). Passed through to ScrollIndicator so it detects and scrolls the
   *  real scrolling element instead of falling back to the window, which
   *  never scrolls in this layout. */
  containerRef?: RefObject<HTMLElement>;
}

interface ArchetypeData {
  id: string;
  name: string;
  title: string;
  colorVector: string[];
  individualFocus: string;
  communalFocus: string;
  domain: string;
  individualNeed: string;
  communalNeed: string;
  interconnectedWith: string[];
  section: 'cosmic' | 'creative' | 'embodied' | 'dynamic' | 'weavers' | 'shadow';
}

// The sixteen archetypes, with extended descriptions (the internal ids and the colour data keep their older names; the names shown are the outward ones)
const archetypeData: ArchetypeData[] = [
  {
    id: 'craft',
    name: 'Craft',
    title: 'Making and mastery',
    colorVector: valarColors[4].vector,
    individualFocus: valarColors[4].individualFocus,
    communalFocus: valarColors[4].communalFocus,
    domain: 'Structure, Competence, & The Material Foundation',
    individualNeed: 'The need for tangible self-efficacy, to master a craft or skill, and to create stable, reliable personal structure and order.',
    communalNeed: 'The need for robust, ethical infrastructure, economic stability based on skilled creation, and the transmission of practical knowledge across generations.',
    interconnectedWith: ['Sky (Law)', 'Greenwood (Material)'],
    section: 'creative'
  },
  {
    id: 'greenwood',
    name: 'Greenwood',
    title: 'Nourishment and growth',
    colorVector: valarColors[5].vector,
    individualFocus: valarColors[5].individualFocus,
    communalFocus: valarColors[5].communalFocus,
    domain: 'Nourishment, Growth, & Ecosystemic Stewardship',
    individualNeed: 'The need for holistic sustenance (physical, mental, spiritual), connection to the body and the wild, and to experience visible, continuous personal growth and vitality.',
    communalNeed: 'The fundamental need for food sovereignty and security, ecological balance and conservation, and the collective adoption of interdependent practices that sustain the whole web of life.',
    interconnectedWith: ['Craft (Foundation)', 'Tide (Life Flow)'],
    section: 'creative'
  },
  {
    id: 'haven',
    name: 'Haven',
    title: 'Rest and sanctuary',
    colorVector: valarColors[13].vector,
    individualFocus: valarColors[13].individualFocus,
    communalFocus: valarColors[13].communalFocus,
    domain: 'Restoration, Sanctuary, & Deep Peace',
    individualNeed: 'The need for stillness, deep restorative rest, and a psychological sanctuary for healing from depletion or trauma.',
    communalNeed: 'The need for accessible, non-transactional care, safe collective spaces for retreat, and cultural norms that value presence and the regenerative cycle of rest.',
    interconnectedWith: ['Soft Rain (Healing)', 'Reverie (Dreams)'],
    section: 'embodied'
  },
  {
    id: 'stride',
    name: 'Stride',
    title: 'Action and boundaries',
    colorVector: valarColors[9].vector,
    individualFocus: valarColors[9].individualFocus,
    communalFocus: valarColors[9].communalFocus,
    domain: 'Action, Ethical Defense, & Boundary',
    individualNeed: 'The need for courageous, grounded action, to establish and defend personal boundaries, and to engage with reality with vigor and presence.',
    communalNeed: 'The need for swift, protective intervention against harm, the courage to challenge systemic oppression, and the collective commitment to ethical defense and the safety of the vulnerable.',
    interconnectedWith: ['Craft (Foundation)', 'Sky (Justice)'],
    section: 'dynamic'
  },
  {
    id: 'tide',
    name: 'Tide',
    title: 'Flow and intuition',
    colorVector: valarColors[2].vector,
    individualFocus: valarColors[2].individualFocus,
    communalFocus: valarColors[2].communalFocus,
    domain: 'Flow, Systemic Connection, & Deep Intuition',
    individualNeed: 'The need for unimpeded emotional movement and process, to access the deep, subtle currents of subconscious wisdom, and to feel fluidity in one\'s life choices.',
    communalNeed: 'The need for the uninterrupted flow of vital resources and communication, collective emotional processing, and the empathetic bond that connects all members of the system.',
    interconnectedWith: ['Soft Rain (Grief)', 'Greenwood (Flow)'],
    section: 'cosmic'
  },
  {
    id: 'soft-rain',
    name: 'Soft Rain',
    title: 'Grief and mercy',
    colorVector: valarColors[3].vector,
    individualFocus: valarColors[3].individualFocus,
    communalFocus: valarColors[3].communalFocus,
    domain: 'Grief, Transmutation of Suffering, & Compassion',
    individualNeed: 'The need for the safe release and processing of deep sorrow and loss, to find the wisdom inherent in pain, and to cultivate unconditional self-compassion.',
    communalNeed: 'The need for restorative processes that heal systemic harm, shared rituals of mourning and acknowledgment, and the radical inclusion of all suffering within the collective heart.',
    interconnectedWith: ['Haven (Calm)', 'Tide (Deep Process)'],
    section: 'creative'
  },
  {
    id: 'reverie',
    name: 'Reverie',
    title: 'Imagination and vision',
    colorVector: valarColors[12].vector,
    individualFocus: valarColors[12].individualFocus,
    communalFocus: valarColors[12].communalFocus,
    domain: 'Imagination, Shared Myth, & Creative Expression',
    individualNeed: 'The need for creative flow, the exploration of inner landscapes (dreams and visions), and the playful freedom necessary to imagine possibilities beyond the present reality.',
    communalNeed: 'The need for the arts as public infrastructure, the formation of shared, inspiring cultural myths, and collective spaces for visioning and generating a new future.',
    interconnectedWith: ['Starlight (Truth)', 'Blossom (Joy)'],
    section: 'embodied'
  },
  {
    id: 'tapestry',
    name: 'Tapestry',
    title: 'Memory and story',
    colorVector: valarColors[8].vector,
    individualFocus: valarColors[8].individualFocus,
    communalFocus: valarColors[8].communalFocus,
    domain: 'Memory, Story, & The Tapestry of Time',
    individualNeed: 'The need to understand one\'s own story, to weave meaning from experience, and to know that one\'s life has been witnessed and recorded as sacred.',
    communalNeed: 'The need for collective memory and history, the honoring of all stories, and the acknowledgment that every thread in the tapestry matters.',
    interconnectedWith: ['Soft Rain (Wisdom)', 'Sky (Perspective)'],
    section: 'weavers'
  },
  {
    id: 'sky',
    name: 'Sky',
    title: 'Perspective and clarity',
    colorVector: valarColors[0].vector,
    individualFocus: valarColors[0].individualFocus,
    communalFocus: valarColors[0].communalFocus,
    domain: 'Perspective, Systemic Clarity, & Governance',
    individualNeed: 'The need for unclouded insight into one\'s own truth and path, to rise above immediate conflicts, and to establish personal sovereignty with clear ethical boundaries.',
    communalNeed: 'The need for just and adaptive systems, truthful public communication, and the collective ability to hold a holistic vision for the common good.',
    interconnectedWith: ['Starlight (Clarity)', 'Craft (Law)'],
    section: 'cosmic'
  },
  {
    id: 'starlight',
    name: 'Starlight',
    title: 'Hope and worth',
    colorVector: valarColors[1].vector,
    individualFocus: valarColors[1].individualFocus,
    communalFocus: valarColors[1].communalFocus,
    domain: 'Hope, Illumination, & Sacred Worth',
    individualNeed: 'The need to feel inherent worth, to be a source of light and inspiration, and to connect with a sense of guiding purpose.',
    communalNeed: 'The need for shared, luminous narratives that inspire action, the preservation of sacred knowledge and beauty, and the collective witness that confirms the worth of all beings.',
    interconnectedWith: ['Sky (Vision)', 'Reverie (Shared Myth)'],
    section: 'cosmic'
  },
  {
    id: 'ember',
    name: 'Ember',
    title: 'Strength and vitality',
    colorVector: valarColors[10].vector,
    individualFocus: valarColors[10].individualFocus,
    communalFocus: valarColors[10].communalFocus,
    domain: 'Strength, Vitality, & Uncomplicated Power',
    individualNeed: 'The need to feel physically strong and capable, to meet challenges with confidence, and to express power without apology or manipulation.',
    communalNeed: 'The need for collective resilience, the celebration of embodied strength, and the willingness to use force ethically in defense of life.',
    interconnectedWith: ['Stride (Action)', 'Rhythm (Energy)'],
    section: 'dynamic'
  },
  {
    id: 'rhythm',
    name: 'Rhythm',
    title: 'Movement and joy',
    colorVector: valarColors[11].vector,
    individualFocus: valarColors[11].individualFocus,
    communalFocus: valarColors[11].communalFocus,
    domain: 'Joy, Rhythm, & Movement',
    individualNeed: 'The need for play, for celebration, for dance, for rhythm, for sensual pleasure and uncomplicated happiness. The divine energy of life itself, celebrating its own existence through you.',
    communalNeed: 'The need for communal celebration, rhythmic expression, and the collective permission to move, dance, and embody joy without purpose beyond the joy itself.',
    interconnectedWith: ['Ember (Vitality)', 'Blossom (Delight)'],
    section: 'dynamic'
  },
  {
    id: 'cinder',
    name: 'Cinder',
    title: 'Power and sovereignty',
    colorVector: valarColors[14].vector,
    individualFocus: valarColors[14].individualFocus,
    communalFocus: valarColors[14].communalFocus,
    domain: 'Power, Sovereignty, & The Will to Be',
    individualNeed: 'The need for authentic, radical self-expression, to claim one\'s full power, and to stand in sovereign "I Am" presence without dilution or apology.',
    communalNeed: 'The recognition of legitimate power needs, the transformation of dominance into shared empowerment, and the healing of power wounds.',
    interconnectedWith: ['Sky (Balance)', 'Soft Rain (Transformation)'],
    section: 'shadow'
  },
  {
    id: 'hollow',
    name: 'Hollow',
    title: 'Power turned destructive',
    colorVector: valarColors[15].vector,
    individualFocus: valarColors[15].individualFocus,
    communalFocus: valarColors[15].communalFocus,
    domain: 'Corruption, Domination, & The Will to Break',
    individualNeed: 'When the need for power twists into the urge to control, dominate, or destroy, it often signals real pain underneath — something that calls for compassion, not just judgment.',
    communalNeed: 'The collective responsibility to recognize and redirect destructive patterns, providing pathways to healing rather than judgment or abandonment.',
    interconnectedWith: ['Haven (Healing)', 'Soft Rain (Compassion)'],
    section: 'shadow'
  },
  {
    id: 'blossom',
    name: 'Blossom',
    title: 'Delight and bloom',
    colorVector: valarColors[6].vector,
    individualFocus: valarColors[6].individualFocus,
    communalFocus: valarColors[6].communalFocus,
    domain: 'Joy, Beauty, & Vibrant Life',
    individualNeed: 'The need for unabashed delight, the celebration of beauty in all forms, and the freedom to bloom into one\'s fullest, most radiant expression.',
    communalNeed: 'The need for shared celebration, the cultivation of beauty in public spaces, and cultural permission for joy and sensual pleasure as sacred acts.',
    interconnectedWith: ['Reverie (Creativity)', 'Rhythm (Movement)'],
    section: 'embodied'
  },
  {
    id: 'twilight',
    name: 'Twilight',
    title: 'Endings and truth',
    colorVector: valarColors[7].vector,
    individualFocus: valarColors[7].individualFocus,
    communalFocus: valarColors[7].communalFocus,
    domain: 'Endings, Truth, & The Weight of Consequence',
    individualNeed: 'The need to face unavoidable truths, to accept the reality of endings and limitations, and to carry the weight of one\'s choices with dignity and integrity.',
    communalNeed: 'The need for accountability systems rooted in restorative justice, collective acknowledgment of historical harm, and the wisdom that comes from bearing witness to all stories—including those that end in tragedy.',
    interconnectedWith: ['Tapestry (Memory)', 'Soft Rain (Grief)'],
    section: 'weavers'
  },
];

// Helper function to determine if text should be white for a given color
function shouldUseWhiteText(hexColor: string): boolean {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

function ArchetypeCard({ archetype, isExpanded, onToggle }: { 
  archetype: ArchetypeData; 
  isExpanded: boolean; 
  onToggle: () => void;
}) {
  // Use the first color (Gravity Well) as the primary color
  const primaryColor = archetype.colorVector[0];
  const useWhiteText = shouldUseWhiteText(primaryColor);

  return (
    <m.div
      className="border rounded-lg overflow-hidden bg-card dark:bg-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header with gradient from all 6 colors */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left transition-all hover:opacity-90"
        style={{
          background: `linear-gradient(135deg, ${archetype.colorVector.join(', ')})`,
          color: useWhiteText ? '#FFFFFF' : '#000000',
        }}
      >
        <div className="flex-1">
          <h3 className="font-semibold" style={{ color: useWhiteText ? '#FFFFFF' : '#000000' }}>
            {archetype.name}
          </h3>
          <p className="text-sm opacity-90" style={{ color: useWhiteText ? '#FFFFFF' : '#000000' }}>
            {archetype.title} • {archetype.domain}
          </p>
        </div>
        {isExpanded ? (
          <ChevronUp className="size-5 flex-shrink-0 ml-2" style={{ color: useWhiteText ? '#FFFFFF' : '#000000' }} />
        ) : (
          <ChevronDown className="size-5 flex-shrink-0 ml-2" style={{ color: useWhiteText ? '#FFFFFF' : '#000000' }} />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-6 space-y-6 bg-background dark:bg-background">
          {/* Color Vector Display */}
          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">The palette (main color first)</h4>
            <div className="flex gap-2">
              {archetype.colorVector.map((color, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div 
                    className="size-10 rounded-md border border-border shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                  <span className="text-xs text-muted-foreground font-mono">{idx + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Individual Focus */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="size-4 text-muted-foreground" />
              <h4 className="font-medium">Individual Focus (The Self)</h4>
            </div>
            <p className="text-sm text-muted-foreground italic">{archetype.individualFocus}</p>
            <p className="text-sm">{archetype.individualNeed}</p>
          </div>

          {/* Communal Focus */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              <h4 className="font-medium">Communal Focus (The System)</h4>
            </div>
            <p className="text-sm text-muted-foreground italic">{archetype.communalFocus}</p>
            <p className="text-sm">{archetype.communalNeed}</p>
          </div>

          {/* Interconnections */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              <strong>Interconnected with:</strong> {archetype.interconnectedWith.join(' • ')}
            </p>
          </div>
        </div>
      )}
    </m.div>
  );
}

export default function PantheonOfNeeds({ containerRef }: PantheonOfNeedsProps) {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCard = (id: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  };

  const sections = [
    { id: 'cosmic', title: 'The Cosmic & Sovereign Triad', description: 'Perspective, clarity, and the capacity to witness the whole' },
    { id: 'creative', title: 'The Creative & Sustaining Triad', description: 'Structure, nourishment, and transformation through grief' },
    { id: 'embodied', title: 'The Embodied & Vital Triad', description: 'Rest, imagination, and the flourishing of beauty' },
    { id: 'dynamic', title: 'The Dynamic & Protective Triad', description: 'Action, strength, and embodied joy' },
    { id: 'weavers', title: 'The Keepers of Time', description: 'Memory, meaning, and the weight of consequence' },
    { id: 'shadow', title: 'The Shadow & Integration Archetypes', description: 'Power, sovereignty, and the recognition of pain' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-center">The Pantheon of Needs</h1>
          <p className="text-center text-muted-foreground">
            16 archetypal energies bridging individual and communal needs, each represented by a 6-color chromatic vector
          </p>
          <div className="bg-muted/50 dark:bg-muted/30 p-4 rounded-lg">
            <p className="text-sm">
              <strong>Dual Focus:</strong> Each archetype holds both an <strong>Individual dimension</strong> (needs of the Self) and a <strong>Communal dimension</strong> (needs of the System). The first color in each palette is its main color; the others are lighter and darker companions to it.
            </p>
          </div>
        </div>

        {/* Sections */}
        {sections.map(section => (
          <div key={section.id} className="space-y-4">
            <div className="border-l-4 pl-4" style={{ borderColor: archetypeData.find(v => v.section === section.id)?.colorVector[0] }}>
              <h2>{section.title}</h2>
              <p className="text-sm text-muted-foreground">{section.description}</p>
            </div>
            <div className="space-y-3">
              {archetypeData
                .filter(archetype => archetype.section === section.id)
                .map(archetype => (
                  <ArchetypeCard
                    key={archetype.id}
                    archetype={archetype}
                    isExpanded={expandedCards.has(archetype.id)}
                    onToggle={() => toggleCard(archetype.id)}
                  />
                ))}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="bg-muted/50 dark:bg-muted/30 p-6 rounded-lg space-y-3">
          <p className="text-sm">
            <strong>Starting points, not a measurement:</strong> The sixteen palettes are simple starting points, offered so you do not have to begin with the whole spectrum. Nothing here calculates, scores or decodes your colors, and no color has a fixed meaning. A color means what it means to you.
          </p>
          <p className="text-sm">
            The breathing animations you see cycle through all 16 archetypes × 6 colors = <strong>96 total color transitions</strong>, creating a continuous, gentle flow through all of the palettes.
          </p>
        </div>
      </div>
      
      {/* Scroll indicator for page scrolling */}
      <ScrollIndicator containerRef={containerRef} />
    </div>
  );
}