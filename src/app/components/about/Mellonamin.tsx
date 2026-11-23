import { Card } from '../ui/card';
import { Shield, Heart, Leaf, Eye, Users } from 'lucide-react';
import { Cite, ReferenceList, type AboutReference } from './AboutReferences';

const PAGE_ID = 'welcome';

const WELCOME_REFS: AboutReference[] = [
  { n: 1, text: "Büchi M, Festic N, Latzer M (2022). The Chilling Effects of Digital Dataveillance: A Theoretical Model and an Empirical Research Agenda. Big Data & Society.", href: "https://journals.sagepub.com/doi/pdf/10.1177/20539517211065368", linkLabel: "Free full text" },
  { n: 2, text: "De Castro B, Veerman J, Koops W, Bosch J, Monshouwer H (2002). Hostile Attribution of Intent and Aggressive Behavior: A Meta-Analysis. Child Development.", href: "https://onlinelibrary.wiley.com/doi/pdfdirect/10.1111/1467-8624.00447", linkLabel: "Free full text" },
  { n: 3, text: "DeWall C, Twenge J, Gitter S, Baumeister R (2009). It's the thought that counts: The role of hostile cognition in shaping aggressive responses to social exclusion. Journal of Personality and Social Psychology.", href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2775524/", linkLabel: "Free full text" },
  { n: 4, text: "Ford B, Lam P, John O, Mauss I (2018). The psychological health benefits of accepting negative emotions and thoughts: Laboratory, diary, and longitudinal evidence. Journal of Personality and Social Psychology.", href: "https://doi.org/10.1037/pspp0000157", linkLabel: "Free full text" },
  { n: 5, text: "Lieberman M, Inagaki T, Tabibnia G, Crockett M (2011). Subjective responses to emotional stimuli during labeling, reappraisal, and distraction. Emotion.", href: "https://doi.org/10.1037/a0023503", linkLabel: "Free full text" },
  { n: 6, text: "Creswell J, Way B, Eisenberger N, Lieberman M (2007). Neural Correlates of Dispositional Mindfulness During Affect Labeling. Psychosomatic Medicine.", href: "https://doi.org/10.1184/r1/6617267", linkLabel: "Free full text" },
  { n: 7, text: "Nolen-Hoeksema S, Wisco B, Lyubomirsky S (2008). Rethinking Rumination. Perspectives on Psychological Science.", href: "https://escholarship.org/content/qt8544f7w2/supp/Nolen-Hoeksema__Wisco____Lyubomirsky__2008", linkLabel: "Free full text" },
  { n: 8, text: "Chen B, Vansteenkiste M, Beyers W, Boone L, Deci E, Van der Kaap-Deeder J, et al. (2014). Basic psychological need satisfaction, need frustration, and need strength across four cultures. Motivation and Emotion.", href: "https://dipot.ulb.ac.be/dspace/bitstream/2013/409773/3/Chen2015.pdf", linkLabel: "Free full text (author manuscript)" },
  { n: 9, text: "Martela F, Sheldon K (2019). Clarifying the Concept of Well-Being: Psychological Need Satisfaction as the Common Core Connecting Eudaimonic and Subjective Well-Being. Review of General Psychology.", href: "https://research.aalto.fi/en/publications/49998c82-03fe-42c0-846a-8bf0cf9c16a8", linkLabel: "Free full text" },
  { n: 10, text: "Kenrick D, Griskevicius V, Neuberg S, Schaller M (2010). Renovating the Pyramid of Needs. Perspectives on Psychological Science.", href: "https://www.ncbi.nlm.nih.gov/pmc/articles/3161123", linkLabel: "Free full text" },
  { n: 11, text: "Legate N, Nguyen T, Weinstein N, Moller A, Legault L, et al. (2022). A global experiment on motivating social distancing during the COVID-19 pandemic. Proceedings of the National Academy of Sciences.", href: "https://doi.org/10.1073/pnas.2111091119", linkLabel: "Free full text" },
  { n: 12, text: "Van Petegem S, Soenens B, Vansteenkiste M, Beyers W (2015). Rebels With a Cause? Adolescent Defiance From the Perspective of Reactance Theory and Self-Determination Theory. Child Development.", href: "https://dipot.ulb.ac.be/dspace/bitstream/2013/409766/3/CD2015_AAM.pdf", linkLabel: "Free full text (author manuscript)" },
  { n: 13, text: "Weinstein N, Itzchakov G, Legate N (2022). The motivational value of listening during intimate and difficult conversations. Social and Personality Psychology Compass.", href: "https://onlinelibrary.wiley.com/doi/pdfdirect/10.1111/spc3.12651", linkLabel: "Free full text" },
  { n: 14, text: "Kirkbride J, Anglin D, Colman I, Dykxhoorn J, Jones P, Patalay P, et al. (2024). The social determinants of mental health and disorder: evidence, prevention and recommendations. World Psychiatry.", href: "https://onlinelibrary.wiley.com/doi/pdfdirect/10.1002/wps.21160", linkLabel: "Free full text" },
  { n: 15, text: "Pascoe E, Smart Richman L (2009). Perceived discrimination and health: A meta-analytic review. Psychological Bulletin.", href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2747726/", linkLabel: "Free full text" },
  { n: 16, text: "Mikula G, Scherer K, Athenstaedt U (1998). The Role of Injustice in the Elicitation of Differential Emotional Reactions. Personality and Social Psychology Bulletin.", href: "https://archive-ouverte.unige.ch/unige:102069", linkLabel: "Free full text" },
];


export default function Mellonamin() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-6 pb-8 border-b border-nenya-gold/30">
        <div className="pt-4">
          <h1 className="text-3xl md:text-5xl bg-gradient-to-r from-nenya-gold-dark via-nenya-gold to-nenya-gold-light bg-clip-text text-transparent">
            Nenya
          </h1>
          <p className="text-xl md:text-2xl mt-2">
            You may rest here
          </p>
        </div>
      </div>

      {/* Section 1: Welcome */}
      <Card className="p-6 md:p-8 border-nenya-gold/30">
        <div className="space-y-6">
          <h2 className="text-2xl md:text-3xl">Welcome</h2>

          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              This is a quiet space to slow down for a moment and listen to yourself. In the reflection tools, no one
              else sees what you find. The name is meant as an invitation: <strong className="text-nenya-gold-text">you may
              rest here</strong>.
            </p>

            <p>
              Arriving at this moment, however you got here, is worth pausing for.
            </p>

            <p>
              You don't need to have anything figured out before you begin. There's no performance expected — just
              breathing, and if you'd like, a gentle way of noticing what's actually going on inside you.
            </p>
          </div>
        </div>
      </Card>

      {/* Section 2: Privacy */}
      <Card className="p-6 md:p-8 border-nenya-gold/30">
        <div className="space-y-6">
          <h2 className="text-2xl md:text-3xl">What stays, and what leaves, your device</h2>

          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              It can be hard to be honest with yourself if you think someone else might see it <Cite pageId={PAGE_ID} n={1} />. So the short
              version: what you write, draw, or choose in the reflection tools stays on your device. It isn't sent to
              us, it isn't sold, and it's gone when you close the tab. This isn't a policy we're promising to
              honor — it's how the tools are built, and the code is public, so you can check.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="bg-gradient-to-br from-background-secondary to-background p-5 rounded-lg border border-nenya-accent-primary/20">
              <h4 className="text-foreground mb-2 flex items-center gap-2">
                <Eye className="size-4" />
                No account needed, no profile
              </h4>
              <p className="text-sm text-muted-foreground">
                You're not asked to be anyone here beyond the colors and choices you make in the moment. We build no
                advertising profile of you. (The optional coach demo and the contact form are the only places anything you type leaves your browser, and only if you choose to use them. Parts of a report you made go to the coach only if you choose to bring them, and you see exactly what would go first. One color goes to a palette service only if you press the button that says so.) Our web host keeps ordinary connection records and anonymous visit totals; the Privacy Promise and the Terms explain them.
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 p-5 rounded-lg border border-nenya-gold/20">
              <h4 className="text-foreground mb-2 flex items-center gap-2">
                <Shield className="size-4" />
                Nothing stored, nothing kept
              </h4>
              <p className="text-sm text-muted-foreground">
                Your reflections live only for the length of your session. When you close the tab, they're gone —
                by design, not as an afterthought. Only if you choose to, a few settings (such as text size) can be
                remembered on your device, and the "Forget me" button erases them.
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            If you'd like the fuller, more technical picture of how this is handled, that lives on the
            Privacy Promise page. This is just the short, honest version.
          </p>
        </div>
      </Card>

      {/* Section 3: How this space listens (Nonviolent Communication) */}
      <Card className="p-6 md:p-8 border-nenya-gold/30">
        <div className="space-y-6">
          <h2 className="text-2xl md:text-3xl">How This Space Listens</h2>

          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              The lessons and the optional coach are built on <strong className="text-nenya-gold-text">Nonviolent
              Communication</strong>. It is a way to pay attention to feelings and needs without rushing to judge them.
              The question isn't "what's wrong with you," it's "what's alive in you right now."
            </p>
          </div>

          <div className="bg-gradient-to-br from-background-secondary to-background p-6 rounded-lg border border-nenya-accent-primary/20 space-y-4">
            <h3 className="text-xl flex items-center gap-2">
              <Heart className="size-5 text-nenya-gold-text" />
              Four Simple Shifts
            </h3>
            <p className="text-sm text-muted-foreground">
              These are habits to try, not a tested program. The page called Our Approach says what research does and does not show.
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-background/60 backdrop-blur-sm p-4 rounded-lg border border-green-500/20">
                <h4 className="text-foreground mb-1">Notice first, judge later</h4>
                <p className="text-sm text-muted-foreground">Notice what is happening before you decide what it means <Cite pageId={PAGE_ID} n={[2, 3, 4]} />.</p>
              </div>
              <div className="bg-background/60 backdrop-blur-sm p-4 rounded-lg border border-green-500/20">
                <h4 className="text-foreground mb-1">Name the feeling, simply</h4>
                <p className="text-sm text-muted-foreground">One plain word for what you feel can ease it a little. Going over and over why can keep low mood going <Cite pageId={PAGE_ID} n={[5, 6, 7]} />.</p>
              </div>
              <div className="bg-background/60 backdrop-blur-sm p-4 rounded-lg border border-green-500/20">
                <h4 className="text-foreground mb-1">Ask what you need, not only what to do</h4>
                <p className="text-sm text-muted-foreground">Behind a feeling there is often something you need, such as rest, respect, or company <Cite pageId={PAGE_ID} n={[8, 9, 10]} />.</p>
              </div>
              <div className="bg-background/60 backdrop-blur-sm p-4 rounded-lg border border-green-500/20">
                <h4 className="text-foreground mb-1">Ask, don't demand</h4>
                <p className="text-sm text-muted-foreground">Offer a choice instead of an order, to yourself or to anyone else. Pressure can bring defiance instead of agreement <Cite pageId={PAGE_ID} n={[11, 12, 13]} />.</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-background-secondary to-background p-6 rounded-lg border border-nenya-accent-secondary/20 space-y-3">
            <h3 className="text-xl flex items-center gap-2">
              <Users className="size-5 text-nenya-gold-text" />
              Beyond just you
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Feelings do not happen in a vacuum. Unfair or hard conditions around you can add to what you feel <Cite pageId={PAGE_ID} n={[14, 15, 16]} />. Sometimes what you carry is not only personal. This space tries to leave room for
              that, and for the needs we share.
            </p>
          </div>
        </div>
      </Card>

      {/* Section 4: A lighter footprint */}
      <Card className="p-6 md:p-8 border-nenya-gold/30">
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl flex items-center gap-2">
            <Leaf className="size-6 text-green-700 dark:text-green-400" />
            A Lighter Footprint
          </h2>

          <p className="text-sm text-muted-foreground leading-relaxed">
            We care about the actual, physical world this runs on too. Keeping things
            private and mostly local may also ask less of servers and power grids. We have not measured this. We don't have a precise number to hand you, and we'd rather say that honestly than
            make one up.
          </p>
        </div>
      </Card>

      {/* Closing */}
      <Card className="p-6 md:p-8 bg-gradient-to-br from-nenya-gold/5 via-background to-nenya-gold/10 border-nenya-gold/40 text-center">
        <p className="text-2xl text-nenya-gold-text italic font-serif">
          Take your time.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          You may rest here.
        </p>
      </Card>

      <ReferenceList pageId={PAGE_ID} items={WELCOME_REFS} />
    </div>
  );
}
