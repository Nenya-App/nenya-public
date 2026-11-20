// "Give feedback" (docs/feedback-scope.md; behind VITE_FEEDBACK=on and FEEDBACK_ENABLED=true on the server). A small button opens a window with two steps:
//   1. Select a feature: point at something on the page, or choose one or more from a list (the list is the keyboard and screen-reader way to do the same thing, and
//      "Something else" is in it). 2. Say what you think, optionally with an email address for one automated thank-you.
// Sent: the page's path, what was chosen, the comment and, only if typed, the address (used once for the thank-you and never kept). Nothing is saved on this device, and the
// address is never prefilled. The pointer step reads only a label from the element (its own label or visible name), never what is typed into a field.
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { MessageSquarePlus, MousePointerClick, X } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useHumanCheck } from '../../coach/useHumanCheck';
import { FEEDBACK_TURNSTILE_ACTION } from '../../lib/turnstileCheck';
import { FEATURE_IDS, MAX_COMMENT, MAX_EMAIL, feedbackOn, featureLabel, type FeatureId } from '../../lib/feedback';
import { describePick } from '../../lib/feedbackPick';

const UI = '[data-feedback-ui]';

type Step = 'closed' | 'select' | 'pointing' | 'comment' | 'sending' | 'sent';

const PROBLEMS: Record<string, string> = {
  limit: 'A lot of notes have come from this connection today. Please try again tomorrow.',
  language: 'This could not be sent as written. Notes that use slurs or abuse aimed at people are not kept. You can change the words and send it again.',
  empty: 'Please write a comment first.',
  short: 'That is a little short to work with. Could you say a few more words?',
  unclear: 'I could not make out words in that. It may be a typo. Could you write it again?',
  human: 'The check that you are a person did not pass. Please try again.',
  off: 'Feedback is not open right now. Thank you for wanting to help.',
};

