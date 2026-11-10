// The pause: after the coach ends a conversation because it turned toward abusive language about people or groups (docs/coach-boundaries-scope.md),
// the demo rests for a short time, kept as one timestamp in the visitor's browser (nenya.coach.pause: a courtesy, like the six-hour rest, easy to
// clear, never sent to us). The person can wait it out or come back sooner by reading the note on respectful use and answering five questions
// about putting hard feelings into words, all correct, as many tries as needed, each answer explained. Nothing the person answers is sent or kept.
// The wording is a DRAFT for the owner (docs/drafts/reentry-quiz-draft.md, docs/drafts/terms-respectful-use-draft.md).
import { PAUSE_KEY } from './deviceMemory.ts';

export const PAUSE_MINUTES = 10;
const MINUTE_MS = 60000;

const read = (): string | null => {
  try { return localStorage.getItem(PAUSE_KEY); } catch { return null; }
};

/** When the pause ends (ms since epoch), or 0 if there is none (a missing, unreadable, expired or far-future value is no pause). */
export function readPauseEnds(now: number = Date.now()): number {
  const ends = Number(read());
  if (!Number.isFinite(ends) || ends <= now || ends > now + (PAUSE_MINUTES + 1) * MINUTE_MS) return 0;
  return ends;
}

export function startPause(now: number = Date.now()): number {
  const ends = now + PAUSE_MINUTES * MINUTE_MS;
  try { localStorage.setItem(PAUSE_KEY, String(ends)); } catch { /* storage blocked: no pause is kept */ }
  return ends;
}

export function clearPause(): void {
  try { localStorage.removeItem(PAUSE_KEY); } catch { /* nothing to remove */ }
}

/** Whole minutes left, rounded up, at least 1 while a pause lasts (this changes once a minute, so a screen reader hears it once a minute). */
export const minutesLeft = (ends: number, now: number = Date.now()): number => Math.max(1, Math.ceil((ends - now) / MINUTE_MS));

/** The note on respectful use shown before the questions: the same words as the Terms' Section 5 (DRAFT, owner to edit). */
export const RESPECTFUL_USE_NOTE: string[] = [
  'Nenya is a space for reflection: for looking at your own thoughts, feelings and needs. Strong feelings, including anger, frustration, and disagreement with Nenya or the coach, are part of being a person and are not a problem here.',
  'Please do not use Nenya, or the coach demo, to produce or share language that treats a person or a group of people as less than human, to threaten or harass anyone, or to plan harm to others. This is not what the space is for.',
  'If a conversation goes in that direction, the coach may turn back to your own feelings and needs, may decline to continue, and may end the conversation. The pause that follows is not a punishment and not a judgment about who you are: the checks are simple phrase matching, and they can be wrong.',
];

export interface QuizOption { id: string; text: string }
export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
  /** The id of the best answer. */
  best: string;
  /** Shown after the person checks, whether or not they chose the best answer. */
  explanation: string;
}

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: 'Which of these says what happened, without a judgment in it?',
    options: [
      { id: 'a', text: '“My coworker is lazy.”' },
      { id: 'b', text: '“My coworker left before the meeting ended on three days this week.”' },
      { id: 'c', text: '“My coworker doesn’t care about the team.”' },
      { id: 'd', text: '“My coworker is a joke.”' },
    ],
    best: 'b',
    explanation: 'B describes what a camera could have recorded. “Lazy”, “doesn’t care” and “a joke” are evaluations: they are about what the person is, and they are the part that tends to start a fight. Starting from what happened leaves room for the rest of the story.',
  },
  {
    id: 'q2',
    prompt: 'Which of these names a feeling?',
    options: [
      { id: 'a', text: '“I feel like you don’t respect me.”' },
      { id: 'b', text: '“I feel disrespected.”' },
      { id: 'c', text: '“I feel hurt.”' },
      { id: 'd', text: '“I feel that people like them are the problem.”' },
    ],
    best: 'c',
    explanation: 'C names a feeling. “I feel like…” and “I feel that…” usually introduce a thought. “Disrespected” is half a feeling and half a claim about what someone did to you. Feelings are words like hurt, afraid, angry, tired, lonely, relieved: they say how you are, not what the other person is.',
  },
  {
    id: 'q3',
    prompt: 'Under “He never listens to me”, which is most likely a need?',
    options: [
      { id: 'a', text: 'That he calls me back today.' },
      { id: 'b', text: 'To be heard and understood.' },
      { id: 'c', text: 'That he gets a different job.' },
      { id: 'd', text: 'An apology from him.' },
    ],
    best: 'b',
    explanation: 'A, C and D are ways of getting something (strategies). B is what the strategy is for. Needs are things every person has: being heard, safety, fairness, rest, belonging. When we name the need there are usually many ways to meet it, and some do not depend on the other person changing at all.',
  },
  {
    id: 'q4',
    prompt: 'A sentence calls a whole group “monsters”. What does that label do?',
    options: [
      { id: 'a', text: 'It describes them accurately.' },
      { id: 'b', text: 'It makes a messy problem simple by taking the people out of view. It can feel like relief while the hurt, fear or need underneath goes unnamed.' },
      { id: 'c', text: 'It tells us what they did.' },
      { id: 'd', text: 'It shows how strong the speaker’s feelings are, and nothing else.' },
    ],
    best: 'b',
    explanation: 'A label like this is what Nonviolent Communication calls an enemy image: a way of seeing people as a category instead of as people with needs. It can feel like relief because the pain has somewhere to go. But it hides what actually happened and what the speaker needs, and it makes the speaker less able to get it. D is partly true (it does show strong feeling), which is why the feeling underneath deserves a name.',
  },
  {
    id: 'q5',
    prompt: 'Which is the best way to say what is underneath “Those people are all monsters”?',
    options: [
      { id: 'a', text: '“Those people are all wrong.”' },
      { id: 'b', text: '“Those people make me sick.”' },
      { id: 'c', text: '“When I saw what happened, I felt frightened and angry, and I need safety and fairness for people I care about.”' },
      { id: 'd', text: '“I’m not going to talk about it.”' },
    ],
    best: 'c',
    explanation: 'C follows a simple shape: what I saw, what I feel, what I need. It does not ask anyone to agree and does not call anyone anything, so it can be heard. A and B are still evaluations, and D closes the door without saying what is wrong. You can fill the same shape with your own words: “When I saw ___, I felt ___, because I need ___.”',
  },
];

export const PASS_MARK = QUIZ.length; // all five

export interface Grade {
  correct: number;
  /** Question ids not yet answered with the best option (unanswered ones included). */
  toReview: string[];
  passed: boolean;
}

/** Marks the answers (question id to option id). The pass mark is every question. Nothing is stored. */
export function gradeAnswers(answers: Record<string, string | undefined>): Grade {
  const toReview = QUIZ.filter((q) => answers[q.id] !== q.best).map((q) => q.id);
  const correct = QUIZ.length - toReview.length;
  return { correct, toReview, passed: correct >= PASS_MARK };
}
