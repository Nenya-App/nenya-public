# DRAFT: the pause screen and the reflective quiz

Status: a draft for the owner to edit, written 2026-11-08. Nothing is built. This is the content for the way back in after the coach has ended a conversation because it turned toward abusive language about people or groups (`docs/coach-boundaries-scope.md`; Terms wording in `terms-respectful-use-draft.md`). It is written to be read aloud by a screen reader and to teach, not to catch anyone out.

**Principles** (so the owner can judge each line): warm and plain; never scolding or clever at the person's expense; no claim about what the person is like or what this will do for them; every answer, right or wrong, is explained; unlimited tries; no timer; no score kept; nothing sent or stored; the wait-it-out way back is always offered first and is equally valid. The concepts are from Nonviolent Communication (Marshall Rosenberg); the page carries the credit already on the About page and, wherever the Feelings and Needs Inventory is used, its CNVC line (see `docs/ATTRIBUTIONS.md`). All wording below is written fresh.

---

## 1. The pause screen (shown in place of the conversation)

**Heading:** A pause

> This conversation has ended. It went toward language that treats people as less than human, and that is not what this space is for. This is not a punishment, and it is not a verdict on you. The checks here are simple, and they can be wrong.
>
> You have two ways back.
>
> **Wait.** The demo opens again in [N] minutes. You do not have to do anything. [A visible, calm countdown, announced politely to a screen reader at most once a minute.]
>
> **Or return sooner.** Read the short note on respectful use, then answer five short questions about how we put hard feelings into words. There is no timer and you can try again as often as you like. Each answer is explained, whether or not it was the one we hoped for. Nothing you answer is sent or kept.
>
> If you would like a moment first, the breathing tool is here.

**Buttons:** "Read the note and begin" · "Open the breathing tool" · "I'll wait" (closes nothing; the countdown continues).

*The note on respectful use* is the paragraph from Section 5 of the Terms (see the Terms draft), shown on the page.

---

## 2. The five questions (graded) and one for you (not graded)

Each question is a radio group with a legend; the feedback appears under it when the person chooses "Check", is announced politely, and does not rely on colour. Each has one best answer. Options keep the same order on every try, and the wording of the feedback is written to teach.

**Question 1. Which of these says what happened, without a judgment in it?**
- A. "My coworker is lazy."
- B. "My coworker left before the meeting ended on three days this week." **← best**
- C. "My coworker doesn't care about the team."
- D. "My coworker is a joke."

*Feedback.* B describes what a camera could have recorded. "Lazy", "doesn't care" and "a joke" are evaluations: they are about what the person is, and they are the part that tends to start a fight. Starting from what happened leaves room for the rest of the story.

**Question 2. Which of these names a feeling?**
- A. "I feel like you don't respect me."
- B. "I feel disrespected."
- C. "I feel hurt." **← best**
- D. "I feel that people like them are the problem."

*Feedback.* C names a feeling. "I feel like…" and "I feel that…" usually introduce a thought. "Disrespected" is half a feeling and half a claim about what someone did to you. Feelings are words like hurt, afraid, angry, tired, lonely, relieved; they say how you are, not what the other person is.

**Question 3. Under "He never listens to me", which is most likely a need?**
- A. That he calls me back today.
- B. To be heard and understood. **← best**
- C. That he gets a different job.
- D. An apology from him.

*Feedback.* A, C and D are ways of getting something (a strategy). B is what the strategy is for. Needs are things every person has: being heard, safety, fairness, rest, belonging. When we name the need, there are usually many ways to meet it, and some do not involve the other person changing at all.

**Question 4. A sentence calls a whole group "vermin". What does that label do?**
- A. It describes them accurately.
- B. It makes a messy problem simple by taking the people out of view; it can feel like relief while the hurt, fear or need underneath goes unnamed. **← best**
- C. It tells us what they did.
- D. It shows how strong the speaker's feelings are, and nothing else.

*Feedback.* A label like this is what Nonviolent Communication calls an enemy image: a way of seeing people as a category instead of as people with needs. It can feel like relief because the pain has somewhere to go. But it hides what actually happened and what the speaker needs, and it makes the speaker less able to get it. D is partly true (it does show strong feeling), which is why the feeling underneath deserves a name.

**Question 5. Which is the best way to say what is underneath "Those people are all animals"?**
- A. "Those people are all wrong."
- B. "Those people make me sick."
- C. "When I saw what happened, I felt frightened and angry, and I need safety and fairness for people I care about." **← best**
- D. "I'm not going to talk about it."

*Feedback.* C follows a simple shape: what I saw, what I feel, what I need. It does not ask anyone to agree and does not call anyone anything, so it can be heard. A and B are still evaluations, and D closes the door without saying what is wrong. You can fill the same shape with your own words: "When I saw ___, I felt ___, because I need ___."

**Pass:** four of five. On a pass: "Thank you. You are welcome back." and the conversation screen returns (the next conversation begins at the boundaries ladder's second level, not the first). On fewer than four: "Not quite yet. Here are the ones to look at again," with the explanations repeated; the questions stay as they are and the person can try again immediately, or wait.

**A question for you (optional, not graded, not kept).** "Take a moment. What are you feeling right now, and what might you need? You can write it here, or just think it. It stays on this page and is gone when you leave." A text box that is never sent, never stored, and never read.

---

## 3. What the build needs (when this is approved)
- A device-side pause time (`nenya.coach.pause`), the pause screen, and the quiz as a self-contained component with no network calls and no storage of answers; a plain daily count (no content) for pauses begun, returns by waiting, returns by quiz.
- Accessibility: all of it by keyboard; a legend and labels on every group; feedback in a polite live region; no timer on the quiz; the countdown not announced more than once a minute; text size and reduced-motion respected; the wait-it-out way always first and always possible.
- Tests: the pass rule, that nothing is stored or sent, that "Forget me" and Emergency Exit remove the time, that the countdown ends the pause, that the next conversation starts at the second level.
- A counselor or NVC trainer reads the wording, and a screen-reader user tests it before it ships.

## Decisions for the owner
1. **The length of the pause** ([N] above).
2. **The pass mark** (four of five is a suggestion; "all five, with feedback, as many tries as needed" is gentler).
3. **Whether the optional reflective box stays**, or the page offers only the questions.
4. **Question wording**, especially Question 4 (it names a word, "vermin"; the same question could use "animals" or "disease" if that reads better) and the feedback for D.
5. **Who reads it** (a counselor, an NVC trainer, a person who uses a screen reader).
