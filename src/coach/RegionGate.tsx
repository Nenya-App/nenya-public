import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '../app/components/ui/button';
import { ArrowLeft, Wind } from 'lucide-react';

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

      <div className="space-y-3">
        <h2 className="text-lg">What an IP address is</h2>
        <p>
          Every device on the internet is reached through an address, called an IP (Internet Protocol) address, so that
          what it asks for can find its way back, like the return address on an envelope. Usually the address belongs to
          your internet provider or mobile network, which lends it to you. Many people can share one, and it can change
          from day to day.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg">How a country is worked out from it</h2>
        <p>
          Some companies keep lists that match blocks of addresses to the places where providers use them. A match is
          usually right about the country and often wrong about the city. It can be wrong altogether: near borders, on
          some mobile and satellite networks, on workplace or school networks, and through a VPN or private relay, which
          shows the address of a server somewhere else.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg">What Nenya does with yours</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Our host, Netlify, sees your IP address with every request, as the host of any website does, and keeps
            ordinary connection logs. The Terms describe this in Section 13.
          </li>
          <li>
            For this check, Netlify looks up the country and gives our code only a two-letter country code. We use it to
            decide whether the coach can open, and send it back to this page so you can see what was decided. We do not
            store it or write it to our logs. We count only that a visit was turned away, with nothing about who or where.
          </li>
          <li>
            Where the coach is open, our server also turns the IP address into a one-way code that changes every day, to
            apply the daily limit (Section 15 of the Terms). That has not happened here, because no message was sent.
          </li>
        </ul>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg">If you are in the United States</h2>
        <p>
          The lookup may have placed you wrongly. A VPN or private relay is the most common reason: turning it off for
          this page and reloading may help. Some mobile and workplace networks also route traffic through other
          countries. We cannot change the result by hand.
        </p>
        <p>
          If you are outside the US, please do not use a VPN to get around this: the limit follows the terms of the
          service that writes the replies.
        </p>
      </div>

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
