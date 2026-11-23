import type { ReactNode } from 'react';
import { Eye, Music, Hand, Leaf, TrendingUp, Lightbulb } from 'lucide-react';
import { Card } from '../ui/card';
import { AppFooter } from '../AppFooter';
import { Cite, ReferenceList, type AboutReference } from './AboutReferences';

// The numbers in the text match this list (About thesis, chapter 2; docs/about-thesis.md).
const REFERENCES: AboutReference[] = [
  { n: 1, text: "Garfinkel S, Seth A, Barrett A, Suzuki K, Critchley H (2015). Knowing your own heart: Distinguishing interoceptive accuracy from interoceptive awareness. Biological Psychology.", href: "https://www.sciencedirect.com/science/article/pii/S0301051114002294/pdf", linkLabel: "Free full text" },
  { n: 2, text: "Dawes A, Keogh R, Andrillon T, Pearson J (2020). A cognitive profile of multi-sensory imagery, memory and dreaming in aphantasia. Scientific Reports.", href: "https://www.nature.com/articles/s41598-020-65705-7.pdf", linkLabel: "Free full text" },
  { n: 3, text: "Jonauskaite D, Abu-Akel A, Dael N, Oberfeld D, Abdel-Khalek A, Al-Rasheed A et al. (2020). Universal Patterns in Color-Emotion Associations Are Further Shaped by Linguistic and Geographic Proximity. Psychological Science.", href: "http://intellectum.unisabana.edu.co/bitstreams/bb7fa6db-a6b6-4254-bb5a-f7525047dfaf/download", linkLabel: "Free copy (author, university or repository page)" },
  { n: 4, text: "Elliot A, Maier M (2014). Color Psychology: Effects of Perceiving Color on Psychological Functioning in Humans. Annual Review of Psychology.", href: "https://doi.org/10.1146/annurev-psych-010213-115035", linkLabel: "Publisher page (may need payment)" },
  { n: 5, text: "Nummenmaa L, Glerean E, Hari R, Hietanen J (2013). Bodily maps of emotions. Proceedings of the National Academy of Sciences.", href: "https://www.pnas.org/content/pnas/111/2/646.full.pdf", linkLabel: "Free full text" },
  { n: 6, text: "de Witte M, Spruit A, van Hooren S, Moonen X, Stams G (2019). Effects of music interventions on stress-related outcomes: a systematic review and two meta-analyses. Health Psychology Review.", href: "https://www.tandfonline.com/doi/pdf/10.1080/17437199.2019.1627897?needAccess=true", linkLabel: "Free full text" },
  { n: 7, text: "Koelsch S (2014). Brain correlates of music-evoked emotions. Nature Reviews Neuroscience.", href: "https://doi.org/10.1038/nrn3666", linkLabel: "Publisher page (may need payment)" },
  { n: 8, text: "Salimpoor V, Benovoy M, Larcher K, Dagher A, Zatorre R (2011). Anatomically distinct dopamine release during anticipation and experience of peak emotion to music. Nature Neuroscience.", href: "https://doi.org/10.1038/nn.2726", linkLabel: "Publisher page (may need payment)" },
  { n: 9, text: "Greven C, Lionetti F, Booth C, Aron E, Fox E, Schendan H et al. (2019). Sensory Processing Sensitivity in the context of Environmental Sensitivity: A critical review and development of research agenda. Neuroscience & Biobehavioral Reviews.", href: "https://www.sciencedirect.com/science/article/pii/S0149763418306250/pdf", linkLabel: "Free full text" },
  { n: 10, text: "Meier B, Robinson M (2004). Why the Sunny Side Is Up. Psychological Science.", href: "https://doi.org/10.1111/j.0956-7976.2004.00659.x", linkLabel: "Publisher page (may need payment)" },
  { n: 11, text: "Michalak J, Troje N, Fischer J, Vollmar P, Heidenreich T, Schulte D et al. (2009). Embodiment of Sadness and Depression—Gait Patterns Associated With Dysphoric Mood. Psychosomatic Medicine.", href: "https://doi.org/10.1097/psy.0b013e3181a2515c", linkLabel: "Publisher page (may need payment)" },
  { n: 12, text: "Dael N, Mortillaro M, Scherer K (2012). Emotion expression in body action and posture. Emotion.", href: "https://archive-ouverte.unige.ch/unige:97844", linkLabel: "Free copy (author, university or repository page)" },
  { n: 13, text: "Buhle J, Silvers J, Wager T, Lopez R, Onyemekwu C, Kober H et al. (2013). Cognitive Reappraisal of Emotion: A Meta-Analysis of Human Neuroimaging Studies. Cerebral Cortex.", href: "https://academic.oup.com/cercor/article-pdf/24/11/2981/855752/bht154.pdf", linkLabel: "Free full text" },
  { n: 14, text: "Ochsner K, Gross J (2005). The cognitive control of emotion. Trends in Cognitive Sciences.", href: "https://doi.org/10.1016/j.tics.2005.03.010", linkLabel: "Publisher page (may need payment)" },
  { n: 15, text: "Iyengar S, Lepper M (2000). When choice is demotivating: Can one desire too much of a good thing? Journal of Personality and Social Psychology.", href: "https://doi.org/10.1037/0022-3514.79.6.995", linkLabel: "Publisher page (may need payment)" },
  { n: 16, text: "Scheibehenne B, Greifeneder R, Todd P (2010). Can There Ever Be Too Many Options? A Meta-Analytic Review of Choice Overload. Journal of Consumer Research.", href: "https://archive-ouverte.unige.ch/unige:76440", linkLabel: "Free copy (author, university or repository page)" },
  { n: 17, text: "Chernev A, Böckenholt U, Goodman J (2014). Choice overload: A conceptual review and meta‐analysis. Journal of Consumer Psychology.", href: "https://doi.org/10.1016/j.jcps.2014.08.002", linkLabel: "Publisher page (may need payment)" },
  { n: 18, text: "Van Essen D (2003). Organization of Visual Areas in Macaque and Human Cerebral Cortex. The Visual Neurosciences, 2-vol. set.", href: "https://www.cns.nyu.edu/csh/csh04/Articles/Vanessen-03.pdf", linkLabel: "Free copy (author, university or repository page)" },
  { n: 19, text: "Van Essen D, Lewis J, Drury H, Hadjikhani N, Tootell R, Bakircioglu M et al. (2001). Mapping visual cortex in monkeys and humans using surface-based atlases. Vision Research.", href: "https://www.nmr.mgh.harvard.edu/nouchinelab/pdfs/VanEssen&alVisionResearch2001.pdf", linkLabel: "Free copy (author, university or repository page)" },
  { n: 20, text: "Felleman D, Van Essen D (1991). Distributed Hierarchical Processing in the Primate Cerebral Cortex. Cerebral Cortex.", href: "https://chd.ucsd.edu/_files/fall2008/Felleman.1991.CC_Part1.pdf", linkLabel: "Free copy (author, university or repository page)" },
  { n: 21, text: "Palmer S, Schloss K (2010). An ecological valence theory of human color preference. Proceedings of the National Academy of Sciences.", href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2889342/", linkLabel: "Free full text" },
  { n: 22, text: "Rolls E (2015). Limbic systems for emotion and for memory, but no single limbic system. Cortex.", href: "https://doi.org/10.1016/j.cortex.2013.12.005", linkLabel: "Publisher page (may need payment)" },
  { n: 23, text: "Lindquist K, Wager T, Kober H, Bliss-Moreau E, Barrett L (2012). The brain basis of emotion: A meta-analytic review. Behavioral and Brain Sciences.", href: "https://www.cambridge.org/core/services/aop-cambridge-core/content/view/80F95F093305C76BA2C66BBA48D4BC8A/S0140525X11000446a.pdf/div-class-title-the-brain-basis-of-emotion-a-meta-analytic-review-div.pdf", linkLabel: "Free full text" },
  { n: 24, text: "Pessoa L, Adolphs R (2010). Emotion processing and the amygdala: from a 'low road' to 'many roads' of evaluating biological significance. Nature Reviews Neuroscience.", href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3025529/", linkLabel: "Free full text" },
  { n: 25, text: "Grahn J, Brett M (2007). Rhythm and Beat Perception in Motor Areas of the Brain. Journal of Cognitive Neuroscience.", href: "https://doi.org/10.1162/jocn.2007.19.5.893", linkLabel: "Publisher page (may need payment)" },
  { n: 26, text: "Grube M, Cooper F, Chinnery P, Griffiths T (2010). Dissociation of duration-based and beat-based auditory timing in cerebellar degeneration. Proceedings of the National Academy of Sciences.", href: "https://www.pnas.org/content/pnas/107/25/11597.full.pdf", linkLabel: "Free full text" },
  { n: 27, text: "Critchley H, Wiens S, Rotshtein P, Öhman A, Dolan R (2004). Neural systems supporting interoceptive awareness. Nature Neuroscience.", href: "https://hdl.handle.net/21.11116/0000-0001-A2FB-D", linkLabel: "Free full text" },
  { n: 28, text: "Craig A (2002). How do you feel? Interoception: the sense of the physiological condition of the body. Nature Reviews Neuroscience.", href: "https://doi.org/10.1038/nrn894", linkLabel: "Publisher page (may need payment)" },
  { n: 29, text: "McGlone F, Wessberg J, Olausson H (2014). Discriminative and Affective Touch: Sensing and Feeling. Neuron.", href: "https://www.cell.com/article/S0896627314003870/pdf", linkLabel: "Free full text" },
  { n: 30, text: "Willander J, Larsson M (2006). Smell your way back to childhood: Autobiographical odor memory. Psychonomic Bulletin & Review.", href: "https://doi.org/10.3758/bf03193837", linkLabel: "Publisher page (may need payment)" },
  { n: 31, text: "Herz R, Eliassen J, Beland S, Souza T (2004). Neuroimaging evidence for the emotional potency of odor-evoked memory. Neuropsychologia.", href: "https://doi.org/10.1016/j.neuropsychologia.2003.08.009", linkLabel: "Publisher page (may need payment)" },
  { n: 32, text: "Soudry Y, Lemogne C, Malinvaud D, Consoli S, Bonfils P (2011). Olfactory system and emotion: Common substrates. European Annals of Otorhinolaryngology, Head and Neck Diseases.", href: "https://www.sciencedirect.com/science/article/pii/S1879729610001237/pdf", linkLabel: "Free full text" },
  { n: 33, text: "Proske U, Gandevia S (2012). The Proprioceptive Senses: Their Roles in Signaling Body Shape, Body Position and Movement, and Muscle Force. Physiological Reviews.", href: "https://doi.org/10.1152/physrev.00048.2011", linkLabel: "Publisher page (may need payment)" },
  { n: 34, text: "Fleming S, Dolan R (2012). The neural basis of metacognitive ability. Philosophical Transactions of the Royal Society B: Biological Sciences.", href: "https://doi.org/10.1098/rstb.2011.0417", linkLabel: "Free full text" },
  { n: 35, text: "Andrews‐Hanna J, Smallwood J, Spreng R (2014). The default network and self‐generated thought: component processes, dynamic control, and clinical relevance. Annals of the New York Academy of Sciences.", href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4039623/", linkLabel: "Free full text" },
  { n: 36, text: "Raichle M (2015). The Brain's Default Mode Network. Annual Review of Neuroscience.", href: "https://doi.org/10.1146/annurev-neuro-071013-014030", linkLabel: "Publisher page (may need payment)" },
  { n: 37, text: "Buckner R, Andrews‐Hanna J, Schacter D (2008). The Brain's Default Network. Annals of the New York Academy of Sciences.", href: "https://doi.org/10.1196/annals.1440.011", linkLabel: "Publisher page (may need payment)" },
  { n: 38, text: "Saysani A, Corballis M, Corballis P (2018). Colour envisioned: concepts of colour in the blind and sighted. Visual Cognition.", href: "https://doi.org/10.1080/13506285.2018.1465148", linkLabel: "Publisher page (may need payment)" },
  { n: 39, text: "Shepard R, Cooper L (1992). Representation of Colors in the Blind, Color-Blind, and Normally Sighted. Psychological Science.", href: "https://doi.org/10.1111/j.1467-9280.1992.tb00006.x", linkLabel: "Publisher page (may need payment)" },
  { n: 40, text: "Good A, Reed M, Russo F (2014). Compensatory Plasticity in the Deaf Brain: Effects on Perception of Music. Brain Sciences.", href: "https://www.mdpi.com/2076-3425/4/4/560/pdf?version=1414503340", linkLabel: "Free full text" },
  { n: 41, text: "Nanayakkara S, Wyse L, Ong S, Taylor E (2013). Enhancing Musical Experience for the Hearing-Impaired Using Visual and Haptic Displays. Human–Computer Interaction.", href: "https://doi.org/10.1080/07370024.2012.697006", linkLabel: "Publisher page (may need payment)" },
];

const C = ({ n }: { n: number[] }) => <Cite pageId="lenses" n={n} />;

interface SixGatewaysProps {
  onBack: () => void;
}

interface Gateway {
  id: string;
  name: string;
  subtitle: string;
  icon: typeof Eye;
  description: string;
  explanation: ReactNode;
  neuroscience: ReactNode;
  color: string;
  iconColor: string;
}

const gateways: Gateway[] = [
  {
    id: 'sight',
    name: 'Sight',
    subtitle: 'Vision',
    icon: Eye,
    description: 'Explore through color & image',
    explanation: (
      <>
        More of the cortex is used for vision than for any other sense <C n={[18, 19, 20]} />. The Sight Lens invites you to choose colors for how you feel. There is no right answer. A color has no single fixed meaning. Links between colors and feelings are partly shared and partly shaped by language, place and personal experience <C n={[3, 21]} />.
      </>
    ),
    neuroscience: (
      <>
        How a color connects to a feeling is not fully understood. The old idea of one &lsquo;limbic system&rsquo; for emotion is out of date <C n={[22]} />. Emotion draws on many brain networks <C n={[23, 24]} />. Many people say a color gives them a feeling before they find words for it. We offer this as a common experience, not a research finding.
      </>
    ),
    color: 'from-blue-500/20 to-purple-500/20',
    iconColor: 'text-blue-400',
  },
  {
    id: 'sound',
    name: 'Sound',
    subtitle: 'Audition',
    icon: Music,
    description: 'Navigate through rhythm & tone',
    explanation: (
      <>
        Music can change how people feel. A review of 104 trials found that music lowered felt stress and body signs of stress by small to medium amounts <C n={[6]} />. Music also changes activity in brain areas for emotion and reward <C n={[7, 8]} />. The Sound Lens lets you describe a feeling through sound: pitch, rhythm and tone.
      </>
    ),
    neuroscience: (
      <>
        Hearing music uses the auditory cortex. Feeling a beat also uses movement areas, such as the basal ganglia <C n={[25, 26]} />. Music also changes activity in brain areas for emotion and reward <C n={[7, 8]} />.
      </>
    ),
    color: 'from-purple-500/20 to-pink-500/20',
    iconColor: 'text-purple-400',
  },
  {
    id: 'touch',
    name: 'Touch',
    subtitle: 'Somatosensation',
    icon: Hand,
    description: 'Feel through texture & sensation',
    explanation: (
      <>
        The Touch Lens uses texture, temperature and touch words to describe a feeling. It may suit people who notice feelings first in the body <C n={[5, 1]} />.
      </>
    ),
    neuroscience: (
      <>
        Touch on the skin reaches the somatosensory cortex. Sensing the inside of the body is called interoception, and it involves the insula <C n={[27, 28]} />. Touch also has an emotional side <C n={[29]} />. Body sensing mixes with feeling and thought <C n={[1]} />.
      </>
    ),
    color: 'from-pink-500/20 to-orange-500/20',
    iconColor: 'text-pink-400',
  },
  {
    id: 'essence',
    name: 'Essence',
    subtitle: 'Smell and taste',
    icon: Leaf,
    description: 'Sense through flavor & aroma',
    explanation: (
      <>
        In one study, smells brought back older memories, with a stronger feeling of being taken back in time, than words or pictures did <C n={[30]} />. A small brain-scan study found stronger emotion-related activity for a personally meaningful smell <C n={[31]} />. We did not find good evidence about taste. The Essence Lens uses smell and taste words, such as fresh, stale, sweet and bitter, to describe a feeling.
      </>
    ),
    neuroscience: (
      <>
        Smell signals reach the amygdala and hippocampus by a short route <C n={[32, 31]} />. That may be one reason a smell can bring a feeling back.
      </>
    ),
    color: 'from-green-500/20 to-emerald-500/20',
    iconColor: 'text-green-400',
  },
  {
    id: 'movement',
    name: 'Movement',
    subtitle: 'Kinesthesia',
    icon: TrendingUp,
    description: 'Discover through flow & momentum',
    explanation: (
      <>
        Energy moves. The Movement Lens lets you describe a feeling as movement: rising, falling, stuck or flowing. Everyday words for feelings often use space and motion <C n={[10]} />.
      </>
    ),
    neuroscience: (
      <>
        Moving uses the motor cortex. The body&rsquo;s sense of its position and movement is called proprioception <C n={[33]} />.
      </>
    ),
    color: 'from-amber-500/20 to-yellow-500/20',
    iconColor: 'text-amber-400',
  },
  {
    id: 'insight',
    name: 'Pattern',
    subtitle: 'Noesis',
    icon: Lightbulb,
    description: 'Understand through pattern & connection',
    explanation: (
      <>
        Some people like to think about a feeling in terms of patterns and causes. The Pattern Lens asks you to think about your own thinking. This is called metacognition <C n={[34]} />. It also asks you to look for patterns in your feelings. Like all the Lenses, it is inspired by the Mirror of Galadriel (see the top of this page). It is meant to help you see your own patterns, what is and what may be, and to leave the choice with you.
      </>
    ),
    neuroscience: (
      <>
        Thinking about your own thinking uses prefrontal regions <C n={[34]} />. Reframing a situation uses frontal and parietal control regions <C n={[13]} />. A network that is active when attention turns inward is called the default mode network <C n={[35, 36, 37]} />.
      </>
    ),
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
          className="text-nenya-gold-text hover:text-foreground dark:text-nenya-silver dark:hover:text-nenya-silver-light transition-colors"
        >
          ← Back to About
        </button>
        
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl bg-gradient-to-r from-nenya-gold-dark via-nenya-gold to-nenya-gold-light dark:from-nenya-silver dark:via-yellow-500 dark:to-nenya-silver-light bg-clip-text text-transparent">
            The Six Lenses of Inner Knowing
          </h1>
          <p className="text-lg text-muted-foreground">
            Six ways in to a feeling, beyond color. People describe their inner life in different ways <C n={[1, 2]} />.
          </p>
        </div>
      </div>

      {/* Philosophy */}
      <Card className="p-6 sm:p-8 bg-gradient-to-br from-nenya-gold/5 to-nenya-gold/10 border-nenya-gold/30 dark:from-nenya-silver/5 dark:to-yellow-500/10 dark:border-nenya-silver/30">
        <h2 className="text-2xl mb-4 text-nenya-gold-text dark:text-nenya-silver">Why Six Lenses?</h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            Nenya began with color. Many people link colors and feelings in similar ways <C n={[3, 4]} />. People differ in how they sense and describe feelings. They differ in how well they sense the body&rsquo;s signals <C n={[1]} />. Some people cannot picture things in the mind <C n={[2]} />. Many feel emotions in the body in similar places <C n={[5]} />.
          </p>
          <p>
            Music can stir strong feelings and ease stress for many people <C n={[6, 7, 8]} />. Many people feel emotions as sensations in the body <C n={[5]} />. People differ in how strongly they pick up these sensations <C n={[1, 9]} />. Everyday words for feelings use space, like feeling up or down <C n={[10]} />. Posture and walking also change with mood <C n={[11, 12]} />. Some people like to step back and think a feeling through. In studies, rethinking a situation can change how strongly people feel <C n={[13, 14]} />.
          </p>
          <p>
            The six Lenses are our own design. They are not a tested measure, and they do not sort people into types. Each lens offers a different way to look at the same feeling. The lenses draw on our approach. The idea is to meet you in the way that comes most easily to you.
          </p>
          <p>
            <strong>You pick up a lens, look, and decide.</strong> Open any lens, in any order, as many or as few as you like. Some research finds that many options can make a choice harder, and other studies find no effect <C n={[15, 16, 17]} />. So Nenya asks you to pause before a fourth choice on one card. It never stops you. The main choice and two sliders come first; extra words and your own description wait under “More descriptions”. Nothing goes into your report until you press “Add this to my report”. If you only looked through a lens, you can put it down, and the report says so in one plain line: “Examined, not included”.
          </p>
          <p>
            The Lenses are inspired by the Mirror of Galadriel in J. R. R. Tolkien&rsquo;s <em>The Fellowship of the Ring</em> (Book 2, chapter 7). In the story the Mirror shows a person things and leaves the choice of what to do with them. We built the Lenses the same way: each one asks how you sense something, shows you back what you chose and wrote, and does not tell you what it means or what to do.
          </p>
          <p className="text-sm italic">
            <strong>Mirror, not Oracle:</strong> We don't tell you what your emotions mean. We offer ways in that may help you notice what is already there.
          </p>
        </div>
      </Card>

      {/* The Gateways */}
      <div className="space-y-8">
        <h2 className="text-2xl text-center">The Lenses</h2>
        
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
                    
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">What research suggests:</strong> {gateway.neuroscience}
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
            <strong className="text-foreground">What exists today:</strong> All six lenses work as self-directed reflection, in any order and any number. What you choose to add stays in your browser and can be turned into a downloadable report, or saved on your own device, locked with your passcode, and opened again for 24 hours at most. A lens you only looked through stays out of the report. When you are ready, you can optionally continue to an early coach demo: a short, five-exchange conversation with an AI that runs on an outside service (Venice AI). It is a prototype, not therapy, and it is the only part of Nenya that sends what you type to an AI.
          </p>
          <p>
            <strong className="text-foreground">Two optional activities:</strong> a tapestry, where you layer patterns one at a time (in Pattern), and a path of movement, which you draw or build with direction buttons and can watch move (in Movement). Each adds words to your report, and a small picture to the PDF; the coach reads words only.
          </p>
          <p>
            <strong className="text-foreground">What we hope to build:</strong> A fuller reflection companion, built on our approach, that works with what you enter in each lens, running on your own device rather than in the cloud, with stronger safety and privacy protections than the demo has. None of that exists yet.
          </p>
          <p className="text-xs italic">
            <strong className="text-nenya-gold-text dark:text-nenya-silver">Accessibility Note:</strong> These lenses are about <strong>access</strong> as well as preference. If you are blind, the Sight Lens may be harder to use, but color words can still mean something <C n={[38, 39]} />. The tool can suggest a color name, and screen readers announce it. The other lenses may suit you better. Some Deaf and hard-of-hearing people experience music through vibration and sight <C n={[40, 41]} />, so the Sound Lens can still work for some. Others may prefer a different lens. We are working toward ways in that do not depend on one sense.
          </p>
        </div>
      </Card>

      <ReferenceList pageId="lenses" items={REFERENCES} />
      </div>

      <AppFooter />
    </div>
  );
}
