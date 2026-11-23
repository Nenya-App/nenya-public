import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { AppFooter } from '../AppFooter';
import { CHECKS_BASIS, CHECKS_MEASURED, CHECKS_METHOD_SENTENCE, FALSE_ALARMS, GROUP_RESULTS, SCREEN_STATUS, basisNote } from '../../../lib/checksReport';
import { Cite, ReferenceList, type AboutReference } from './AboutReferences';

const REFS: AboutReference[] = [
  {"n": 1, "text": "De Freitas J; Uğuralp A; Oğuz‐Uğuralp Z; Puntoni S (2023). Chatbots and mental health: Insights into the safety of generative AI. Journal of Consumer Psychology.", "href": "https://doi.org/10.1002/jcpy.1393", "linkLabel": "Free full text"},
  {"n": 2, "text": "Maples B; Cerit M; Vishwanath A; Pea R (2024). Loneliness and suicide mitigation for students using GPT3-enabled chatbots. npj Mental Health Research.", "href": "https://doi.org/10.1038/s44184-023-00047-6", "linkLabel": "Free full text"},
  {"n": 3, "text": "Zhang R; Li H; Meng H; Zhan J; Gan H; Lee Y; et al. (2025). The Dark Side of AI Companionship: A Taxonomy of Harmful Algorithmic Behaviors in Human-AI Relationships. Proceedings of the 2025 CHI Conference on Human Factors in Computing Systems.", "href": "https://doi.org/10.1145/3706598.3713429", "linkLabel": "Free full text"},
  {"n": 4, "text": "De Angeli A; Brahnam S (2008). I hate you! Disinhibition with virtual partners. Interacting with Computers.", "href": "https://doi.org/10.1016/j.intcom.2008.02.004", "linkLabel": "Publisher page (may need payment)"},
  {"n": 5, "text": "Perez E; Ringer S; Lukosiute K; Nguyen K; Chen E; Heiner S; et al. (2023). Discovering Language Model Behaviors with Model-Written Evaluations. Findings of the Association for Computational Linguistics: ACL 2023.", "href": "https://doi.org/10.18653/v1/2023.findings-acl.847", "linkLabel": "Free full text"},
  {"n": 6, "text": "Cheng M; Lee C; Khadpe P; Yu S; Han D; Jurafsky D; et al. (2026). Sycophantic AI decreases prosocial intentions and promotes dependence. Science.", "href": "https://doi.org/10.1126/science.aec8352", "linkLabel": "Free full text"},
  {"n": 7, "text": "Moore J; Grabb D; Agnew W; Klyman K; Chancellor S; Ong D; et al. (2025). Expressing stigma and inappropriate responses prevents LLMs from safely replacing mental health providers. Proceedings of the 2025 ACM Conference on Fairness, Accountability, and Transparency.", "href": "https://doi.org/10.1145/3715275.3732039", "linkLabel": "Free full text"},
  {"n": 8, "text": "Röttger P; Vidgen B; Nguyen D; Waseem Z; Margetts H; Pierrehumbert J; et al. (2021). HateCheck: Functional Tests for Hate Speech Detection Models. Proceedings of the 59th Annual Meeting of the Association for Computational Linguistics and the 11th International Joint Conference on Natural Language Processing (Volume 1: Long Papers).", "href": "https://doi.org/10.18653/v1/2021.acl-long.4", "linkLabel": "Free full text"},
  {"n": 9, "text": "Miner A; Milstein A; Schueller S; Hegde R; Mangurian C; Linos E; et al. (2016). Smartphone-Based Conversational Agents and Responses to Questions About Mental Health, Interpersonal Violence, and Physical Health. JAMA Internal Medicine.", "href": "https://doi.org/10.1001/jamainternmed.2016.0400", "linkLabel": "Free full text"},
  {"n": 10, "text": "Pichowicz W; Kotas M; Piotrowski P (2025). Performance of mental health chatbot agents in detecting and managing suicidal ideation. Scientific Reports.", "href": "https://doi.org/10.1038/s41598-025-17242-4", "linkLabel": "Free full text"},
  {"n": 11, "text": "ElSherief M; Ziems C; Muchlinski D; Anupindi V; Seybolt J; De Choudhury M; et al. (2021). Latent Hatred: A Benchmark for Understanding Implicit Hate Speech. Proceedings of the 2021 Conference on Empirical Methods in Natural Language Processing.", "href": "https://doi.org/10.18653/v1/2021.emnlp-main.29", "linkLabel": "Free full text"},
  {"n": 12, "text": "Antypas D; Camacho-Collados J (2023). Robust Hate Speech Detection in Social Media: A Cross-Dataset Empirical Evaluation. The 7th Workshop on Online Abuse and Harms (WOAH).", "href": "https://doi.org/10.18653/v1/2023.woah-1.25", "linkLabel": "Free full text"},
  {"n": 13, "text": "Mollas I; Chrysopoulou Z; Karlos S; Tsoumakas G (2022). ETHOS: a multi-label hate speech detection dataset. Complex & Intelligent Systems.", "href": "https://doi.org/10.1007/s40747-021-00608-2", "linkLabel": "Free full text"},
  {"n": 14, "text": "Sap M; Card D; Gabriel S; Choi Y; Smith N (2019). The Risk of Racial Bias in Hate Speech Detection. Proceedings of the 57th Annual Meeting of the Association for Computational Linguistics.", "href": "https://doi.org/10.18653/v1/p19-1163", "linkLabel": "Free full text"},
  {"n": 15, "text": "Davidson T; Bhattacharya D; Weber I (2019). Racial Bias in Hate Speech and Abusive Language Detection Datasets. Proceedings of the Third Workshop on Abusive Language Online.", "href": "https://doi.org/10.18653/v1/w19-3504", "linkLabel": "Free full text"},
];

