import React from 'react';
import { onWorkersAi } from '../../../lib/coachService';
import { ArrowLeft, Shield, Brain, AlertTriangle, BookOpen, Users, TrendingDown, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { ReturnToTop } from '../ReturnToTop';
import { AppFooter } from '../AppFooter';
import { AboutPageLink } from '../AboutPageLink';
import { Cite, ReferenceList } from './AboutReferences';

// Reworded 2026-11-22 from the About thesis (docs/about-thesis.md): every empirical sentence carries a numbered reference, the storage sentences follow the code and the
// Terms (Sections 13, 14, 15 and 16), and what no source supports was cut (the economic-cost figures, "ruinous", "foundational resilience").
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
        <h1>Our Privacy Promise</h1>
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
                In studies, people shared more personal details when they trusted who was asking <Cite pageId="privacy" n={[1, 2]} />. If you fear your words may be mined, sold or leaked, it may be harder to be open <Cite pageId="privacy" n={[1, 2]} />.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Shoshana Zuboff uses the term &ldquo;surveillance capitalism&rdquo;. It means a business model that collects data about people&rsquo;s behavior, predicts it, and sells those predictions <Cite pageId="privacy" n={[3, 4, 5]} />. Scholars debate how best to describe modern surveillance <Cite pageId="privacy" n={[6, 7]} />. We believe a place for reflection should not work this way.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Nenya is built to keep as little about you as it can. The sections below say exactly what it does keep.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Studies of health apps found that many send users&rsquo; data to other companies. Many do not say so <Cite pageId="privacy" n={[8, 9]} />. In 2023 the US Federal Trade Commission accused an online counselling service of sharing sensitive data with advertisers <Cite pageId="privacy" n={[10]} />.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our name—<strong>Nenya</strong>—points the other way: a place to rest, built to protect and never to rule.
              </p>
              {onNavigateToNamePhilosophy && (
                <p>
                  <AboutPageLink page="name-philosophy" detail="Our Name & Philosophy" onOpen={onNavigateToNamePhilosophy} />
                </p>
              )}
            </div>

            {/* Foucault Critique Box */}
            <Card className="p-6 bg-gradient-to-br from-slate-50 to-zinc-50 dark:from-slate-900 dark:to-zinc-900 border-slate-300 dark:border-slate-700">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-slate-500/10 flex items-center justify-center">
                    <Eye className="size-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <h3 className="text-slate-900 dark:text-slate-100">Being watched, and the panopticon</h3>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  Studies suggest that people who know they may be watched sometimes say, search for or read less of what feels risky <Cite pageId="privacy" n={[11, 12, 13]} />. Michel Foucault used Bentham&rsquo;s panopticon, a prison where inmates cannot tell when they are watched. He argued that being watched can make people police themselves <Cite pageId="privacy" n={[14]} />. The evidence is mixed. Effects differ by group and topic, and some people get used to being watched <Cite pageId="privacy" n={[15, 16, 17]} />. In a US survey after the 2013 revelations, 38 percent of those who knew a lot about the programs said they had changed an activity <Cite pageId="privacy" n={[18]} />.
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  We found no study of reflection tools in particular. This is our own reasoning from the studies above: if you may be watched, you may hold back.
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  We keep almost nothing, so there is little to watch. We believe your self-knowledge is yours, on your own terms.
                </p>
              </div>
            </Card>
          </section>

          {/* Section 2: Architectural Promise */}
          <section className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl bg-gradient-to-r from-nenya-accent-secondary via-nenya-accent-primary to-nenya-accent-warm bg-clip-text text-transparent">
                How Nenya is built
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Nenya asks for no name, email or account. Our web host still logs connection details such as IP addresses (Section 13 of the terms).
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We built Nenya as a reply to companies that profit from personal data. We believe your inner life is not a resource to be mined.
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
                      There are no accounts and no profiles. What you choose in the reflection tools stays on your device, apart from the optional steps described below and in the terms (Section 14).
                    </p>
                    <p className="text-sm text-blue-800/80 dark:text-blue-200/80">
                      We do not build an advertising profile of you. We see you as a person, not a product.
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
                      We are engineering toward a system where your conversations with Nenya are processed directly on your own device.
                    </p>
                    <p className="text-sm text-emerald-800/80 dark:text-emerald-200/80">
                      In that state, your reflections would not reach our servers. That would make data extraction much harder. It would not stop everything. Your device, browser and operating system can still collect data, and we cannot control that <Cite pageId="privacy" n={[19, 20, 21]} />.
                    </p>
                    <p className="text-sm text-emerald-800/80 dark:text-emerald-200/80">
                      We are not there yet. The core reflection tools run entirely in your browser.
                    </p>
                    <p className="text-sm text-emerald-800/80 dark:text-emerald-200/80">
                      The optional coach demo sends your messages through our server to {onWorkersAi() ? 'Cloudflare’s Workers AI service, an outside service' : 'Venice AI, an outside service'}. We do not store them. If you choose to send a conversation to us as a separate step, we keep it as the terms describe (Section 15).
                    </p>
                    <p className="text-sm text-emerald-800/80 dark:text-emerald-200/80">
                      {onWorkersAi()
                        ? 'Cloudflare reads them in order to answer, so they are not encrypted from Cloudflare, and our server also reads them briefly in memory to check them first, so this is not encryption all the way from your device.'
                        : 'Our server encrypts them before they go on to Venice. Venice says it relays only encrypted data. Our server reads them briefly in memory to check them first, so this is not encryption all the way from your device.'}
                    </p>
                    <p className="text-sm text-emerald-800/80 dark:text-emerald-200/80">
                      A sensory report stays on your device unless you choose to bring parts of it to the coach. Then you see exactly the words that would go. Nothing is chosen for you. What you choose travels the same way as a message and goes through the same safety checks. You never have to share anything from a report to use the coach.
                    </p>
                    <p className="text-sm text-emerald-800/80 dark:text-emerald-200/80">
                      In the Sight lens, one optional button, “Ask The Color API,” sends one color, as a hex code, through our server. It goes to an outside service (thecolorapi.com), which makes a palette. Making a palette on your device, suggesting a color name, and everything else there send nothing.
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
                      Most of what you write, draw or choose lives only in your device&rsquo;s memory while the page is open. It is like a whiteboard wiped clean when you close it. The one exception is &ldquo;Save and return later&rdquo;. It keeps a sealed copy in your browser, and you can open it for up to 24 hours.
                    </p>
                    <p className="text-sm text-purple-800/80 dark:text-purple-200/80">
                      A little can stay in your browser between visits: a timestamp after a coach conversation, and a yes-or-no note about whether you left the coach page&rsquo;s word lists open or folded. If you turn on &ldquo;Remember&rdquo;, your settings stay too.
                    </p>
                    <p className="text-sm text-purple-800/80 dark:text-purple-200/80">
                      The &ldquo;Forget me&rdquo; button erases these. One small note that you already sent something, which holds short codes and never your text, can last until you close the tab. Emergency Exit erases all of it before it leaves the page, then leaves a one-word flag in that tab so that Back does not return you to the page. The flag goes when you close the tab.
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
                      We do not track you across the internet. We do not build a profile of you. We do not host advertisements.
                    </p>
                    <p className="text-sm text-amber-800/80 dark:text-amber-200/80">
                      Our web host, Netlify, logs connection details such as IP addresses for security. It also builds visit totals from those logs. No cookie is set and nothing is stored on your device. We see totals, never a list of visitors (Section 13 of the terms).
                    </p>
                    <p className="text-sm text-amber-800/80 dark:text-amber-200/80">
                      We keep daily totals of how often parts of the site are opened, with nothing about who opened them (Section 13 of the terms). We do not try to measure whether you grow.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Section 3: Using the coach with care */}
          <section className="space-y-6">
            <Alert className="border-orange-500/60 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/50 dark:to-amber-950/50">
              <AlertTriangle className="size-5 text-orange-600 dark:text-orange-500" />
              <AlertDescription className="text-orange-900 dark:text-orange-200">
                <div className="space-y-4">
                  <h3 className="text-lg text-orange-950 dark:text-orange-100">
                    Using the coach with care
                  </h3>
                  <p className="text-sm leading-relaxed">
                    The replies in the optional coach demo are written by an AI language model. It has been given instructions based on Nonviolent Communication. It is a computer program, not a human expert, and it can be wrong. Language models can state false things with confidence <Cite pageId="privacy" n={[22, 23, 24]} />. The reflection tools do not use AI.
                  </p>
                  <p className="text-sm leading-relaxed">
                    Please keep four things in mind when you use the coach:
                  </p>
                  <ol className="space-y-3 text-sm list-decimal list-inside">
                    <li className="leading-relaxed">
                      <strong>AI is not fact.</strong> Treat what the coach says as a suggestion, not as fact. Check anything important with a source you trust.
                    </li>
                    <li className="leading-relaxed">
                      <strong>Bias.</strong> Language models learn from large amounts of human writing, and that writing contains biases. Models can repeat them <Cite pageId="privacy" n={[23, 25, 26]} />. Please think about whether a reply fits you. The coach may reflect biases back to you, and you know your own life best.
                    </li>
                    <li className="leading-relaxed">
                      <strong>No clinical authority.</strong> Nenya is for reflection and practice only. It does not give medical, legal or therapy advice, and it is not a substitute for a clinician or a lawyer. No clinician or lawyer has reviewed Nenya.
                    </li>
                    <li className="leading-relaxed">
                      <strong>Truth and creative expression.</strong> We believe people should be free to tell the truth and to make art. Nenya is built to help you be honest with yourself. You are the final judge of your own life.
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
                  Writers and research behind this page
                </h2>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                These are the writers and studies that shaped how we think about privacy. Reading them is optional. We say where the findings are mixed.
              </p>
            </div>

            <div className="space-y-4">
              <Card className="p-6 bg-muted/30 border-border">
                <div className="space-y-3">
                  <h3 className="text-foreground">Shoshana Zuboff</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong>Surveillance capitalism:</strong> a scholar who named a business model that turns human behavior into data to predict and sell. Her book is The Age of Surveillance Capitalism (2019) <Cite pageId="privacy" n={[3, 5]} />.
                  </p>
                </div>
              </Card>

              <Card className="p-6 bg-muted/30 border-border">
                <div className="space-y-3">
                  <h3 className="text-foreground">Michel Foucault</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Discipline and Punish (1975) argues that modern institutions use watching and record-keeping to shape how people behave <Cite pageId="privacy" n={[14]} />. Its chapter on the panopticon is the part we draw on. Other scholars say newer forms of surveillance do not fit that picture <Cite pageId="privacy" n={[6, 7]} />.
                  </p>
                </div>
              </Card>

              <Card className="p-6 bg-muted/30 border-border">
                <div className="space-y-3">
                  <h3 className="text-foreground">Privacy scholars, and a dispute</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Julie Cohen (Between Truth and Power, 2019) argues that law is being reshaped to serve the information economy <Cite pageId="privacy" n={[27]} />. Helen Nissenbaum (Privacy in Context, 2010) describes how societies decide when to let technology lead and when to resist it for privacy <Cite pageId="privacy" n={[28]} />. Whether privacy law slows innovation is disputed. Adam Thierer argues that advance rules slow new technology <Cite pageId="privacy" n={[29]} />. Studies of the EU&rsquo;s GDPR find mixed effects on advertising and on how many vendors firms use <Cite pageId="privacy" n={[30, 31, 32]} />. None of the ones we read settles the question.
                  </p>
                </div>
              </Card>

              <Card className="p-6 bg-muted/30 border-border">
                <div className="space-y-3">
                  <h3 className="text-foreground">Gender norms and holding back feelings</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Feminist philosophers such as Alison Jaggar argue that Western thought long treated emotion as a threat to knowledge <Cite pageId="privacy" n={[33]} />. Separately, studies link habitually hiding feelings with lower well-being and some health risks <Cite pageId="privacy" n={[34, 35, 36]} />. These links are modest. They come from observation, not experiments. Following traditional masculine norms is also linked, modestly, with worse mental health <Cite pageId="privacy" n={[37]} />. No study we found traces the whole chain from patriarchy to illness.
                  </p>
                </div>
              </Card>
            </div>
          </section>

          {/* Section 5: Features Under Development */}
          <section className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl bg-gradient-to-r from-nenya-accent-secondary via-nenya-accent-primary to-nenya-accent-metallic bg-clip-text text-transparent">
                Privacy Features We Hope to Build
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                These are privacy and safety ideas we hope to build. None of them exists yet. We have not yet tested any of them with survivors of abuse or privacy experts.
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
                      An idea: a shake of your device would clear the page. If someone is looking over your shoulder, you could shake it, and the conversation on the page would be wiped. We have not built or tested this. A shake could also happen by accident.
                    </p>
                    <p className="text-xs text-cyan-700/70 dark:text-cyan-300/70">
                      <strong>Use case:</strong> a quick way to clear the page if someone may be looking <Cite pageId="privacy" n={[38]} />.
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
                      An idea: a second passcode that opens an empty decoy instead of your real data. Nenya has no accounts or passcodes today, so this only makes sense with the encrypted journal described below. We have not built it. A decoy may not fool a determined person.
                    </p>
                    <p className="text-xs text-violet-700/70 dark:text-violet-300/70">
                      <strong>Use case:</strong> help for people who are forced to unlock a device. Abusive partners often use phones, accounts and spy apps to watch and control people <Cite pageId="privacy" n={[20, 21, 39]} />. We do not know whether a decoy would help.
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
                      An idea: you could set a conversation to clear itself after a set time. It could be 30 minutes, 2 hours or 24 hours. Or it could clear after you stop for a while.
                    </p>
                    <p className="text-xs text-emerald-700/70 dark:text-emerald-300/70">
                      <strong>Use case:</strong> less to clear by hand.
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
                      An idea: the chat screen could look like another app, such as a text-message screen or a notes app. This might help if someone glances at your screen. It would not stop a person who looks closely, and it would not hide anything your device or network can see.
                    </p>
                    <p className="text-xs text-amber-700/70 dark:text-amber-300/70">
                      <strong>Use case:</strong> using Nenya in a public place. People do sometimes see other people&rsquo;s screens, mostly by chance <Cite pageId="privacy" n={[38]} />.
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
                      For people who want a record over time, we hope to build an optional journal. It would be encrypted on your device with a key only you hold. It would never reach our servers. If you lose the key, we could not recover your journal.
                    </p>
                    <p className="text-xs text-rose-700/70 dark:text-rose-300/70">
                      <strong>Use case:</strong> a record you keep over time. It would stay on your device.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <Alert className="border-teal-500/60 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/50 dark:to-cyan-950/50">
              <Shield className="size-5 text-teal-600 dark:text-teal-500" />
              <AlertDescription className="text-teal-900 dark:text-teal-200">
                <p className="text-sm leading-relaxed">
                  <strong>Our plan:</strong> we hope to shape these ideas with digital rights groups, survivors of abuse and privacy researchers.
                </p>
                <p className="text-sm leading-relaxed mt-2">
                  Privacy is not only about companies. Partners can use technology to watch and control people <Cite pageId="privacy" n={[21, 39, 40]} />. Governments can watch people too, and studies find that people change what they do online when they know it <Cite pageId="privacy" n={[11, 12]} />.
                </p>
                <p className="text-sm leading-relaxed mt-2">
                  We cannot promise your safety. We can try to build tools that ask for very little.
                </p>
              </AlertDescription>
            </Alert>
          </section>

          <ReferenceList
            pageId="privacy"
            items={[
              { n: 1, text: 'Joinson A, Reips U, Buchanan T, Schofield C (2010). Privacy, Trust, and Self-Disclosure Online. Human–Computer Interaction.', href: 'https://doi.org/10.1080/07370020903586662', linkLabel: 'Free full text' },
              { n: 2, text: 'Acquisti A, Brandimarte L, Loewenstein G (2015). Privacy and human behavior in the age of information. Science.', href: 'https://doi.org/10.1126/science.aaa1465', linkLabel: 'Publisher page (may need payment)' },
              { n: 3, text: 'Zuboff S (2015). Big other: Surveillance Capitalism and the Prospects of an Information Civilization. Journal of Information Technology.', href: 'https://doi.org/10.1057/jit.2015.5', linkLabel: 'Free full text' },
              { n: 4, text: 'Cinnamon J (2017). Social Injustice in Surveillance Capitalism. Surveillance & Society.', href: 'https://doi.org/10.24908/ss.v15i5.6433', linkLabel: 'Free full text' },
              { n: 5, text: 'Zuboff S (2019). The Age of Surveillance Capitalism: The Fight for a Human Future at the New Frontier of Power. PublicAffairs (New York); Profile Books (London).' },
              { n: 6, text: 'Haggerty K, Ericson R (2000). The surveillant assemblage. The British Journal of Sociology.', href: 'https://doi.org/10.1080/00071310020015280', linkLabel: 'Publisher page (may need payment)' },
              { n: 7, text: 'Galič M, Timan T, Koops B (2016). Bentham, Deleuze and Beyond: An Overview of Surveillance Theories from the Panopticon to Participation. Philosophy & Technology.', href: 'https://doi.org/10.1007/s13347-016-0219-1', linkLabel: 'Free full text' },
              { n: 8, text: 'Huckvale K, Torous J, Larsen M (2019). Assessment of the Data Sharing and Privacy Practices of Smartphone Apps for Depression and Smoking Cessation. JAMA Network Open.', href: 'https://doi.org/10.1001/jamanetworkopen.2019.2542', linkLabel: 'Free full text' },
              { n: 9, text: 'Grundy Q, Chiu K, Held F, Continella A, Bero L, Holz R et al. (2019). Data sharing practices of medicines related apps and the mobile ecosystem: traffic, content, and network analysis. BMJ.', href: 'https://doi.org/10.1136/bmj.l920', linkLabel: 'Free full text' },
              { n: 10, text: 'US Federal Trade Commission (2023). FTC to Ban BetterHelp from Revealing Consumers\' Data, Including Sensitive Mental Health Information, to Facebook and Others for Targeted Advertising. FTC press release, 2 March 2023.', href: 'https://www.ftc.gov/news-events/news/press-releases/2023/03/ftc-ban-betterhelp-revealing-consumers-data-including-sensitive-mental-health-information-facebook', linkLabel: 'Source page' },
              { n: 11, text: 'Penney J (2016). Chilling Effects: Online Surveillance and Wikipedia Use. Berkeley Technology Law Journal.', href: 'https://doi.org/10.15779/Z38SS13', linkLabel: 'Free full text' },
              { n: 12, text: 'Marthews A, Tucker C (2017). The Impact of Online Surveillance on Behavior. The Cambridge Handbook of Surveillance Law.', href: 'https://doi.org/10.1017/9781316481127.019', linkLabel: 'Free full text' },
              { n: 13, text: 'Stoycheff E (2016). Under Surveillance. Journalism & Mass Communication Quarterly.', href: 'https://doi.org/10.1177/1077699016630255', linkLabel: 'Publisher page (may need payment)' },
              { n: 14, text: 'Foucault M (1975). Discipline and Punish: The Birth of the Prison (Surveiller et punir), translated by Alan Sheridan, Vintage, 1995. Part Three, chapter 3, “Panopticism”.' },
              { n: 15, text: 'Oulasvirta A, Pihlajamaa A, Perkiö J, Ray D, Vähäkangas T, Hasu T et al. (2012). Long-term effects of ubiquitous surveillance in the home. Proceedings of the 2012 ACM Conference on Ubiquitous Computing.', href: 'https://doi.org/10.1145/2370216.2370224', linkLabel: 'Publisher page (may need payment)' },
              { n: 16, text: 'Stoycheff E, Liu J, Xu K, Wibowo K (2018). Privacy and the Panopticon: Online mass surveillance’s deterrence and chilling effects. New Media & Society.', href: 'https://doi.org/10.1177/1461444818801317', linkLabel: 'Publisher page (may need payment)' },
              { n: 17, text: 'Büchi M, Festic N, Latzer M (2022). The Chilling Effects of Digital Dataveillance: A Theoretical Model and an Empirical Research Agenda. Big Data & Society.', href: 'https://doi.org/10.1177/20539517211065368', linkLabel: 'Free full text' },
              { n: 18, text: 'Rainie L, Madden M, Pew Research Center (2015). Americans\' Privacy Strategies Post-Snowden. Pew Research Center, 16 March 2015.', href: 'https://www.pewresearch.org/internet/2015/03/16/americans-privacy-strategies-post-snowden/', linkLabel: 'Source page' },
              { n: 19, text: 'Leith D (2021). Web Browser Privacy: What Do Browsers Say When They Phone Home? IEEE Access.', href: 'https://doi.org/10.1109/access.2021.3065243', linkLabel: 'Free full text' },
              { n: 20, text: 'Chatterjee R, Doerfler P, Orgad H, Havron S, Palmer J, Freed D et al. (2018). The Spyware Used in Intimate Partner Violence. 2018 IEEE Symposium on Security and Privacy (SP).', href: 'https://doi.org/10.1109/SP.2018.00061', linkLabel: 'Publisher page (may need payment)' },
              { n: 21, text: 'Freed D, Palmer J, Minchala D, Levy K, Ristenpart T, Dell N et al. (2018). “A Stalker\'s Paradise”. Proceedings of the 2018 CHI Conference on Human Factors in Computing Systems.', href: 'https://doi.org/10.1145/3173574.3174241', linkLabel: 'Publisher page (may need payment)' },
              { n: 22, text: 'Ji Z, Lee N, Frieske R, Yu T, Su D, Xu Y et al. (2023). Survey of Hallucination in Natural Language Generation. ACM Computing Surveys.', href: 'https://doi.org/10.1145/3571730', linkLabel: 'Free full text' },
              { n: 23, text: 'Bender E, Gebru T, McMillan-Major A, Shmitchell S (2021). On the Dangers of Stochastic Parrots. Proceedings of the 2021 ACM Conference on Fairness, Accountability, and Transparency.', href: 'https://doi.org/10.1145/3442188.3445922', linkLabel: 'Free full text' },
              { n: 24, text: 'NIST (US National Institute of Standards and Technology) (2024). Artificial Intelligence Risk Management Framework: Generative Artificial Intelligence Profile (NIST AI 600-1). NIST, 26 July 2024.', href: 'https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf', linkLabel: 'Source page' },
              { n: 25, text: 'Caliskan A, Bryson J, Narayanan A (2017). Semantics derived automatically from language corpora contain human-like biases. Science.', href: 'https://doi.org/10.1126/science.aal4230', linkLabel: 'Free full text' },
              { n: 26, text: 'Navigli R, Conia S, Ross B (2023). Biases in Large Language Models: Origins, Inventory, and Discussion. Journal of Data and Information Quality.', href: 'https://doi.org/10.1145/3597307', linkLabel: 'Free full text' },
              { n: 27, text: 'Cohen J (2019). Between Truth and Power. Oxford University Press.', href: 'https://doi.org/10.1093/oso/9780190246693.001.0001', linkLabel: 'Free full text' },
              { n: 28, text: 'Nissenbaum H (2010). Privacy in Context. Stanford University Press.', href: 'https://doi.org/10.1515/9780804772891', linkLabel: 'Publisher page (may need payment)' },
              { n: 29, text: 'Thierer A (2016). Permissionless Innovation: The Continuing Case for Comprehensive Technological Freedom (revised and expanded edition). Mercatus Center, George Mason University.', href: 'https://www.mercatus.org/research/books/permissionless-innovation-continuing-case-comprehensive-technological-freedom', linkLabel: 'Source page' },
              { n: 30, text: 'Goldfarb A, Tucker C (2011). Privacy Regulation and Online Advertising. Management Science.', href: 'https://doi.org/10.1287/mnsc.1100.1246', linkLabel: 'Free full text' },
              { n: 31, text: 'Johnson G, Shriver S, Goldberg S (2023). Privacy and Market Concentration: Intended and Unintended Consequences of the GDPR. Management Science.', href: 'https://doi.org/10.1287/mnsc.2023.4709', linkLabel: 'Free full text' },
              { n: 32, text: 'Aridor G, Che Y, Salz T (2023). The effect of privacy regulation on the data industry: empirical evidence from GDPR. The RAND Journal of Economics.', href: 'https://doi.org/10.1111/1756-2171.12455', linkLabel: 'Free full text' },
              { n: 33, text: 'Jaggar A (1989). Love and knowledge: Emotion in feminist epistemology. Inquiry.', href: 'https://doi.org/10.1080/00201748908602185', linkLabel: 'Free full text' },
              { n: 34, text: 'Gross J, John O (2003). Individual differences in two emotion regulation processes: Implications for affect, relationships, and well-being. Journal of Personality and Social Psychology.', href: 'https://doi.org/10.1037/0022-3514.85.2.348', linkLabel: 'Publisher page (may need payment)' },
              { n: 35, text: 'Aldao A, Nolen-Hoeksema S, Schweizer S (2010). Emotion-regulation strategies across psychopathology: A meta-analytic review. Clinical Psychology Review.', href: 'https://doi.org/10.1016/j.cpr.2009.11.004', linkLabel: 'Publisher page (may need payment)' },
              { n: 36, text: 'Chapman B, Fiscella K, Kawachi I, Duberstein P, Muennig P (2013). Emotion suppression and mortality risk over a 12-year follow-up. Journal of Psychosomatic Research.', href: 'https://doi.org/10.1016/j.jpsychores.2013.07.014', linkLabel: 'Free full text' },
              { n: 37, text: 'Wong Y, Ho M, Wang S, Miller I (2017). Meta-analyses of the relationship between conformity to masculine norms and mental health-related outcomes. Journal of Counseling Psychology.', href: 'https://doi.org/10.1037/cou0000176', linkLabel: 'Publisher page (may need payment)' },
              { n: 38, text: 'Eiband M, Khamis M, von Zezschwitz E, Hussmann H, Alt F (2017). Understanding Shoulder Surfing in the Wild. Proceedings of the 2017 CHI Conference on Human Factors in Computing Systems.', href: 'https://doi.org/10.1145/3025453.3025636', linkLabel: 'Publisher page (may need payment)' },
              { n: 39, text: 'Woodlock D (2016). The Abuse of Technology in Domestic Violence and Stalking. Violence Against Women.', href: 'https://doi.org/10.1177/1077801216646277', linkLabel: 'Publisher page (may need payment)' },
              { n: 40, text: 'Matthews T, O\'Leary K, Turner A, Sleeper M, Woelfer J, Shelton M et al. (2017). Stories from Survivors. Proceedings of the 2017 CHI Conference on Human Factors in Computing Systems.', href: 'https://doi.org/10.1145/3025453.3025875', linkLabel: 'Free full text' },
            ]}
          />

          <ReturnToTop onClick={scrollToTop} />
        </div>
      </div>

      <AppFooter />
    </div>
  );
}
