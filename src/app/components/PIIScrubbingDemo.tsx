import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { AppFooter } from './AppFooter';
import { SCRUB_RULES_DOC, describeScrub, scrubPII } from '../../lib/piiScrub';

// How Nenya removes identifiers, as it actually works (owner, 2026-11-15: the earlier walkthrough described a planned "pipeline" and claimed things the
// code does not do). This page runs the site's own scrubber (src/lib/piiScrub.ts) in the visitor's browser, so what they see here is exactly what the coach
// would send. Nothing typed here is sent anywhere. The technical details sit behind one closed disclosure, generated from the descriptions kept beside the rules.

interface PIIScrubbingDemoProps {
  onComplete?: () => void;
  onBack?: () => void;
}

const EXAMPLE =
  'My name is Sarah Johnson and I live at 123 Oak Street in Portland. My email is sarah.j@example.com and my phone is 503-555-0134. My sister Maria says I should quit, and I told Jordan I would think about it. I have been feeling really overwhelmed at work.';

const SOURCE = 'https://github.com/Nenya-App/nenya-public/blob/main/src/lib/piiScrub.ts';

// Shows the scrubbed text with each placeholder marked, so it is easy to see what changed.
function Marked({ text }: { text: string }) {
  const parts = text.split(/(\[[A-Z ]+\])/g);
  return (
    <p className="whitespace-pre-wrap break-words text-sm">
      {parts.map((p, i) =>
        /^\[[A-Z ]+\]$/.test(p) ? (
          <mark key={i} className="rounded bg-nenya-accent-warm/25 px-1 font-mono text-xs text-foreground">
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </p>
  );
}

export default function PIIScrubbingDemo({ onComplete, onBack }: PIIScrubbingDemoProps) {
  const [input, setInput] = useState(EXAMPLE);
  const result = scrubPII(input);
  const leave = () => (onBack ? onBack() : onComplete?.());

  return (
    <div className="size-full flex flex-col bg-background">
      <div className="border-b border-border px-4 py-4 md:px-6">
        <Button variant="ghost" size="sm" onClick={leave} className="min-h-11 gap-2">
          <ArrowLeft className="size-4" />
          Back
        </Button>
      </div>
      <div className="scroll-container flex-1 overflow-y-auto">
        <main className="mx-auto max-w-3xl space-y-10 px-4 py-8 sm:px-6">
          <header className="space-y-3">
            <h1 className="text-2xl md:text-3xl">How Nenya removes identifiers</h1>
            <p className="text-muted-foreground">
              Before a coach message leaves your device, the page looks for things that could identify someone and swaps them for placeholders like [EMAIL]. The
              site’s server does the same again. This page runs that same code here in your browser, so what you see is what the coach would send. Nothing you
              type on this page is sent anywhere.
            </p>
          </header>

          <section aria-labelledby="try-it" className="space-y-3">
            <h2 id="try-it" className="text-xl">Try it</h2>
            <label htmlFor="pii-input" className="block text-sm">
              Write anything, or change the example.
            </label>
            <textarea
              id="pii-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={5}
              className="w-full resize-y rounded-lg border border-border bg-background p-3 text-sm"
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" className="min-h-11" onClick={() => setInput(EXAMPLE)}>
                Use the example
              </Button>
              <Button type="button" variant="outline" size="sm" className="min-h-11" onClick={() => setInput('')}>
                Clear
              </Button>
            </div>
            <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-4" aria-live="polite">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">What the coach would receive</p>
              <Marked text={result.text} />
              <p className="text-xs text-muted-foreground">
                {result.total ? `Replaced ${describeScrub(result.counts)}.` : 'Nothing was replaced.'}
                {input === EXAMPLE && ' Notice what stays: “Portland” (places are not removed), and the feelings, which are what the coach needs.'}
              </p>
            </div>
          </section>

          <section aria-labelledby="where" className="space-y-3">
            <h2 id="where" className="text-xl">Where it runs</h2>
            <ol className="list-decimal space-y-2 pl-5 text-sm">
              <li>While you type in the coach, a note tells you if your message looks like it has a name or contact detail in it.</li>
              <li>When you press Send, your page replaces them on your device, before anything leaves it.</li>
              <li>The site’s server replaces them again, in case the page was bypassed, then sends the message on to the AI. Nenya does not store it.</li>
              <li>A signed transcript you download holds the replaced text, not what you first typed.</li>
            </ol>
            <p className="text-sm text-muted-foreground">
              Reports and messages sent through the site’s forms are not scrubbed this way; those forms ask you to leave names and contact details out.
            </p>
          </section>

          <section aria-labelledby="limits" className="space-y-3">
            <h2 id="limits" className="text-xl">What it can miss</h2>
            <p className="text-sm">
              This is pattern matching, not understanding. It is good at structured details like emails, phone numbers and addresses. It misses names that are not on
              its lists, nicknames and unusual spellings, places, workplaces, and details that are unique to your story. It can also replace a word that only looks
              like a name. So Nenya never calls the coach anonymous: please leave out anything that would identify you or someone else.
            </p>
          </section>

          <details className="rounded-lg border border-border p-4">
            <summary className="flex min-h-11 cursor-pointer items-center text-base underline underline-offset-4">Show the technical details</summary>
            <div className="mt-3 space-y-4 text-sm">
              <p>
                The rules run in this order, each on the text left by the one before. A placeholder replaces the whole match, or, for names after a telling phrase,
                only the name.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                      <th scope="col" className="py-2 pr-3">Order</th>
                      <th scope="col" className="py-2 pr-3">Placeholder</th>
                      <th scope="col" className="py-2 pr-3">Catches</th>
                      <th scope="col" className="py-2">How it decides</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SCRUB_RULES_DOC.map((r, i) => (
                      <tr key={`${r.tag}-${i}`} className="border-b border-border align-top">
                        <td className="py-2 pr-3 tabular-nums">{i + 1}</td>
                        <td className="py-2 pr-3 font-mono text-xs">[{r.tag}]</td>
                        <td className="py-2 pr-3">{r.catches}</td>
                        <td className="py-2 text-muted-foreground">{r.how}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                Separately from identifiers, the server also checks every message for attempts to give the coach instructions or change how it works; those are not
                sent at all. The crisis check runs before any of this: a message that clearly signals danger never leaves your device.
              </p>
              <p>
                The code is public:{' '}
                <a href={SOURCE} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                  src/lib/piiScrub.ts<span className="sr-only"> (opens a new tab)</span>
                </a>
                , with its tests in tests/pii-names.test.mts and tests/safety-scrub-guard.test.mts.
              </p>
            </div>
          </details>
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
