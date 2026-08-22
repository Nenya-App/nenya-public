import React from 'react';
import { ArrowLeft, Shield, Brain, AlertTriangle, BookOpen, Users, TrendingDown, Scale, Eye, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { BloomInstant, BloomOnScroll } from '../BloomOnScroll';
import { ReturnToTop } from '../ReturnToTop';

interface PrivacyPromiseProps {
  onBack: () => void;
  onNavigateToNamePhilosophy?: () => void;
}

export default function PrivacyPromise({ onBack, onNavigateToNamePhilosophy }: PrivacyPromiseProps) {
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
        <h1>Architectural Integrity: Rejecting the Costs of Surveillance</h1>
      </div>

      {/* Content */}
      <div className="w-full">
        <div className="mx-auto max-w-4xl px-6 py-12 space-y-12">
          
          {/* Section 1: The Philosophical Rebuttal */}
          <section className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl bg-gradient-to-r from-nenya-accent-secondary via-nenya-accent-primary to-nenya-accent-warm bg-clip-text text-transparent">
                Rejecting Surveillance Capitalism
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Emotional safety requires absolute trust. You cannot be vulnerable if you fear your reflections might be data-mined, sold, or leaked. The prevailing business model of "Surveillance Capitalism"—which seeks to create an <strong>all-seeing eye</strong> that monitors and controls every aspect of human behavior for maximum profit—is fundamentally incompatible with building authentic well-being. Our architecture is a direct countermeasure to this extractive practice.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Like the <strong>palantíri of Fëanor</strong> (seeing-stones built for total surveillance) and the <strong>One Ring of Sauron</strong> (forged for absolute control), modern surveillance technologies promise connection and convenience while delivering domination and corruption. Our name—<strong>Nenya</strong>—represents a different philosophy entirely.
              </p>
              {onNavigateToNamePhilosophy && (
                <Button 
                  variant="outline" 
                  onClick={onNavigateToNamePhilosophy}
                  className="gap-2"
                >
                  <ExternalLink className="size-4" />
                  Read more: Our Name & Philosophy
                </Button>
              )}
            </div>

            {/* Foucault Critique Box */}
            <Card className="p-6 bg-gradient-to-br from-slate-50 to-zinc-50 dark:from-slate-900 dark:to-zinc-900 border-slate-300 dark:border-slate-700">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-slate-500/10 flex items-center justify-center">
                    <Eye className="size-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <h3 className="text-slate-900 dark:text-slate-100">Agency vs. Surveillance</h3>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  Being watched changes how people think and what they're willing to admit to themselves, even when nothing is said aloud. If a space for reflection is also a space being monitored, that changes what happens inside it. Nenya's commitment to erasing data as it goes is about <strong>restoring agency</strong> — protecting your right to your own self-knowledge, on your own terms.
                </p>
              </div>
            </Card>
          </section>

          {/* Section 2: Architectural Promise */}
          <section className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl bg-gradient-to-r from-nenya-accent-secondary via-nenya-accent-primary to-nenya-accent-warm bg-clip-text text-transparent">
                Our Architectural Commitment
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                This is why we have a fundamental, architectural allergy to collecting Personal Identifiable Information (PII). Our design philosophy is a direct rebuttal to the extractive practices of Big Tech. We believe your inner life is not a resource to be mined.
              </p>
            </div>

            <div className="space-y-4">
              <Card className="p-6 bg-gradient-to-br from-background-secondary to-background border-nenya-accent-primary/30">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Users className="size-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-blue-900 dark:text-blue-100">You are your Colors, Not a Product</h3>
                    <p className="text-sm text-blue-800/80 dark:text-blue-200/80">
                      Your Hex Code identity is your only required identifier. We do not build an advertising profile on you because we see you as a person, not a commodity.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border-emerald-200 dark:border-emerald-800">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <Brain className="size-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-emerald-900 dark:text-emerald-100">On-Device Processing (The Goal)</h3>
                    <p className="text-sm text-emerald-800/80 dark:text-emerald-200/80">
                      We are engineering the system so your conversations with Nenya are processed directly on your own device. In this ideal state, your most private reflections never even touch our servers, making data extraction impossible.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-background-secondary to-background border-nenya-accent-metallic/30">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="size-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-purple-900 dark:text-purple-100">Temporary, Local Storage</h3>
                    <p className="text-sm text-purple-800/80 dark:text-purple-200/80">
                      For the app to function smoothly, your current conversation might be stored temporarily in your device's active memory (RAM). When you end your session or close the app, this local data is cleared. Think of it like a whiteboard that is wiped clean after use.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <TrendingDown className="size-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-amber-900 dark:text-amber-100">No Tracking, No Profiles, No Ads</h3>
                    <p className="text-sm text-amber-800/80 dark:text-amber-200/80">
                      We do not track you across the internet. We do not build a profile of you. We do not host advertisements. Our success is measured by your growth in emotional literacy, not by your engagement metrics.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Economic Cost Addition */}
            <Card className="p-6 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950 dark:to-pink-950 border-rose-200 dark:border-rose-800">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Scale className="size-5 text-rose-600 dark:text-rose-400" />
                  <h3 className="text-rose-900 dark:text-rose-100">The Economic Cost of Emotional and Spiritual Atrophy</h3>
                </div>
                <p className="text-sm text-rose-800/80 dark:text-rose-200/80 leading-relaxed">
                  Our success is measured by your growth in emotional literacy, not by your engagement metrics. The collective economic cost of emotional and spiritual atrophy in the US—amounting to trillions in lost productivity and healthcare <sup>[1]</sup>—proves that exploiting inner life is financially ruinous in the long term. By securing your inner life, we protect the foundational resilience needed for human performance.
                </p>
              </div>
            </Card>
          </section>

          {/* Section 3: The Academic Mandate & Critical Disclaimer */}
          <section className="space-y-6">
            <Alert className="border-orange-500/60 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/50 dark:to-amber-950/50">
              <AlertTriangle className="size-5 text-orange-600 dark:text-orange-500" />
              <AlertDescription className="text-orange-900 dark:text-orange-200">
                <div className="space-y-4">
                  <h3 className="text-lg text-orange-950 dark:text-orange-100">
                    The Academic Mandate: Critical Thinking and AI Use
                  </h3>
                  <p className="text-sm leading-relaxed">
                    Nenya is a Large Language Model (LLM) and a computational tool, not a human expert. While its outputs are grounded in academic research and synthesized data, the following ethical standards must be applied by all users:
                  </p>
                  <ol className="space-y-3 text-sm list-decimal list-inside">
                    <li className="leading-relaxed">
                      <strong>AI is Not Fact:</strong> Any information, insight, or reference presented by Nenya should be treated as synthetic analysis, not established fact. We encourage users to verify critical information independently with trusted sources.
                    </li>
                    <li className="leading-relaxed">
                      <strong>Verify Bias:</strong> LLMs are trained on vast and often flawed human data, reflecting systemic biases (e.g., political, cultural, historical). The onus is on the user to apply <strong>critical thinking</strong> and <strong>self-examination</strong> to identify and work with their own internal biases, which may be reflected back by the tool.
                    </li>
                    <li className="leading-relaxed">
                      <strong>No Clinical Authority:</strong> Nenya is for reflection and practice only. It does not provide medical, legal, or therapeutic advice.
                    </li>
                    <li className="leading-relaxed">
                      <strong>Truth and Creative Expression:</strong> We reject authoritarian attempts to control truth-telling or suppress creative expression. Nenya is designed to facilitate truth-telling for the self, but the ultimate authority on your reality and bias rests with you.
                    </li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          </section>

          {/* Section 4: Key Academic Resources */}
          <section className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <BookOpen className="size-6 text-muted-foreground" />
                <h2 className="text-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                  Key Critics and Foundational Research
                </h2>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Nenya's philosophical framework draws from diverse academic and critical traditions. We encourage you to explore these foundational thinkers and areas of research:
              </p>
            </div>

            <div className="space-y-4">
              <Card className="p-6 bg-muted/30 border-border">
                <div className="space-y-3">
                  <h3 className="text-foreground">Shoshana Zuboff</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong>Surveillance Capitalism:</strong> Leading critic of the extractive economic model that commodifies human experience and predicts a move toward a "controlled hive".
                  </p>
                </div>
              </Card>

              <Card className="p-6 bg-muted/30 border-border">
                <div className="space-y-3">
                  <h3 className="text-foreground">Michel Foucault</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong>Power-Knowledge & Surveillance:</strong> Challenged traditional notions of power, showing how institutions use knowledge and surveillance to shape individual reality and behavior.
                  </p>
                </div>
              </Card>

              <Card className="p-6 bg-muted/30 border-border">
                <div className="space-y-3">
                  <h3 className="text-foreground">Digital Rights & Privacy Critics</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong>Dissolution of Rights:</strong> Argued against governmental and corporate overreach in data markets and the deceleration of innovation caused by poorly executed regulations.
                  </p>
                </div>
              </Card>

              <Card className="p-6 bg-muted/30 border-border">
                <div className="space-y-3">
                  <h3 className="text-foreground">Patriarchy & Emotional Suppression</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong>Costs of Devaluation:</strong> Academic work identifying how ideologies (like patriarchy) assign more worth to rationality than emotion, leading to suppressed feelings and mental health risks. <sup>[2]</sup>
                  </p>
                </div>
              </Card>

              <Card className="p-6 bg-muted/30 border-border">
                <div className="space-y-3">
                  <h3 className="text-foreground">The Economic Burden of Emotional and Spiritual Atrophy</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong>Societal Cost of Deficits:</strong> Research quantifying the multi-trillion dollar cost of low emotional intelligence, lack of empathy, and poor self-compassion across the US economy. <sup>[1]</sup>
                  </p>
                </div>
              </Card>
            </div>

            {/* References Note */}
            <Card className="p-4 bg-muted/20 border-border">
              <p className="text-xs text-muted-foreground italic">
                <strong>Note:</strong> [1] and [2] refer to aggregated research on economic and psychological impacts. Users are encouraged to independently verify and explore these topics through academic databases and trusted research institutions.
              </p>
            </Card>
          </section>

          {/* Section 5: Features Under Development */}
          <section className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl bg-gradient-to-r from-nenya-accent-secondary via-nenya-accent-primary to-nenya-accent-metallic bg-clip-text text-transparent">
                Advanced Privacy Features in Development
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We are actively developing additional privacy and security features to further protect your safety and agency. These features represent our ongoing commitment to user sovereignty and protection against surveillance.
              </p>
            </div>

            <div className="space-y-4">
              <Card className="p-6 bg-gradient-to-br from-background-secondary to-background border-nenya-accent-secondary/30">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-full bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="size-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-cyan-900 dark:text-cyan-100">Shake to Erase</h3>
                    <p className="text-sm text-cyan-800/80 dark:text-cyan-200/80">
                      A physical gesture-based emergency data wipe. If you need to quickly clear all session data (for example, if someone is looking over your shoulder or you feel unsafe), simply shake your device vigorously and all active conversation data will be immediately purged from memory.
                    </p>
                    <p className="text-xs text-cyan-700/70 dark:text-cyan-300/70 italic">
                      <strong>Use case:</strong> Immediate privacy protection in moments of physical threat or surveillance.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950 border-violet-200 dark:border-violet-800">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-full bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="size-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-violet-900 dark:text-violet-100">Secondary Passcode Protection</h3>
                    <p className="text-sm text-violet-800/80 dark:text-violet-200/80">
                      A dual-passcode system that provides protection against coerced access. You would have a primary passcode (for normal use) and a secondary "duress" passcode that, when entered, appears to log you in normally but actually loads a sanitized, empty session—protecting your real data from forced disclosure.
                    </p>
                    <p className="text-xs text-violet-700/70 dark:text-violet-300/70 italic">
                      <strong>Use case:</strong> Protection in domestic abuse situations, authoritarian contexts, or any scenario where you might be forced to unlock your device under duress.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 border-emerald-200 dark:border-emerald-800">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <Brain className="size-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-emerald-900 dark:text-emerald-100">Timed Auto-Purge Sessions</h3>
                    <p className="text-sm text-emerald-800/80 dark:text-emerald-200/80">
                      Configurable automatic data deletion based on time intervals or inactivity. You could set your conversations to automatically purge after a set time (e.g., 30 minutes, 2 hours, 24 hours) or after a period of inactivity, ensuring that data doesn't persist longer than you intend.
                    </p>
                    <p className="text-xs text-emerald-700/70 dark:text-emerald-300/70 italic">
                      <strong>Use case:</strong> Reducing the window of vulnerability for sensitive conversations without requiring manual deletion.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <Eye className="size-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-amber-900 dark:text-amber-100">Interface Disguise Mode</h3>
                    <p className="text-sm text-amber-800/80 dark:text-amber-200/80">
                      An intentional feature that allows users to disguise the Nenya chat interface as other applications — such as a text messaging interface, notes app, or generic word processor. This protects your conversation content from visual surveillance in public spaces or shared environments.
                    </p>
                    <p className="text-xs text-amber-700/70 dark:text-amber-300/70 italic">
                      <strong>Use case:</strong> Using Nenya safely in public spaces, shared offices, or anywhere you might be visually surveilled. Your choice, your control.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950 dark:to-pink-950 border-rose-200 dark:border-rose-800">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-full bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="size-6 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-rose-900 dark:text-rose-100">Encrypted Local Journals (Optional)</h3>
                    <p className="text-sm text-rose-800/80 dark:text-rose-200/80">
                      For users who want to keep a record of their growth over time, we're developing optional encrypted local journaling. Your saved reflections would be encrypted on your device using a separate key, never touching our servers, and decryptable only by you.
                    </p>
                    <p className="text-xs text-rose-700/70 dark:text-rose-300/70 italic">
                      <strong>Use case:</strong> Long-term self-tracking without sacrificing privacy. Your journal stays on your device, in your control.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <Alert className="border-teal-500/60 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/50 dark:to-cyan-950/50">
              <Shield className="size-5 text-teal-600 dark:text-teal-500" />
              <AlertDescription className="text-teal-900 dark:text-teal-200">
                <p className="text-sm leading-relaxed">
                  <strong>Our Commitment:</strong> These features are being developed with input from digital rights activists, survivors of abuse, and privacy researchers. We recognize that privacy isn't just about corporate surveillance—it's also about protection from interpersonal harm, state surveillance, and coercion. Your safety is our architecture.
                </p>
              </AlertDescription>
            </Alert>
          </section>

          <ReturnToTop onClick={scrollToTop} />
        </div>
      </div>
    </div>
  );
}
