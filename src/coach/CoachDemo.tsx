import { Fragment, useEffect, useRef, useState } from 'react';
import { ArrowRight, Play, Send } from 'lucide-react';
import NenyaLogo from '../app/components/NenyaLogo';
import { Button } from '../app/components/ui/button';
import { Textarea } from '../app/components/ui/textarea';
import { getGradientMidpoint, getReadableTextColor } from '../app/components/ColorUtils';
import { checkConversation, type SafetyFlag } from '../lib/safetyFlags';
import { scrubPII, describeScrub } from '../lib/piiScrub';
import { playSignature, signatureNotes } from '../lib/sessionSound';
import { REFERRAL_NOTE, VENICE_CHARACTER_URL, VENICE_SIGNUP_URL } from '../lib/veniceLinks';
import { looksLikeManipulation, MANIPULATION_NOTICE } from '../lib/promptGuard';
import { OWNER_KEY, OWNER_TOKEN_KEY, REST_KEY } from '../lib/deviceMemory';
import { overridesForRequest } from '../lib/ownerPanel';
import { readPauseEnds } from '../lib/pause';
import PauseScreen from './PauseScreen';
import { AppFooter } from '../app/components/AppFooter';
import { SupportThisWork } from '../app/components/SupportThisWork';
import { ShareNenya } from '../app/components/ShareNenya';
import { FlagNotice } from './FlagNotice';
import { ReportShare, type ReportInput } from './ReportShare';
import { openingText } from '../lib/reportShare';
import type { SharedText } from '../lib/reportFragments';
import { AnswerCard, type AnswerCardData } from './AnswerCard';
import { CLOSING_TEXT, greetingText, siteMessagesFor } from '../lib/siteMessages';
import { TranscriptTools } from './TranscriptTools';
import { FailureNotice } from './FailureNotice';
import { resetScroll } from '../app/components/ScrollToTop';
import { describeFailure, type FailureInfo } from '../lib/coachErrors';
import { DEFAULT_TIMEOUT, quietState, type TimeoutChoice } from '../lib/chatTimeout';
import { QuietNotice, QuietTimeoutPicker } from './QuietTimeout';

const MAX_TURNS = 5;
const MAX_CHARS = 500;
const ENDPOINT = '/api/coach';

// The one thing this page keeps on the device: when a finished conversation ended, so the free demo
// can rest for a while. A bare timestamp in local storage, never sent anywhere. Anyone can clear it,
// so it is a courtesy, not a lock. Setting OWNER_KEY to '1' in your own browser skips it for testing.
const REST_HOURS = 6;
const HOUR_MS = 3600000;

// The owner's secret token, if the owner has put one in this browser, goes with each message so the function can lift
// the per-connection limit for testing. Nobody else has one, and it is never shown or stored anywhere but here.
const ownerHeader = (): Record<string, string> => {
  try {
    const t = localStorage.getItem(OWNER_TOKEN_KEY);
    return t ? { 'x-nenya-owner': t } : {};
  } catch {
    return {};
  }
};

// When the rest ends (ms since epoch), or 0 if there is none.
const readRestEnds = (): number => {
  try {
    if (localStorage.getItem(OWNER_KEY) === '1') return 0;
    const finished = Number(localStorage.getItem(REST_KEY));
    const now = Date.now();
    if (!Number.isFinite(finished) || finished <= 0 || finished > now + 60000) return 0;
    const ends = finished + REST_HOURS * HOUR_MS;
    return ends > now ? ends : 0;
  } catch {
    return 0;
  }
};

