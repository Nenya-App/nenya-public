import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Send } from 'lucide-react';
import NenyaLogo from '../app/components/NenyaLogo';
import { Button } from '../app/components/ui/button';
import { Textarea } from '../app/components/ui/textarea';
import { getGradientMidpoint, getReadableTextColor } from '../app/components/ColorUtils';
import { detectFlag, type SafetyFlag } from '../lib/safetyFlags';
import { scrubPII, describeScrub } from '../lib/piiScrub';
import { looksLikeManipulation, MANIPULATION_NOTICE } from '../lib/promptGuard';
import { FlagNotice } from './FlagNotice';
import { TranscriptTools } from './TranscriptTools';

const MAX_TURNS = 5;
const MAX_CHARS = 500;
const ENDPOINT = '/api/coach';

const HEX = /^#[0-9a-fA-F]{6}$/;
const norm = (c: string | undefined, fallback: string) => (c && HEX.test(c) ? c.toUpperCase() : fallback);

interface Msg {
  role: 'user' | 'assistant';
  content: string;
  /** Page-only note, never sent anywhere. */
  note?: string;
}

const toWire = (ms: Msg[]) => ms.map((m) => ({ role: m.role, content: m.content }));

type Stage = 'consent' | 'chat' | 'done';

interface CoachDemoProps {
  /** The visitor's two colors: they theme the page and act as a temporary session label. */
  colors: { color1: string; color2: string };
  /** Where the header's back control goes. Omit on the standalone page (it links to the site). */
  onBack?: () => void;
  /** Where "open the breathing tool" goes. Omit on the standalone page (it links to the site). */
  onBreathe?: () => void;
  /** Text summary of the visitor's gateway reflection. Offered, never sent unless they opt in. */
  reflectionSummary?: string;
  /** Optional link to the partner-practice demo. */
  onPartnerPractice?: () => void;
}

