import { useCallback, useEffect, useRef, useState } from 'react';
import { DuplicateSubmissionError, digestOfSend, rememberSentInThisTab, sentInThisTab, submitReport, textToSend, type SubmitReceipt } from '../../lib/reportSubmission';

// The steps of sending a report, a reflection summary or a message: idle, the consent screen, sending, sent, or "you already sent this".
// - begin() opens the consent screen (nothing is requested). If this tab already sent exactly this, it says so instead.
// - confirm() is the only thing that sends, and only once at a time: it does nothing while a request is in flight or after it was sent.
// - After a send the typed text is the caller's to clear (onSent), and Back or the browser's back/forward cache cannot bring a sendable form back:
//   a page restored from the cache with a send still in flight is reset, and a sent form stays a confirmation.
export type SendPhase = 'idle' | 'consent' | 'sending' | 'sent' | 'error' | 'duplicate';

export function useSendFlow(type: 'error-report' | 'sensory-reflection' | 'contact-message', onSent?: () => void) {
  const [phase, setPhase] = useState<SendPhase>('idle');
  const [receipt, setReceipt] = useState<SubmitReceipt | null>(null);
  const [pending, setPending] = useState<{ report: string; comments: string } | null>(null);
  const flying = useRef(false);
  const done = useRef(false);

  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      if (!done.current) {
        flying.current = false;
        setPhase((p) => (p === 'sending' ? 'idle' : p));
      }
    };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, []);

  const begin = useCallback(
    async (report: string, comments = '') => {
      if (flying.current || done.current) return;
      const text = textToSend(report, comments);
      if (!text.report.trim() && !text.comments.trim()) return;
      if (sentInThisTab(await digestOfSend(type, text.report, text.comments))) return setPhase('duplicate');
      setPending(text);
      setPhase('consent');
    },
    [type],
  );

  /** For a form whose text is fixed (a generated report): says "already sent" on arrival if this tab already sent it. */
  const checkAlreadySent = useCallback(
    async (report: string, comments = '') => {
      const text = textToSend(report, comments);
      if (sentInThisTab(await digestOfSend(type, text.report, text.comments))) setPhase((p) => (p === 'idle' ? 'duplicate' : p));
    },
    [type],
  );

  const confirm = useCallback(async () => {
    if (flying.current || done.current || !pending) return;
    flying.current = true;
    setPhase('sending');
    const digest = await digestOfSend(type, pending.report, pending.comments);
    try {
      const got = await submitReport({ type, report: pending.report, comments: pending.comments, adult: true });
      done.current = true;
      rememberSentInThisTab(digest);
      setReceipt(got);
      setPending(null);
      setPhase('sent');
      onSent?.();
    } catch (e) {
      flying.current = false;
      if (e instanceof DuplicateSubmissionError) {
        done.current = true;
        rememberSentInThisTab(digest);
        setPending(null);
        setPhase('duplicate');
      } else setPhase('error');
    }
  }, [pending, type, onSent]);

  const cancel = useCallback(() => {
    if (flying.current) return;
    setPending(null);
    setPhase('idle');
  }, []);

  /** Starts over (a new, different message) after a send. */
  const reset = useCallback(() => {
    flying.current = false;
    done.current = false;
    setPending(null);
    setReceipt(null);
    setPhase('idle');
  }, []);

  return { phase, receipt, pending, begin, confirm, cancel, reset, checkAlreadySent };
}
