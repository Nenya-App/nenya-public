import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Send } from 'lucide-react';
import NenyaLogo from '../app/components/NenyaLogo';
import { Button } from '../app/components/ui/button';
import { Textarea } from '../app/components/ui/textarea';

const MAX_TURNS = 5;
const MAX_CHARS = 500;
const ENDPOINT = '/api/coach';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

type Stage = 'consent' | 'chat' | 'done';

// Everything lives in this component's memory: nothing is written to browser
// storage, and closing the tab ends the conversation.
export default function CoachDemo() {
  const [stage, setStage] = useState<Stage>('consent');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [ticket, setTicket] = useState<string | undefined>();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [crisis, setCrisis] = useState(false);
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
    setCrisis(false);
    setStage('chat');
  };

  const send = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    const next: Msg[] = [...messages, { role: 'user', content: text }];
    setSending(true);
    setError('');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, ticket }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { reply: string; ticket?: string; done?: boolean; crisis?: boolean };
      setMessages([...next, { role: 'assistant', content: data.reply }]);
      setTicket(data.ticket);
      setDraft('');
      if (data.crisis) setCrisis(true);
      if (data.done) setStage('done');
    } catch {
      setError('That did not go through, and nothing was lost. You can try again, or go back to the breathing tool.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="size-full flex flex-col bg-background text-foreground">
      <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3 md:px-6">
        <a href="/" className="flex items-center gap-3 hover:opacity-80" aria-label="Back to Nenya">
          <NenyaLogo size={32} />
          <span className="bg-gradient-to-r from-nenya-accent-secondary via-nenya-accent-primary to-nenya-accent-metallic bg-clip-text text-transparent">
            Nenya
          </span>
        </a>
        <span className="rounded-full border border-nenya-accent-warm/50 px-3 py-1 text-xs text-muted-foreground">
          Prototype demo
        </span>
      </header>

      <main className="scroll-container flex-1 overflow-y-auto px-4 py-6 md:px-6">
        <div className="mx-auto w-full max-w-xl space-y-5">
          {stage === 'consent' && (
            <section className="space-y-5" aria-labelledby="coach-title">
              <h1 id="coach-title" ref={headingRef} tabIndex={-1} className="text-2xl md:text-3xl outline-none">
                A short conversation with the Nenya coach
              </h1>
              <p className="text-muted-foreground">
                This is an early prototype. You get {MAX_TURNS} exchanges, then we breathe. It is built to help you
                settle, not to keep you talking.
              </p>
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
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
                <Button
                  size="lg"
                  onClick={() => setStage('chat')}
                  className="gap-2 bg-nenya-accent-warm text-background-elevated hover:bg-nenya-accent-secondary"
                >
                  I understand, start
                  <ArrowRight className="size-4" />
                </Button>
                <a href="/" className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
                  Back to Nenya
                </a>
              </div>
            </section>
          )}

          {stage !== 'consent' && (
            <>
              <h1 ref={headingRef} tabIndex={-1} className="sr-only">
                Conversation with the Nenya coach
              </h1>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{stage === 'done' ? 'Conversation complete' : `Exchange ${turn} of ${MAX_TURNS}`}</span>
                <span>Not therapy</span>
              </div>

              <div className="space-y-4" role="log" aria-live="polite" aria-label="Conversation">
                {messages.map((m, i) => (
                  <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                    <div
                      className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-nenya-accent-warm/15 border border-nenya-accent-warm/40'
                          : 'bg-card border border-border'
                      }`}
                    >
                      <span className="mb-1 block text-xs text-muted-foreground">
                        {m.role === 'user' ? 'You' : 'Coach'}
                      </span>
                      {m.content}
                    </div>
                  </div>
                ))}
                {sending && <p className="text-sm text-muted-foreground">Listening&hellip;</p>}
                <div ref={endRef} />
              </div>

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
                    onChange={(e) => setDraft(e.target.value)}
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
                      messages.length === 0 ? 'Say what is on your mind, in a sentence or two.' : 'Your reply'
                    }
                    className="min-h-24 resize-none"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">
                      {draft.length} / {MAX_CHARS}
                    </span>
                    <Button
                      type="submit"
                      disabled={!draft.trim() || sending}
                      className="gap-2 bg-nenya-accent-warm text-background-elevated hover:bg-nenya-accent-secondary"
                    >
                      <Send className="size-4" />
                      Send
                    </Button>
                  </div>
                  {error && (
                    <p role="alert" className="text-sm text-destructive">
                      {error}
                    </p>
                  )}
                </form>
              )}

              {stage === 'done' && (
                <section className="space-y-4 rounded-2xl border border-nenya-accent-warm/40 bg-card p-5">
                  <h2 className="text-xl">{crisis ? 'Please reach a person now' : 'That is our five. Now, one minute to breathe.'}</h2>
                  <p className="text-sm text-muted-foreground">
                    {crisis
                      ? 'The resources above are the right next step. Nenya is not able to help in a crisis.'
                      : 'The breathing tool is where Nenya begins. Follow the glow in, and out, for as long as you like.'}
                  </p>
                  <div className="flex flex-wrap items-center gap-4">
                    <a
                      href="/"
                      className="inline-flex items-center gap-2 rounded-md bg-nenya-accent-warm px-4 py-2 text-sm text-background-elevated hover:bg-nenya-accent-secondary"
                    >
                      Open the breathing tool
                      <ArrowRight className="size-4" />
                    </a>
                    {!crisis && (
                      <button
                        type="button"
                        onClick={reset}
                        className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                      >
                        Start a new conversation
                      </button>
                    )}
                  </div>
                </section>
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