// Everything lives in this component's memory: nothing is written to browser
// storage, and closing the tab ends the conversation.
export default function CoachDemo({ colors, reflectionSummary = '', onBack, onBreathe, onPartnerPractice }: CoachDemoProps) {
  const color1 = norm(colors.color1, '#7A9B9E');
  const color2 = norm(colors.color2, '#DAC682');
  const session = { color1, color2 };
  const hexCode = `${color1}.${color2}`;
  const gradient = `linear-gradient(135deg, ${color1}, ${color2})`;
  const onGradient = getReadableTextColor(getGradientMidpoint(color1, color2));

  const [stage, setStage] = useState<Stage>('consent');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [ticket, setTicket] = useState<string | undefined>();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [blocked, setBlocked] = useState(false);
  // The reflection is offered, not assumed. Scrubbed on this device before any use.
  const offered = reflectionSummary.trim() ? scrubPII(reflectionSummary.trim()).text : '';
  const offerable = !!offered && !looksLikeManipulation(offered);
  const [shareReflection, setShareReflection] = useState(false);
  const [contextDropped, setContextDropped] = useState(false);
  const context = shareReflection && offerable ? offered : '';
  const [flag, setFlag] = useState<SafetyFlag | null>(null);
  const [flaggedText, setFlaggedText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const turn = Math.min(messages.filter((m) => m.role === 'user').length + (sending ? 0 : 1), MAX_TURNS);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending]);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [stage]);

  const reset = () => {
    setMessages([]);
    setTicket(undefined);
    setDraft('');
    setError('');
    setBlocked(false);
    setFlag(null);
    setFlaggedText('');
    setContextDropped(false);
    setStage('chat');
  };

  const send = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setBlocked(false);

    // A message that tries to steer the coach is not sent. The draft stays so it can be reworded.
    if (looksLikeManipulation(text)) {
      setBlocked(true);
      return;
    }

    // Identifiers are replaced here, on this device, before anything is sent.
    const scrubbed = scrubPII(text);
    const note = scrubbed.total
      ? `Before sending, I replaced ${describeScrub(scrubbed.counts)} with placeholders. Names are not always caught, so please keep them out.`
      : undefined;
    const next: Msg[] = [...messages, { role: 'user', content: scrubbed.text, note }];

    // A clear crisis statement never leaves this device: no request is made.
    const local = detectFlag(text);
    if (local?.tier === 'stop') {
      setMessages(next);
      setFlag(local);
      setFlaggedText(scrubbed.text);
      setDraft('');
      setStage('done');
      return;
    }

    setSending(true);
    setError('');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: toWire(next), session, ...(context ? { context } : {}), ticket }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as {
        reply?: string;
        ticket?: string;
        done?: boolean;
        flag?: SafetyFlag;
        blocked?: string;
      };
      // The server screens too. A blocked message is not part of the conversation.
      if (data.blocked === 'context') {
        setShareReflection(false);
        setContextDropped(true);
        return;
      }
      if (data.blocked) {
        setBlocked(true);
        return;
      }
      setMessages(data.reply ? [...next, { role: 'assistant', content: data.reply }] : next);
      setTicket(data.ticket);
      setDraft('');
      if (data.flag) {
        setFlag(data.flag);
        setFlaggedText(scrubbed.text);
      }
      if (data.done) setStage('done');
    } catch {
      setError('That did not go through, and nothing was lost. You can try again, or go back to the breathing tool.');
    } finally {
      setSending(false);
    }
  };

  const gradientButton = {
    background: gradient,
    color: onGradient,
    border: 'none',
  } as const;

  const stopped = flag?.tier === 'stop';
  const linkClass = 'text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground';

  return (
    <div className="size-full flex flex-col bg-background text-foreground">
      <header
        className="flex shrink-0 items-center justify-between gap-2 border-b bg-background-secondary px-4 py-3 md:px-6"
        style={{ borderBottomColor: `${color2}40` }}
      >
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back
          </button>
        ) : (
          <a href="/" className="whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-foreground">
            ← Nenya
          </a>
        )}

        <div className="flex min-w-0 items-center gap-2 md:gap-3" aria-label={`Session colors ${hexCode}`}>
          <div className="hidden sm:block">
            <NenyaLogo size={32} />
          </div>
          <div className="flex gap-1">
            <span
              className="size-6 rounded-full border-2 shadow-sm"
              style={{ backgroundColor: color1, borderColor: `${color1}60` }}
            />
            <span
              className="size-6 rounded-full border-2 shadow-sm"
              style={{ backgroundColor: color2, borderColor: `${color2}60` }}
            />
          </div>
          <code
            className="hidden text-sm sm:inline"
            style={{
              background: `linear-gradient(to right, ${color1}, ${color2})`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {hexCode}
          </code>
        </div>

        <span
          className="shrink-0 rounded-full border px-3 py-1 text-xs text-muted-foreground"
          style={{ borderColor: `${color2}80` }}
        >
          Prototype demo
        </span>
      </header>

      <main className="scroll-container flex-1 overflow-y-auto px-4 py-6 md:px-6">
        <div className="mx-auto w-full max-w-xl space-y-5">
          {stage === 'consent' && (
            <section className="space-y-5" aria-labelledby="coach-title">
              <h1 id="coach-title" ref={headingRef} tabIndex={-1} className="text-2xl outline-none md:text-3xl">
                A short conversation with the Nenya coach
              </h1>
              <p className="text-muted-foreground">
                This is an early prototype. You get {MAX_TURNS} exchanges, then we breathe. It is built to help you
                settle, not to keep you talking.
              </p>

              <div className="space-y-3 rounded-2xl border bg-card p-5" style={{ borderColor: `${color1}66` }}>
                <h2 className="text-lg">How to get the most from it</h2>
                <p className="text-sm text-muted-foreground">
                  The more context you give, the more useful the reply. With only {MAX_TURNS} exchanges and {MAX_CHARS}{' '}
                  characters each, it helps to say a little about three things in your first message:
                </p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  <li>
                    <strong className="font-medium text-foreground">What happened,</strong> in a sentence, without
                    names.
                  </li>
                  <li>
                    <strong className="font-medium text-foreground">What you are feeling</strong> or noticing in your
                    body right now.
                  </li>
                  <li>
                    <strong className="font-medium text-foreground">What you need,</strong> even roughly: to be
                    heard, to calm down, to find words for something.
                  </li>
                </ul>
                <p className="rounded-lg bg-muted p-3 text-sm italic text-muted-foreground">
                  &ldquo;My coworker talked over me in the meeting again. My chest is tight and I keep replaying it. I
                  want to calm down enough to decide whether to say something.&rdquo;
                </p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  <li>One situation at a time works better than everything at once.</li>
                  <li>The coach reflects what you say and offers a question or a breath. It does not give advice.</li>
                  <li>
                    It only responds to what you share about yourself. Messages that try to give it instructions, or to
                    change how it works, are not sent.
                  </li>
                </ul>
              </div>

              {offerable && (
                <div className="space-y-3 rounded-2xl border bg-card p-5" style={{ borderColor: `${color2}66` }}>
                  <h2 className="text-lg">Bring your reflection with you?</h2>
                  <p className="text-sm text-muted-foreground">
                    You just finished the gateways. If you like, the coach can see a short text summary of what you
                    entered, so you do not have to explain it again. This is your choice, and it is off unless you turn
                    it on. Drawings are never included.
                  </p>
                  <label className="flex items-start gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={shareReflection}
                      onChange={(e) => setShareReflection(e.target.checked)}
                      className="mt-1 size-4"
                    />
                    <span>Share this summary with the coach for this conversation</span>
                  </label>
                  <details className="text-sm text-muted-foreground">
                    <summary className="cursor-pointer">See exactly what would be shared</summary>
                    <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">
                      {offered}
                    </pre>
                    <p className="mt-2 text-xs">
                      Common identifiers are replaced first, but names are not always caught. It goes to Venice AI the
                      same way your messages do, and it is not stored by Nenya.
                    </p>
                  </details>
                </div>
              )}

              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>
                  Your two colors above name this session for now. They are a label, not an account, and they are not
                  stored.
                </li>
                <li>
                  Your messages pass through Nenya&rsquo;s server to Venice AI, which writes the replies. Nenya does
                  not store them, and they disappear when you close this tab. Venice AI&rsquo;s own policies apply to
                  what it receives.
                </li>
                <li>Please leave out names, addresses, and other identifying details.</li>
                <li>
                  This is not therapy and it cannot help in a crisis. In the US, call or text 988. If you are in
                  immediate danger, call your local emergency number.
                </li>
                <li>The full Terms of Use and Privacy Policy are in the About menu on nenya.biz.</li>
              </ul>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="lg" onClick={() => setStage('chat')} className="gap-2" style={gradientButton}>
                  I understand, start
                  <ArrowRight className="size-4" />
                </Button>
                {onBack ? (
                  <button type="button" onClick={onBack} className={linkClass}>
                    Not now
                  </button>
                ) : (
                  <a href="/" className={linkClass}>
                    Back to Nenya
                  </a>
                )}
              </div>
            </section>
          )}

          {stage !== 'consent' && (
            <>
              <h1 ref={headingRef} tabIndex={-1} className="sr-only">
                Conversation with the Nenya coach
              </h1>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {stage === 'done'
                    ? stopped
                      ? 'Conversation ended'
                      : 'Conversation complete'
                    : `Exchange ${turn} of ${MAX_TURNS}`}
                </span>
                <span>Not therapy</span>
              </div>

              <div className="space-y-4" role="log" aria-live="polite" aria-label="Conversation">
                {messages.map((m, i) => (
                  <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                    <div
                      className="max-w-[85%] whitespace-pre-wrap rounded-2xl border px-4 py-3 text-sm leading-relaxed"
                      style={
                        m.role === 'user'
                          ? { backgroundColor: `${color1}1F`, borderColor: `${color1}66` }
                          : { borderColor: `${color2}66` }
                      }
                    >
                      <span className="mb-1 block text-xs text-muted-foreground">
                        {m.role === 'user' ? 'You' : 'Coach'}
                      </span>
                      {m.content}
                      {m.note && <span className="mt-2 block text-xs italic text-muted-foreground">{m.note}</span>}
                    </div>
                  </div>
                ))}
                {sending && <p className="text-sm text-muted-foreground">Listening&hellip;</p>}
                <div ref={endRef} />
              </div>

              {flag && <FlagNotice flag={flag} flaggedMessage={flaggedText} />}

              {stage === 'chat' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    send();
                  }}
                  className="space-y-2"
                >
                  <label htmlFor="coach-input" className="sr-only">
                    Your message
                  </label>
                  <Textarea
                    id="coach-input"
                    value={draft}
                    onChange={(e) => {
                      setDraft(e.target.value);
                      if (blocked) setBlocked(false);
                    }}
                    onKeyDown={(e) => {
                      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                        e.preventDefault();
                        send();
                      }
                    }}
                    maxLength={MAX_CHARS}
                    rows={4}
                    disabled={sending}
                    placeholder={
                      messages.length === 0
                        ? 'What happened, what you are feeling, and what you need. A few sentences is plenty.'
                        : 'Your reply'
                    }
                    className="min-h-24 resize-none"
                    style={{ borderColor: `${color1}55` }}
                  />
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">
                      {draft.length} / {MAX_CHARS}
                    </span>
                    <Button type="submit" disabled={!draft.trim() || sending} className="gap-2" style={gradientButton}>
                      <Send className="size-4" />
                      Send
                    </Button>
                  </div>
                  {contextDropped && (
                    <p role="status" className="text-sm text-muted-foreground">
                      Part of your reflection read like an instruction to the coach, so it was left out. You can
                      continue without it.
                    </p>
                  )}
                  {blocked && (
                    <p role="alert" className="rounded-lg border border-amber-500/60 p-3 text-sm">
                      {MANIPULATION_NOTICE}
                    </p>
                  )}
                  {error && (
                    <p role="alert" className="text-sm text-destructive">
                      {error}
                    </p>
                  )}
                </form>
              )}

              {stage === 'done' && (
                <section className="space-y-4 rounded-2xl border bg-card p-5" style={{ borderColor: `${color2}80` }}>
                  <h2 className="text-xl">
                    {stopped ? 'This conversation has ended' : 'That is our five. Now, one minute to breathe.'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {stopped
                      ? 'The resources above are the right next step. When you are ready, the breathing tool is here too.'
                      : 'The breathing tool is where Nenya begins. Follow the glow in, and out, for as long as you like.'}
                  </p>
                  <div className="flex flex-wrap items-center gap-4">
                    {onBreathe ? (
                      <Button onClick={onBreathe} className="gap-2" style={gradientButton}>
                        Open the breathing tool
                        <ArrowRight className="size-4" />
                      </Button>
                    ) : (
                      <a
                        href="/"
                        className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm"
                        style={gradientButton}
                      >
                        Open the breathing tool
                        <ArrowRight className="size-4" />
                      </a>
                    )}
                    {!stopped && (
                      <button type="button" onClick={reset} className={linkClass}>
                        Start a new conversation
                      </button>
                    )}
                    {onPartnerPractice && (
                      <button type="button" onClick={onPartnerPractice} className={linkClass}>
                        Practice a hard conversation with another person (demo)
                      </button>
                    )}
                  </div>
                </section>
              )}

              {stage === 'done' && (
                <TranscriptTools messages={toWire(messages)} session={session} context={context} ticket={stopped ? undefined : ticket} />
              )}
            </>
          )}
        </div>
      </main>

      <footer className="shrink-0 border-t border-border px-4 py-3 text-center text-xs text-muted-foreground">
        Early prototype. Not therapy. In the US, call or text 988 in a crisis.
      </footer>
    </div>
  );
}
