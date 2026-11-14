import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '../app/components/ui/button';
import { ArrowLeft, Wind } from 'lucide-react';
import { IpExplainer } from './IpExplainer';

// The coach is open only to connections our host places in the United States (src/lib/coachRegion.ts). The page asks the
// server once; the server enforces it on every message regardless, so a failed check here simply lets the page continue.

type State = { kind: 'checking' } | { kind: 'allowed' } | { kind: 'denied'; country: string | null };

export function countryName(code: string | null): string | null {
  if (!code) return null;
  try {
    const name = new Intl.DisplayNames(['en'], { type: 'region' }).of(code);
    return name && name !== code ? name : null;
  } catch {
    return null;
  }
}

export function RegionGate({ children, onBack, onBreathe }: { children: ReactNode; onBack?: () => void; onBreathe?: () => void }) {
  const [state, setState] = useState<State>({ kind: 'checking' });
  useEffect(() => {
    let on = true;
    fetch('/api/coach?region', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { allowed?: boolean; country?: string | null } | null) => {
        if (!on) return;
        setState(j && j.allowed === false ? { kind: 'denied', country: j.country ?? null } : { kind: 'allowed' });
      })
      .catch(() => on && setState({ kind: 'allowed' }));
    return () => {
      on = false;
    };
  }, []);
  if (state.kind === 'checking') {
    return (
      <p role="status" className="px-4 py-8 text-center text-muted-foreground">
        Checking whether the coach is available here&hellip;
      </p>
    );
  }
  if (state.kind === 'denied') return <RegionNotice country={state.country} onBack={onBack} onBreathe={onBreathe} />;
  return <>{children}</>;
}

/** What a visitor outside the United States sees: why, and what an IP address is and how Nenya uses it. */
export function RegionNotice({ country, onBack, onBreathe, inline = false }: { country: string | null; onBack?: () => void; onBreathe?: () => void; inline?: boolean }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!inline) headingRef.current?.focus({ preventScroll: true });
  }, [inline]);
  const name = countryName(country);
  const placed = country
    ? `Our host placed your connection in ${name ? `${name} (${country})` : country}.`
    : inline
      ? 'Our host placed your connection outside the United States, or could not place it.'
      : 'Our host could not tell which country your connection is in.';
  const H = inline ? 'h2' : 'h1';
  const breathe = onBreathe ? (
    <Button onClick={onBreathe} className="gap-2">
      <Wind className="size-4" aria-hidden="true" />
      Open the breathing tool
    </Button>
  ) : (
    <Button asChild className="gap-2">
      <a href="/">
        <Wind className="size-4" aria-hidden="true" />
        Open the breathing tool
      </a>
    </Button>
  );

  return (
    <section
      className={inline ? 'space-y-4 rounded-2xl border border-border bg-card p-5' : 'scroll-container mx-auto w-full max-w-xl space-y-6 overflow-y-auto px-4 py-6 md:px-6'}
      aria-labelledby="region-title"
      data-region-notice
    >
      <H id="region-title" ref={headingRef} tabIndex={-1} className={`${inline ? 'text-xl' : 'text-2xl md:text-3xl'} outline-none`}>
        The coach is available only in the United States, for now
      </H>
      <p>
        {placed} The coach&rsquo;s replies are written by an AI model run by Venice AI, and Venice AI&rsquo;s terms say its
        service is intended for people located in the United States. Our own terms promise to respect theirs, so until we
        have a way to offer the coach elsewhere, it is closed outside the US. Nothing you could type here has been sent.
      </p>
      <p>
        The rest of Nenya works everywhere and sends nothing: the breathing tool, the six gateways, and the report you can
        make from them.
      </p>
      <p>
        <a href="/about/coach-region" className="underline underline-offset-2">
          Where the Coach Is Open
        </a>{' '}
        on the About page explains this again, for later.
      </p>

      <IpExplainer level={inline ? 3 : 2} />

      <div className="flex flex-wrap items-center gap-4">
        {breathe}
        {onBack && (
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back
          </Button>
        )}
      </div>
    </section>
  );
}
