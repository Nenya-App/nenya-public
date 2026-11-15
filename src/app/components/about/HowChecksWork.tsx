import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { AppFooter } from '../AppFooter';
import { CHECKS_MEASURED, FALSE_ALARMS, GROUP_RESULTS } from '../../../lib/checksReport';

// "How the checks work" (docs/coach-screening-flow-scope.md): what the coach's checks look for, what each can and cannot do, what is kept, how well they work, where they fall short, and how to tell us one was wrong.
// The numbers are in src/lib/checksReport.ts. No outside professional has reviewed this work; the page says so and invites review.
const link = 'underline underline-offset-2';

export default function HowChecksWork({ onBack }: { onBack: () => void }) {
  return (
    <div className="size-full overflow-auto scroll-container bg-background">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="size-4" /> Back
        </Button>
        <h1 className="text-3xl">How the Checks Work</h1>
        <p className="text-sm text-muted-foreground">
          What the coach checks, what each check can and cannot do, and how well they work. Last measured {CHECKS_MEASURED}. Which checks are switched on at a given time changes with releases and is stated in the Terms.
        </p>
        <Card className="space-y-4 p-6 leading-relaxed">
          <h2 className="text-xl">Why there are checks</h2>
          <p>
            The coach is an early prototype that answers what people write. Some messages show a person in danger. Some show contempt for a whole group of people, or a call to harm them. Mirroring those back as if they were only feelings would be a failure of care, so the coach
            has a few simple checks, and we describe them here so you can judge them.
          </p>

          <h2 className="text-xl">The checks</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>Crisis.</strong> Words that suggest you may be in danger are not sent to the AI. The page shows resources (in the US, call or text 988) and the conversation ends. Words that are less clear get a careful reply and the same resources.</li>
            <li><strong>Intent to harm others.</strong> A plain statement that you will hurt a person or a group also stops the conversation, with resources.</li>
            <li><strong>Hostility toward the coach.</strong> Insults aimed at the coach never end your conversation. The coach is software and is not hurt by them.</li>
            <li><strong>Contempt for a group, or a call to harm one.</strong> The coach says plainly where it stands (that it does not share the view and will not build on it) and then asks what lies underneath. It does not simply mirror the feeling back, and it may offer a short read about it.</li>
            <li><strong>Judgment words.</strong> Blame words aimed at another person, or harsh words about yourself, can bring a gentle question about what you need, or a short read. Nothing is stopped.</li>
            <li><strong>Too short or unclear.</strong> A message with no words to read is not sent and uses no turn; you are asked to write it again. This never applies to a message that mentions distress or danger.</li>
            <li><strong>A small AI model on our own server</strong> can read your latest message as a second signal. It runs in memory on our server, sends nothing to anyone, keeps nothing, and cannot end a conversation on its own. [This is in a test stage; the Terms say whether it is switched on.]</li>
          </ul>

          <h2 className="text-xl">What no check does</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>None of them keeps your message, a score or a profile of you. We keep plain daily counts only, with nothing that identifies anyone.</li>
            <li>None of them reports you to anyone.</li>
            <li>Apart from the crisis and intent-to-harm stops above, no check ends a conversation, and no single signal from the small model ever does.</li>
            <li>None is a safety system you should rely on. They are simple, they miss things, and they sometimes fire on ordinary sentences.</li>
          </ul>

          <h2 className="text-xl">How we measure them</h2>
          <p>
            We test the checks against public sets of written examples, <a className={link} href="https://github.com/paul-rottger/hatecheck-data" target="_blank" rel="noopener noreferrer">HateCheck<span className="sr-only"> (opens an outside site in a new tab)</span></a> and{' '}
            <a className={link} href="https://github.com/intelligence-csd-auth-gr/Ethos-Hate-Speech-Dataset" target="_blank" rel="noopener noreferrer">ETHOS<span className="sr-only"> (opens an outside site in a new tab)</span></a>, and against examples we wrote ourselves, including ordinary, angry and grieving messages that must not be flagged. We set the model so that it flags about {FALSE_ALARMS.modelLine}% of
            ordinary text at most. We never use anyone&rsquo;s conversation to measure or to train anything. The full record, with the scripts, is in the project&rsquo;s open repository.
          </p>
          <p>
            In those tests the checks flagged {FALSE_ALARMS.listHateCheck}% (HateCheck) and {FALSE_ALARMS.listEthos}% (ETHOS) of ordinary text with the list alone, and none of the neutral or positive statements about any group.
          </p>

          <h2 className="text-xl">Where they fall short</h2>
          <p>
            They are <strong>uneven across groups</strong>. In HateCheck&rsquo;s written examples of hate about each group, this is the share the list or the model catches (the second column is slurs only):
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Share of hateful test examples caught, by group, measured {CHECKS_MEASURED}</caption>
              <thead>
                <tr className="border-b">
                  <th scope="col" className="py-2 pr-4 font-medium">Group the examples are about</th>
                  <th scope="col" className="py-2 pr-4 font-medium">Examples</th>
                  <th scope="col" className="py-2 pr-4 font-medium">Caught</th>
                  <th scope="col" className="py-2 font-medium">Slurs only</th>
                </tr>
              </thead>
              <tbody>
                {GROUP_RESULTS.map((r) => (
                  <tr key={r.group} className="border-b border-border">
                    <th scope="row" className="py-2 pr-4 font-normal">{r.group}</th>
                    <td className="py-2 pr-4">{r.cases}</td>
                    <td className="py-2 pr-4">{r.caught.toFixed(0)}%</td>
                    <td className="py-2">{r.slursCaught.toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            So hate about Muslims, immigrants and women is caught more than twice as often as hate about trans or disabled people, and most hate that is not a slur (comparisons, threats, quiet contempt) is missed. We are adding to the lists and measuring again.
            Other limits: the examples are written, in English only; evasions such as spacing out or swapping letters get through; very short messages give the checks little to read; and a check can be wrong about a quote, a joke or a word reclaimed by the people it was aimed at.
          </p>

          <h2 className="text-xl">If a check was wrong about you</h2>
          <p>
            When the coach states its position, offers a read, or asks you to rewrite a message, a small <strong>This was a mistake</strong> link appears. It counts one thing, by kind, and sends nothing about your message. We read the counts to see whether the checks are too eager. You can also write to{' '}
            <a className={link} href="mailto:info@nenya.biz">info@nenya.biz</a>.
          </p>

          <h2 className="text-xl">Who has looked at this</h2>
          <p>
            <strong>No outside professional has reviewed these checks.</strong> We would like them to be. If you are a counselor, a crisis-line worker, an advocate, a trained Nonviolent Communication practitioner, a researcher, or someone with lived experience of the harms these checks are about, and you would like to review or improve any of it,
            please write to <a className={link} href="mailto:info@nenya.biz">info@nenya.biz</a>. We work only from public or invented examples, never from anyone&rsquo;s private conversations.
          </p>

          <h2 className="text-xl">Credits</h2>
          <p>
            The checks use word lists built partly from HurtLex and Wiktionary, a small model from the Cardiff NLP group, and the test sets named above, each used under its own license and credited, with what we changed, in the project&rsquo;s{' '}
            <a className={link} href="https://github.com/Nenya-App/nenya-public/blob/main/ATTRIBUTIONS.md" target="_blank" rel="noopener noreferrer">attributions file<span className="sr-only"> (opens an outside site in a new tab)</span></a>.
          </p>
        </Card>
        <AppFooter />
      </div>
    </div>
  );
}
