import React from 'react';
import { ArrowLeft, Heart, Eye, Lightbulb, MessageCircle, Network, Users, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { ReturnToTop } from '../ReturnToTop';
import { ScrollIndicator } from '../ScrollIndicator';
import { AppFooter } from '../AppFooter';
import { Cite, ReferenceList, type AboutReference } from './AboutReferences';

const PAGE_ID = 'nvc';

const NVC_REFS: AboutReference[] = [
  { n: 1, text: "Itzchakov G, Weinstein N, Saluk D, Amar M (2022). Connection Heals Wounds: Feeling Listened to Reduces Speakers’ Loneliness Following a Social Rejection Disclosure. Personality and Social Psychology Bulletin.", href: "https://doi.org/10.1177/01461672221100369", linkLabel: "Free full text" },
  { n: 2, text: "Itzchakov G, Weinstein N, Leary M, Saluk D, Amar M (2024). Listening to understand: The role of high-quality listening on speakers’ attitude depolarization during disagreements. Journal of Personality and Social Psychology.", href: "https://centaur.reading.ac.uk/114502/1/Listening%20in%20disagreements%20manuscript%20in%20press.pdf", linkLabel: "Free full text (accepted manuscript)" },
  { n: 3, text: "Elliott R, Bohart A, Watson J, Murphy D (2018). Therapist empathy and client outcome: An updated meta-analysis. Psychotherapy.", href: "https://nottingham-repository.worktribe.com/file/921082/1/Empathy%20Meta-analysis%20Psychotherapy%20March%202018.pdf", linkLabel: "Free full text" },
  { n: 4, text: "Kenrick D, Griskevicius V, Neuberg S, Schaller M (2010). Renovating the Pyramid of Needs. Perspectives on Psychological Science.", href: "https://www.ncbi.nlm.nih.gov/pmc/articles/3161123", linkLabel: "Free full text" },
  { n: 5, text: "Martela F, Sheldon K (2019). Clarifying the Concept of Well-Being: Psychological Need Satisfaction as the Common Core Connecting Eudaimonic and Subjective Well-Being. Review of General Psychology.", href: "https://research.aalto.fi/en/publications/49998c82-03fe-42c0-846a-8bf0cf9c16a8", linkLabel: "Free full text" },
  { n: 6, text: "Doyal L, Gough I (1991). A Theory of Human Need. (book, Macmillan; no free copy, listed as a non-academic source)." },
  { n: 7, text: "Chen B, Vansteenkiste M, Beyers W, Boone L, Deci E, Van der Kaap-Deeder J, et al. (2014). Basic psychological need satisfaction, need frustration, and need strength across four cultures. Motivation and Emotion.", href: "https://dipot.ulb.ac.be/dspace/bitstream/2013/409773/3/Chen2015.pdf", linkLabel: "Free full text (author manuscript)" },
  { n: 8, text: "Kirkbride J, Anglin D, Colman I, Dykxhoorn J, Jones P, Patalay P, et al. (2024). The social determinants of mental health and disorder: evidence, prevention and recommendations. World Psychiatry.", href: "https://onlinelibrary.wiley.com/doi/pdfdirect/10.1002/wps.21160", linkLabel: "Free full text" },
  { n: 9, text: "Pascoe E, Smart Richman L (2009). Perceived discrimination and health: A meta-analytic review. Psychological Bulletin.", href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2747726/", linkLabel: "Free full text" },
  { n: 10, text: "Mikula G, Scherer K, Athenstaedt U (1998). The Role of Injustice in the Elicitation of Differential Emotional Reactions. Personality and Social Psychology Bulletin.", href: "https://archive-ouverte.unige.ch/unige:102069", linkLabel: "Free full text" },
  { n: 11, text: "van Zomeren M, Postmes T, Spears R (2008). Toward an integrative social identity model of collective action: A quantitative research synthesis of three socio-psychological perspectives. Psychological Bulletin.", href: "https://research.vu.nl/en/publications/43cc0d8e-767b-452f-84fd-87f973c47006", linkLabel: "Free full text" },
  { n: 12, text: "Batson C, Kennedy C, Nord L, Stocks E, Fleming D, Marzette C, et al. (2007). Anger at unfairness: is it moral outrage?. European Journal of Social Psychology.", href: "https://onlinelibrary.wiley.com/doi/pdfdirect/10.1002/ejsp.434", linkLabel: "Free full text" },
  { n: 13, text: "Jasper J (2011). Emotions and Social Movements: Twenty Years of Theory and Research. Annual Review of Sociology.", href: "http://relaces.com.ar/index.php/relaces/article/download/240/237", linkLabel: "Free full text (reprint hosted by another journal)" },
  { n: 14, text: "Aknin L, Barrington-Leigh C, Dunn E, Helliwell J, Burns J, Biswas-Diener R, et al. (2013). Prosocial spending and well-being: Cross-cultural evidence for a psychological universal. Journal of Personality and Social Psychology.", href: "https://doi.org/10.3386/w16415", linkLabel: "Free full text (working-paper version)" },
  { n: 15, text: "Liao H, Su R, Ptashnik T, Nielsen J (2022). Feeling good, doing good, and getting ahead: A meta-analytic investigation of the outcomes of prosocial motivation at work. Psychological Bulletin.", href: "https://psyarxiv.com/7dqnu/download", linkLabel: "Free full text (author preprint of the published paper)" },
  { n: 16, text: "Righetti F, Sakaluk J, Faure R, Impett E (2020). The link between sacrifice and relational and personal well-being: A meta-analysis. Psychological Bulletin.", href: "https://hdl.handle.net/1871.1/46698240-1edc-4f9a-8337-58aa90034d1f", linkLabel: "Free full text" },
  { n: 17, text: "Lazzari G, Jean B, de la Sablonnière R, van Vugt F (2026). A systematic review of quantitative studies testing Nonviolent Communication training interventions. Frontiers in Psychology.", href: "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2026.1800455/pdf", linkLabel: "Free full text" },
  { n: 18, text: "Adriani P, Hino P, Taminato M, Okuno M, Santos O, Fernandes H, et al. (2024). Non-violent communication as a technology in interpersonal relationships in health work: a scoping review. BMC Health Services Research.", href: "https://bmchealthservres.biomedcentral.com/counter/pdf/10.1186/s12913-024-10753-2", linkLabel: "Free full text" },
  { n: 19, text: "Yang J, Kim S (2016). Integrative Review of Nonviolent Communication Intervention Studies. Perspectives in Nursing Science.", href: "http://synapse.koreamed.org/Synapse/Data/PDFData/0221PNS/pns-13-36.pdf", linkLabel: "Free full text" },
  { n: 20, text: "Marlow E, Nyamathi A, Grajeda W, Bailey N, Weber A, Younger J, et al. (2012). Nonviolent Communication Training and Empathy in Male Parolees. Journal of Correctional Health Care.", href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7727724/", linkLabel: "Free full text" },
  { n: 21, text: "Nosek M, Gifford E, Kober B (2014). Nonviolent Communication (NVC) training increases empathy in baccalaureate nursing students: A mixed method study. Journal of Nursing Education and Practice.", href: "https://www.sciedu.ca/journal/index.php/jnep/article/download/4222/3083", linkLabel: "Free full text" },
  { n: 22, text: "Sung J, Kweon Y (2022). Effects of a Nonviolent Communication-Based Empathy Education Program for Nursing Students: A Quasi-Experimental Pilot Study. Nursing Reports.", href: "https://www.mdpi.com/2039-4403/12/4/80/pdf?version=1668678086", linkLabel: "Free full text" },
  { n: 23, text: "Yang J, Kim S (2022). An online communication skills training program for nursing students: A quasi-experimental study. PLOS ONE.", href: "https://journals.plos.org/plosone/article/file?id=10.1371/journal.pone.0268016&type=printable", linkLabel: "Free full text" },
  { n: 24, text: "Epinat-Duclos J, Foncelle A, Quesque F, Chabanat E, Duguet A, Van der Henst J, et al. (2021). Does nonviolent communication education improve empathy in French medical students?. International Journal of Medical Education.", href: "https://www.ijme.net/archive/12/training-empathy-in-medical-students.pdf", linkLabel: "Free full text" },
  { n: 25, text: "Jiang D, Yuan X, Wang M, Qiu H, Bian T (2026). Nonviolent communication training among undergraduate medical students in emergency medicine teaching: a randomized controlled educational trial. BMC Medical Education.", href: "https://doi.org/10.1186/s12909-026-09621-w", linkLabel: "Free full text" },
  { n: 26, text: "Suarez A, Lee D, Rowe C, Gomez A, Murowchick E, Linn P, et al. (2014). Freedom Project. Sage Open.", href: "https://journals.sagepub.com/doi/pdf/10.1177/2158244013516154", linkLabel: "Free full text" },
  { n: 27, text: "Schwartzkopf C, Alves R, Lopes P, Braux J, Capucho F, Ribeiro C, et al. (2025). The role of training and education for enhancing empathy among healthcare students: a systematic review of randomised controlled trials. BMC Medical Education.", href: "https://link.springer.com/content/pdf/10.1186/s12909-025-07038-5.pdf", linkLabel: "Free full text" },
  { n: 28, text: "De Castro B, Veerman J, Koops W, Bosch J, Monshouwer H (2002). Hostile Attribution of Intent and Aggressive Behavior: A Meta-Analysis. Child Development.", href: "https://onlinelibrary.wiley.com/doi/pdfdirect/10.1111/1467-8624.00447", linkLabel: "Free full text" },
  { n: 29, text: "DeWall C, Twenge J, Gitter S, Baumeister R (2009). It's the thought that counts: The role of hostile cognition in shaping aggressive responses to social exclusion. Journal of Personality and Social Psychology.", href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2775524/", linkLabel: "Free full text" },
  { n: 30, text: "Ford B, Lam P, John O, Mauss I (2018). The psychological health benefits of accepting negative emotions and thoughts: Laboratory, diary, and longitudinal evidence. Journal of Personality and Social Psychology.", href: "https://doi.org/10.1037/pspp0000157", linkLabel: "Free full text" },
  { n: 31, text: "Lieberman M, Inagaki T, Tabibnia G, Crockett M (2011). Subjective responses to emotional stimuli during labeling, reappraisal, and distraction. Emotion.", href: "https://doi.org/10.1037/a0023503", linkLabel: "Free full text" },
  { n: 32, text: "Creswell J, Way B, Eisenberger N, Lieberman M (2007). Neural Correlates of Dispositional Mindfulness During Affect Labeling. Psychosomatic Medicine.", href: "https://doi.org/10.1184/r1/6617267", linkLabel: "Free full text" },
  { n: 33, text: "Vine V, Boyd R, Pennebaker J (2020). Natural emotion vocabularies as windows on distress and well-being. Nature Communications.", href: "https://www.nature.com/articles/s41467-020-18349-0.pdf", linkLabel: "Free full text" },
  { n: 34, text: "Kalokerinos E, Erbas Y, Ceulemans E, Kuppens P (2019). Differentiate to Regulate: Low Negative Emotion Differentiation Is Associated With Ineffective Use but Not Selection of Emotion-Regulation Strategies. Psychological Science.", href: "https://lirias.kuleuven.be/retrieve/0ff56791-b14c-40ed-8683-aa5de8db1d18", linkLabel: "Free full text" },
  { n: 35, text: "DeLap G, Vine V, Santee A, Starr L (2025). Putting it into words: Emotion vocabulary, emotion differentiation, and depression among adolescents. Emotion.", href: "https://doi.org/10.1037/emo0001429", linkLabel: "Free full text" },
  { n: 36, text: "Hoemann K, Nielson C, Yuen A, Gurera J, Quigley K, Barrett L, et al. (2021). Expertise in emotion: A scoping review and unifying framework for individual differences in the mental representation of emotional experience. Psychological Bulletin.", href: "https://doi.org/10.1037/bul0000327", linkLabel: "Free full text" },
  { n: 37, text: "Legate N, Nguyen T, Weinstein N, Moller A, Legault L, et al. (2022). A global experiment on motivating social distancing during the COVID-19 pandemic. Proceedings of the National Academy of Sciences.", href: "https://doi.org/10.1073/pnas.2111091119", linkLabel: "Free full text" },
  { n: 38, text: "Van Petegem S, Soenens B, Vansteenkiste M, Beyers W (2015). Rebels With a Cause? Adolescent Defiance From the Perspective of Reactance Theory and Self-Determination Theory. Child Development.", href: "https://dipot.ulb.ac.be/dspace/bitstream/2013/409766/3/CD2015_AAM.pdf", linkLabel: "Free full text (author manuscript)" },
  { n: 39, text: "Weinstein N, Itzchakov G, Legate N (2022). The motivational value of listening during intimate and difficult conversations. Social and Personality Psychology Compass.", href: "https://onlinelibrary.wiley.com/doi/pdfdirect/10.1111/spc3.12651", linkLabel: "Free full text" },
  { n: 40, text: "Further reading, not counted as support: Lieberman M, Eisenberger N, Crockett M, Tom S, Pfeifer J, Way B, et al. (2007). Putting Feelings Into Words. Psychological Science.", href: "https://doi.org/10.1111/j.1467-9280.2007.01916.x", linkLabel: "Publisher page (may need payment)" },
  { n: 41, text: "Further reading, not counted as support: Seah T, Coifman K (2022). Emotion differentiation and behavioral dysregulation in clinical and nonclinical samples: A meta-analysis. Emotion.", href: "https://doi.org/10.1037/emo0000968", linkLabel: "Publisher page (may need payment)" },
  { n: 42, text: "Further reading, not counted as support: Torre J, Lieberman M (2018). Putting Feelings Into Words: Affect Labeling as Implicit Emotion Regulation. Emotion Review.", href: "https://doi.org/10.1177/1754073917742706", linkLabel: "Publisher page (may need payment)" },
  { n: 43, text: "Further reading, not counted as support: Weinstein N, Ryan R (2010). When helping helps: Autonomous motivation for prosocial behavior and its influence on well-being for the helper and recipient. Journal of Personality and Social Psychology.", href: "https://doi.org/10.1037/a0016984", linkLabel: "Publisher page (may need payment)" },
];


interface NVCMethodProps {
  onBack: () => void;
}

export default function NVCMethod({ onBack }: NVCMethodProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div ref={scrollContainerRef} className="size-full overflow-auto scroll-container bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border px-6 py-4 sticky top-0 bg-background z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="shrink-0"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h1>Our Approach: Empathy and Awareness of the Wider System</h1>
      </div>

      {/* Content */}
      <div className="w-full">
        <div className="mx-auto max-w-4xl px-6 py-12 space-y-12">
          
          {/* Section 1: The Foundational Practice */}
          <section className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl bg-gradient-to-r from-nenya-accent-secondary via-nenya-accent-primary to-nenya-accent-warm bg-clip-text text-transparent">
                Nonviolent Communication: The Four Core Pillars
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Nonviolent Communication (NVC) is a way to talk and listen, developed by Dr. Marshall Rosenberg. Rosenberg described it as rooted in <em>ahimsa</em>, a word from Indian traditions that means not harming. It puts understanding before problem-solving. Studies of good listening and of therapist empathy give some support to that order. Feeling heard has eased loneliness and defensiveness, and therapist empathy goes with better results <Cite pageId={PAGE_ID} n={[1, 2, 3]} />. Those studies were not about NVC itself. Nenya&apos;s lessons and its optional coach are built on these four parts.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-6 bg-gradient-to-br from-background-secondary to-background border-nenya-accent-primary/30">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-full bg-nenya-accent-primary/10 flex items-center justify-center flex-shrink-0">
                    <Eye className="size-6 text-nenya-gold-text dark:text-nenya-accent-warm" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-foreground">1. Observation</h3>
                    <p className="text-sm text-muted-foreground">
                      Say what you saw or heard, apart from what you make of it.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-background-secondary to-background border-nenya-accent-secondary/30">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-full bg-nenya-accent-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Heart className="size-6 text-nenya-gold-text dark:text-nenya-accent-warm" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-foreground">2. Feelings</h3>
                    <p className="text-sm text-muted-foreground">
                      Name what you feel, in your body and your emotions, with a plain word and no blame.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-background-secondary to-background border-nenya-accent-metallic/30">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-full bg-nenya-accent-metallic/10 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="size-6 text-nenya-gold-text dark:text-nenya-accent-warm" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-foreground">3. Needs</h3>
                    <p className="text-sm text-muted-foreground">
                      Link feelings to needs that many people share, such as safety, understanding, and rest. Researchers do not agree on one list of needs <Cite pageId={PAGE_ID} n={[4, 5, 6]} />. Many researchers treat unmet needs as one reason behind what people do <Cite pageId={PAGE_ID} n={[7, 5, 4]} />.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-background-secondary to-background border-nenya-accent-warm/30">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-full bg-nenya-accent-warm/10 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="size-6 text-nenya-gold-text dark:text-nenya-accent-warm" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-foreground">4. Requests</h3>
                    <p className="text-sm text-muted-foreground">
                      Ask for a specific action that could help meet a need. Offer it as an invitation, not an order.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Section 2: Our added layer */}
          <section className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl bg-gradient-to-r from-nenya-accent-secondary via-nenya-accent-metallic to-nenya-accent-warm bg-clip-text text-transparent">
                Our Approach: Adding Power and Shared Needs
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We think NVC is a useful tool. We also think it leaves out how power and history shape what people feel. Our approach tries to add that. It is our own extension and has not been tested. It adds two things: <strong>systemic context</strong> and <strong>shared needs</strong>.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-8 bg-gradient-to-br from-slate-50 to-zinc-50 dark:from-slate-900 dark:to-zinc-900 border-slate-300 dark:border-slate-700">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-slate-500/10 flex items-center justify-center">
                      <Network className="size-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <h3 className="text-slate-900 dark:text-slate-100">1. Systemic Context</h3>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm text-slate-700 dark:text-slate-300">Acknowledging Power and Historical Injustice</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Our view: what people feel is shaped in part by the world around them, such as unfair treatment, unequal power, and disadvantage handed down in families. Studies link unfair social conditions with worse mental health and stronger stress <Cite pageId={PAGE_ID} n={[8, 9, 10]} />. Your frustration may not be only personal. It can be a reasonable response to unfair treatment. That is our view, not a research finding. Studies find that unfairness brings anger, and anger joined with group identity and a sense of efficacy can lead to joint action <Cite pageId={PAGE_ID} n={[10, 11, 12, 13]} />.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-8 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900 dark:to-purple-900 border-violet-300 dark:border-violet-700">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-violet-500/10 flex items-center justify-center">
                      <Users className="size-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <h3 className="text-violet-900 dark:text-violet-100">2. Communal Needs</h3>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm text-violet-700 dark:text-violet-300">Navigating the Space Between 'Me' and 'We'</h4>
                    <p className="text-sm text-violet-600 dark:text-violet-400 leading-relaxed">
                      We add shared needs, such as justice, fairness, and sustainability, next to personal needs. Helping others is common and tends to go with well-being, though costly sacrifice can take a toll <Cite pageId={PAGE_ID} n={[14, 15, 16]} />.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* What research says about NVC (the About thesis, 2026-11-22) */}
          <section className="space-y-6" aria-labelledby="nvc-research-h">
            <h2 id="nvc-research-h" className="text-3xl text-foreground">What research says about NVC</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                NVC has been tested, but not much, and mostly in small studies <Cite pageId={PAGE_ID} n={[17, 18, 19]} />. A 2026 review of 31 studies found that most had no control group or no random assignment <Cite pageId={PAGE_ID} n={[17, 19]} />. Many were small. One taught 30 parolees. One was a single nursing class with no comparison group. Two more compared nursing students (62 and 55) with a control group, without random assignment <Cite pageId={PAGE_ID} n={[20, 21, 22, 23]} />.
              </p>
              <p>
                In two trials, medical students were assigned by chance to NVC training or other teaching. The NVC group rated their own empathy higher afterward <Cite pageId={PAGE_ID} n={[24, 25, 17]} />. The 2026 review judged the evidence for empathy and communication skills moderate. It judged the evidence for self-compassion low, and for anger very low <Cite pageId={PAGE_ID} n={17} />.
              </p>
              <p>
                Almost all of the studies relied on self-report, and some mixed NVC with other practices such as mindfulness <Cite pageId={PAGE_ID} n={[17, 26]} />. Other kinds of empathy training also raise empathy ratings in health students, so these gains may not be special to NVC <Cite pageId={PAGE_ID} n={27} />. One trial found a gain on a short self-report empathy scale three months later. It found no change on tests of perspective-taking or on a second empathy questionnaire <Cite pageId={PAGE_ID} n={24} />. The review&apos;s authors say the claim that NVC helps people in every setting is overstated <Cite pageId={PAGE_ID} n={17} />.
              </p>
              <p>
                All of these studies tested training led by people. We found no study of a self-guided tool or an AI coach, so we do not know if practicing with Nenya helps.
              </p>
              <p>
                We did not find a peer-reviewed paper that sets out a full critique of NVC&apos;s ideas. Critics write mostly online. One advocacy site argues that NVC can harm people who have less power, can pressure people to share feelings, and can reward smooth phrasing over honesty.
              </p>
              <p>
                How people read unclear events matters: seeing hostility in them goes with more aggressive responses, and accepting your own feelings without judging them goes with better mental health <Cite pageId={PAGE_ID} n={[28, 29, 30]} />. We found no study that tests the observation step by itself. Putting a feeling into words lowered distress a little in lab studies <Cite pageId={PAGE_ID} n={[31, 32]} />. In those studies, people did not expect it to help, and it also dampened pleasant feelings <Cite pageId={PAGE_ID} n={31} />. A bigger feelings vocabulary does not always go with better well-being. The results are mixed <Cite pageId={PAGE_ID} n={[33, 34, 35, 36]} />. Offering a choice tends to cause less defiance than pressure <Cite pageId={PAGE_ID} n={[37, 38, 39]} />. In one large experiment, though, neither kind of message changed what people said they would do <Cite pageId={PAGE_ID} n={37} />.
              </p>
              <p>
                None of this is medical or therapy advice, and no clinician has reviewed this page.
              </p>
            </div>
          </section>

          {/* Section 3: Complementary Practice and Resources */}
          <section className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl bg-gradient-to-r from-nenya-gold-dark via-nenya-gold to-nenya-gold-light bg-clip-text text-transparent">
                Nenya: Your Complementary Practice Partner
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Nenya isn&apos;t a replacement for what you actually learn from human connection. It is a separate tool for practicing the steps of NVC on your own. We hope this helps you in real conversations, but we have not tested whether it does. We think of Classical NVC as the foundational step this builds on, not something it replaces.
              </p>
            </div>

            {/* Trust & Disclaimer Bar */}
            <Alert className="border-orange-500/40 bg-orange-50 dark:bg-orange-950/30">
              <AlertTriangle className="size-4 text-orange-600 dark:text-orange-500" />
              <AlertDescription className="text-orange-900 dark:text-orange-200">
                <div className="space-y-3">
                  <div>
                    <strong>Affiliation Status:</strong> Nenya is an independent project and is <strong>not affiliated with, endorsed by, or a substitute for</strong> the Center for Nonviolent Communication (CNVC.org) or the NVC Academy (NVCacademy.com).
                  </div>
                  <div>
                    <strong>Seek Human Trainers:</strong> We encourage you to learn from human NVC trainers as well. The studies of NVC that we found all tested training led by people <Cite pageId={PAGE_ID} n={[17, 19, 24]} />.
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {/* Credit for the structure of Nenya's feelings-and-needs categories (see ATTRIBUTIONS.md). CNVC shares its inventory
                freely and asks to be credited in this form. */}
            <p id="cnvc-credit" className="text-xs leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Credit.</strong> The categories of feelings and needs that Nenya works with were informed by
              the structure of the{' '}
              <a
                href="https://www.cnvc.org/store/feelings-and-needs-inventory"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-nenya-gold-text"
              >
                Feelings and Needs Inventory
              </a>
              , which CNVC shares freely as a starting point. We are expanding and refining the categories, with other languages in mind. The Center for
              Nonviolent Communication © 2023, www.CNVC.org, cnvc@cnvc.org.
            </p>

            {/* Resource Links - Foundational Thinkers */}
            <Card className="p-6 bg-muted/30 border-nenya-gold/20">
              <div className="space-y-4">
                <h3 className="text-foreground">Resources for Exploration</h3>
                <p className="text-sm text-muted-foreground">
                  To learn more, we encourage you to read the work of these people. Their work informs our thinking. Linking to them does not mean they endorse Nenya.
                </p>
                <div className="space-y-3">
                  <Card className="p-4 bg-background/60 border-border">
                    <div className="flex items-start gap-3">
                      <ExternalLink className="size-4 text-nenya-gold-text mt-1 flex-shrink-0" />
                      <div className="space-y-1">
                        <a 
                          href="https://www.yvetteerasmus.com" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-nenya-gold-text transition-colors"
                        >
                          <h4 className="text-sm">YvetteErasmus.com</h4>
                        </a>
                        <p className="text-xs text-muted-foreground">
                          Clinical psychologist, author, and podcast host. She writes and teaches about self-compassion and moving from conflict to connection.
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 bg-background/60 border-border">
                    <div className="flex items-start gap-3">
                      <ExternalLink className="size-4 text-nenya-gold-text mt-1 flex-shrink-0" />
                      <div className="space-y-1">
                        <a 
                          href="https://www.mikikashtan.org" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-nenya-gold-text transition-colors"
                        >
                          <h4 className="text-sm">MikiKashtan.org</h4>
                        </a>
                        <p className="text-xs text-muted-foreground">
                          Co-founder of Bay Area Nonviolent Communication (BayNVC), with a doctorate in sociology. She applies NVC to social change and leadership.
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 bg-background/60 border-border">
                    <div className="flex items-start gap-3">
                      <ExternalLink className="size-4 text-nenya-gold-text mt-1 flex-shrink-0" />
                      <div className="space-y-1">
                        <a 
                          href="https://empathyfactor.com/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-nenya-gold-text transition-colors"
                        >
                          <h4 className="text-sm">EmpathyFactor.com - Marie Miyashiro</h4>
                        </a>
                        <p className="text-xs text-muted-foreground">
                          Trainer, speaker, and coach on empathy at work. Author of The Empathy Factor. Her training is based on Rosenberg&apos;s NVC.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </Card>

            {/* Resource Links - NVC Training */}
            <Card className="p-6 bg-muted/30">
              <div className="space-y-4">
                <h3 className="text-foreground">NVC Training and Certification</h3>
                <p className="text-sm text-muted-foreground">
                  These two organizations offer NVC training led by people. Listing them is not a partnership.
                </p>
                <div className="space-y-3">
                  <Card className="p-4 bg-background/60 border-border">
                    <div className="flex items-start gap-3">
                      <ExternalLink className="size-4 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                      <div className="space-y-1">
                        <a 
                          href="https://www.cnvc.org" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-nenya-gold-text transition-colors"
                        >
                          <h4 className="text-sm">CNVC.org (Center for Nonviolent Communication)</h4>
                        </a>
                        <p className="text-xs text-muted-foreground">
                          Founded by Marshall Rosenberg. It runs trainings and trainer certification, and shares resources.
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 bg-background/60 border-border">
                    <div className="flex items-start gap-3">
                      <ExternalLink className="size-4 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                      <div className="space-y-1">
                        <a 
                          href="https://nvcacademy.com" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-nenya-gold-text transition-colors"
                        >
                          <h4 className="text-sm">NVC Academy (Online Training)</h4>
                        </a>
                        <p className="text-xs text-muted-foreground">
                          An online library of courses and videos from certified NVC trainers, plus live online courses.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </Card>

            {/* Critical feedback */}
            <Card className="p-6">
              <h3 className="mb-2 text-base">Critical feedback is welcome</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                NVC has critics, and so does using an AI for something like this. We summarize what we found in the research section above. If you think NVC is the wrong method, that parts of it are used badly here, or that an AI should not be part of this at all, we would like to hear it. Write to{' '}
                <a href="mailto:info@nenya.biz?subject=Feedback%20about%20NVC%20and%20Nenya" className="underline underline-offset-2">info@nenya.biz</a>{' '}
                or use the report form. A person reads what arrives; we cannot promise a reply, and we may not agree, but we will read it.
              </p>
            </Card>

            {/* Final note */}
            <Card className="p-6 bg-gradient-to-br from-nenya-gold/5 to-nenya-gold-light/5 border-nenya-gold/30">
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                Nenya exists to make practicing NVC easier to reach. It does not replace the work you can do with trained facilitators and communities. Think of Nenya as training wheels: a free place to try the steps on your own before a real conversation. We do not know yet how well it works.
              </p>
            </Card>

            <ReferenceList pageId={PAGE_ID} items={NVC_REFS} />
          </section>

          <ReturnToTop onClick={scrollToTop} />
        </div>
      </div>
      
      {/* Scroll indicator */}
      <ScrollIndicator containerRef={scrollContainerRef} />

      <AppFooter />
    </div>
  );
}