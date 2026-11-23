import * as m from 'motion/react-m';
import { useState, RefObject, ReactNode } from 'react';
import { ChevronDown, ChevronUp, User, Users } from 'lucide-react';
import { valarColors } from '../ValarBreathingLogo';
import { ScrollIndicator } from '../ScrollIndicator';
import { Cite, ReferenceList, type AboutReference } from './AboutReferences';

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
  individualNeed: ReactNode;
  communalNeed: string;
  interconnectedWith: string[];
  section: 'cosmic' | 'creative' | 'embodied' | 'dynamic' | 'weavers' | 'shadow';
}

const PAGE_ID = 'pantheon';

const PANTHEON_REFS: AboutReference[] = [
  { n: 1, text: "Chen B, Vansteenkiste M, Beyers W, Boone L, Deci E, Van der Kaap-Deeder J, et al. (2014). Basic psychological need satisfaction, need frustration, and need strength across four cultures. Motivation and Emotion.", href: "https://dipot.ulb.ac.be/dspace/bitstream/2013/409773/3/Chen2015.pdf", linkLabel: "Free full text (author manuscript)" },
  { n: 2, text: "Martela F, Sheldon K (2019). Clarifying the Concept of Well-Being: Psychological Need Satisfaction as the Common Core Connecting Eudaimonic and Subjective Well-Being. Review of General Psychology.", href: "https://research.aalto.fi/en/publications/49998c82-03fe-42c0-846a-8bf0cf9c16a8", linkLabel: "Free full text" },
  { n: 3, text: "Doyal L, Gough I (1991). A Theory of Human Need. (book, Macmillan; no free copy, listed as a non-academic source)." },
  { n: 4, text: "Kenrick D, Griskevicius V, Neuberg S, Schaller M (2010). Renovating the Pyramid of Needs. Perspectives on Psychological Science.", href: "https://www.ncbi.nlm.nih.gov/pmc/articles/3161123", linkLabel: "Free full text" },
  { n: 5, text: "Bellis M, Hughes K, Leckenby N, Perkins C, Lowey H (2014). National household survey of adverse childhood experiences and their relationship with resilience to health-harming behaviors in England. BMC Medicine.", href: "https://bmcmedicine.biomedcentral.com/counter/pdf/10.1186/1741-7015-12-72", linkLabel: "Free full text" },
  { n: 6, text: "Fonseka R, Minnis A, Gomez A (2015). Impact of Adverse Childhood Experiences on Intimate Partner Violence Perpetration among Sri Lankan Men. PLOS ONE.", href: "https://journals.plos.org/plosone/article/file?id=10.1371/journal.pone.0136321&type=printable", linkLabel: "Free full text" },
  { n: 7, text: "Miller E, Breslau J, Chung W, Green J, McLaughlin K, Kessler R, et al. (2011). Adverse childhood experiences and risk of physical violence in adolescent dating relationships. Journal of Epidemiology and Community Health.", href: "https://www.ncbi.nlm.nih.gov/pmc/articles/3686487", linkLabel: "Free full text" },
  { n: 8, text: "DeWall C, Twenge J, Gitter S, Baumeister R (2009). It's the thought that counts: The role of hostile cognition in shaping aggressive responses to social exclusion. Journal of Personality and Social Psychology.", href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2775524/", linkLabel: "Free full text" },
  { n: 9, text: "Norton M, Gino F (2014). Rituals alleviate grieving for loved ones, lovers, and lotteries. Journal of Experimental Psychology: General.", href: "http://nrs.harvard.edu/urn-3:HUL.InstRepos:10683152", linkLabel: "Free full text" },
  { n: 10, text: "Hobson N, Schroeder J, Risen J, Xygalatas D, Inzlicht M (2017). The Psychology of Rituals: An Integrative Review and Process-Based Framework. Personality and Social Psychology Review.", href: "https://escholarship.org/content/qt88p7357w/qt88p7357w.pdf?t=pcqaxk", linkLabel: "Free full text" },
  { n: 11, text: "Burrell A, Selman L (2020). How do Funeral Practices Impact Bereaved Relatives' Mental Health, Grief and Bereavement? A Mixed Methods Review with Implications for COVID-19. OMEGA - Journal of Death and Dying.", href: "https://doi.org/10.1177/0030222820941296", linkLabel: "Free full text" },
  { n: 12, text: "Strang H, Sherman L, Mayo-Wilson E, Woods D, Ariel B (2013). Restorative Justice Conferencing (RJC) Using Face-to-Face Meetings of Offenders and Victims: Effects on Offender Recidivism and Victim Satisfaction. A Systematic Review. Campbell Systematic Reviews: Better Evidence for a Better World.", href: "https://doi.org/10.4073/csr.2013.12", linkLabel: "Free full text" },
  { n: 13, text: "Sherman L, Strang H, Mayo-Wilson E, Woods D, Ariel B (2014). Are Restorative Justice Conferences Effective in Reducing Repeat Offending? Findings from a Campbell Systematic Review. Journal of Quantitative Criminology.", href: "https://link.springer.com/content/pdf/10.1007/s10940-014-9222-9.pdf", linkLabel: "Free full text" },
  { n: 14, text: "Nascimento A, Andrade J, de Castro Rodrigues A (2022). The Psychological Impact of Restorative Justice Practices on Victims of Crimes—a Systematic Review. Trauma, Violence, & Abuse.", href: "https://journals.sagepub.com/doi/pdf/10.1177/15248380221082085", linkLabel: "Free full text" },
  { n: 15, text: "Jonauskaite D, Abu-Akel A, Dael N, Oberfeld D, Abdel-Khalek A, Al-Rasheed A, et al. (2020). Universal Patterns in Color-Emotion Associations Are Further Shaped by Linguistic and Geographic Proximity. Psychological Science.", href: "http://intellectum.unisabana.edu.co/bitstreams/bb7fa6db-a6b6-4254-bb5a-f7525047dfaf/download", linkLabel: "Free full text" },
  { n: 16, text: "Elliot A (2015). Color and psychological functioning: a review of theoretical and empirical work. Frontiers in Psychology.", href: "https://www.frontiersin.org/articles/10.3389/fpsyg.2015.00368/pdf", linkLabel: "Free full text" },
  { n: 17, text: "Kawai C, Zhang Y, Lukács G, Chu W, Zheng C, Gao C, et al. (2022). The good, the bad, and the red: implicit color-valence associations across cultures. Psychological Research.", href: "https://link.springer.com/content/pdf/10.1007/s00426-022-01697-5.pdf", linkLabel: "Free full text" },
  { n: 18, text: "Further reading, not counted as support: Baumeister R, Smart L, Boden J (1996). Relation of threatened egotism to violence and aggression: The dark side of high self-esteem. Psychological Review.", href: "https://doi.org/10.1037/0033-295x.103.1.5", linkLabel: "Publisher page (may need payment)" },
  { n: 19, text: "Further reading, not counted as support: Fast N, Chen S (2009). When the Boss Feels Inadequate. Psychological Science.", href: "https://doi.org/10.1111/j.1467-9280.2009.02452.x", linkLabel: "Publisher page (may need payment)" },
  { n: 20, text: "Further reading, not counted as support: Tay L, Diener E (2011). Needs and subjective well-being around the world. Journal of Personality and Social Psychology.", href: "https://doi.org/10.1037/a0023779", linkLabel: "Publisher page (may need payment)" },
];

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
    individualNeed: 'The need for stillness, deep rest, and a place that feels safe enough to recover when you are worn out or hurting.',
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
    domain: 'Action, Protection, & Boundaries',
    individualNeed: 'The need for courageous, grounded action, to set and keep personal boundaries, and to meet what is in front of you with energy and presence.',
    communalNeed: 'The need for people to be kept safe from harm, the courage to speak up about unfair systems, and a shared commitment to the safety of the vulnerable.',
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
    individualNeed: 'The need to let feelings move and be noticed, and to feel free to change course in your choices.',
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
    domain: 'Grief, Comfort, & Compassion',
    individualNeed: 'The need to let sorrow and loss move through you safely, to find some meaning in pain if you can, and to be kind to yourself.',
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
    domain: 'Strength, Vitality, & Energy',
    individualNeed: 'The need to feel physically strong and capable, to meet challenges with confidence, and to use your strength honestly and with care.',
    communalNeed: 'The need for collective resilience, the celebration of embodied strength, and a shared will to keep people safe and protect life without harming others.',
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
    domain: 'Power, Self-Direction, & Being Yourself',
    individualNeed: 'The need for honest self-expression, to feel your own strength, and to stand as yourself without having to shrink.',
    communalNeed: 'The need for a fair say, for power to be shared rather than held over others, and for people who have been shut out to be heard.',
    interconnectedWith: ['Sky (Balance)', 'Soft Rain (Transformation)'],
    section: 'shadow'
  },
  {
    id: 'hollow',
    name: 'Hollow',
    title: 'Control and the hurt beneath it',
    colorVector: valarColors[15].vector,
    individualFocus: valarColors[15].individualFocus,
    communalFocus: valarColors[15].communalFocus,
    domain: 'Control, Hurt, & Wanting Relief',
    individualNeed: (
      <>
        When the need for power turns into an urge to control, dominate, or destroy, there may be pain underneath. Studies link harming others with earlier hurt, such as childhood abuse or being rejected <Cite pageId={PAGE_ID} n={[5, 6, 7, 8]} />. This does not excuse harm. It points to where help may be needed.
      </>
    ),
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
  // Use the first color as the main color
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
            Sixteen archetypes of need. Each has a personal side, a shared side, and a palette of six colors.
          </p>
          <div className="bg-muted/50 dark:bg-muted/30 p-4 rounded-lg">
            <p className="text-sm">
              <strong>Dual Focus:</strong> Each archetype holds both an <strong>Individual dimension</strong> (needs of the Self) and a <strong>Communal dimension</strong> (needs of the System). The first color in each palette is its main color. The others are companion colors, some lighter, some darker, and some in contrast.
            </p>
            <p className="text-sm mt-3">
              This is our own design. It is not a tested scale, and no study shows that needs divide into these sixteen. A few of the sixteen touch themes that researchers have studied, such as competence (Craft) and autonomy (Stride) <Cite pageId={PAGE_ID} n={[1, 2, 3]} />. Researchers do not agree on one list of needs <Cite pageId={PAGE_ID} n={[4, 2, 3]} />.
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

        {/* Where research touches a few of the cards (the About thesis, 2026-11-22) */}
        <div className="space-y-4">
          <div className="border-l-4 border-border pl-4">
            <h2>What research says about a few of the cards</h2>
          </div>
          <p className="text-sm">
            Soft Rain speaks of shared ways to mourn. In experiments, doing a ritual after a loss lowered reported grief, apparently by restoring a sense of control <Cite pageId={PAGE_ID} n={[9, 10]} />. A review of funeral practices found the evidence mixed <Cite pageId={PAGE_ID} n={11} />.
          </p>
          <p className="text-sm">
            Twilight points to restorative justice. In trials with random assignment, meetings between victims and offenders cut repeat crime a little <Cite pageId={PAGE_ID} n={[12, 13]} />. Victims were also more satisfied <Cite pageId={PAGE_ID} n={[12, 14]} />.
          </p>
          <p className="text-sm">
            These notes show where research touches the cards. They do not make the sixteen archetypes a tested set.
          </p>
        </div>

        {/* Footer */}
        <div className="bg-muted/50 dark:bg-muted/30 p-6 rounded-lg space-y-3">
          <p className="text-sm">
            <strong>Starting points, not a measurement:</strong> The sixteen palettes are simple starting points, offered so you do not have to begin with the whole spectrum. Nothing here calculates, scores or decodes your colors. Studies find some color and feeling links that are shared across many countries, and many that differ by place and by person <Cite pageId={PAGE_ID} n={[15, 16, 17]} />. A color means what it means to you here. That is our approach.
          </p>
          <p className="text-sm">
            By default, the breathing animation moves through all sixteen palettes, six colors each. That is <strong>96 colors</strong> in one full cycle.
          </p>
        </div>

        <ReferenceList pageId={PAGE_ID} items={PANTHEON_REFS} />
      </div>
      
      {/* Scroll indicator for page scrolling */}
      <ScrollIndicator containerRef={containerRef} />
    </div>
  );
}