import React from 'react';
import { ArrowLeft, Brain, BookOpen, Heart, Sparkles, AlertTriangle, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import PanelLogo from '../PanelLogo';
import { BloomInstant, BloomOnScroll } from '../BloomOnScroll';
import { ReturnToTop } from '../ReturnToTop';
import { ScrollIndicator } from '../ScrollIndicator';
import { AppFooter } from '../AppFooter';
import { Cite, ReferenceList, type AboutReference } from './AboutReferences';
import { onWorkersAi } from '../../../lib/coachService';
import { saveReflectionOn } from '../../../lib/savedReflection';

interface EvolvedLeadershipProps {
  onBack: () => void;
}

// This page was rewritten on 2026-11-22 (the About thesis, chapter 4b, docs/about-thesis.md): every empirical sentence says what the
// sources found, with its limits, and carries numbers that match the list at the bottom. The wording of the page is the proposal's, apart
// from the owner's decisions of that day (the cost section is left out; no "sprinkler system" image; no "Compassionate Alliance" term).
const PID = 'leadership';

const REFERENCES: AboutReference[] = [
  { n: 1, text: "Wang D, Waldman D, Zhang Z (2014). A meta-analysis of shared leadership and team effectiveness. Journal of Applied Psychology.", href: "https://doi.org/10.1037/a0034531", linkLabel: "Publisher page (may need payment)" },
  { n: 2, text: "Carson J, Tesluk P, Marrone J (2007). Shared Leadership in Teams: An Investigation of Antecedent Conditions and Performance. Academy of Management Journal.", href: "https://doi.org/10.5465/amj.2007.20159921", linkLabel: "Publisher page (may need payment)" },
  { n: 3, text: "D’Innocenzo L, Mathieu J, Kukenberger M (2016). A Meta-Analysis of Different Forms of Shared Leadership–Team Performance Relations. Journal of Management.", href: "https://doi.org/10.1177/0149206314525205", linkLabel: "Publisher page (may need payment)" },
  { n: 4, text: "Goetz J, Keltner D, Simon-Thomas E (2010). Compassion: An evolutionary analysis and empirical review. Psychological Bulletin.", href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2864937/", linkLabel: "Free full text" },
  { n: 5, text: "Stellar J, Cohen A, Oveis C, et al. (2015). Affective and physiological responses to the suffering of others: Compassion and vagal activity. Journal of Personality and Social Psychology.", href: "https://escholarship.org/content/qt0np2q139/qt0np2q139.pdf", linkLabel: "Free full text" },
  { n: 6, text: "Stellar J, Gordon A, Piff P, et al. (2017). Self-Transcendent Emotions and Their Social Functions: Compassion, Gratitude, and Awe Bind Us to Others Through Prosociality. Emotion Review.", href: "https://doi.org/10.1177/1754073916684557", linkLabel: "Publisher page (may need payment)" },
  { n: 7, text: "de Waal F (2008). Putting the Altruism Back into Altruism: The Evolution of Empathy. Annual Review of Psychology.", href: "https://doi.org/10.1146/annurev.psych.59.103006.093625", linkLabel: "Publisher page (may need payment)" },
  { n: 8, text: "Langford D, Crager S, Shehzad Z, et al. (2006). Social Modulation of Pain as Evidence for Empathy in Mice. Science.", href: "http://escholarship.mcgill.ca/downloads/bg257j541", linkLabel: "Free full text" },
  { n: 9, text: "Bartal I, Decety J, Mason P (2011). Empathy and Pro-Social Behavior in Rats. Science.", href: "https://www.ncbi.nlm.nih.gov/pmc/articles/3760221", linkLabel: "Free full text" },
  { n: 10, text: "de Waal F, Preston S (2017). Mammalian empathy: behavioural manifestations and neural basis. Nature Reviews Neuroscience.", href: "https://doi.org/10.1038/nrn.2017.72", linkLabel: "Publisher page (may need payment)" },
  { n: 11, text: "LeDoux J (2012). Rethinking the Emotional Brain. Neuron.", href: "http://www.cell.com/article/S0896627312001298/pdf", linkLabel: "Free full text" },
  { n: 12, text: "Anderson D, Adolphs R (2014). A Framework for Studying Emotions across Species. Cell.", href: "http://www.cell.com/article/S009286741400292X/pdf", linkLabel: "Free full text" },
  { n: 13, text: "Singer T, Seymour B, O'Doherty J, et al. (2004). Empathy for Pain Involves the Affective but not Sensory Components of Pain. Science.", href: "http://hdl.handle.net/21.11116/0000-0001-A020-5", linkLabel: "Free full text" },
  { n: 14, text: "Lamm C, Decety J, Singer T (2011). Meta-analytic evidence for common and distinct neural networks associated with directly experienced pain and empathy for pain. NeuroImage.", href: "https://doi.org/10.1016/j.neuroimage.2010.10.014", linkLabel: "Publisher page (may need payment)" },
  { n: 15, text: "Timmers I, Park A, Fischer M, et al. (2018). Is Empathy for Pain Unique in Its Neural Correlates? A Meta-Analysis of Neuroimaging Studies of Empathy. Frontiers in Behavioral Neuroscience.", href: "https://www.frontiersin.org/articles/10.3389/fnbeh.2018.00289/pdf", linkLabel: "Free full text" },
  { n: 16, text: "Jauniaux J, Khatibi A, Rainville P, et al. (2019). A meta-analysis of neuroimaging studies on pain empathy: investigating the role of visual information and observers’ perspective. Social Cognitive and Affective Neuroscience.", href: "https://doi.org/10.1093/scan/nsz055", linkLabel: "Free full text" },
  { n: 17, text: "Corradi-Dell’Acqua C, Tusche A, Vuilleumier P, et al. (2016). Cross-modal representations of first-hand and vicarious pain, disgust and fairness in insular and cingulate cortex. Nature Communications.", href: "https://www.nature.com/articles/ncomms10904.pdf", linkLabel: "Free full text" },
  { n: 18, text: "Krishnan A, Woo C, Chang L, et al. (2016). Somatic and vicarious pain are represented by dissociable multivariate brain patterns. eLife.", href: "https://doi.org/10.7554/elife.15166", linkLabel: "Free full text" },
  { n: 19, text: "Mayer J, Caruso D, Salovey P (2016). The Ability Model of Emotional Intelligence: Principles and Updates. Emotion Review.", href: "https://doi.org/10.1177/1754073916639667", linkLabel: "Publisher page (may need payment)" },
  { n: 20, text: "Joseph D, Jin J, Newman D, et al. (2015). Why does self-reported emotional intelligence predict job performance? A meta-analytic investigation of mixed EI. Journal of Applied Psychology.", href: "https://doi.org/10.1037/a0037681", linkLabel: "Publisher page (may need payment)" },
  { n: 21, text: "Joseph D, Newman D (2010). Emotional intelligence: An integrative meta-analysis and cascading model. Journal of Applied Psychology.", href: "https://doi.org/10.1037/a0017286", linkLabel: "Publisher page (may need payment)" },
  { n: 22, text: "O'Boyle E, Humphrey R, Pollack J, et al. (2011). The relation between emotional intelligence and job performance: A meta‐analysis. Journal of Organizational Behavior.", href: "https://doi.org/10.1002/job.714", linkLabel: "Publisher page (may need payment)" },
  { n: 23, text: "Strenze T (2007). Intelligence and socioeconomic success: A meta-analytic review of longitudinal research. Intelligence.", href: "https://doi.org/10.1016/j.intell.2006.09.004", linkLabel: "Publisher page (may need payment)" },
  { n: 24, text: "Schmidt F, Hunter J (2004). General Mental Ability in the World of Work: Occupational Attainment and Job Performance. Journal of Personality and Social Psychology.", href: "https://doi.org/10.1037/0022-3514.86.1.162", linkLabel: "Publisher page (may need payment)" },
  { n: 25, text: "van Zomeren M, Postmes T, Spears R (2008). Toward an integrative social identity model of collective action: A quantitative research synthesis of three socio-psychological perspectives. Psychological Bulletin.", href: "https://research.vu.nl/en/publications/43cc0d8e-767b-452f-84fd-87f973c47006", linkLabel: "Free full text" },
  { n: 26, text: "Agostini M, van Zomeren M (2021). Toward a comprehensive and potentially cross-cultural model of why people engage in collective action: A quantitative research synthesis of four motivations and structural constraints. Psychological Bulletin.", href: "https://research.rug.nl/en/publications/459ea703-2064-4fa5-b6e8-6225d2280ce9", linkLabel: "Free full text" },
  { n: 27, text: "Keltner D, Haidt J (2003). Approaching awe, a moral, spiritual, and aesthetic emotion. Cognition and Emotion.", href: "https://doi.org/10.1080/02699930302297", linkLabel: "Publisher page (may need payment)" },
  { n: 28, text: "Piff P, Dietze P, Feinberg M, et al. (2015). Awe, the small self, and prosocial behavior. Journal of Personality and Social Psychology.", href: "https://doi.org/10.1037/pspi0000018", linkLabel: "Publisher page (may need payment)" },
  { n: 29, text: "Bai Y, Maruskin L, Chen S, et al. (2017). Awe, the diminished self, and collective engagement: Universals and cultural variations in the small self. Journal of Personality and Social Psychology.", href: "https://doi.org/10.1037/pspa0000087", linkLabel: "Publisher page (may need payment)" },
  { n: 30, text: "Harter J, Schmidt F, Hayes T (2002). Business-unit-level relationship between employee satisfaction, employee engagement, and business outcomes: A meta-analysis. Journal of Applied Psychology.", href: "https://doi.org/10.1037/0021-9010.87.2.268", linkLabel: "Publisher page (may need payment)" },
  { n: 31, text: "Christian M, Garza A, Slaughter J (2011). Work engagement: a quantitative review and test of its relations with task and contextual performance. Personnel Psychology.", href: "https://cdr.lib.unc.edu/downloads/4b29bb24n", linkLabel: "Free full text" },
  { n: 32, text: "MacBeth A, Gumley A (2012). Exploring compassion: A meta-analysis of the association between self-compassion and psychopathology. Clinical Psychology Review.", href: "https://doi.org/10.1016/j.cpr.2012.06.003", linkLabel: "Publisher page (may need payment)" },
  { n: 33, text: "Zessin U, Dickhäuser O, Garbade S (2015). The Relationship Between Self‐Compassion and Well‐Being: A Meta‐Analysis. Applied Psychology: Health and Well-Being.", href: "https://doi.org/10.1111/aphw.12051", linkLabel: "Publisher page (may need payment)" },
  { n: 34, text: "Kirby J, Tellegen C, Steindl S (2017). A Meta-Analysis of Compassion-Based Interventions: Current State of Knowledge and Future Directions. Behavior Therapy.", href: "https://doi.org/10.1016/j.beth.2017.06.003", linkLabel: "Publisher page (may need payment)" },
  { n: 35, text: "Neff K, Germer C (2013). A Pilot Study and Randomized Controlled Trial of the Mindful Self‐Compassion Program. Journal of Clinical Psychology.", href: "https://doi.org/10.1002/jclp.21923", linkLabel: "Publisher page (may need payment)" },
  { n: 36, text: "Cikara M, Bruneau E, Saxe R (2011). Us and Them: Intergroup Failures of Empathy. Current Directions in Psychological Science.", href: "http://hdl.handle.net/1721.1/70034", linkLabel: "Free full text" },
  { n: 37, text: "Hein G, Silani G, Preuschoff K, et al. (2010). Neural Responses to Ingroup and Outgroup Members' Suffering Predict Individual Differences in Costly Helping. Neuron.", href: "http://www.cell.com/article/S0896627310007208/pdf", linkLabel: "Free full text" },
  { n: 38, text: "Simas E, Clifford S, Kirkland J (2020). How Empathic Concern Fuels Political Polarization. American Political Science Review.", href: "https://www.cambridge.org/core/services/aop-cambridge-core/content/view/8115DB5BDE548FF6AB04DA661F83785E/S0003055419000534a.pdf/div-class-title-how-empathic-concern-fuels-political-polarization-div.pdf", linkLabel: "Free full text" },
  { n: 39, text: "Vachon D, Lynam D, Johnson J (2014). The (non)relation between empathy and aggression: Surprising results from a meta-analysis. Psychological Bulletin.", href: "https://doi.org/10.1037/a0035236", linkLabel: "Publisher page (may need payment)" },
  { n: 40, text: "Arnsten A (2009). Stress signalling pathways that impair prefrontal cortex structure and function. Nature Reviews Neuroscience.", href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2907136/", linkLabel: "Free full text" },
  { n: 41, text: "Arnsten A (2015). Stress weakens prefrontal networks: molecular insults to higher cognition. Nature Neuroscience.", href: "https://www.ncbi.nlm.nih.gov/pmc/articles/4816215", linkLabel: "Free full text" },
  { n: 42, text: "McEwen B, Morrison J (2013). The Brain on Stress: Vulnerability and Plasticity of the Prefrontal Cortex over the Life Course. Neuron.", href: "http://www.cell.com/article/S0896627313005448/pdf", linkLabel: "Free full text" },
  { n: 43, text: "Hölzel B, Carmody J, Evans K, et al. (2010). Stress reduction correlates with structural changes in the amygdala. Social Cognitive and Affective Neuroscience.", href: "https://academic.oup.com/scan/article-pdf/5/1/11/27105564/nsp034.pdf", linkLabel: "Free full text" },
  { n: 44, text: "Lieberman M, Eisenberger N, Crockett M, et al. (2007). Putting Feelings Into Words. Psychological Science.", href: "https://doi.org/10.1111/j.1467-9280.2007.01916.x", linkLabel: "Publisher page (may need payment)" },
  { n: 45, text: "Creswell J, Way B, Eisenberger N, et al. (2007). Neural Correlates of Dispositional Mindfulness During Affect Labeling. Psychosomatic Medicine.", href: "https://doi.org/10.1184/r1/6617267", linkLabel: "Free full text" },
  { n: 46, text: "Torre J, Lieberman M (2018). Putting Feelings Into Words: Affect Labeling as Implicit Emotion Regulation. Emotion Review.", href: "https://doi.org/10.1177/1754073917742706", linkLabel: "Publisher page (may need payment)" },
  { n: 47, text: "Zaccaro A, Piarulli A, Laurino M, et al. (2018). How Breath-Control Can Change Your Life: A Systematic Review on Psycho-Physiological Correlates of Slow Breathing. Frontiers in Human Neuroscience.", href: "https://www.frontiersin.org/articles/10.3389/fnhum.2018.00353/pdf", linkLabel: "Free full text" },
  { n: 48, text: "Steffen P, Austin T, DeBarros A, et al. (2017). The Impact of Resonance Frequency Breathing on Measures of Heart Rate Variability, Blood Pressure, and Mood. Frontiers in Public Health.", href: "https://www.frontiersin.org/articles/10.3389/fpubh.2017.00222/pdf", linkLabel: "Free full text" },
  { n: 49, text: "Holzman J, Bridgett D (2017). Heart rate variability indices as bio-markers of top-down self-regulatory mechanisms: A meta-analytic review. Neuroscience & Biobehavioral Reviews.", href: "https://doi.org/10.1016/j.neubiorev.2016.12.032", linkLabel: "Publisher page (may need payment)" },
  { n: 50, text: "Grossman P, Taylor E (2007). Toward understanding respiratory sinus arrhythmia: Relations to cardiac vagal tone, evolution and biobehavioral functions. Biological Psychology.", href: "https://doi.org/10.1016/j.biopsycho.2005.11.014", linkLabel: "Publisher page (may need payment)" },
  { n: 51, text: "Laborde S, Mosley E, Thayer J (2017). Heart Rate Variability and Cardiac Vagal Tone in Psychophysiological Research – Recommendations for Experiment Planning, Data Analysis, and Data Reporting. Frontiers in Psychology.", href: "https://www.frontiersin.org/articles/10.3389/fpsyg.2017.00213/pdf", linkLabel: "Free full text" },
  { n: 52, text: "Kral T, Davis K, Korponay C, et al. (2022). Absence of structural brain changes from mindfulness-based stress reduction: Two combined randomized controlled trials. Science Advances.", href: "https://doi.org/10.1126/sciadv.abk3316", linkLabel: "Free full text" },
  { n: 53, text: "Tang Y, Hölzel B, Posner M (2015). The neuroscience of mindfulness meditation. Nature Reviews Neuroscience.", href: "https://doi.org/10.1038/nrn3916", linkLabel: "Publisher page (may need payment)" },
  { n: 54, text: "Van Dam N, van Vugt M, Vago D, et al. (2018). Mind the Hype: A Critical Evaluation and Prescriptive Agenda for Research on Mindfulness and Meditation. Perspectives on Psychological Science.", href: "https://hdl.handle.net/11370/d9c69196-8d85-41f1-bbc1-b946de4b7ee8", linkLabel: "Free full text" },
  { n: 55, text: "Pew Research Center (2019). Americans and Privacy: Concerned, Confused and Feeling Lack of Control Over Their Personal Information. Pew Research Center (report, 15 November 2019).", href: "https://www.pewresearch.org/internet/2019/11/15/americans-and-privacy-concerned-confused-and-feeling-lack-of-control-over-their-personal-information/", linkLabel: "Free to read" },
  { n: 56, text: "Acquisti A, Brandimarte L, Loewenstein G (2015). Privacy and human behavior in the age of information. Science.", href: "https://doi.org/10.1126/science.aaa1465", linkLabel: "Publisher page (may need payment)" },
  { n: 57, text: "Luberto C, Shinday N, Song R, et al. (2018). A Systematic Review and Meta-analysis of the Effects of Meditation on Empathy, Compassion, and Prosocial Behaviors. Mindfulness.", href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6081743/", linkLabel: "Free full text" },
  { n: 58, text: "Donald J, Sahdra B, Van Zanden B, et al. (2019). Does your mindfulness benefit others? A systematic review and meta‐analysis of the link between mindfulness and prosocial behaviour. British Journal of Psychology.", href: "https://doi.org/10.1111/bjop.12338", linkLabel: "Publisher page (may need payment)" },
  { n: 59, text: "Weng H, Fox A, Shackman A, et al. (2013). Compassion Training Alters Altruism and Neural Responses to Suffering. Psychological Science.", href: "https://www.ncbi.nlm.nih.gov/pmc/articles/3713090", linkLabel: "Free full text" },
];

export default function EvolvedLeadership({ onBack }: EvolvedLeadershipProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // The outside AI service named on this build (the same switch the Privacy Promise page reads).
  const aiService = onWorkersAi() ? 'Cloudflare’s Workers AI service' : 'Venice AI';
  const saveOn = saveReflectionOn();

  return (
    <div ref={scrollContainerRef} className="size-full overflow-auto scroll-container bg-background">
      <div className="border-b border-border bg-background px-6 py-4 sticky top-0 z-10">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="size-4" />
          Back to About
        </Button>
      </div>

      <div className="w-full">
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
          {/* Header with Logo */}
          <BloomInstant className="text-center space-y-6">
            <div className="flex justify-center">
              <PanelLogo size={100} />
            </div>
            <h1 className="text-4xl bg-gradient-to-r from-nenya-accent-secondary via-nenya-accent-primary to-nenya-accent-metallic bg-clip-text text-transparent">
              Evolved Leadership & The Co-evolutionary Imperative
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We believe leadership is a skill many people can practise, not a title held by a few. That is our view, not a scientific finding.
            </p>
          </BloomInstant>

          {/* AI Disclaimer */}
          <BloomOnScroll>
            <Alert className="border-nenya-accent-primary/40 bg-nenya-accent-primary/5">
              <Sparkles className="size-4 text-nenya-gold-text dark:text-nenya-accent-warm" />
              <AlertDescription>
                <strong>Research transparency.</strong> AI helped write this page. Each journal paper listed below was checked again against Crossref and OpenAlex, two public indexes of scholarly papers, on 22 November 2026. We read the Pew page on its own site the same day. A check shows that a paper exists and says what we cite. It does not prove a claim true. Please check the sources yourself. No clinician has reviewed this page. Nenya is not therapy or medical care. Each reference has a link. We say where a paper is not free to read.
              </AlertDescription>
            </Alert>
          </BloomOnScroll>

          {/* What we believe */}
          <BloomOnScroll>
            <section aria-labelledby="el-believe-h" className="space-y-6">
              <div className="space-y-4">
                <h2 id="el-believe-h" className="text-3xl">What we believe: leadership within the people</h2>
                <p className="text-lg text-muted-foreground">
                  We hold that groups face shared problems better when many people practise leadership, not only a few. This is our position.
                </p>
              </div>

              <Card className="p-6 border-nenya-accent-primary/30">
                <h3 className="text-nenya-gold-text dark:text-nenya-accent-warm mb-3">Co-evolutionary leadership</h3>
                <p className="text-muted-foreground">
                  By co-evolutionary we mean that leadership grows as people practise it together. It is our own term, not a scientific one.
                </p>
              </Card>
            </section>
          </BloomOnScroll>

          {/* Shared leadership */}
          <BloomOnScroll>
            <section aria-labelledby="el-shared-h" className="space-y-6">
              <div className="flex items-center gap-3">
                <Users className="size-6 text-nenya-gold-text dark:text-nenya-accent-warm" aria-hidden="true" />
                <h2 id="el-shared-h" className="text-3xl">What research says about shared leadership</h2>
              </div>
              <Card className="p-6 border-nenya-accent-primary/30 space-y-4">
                <p className="text-muted-foreground">
                  In some teams, members lead one another instead of relying on one appointed leader. Researchers call this shared, collective or distributed leadership. <Cite pageId={PID} n={[1, 2, 3]} />
                </p>
                <p className="text-muted-foreground">
                  In reviews of team studies, more shared leadership went with better team results. One review of 42 samples found a moderate link, about 0.34 on a scale where 1 is a perfect match. <Cite pageId={PID} n={[1, 2, 3]} />
                </p>
                <p className="text-muted-foreground">
                  A later review of 50 results also found a positive link. A study of 59 consulting teams found that shared leadership predicted clients’ ratings of team performance. <Cite pageId={PID} n={[2, 3]} />
                </p>
                <p className="text-muted-foreground">
                  Results vary. One review found a stronger link for more complex work, and another found a weaker link. These reviews report links, not proof of cause. <Cite pageId={PID} n={[1, 3]} />
                </p>
              </Card>
            </section>
          </BloomOnScroll>

          {/* Compassion */}
          <BloomOnScroll>
            <section aria-labelledby="el-compassion-h" className="space-y-6">
              <div className="flex items-center gap-3">
                <Heart className="size-6 text-nenya-gold-text dark:text-nenya-accent-warm" aria-hidden="true" />
                <h2 id="el-compassion-h" className="text-3xl">Compassion</h2>
              </div>
              <Card className="p-6 border-nenya-accent-primary/30 space-y-4">
                <p className="text-muted-foreground">
                  Compassion is a caring response to someone’s suffering, with a wish to help. <Cite pageId={PID} n={[4, 5, 6]} />
                </p>
                <p className="text-muted-foreground">
                  One leading idea is that compassion evolved to help people protect the vulnerable and work together. It is a hypothesis, not a settled fact. <Cite pageId={PID} n={[4, 6, 7]} />
                </p>
              </Card>

              <Card className="p-6 border-nenya-accent-secondary/30 space-y-3">
                <h3 className="text-nenya-gold-text dark:text-nenya-accent-warm">Empathy in other animals</h3>
                <p className="text-muted-foreground">
                  Some building blocks of empathy appear in other mammals. Mice showed more pain behaviour when a familiar cagemate was in pain. Rats freed a trapped cagemate. Scientists still disagree about whether animals feel what we feel. <Cite pageId={PID} n={[8, 9, 10, 11, 12]} />
                </p>
              </Card>

              <Card className="p-6 border-nenya-accent-secondary/30 space-y-3">
                <h3 className="text-nenya-gold-text dark:text-nenya-accent-warm flex items-center gap-2">
                  <Brain className="size-5" aria-hidden="true" />
                  Empathy for pain in the brain
                </h3>
                <p className="text-muted-foreground">
                  In brain scans, seeing a loved one in pain switched on some of the same brain areas as feeling pain yourself, such as the anterior insula and the cingulate cortex. Areas that sense where the pain is on the body responded only to your own pain. <Cite pageId={PID} n={[13, 14, 15, 16]} />
                </p>
                <p className="text-muted-foreground">
                  Scientists disagree about what the overlap means. The same network also switches on for empathy about feelings other than pain. One study found a shared code for how unpleasant something is. Another found separate patterns for your own pain and another person’s pain. <Cite pageId={PID} n={[15, 17, 18]} />
                </p>
              </Card>
            </section>
          </BloomOnScroll>

          {/* Emotional intelligence */}
          <BloomOnScroll>
            <section aria-labelledby="el-ei-h" className="space-y-6">
              <div className="flex items-center gap-3">
                <BookOpen className="size-6 text-nenya-gold-text dark:text-nenya-accent-warm" aria-hidden="true" />
                <h2 id="el-ei-h" className="text-3xl">Emotional intelligence and success</h2>
              </div>
              <Card className="p-6 border-nenya-accent-primary/30 space-y-4">
                <p className="text-muted-foreground">
                  Emotional intelligence (EI) means skill at noticing and handling feelings. Experts disagree about how to define and measure it. <Cite pageId={PID} n={[19, 20, 21]} />
                </p>
                <p className="text-muted-foreground">
                  In big reviews, EI scores went only a little with job performance (correlations of 0.24 to 0.30). Experts disagree on whether EI adds anything beyond personality and IQ. <Cite pageId={PID} n={[20, 22]} />
                </p>
                <p className="text-muted-foreground">
                  Large reviews find that IQ scores predict schooling, job level and income. One review of long-term studies found they predict them well, but not much better than parents’ social class or school grades. <Cite pageId={PID} n={[23, 24]} />
                </p>
              </Card>
            </section>
          </BloomOnScroll>

          {/* Why people act together */}
          <BloomOnScroll>
            <section aria-labelledby="el-act-h" className="space-y-6">
              <h2 id="el-act-h" className="text-3xl">Why people act together</h2>
              <Card className="p-6 border-nenya-accent-primary/30">
                <p className="text-muted-foreground">
                  Researchers who study protest and other group action find that three things matter. These are feeling that something is unjust, believing the group can change it, and feeling part of the group. A later review added moral conviction as a fourth. <Cite pageId={PID} n={[25, 26]} />
                </p>
              </Card>
            </section>
          </BloomOnScroll>

          {/* Awe */}
          <BloomOnScroll>
            <section aria-labelledby="el-awe-h" className="space-y-6">
              <h2 id="el-awe-h" className="text-3xl">Awe</h2>
              <Card className="p-6 border-nenya-accent-primary/30 space-y-4">
                <p className="text-muted-foreground">
                  Awe is a response to something vast that we cannot easily fit into what we already know. <Cite pageId={PID} n={27} /> In five studies with 2,078 people, awe led to more generous and ethical choices and more helping. Part of the effect came from feeling like a smaller self. <Cite pageId={PID} n={28} />
                </p>
                <p className="text-muted-foreground">
                  A second paper, with 2,137 people, found that awe made the sense of self smaller, and that this went with more group involvement. Most of this work used surveys or short experiments, so we do not know how long the effects last. <Cite pageId={PID} n={[6, 29]} />
                </p>
              </Card>
            </section>
          </BloomOnScroll>

          {/* Engagement, self-compassion and division */}
          <BloomOnScroll>
            <section aria-labelledby="el-wellbeing-h" className="space-y-6">
              <h2 id="el-wellbeing-h" className="text-3xl">Engagement, self-compassion and empathy</h2>

              <Card className="p-6 border-nenya-accent-secondary/30 space-y-3">
                <h3 className="text-nenya-gold-text dark:text-nenya-accent-warm">Engagement at work</h3>
                <p className="text-muted-foreground">
                  Peer-reviewed studies link engagement to better results. One covered 7,939 business units in 36 companies. Its first author worked at Gallup, a polling company. Some researchers question how engagement differs from other job attitudes. <Cite pageId={PID} n={[30, 31]} />
                </p>
              </Card>

              <Card className="p-6 border-nenya-accent-secondary/30 space-y-3">
                <h3 className="text-nenya-gold-text dark:text-nenya-accent-warm">Self-compassion and well-being</h3>
                <p className="text-muted-foreground">
                  People who score higher on self-compassion tend to report better well-being and less anxiety and depression. The links were large (r = 0.47 with well-being and -0.54 with mental-health symptoms). These studies show a link, not a cause. <Cite pageId={PID} n={[32, 33]} />
                </p>
                <p className="text-muted-foreground">
                  Courses that teach compassion for yourself or others reduced depression and anxiety in a review of 21 trials with 1,285 people. Most trials were small. <Cite pageId={PID} n={[34, 35]} />
                </p>
              </Card>

              <Card className="p-6 border-nenya-accent-secondary/30 space-y-3">
                <h3 className="text-nenya-gold-text dark:text-nenya-accent-warm">Empathy and division</h3>
                <p className="text-muted-foreground">
                  Empathy is not a simple cure for division. People feel more empathy for members of their own group than for outsiders. <Cite pageId={PID} n={[36, 37]} />
                </p>
                <p className="text-muted-foreground">
                  In one large US study, people who felt more empathic concern were more biased toward their own political side. <Cite pageId={PID} n={38} />
                </p>
                <p className="text-muted-foreground">
                  Across 106 results, low empathy was only weakly linked to aggression (r = -0.11). <Cite pageId={PID} n={39} />
                </p>
                <p className="text-muted-foreground">
                  So the research does not show that low empathy causes political division, crime or inequality.
                </p>
              </Card>
            </section>
          </BloomOnScroll>

          {/* Nenya */}
          <BloomOnScroll>
            <section aria-labelledby="el-nenya-h" className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <PanelLogo size={80} />
                </div>
                <h2 id="el-nenya-h" className="text-3xl text-center">What Nenya is, and what we have not tested</h2>
                <p className="text-lg text-muted-foreground">
                  We have not tested whether using Nenya changes anyone’s brain, body or behaviour. No study of Nenya has been done.
                </p>
              </div>

              <Card className="p-6 border-nenya-accent-primary/30 space-y-3">
                <h3 className="text-nenya-gold-text dark:text-nenya-accent-warm">Stress and the brain</h3>
                <p className="text-muted-foreground">
                  Even mild stress that we cannot control can quickly weaken the front of the brain (the prefrontal cortex). We use it for planning and self-control. Stress can also strengthen the amygdala, a region that helps detect threat. Much of this work is in animals. <Cite pageId={PID} n={[40, 41, 42, 43]} />
                </p>
              </Card>

              <Card className="p-6 border-nenya-accent-primary/30 space-y-3">
                <h3 className="text-nenya-gold-text dark:text-nenya-accent-warm">Naming feelings and needs</h3>
                <p className="text-muted-foreground">
                  Nenya’s reflection steps ask you to name feelings and needs. The closest research is on naming feelings. In brain scans, putting a feeling into words reduced the response of the amygdala and raised activity in a right prefrontal region. <Cite pageId={PID} n={[44, 45, 46]} />
                </p>
                <p className="text-muted-foreground">
                  Those studies used pictures of faces and scenes in a scanner. They did not test Nenya or nonviolent communication.
                </p>
                <p className="text-muted-foreground">
                  We searched PubMed on 22 November 2026. We found no study of nonviolent communication (NVC) that measured heart rate variability or brain activity.
                </p>
              </Card>

              <Card className="p-6 border-nenya-accent-primary/30 space-y-3">
                <h3 className="text-nenya-gold-text dark:text-nenya-accent-warm">Breathing, heart rate variability and the vagus nerve</h3>
                <p className="text-muted-foreground">
                  Heart rate variability (HRV) is the small change in time between heartbeats. Slow breathing, which Nenya offers as a separate tool, raised HRV in healthy people in small studies. <Cite pageId={PID} n={[47, 48]} />
                </p>
                <p className="text-muted-foreground">
                  Higher HRV goes with slightly better self-control on average, but the link is small (r = 0.09 across 123 studies). HRV is often used as a sign of vagus nerve activity, but it is not a direct measure of it. <Cite pageId={PID} n={[49, 50, 51]} />
                </p>
              </Card>

              <Card className="p-6 border-nenya-accent-primary/30 space-y-3">
                <h3 className="text-nenya-gold-text dark:text-nenya-accent-warm">Mindfulness and the brain</h3>
                <p className="text-muted-foreground">
                  Brain-scan studies of mindfulness courses do not agree. A small study with no control group found changes in amygdala density that went with lower stress. <Cite pageId={PID} n={43} /> The largest controlled trial, with 218 beginners, found no change in brain structure. <Cite pageId={PID} n={52} /> Reviewers say stronger studies are needed. <Cite pageId={PID} n={[53, 54]} />
                </p>
              </Card>

              <Card className="p-6 border-nenya-accent-primary/30 space-y-3">
                <h3 className="text-nenya-gold-text dark:text-nenya-accent-warm">Reflection over consumption</h3>
                <p className="text-muted-foreground">
                  Nenya is built for reflection over consumption. That is our design aim.
                </p>
                <p className="text-muted-foreground">
                  What you type into the reflection tools stays in your browser. It is gone when you close the tab{saveOn ? ', unless you choose to save it on your device. A saved reflection can be opened for 24 hours at most' : ''}.
                </p>
                <p className="text-muted-foreground">
                  Coach messages go through our server, hosted by Netlify, to {aiService}, which writes the replies. We do not store the messages or replies, and we do not write them to our logs. If you choose to send a transcript, we keep it until the time you chose, and a person at Nenya reads it there.
                </p>
                <p className="text-muted-foreground">
                  Nenya is not zero-knowledge: our server reads your coach messages in readable form, briefly and in memory, to check them before they go on to {aiService}. We are exploring a coach that runs on your own device, but it does not exist yet.
                </p>
                <p className="text-muted-foreground">
                  Many people worry about how companies use their data. In a 2019 US survey of 4,272 adults, 79% said they were concerned and 81% said they have little or no control over it. Research finds that privacy concern depends on context and can be shaped by those who collect data. <Cite pageId={PID} n={[55, 56]} />
                </p>
              </Card>

              <Card className="p-6 border-nenya-accent-primary/30 space-y-3">
                <h3 className="text-nenya-gold-text dark:text-nenya-accent-warm">What may follow</h3>
                <p className="text-muted-foreground">
                  In studies of mostly healthy adults, meditation and compassion courses raised empathy, compassion and helping. A review of 26 trials found small-to-medium effects of about 0.4. <Cite pageId={PID} n={[57, 58, 59]} />
                </p>
                <p className="text-muted-foreground">
                  In that review, most control groups were on a waiting list or got no treatment. <Cite pageId={PID} n={57} />
                </p>
                <p className="text-muted-foreground">
                  We do not know whether using Nenya has these effects, or whether such changes lead people to act together.
                </p>
              </Card>
            </section>
          </BloomOnScroll>

          {/* Tool Safety Caution */}
          <Alert className="border-yellow-500/40 bg-yellow-50/50 dark:bg-yellow-950/20">
            <AlertTriangle className="size-4 text-yellow-600" />
            <AlertDescription className="text-yellow-900 dark:text-yellow-100">
              <strong>Important Safety Notice:</strong> No tool can ever be completely safe. Nenya is built to keep little of what you enter, and its safety checks can be wrong, so it is important to proceed mindfully with its use. Trust your instincts, honor your boundaries, and remember that you are always in control of what you choose to share and explore.
            </AlertDescription>
          </Alert>

          {/* Citations & References */}
          <BloomOnScroll>
            <section className="space-y-4">
              <ReferenceList
                pageId={PID}
                heading="References & Further Reading"
                items={REFERENCES}
                intro="These are the sources behind the statements above. The numbers match the notes in the text. Please check them yourself."
              />
              <div className="p-4 bg-yellow-50/50 dark:bg-yellow-950/20 rounded border border-yellow-200 dark:border-yellow-800">
                <p className="text-xs text-yellow-900 dark:text-yellow-100">
                  <strong>Verification Note:</strong> A source can be real and still not say what a sentence once claimed. We re-checked each source on 22 November 2026 and rewrote or removed claims that went beyond what it found. Science is an ongoing conversation, not a final authority.
                </p>
              </div>
            </section>
          </BloomOnScroll>

          <ReturnToTop onClick={scrollToTop} />
        </div>
      </div>

      {/* Scroll indicator */}
      <ScrollIndicator containerRef={scrollContainerRef} />

      <AppFooter />
    </div>
  );
}
