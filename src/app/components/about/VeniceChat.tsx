import { SCREEN_STATUS } from '../../../lib/checksReport';
import { REFERRAL_NOTE, VENICE_CHARACTER_URL, VENICE_SIGNUP_URL, VENICE_TERMS_URL, VENICE_PRIVACY_URL } from '../../../lib/veniceLinks';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { MessageCircle, ExternalLink, AlertTriangle, Shield, Waves } from 'lucide-react';
import { AppFooter } from '../AppFooter';
import { Cite, ReferenceList, type AboutReference } from './AboutReferences';

const REFS: AboutReference[] = [
  {"n": 1, "text": "Abd-Alrazaq A; Rababeh A; Alajlani M; Bewick B; Househ M (2020). Effectiveness and Safety of Using Chatbots to Improve Mental Health: Systematic Review and Meta-Analysis. Journal of Medical Internet Research.", "href": "https://doi.org/10.2196/16021", "linkLabel": "Free full text"},
  {"n": 2, "text": "Li H; Zhang R; Lee Y; Kraut R; Mohr D (2023). Systematic review and meta-analysis of AI-based conversational agents for promoting mental health and well-being. npj Digital Medicine.", "href": "https://doi.org/10.1038/s41746-023-00979-5", "linkLabel": "Free full text"},
  {"n": 3, "text": "Fitzpatrick K; Darcy A; Vierhile M (2017). Delivering Cognitive Behavior Therapy to Young Adults With Symptoms of Depression and Anxiety Using a Fully Automated Conversational Agent (Woebot): A Randomized Controlled Trial. JMIR Mental Health.", "href": "https://doi.org/10.2196/mental.7785", "linkLabel": "Free full text"},
  {"n": 4, "text": "Shaikh O; Chai V; Gelfand M; Yang D; Bernstein M (2024). Rehearsal: Simulating Conflict to Teach Conflict Resolution. Proceedings of the CHI Conference on Human Factors in Computing Systems.", "href": "https://doi.org/10.1145/3613904.3642159", "linkLabel": "Free full text"},
  {"n": 5, "text": "Sharma A; Lin I; Miner A; Atkins D; Althoff T (2023). Human–AI collaboration enables more empathic conversations in text-based peer-to-peer mental health support. Nature Machine Intelligence.", "href": "https://doi.org/10.1038/s42256-022-00593-2", "linkLabel": "Free full text"},
  {"n": 6, "text": "Ayers J; Poliak A; Dredze M; Leas E; Zhu Z; Kelley J; et al. (2023). Comparing Physician and Artificial Intelligence Chatbot Responses to Patient Questions Posted to a Public Social Media Forum. JAMA Internal Medicine.", "href": "https://doi.org/10.1001/jamainternmed.2023.1838", "linkLabel": "Free full text"},
  {"n": 7, "text": "Sorin V; Brin D; Barash Y; Konen E; Charney A; Nadkarni G; et al. (2024). Large Language Models and Empathy: Systematic Review. Journal of Medical Internet Research.", "href": "https://doi.org/10.2196/52597", "linkLabel": "Free full text"},
  {"n": 8, "text": "Inzlicht M; Cameron C; D’Cruz J; Bloom P (2024). In praise of empathic AI. Trends in Cognitive Sciences.", "href": "https://doi.org/10.1016/j.tics.2023.12.003", "linkLabel": "Free full text"},
  {"n": 9, "text": "Lison P; Pilán I; Sanchez D; Batet M; Øvrelid L (2021). Anonymisation Models for Text Data: State of the art, Challenges and Future Directions. Proceedings of the 59th Annual Meeting of the Association for Computational Linguistics and the 11th International Joint Conference on Natural Language Processing (Volume 1: Long Papers).", "href": "https://doi.org/10.18653/v1/2021.acl-long.323", "linkLabel": "Free full text"},
  {"n": 10, "text": "Pilán I; Lison P; Øvrelid L; Papadopoulou A; Sánchez D; Batet M; et al. (2022). The Text Anonymization Benchmark (TAB): A Dedicated Corpus and Evaluation Framework for Text Anonymization. Computational Linguistics.", "href": "https://doi.org/10.1162/coli_a_00458", "linkLabel": "Free full text"},
  {"n": 11, "text": "Rocher L; Hendrickx J; de Montjoye Y (2019). Estimating the success of re-identifications in incomplete datasets using generative models. Nature Communications.", "href": "https://doi.org/10.1038/s41467-019-10933-3", "linkLabel": "Free full text"},
  {"n": 12, "text": "Miner A; Milstein A; Schueller S; Hegde R; Mangurian C; Linos E; et al. (2016). Smartphone-Based Conversational Agents and Responses to Questions About Mental Health, Interpersonal Violence, and Physical Health. JAMA Internal Medicine.", "href": "https://doi.org/10.1001/jamainternmed.2016.0400", "linkLabel": "Free full text"},
  {"n": 13, "text": "Pichowicz W; Kotas M; Piotrowski P (2025). Performance of mental health chatbot agents in detecting and managing suicidal ideation. Scientific Reports.", "href": "https://doi.org/10.1038/s41598-025-17242-4", "linkLabel": "Free full text"},
  {"n": 14, "text": "McBain R; Cantor J; Zhang L; Baker O; Zhang F; Burnett A; et al. (2025). Evaluation of Alignment Between Large Language Models and Expert Clinicians in Suicide Risk Assessment. Psychiatric Services.", "href": "https://doi.org/10.1176/appi.ps.20250086", "linkLabel": "Free full text"},
];