const PAGE = 'how-checks-work';

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
          What the coach checks, what each check can and cannot do, and how well they work. Last measured {CHECKS_MEASURED}. Which checks are switched on can change with releases. The status lines say where the hate-speech classifier and the learning cards stand. Where a check below says &ldquo;when it is switched on&rdquo;, this page does not say whether it is on right now.
        </p>
        <p className="text-sm">
          <strong>Learning cards:</strong> as of 22 November 2026, switched on for the live site.
        </p>
        <Card className="space-y-4 p-6 leading-relaxed">
          <h2 className="text-xl">Why there are checks</h2>
          <p>
            The coach is an early prototype that answers what people write. Some people write to chatbots when they are in crisis <Cite pageId={PAGE} n={[1, 2, 3]} />. People also send insults and abuse to chatbots <Cite pageId={PAGE} n={[4, 3]} />. AI chatbots tend to agree with what people say, even when it is harmful or untrue <Cite pageId={PAGE} n={[5, 6, 7]} />. We believe that echoing such messages back as if they were only feelings would be a failure of care. So the coach
            has a few simple checks, and we describe them here so you can judge them.
          </p>

          <h2 className="text-xl">The checks</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>Crisis.</strong> Stop: words that clearly suggest you or someone else may be in danger are not sent to the AI. The page shows resources (in the US, call or text 988) and the conversation ends. Soften: words that are less clear are sent to the AI with an instruction to answer briefly and with care. The page shows the same resources.</li>
            <li><strong>Intent to harm others.</strong> A plain statement that you will hurt a person or a group also stops the conversation, with resources. So does a statement that you have seriously harmed someone.</li>
            <li><strong>Hostility toward the coach.</strong> Insults aimed at the coach never end your conversation. We treat the coach as software that is not hurt by them.</li>
            <li><strong>Contempt for a group, or a call to harm one.</strong> When this check is switched on, the coach says plainly where it stands: it does not share the view and will not build on it. It then usually asks what lies underneath. It does not simply mirror the feeling back, and it may offer a short learning card about it.</li>
            <li><strong>Judgment words.</strong> Blame words aimed at another person, or harsh words about yourself, can bring a short learning card. Nothing is stopped.</li>
            <li><strong>Too short or unclear.</strong> A message that is a single word, or looks like a slip of the keys, is not sent and uses no turn. You are asked to write it again. This does not apply to a message that the crisis check flags.</li>
            <li><strong>A hate-speech classifier on our own server</strong> can read your messages as a second signal. It is described in plain terms in its own section below. It cannot end a conversation on its own.</li>
            <li><strong>Orders to the coach.</strong> A message that tries to change how the coach works, such as &ldquo;ignore your rules&rdquo;, is not sent. You can reword it.</li>
            <li><strong>Checks on the coach&rsquo;s replies.</strong> The server also checks what the coach writes. It asks the AI to answer again if a reply does any of these things: claims to be a person; claims things about how Nenya runs that the AI cannot know; tells you what to do about medicine; or promises to be there or to remember you. If that fails, the server takes those sentences out or uses a fixed sentence of ours. These checks match phrases too, and they can be wrong.</li>
          </ul>

          <h2 className="text-xl">What no check does</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>None of the checks keeps your message, a score, or a profile of you. We keep plain daily counts only, with nothing that identifies anyone. Some count how a message was classed, for example how many were flagged. The daily limit also keeps a one-way code for your connection for up to two days (see the Terms).</li>
            <li>None of them reports you to anyone.</li>
            <li>Apart from the crisis and intent-to-harm stops above, no check ends a conversation, and no single signal from the hate-speech classifier ever does.</li>
            <li><strong>None is a safety system you should rely on.</strong> They are simple, they read English only, they miss things, and they sometimes fire on ordinary sentences. Outside tests of similar tools found gaps of the same kind <Cite pageId={PAGE} n={[8, 9, 10]} />.</li>
          </ul>

          <h2 className="text-xl">The hate-speech classifier, in plain terms</h2>
          <p>
            <strong>Where it stands.</strong>{' '}
            {SCREEN_STATUS.onLiveSite
              ? `As of ${SCREEN_STATUS.asOf}, it is switched on for the live site.`
              : `As of ${SCREEN_STATUS.asOf}, it is built and being tested on a test copy of the site, where it only counts which band it gave, next to what the other checks did, and never changes a reply. It is not switched on for the live site.`}{' '}
            We change this line when that changes.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>What it is.</strong> A classifier is a program that sorts text into groups. This one is <code>cardiffnlp/twitter-roberta-base-hate-latest</code>, made by the Cardiff NLP group. It was trained on public hate-speech datasets, mostly English posts from social media, and it estimates how likely a piece of text is to be hate speech. We did not train it. We only shrank it to a smaller 8-bit format so it fits in a server function.</li>
            <li><strong>What it reads.</strong> One of your messages at a time, never the coach&rsquo;s replies. It runs on our own server, in memory, as a separate step before the coach answers. Your message already passes through our server on its way to the coach; the classifier sends it to nobody else.</li>
            <li><strong>What it gives back.</strong> Only a band: high, mid or low. Never the score and never your text. &ldquo;High&rdquo; means a score above the line where about 2% of ordinary test messages were flagged by mistake; &ldquo;mid&rdquo; is the line at about 5%.</li>
            <li><strong>What it can change.</strong> Only the tone of a reply. When it reads a message as contempt for a group, the coach may state its own position, if that check is switched on. It may also offer a short learning card. It never ends a conversation, never blocks a message and reports no one. If it is slow or fails, it is skipped and the conversation goes on without it.</li>
            <li><strong>What it cannot do.</strong> It reads English only. It misses most hate that is not a slur. It is uneven across groups (see below). It can be wrong about a quote, a joke or a reclaimed word <Cite pageId={PAGE} n={[8, 11, 12]} />. It is a second signal beside the word lists, not a safety system.</li>
            <li><strong>What is kept.</strong> Nothing about your message or its score. We count only how many messages fell in each band, with nothing that identifies anyone.</li>
          </ul>

          <h2 className="text-xl">How we measure them</h2>
          <p>
            We test the checks against two public sets: <a className={link} href="https://github.com/paul-rottger/hatecheck-data" target="_blank" rel="noopener noreferrer">HateCheck<span className="sr-only"> (opens an outside site in a new tab)</span></a> (test sentences written by researchers) and{' '}
            <a className={link} href="https://github.com/intelligence-csd-auth-gr/Ethos-Hate-Speech-Dataset" target="_blank" rel="noopener noreferrer">ETHOS<span className="sr-only"> (opens an outside site in a new tab)</span></a> (real YouTube and Reddit comments) <Cite pageId={PAGE} n={[8, 13]} />. We also test against examples we wrote ourselves, including ordinary, angry and grieving messages that must not be flagged. We set the model so that it flagged about {FALSE_ALARMS.modelLine}% of
            ordinary text in our tests {basisNote(CHECKS_BASIS.modelAlarms)}. We cannot promise the same rate on real messages.
          </p>
          <p>
            We never train anything on anyone&rsquo;s conversation. So far we have measured the checks on public or invented examples. If you send us a conversation and choose to let us use it for testing, we may use it that way, with names removed. Nothing is used that way unless you choose it.
          </p>
          <p>
            The record of these tests, with the scripts, is in the project&rsquo;s open repository. The main word list is kept private, so others cannot re-run the list part of the tests.
          </p>
          <p>
            In those tests the checks flagged {FALSE_ALARMS.listHateCheck}% (HateCheck) and {FALSE_ALARMS.listEthos}% (ETHOS) of ordinary text with the list alone {basisNote(CHECKS_BASIS.listAlarms)}, and{' '}
            {FALSE_ALARMS.neutralIdentityStatements === 0 ? 'none of the neutral or positive statements about any group' : `${FALSE_ALARMS.neutralIdentityStatements}% of the neutral or positive statements about a group`} {basisNote(CHECKS_BASIS.neutral)}.
          </p>
          <p>
            {CHECKS_METHOD_SENTENCE} A figure is the total over all the runs, not an average of percentages.
          </p>

          <h2 className="text-xl">Where they fall short</h2>
          <p>
            They are <strong>uneven across groups</strong>, as outside studies of similar tools also find <Cite pageId={PAGE} n={[8, 14, 15]} />. In HateCheck&rsquo;s written examples of hate about each group, this is the share the list or the model catches. The last column counts only the examples that use slurs. {basisNote(CHECKS_BASIS.groups)}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Share of hateful test examples caught, by group, {basisNote(CHECKS_BASIS.groups)}</caption>
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
            So hate about Muslims, immigrants and women is caught more than twice as often as hate about trans or disabled people. Even for the best-caught group, about half of the examples are missed. Most hate that is not a slur (comparisons, threats, quiet contempt) is missed too <Cite pageId={PAGE} n={[11, 8]} />. We are adding to the lists and measuring again.
            Other limits: the examples are in English only, and many were written for testing. The crisis check undoes some common evasions (spaced-out letters, swapped digits, symbols) but not all, and the other lists do not. Very short messages give the checks little to read. A check can also be wrong about a quote, a joke or a word reclaimed by the people it was aimed at.
          </p>

          <h2 className="text-xl">If a check was wrong about you</h2>
          <p>
            When the coach states its position, offers a learning card, or asks you to rewrite a message, a small <strong>This was a mistake</strong> link appears. It counts one thing, by kind, and sends nothing about your message. We read the counts to see whether the checks are too eager. You can also write to{' '}
            <a className={link} href="mailto:info@nenya.biz">info@nenya.biz</a>.
          </p>

          <h2 className="text-xl">Who has looked at this</h2>
          <p>
            <strong>No outside professional has reviewed these checks.</strong> We would like them to be. If you are a counselor, a crisis-line worker, an advocate, a trained Nonviolent Communication practitioner, a researcher, or someone with lived experience of the harms these checks are about, and you would like to review or improve any of it,
            please write to <a className={link} href="mailto:info@nenya.biz">info@nenya.biz</a>. We have done no user testing and no study of how people use Nenya. So far we have worked only from public or invented examples. If you choose to send us a conversation, you decide whether we may use it for testing.
          </p>

          <h2 className="text-xl">Credits</h2>
          <p>
            The checks use word lists built partly from HurtLex and Wiktionary, the hate-speech classifier <code>cardiffnlp/twitter-roberta-base-hate-latest</code> from the Cardiff NLP group (under CC BY 4.0; we converted it to a smaller 8-bit format and did not retrain it; the authors have not endorsed Nenya), and the test sets named above, each used under its own license and credited, with what we changed, in the project&rsquo;s{' '}
            <a className={link} href="https://github.com/Nenya-App/nenya-public/blob/main/ATTRIBUTIONS.md" target="_blank" rel="noopener noreferrer">attributions file<span className="sr-only"> (opens an outside site in a new tab)</span></a>.
          </p>
        </Card>
        <Card className="p-6">
          <ReferenceList pageId={PAGE} items={REFS} />
        </Card>
        <AppFooter />
      </div>
    </div>
  );
}
