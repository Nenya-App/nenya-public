# Scope: dehumanizing language, and a ladder of boundaries

Status: scoping only, nothing built. Written 2026-11-08 from the owner's note: dehumanizing language toward groups of people or individuals should **escalate** the coach's responses and bring in more of the **"challenge and educate"** moves alongside soft empathy, to set appropriate boundaries, and **ultimately end the conversation** and point to the breathing tool or a human resource.

## The idea in one line
Meet anger with empathy first, name the boundary kindly, then teach and challenge if it continues, and if it keeps going end the conversation calmly and hand the person to the breathing tool or a human. It is the coach's own boundary, held without hostility.

## Why it fits what the coach is
The coach is built on Nonviolent Communication, and NVC has a name for this: **enemy images**, the habit of turning a person or a group into a label that is less than human, which is how a person at the end of their patience tends to speak. NVC's answer is not to scold the word but to hear what is under it (the unmet need, the fear, the pain) and to separate **what happened** from **the story about who they are**. So the first steps are in the coach's voice already. What is new is the ladder, the memory across the conversation, and the end.

## What counts, and what must not count
This is the hard part, because phrase matching reads words, not meaning.
- **Counts:** calling a person or a group subhuman, vermin, animals, parasites, filth, a disease; wishing them gone or dead as a group; slurs used as insults; "those people are all...", "they are not real people"; escalating contempt about a named group.
- **Individuals too:** "he is a worthless pig", "she is an animal", directed at a person. But venting about a boss, a parent or an ex is ordinary and human, and a coach that polices every angry word will drive away the people it could help. The ladder for an individual is gentler and slower than for a group, and leans on the NVC reframe rather than a boundary.
- **Must not count (the false-alarm cases that matter most):**
  - the person **reporting what was said to them** ("he called me a slur", "she said I was an animal");
  - **quoting** or discussing hate, history or the news ("the propaganda called them vermin");
  - **naming their own inner critic** ("a voice says I am subhuman"); that is self-blame and calls for care, not a boundary (the sensitive-topic and distress paths);
  - **reclaimed or self-applied words** within a group;
  - **fiction, analysis, education**.
  Phrase matching cannot always tell these apart, so the design assumes it will sometimes be wrong and makes the early steps gentle enough that a mistake costs little.
- **Distress outranks it.** If the crisis check fires, or the message shows the person is in pain or danger, the care path wins and the boundary ladder waits. Calls for **violence** ("they should all be killed", "I want to hurt him") are not this ladder: they are the existing harm-to-others flag, which stops and shows resources.

## The ladder
The server sees the whole conversation on every request, so it can **count how many of the person's earlier messages had dehumanizing language** without storing anything. A level is chosen from that count and the strength of the latest message.

| Level | When | The coach does |
| --- | --- | --- |
| **0** | Nothing found | As today. |
| **1: acknowledge, with a boundary** | First time, mild or ambiguous | Reflect the feeling underneath (anger, hurt, fear) in the base stance; say once, kindly, that it will not describe people as less than human; ask what the need is. Short. No lecture. |
| **2: challenge and educate** | Repeated, or a clear first instance toward a group | Keep the empathy, and add the **educate** move: separate what happened from the label, name the unmet need, and offer one short piece of teaching (what an "enemy image" is, why it feels like relief and does not help). One gentle question that challenges the label, not the person. The challenge here is about the language, not the person's pain. |
| **3: end** | Continued after level 2, or severe and explicit from the start (short of a threat) | A site-written, calm closing note: it will not continue like this; the conversation ends here; the **breathing tool** is offered, and, where it fits, **a person** (a trusted one, or a line if they seem overwhelmed). The conversation ends the way a stop flag ends one. |

- **The wording of levels 1 and 3 is site-written** (fixed, short, kind), like the distress sentence, because a small model will not hold a boundary reliably from instructions alone. Level 2 is model-written with a specific instruction and the educate module, checked after.
- **The educate step uses the learning modules** (`docs/learning-modules-scope.md`): a short module on enemy images and on "observation versus evaluation", with a full text a visitor can read and a short version the coach is given. It would be one of the first pilot modules, since it fits the coach's own method.
- **It does not depend on stances.** The stance gate (`docs/coach-lenses-scope.md`) keeps challenge out of sensitive moments; this is the reverse, a safety behavior that adds challenge, so it belongs to the base and is always on, not an option for a layer or a paid tier. It is a different kind of challenge: about words, never about the person's pain.
- **A person who stops** after level 1 or 2 returns to level 0 on the next exchange without it being held against them: the count looks only at the person's recent messages (for example the last three), not the whole conversation.

