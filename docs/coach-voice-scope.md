# Scope: the coach does not speak as a person

Status: scoping only, nothing built. Written 2026-11-07.

## The idea
The coach is a computer program, and the site says so. The way it speaks should not suggest otherwise. Nobody is on the other side, so the coach should not say "I", "me", "my", "we" or "us", and should not claim feelings, memories or experiences. It should read like a diary that answers back skillfully: it reflects what the person wrote, names the feeling or need underneath, and offers words they might use, in the plain voice of a tool.

Why it matters: a person who is told "I'm glad you feel heard" is being spoken to as if by someone, which invites the same hesitation about being listened to that the tool is designed to remove. Without a someone, there is nothing to perform for.

## Where the coach speaks today (checked in the code)
- **The instructions** we send with every message (`systemInstruction` in `netlify/functions/coach.mts`). The first line calls the coach "a warm, grounded coaching companion" and says "if asked who you are, say so in one or two sentences". Our wording already takes priority over the character card kept on Venice.
- **The model's replies**: a test transcript has the coach saying things like "I'm glad you feel heard and understood" and "I understand you're trying to prepare space".
- **Lines written by the page itself**, which the Terms say are not from the AI: the opening greeting (`GREETING` in `src/coach/CoachDemo.tsx`) says "Hello. We have five exchanges together… Tell me what happened…", which is first person, and the fallback closing line.
- **The Venice character card**, which has its own instructions. Our per-message instructions override it, but it is worth reading and trimming there too.

## The rule
For the coach's own voice (model replies and the page's lines inside the conversation):
- **No first-person words about itself:** I, I'm, I've, I'll, I'd, me, my, mine, myself, we, us, our, ours.
- **No claims of feeling, memory or experience:** "I'm glad", "I hear you", "I understand", "I remember". Statements about what was written are fine: "It sounds like…", "That reads as…", "What you describe sounds painful."
- **"You" is fine,** as are impersonal forms.
- **Suggested words for the person to say are exempt**, inside quotation marks. Nonviolent Communication scripts are built on "I" statements ("I feel… because I need…"), and the coach often offers them: "What if you said, 'I'm worried about…'". Those are the person's words, not the coach's.
- **If asked what it is,** it says so plainly and impersonally: "This is a computer program, not a person." No pronoun needed.
- **Nenya the organization** (site copy, Terms, About pages) may still say "we". The rule covers the coach's voice only.

## How to enforce it (same pattern as the existing guards)
1. **Instruction.** Add the rule to `systemInstruction`, and revise the first line (drop "warm, grounded coaching companion" for a description of a program). Add one or two short examples of the right voice.
2. **A check on each reply.** A small function (`usesFirstPerson`, alongside `asksOrInvites` in `src/lib/coachClosing.ts` or a new module) that looks for the words above **outside** quotation marks (straight and curly). Case matters only for "I", and "US" (the country, as in the 988 note) must not match "us".
3. **One retry** with a firm note, inside the same time budget used by the repeat and closing guards.
4. **Last resort:** drop the sentences that use the first person, as `settleReply` drops sentences that ask. If almost nothing is left, add the existing settling line, which already has no pronoun ("Thank you for putting that into words. It mattered that you said it.").
5. **A switch** (`COACH_VOICE_GUARD=off`) so the instructions can be measured alone, as `COACH_CLOSING_GUARD` does.
6. **Count it** (when the counters exist): replies that needed a retry, and replies that needed sentences dropped, as plain daily totals. That shows whether the instruction alone is working.

## Page-written lines to rewrite
- The greeting: for example "Five exchanges are available here. Write what happened, what you are feeling, and what you need, as much or as little as you like." (wording to settle; no "we", "me" or "let's").
- Any other page line shown as the coach speaking: the closing note and the safety-notice text, checked one by one. Notices written in Nenya's own voice about the site can stay.

## Cautions
- **It can make replies stiff.** A voice with no pronouns can read cold. The aim is plain and steady, not robotic; test with real examples and adjust the instruction rather than the filter.
- **False positives:** quoted scripts, "US", "I" used as a letter or numeral, a song or book title. Start strict, run an evaluation (like `scripts/eval-final-turn.mts`) on a fixed set of messages, and loosen only what the numbers justify.
- **Not a promise of tone.** This does not make the coach safe or accurate; it only changes how it refers to itself. The Terms already say the demo is not therapy.

## Wording changes
- The Terms do not need to change for this: they say the demo is an AI and that the greeting and closing are written by the page. Re-read Section 21 if the greeting text changes in a way it describes.
- The About and coach pages should be checked for language that makes the coach sound like a person ("our coach listens", "your coach").
- The pitch deck's coach slides use "listens" and "hears"; see the deck notes.

## Tests to write when it is built
`usesFirstPerson`: catches I / I'm / I've / me / my / myself / we / us / our (outside quotes); ignores the same words inside straight or curly quotes; ignores "US"; ignores a reply with none. Guard: retry happens once; a still-failing reply has the offending sentences removed; the settling line is used when nothing is left; the switch turns the guard off. Instruction text contains the rule and no longer calls the coach a companion. The greeting and fallback lines contain no first-person words.

## Open decisions
- Strict ("we" in a general sense, as in "we all feel this", is also dropped) or allow generic "we"? (Suggested: strict at first.)
- The exact replacement wording for the first line of the instructions, and the greeting.
- Whether to edit the Venice character card as well.
