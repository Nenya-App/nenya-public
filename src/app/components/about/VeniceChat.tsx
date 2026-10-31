import { REFERRAL_NOTE, VENICE_CHARACTER_URL, VENICE_SIGNUP_URL } from '../../../lib/veniceLinks';
import { useTheme } from '../ThemeProvider';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { MessageCircle, ExternalLink, AlertTriangle, Shield, Waves } from 'lucide-react';
import { AppFooter } from '../AppFooter';

interface VeniceChatProps {
  onBack: () => void;
}

export default function VeniceChat({ onBack }: VeniceChatProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
              Explore an early prototype conversation partner trained in NVC+ principles. This external integration demonstrates the potential for AI-assisted empathy practice.
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
                    <strong>No Eagle Protocol Integration:</strong> Nenya's crisis check and conversation limits do not apply on Venice's site
                  </li>
                  <li>
                    <strong>External Service:</strong> This uses Venice AI's chat service, not Nenya. Local, on-device processing is a goal for Nenya, not something that exists yet
                  </li>
                  <li>
                    <strong>Data Handling:</strong> Different privacy policies apply - see Venice AI's terms of service
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
                  NVC+ Trained Conversation Partner
                </h3>
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  The character is set up with a custom prompt incorporating Nonviolent Communication principles, Socratic questioning techniques, and the Pantheon of Needs framework.
                </p>
              </Card>

              <Card className="p-4 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20">
                <h3 className="text-sm mb-2 text-purple-900 dark:text-purple-100">
                  Upload Your Sensory Report
                </h3>
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  If you've completed the Six Gateways reflection, you can upload your sensory report to give the AI context about your current state. This is optional but recommended for a more personalized experience.
                </p>
              </Card>

              <Card className="p-4 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20">
                <h3 className="text-sm mb-2 text-purple-900 dark:text-purple-100">
                  Encrypted & Private
                </h3>
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  Venice AI describes its own privacy practices in its terms and privacy policy, which apply here and which Nenya does not control. This is an outside service, separate from Nenya.
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
                      In the on-site coach demo, a basic scrubber replaces common identifiers (such as emails, phone numbers, and street addresses) before a message is sent, and it misses most names. A fuller version is planned. Neither runs when you chat on Venice's site.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Waves className="size-4" />
                      <strong>Eagle Protocol Not Integrated</strong>
                    </div>
                    <p>
                      The full Eagle Protocol, with mandatory safety checks (air, water, food, shelter, rest), human review, and careful resets, is planned and not built. The on-site coach demo has only a basic phrase-matching crisis check, and nothing like it runs on Venice's site. If you're in distress, please use the emergency resources in the Safety section.
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
                  In order to access the Nenya AI, you will need to create an account on{' '}
                  <a
                    href={VENICE_SIGNUP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-purple-700 dark:hover:text-purple-300 transition-colors inline-flex items-center gap-1"
                  >
                    Venice.ai
                    <ExternalLink className="size-3" />
                  </a>
                  . You can browse and interact with public AI character personas without needing a paid subscription, though free accounts are limited in how many messages they can send, and paid plans raise that limit. Check Venice for its current terms.
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
                  By clicking below, you'll be taken to an external Venice AI chat window with a curated NVC+ system prompt. Remember to upload your sensory report if you have one.
                </p>
                <Button
                  onClick={() => window.open(VENICE_CHARACTER_URL, '_blank', 'noopener,noreferrer')}
                  size="lg"
                  className="gap-2 bg-purple-700 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-500 text-white"
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
              <strong>Note:</strong> This represents an exploration of AI-assisted empathy practice. What we hope to build is an AI companion with a privacy-first architecture: on-device processing where possible, minimal data, strong PII protection, and comprehensive safety protocols. Today, the coach runs in the cloud through Venice AI and has only basic versions of those protections.
            </p>
          </div>
        </div>
      </div>

      <AppFooter />
    </div>
  );
}