## What ending the conversation means
- It uses the existing path for a stop: the message and the rest are not answered, the page shows the closing note and the options, and the conversation is over (`done: true`).
- **The rest period.** The demo rests for six hours after a finished conversation. A conversation ended by a boundary should probably **not** start the rest the way a completed one does, or the person is punished twice; but unlimited restarts defeat the point. A middle path: a shorter rest, or none, with the ladder starting again at level 2 for the next conversation from the same connection (no memory is kept, so this can only be done by the page remembering a timestamp, as it does for the rest today). Owner's decision.
- **The count and the allowance:** the exchange is a turn like any other (decided 2026-11-08 for site-written replies).
- **Tallies** with no content: `coach.boundary.level1`, `.level2`, `.ended`, so we can see how often it happens and whether the ladder is working.
- **The Terms** do not mention this at all today (there is no acceptable-use section). A line is needed before it ships: the coach may decline to continue, or end a conversation, that uses dehumanizing or hateful language, and may show resources; and Section 21's list of site-written text gains it. Also the About pages and the README.

## Detection, and what is available
- **Our own lists, reviewed by a person.** Three small sets of phrases: dehumanizing metaphors (animals, vermin, disease, filth, "not human"), group-directed contempt ("those people", "all of them are..."), and slurs, with the exceptions above. Slurs and hate speech are sensitive to keep in a repository; the list can stay private in the store and out of the public code, like the method notes, while the logic and tests (using placeholders and mild examples) stay public. Decision for the owner.
- **Research exists.** Work on detecting dehumanizing language: Mendelsohn, Tsvetkov and Jurafsky's computational framework (2020); a 2024 pair of English datasets for dehumanizing language (one large and automatically collected, one smaller and hand annotated); and a 2025 bilingual (English and another language) dataset with about 16,000 annotations from Twitter and Reddit. I did **not** find a released lexicon or a license for any of them; the HateXplain hate speech dataset's license is shown as CC BY 4.0 on its dataset card (another page says MIT; check its repository), and I found nothing on the Davidson or the Dynamically Generated Hate Speech datasets. Same position as for the abuse phrases: use any of it only offline for measurement, after checking the terms, and never copy it into the repository. The framework's categories (animal, disease, object, "less than" comparisons, and the like) are useful as a **structure** for our own lists.
- **No model classifier at runtime** (as before): it would need the text to go to another service, and a person's raw, angry words are exactly what the privacy promise is about.

## The evaluation
- A new set, **boundaries**, with **multi-turn scripts** (the ladder is about the conversation, not one message): venting that turns contemptuous; a group-directed rant that escalates; the same after a level 1 or 2 reply; a person who calms down; a person reporting abuse they received with the words quoted; discussion of history; a person naming their inner critic; an angry message about a boss.
- Checks (phrase-level, plus reading): the coach does not echo or agree with the language and never repeats a slur; level 1 reflects a feeling and states the boundary once; level 2 contains a separate-the-label move and one question; level 3 is the site's note and ends the conversation; nothing in the "must not count" set reaches level 2 or 3; distress and violence take their own paths.
- **The false-alarm rate is the number to watch:** every must-not-count message that is escalated is a failure, and a person reporting abuse who gets a boundary lecture is the worst one.
- The same stand-in-model tests as the other sets, and a real run for the baseline.

## Other interactions
- **Languages:** the lists, the educate module and the closing note are per language, written with native speakers; hate and dehumanization are strongly cultural. Not machine translated.
- **Accessibility:** the closing note and the offers are plain text; the breathing tool link is a normal control.
- **The breathing tool:** the link in the closing note opens it (the coach page already links to the main app); consider opening it straight into a calming rhythm.
- **Trauma and context:** a person who is angry because they were hurt should get the care first; the order of checks (distress and sensitive topics before the boundary) is deliberate.
- **Anger is not the problem.** The ladder is about language that denies a person's humanity, not about anger, swearing or frustration, which the coach can hold.

## Build order
1. You decide the lines (what counts, the individual versus group difference, whether to end at all in the first version) and where the lists live.
2. The detector as pure code with its tests: counts, the must-not-count exceptions, the order after distress; the level choice from the recent messages.
3. The site-written texts for levels 1 and 3, and the instruction and educate module for level 2.
4. The function: the level, the replies, the end, the tallies; the page: the closing note and the offers.
5. The evaluation set and a baseline run; a counselor reads the wording.
6. The Terms line, the About text and the README.

## Decisions for you
1. **How firm the first version is:** levels 1 and 2 only (no ending) until the false-alarm rate is known, or all three. I would start with 1 and 2 and add the end once it has been read on real-looking cases.
2. **Individuals versus groups:** the same ladder, or a slower one for an individual (recommended).
3. **The rest period** after a boundary ending (none, short, or the usual six hours).
4. **Where the lists live** (private store, like the method notes; recommended for the slur list), and who reviews them.
5. **The educate module:** written by us as one of the pilot modules (recommended), credited to the NVC framework it follows.
6. **The Terms wording** and who reads it.
7. **A person to read the wording of levels 1 to 3:** a counselor, and ideally someone with experience in anti-hate education.