const markFinished = () => {
  try {
    if (localStorage.getItem(OWNER_KEY) !== '1') localStorage.setItem(REST_KEY, String(Date.now()));
  } catch {
    // Storage blocked: the demo simply does not rest.
  }
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const norm = (c: string | undefined, fallback: string) => (c && HEX.test(c) ? c.toUpperCase() : fallback);

interface Msg {
  role: 'user' | 'assistant';
  content: string;
  /** Page-only note, never sent anywhere. */
  note?: string;
  /** Set when the site wrote this reply itself as a pre-written answer: the card shown beneath it. */
  card?: AnswerCardData;
}

const toWire = (ms: Msg[]) => ms.map((m) => ({ role: m.role, content: m.content }));

type Stage = 'consent' | 'chat' | 'done';

// Written by the page, not the model: no API call, not counted among the exchanges. They carry the turn mechanics so the model does not spend replies
// on them. A signed transcript includes the ones that were shown (src/lib/siteMessages.ts, which the server also uses).
const GREETING = greetingText(MAX_TURNS);
const CLOSING = CLOSING_TEXT;


interface CoachDemoProps {
  /** The visitor's two colors: they theme the page and act as a temporary session label. */
  colors: { color1: string; color2: string };
  /** Where the header's back control goes. Omit on the standalone page (it links to the site). */
  onBack?: () => void;
  /** Tells the page whether there is a conversation that leaving would lose. */
  onActiveChange?: (active: boolean) => void;
  /** Where "open the breathing tool" goes. Omit on the standalone page (it links to the site). */
  onBreathe?: () => void;
  /** Optional link to the partner-practice demo. */
  onPartnerPractice?: () => void;
  /** The reflection report in memory, if the visitor has made one in this visit. It is only ever offered, never read or sent unless they choose. */
  report?: ReportInput;
}

// The conversation lives in this component's memory and closing the tab ends it. The only thing
// written to browser storage is the finish time described above.
export default function CoachDemo({ colors, onBack, onActiveChange, onBreathe, onPartnerPractice, report }: CoachDemoProps) {
  const color1 = norm(colors.color1, '#7A9B9E');
  const color2 = norm(colors.color2, '#DAC682');
  const session = { color1, color2 };
  const hexCode = `${color1}.${color2}`;
  const gradient = `linear-gradient(135deg, ${color1}, ${color2})`;
  const onGradient = getReadableTextColor(getGradientMidpoint(color1, color2));

  const [stage, setStage] = useState<Stage>('consent');
  // Parts of a report the visitor chose to bring (null: none). Sent with every request once chosen, because the conversation's ticket is bound to it.
  const [shared, setShared] = useState<SharedText | null>(null);
  const [contextFlag, setContextFlag] = useState<SafetyFlag | null>(null);
  const [sharedDropped, setSharedDropped] = useState(false);
  const [restEnds] = useState(readRestEnds);
  const [pauseEnds, setPauseEnds] = useState(() => readPauseEnds());
  const hoursLeft = Math.max(1, Math.ceil((restEnds - Date.now()) / HOUR_MS));
  const [messages, setMessages] = useState<Msg[]>([]);
  const [ticket, setTicket] = useState<string | undefined>();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<FailureInfo | null>(null);
  const [blocked, setBlocked] = useState(false);
  // Today's free conversations are used up. Only known when a first message is sent.
  const [capped, setCapped] = useState<false | 'cap' | 'ip'>(false);
  const [signaturePlaying, setSignaturePlaying] = useState(false);
  // The quiet timeout (see src/lib/chatTimeout.ts): chosen before starting, changeable in the chat, kept only in memory.
  const [timeoutChoice, setTimeoutChoice] = useState<TimeoutChoice>(DEFAULT_TIMEOUT);
  const [activeAt, setActiveAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [timedOut, setTimedOut] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);
  const touch = () => {
    const t = Date.now();
    setActiveAt(t);
    setNow(t);
  };
  const stopSignature = useRef<(() => void) | null>(null);
  const notes = signatureNotes(color1, color2);
  useEffect(() => () => stopSignature.current?.(), []);
  const [flag, setFlag] = useState<SafetyFlag | null>(null);
  const [flaggedText, setFlaggedText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    onActiveChange?.(messages.length > 0);
  }, [messages.length, onActiveChange]);

  // Quiet time only counts while the page is waiting on the person: it pauses while a reply is on its way.
  const quiet = quietState(timeoutChoice, sending ? 0 : now - activeAt);
  useEffect(() => {
    if (stage !== 'chat' || timedOut || capped) return;
    const id = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(id);
  }, [stage, timedOut, capped]);
  useEffect(() => {
    if (stage === 'chat') touch(); // the clock starts when the conversation opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);
  useEffect(() => {
    if (stage === 'chat' && quiet.kind === 'closed') setTimedOut(true);
  }, [stage, quiet.kind]);

  const turn = Math.min(messages.filter((m) => m.role === 'user').length + (sending ? 0 : 1), MAX_TURNS);

  useEffect(() => {
    // Follow the conversation only once there is one. Without this guard the page scrolled itself to the bottom
    // the moment the coach screen opened (before any message), which is what people saw after choosing
    // "Talk it through with the coach".
    if (messages.length === 0) return;
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending]);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [stage]);

  // The consent screen is long and its "I understand, start" button sits at the bottom. When the conversation replaces it the
  // page keeps its scroll position, which is now the bottom of the conversation. Go back to the top, so the greeting is what
  // the person sees. (Not on first load: the app already resets the scroll when it opens this screen.)
  const firstStage = useRef(true);
  useEffect(() => {
    if (firstStage.current) {
      firstStage.current = false;
      return;
    }
    if (stage !== 'chat') return;
    resetScroll();
    const later = setTimeout(resetScroll, 120); // again once the new content has laid out
    return () => clearTimeout(later);
  }, [stage]);


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
    // Checked against what the person has written so far, so the self-injury ladder (recurs, escalates) can see the conversation.
    const local = checkConversation(next.filter((m) => m.role === 'user').map((m) => m.content));
    if (local?.tier === 'stop') {
      setMessages(next);
      setFlag(local);
      setFlaggedText(scrubbed.text);
      setDraft('');
      setStage('done');
      return;
    }

    touch();
    setSending(true);
    setFailure(null);
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...ownerHeader() },
        body: JSON.stringify({ messages: toWire(next), session, ticket, ...(shared ? { context: shared.text } : {}), ...overridesForRequest() }),
      });
      if (!res.ok) {
        // Say what went wrong instead of a bare "failed". The server's answer carries a code, a reason and a reference.
        let body: { error?: string; reason?: string; ref?: string } = {};
        try {
          body = await res.json();
        } catch {
          /* a plain-text answer, such as the platform's own rate limit */
        }
        setFailure({ ...describeFailure({ status: res.status, ...body }), at: new Date().toISOString() });
        return;
      }
      const data = (await res.json()) as {
        reply?: string;
        ticket?: string;
        done?: boolean;
        flag?: SafetyFlag;
        contextFlag?: SafetyFlag;
        blocked?: string;
        card?: AnswerCardData;
      };
      // The server screens too. A blocked message is not part of the conversation.
      if (data.blocked === 'cap' || data.blocked === 'ip') {
        setCapped(data.blocked);
        return;
      }
      if (data.blocked === 'context') {
        // What was shared reads like instructions to the coach: it is left out, and the visitor continues without it.
        setShared(null);
        setSharedDropped(true);
        return;
      }
      if (data.blocked) {
        setBlocked(true);
        return;
      }
      if (data.contextFlag) setContextFlag(data.contextFlag);
      setMessages(data.reply ? [...next, { role: 'assistant', content: data.reply, ...(data.card ? { card: data.card } : {}) }] : next);
      setTicket(data.ticket);
      touch();
      setDraft('');
      if (data.flag) {
        setFlag(data.flag);
        setFlaggedText(scrubbed.text);
      }
      if (data.done) setStage('done');
    } catch (e) {
      // A fetch that never got an answer throws a TypeError; anything else is an answer that could not be read.
      setFailure({ ...describeFailure(e instanceof TypeError ? { network: true } : { error: 'unreadable' }), at: new Date().toISOString() });
    } finally {
      setSending(false);
    }
  };

  const linkClass = 'text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground';

  const gradientButton = {
    background: gradient,
    color: onGradient,
    border: 'none',
  } as const;

  const stopped = flag?.tier === 'stop';
  useEffect(() => {
    if (stage === 'done' && !stopped) markFinished();
  }, [stage, stopped]);

  // The coach's page-written lines look like its replies.
  const pageBubble = (text: string) => (
    <div className="coach-msg flex items-end gap-2 justify-start">
      <span aria-hidden="true" className="mb-1 size-7 shrink-0 rounded-full shadow-sm" style={{ background: gradient }} />
      <div
        className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-md border bg-card px-4 py-3 text-sm leading-relaxed shadow-sm"
        style={{ borderColor: `${color2}66` }}
      >
        <span className="mb-1 block text-xs text-muted-foreground">Coach</span>
        {text}
      </div>
    </div>
  );

  const breatheButton = (
    onBreathe ? (
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
    )
  );
  const venicePanel = (
    <section
      className="space-y-4 rounded-2xl border bg-card p-5"
      style={{ borderColor: `${color1}66` }}
      aria-label="Continue on Venice"
    >
      <h2 className="text-lg">Want to keep talking?</h2>
      <p className="text-sm text-muted-foreground">
        The demo stops at {MAX_TURNS} exchanges. The same character is also available on Venice AI&rsquo;s own
        site, where you can continue for as long as your Venice account allows. Free Venice accounts can send a
        limited number of messages, and paid plans raise that limit.
      </p>
      <div className="rounded-lg border border-amber-500/60 p-3 text-sm">
        <p className="mb-1 font-medium">Before you go: it is not the same as this demo.</p>
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          <li>You leave Nenya. Venice AI&rsquo;s terms and privacy policy apply, not ours.</li>
          <li>
            Nenya&rsquo;s protections do not run there: no identifier scrubbing, no crisis check, no
            screening for attempts to steer the coach, and no five-exchange limit. Please leave out names and
            other identifying details yourself.
          </li>
          <li>Nothing from this conversation is carried over, and Nenya cannot sign what happens there.</li>
          <li>It is still not therapy. In the US, call or text 988 in a crisis.</li>
        </ul>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <a
          href={VENICE_CHARACTER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm"
          style={gradientButton}
        >
          Continue on Venice AI
          <ArrowRight className="size-4" />
        </a>
        <a href={VENICE_SIGNUP_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
          Need a Venice account? Sign up
        </a>
      </div>
      <p className="text-xs text-muted-foreground">{REFERRAL_NOTE}</p>
    </section>
  );
  const userCount = messages.filter((m) => m.role === 'user').length;
  const remainingNote =
    stage !== 'chat' || sending || userCount === 0 || userCount >= MAX_TURNS
      ? ''
      : turn === MAX_TURNS
        ? 'This is your last exchange.'
        : turn === MAX_TURNS - 1
          ? 'One more exchange after this one.'
          : '';

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
          {stage === 'consent' && pauseEnds > 0 && <PauseScreen ends={pauseEnds} onReturn={() => setPauseEnds(0)} breatheButton={breatheButton} />}

          {stage === 'consent' && pauseEnds === 0 && restEnds > 0 && (
            <section className="space-y-5" aria-labelledby="coach-title">
              <h1 id="coach-title" ref={headingRef} tabIndex={-1} className="text-2xl outline-none md:text-3xl">
                The coach is resting for now
              </h1>
              <p className="text-muted-foreground">
                You finished a conversation recently. This demo is free, and every reply costs real money to produce, so
                it reopens about {hoursLeft} {hoursLeft === 1 ? 'hour' : 'hours'} after a conversation ends. That is how
                it stays free for everyone.
              </p>
              <p className="text-muted-foreground">
                If you want to keep going, there are good places to do it that are not this page: the breathing tool
                below, a person you trust, a journal, or a professional if it feels heavy. You can also continue with the
                same character on Venice AI, with the differences explained there.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                {breatheButton}
                <ShareNenya />
              </div>
              {venicePanel}
              <p className="text-xs text-muted-foreground">
                Your browser remembers only the time you finished, so the demo knows to rest. Nothing is sent to Nenya.
                The &ldquo;Forget me&rdquo; button in the settings menu or at the bottom of the page, or clearing this site&rsquo;s data in your browser, removes it.
              </p>
            </section>
          )}

          {stage === 'consent' && pauseEnds === 0 && restEnds === 0 && (
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
                  <li>The coach reflects what you say, names feelings and needs, and may suggest a way to say it or a breath. It is not a therapist and does not diagnose.</li>
                  <li>
                    It only responds to what you share about yourself. Messages that try to give it instructions, or to
                    change how it works, are not sent.
                  </li>
                </ul>
              </div>

              <div
                className="flex items-center justify-between gap-4 rounded-2xl border bg-card p-4"
                style={{ borderColor: `${color1}55` }}
                aria-label="Your session signature"
              >
                <div>
                  <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Your signature</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {notes.first.map((n, i) => (
                      <span
                        key={`a${i}`}
                        className="rounded-lg border px-2 py-1 font-mono text-[11px]"
                        style={{ borderColor: `${color1}99`, backgroundColor: `${color1}22` }}
                      >
                        {n}
                      </span>
                    ))}
                    <span className="mx-1 opacity-30">·</span>
                    {notes.second.map((n, i) => (
                      <span
                        key={`b${i}`}
                        className="rounded-lg border px-2 py-1 font-mono text-[11px]"
                        style={{ borderColor: `${color2}99`, backgroundColor: `${color2}22` }}
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={signaturePlaying}
                  className="shrink-0 gap-2 rounded-full"
                  onClick={() => {
                    setSignaturePlaying(true);
                    stopSignature.current = playSignature(color1, color2, () => setSignaturePlaying(false));
                  }}
                >
                  <Play className={`size-3 ${signaturePlaying ? 'animate-pulse' : ''}`} />
                  {signaturePlaying ? 'playing…' : 'hear it'}
                </Button>
              </div>

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
                <li>
                  When a conversation ends, your browser saves the time, and only the time, so the free demo can rest
                  for {REST_HOURS} hours before opening again. It is never sent to Nenya.
                </li>
                <li>
                  The free demo can only start a set number of conversations a day for everyone together. If today&rsquo;s
                  are used up, the page will tell you when you send your first message, and that message is not passed
                  on or kept.
                </li>
                <li>Please leave out names, addresses, and other identifying details.</li>
                <li>
                  This is not therapy and it cannot help in a crisis. In the US, call or text 988. If you are in
                  immediate danger, call your local emergency number.
                </li>
                <li>The full Terms of Use and Privacy Policy are in the About menu on nenya.biz.</li>
                <li>The coach has been tested in English only. If you read and write another language and would like to help, write to info@nenya.biz.</li>
              </ul>
              <ReportShare
                report={report}
                shared={shared}
                onChange={(next) => {
                  setShared(next);
                  setSharedDropped(false);
                  // The same crisis check as for a message: a flag is shown now, before anything is sent. It never ends the conversation.
                  setContextFlag(next ? checkConversation([next.text]) : null);
                }}
              />
              <QuietTimeoutPicker id="coach-quiet-start" value={timeoutChoice} onChange={setTimeoutChoice} />
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
              {stage === 'chat' && !timedOut && (
                <QuietTimeoutPicker id="coach-quiet-chat" compact value={timeoutChoice} onChange={(v) => { setTimeoutChoice(v); touch(); }} />
              )}

              <div className="space-y-4" role="log" aria-live="polite" aria-label="Conversation">
                {pageBubble(shared ? openingText(shared.meta) : GREETING)}
                {messages.map((m, i) => (
                  <Fragment key={i}>
                  <div
                    className={`coach-msg flex items-end gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.role === 'assistant' && (
                      <span
                        aria-hidden="true"
                        className="mb-1 size-7 shrink-0 rounded-full shadow-sm"
                        style={{ background: gradient }}
                      />
                    )}
                    <div
                      className={`max-w-[85%] whitespace-pre-wrap border px-4 py-3 text-sm leading-relaxed shadow-sm ${
                        m.role === 'user' ? 'rounded-2xl rounded-br-md' : 'rounded-2xl rounded-bl-md bg-card'
                      }`}
                      style={
                        m.role === 'user'
                          ? { backgroundColor: `${color1}26`, borderColor: `${color1}66` }
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
                  {m.card && <AnswerCard card={m.card} />}
                  </Fragment>
                ))}
                {sending && (
                  <div className="coach-msg flex items-end gap-2" role="status">
                    <span aria-hidden="true" className="mb-1 size-7 shrink-0 rounded-full shadow-sm" style={{ background: gradient }} />
                    <div
                      className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border bg-card px-4 py-3.5 shadow-sm"
                      style={{ borderColor: `${color2}66` }}
                    >
                      <span className="sr-only">The coach is thinking</span>
                      {[color1, color1, color2].map((c, i) => (
                        <span
                          key={i}
                          aria-hidden="true"
                          className="coach-dot size-2 rounded-full"
                          style={{ backgroundColor: c, animationDelay: `${i * 160}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {remainingNote && (
                  <p role="status" className="text-center text-xs text-muted-foreground">
                    {remainingNote}
                  </p>
                )}
                {stage === 'done' && !flag && pageBubble(CLOSING)}
                {stage === 'done' && !flag && siteMessagesFor(toWire(messages), MAX_TURNS).filter((x) => x.kind === 'invitation').map((x) => <Fragment key="invitation">{pageBubble(x.text)}</Fragment>)}
                <div ref={endRef} />
              </div>

              {flag && <FlagNotice flag={flag} flaggedMessage={flaggedText} />}
              {contextFlag && !flag && <FlagNotice flag={contextFlag} flaggedMessage="" source="report" />}
              {sharedDropped && !shared && (
                <p role="status" className="rounded-xl border border-border bg-card/50 p-3 text-xs text-muted-foreground">
                  Part of what you shared reads like instructions to the coach, so it was left out. You can send your message again without it.
                </p>
              )}

              {stage === 'chat' && !timedOut && !capped && (
                <QuietNotice state={quiet} choice={timeoutChoice} onKeepOpen={touch} onSave={() => setCopyOpen(true)} />
              )}

              {stage === 'chat' && messages.length >= 2 && !sending && (
                <details
                  className="rounded-2xl border border-border bg-card/50 px-4 py-3 text-sm"
                  open={copyOpen}
                  onToggle={(e) => setCopyOpen((e.currentTarget as HTMLDetailsElement).open)}
                >
                  <summary className="cursor-pointer text-muted-foreground">
                    Keep a record, or report a problem
                  </summary>
                  <div className="pt-3">
                    <TranscriptTools messages={toWire(messages)} context={shared?.text} session={session} ticket={ticket} maxTurns={MAX_TURNS} answered={messages.flatMap((m, i) => (m.card ? [{ index: i, title: m.card.title, partial: m.card.partial }] : []))} />
                  </div>
                </details>
              )}

              {stage === 'chat' && capped && (
                <section className="space-y-4 rounded-2xl border bg-card p-5" style={{ borderColor: `${color2}80` }}>
                  <h2 className="text-xl">
                    {capped === 'ip' ? 'This connection has used its free conversations for today' : 'The free conversations for today are used up'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {capped === 'ip'
                      ? 'Shared networks count together. '
                      : 'This demo is free, and each reply costs real money, so Nenya can only offer a set number of conversations a day. Today\u2019s are taken. '}
                    Your message was not passed on to Venice AI and was not kept. It opens again tomorrow. Until then, the breathing tool is here, or you can continue with the same character on
                    Venice AI, with the differences explained below.
                  </p>
                  <div className="flex flex-wrap items-center gap-4">
                    {breatheButton}
                    <ShareNenya />
                  </div>
                </section>
              )}
              {stage === 'chat' && capped && venicePanel}

              {stage === 'chat' && !capped && timedOut && (
                <section className="space-y-3 rounded-2xl border bg-card p-5 text-sm" style={{ borderColor: `${color2}80` }} role="status">
                  <h2 className="text-xl">This conversation closed after a quiet while</h2>
                  <p className="text-muted-foreground">
                    You can still save a copy above for a few more minutes; after that the coach can no longer sign it. Nothing was kept on
                    our side. To talk again, start a new conversation.
                  </p>
                  {onBack ? (
                    <button type="button" onClick={onBack} className={linkClass}>
                      Clear this and leave
                    </button>
                  ) : (
                    <a href="/" className={linkClass}>
                      Back to Nenya
                    </a>
                  )}
                </section>
              )}

              {stage === 'chat' && !capped && !timedOut && (
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
                      touch();
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
                  {(() => {
                    // A gentle nudge while typing: names and contact details are replaced before anything is sent, and the coach does not use names.
                    const found = draft.length > 2 ? scrubPII(draft) : null;
                    return found && found.total > 0 ? (
                      <p className="text-xs text-muted-foreground" role="status">
                        This looks like it has {describeScrub(found.counts)} in it. The coach does not use names or contact details, so {found.total === 1 ? 'it' : 'they'} will be replaced with {found.total === 1 ? 'a placeholder' : 'placeholders'} when you send. You can say who it was by how they relate to you instead (&ldquo;my sister&rdquo;, &ldquo;my manager&rdquo;). Names are not always caught, so please keep them out if you can.
                      </p>
                    ) : null;
                  })()}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">
                      {draft.length} / {MAX_CHARS}
                    </span>
                    <Button type="submit" disabled={!draft.trim() || sending} className="gap-2" style={gradientButton}>
                      <Send className="size-4" />
                      Send
                    </Button>
                  </div>
                  {blocked && (
                    <p role="alert" className="rounded-lg border border-amber-500/60 p-3 text-sm">
                      {MANIPULATION_NOTICE}
                    </p>
                  )}
                  {failure && <FailureNotice info={failure} turn={turn} />}
                </form>
              )}

              {stage === 'done' && (
                <section className="space-y-4 rounded-2xl border bg-card p-5" style={{ borderColor: `${color2}80` }}>
                  {stopped && <h2 className="text-xl">This conversation has ended</h2>}
                  <p className="text-sm text-muted-foreground">
                    {stopped
                      ? 'The resources above are the right next step. When you are ready, the breathing tool is here too.'
                      : 'The breathing tool is where Nenya begins. Follow the glow in, and out, for as long as you like.'}
                  </p>
                  <div className="flex flex-wrap items-center gap-4">
                    {breatheButton}
                    <ShareNenya />
                    {onPartnerPractice && (
                      <button type="button" onClick={onPartnerPractice} className={linkClass}>
                        See a preview of planned partner practice (not built)
                      </button>
                    )}
                  </div>
                </section>
              )}

              {stage === 'done' && !flag && venicePanel}

              {stage === 'done' && (
                <TranscriptTools messages={toWire(messages)} context={shared?.text} session={session} ticket={ticket} stopped={stopped} maxTurns={MAX_TURNS} answered={messages.flatMap((m, i) => (m.card ? [{ index: i, title: m.card.title, partial: m.card.partial }] : []))} />
              )}
            </>
          )}
        </div>
        <div id="support" className="mx-auto flex max-w-3xl scroll-mt-4 justify-center pt-20 pb-12">
          <SupportThisWork />
        </div>
        <AppFooter className="-mx-4 -mb-6 md:-mx-6" />
      </main>

      <footer className="shrink-0 border-t border-border px-4 py-3 text-center text-xs text-muted-foreground">
        Early prototype. Not therapy. In the US, call or text 988 in a crisis.
      </footer>
    </div>
  );
}