export function FeedbackTool({ ready = true }: { ready?: boolean }) {
  const [step, setStep] = useState<Step>('closed');
  const [features, setFeatures] = useState<FeatureId[]>([]);
  const [picked, setPicked] = useState('');
  const [comment, setComment] = useState('');
  const [email, setEmail] = useState('');
  const [trap, setTrap] = useState('');
  const [problem, setProblem] = useState('');
  const [thanked, setThanked] = useState<boolean | null>(null);
  const ids = { comment: useId(), email: useId(), emailHint: useId(), problem: useId() };
  const human = useHumanCheck(step === 'comment' || step === 'sending', FEEDBACK_TURNSTILE_ACTION);
  const opener = useRef<HTMLButtonElement | null>(null);

  const reset = useCallback(() => {
    setFeatures([]); setPicked(''); setComment(''); setEmail(''); setTrap(''); setProblem(''); setThanked(null);
  }, []);
  const close = useCallback(() => {
    setStep('closed');
    reset();
    opener.current?.focus();
  }, [reset]);

  if (!feedbackOn() || !ready) return null;

  const chosen = picked !== '' || features.length > 0;
  const send = async () => {
    if (step === 'sending') return;
    setProblem('');
    setStep('sending');
    const token = await human.take();
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ route: window.location.pathname, features, picked, comment, email: email.trim() || undefined, website: trap, token: token ?? undefined }),
      });
      human.reset();
      if (res.ok) {
        const j = (await res.json().catch(() => ({}))) as { thanked?: boolean | null };
        setThanked(j.thanked ?? null);
        setComment(''); setEmail(''); // gone from this page the moment it is sent
        setStep('sent');
        return;
      }
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setProblem(PROBLEMS[j.error ?? ''] ?? 'That did not go through. Please try again in a little while.');
    } catch {
      human.reset();
      setProblem('That did not go through. Please check your connection and try again.');
    }
    setStep('comment');
  };

  return (
    <>
      <button
        ref={opener}
        type="button"
        data-feedback-ui
        onClick={() => { reset(); setStep('select'); }}
        className="fixed bottom-3 left-3 z-[250] inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm text-foreground shadow-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <MessageSquarePlus className="size-4" aria-hidden="true" />
        Give feedback
      </button>

      {step === 'pointing' && (
        <Pointer
          onPick={(label) => { setPicked(label); setStep('comment'); }}
          onCancel={() => setStep('select')}
        />
      )}

      <Dialog open={step === 'select' || step === 'comment' || step === 'sending' || step === 'sent'} onOpenChange={(o) => { if (!o) close(); }}>
        <DialogContent data-feedback-ui className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          {step === 'select' && (
            <>
              <DialogHeader>
                <DialogTitle>Select a feature</DialogTitle>
                <DialogDescription>Tell us what your feedback is about. Point at it on the page, or choose from the list. You can choose more than one.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <Button type="button" variant="outline" onClick={() => setStep('pointing')}>
                  <MousePointerClick aria-hidden="true" /> Point at something on the page
                </Button>
                {picked && <p className="text-sm">You pointed at: <strong>{picked}</strong></p>}
                <fieldset className="space-y-1">
                  <legend className="mb-2 text-sm">Or choose from the list</legend>
                  {FEATURE_IDS.map((id) => (
                    <label key={id} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 text-sm hover:bg-accent">
                      <input
                        type="checkbox"
                        className="size-5 shrink-0"
                        checked={features.includes(id)}
                        onChange={(e) => setFeatures((f) => (e.target.checked ? [...f, id] : f.filter((x) => x !== id)))}
                      />
                      {featureLabel(id)}
                    </label>
                  ))}
                </fieldset>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={close}>Cancel</Button>
                <Button type="button" disabled={!chosen} onClick={() => setStep('comment')}>Next</Button>
              </DialogFooter>
            </>
          )}

          {(step === 'comment' || step === 'sending') && (
            <form onSubmit={(e) => { e.preventDefault(); void send(); }} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Your comment</DialogTitle>
                <DialogDescription>
                  About: {[picked && `“${picked}”`, ...features.map(featureLabel)].filter(Boolean).join(', ')}.{' '}
                  Sent with it: the page you are on ({window.location.pathname}). Nothing else about you.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor={ids.comment}>What would you like us to know?</Label>
                <Textarea id={ids.comment} required maxLength={MAX_COMMENT} rows={5} value={comment} onChange={(e) => setComment(e.target.value)} aria-describedby={problem ? ids.problem : undefined} aria-invalid={problem ? true : undefined} />
                <p className="text-xs text-muted-foreground">Up to {MAX_COMMENT.toLocaleString('en-US')} characters. Please leave out names and contact details: we take them out of what you write.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor={ids.email}>Email address (optional)</Label>
                <input id={ids.email} type="email" autoComplete="off" maxLength={MAX_EMAIL} value={email} onChange={(e) => setEmail(e.target.value)} aria-describedby={ids.emailHint} className="flex h-11 w-full rounded-md border border-input bg-input-background px-3 text-base md:text-sm focus-visible:outline-2 focus-visible:outline-offset-2" />
                <p id={ids.emailHint} className="text-xs text-muted-foreground">You do not need to give one. If you do, we send one automated thank-you to it. We use it for nothing else and we do not keep it.</p>
              </div>
              {/* The trap field: people never see or reach it. */}
              <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
                <label>Leave this empty<input type="text" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} /></label>
              </div>
              <div ref={human.box} />
              <p id={ids.problem} role="status" className="min-h-5 text-sm text-destructive">{problem}</p>
              <DialogFooter>
                <Button type="button" variant="outline" disabled={step === 'sending'} onClick={() => setStep('select')}>Back</Button>
                <Button type="submit" disabled={step === 'sending' || comment.trim() === ''}>{step === 'sending' ? 'Sending…' : 'Send feedback'}</Button>
              </DialogFooter>
            </form>
          )}

          {step === 'sent' && (
            <>
              <DialogHeader>
                <DialogTitle>Thank you</DialogTitle>
                <DialogDescription>Your note was sent.</DialogDescription>
              </DialogHeader>
              <p role="status" className="text-sm">
                {thanked === true && 'We sent a thank-you to the address you gave, and did not keep it.'}
                {thanked === false && 'We could not send the thank-you email, and we did not keep your address.'}
                {thanked === null && 'Nothing about you was kept except what you wrote.'}
              </p>
              <DialogFooter><Button type="button" onClick={close}>Close</Button></DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/** The pointing step: the next click on the page is the choice. Escape or Cancel goes back. The list in the window is the way to do this without a pointer. */
function Pointer({ onPick, onCancel }: { onPick: (label: string) => void; onCancel: () => void }) {
  const box = useRef<HTMLDivElement | null>(null);
  const cancel = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    cancel.current?.focus();
    const target = (e: Event): Element | null => {
      const el = e.target instanceof Element ? e.target : null;
      return el && !el.closest(UI) ? el : null;
    };
    const move = (e: MouseEvent) => {
      const el = target(e);
      const b = box.current;
      if (!b) return;
      if (!el) { b.style.display = 'none'; return; }
      const r = el.getBoundingClientRect();
      Object.assign(b.style, { display: 'block', left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
    };
    const click = (e: MouseEvent) => {
      const el = target(e);
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();
      onPick(describePick(el) || 'something on the page');
    };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); onCancel(); } };
    document.addEventListener('mousemove', move, true);
    document.addEventListener('click', click, true);
    document.addEventListener('keydown', key, true);
    return () => {
      document.removeEventListener('mousemove', move, true);
      document.removeEventListener('click', click, true);
      document.removeEventListener('keydown', key, true);
    };
  }, [onPick, onCancel]);
  return (
    <>
      <div ref={box} aria-hidden="true" style={{ position: 'fixed', display: 'none', pointerEvents: 'none', zIndex: 400, border: '3px solid #ffffff', outline: '3px solid #000000', boxSizing: 'border-box' }} />
      <div data-feedback-ui role="dialog" aria-label="Pointing at a feature" className="fixed inset-x-3 top-3 z-[500] mx-auto flex max-w-xl items-center gap-3 rounded-md border-2 border-foreground bg-background p-3 text-sm text-foreground shadow-lg">
        <p role="status" className="flex-1">Click the part of the page your feedback is about. Press Escape to go back to the list.</p>
        <Button ref={cancel} type="button" variant="outline" onClick={onCancel}><X aria-hidden="true" /> Cancel</Button>
      </div>
    </>
  );
}
