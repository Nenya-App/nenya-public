import { useEffect, useRef, useState } from 'react';
import { Button } from '../app/components/ui/button';
import { clearPause, gradeAnswers, minutesLeft, PAUSE_MINUTES, QUIZ, RESPECTFUL_USE_NOTE } from '../lib/pause';
import { countEvent } from '../lib/usageCounts';

interface PauseScreenProps {
  /** When the pause ends (ms since epoch). */
  ends: number;
  /** Called when the pause is over, by waiting or by the questions. */
  onReturn: () => void;
  /** The same "Open the breathing tool" control the rest of the coach page uses. */
  breatheButton: React.ReactNode;
}

type View = 'intro' | 'quiz' | 'passed';

// The screen shown instead of the conversation after the coach has ended one for abusive language about people or groups. Two ways back: wait
// (no action needed), or read the note and answer five questions, all correct, as many tries as needed. Nothing here is sent or stored except
// the one time in the browser (src/lib/pause.ts) and plain counts of how it ended. DRAFT wording: docs/drafts/reentry-quiz-draft.md.
export default function PauseScreen({ ends, onReturn, breatheButton }: PauseScreenProps) {
  const [view, setView] = useState<View>('intro');
  const [now, setNow] = useState(() => Date.now());
  const [answers, setAnswers] = useState<Record<string, string | undefined>>({});
  const [checked, setChecked] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const minutes = minutesLeft(ends, now);
  const grade = gradeAnswers(answers);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (view !== 'passed' && now >= ends) {
      countEvent('coach.pause.returned.waited');
      clearPause();
      onReturn();
    }
  }, [now, ends, view, onReturn]);
  useEffect(() => {
    headingRef.current?.focus();
  }, [view]);

  const choose = (qid: string, oid: string) => {
    setAnswers((a) => ({ ...a, [qid]: oid }));
    setChecked(false);
  };
  const check = () => {
    setChecked(true);
    if (grade.passed) {
      setView('passed');
      countEvent('coach.pause.returned.quiz');
      clearPause();
    }
  };

  if (view === 'passed') {
    return (
      <section className="space-y-5" aria-labelledby="pause-title">
        <h1 id="pause-title" ref={headingRef} tabIndex={-1} className="text-2xl outline-none md:text-3xl">Thank you. You are welcome back.</h1>
        <p className="text-muted-foreground">The conversation is open again whenever you are ready.</p>
        <Button onClick={onReturn}>Return to the coach</Button>
      </section>
    );
  }

  if (view === 'intro') {
    return (
      <section className="space-y-5" aria-labelledby="pause-title">
        <h1 id="pause-title" ref={headingRef} tabIndex={-1} className="text-2xl outline-none md:text-3xl">A pause</h1>
        <p className="text-muted-foreground">
          This conversation has ended. It went toward language that treats people as less than human, and that is not what this space is for. This is not a punishment, and it is not a verdict on you. The checks here are simple, and they can be wrong.
        </p>
        <p className="font-medium">You have two ways back.</p>
        <p className="text-muted-foreground">
          <strong>Wait.</strong> The demo opens again in about {minutes} {minutes === 1 ? 'minute' : 'minutes'}. You do not have to do anything.
        </p>
        <p className="sr-only" role="status" aria-live="polite">About {minutes} {minutes === 1 ? 'minute' : 'minutes'} left in the pause.</p>
        <p className="text-muted-foreground">
          <strong>Or return sooner.</strong> Read a short note on respectful use, then answer five short questions about how we put hard feelings into words. There is no timer and you can try again as often as you like. Each answer is explained, whether or not it was the one we hoped for. Nothing you answer is sent or kept.
        </p>
        <p className="text-muted-foreground">If you would like a moment first, the breathing tool is here.</p>
        <div className="flex flex-wrap items-center gap-4">
          <Button onClick={() => setView('quiz')}>Read the note and begin</Button>
          {breatheButton}
        </div>
        <p className="text-xs text-muted-foreground">
          The pause is {PAUSE_MINUTES} minutes. Your browser remembers only the time it ends. Nothing is sent to Nenya. The &ldquo;Forget me&rdquo; button, or clearing this site&rsquo;s data, removes it.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6" aria-labelledby="pause-title">
      <h1 id="pause-title" ref={headingRef} tabIndex={-1} className="text-2xl outline-none md:text-3xl">Five short questions</h1>
      <div className="space-y-3 rounded-2xl border bg-card p-5">
        <h2 className="text-lg">A note on respectful use</h2>
        {RESPECTFUL_USE_NOTE.map((p) => (
          <p key={p} className="text-sm text-muted-foreground">{p}</p>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Choose one answer for each. When you press Check, every answer is explained. You need all five, and you can change any answer and check again, as many times as you like. Nothing you choose is sent or kept.
      </p>
      {QUIZ.map((q, i) => {
        const chosen = answers[q.id];
        const right = chosen === q.best;
        return (
          <fieldset key={q.id} className="space-y-2">
            <legend className="mb-1 text-base">{i + 1}. {q.prompt}</legend>
            {q.options.map((o) => (
              <label key={o.id} className="flex items-start gap-2 text-sm">
                <input type="radio" name={q.id} value={o.id} checked={chosen === o.id} onChange={() => choose(q.id, o.id)} className="mt-1" />
                <span>{o.text}</span>
              </label>
            ))}
            <div role="status" aria-live="polite">
              {checked && (
                <p className="rounded-lg border border-border p-3 text-sm">
                  <strong>{chosen === undefined ? 'Not answered yet. ' : right ? 'Yes. ' : 'Not quite. '}</strong>
                  {q.explanation}
                </p>
              )}
            </div>
          </fieldset>
        );
      })}
      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={check}>Check my answers</Button>
        <button type="button" onClick={() => setView('intro')} className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">Back</button>
        {breatheButton}
      </div>
      <div role="status" aria-live="polite" className="text-sm">
        {checked && !grade.passed && (
          <p>{grade.correct} of {QUIZ.length} so far. Not quite yet: change any answer you like and check again, or just wait: the demo opens in about {minutes} {minutes === 1 ? 'minute' : 'minutes'}.</p>
        )}
      </div>
    </section>
  );
}
