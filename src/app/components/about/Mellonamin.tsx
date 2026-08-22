import { Card } from '../ui/card';
import { Shield, Heart, Leaf, Eye, Users } from 'lucide-react';

export default function Mellonamin() {
  return (
    <div className="space-y-8">
      {/* Header with Elvish Greeting */}
      <div className="text-center space-y-6 pb-8 border-b border-nenya-gold/30">
        <p className="text-2xl md:text-3xl text-nenya-gold-dark italic font-serif">
          "Elen síla lúmenn' omentielvo."
        </p>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          A star shines upon the hour of our meeting<br />
          <span className="text-xs">(A Quenya greeting)</span>
        </p>

        <div className="pt-4">
          <h1 className="text-3xl md:text-5xl bg-gradient-to-r from-nenya-gold-dark via-nenya-gold to-nenya-gold-light bg-clip-text text-transparent">
            Nenya
          </h1>
          <p className="text-xl md:text-2xl mt-2">
            A Welcome, and a Few Things Worth Knowing
          </p>
        </div>
      </div>

      {/* Section 1: Welcome */}
      <Card className="p-6 md:p-8 border-nenya-gold/30">
        <div className="space-y-6">
          <h2 className="text-2xl md:text-3xl">Welcome, Mellonamin</h2>

          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-nenya-gold-dark">Mellonamin</strong> means "my friend." That's really the whole
              spirit of this place — a quiet space to slow down for a moment and listen to yourself, without anyone
              watching or judging what you find.
            </p>

            <p>
              <span className="text-lg italic text-foreground"><strong>"Elen síla lúmenn' omentielvo"</strong></span> —
              "a star shines upon the hour of our meeting" — is how Tolkien's Elves greeted one another. It felt right
              here too: a small acknowledgment that arriving at this moment, however you got here, is worth pausing for.
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
          <h2 className="text-2xl md:text-3xl">A Private Place</h2>

          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              It's hard to be honest with yourself if part of you is wondering who else might see it. So the short
              version: nothing you do here is tracked, sold, or held onto. This isn't a policy we're promising to
              honor — it's how the thing is actually built.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="bg-gradient-to-br from-background-secondary to-background p-5 rounded-lg border border-nenya-accent-primary/20">
              <h4 className="text-foreground mb-2 flex items-center gap-2">
                <Eye className="size-4" />
                No accounts, no profile
              </h4>
              <p className="text-sm text-muted-foreground">
                You're not asked to be anyone here beyond the colors and choices you make in the moment. There's no
                advertising profile being built on you — there's nothing to build one from.
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 p-5 rounded-lg border border-nenya-gold/20">
              <h4 className="text-foreground mb-2 flex items-center gap-2">
                <Shield className="size-4" />
                Nothing stored, nothing kept
              </h4>
              <p className="text-sm text-muted-foreground">
                Your reflections live only for the length of your session. When you close the tab, they're gone —
                by design, not as an afterthought.
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            If you'd like the fuller, more technical picture of how this is handled, that lives on the
            Privacy Promise page. This is just the short, honest version.
          </p>
        </div>
      </Card>

      {/* Section 3: NVC+ */}
      <Card className="p-6 md:p-8 border-nenya-gold/30">
        <div className="space-y-6">
          <h2 className="text-2xl md:text-3xl">How This Space Listens</h2>

          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Underneath the colors and the breathing, this is built on <strong className="text-nenya-gold-dark">Nonviolent
              Communication</strong> — a way of paying attention to feelings and needs without rushing to judge them.
              The question isn't "what's wrong with you," it's "what's alive in you right now."
            </p>
          </div>

          <div className="bg-gradient-to-br from-background-secondary to-background p-6 rounded-lg border border-nenya-accent-primary/20 space-y-4">
            <h3 className="text-xl flex items-center gap-2">
              <Heart className="size-5 text-nenya-gold-dark" />
              Four Simple Shifts
            </h3>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-background/60 backdrop-blur-sm p-4 rounded-lg border border-green-500/20">
                <h4 className="text-foreground mb-1">Observe, don't judge</h4>
                <p className="text-sm text-muted-foreground">Notice what's happening without evaluating it first.</p>
              </div>
              <div className="bg-background/60 backdrop-blur-sm p-4 rounded-lg border border-green-500/20">
                <h4 className="text-foreground mb-1">Feel, don't think about feeling</h4>
                <p className="text-sm text-muted-foreground">Let the emotion be what it is, plainly.</p>
              </div>
              <div className="bg-background/60 backdrop-blur-sm p-4 rounded-lg border border-green-500/20">
                <h4 className="text-foreground mb-1">Find the need, not the strategy</h4>
                <p className="text-sm text-muted-foreground">What's actually underneath the feeling?</p>
              </div>
              <div className="bg-background/60 backdrop-blur-sm p-4 rounded-lg border border-green-500/20">
                <h4 className="text-foreground mb-1">Ask, don't demand</h4>
                <p className="text-sm text-muted-foreground">An open invitation, not a requirement — of yourself or anyone else.</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-background-secondary to-background p-6 rounded-lg border border-nenya-accent-secondary/20 space-y-3">
            <h3 className="text-xl flex items-center gap-2">
              <Users className="size-5 text-nenya-gold-dark" />
              Beyond just you
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Feelings don't happen in a vacuum. Sometimes what you're carrying isn't only personal — it's a
              reasonable response to something unfair or difficult around you. This space tries to leave room for
              that too, not just individual needs but the ones we share.
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
            We care about the actual, physical world this runs on too — Tolkien called it Arda. Keeping things
            private and mostly local isn't only about you; it also means this tool asks less of servers and power
            grids than most. We don't have a precise number to hand you, and we'd rather say that honestly than
            make one up.
          </p>
        </div>
      </Card>

      {/* Closing - Namarië */}
      <Card className="p-6 md:p-8 bg-gradient-to-br from-nenya-gold/5 via-background to-nenya-gold/10 border-nenya-gold/40 text-center">
        <p className="text-2xl text-nenya-gold-dark italic font-serif">
          Namarië.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          (Farewell — until we meet again.)
        </p>
      </Card>
    </div>
  );
}
