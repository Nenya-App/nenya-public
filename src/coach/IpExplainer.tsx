// What an IP address is, how a country is worked out from one, and what Nenya does with yours. Shown when the coach is closed
// for a visitor (RegionGate) and on the About page "Where the Coach Is Open", so both say the same words.
// With `cited`, the sentences that rest on research carry numbers that link to the list on the About page "Where the Coach Is Open"
// (pageId 'coach-region'); the coach gate has no list, so it shows the same words without the numbers.
import { Cite } from '../app/components/about/AboutReferences';

export function IpExplainer({ level = 2, cited = false }: { level?: 2 | 3; cited?: boolean }) {
  const Sub = level === 3 ? 'h3' : 'h2';
  const c = (n: number | number[]) => (cited ? <Cite pageId="coach-region" n={n} /> : null);
  return (
    <>
      <div className="space-y-3">
        <Sub className="text-lg">What an IP address is</Sub>
        <p>
          Websites answer you through an address called an IP (Internet Protocol) address, like the return address on an
          envelope. Often the address is shared by many devices {c(1)}. Usually the address belongs to your internet provider
          or mobile network, which lends it to you. Many people can share one, and it can change, sometimes every day {c([1, 2])}.
        </p>
      </div>

      <div className="space-y-3">
        <Sub className="text-lg">How a country is worked out from it</Sub>
        <p>
          Some companies keep lists that match blocks of addresses to the places where providers use them {c(3)}. Our host,
          Netlify, looks up a country for each connection and gives it to us {c(4)}. A match is usually right about the
          country and often wrong about the city {c([3, 5])}. It can be wrong altogether. A VPN or a private relay shows the
          address of a server somewhere else. Shared addresses on some mobile and workplace networks can also give the wrong
          place {c([1, 3, 6])}.
        </p>
      </div>

      <div className="space-y-3">
        <Sub className="text-lg">What Nenya does with yours</Sub>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Our host, Netlify, sees your IP address with every request, as the host of any website does, and keeps
            ordinary connection logs. The Terms describe this in Section 13.
          </li>
          <li>
            When you open the coach, Netlify looks up the country and gives our code only a two-letter country code. We use it to
            decide whether the coach can open, and send it back to this page so you can see what was decided. We do not
            store it or write it to our logs. We count only that a visit was turned away, with nothing about who or where.
          </li>
          <li>
            Where the coach is open, our server also turns your IP address into a one-way code that changes every day. We use
            it to apply the daily limit (Section 15 of the Terms). Where the coach is closed, no message is sent, so that
            never happens. A few optional tools, such as the guestbook, make their own one-way codes for their own limits.
            The Terms list them.
          </li>
        </ul>
      </div>

      <div className="space-y-3">
        <Sub className="text-lg">If you are in the United States</Sub>
        <p>
          The lookup may have placed you wrongly. A VPN or private relay is one common reason: turning it off for this
          page and reloading may help. Some mobile and workplace networks also share addresses that can show up in the
          wrong country. We cannot change the result by hand.
        </p>
        <p>
          If you are outside the US, please do not use a VPN to get around this: the limit follows the terms of the
          service that writes the replies.
        </p>
      </div>
    </>
  );
}