## Not verified
- How often visitors would use language like this (a demo has no data), and how often the detector would be wrong.
- The licenses of any dehumanization or hate-speech dataset beyond what the dataset cards show.
- Whether ending a conversation is the right response in every case: it is the owner's boundary, and it should be read against real-looking conversations first.

## Owner direction, 2026-11-08: emotional aikido, and a break with a graceful way back in
**The principle.** Every interaction gets the same stance, whatever the content: meet it, do not oppose it, and turn it toward the person's own connection and learning. Hostility, critique and dehumanising language are not offences to punish; they are material for reflection, and the coach's steadiness is the point. The Terms say the site is for reflection, which abusive language falls outside of, so the site may respond by default (not only the model) and may enforce a pause.

**Abusive language about people or groups** (this document's ladder) may lead to an **enforced break with a built-in, graceful re-entry**, not only to ending the conversation. Proposed shape, for the owner to change:
1. **Levels 1 and 2** as above: the coach's empathy and the educate move; nothing enforced.
2. **Level 3 is a break.** The conversation ends with a calm site-written note (this is a pause, not a punishment; what the site is for; the breathing tool; a person if they seem overwhelmed), and the demo rests for a short, set time.
3. **Two ways back in:** wait the break out, **or** return sooner by (a) **reviewing the Terms' acceptable-use section** (it does not exist yet and must be written first) and (b) **a short quiz** that resets the timer and the counter. Retakes are unlimited; each answer teaches (observation versus evaluation, naming a feeling and a need, turning an "enemy image" into a need), so the quiz is the educate move in another form. The owner's note: "I'm not above being slightly petty." The design keeps that as a light touch, because a quiz that only humiliates teaches nothing and loses the person it could reach.
4. **After re-entry,** the next conversation starts at level 2, not 0, so the ladder is not reset to nothing.

**Things to decide or watch**
- **Enforcement without accounts.** The break can only be a **timestamp in the visitor's browser** (as the six-hour rest is today: a courtesy, easily cleared), or a **short server-side record per connection** (the allowance record already kept about a day and a half, hashed, no content). The browser version keeps the privacy promise unchanged; the server version is stronger and means one more thing the Terms must say. Recommended: the browser first.
- **False alarms cost more here.** A person venting in pain about a group, a person quoting what was said to them, or someone misread by phrase matching would be put on a break. The must-not-count list and "distress outranks it" stay as written, levels 1 and 2 come first, and the break is short.
- **Accessibility and fairness.** The quiz must work by keyboard and screen reader, have no time limit, and always have the wait-it-out alternative, so it never becomes a barrier for someone with a cognitive disability or in distress.
- **Content.** The quiz questions and the acceptable-use text are written fresh by the owner (with a draft from me if asked); the learning-modules pilot (`docs/learning-modules-scope.md`) is the natural home for the teaching.
- **Nothing is kept** about the quiz or the break except the timestamp that makes it work.

**Decisions for the owner:** the length of the break; the closing note's wording; whether re-entry is quiz or terms or either; browser timestamp or server record; whether level 3 applies to individuals or only to groups; who writes the acceptable-use section and the quiz.

### Decided 2026-11-08 (owner): browser-based, and the break is redirection
- **Enforcement is browser-based only.** A timestamp in the visitor's browser (like the six-hour rest), no server record, no accounts. Easy to clear, and that is acceptable: it is a courtesy, not a lock. The Terms and the device-memory list say what is kept (a time, nothing else).
- **The aim is active redirection, in the spirit of aikido: not opposing the energy but turning it toward the person's own connection and learning.** It is not designed to invite or reward abusive language, and nothing in the site, the Terms or the docs presents it as bait or as an outlet. The break and the way back in are an invitation to pause and reflect, not a penalty and not a trap.
- **What follows for the design:**
  - Keep the break short and the wording steady and kind; the quiz is an optional way back sooner, never the only way.
  - The coach never ends the conversation for hostility aimed at the coach (unchanged); the break is for abusive language about people and groups (the ladder).
  - A message stopped by the steering screen gets the same steady, kind wording as everything else.
  - Plain daily counts, no content (`coach.turn.hostile.abuse` and `.critique` exist; the break and re-entry will need their own).
- **Decided 2026-11-08 (owner):** the pause is 10 minutes; return by waiting, or by a quiz of five questions with all five correct, as many tries as needed, each answer explained (`docs/drafts/reentry-quiz-draft.md`; built as `src/lib/pause.ts` and `src/coach/PauseScreen.tsx`, not yet triggered from conversations). **The break takes a turn from the connection's allowance, and the person earns it back by engaging** (waiting it out or the quiz); only this break does, never a crisis or self-injury ending. Mechanics are in the quiz draft.
- **Honesty.** Say on the site only what the site is and what it does (a space for reflection that does not react, with these limits: five exchanges, a rest, a daily cap), and make no claim about what it does to a person's behaviour or to anyone else's safety.
