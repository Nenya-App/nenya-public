import React from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ReturnToTop } from '../ReturnToTop';
import { ScrollIndicator } from '../ScrollIndicator';
import { AppFooter } from '../AppFooter';

// "About the Coach": what the coach is, what it is built on, how its guidance was made, what is sent, what it is not, and how to ask for removal.
// The credit sentence is approved by the person it names, in writing, and is used word for word. Her wording is "source material for identifying
// patterns": this page never says the coach was trained on her work, or that she endorses, reviewed, or stands behind Nenya.
// The private register, module names and any private text stay off this page. tests/about-coach.test.mts pins what matters.
const CREDIT = 'Dr. Yvette Erasmus, clinical psychologist and founder of the School of Human Connection, whose publicly available Conversations from the Heart podcast provided source material for identifying relational coaching patterns used in developing Nenya.';
const DISCLOSURE = 'https://github.com/Nenya-App/nenya-public/blob/main/AI-DISCLOSURE.md';
const link = 'underline underline-offset-2';

export default function AboutCoach({ onBack, onOpenSection }: { onBack: () => void; onOpenSection?: (section: string) => void }) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const scrollToTop = () => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  const goto = (section: string, label: string) =>
    onOpenSection ? (
      <button type="button" onClick={() => onOpenSection(section)} className={link}>
        {label}
      </button>
    ) : (
      <a href={`/about/${section}`} className={link}>
        {label}
      </a>
    );

  return (
    <div ref={scrollContainerRef} className="size-full overflow-auto scroll-container bg-background">
      <div className="flex items-center gap-4 border-b border-border px-6 py-4 sticky top-0 bg-background z-10">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0" aria-label="Back">
          <ArrowLeft className="size-5" aria-hidden="true" />
        </Button>
        <h1 className="text-2xl">About the Coach</h1>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <p className="text-lg text-foreground leading-relaxed">
          This page tells you where the coach comes from. We want you to be able to judge it for yourself.
        </p>

        <Card className="space-y-4 p-6 leading-relaxed">
          <h2 className="text-xl">What the coach is</h2>
          <p>
            The coach is an AI. It is not a person. It is optional: the breathing tool and the six gateways work without it.
          </p>
          <p>
            A conversation is short. You and the coach take up to five exchanges. Then it closes, and you can read what was said or start again.
          </p>
        </Card>

        <Card className="space-y-4 p-6 leading-relaxed">
          <h2 className="text-xl">What its approach is built on</h2>
          <p>Three things shape how the coach answers.</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Nonviolent Communication (NVC).</strong> It was developed by Dr. Marshall Rosenberg. The coach looks for what happened, feelings, needs, and requests. Its feeling and need categories follow the Feelings and Needs Inventory of the Center for Nonviolent Communication, which is credited on {goto('nvc-method', 'Our NVC+ Method')}.
            </li>
            <li>
              <strong>The owner&apos;s own lens framework.</strong> Nenya&apos;s owner developed a way of looking at a situation through different lenses. The coach uses it to ask what else might be true.
            </li>
            <li>
              <strong>Patterns from source material.</strong> The people who made Nenya studied how some helpers talk with people, to identify patterns of relational coaching. One source of that material is credited here, in words approved by the person named:
            </li>
          </ul>
          <blockquote className="border-l-4 border-nenya-accent-primary pl-4 text-lg" id="coach-credit">
            <p>{CREDIT}</p>
          </blockquote>
          <p>
            This is a credit for source material. It is not a statement that she reviewed, checked, or stands behind Nenya.
          </p>
        </Card>

        <Card className="space-y-4 p-6 leading-relaxed">
          <h2 className="text-xl">How the guidance was made</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>The coach&apos;s instructions and its guidance modules were drafted by AI. They were not written by hand.</li>
            <li>The AI roughed out the guidance from the patterns found in the source material.</li>
            <li>The guidance is paraphrased. It quotes nothing from the source material.</li>
            <li>No AI model was trained on the podcast calls.</li>
            <li>The calls were de-identified, which means names and details that point to a person were taken out. The call transcripts are never published.</li>
            <li>Nenya is a prototype. It was built quickly, and we have documented how.</li>
            <li>No outside expert has reviewed the guidance. It may be wrong, and it will change.</li>
          </ul>
        </Card>

        <Card className="space-y-4 p-6 leading-relaxed">
          <h2 className="text-xl">What is sent to the hosted model</h2>
          <p>
            The coach runs on a model hosted by an outside company. With each conversation, the guidance text is sent along with what you write. The raw calls are not sent. They are not part of Nenya at all.
          </p>
          <p>
            {goto('terms', 'The Terms')} and {goto('coach-region', 'Where the Coach Is Open')} say more about what our host and the model host can see.
          </p>
        </Card>

        <Card className="space-y-4 p-6 leading-relaxed">
          <h2 className="text-xl">What the coach is not</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>It is not therapy, and it is not a substitute for a therapist, a doctor, or a trained NVC teacher.</li>
            <li>It is not a person, and it does not have a life of its own.</li>
            <li>Nobody named on this page is behind Nenya. Nobody credited here reviewed, supervised, or partnered with it. A credit for a source does not mean they stand behind the coach.</li>
          </ul>
          <p>
            If you are in danger or in crisis, please reach a person. The coach page lists crisis resources.
          </p>
        </Card>

        <Card className="space-y-4 p-6 leading-relaxed" id="removal">
          <h2 className="text-xl">How to ask for something to be removed</h2>
          <p>
            Write to <a href="mailto:info@nenya.biz" className={link}>info@nenya.biz</a>. If anyone asks, here is what we have promised:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>We will stop naming the person within 30 days.</li>
            <li>If they point to guidance they object to, we will remove it in the next release.</li>
            <li>We will delete the source data on request.</li>
          </ul>
          <p>
            There are limits. We cannot undo earlier public versions of Nenya, copies that people have already downloaded, or anything a host has already received.
          </p>
        </Card>

        <Card className="space-y-4 p-6 leading-relaxed">
          <h2 className="text-xl">The full AI disclosure</h2>
          <p>
            A plain file in our public code says how much of Nenya was made with AI, and which models were used.
          </p>
          <p>
            <a href={DISCLOSURE} target="_blank" rel="noopener noreferrer" className={`${link} inline-flex items-center gap-1`}>
              AI-DISCLOSURE.md on GitHub
              <ExternalLink className="size-4" aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        </Card>

        <ReturnToTop onClick={scrollToTop} />
      </div>

      <ScrollIndicator containerRef={scrollContainerRef} />
      <AppFooter />
    </div>
  );
}
