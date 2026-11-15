import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { AppFooter } from '../AppFooter';

// "Where we stand": what Nenya says about genocide, apartheid, occupation and colonization, and what it will not do (docs/drafts/history-and-violence-text-draft.md, approved
// by the owner 2026-11-10). The facts move, and the coach cannot search the web, so this page carries a "last reviewed" date and the owner (or a session, on request) updates it.
export const WHERE_WE_STAND_REVIEWED = '10 November 2026';

const link = 'underline underline-offset-2';
const L = ({ href, children }: { href: string; children: string }) => (
  <a href={href} className={link} target="_blank" rel="noopener noreferrer">
    {children}
    <span className="sr-only"> (opens an outside site in a new tab)</span>
  </a>
);

export default function WhereWeStand({ onBack }: { onBack: () => void }) {
  return (
    <div className="size-full overflow-auto scroll-container bg-background">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="size-4" /> Back
        </Button>
        <h1 className="text-3xl">Where We Stand</h1>
        <p className="text-sm text-muted-foreground">On genocide, apartheid, occupation and colonization. Last reviewed {WHERE_WE_STAND_REVIEWED}. The facts here can change; this page is updated by hand.</p>
        <Card className="space-y-4 p-6 leading-relaxed">
          <p>Nenya is built on one idea: every person is a person, and what someone feels and needs matters. That is why we do not treat genocide, apartheid or occupation as matters of opinion, and why we will not help anyone make a group of people seem less than human.</p>

          <h2 className="text-xl">What we say about history</h2>
          <p>We say what happened. The Holocaust happened. So did the genocides in Armenia, Rwanda, Bosnia and Cambodia. The United States was built in part on slavery and on the taking of land from Native peoples, with massacres, forced removal and the boarding schools that took children from their families, and the government has apologized for some of this. Colonization, the taking of land and the rule of peoples by force, shaped much of the world and is still lived with now. None of this is a matter of two sides.</p>

          <h2 className="text-xl">What we say about Israel and Palestine</h2>
          <p>
            Israel&rsquo;s occupation of the Palestinian territories is unlawful. The International Court of Justice said so in{' '}
            <L href="https://www.un.org/unispal/document/advisory-opinion-icj-19jul24/">July 2024</L> and said it must end. In{' '}
            <L href="https://www.un.org/unispal/document/summary-advisory-opinion-icj-22oct25/">October 2025</L> it also found that Israel must ensure the population&rsquo;s basic needs are met and may not use starvation of civilians as a method of warfare.
          </p>
          <p>
            Israel&rsquo;s rule over Palestinians has been found to be apartheid by leading human rights organizations, among them an Israeli one:{' '}
            <L href="https://www.btselem.org/publications/fulltext/202101_this_is_apartheid">B&rsquo;Tselem</L> (2021),{' '}
            <L href="https://www.hrw.org/report/2021/04/27/threshold-crossed/israeli-authorities-and-crimes-apartheid-and-persecution">Human Rights Watch</L> (2021, which found the crimes against humanity of apartheid and persecution) and{' '}
            <L href="https://www.amnesty.org/en/documents/mde15/5141/2022/en/">Amnesty International</L> (2022). We agree with them.
          </p>
          <p>
            What Israel has done in Gaza since October 2023 has been found to be genocide by an independent United Nations commission of inquiry (September 2025),{' '}
            <L href="https://www.amnesty.org/en/documents/mde15/8744/2024/en/">Amnesty International</L> (December 2024) and Israeli human rights organizations including B&rsquo;Tselem and Physicians for Human Rights Israel. We agree with them. A court has not yet ruled on the genocide claim, and the case will take years; we do not think the dead should have to wait for a verdict for us to say it.
          </p>
          <p>We also say that the attack on 7 October 2023 killed about 1,200 people and took hostages, that these were atrocities, and that no Jewish person anywhere is responsible for the actions of the Israeli government. No Palestinian is responsible for Hamas.</p>

          <h2 className="text-xl">Belief and feeling</h2>
          <p>We treat every belief, religious ones included, the way we treat any thought: with care for the feeling and the need under it. If a belief is hurt by being questioned, that hurt is real and we will listen to it. It does not make the belief true, and it does not make it off limits.</p>

          <h2 className="text-xl">If you have survived violence</h2>
          <p>What you feel is yours. Rage, grief, fear and mistrust after violence make sense, and nobody here will tell you to feel differently or call it your fault. Listening to anger is not agreeing with a plan for harm, and we will not help anyone justify violence against a people.</p>

          <h2 className="text-xl">The same line in every direction</h2>
          <p>This goes for anyone. We will not describe settlers, colonizers or occupiers as vermin any more than we will describe the colonized that way, and we will not help anyone call for a whole people to be driven out or wiped out, whoever they are and wherever they are. Anger at a system that took land or freedom makes sense, and we will listen to it. Wanting the system to end is not wanting its people gone.</p>

          <h2 className="text-xl">What we will not do</h2>
          <p>We will not describe people as animals, vermin, disease or less than human. We will not justify genocide, ethnic cleansing, apartheid, collective punishment or mass violence by anyone, and we will not help deny that documented genocides happened. If you say something like that to the coach, it will tell you plainly that it disagrees, say what the record shows, offer you something to read, and ask what is behind it for you. It will not shame you, and it will not pretend to agree.</p>

          <h2 className="text-xl">Where you can learn more</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li><L href="https://www.un.org/unispal/document/advisory-opinion-icj-19jul24/">International Court of Justice, advisory opinion of 19 July 2024</L></li>
            <li><L href="https://www.un.org/unispal/document/summary-advisory-opinion-icj-22oct25/">International Court of Justice, advisory opinion of 22 October 2025 (summary)</L></li>
            <li><L href="https://www.amnesty.org/en/documents/mde15/8744/2024/en/">Amnesty International, &ldquo;You Feel Like You Are Subhuman&rdquo; (December 2024)</L></li>
            <li><L href="https://www.amnesty.org/en/documents/mde15/5141/2022/en/">Amnesty International, Israel&rsquo;s apartheid against Palestinians (February 2022)</L></li>
            <li><L href="https://www.hrw.org/report/2021/04/27/threshold-crossed/israeli-authorities-and-crimes-apartheid-and-persecution">Human Rights Watch, A Threshold Crossed (April 2021)</L></li>
            <li><L href="https://www.btselem.org/publications/fulltext/202101_this_is_apartheid">B&rsquo;Tselem, This is apartheid (January 2021)</L></li>
          </ul>
        </Card>
      </div>
      <AppFooter />
    </div>
  );
}
