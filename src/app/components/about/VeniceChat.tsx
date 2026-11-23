import { MessageCircle } from 'lucide-react';
import { AppFooter } from '../AppFooter';
import { AboutPageLink } from '../AboutPageLink';

// "The Early Venice Character (Retired)" (owner, 2026-11-24, option A of the wording proposal). The page keeps its address (/about/venice-chat) and its id, so old links land here.
// It only points inward: the menu, the coach demo and the Terms. It claims nothing about the coach beyond the standing statements. tests/about-method-coach.test.mts pins the text.

interface VeniceChatProps {
  onBack: () => void;
  onOpenSection?: (section: string) => void;
}

const link = 'underline underline-offset-4 hover:text-foreground';

export default function VeniceChat({ onBack, onOpenSection }: VeniceChatProps) {
  return (
    <div className="size-full overflow-y-auto scroll-container bg-background">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <button
          onClick={onBack}
          className="mb-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Menu
        </button>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <MessageCircle className="size-8 text-purple-600 dark:text-purple-400" />
            <h1 className="text-foreground">The Early Venice Character (Retired)</h1>
          </div>
          <p className="text-muted-foreground">
            Before the coach on this site existed, Nenya had an early prototype: a written character prompt on Venice AI&rsquo;s platform. It was an early test of an idea. It is retired. It is no longer maintained, and Nenya does not recommend it. This site does not link to it.
          </p>
          <p className="text-muted-foreground">
            Nenya does not run or review any chat on Venice AI&rsquo;s platform. If you find a Nenya-named character or assistant there, it is outside Nenya, and none of Nenya&rsquo;s checks run on it.
          </p>
          <p className="text-muted-foreground">
            The coach on this site is where the work continues. It is optional, and it is still an early prototype that needs more testing. It is not therapy and not a crisis service. No study of it has been done, and no clinician has reviewed it. Its replies are written by an AI model that Venice AI runs, reached through our server; the Terms (Section 15) say what is sent, what is checked and what is not kept.
          </p>
          <p className="text-muted-foreground">If you are in crisis in the United States, call or text 988.</p>
          <p className="text-muted-foreground">
            <button type="button" onClick={onBack} className={link}>Back to the menu</button>
            {' · '}
            <a href="/coach/" className={link}>Open the coach demo</a>
            {' · '}
            <AboutPageLink page="terms" inline className={link} onOpen={onOpenSection ? () => onOpenSection('terms') : undefined} />
          </p>
        </div>
      </div>
      <AppFooter />
    </div>
  );
}