const PAGE = 'venice-chat';

interface VeniceChatProps {
  onBack: () => void;
}

export default function VeniceChat({ onBack }: VeniceChatProps) {

  return (
    <div className="size-full overflow-y-auto scroll-container bg-background">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <button 
          onClick={onBack}
          className="mb-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Menu
        </button>

        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="size-8 text-purple-600 dark:text-purple-400" />
              <h1 className="text-foreground">AI Chat Demo (Venice)</h1>
            </div>
            <p className="text-muted-foreground">
              Try an early prototype of a conversation partner. It is set up with a written prompt based on our approach.
            </p>
            <p className="text-muted-foreground">
              This is an outside service and an early test of an idea: using an AI chat to practice putting feelings and needs into words. Studies of similar chatbots find some short-term help with low mood and distress in small trials, with a high risk of bias <Cite pageId={PAGE} n={[1, 2, 3]} />. Nobody has tested this character.
            </p>
            <p className="text-muted-foreground">
              Two small studies found that AI tools that help people practise or word difficult messages improved their skills <Cite pageId={PAGE} n={[4, 5]} />. Neither tested NVC.
            </p>
            <p className="text-muted-foreground">
              In some tests, raters judged AI replies to be empathic. Those tests rate the wording of a reply. They do not show that the AI feels anything, or that talking to it helps over time <Cite pageId={PAGE} n={[6, 7, 8]} />.
            </p>
          </div>

          {/* Important Disclaimers */}
          <Card className="border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-6 flex-shrink-0 text-amber-700 dark:text-amber-400 mt-1" />
              <div className="space-y-3">
                <h2 className="text-amber-900 dark:text-amber-100">
                  Important Limitations
                </h2>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  This page is about chatting with Nenya's character <strong>directly on Venice AI's own site</strong>, which is not integrated with Nenya's privacy and safety tools. (The coach demo built into Nenya at nenya.biz/coach does include basic versions of them.) Key differences from the full application we hope to build:
                </p>
                <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-2 list-disc list-inside ml-2">
                  <li>
                    <strong>No PII Scrubbing:</strong> Nenya's scrubbing of personally identifiable information does not run on Venice's site
                  </li>
                  <li>
                    <strong>No Nenya safety checks:</strong> Nenya's crisis check and conversation limits do not apply on Venice's site
                  </li>
                  <li>
                    <strong>External Service:</strong> This uses Venice AI's chat service, not Nenya. Local, on-device processing is a goal for Nenya, not something that exists yet
                  </li>
                  <li>
                    <strong>Data Handling:</strong> Venice AI's own privacy policy and terms apply, not ours.
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* What to Expect */}
          <div className="space-y-4">
            <h2 className="text-foreground">What to Expect</h2>
            <div className="space-y-3">
              <Card className="p-4 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20">
                <h3 className="text-sm mb-2 text-purple-900 dark:text-purple-100">
                  Conversation partner, set up with a prompt
                </h3>
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  The character is a Venice &ldquo;character&rdquo;: a written description and prompt, not a model we trained. Its public description asks you open questions and gives no advice. We built the prompt around Nonviolent Communication, Socratic questions, and the Pantheon of Needs.
                </p>
              </Card>

              <Card className="p-4 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20">
                <h3 className="text-sm mb-2 text-purple-900 dark:text-purple-100">
                  Upload Your Sensory Report
                </h3>
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  If you've added lenses to your report, you can upload your sensory report to give the AI context about your current state. This is optional. What you upload goes to Venice without Nenya's scrubbing, so read your report first and remove anything you would not want Venice to see.
                </p>
              </Card>

              <Card className="p-4 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20">
                <h3 className="text-sm mb-2 text-purple-900 dark:text-purple-100">
                  What Venice says about privacy
                </h3>
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  Venice AI describes its own privacy practices in its{' '}
                  <a href={VENICE_TERMS_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">terms</a> and{' '}
                  <a href={VENICE_PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">privacy policy</a>,
                  which apply here and which Nenya does not control. This is an outside service, separate from Nenya. Venice AI&rsquo;s terms differ from ours. Anyone under 18 needs a parent&rsquo;s or guardian&rsquo;s consent. The service is intended for people in the United States. Disputes go to binding individual arbitration with no class actions, unless you opt out by mail within 30 days (Venice terms, updated 8 June 2026).
                </p>
                <p className="mt-2 text-sm text-purple-800 dark:text-purple-200">
                  Venice says its default private mode does not store your prompts or answers. It relies on contracts with its model providers for that. Venice also says end-to-end encryption is a Pro feature (Venice privacy page, read 22 November 2026). We cannot check these statements.
                </p>
              </Card>
            </div>
          </div>

          {/* Missing Features Reminder */}
          <Card className="border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/20 p-6">
            <div className="flex items-start gap-3">
              <div className="space-y-3">
                <h2 className="text-rose-900 dark:text-rose-100 flex items-center gap-2">
                  <Shield className="size-5" />
                  Missing Nenya Safety Features
                </h2>
                <div className="space-y-3 text-sm text-rose-800 dark:text-rose-200">
                  <div>
                    <div className="mb-1">
                      <strong>PII Scrubbing Not Active</strong>
                    </div>
                    <p>
                      In the on-site coach demo, a basic scrubber replaces common identifiers (such as emails, phone numbers and street addresses) and many common names before a message is sent, and the coach is told never to use or repeat a name. It still misses names it does not know, and it is not a promise of anonymity. Software that removes names can miss some, and a few ordinary details can identify a person <Cite pageId={PAGE} n={[9, 10, 11]} />. A fuller version is planned. None of this runs when you chat on Venice's site.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Waves className="size-4" />
                      <strong>Safety checks are not integrated</strong>
                    </div>
                    <p>
                      A fuller safety system, with human review and careful resets, is planned and not built. The on-site coach demo has a phrase-matching crisis check, a few site-written safety sentences, and simple checks on its replies (for example, against inventing a human life or describing how Nenya runs); all of it is phrase matching{SCREEN_STATUS.onLiveSite ? ', together with a small hate-speech classifier (see How the checks work)' : ' (a small hate-speech classifier is being tested but is not switched on for the live site; see How the checks work)'} and can be wrong. Tests of other chatbots and apps have found that many respond poorly to messages about suicide <Cite pageId={PAGE} n={[12, 13, 14]} />. Nobody has tested this character that way. Nothing like it runs on Venice's site. If you're in distress, please use the emergency resources in the Safety section.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Account Setup */}
          <div className="space-y-4">
            <h2 className="text-foreground">Getting Started</h2>
            <Card className="p-6 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20">
              <div className="space-y-3">
                <p className="text-sm text-purple-900 dark:text-purple-100">
                  To chat with the Nenya character on Venice, you may need to create an account on{' '}
                  <a
                    href={VENICE_SIGNUP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-purple-700 dark:hover:text-purple-300 transition-colors inline-flex items-center gap-1"
                  >
                    Venice.ai
                    <ExternalLink className="size-3" />
                  </a>
                  . Venice&rsquo;s pricing page (read 22 November 2026) lists 10 text prompts a day on the free plan. Pro costs $18 a month and has unlimited text prompts. The page does not say plainly whether free accounts can chat with characters, so check before you sign up. These limits can change. Check Venice for its current terms.
                </p>
                <p className="text-xs text-purple-800 dark:text-purple-200 italic">{REFERRAL_NOTE}</p>
              </div>
            </Card>
          </div>

          {/* Launch Button */}
          <div className="space-y-4">
            <h2 className="text-foreground">Ready to Explore?</h2>
            <Card className="p-6 border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 to-background dark:from-purple-950/30 dark:to-background">
              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  By clicking below, you will go to an outside Venice AI page for the Nenya character. It uses a written prompt. You can upload your sensory report there if you wish.
                </p>
                <Button
                  onClick={() => window.open(VENICE_CHARACTER_URL, '_blank', 'noopener,noreferrer')}
                  size="lg"
                  className="gap-2 bg-purple-800 hover:bg-purple-900 dark:bg-purple-800 dark:hover:bg-purple-900 text-white"
                >
                  <MessageCircle className="size-5" />
                  Open Venice AI Chat Demo
                  <ExternalLink className="size-5" />
                </Button>
                <p className="text-xs text-muted-foreground italic">
                  Opens in a new window
                </p>
              </div>
            </Card>
          </div>

          {/* Footer Note */}
          <div className="text-sm text-muted-foreground border-t border-border pt-6">
            <p>
              <strong>Note:</strong> This represents an exploration of AI-assisted empathy practice. What we hope to build is a conversation partner, not a companion. It would have a privacy-first design: on-device processing where possible, minimal data, and strong protection of personal details. It would also have much stronger safety checks, with human review. Today, the coach runs in the cloud through Venice AI and has only basic versions of those protections.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 pb-8">
        <ReferenceList pageId={PAGE} items={REFS} />
      </div>
      <AppFooter />
    </div>
  );
}