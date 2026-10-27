import { useState } from 'react';
import { Check, Copy, Link as LinkIcon, Mail, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { submitReport } from '../../lib/reportSubmission';

const CONTACT_EMAIL = 'info@nenya.biz';
const SITE_URL = 'https://nenya.biz';
const MAX_MESSAGE = 3000;

type Status = 'idle' | 'sending' | 'sent' | 'error';

// Messages go through the same Netlify Forms endpoint as error reports, so
// they land in the same inbox with no extra setup.
export function ContactSection() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [copied, setCopied] = useState<'email' | 'link' | null>(null);

  const copy = async (what: 'email' | 'link') => {
    try {
      await navigator.clipboard.writeText(what === 'email' ? CONTACT_EMAIL : SITE_URL);
      setCopied(what);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      // Clipboard can be refused; the address and link are also shown as plain text.
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || status === 'sending') return;
    setStatus('sending');
    try {
      await submitReport({ type: 'contact-message', report: message });
      setStatus('sent');
      setMessage('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" aria-labelledby="contact-title" className="text-center space-y-8 max-w-3xl w-full">
      <div className="space-y-4">
        <h2 id="contact-title" className="text-3xl md:text-4xl lg:text-5xl">
          Stay in Touch
        </h2>
        <p className="text-xl text-muted-foreground leading-relaxed">
          We’d love to hear from you: to connect, to share Nenya with a colleague or loved one, or to tell us about
          your experience of using it.
        </p>
      </div>

      <Card className="p-6 sm:p-8 bg-card/80 dark:bg-card/50 backdrop-blur-sm border-nenya-gold/30 space-y-6 text-left">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-nenya-gold/20">
              <Mail className="size-5 text-nenya-gold" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Write to us any time</p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-lg text-nenya-accent-warm underline-offset-4 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => copy('email')} className="gap-2">
              {copied === 'email' ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied === 'email' ? 'Copied' : 'Copy address'}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => copy('link')} className="gap-2">
              {copied === 'link' ? <Check className="size-4" /> : <LinkIcon className="size-4" />}
              {copied === 'link' ? 'Copied' : 'Copy link to share'}
            </Button>
          </div>
        </div>

        <div className="border-t border-border" />

        <form onSubmit={handleSubmit} className="space-y-3">
          <Label htmlFor="contact-message" className="text-base">
            Or send a message from here
          </Label>
          <Textarea
            id="contact-message"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (status !== 'sending') setStatus('idle');
            }}
            maxLength={MAX_MESSAGE}
            rows={5}
            placeholder="Say hello, share how Nenya landed for you, or tell us who you'd like to share it with."
            className="min-h-32 resize-y"
            aria-describedby="contact-hint"
          />
          <p id="contact-hint" className="text-xs text-muted-foreground">
            If you’d like a reply, include your email address in your message. We only use it to answer you. Please
            leave out anything you wouldn’t want us to keep.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              disabled={!message.trim() || status === 'sending'}
              className="gap-2 bg-nenya-gold text-background-elevated hover:bg-nenya-gold-dark"
            >
              <Send className="size-4" />
              {status === 'sending' ? 'Sending…' : 'Send message'}
            </Button>
            <p role="status" aria-live="polite" className="text-sm">
              {status === 'sent' && <span className="text-muted-foreground">Thank you. Your message is on its way.</span>}
              {status === 'error' && (
                <span className="text-destructive">
                  That didn’t send. Please email us at {CONTACT_EMAIL} instead.
                </span>
              )}
            </p>
          </div>
        </form>
      </Card>
    </section>
  );
}
