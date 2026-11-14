// What an IP address is, how a country is worked out from one, and what Nenya does with yours. Shown when the coach is closed
// for a visitor (RegionGate) and on the About page "Where the Coach Is Open", so both say the same words.
export function IpExplainer({ level = 2 }: { level?: 2 | 3 }) {
  const Sub = level === 3 ? 'h3' : 'h2';
  return (
    <>
      <div className="space-y-3">
        <Sub className="text-lg">What an IP address is</Sub>
        <p>
          Every device on the internet is reached through an address, called an IP (Internet Protocol) address, so that
          what it asks for can find its way back, like the return address on an envelope. Usually the address belongs to
          your internet provider or mobile network, which lends it to you. Many people can share one, and it can change
          from day to day.
        </p>
      </div>

      <div className="space-y-3">
        <Sub className="text-lg">How a country is worked out from it</Sub>
        <p>
          Some companies keep lists that match blocks of addresses to the places where providers use them. A match is
          usually right about the country and often wrong about the city. It can be wrong altogether: near borders, on
          some mobile and satellite networks, on workplace or school networks, and through a VPN or private relay, which
          shows the address of a server somewhere else.
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
            Where the coach is open, our server also turns the IP address into a one-way code that changes every day, to
            apply the daily limit (Section 15 of the Terms). Where it is closed, no message is sent, so that never happens.
          </li>
        </ul>
      </div>

      <div className="space-y-3">
        <Sub className="text-lg">If you are in the United States</Sub>
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
    </>
  );
}
