import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ReturnToTop } from '../ReturnToTop';
import { ScrollIndicator } from '../ScrollIndicator';
import { AppFooter } from '../AppFooter';
import { Cite, ReferenceList, type AboutReference } from './AboutReferences';

// The numbers in the text match this list (About thesis, chapter 1; docs/about-thesis.md).
const REFERENCES: AboutReference[] = [
  { n: 1, text: "Lehrer P, Gevirtz R (2014). Heart rate variability biofeedback: how and why does it work? Frontiers in Psychology.", href: "https://www.frontiersin.org/articles/10.3389/fpsyg.2014.00756/pdf", linkLabel: "Free full text" },
  { n: 2, text: "Zaccaro A, Piarulli A, Laurino M, Garbella E, Menicucci D, Neri B et al. (2018). How Breath-Control Can Change Your Life: A Systematic Review on Psycho-Physiological Correlates of Slow Breathing. Frontiers in Human Neuroscience.", href: "https://www.frontiersin.org/articles/10.3389/fnhum.2018.00353/pdf", linkLabel: "Free full text" },
  { n: 3, text: "Russo M, Santarelli D, O’Rourke D (2017). The physiological effects of slow breathing in the healthy human. Breathe.", href: "https://breathe.ersjournals.com/content/breathe/13/4/298.full.pdf", linkLabel: "Free full text" },
  { n: 4, text: "Vaschillo E, Vaschillo B, Lehrer P (2006). Characteristics of Resonance in Heart Rate Variability Stimulated by Biofeedback. Applied Psychophysiology and Biofeedback.", href: "https://doi.org/10.1007/s10484-006-9009-3", linkLabel: "Publisher page (may need payment)" },
  { n: 5, text: "Steffen P, Austin T, DeBarros A, Brown T (2017). The Impact of Resonance Frequency Breathing on Measures of Heart Rate Variability, Blood Pressure, and Mood. Frontiers in Public Health.", href: "https://www.frontiersin.org/articles/10.3389/fpubh.2017.00222/pdf", linkLabel: "Free full text" },
  { n: 6, text: "Courtney R (2017). Breathing training for dysfunctional breathing in asthma: taking a multidimensional approach. ERJ Open Research.", href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5721258/", linkLabel: "Free full text" },
  { n: 7, text: "Debreczeni R, Amrein I, Kamondi A, Szirmai I (2009). Hypocapnia Induced by Involuntary Hyperventilation during Mental Arithmetic Reduces Cerebral Blood Flow Velocity. The Tohoku Journal of Experimental Medicine.", href: "https://www.jstage.jst.go.jp/article/tjem/217/2/217_2_147/_pdf", linkLabel: "Free full text" },
  { n: 8, text: "Cleveland Clinic. Pursed-lip breathing (health library page). Page read 2026-11-22.", href: "https://my.clevelandclinic.org/health/treatments/9443-pursed-lip-breathing", linkLabel: "Free full text" },
  { n: 9, text: "Holland A, Hill C, Jones A, McDonald C (2012). Breathing exercises for chronic obstructive pulmonary disease. Cochrane Database of Systematic Reviews.", href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11371308/", linkLabel: "Free full text" },
  { n: 10, text: "Santino T, Chaves G, Freitas D, Fregonezi G, Mendonça K (2020). Breathing exercises for adults with asthma. Cochrane Database of Systematic Reviews.", href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7096190/", linkLabel: "Free full text" },
  { n: 11, text: "US National Center for Complementary and Integrative Health (part of NIH). Relaxation Techniques: What You Need To Know. Page read 2026-11-22.", href: "https://www.nccih.nih.gov/health/relaxation-techniques-what-you-need-to-know", linkLabel: "Free full text" },
  { n: 12, text: "Boulding R, Stacey R, Niven R, Fowler S (2016). Dysfunctional breathing: a review of the literature and proposal for classification. European Respiratory Review.", href: "https://err.ersjournals.com/content/errev/25/141/287.full.pdf", linkLabel: "Free full text" },
  { n: 13, text: "Fincham G, Strauss C, Montero-Marin J, Cavanagh K (2023). Effect of breathwork on stress and mental health: A meta-analysis of randomised-controlled trials. Scientific Reports.", href: "https://www.nature.com/articles/s41598-022-27247-y.pdf", linkLabel: "Free full text" },
  { n: 14, text: "Bernardi L, Porta C, Spicuzza L, Bellwon J, Spadacini G, Frey A et al. (2002). Slow Breathing Increases Arterial Baroreflex Sensitivity in Patients With Chronic Heart Failure. Circulation.", href: "https://doi.org/10.1161/hc0202.103311", linkLabel: "Publisher page (may need payment)" },
  { n: 15, text: "Joseph C, Porta C, Casucci G, Casiraghi N, Maffeis M, Rossi M et al. (2005). Slow Breathing Improves Arterial Baroreflex Sensitivity and Decreases Blood Pressure in Essential Hypertension. Hypertension.", href: "https://doi.org/10.1161/01.hyp.0000179581.68566.7d", linkLabel: "Publisher page (may need payment)" },
  { n: 16, text: "Li C, Chang Q, Zhang J, Chai W (2018). Effects of slow breathing rate on heart rate variability and arterial baroreflex sensitivity in essential hypertension. Medicine.", href: "https://doi.org/10.1097/md.0000000000010639", linkLabel: "Free full text" },
  { n: 17, text: "Laborde S, Allen M, Borges U, Dosseville F, Hosang T, Iskra M et al. (2022). Effects of voluntary slow breathing on heart rate and heart rate variability: A systematic review and a meta-analysis. Neuroscience & Biobehavioral Reviews.", href: "https://www.sciencedirect.com/science/article/am/pii/S0149763422002007", linkLabel: "Free full text" },
  { n: 18, text: "Williams D, Cash C, Rankin C, Bernardi A, Koenig J, Thayer J et al. (2015). Resting heart rate variability predicts self-reported difficulties in emotion regulation: a focus on different facets of emotion regulation. Frontiers in Psychology.", href: "https://www.frontiersin.org/articles/10.3389/fpsyg.2015.00261/pdf", linkLabel: "Free full text" },
  { n: 19, text: "Laborde S, Mosley E, Thayer J (2017). Heart Rate Variability and Cardiac Vagal Tone in Psychophysiological Research – Recommendations for Experiment Planning, Data Analysis, and Data Reporting. Frontiers in Psychology.", href: "https://www.frontiersin.org/articles/10.3389/fpsyg.2017.00213/pdf", linkLabel: "Free full text" },
  { n: 20, text: "Shaffer F, Ginsberg J (2017). An Overview of Heart Rate Variability Metrics and Norms. Frontiers in Public Health.", href: "https://www.frontiersin.org/articles/10.3389/fpubh.2017.00258/pdf", linkLabel: "Free full text" },
  { n: 21, text: "Balban M, Neri E, Kogon M, Weed L, Nouriani B, Jo B et al. (2023). Brief structured respiration practices enhance mood and reduce physiological arousal. Cell Reports Medicine.", href: "https://doi.org/10.1016/j.xcrm.2022.100895", linkLabel: "Free full text" },
  { n: 22, text: "Bernardi L, Sleight P, Bandinelli G, Cencetti S, Fattorini L, Wdowczyc-Szulc J et al. (2001). Effect of rosary prayer and yoga mantras on autonomic cardiovascular rhythms: comparative study. BMJ.", href: "https://europepmc.org/pmc/articles/PMC61046", linkLabel: "Free full text" },
  { n: 23, text: "Schmidt N, Woolaway-Bickel K, Trakowski J, Santiago H, Storey J, Koselka M et al. (2000). Dismantling cognitive–behavioral treatment for panic disorder: Questioning the utility of breathing retraining. Journal of Consulting and Clinical Psychology.", href: "https://doi.org/10.1037/0022-006x.68.3.417", linkLabel: "Publisher page (may need payment)" },
  { n: 24, text: "Magnon V, Dutheil F, Vallet G (2021). Benefits from one session of deep and slow breathing on vagal tone and anxiety in young and older adults. Scientific Reports.", href: "https://www.nature.com/articles/s41598-021-98736-9.pdf", linkLabel: "Free full text" },
  { n: 25, text: "Hopper S, Murray S, Ferrara L, Singleton J (2019). Effectiveness of diaphragmatic breathing for reducing physiological and psychological stress in adults: a quantitative systematic review. JBI Database of Systematic Reviews and Implementation Reports.", href: "https://doi.org/10.11124/jbisrir-2017-003848", linkLabel: "Publisher page (may need payment)" },
];

const C = ({ n }: { n: number[] }) => <Cite pageId="breath" n={n} />;

interface BreathingToolProps {
  onBack: () => void;
}

export default function BreathingTool({ onBack }: BreathingToolProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div ref={scrollContainerRef} className="size-full overflow-auto scroll-container bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border px-6 py-4 sticky top-0 bg-background z-10">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="size-5" />
        </Button>
        <h1>About the Breathing Tool</h1>
      </div>

      {/* Content */}
      <div className="w-full">
        <div className="mx-auto max-w-4xl px-6 py-12 space-y-8">
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            The pulsing animation on the welcome screen is a breathing guide. In many studies, breathing at about six breaths a
            minute gave the biggest swings in heart rate. Researchers call this <strong>resonance breathing</strong> <C n={[1, 2, 3]} />.
            In studies from the same research group, the best rate differed from person to person <C n={[1, 4]} />. In one small
            experiment, breathing at a person's own best rate raised positive mood more than breathing one breath a minute faster <C n={[5]} />.
          </p>

          <Card className="bg-card/80 dark:bg-card/50 backdrop-blur-sm border-border p-6 space-y-3" aria-labelledby="breathing-safety">
            <h2 id="breathing-safety" className="text-xl md:text-2xl text-center">Safety and sources</h2>
            <p>Stop and return to normal breathing if you feel dizzy or lightheaded <C n={[6, 7, 8]} />. If six seconds feels too long, choose a shorter count, such as four or five seconds each, and build up slowly. This is our own advice, not a clinical rule. Check with a health professional before you try slow or paced breathing if you have asthma, COPD, or a heart or lung condition. Check too if you are managing symptoms <C n={[6, 9, 10, 11]} />.</p>
            <p className="text-sm text-muted-foreground">What stands behind this, and where it stops:</p>
            <ul className="list-disc space-y-2 pl-5 text-sm">
              <li>Dizziness is a recognised sign of over-breathing, which lowers carbon dioxide in the blood <C n={[6, 7, 12]} />. One review of breathing training in asthma says slow, controlled breathing can make some people over-breathe. It also says that, in severe lung disease, some deep belly breathing can make breathlessness worse <C n={[6]} />. Courtney R. “Breathing training for dysfunctional breathing in asthma: taking a multidimensional approach.” <em>ERJ Open Research</em> 2017;3(4):00065-2017. <a className="underline underline-offset-4" href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5721258" target="_blank" rel="noopener noreferrer">Read it (opens in a new tab)</a>.</li>
              <li>The Cleveland Clinic, in its guidance on pursed-lip breathing (a related technique, not this one), says to take a break if you feel dizzy, lightheaded or tired, and to make sure the technique is right for your situation. <a className="underline underline-offset-4" href="https://my.clevelandclinic.org/health/treatments/9443-pursed-lip-breathing" target="_blank" rel="noopener noreferrer">Read it (opens in a new tab)</a>.</li>
              <li>The benefits described here come mostly from studies of healthy adults. The evidence for mood and stress is smaller and mixed, and many studies are small or use weak methods <C n={[2, 13, 3]} />. A systematic review of slow breathing (under ten breaths a minute): Zaccaro A. et al., <em>Frontiers in Human Neuroscience</em> 2018;12:353. <a className="underline underline-offset-4" href="https://pubmed.ncbi.nlm.nih.gov/30245619/" target="_blank" rel="noopener noreferrer">Read it (opens in a new tab)</a>.</li>
              <li>The advice to check first if you have a heart condition is a general precaution. Small studies have tested slow breathing in people with heart failure or high blood pressure, with researchers present <C n={[14, 15, 16]} />. They do not show that trying it alone is safe.</li>
            </ul>
            <p className="text-xs text-muted-foreground">This is general information, not medical advice. It does not replace the advice of your own health professional. No clinician has reviewed this page.</p>
          </Card>

          <Card className="bg-card/80 dark:bg-card/50 backdrop-blur-sm border-border p-6 space-y-4">
            <h2 className="text-xl md:text-2xl text-center">One Approach: Resonance Breathing</h2>
            <p className="text-lg md:text-xl">
              The Breathing Tool starts at <strong>six seconds in and six seconds out, about 5 breaths per minute</strong>.
              Many studies used about six breaths a minute, so this default is slightly slower <C n={[1, 2, 3]} />.
              You can choose another pace, or set your own. The tool keeps one whole breath between 4 and 40 seconds. We chose
              these limits ourselves, and no clinician has checked them. In studies of mostly healthy adults, breathing slowly
              changed how the heart and blood vessels respond to each breath <C n={[17, 2, 3]} />. In these studies, breathing at about this pace:
            </p>

            <ul className="space-y-3 text-base md:text-lg pl-6">
              <li className="list-disc">
                <strong>Can raise heart rate variability (HRV),</strong> the small changes in the time between heartbeats <C n={[17, 2, 3]} />.
                Researchers link higher HRV at rest with better handling of stress and emotions. It is a rough measure, not a test
                of resilience <C n={[18, 19, 20]} />.
              </li>
              <li className="list-disc">
                <strong>Can make the baroreflex react more strongly</strong> <C n={[16, 3, 1]} />. The baroreflex is one of the body's
                quick controls of blood pressure <C n={[3, 1, 16]} />. People often report feeling calmer or happier during slow
                breathing. We do not know that the baroreflex is the cause <C n={[2, 21, 5]} />.
              </li>
              <li className="list-disc">
                <strong>Can line up the heart's rhythm with the breathing rhythm</strong> <C n={[22, 3, 1]} />. In trials, slow-breathing
                practices lowered self-reported stress by a small to medium amount. Results varied, and many trials had weak methods <C n={[13, 2, 21]} />.
              </li>
            </ul>

            <p className="text-base md:text-lg">
              Not every result is positive. In one trial for panic disorder, breathing training added no benefit to other care <C n={[23]} />.
              Some people feel more anxious while they try to relax <C n={[2, 11]} />.
            </p>
          </Card>

          <Card className="bg-card/80 dark:bg-card/50 backdrop-blur-sm border-border p-6 space-y-4">
            <h2 className="text-xl md:text-2xl text-center">Your Built-In Breathing Pacer</h2>
            <p className="text-lg md:text-xl">
              If you breathe in as the pulse brightens and out as it softens, you are doing paced breathing. It has modest
              support from small studies <C n={[13, 17, 2]} />.
            </p>
            <p className="text-lg md:text-xl">
              This is the first step in the tool: a quiet pause. We offer it as a short pause before the reflection. In some
              studies, one short session of slow breathing lowered anxiety a little <C n={[24, 13, 25]} />. We did not find a study
              showing that it makes reflection easier.
            </p>
          </Card>

          <ReferenceList pageId="breath" items={REFERENCES} />

          <ReturnToTop onClick={scrollToTop} />
        </div>
      </div>

      <ScrollIndicator containerRef={scrollContainerRef} />
      <AppFooter />
    </div>
  );
}
