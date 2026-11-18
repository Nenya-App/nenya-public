# A local hub and its spokes: scope for options 1 and 4 (draft for the owner, 2026-11-18)

**The idea (owner).** A machine in one place (a clinic, a school, a community group, a household) runs a model and makes itself reachable, so people nearby use it instead of the default route every time. Two ways to build it were asked about: **option 1**, the hub serves the whole app, and **option 4**, the browser talks to the hub peer-to-peer (WebRTC). Nothing here is built; nothing in the live coach changes.

**What the hub is not.** It is not a second Nenya service run for the public, and it does not replace Venice. It is an opt-in provider for a place that chooses to host one, in the same sense that Workers AI is a provider that exists and is switched off.

## What both options share

### The hub machine
- **Size** (estimates, not measured; see the memory notes in the answer of 2026-11-18): the 26B-A4B needs about 24 GB of unified memory at 4-bit and runs comfortably at 32 GB; E2B fits any recent laptop. One hub serves a handful of people at once, not a crowd: a mixture-of-experts model generates one reply at a time per request stream, so concurrency is a **measure first** item, not a promise.
- **Model server:** anything that speaks the OpenAI-style chat API (LM Studio does today; `llama.cpp`'s server or Ollama would too). The coach already has a local path (`--local-url`, pseudo id `@cf/local/<name>`, localhost only), so a hub provider is the same request shape on a non-localhost address.
- **Weights:** the hub operator downloads them (Gemma 4 is Apache 2.0, so redistributing is permitted; the hash is pinned and checked, as `docs/expanded-buildout-scope.md` says for the box). No weights are shipped through Netlify.

### The guards have to run on the hub's side of the line
Today every guard runs in `netlify/functions/coach.mts` (stops before the model, site answers, care, persona, names, closing, boundary). A path that never touches Netlify gets none of them unless they move. Two places they can live:
- **In the browser** (the precedent is `src/lib/sealedCoach.ts`, which already runs the checks and the boundary guards client-side for the sealed path). The page-side checks (`checkConversation`, distress, harm) already exist there.
- **In a hub process** that wraps the model server and runs the same shared modules (`src/lib/*` are plain TypeScript with no browser dependency, and `coach.mts` already imports them). This keeps the guards out of the visitor's control.

**Recommendation:** both: the browser runs what it already runs, and the hub wrapper runs the server-side set, so a modified browser cannot skip them. Until that exists, **a hub gives no more safety than the model alone**, and it must not be offered. This is the gate.

### Rules carried over
- **No silent fallback.** If the hub is down or unreachable, the person sees the failure notice. Their words are never quietly sent to Venice or anywhere else. (Same rule as Workers AI.)
- **Consent names the host.** Before the first message, the person is shown who runs this hub (the organisation's own name, set by the operator) and told that the host's machine reads the conversation in the clear and that Nenya cannot see it or delete it. This is a Terms and About change (below), not a footnote.
- **The free tool, the stateless default and the Emergency Exit are unchanged.** A hub does not store conversations by default (see Retention).
- **Caps.** The hub enforces its own daily cap per paired device; Nenya's counters do not see hub traffic.
- **Crisis, harm and distress are handled exactly as today**, from the same shared modules. A hub operator must not be able to turn them off from the page.

### Retention and the operator
The operator is a data controller in practice. The hub image ships with logging **off** (no request bodies, no model output on disk), and the operator documentation says what turning it on means. A hub that logs conversations is a different product and needs its own Terms.

---

## Option 1: the hub serves the whole app
**Shape.** The hub runs a small web server that serves the site's static build and proxies `/api/coach` to the model server through the hub wrapper. People on that network open the hub's address.

**Why it is the simplest.** The browser sees one origin, so the strict policy stays strict: `connect-src 'self'` (netlify.toml), `worker-src 'none'`, no third-party loads. There is no mixed-content block, no CORS, and no Private Network Access preflight.

**What it takes.**
1. **Hub image.** A single repeatable setup: the static build (a release artifact of this repo), the wrapper, and the model-server settings. The build is the same hashed assets the site ships, so the footprint and `tests/assets.test.mts` rules hold.
2. **HTTPS on a local name.** Browsers treat plain http as insecure and disable features (clipboard, some storage, service-worker-style behaviour); the app's microphone/speech and print paths need a secure context. Options, in order: a certificate for a name the operator owns (a real domain with a DNS challenge), a locally trusted CA installed on each device (workable in a managed clinic, not for visitors), or `localhost` only (one machine). **Decide before building:** this is the hard part of option 1 for non-technical hosts.
3. **Pairing and access.** No accounts. Either the network is the boundary (only people on the hub's Wi-Fi can reach it), or a link/QR with a rotating token gates it. Default: network boundary plus a rate limit per client, token optional.
4. **A site flag.** The pages need to know they are running on a hub: the provider label, the hub name, and the consent text change. A build-time or `/api/coach?modes` signal, not a hostname guess.
5. **Updates.** The operator updates the image; Nenya publishes versions and a checksum. The hub shows its version in the About page.
6. **What spokes lose.** They run the hub's pinned version of the site, not nenya.biz's latest, and they get no Turnstile (it needs a Cloudflare round-trip); the hub's own rate limit replaces it.

**Effort (rough):** the hub wrapper and image are the bulk; the guard modules are reused. Mostly integration and documentation, a small amount of new code.

---

## Option 4: peer-to-peer (WebRTC)
**Shape.** The person opens nenya.biz (the normal hosted page). The page opens a WebRTC data channel to the hub and sends the conversation turns over it; the hub answers with the model's reply. Traffic stays on the local network.

**What it buys over option 1.** Spokes use the **live** site, not a pinned copy, and no TLS certificate for a local name is needed (WebRTC encrypts its own channel with DTLS, so the https page can talk to a hub it has no certificate for). The hub can be a headless process, not a web server.

**What it costs, and the open questions** (each is to be checked, not assumed):
1. **Signalling.** Two sides need to exchange connection offers. With no Nenya server involved, that is done by **showing a code** (QR or short string) on the hub and scanning/typing it on the spoke, and the same back. This is serverless and is the only variant that keeps "Nenya sees nothing". It is more steps for the person. A convenience variant would use a Netlify function as a mailbox for the offers, which means Nenya's server sees that a pairing happened (not the words); that needs a data-register row and Terms mention.
2. **STUN servers.** WebRTC normally asks a public STUN server (often Google's) for the device's public address. On one local network it is not needed: devices connect by their local addresses. **Rule:** configure no STUN or TURN server, so the page loads nothing from other sites and the Terms line holds. The trade is that the connection works only inside one network.
3. **Same-network limits.** Many guest and school Wi-Fi networks isolate clients from each other, and browsers hide a device's local address behind a random `.local` name. Whether a spoke can find the hub then depends on mDNS working on that network. **Measure on real networks** before promising it.
4. **The content-security policy.** `connect-src 'self'` does not clearly govern WebRTC connections (it is the data channel, not a fetch). Whether the policy needs to change, and in which browsers, is **to verify**; the policy must not be loosened to make this work without the owner's say-so.
5. **A native hub process.** A browser tab cannot be the hub; the hub needs a WebRTC library in a small program (for example a Node or native data-channel library). That is code Nenya does not have today and must pick, test and keep patched.
6. **Message size and streaming.** A coach turn is a few kilobytes; a data channel handles that. Streaming tokens back is possible but optional.
7. **The guards.** Same as above, with the browser side run in the page and the server side in the hub program.

**Effort (rough):** noticeably more than option 1, mostly the native peer, pairing UX and cross-network testing. Higher risk of "works at my desk, fails in their building".

---

## Comparison
| | Option 1: hub serves the app | Option 4: peer-to-peer |
|---|---|---|
| Runs the live site's latest version | No (pinned copy) | Yes |
| Needs a TLS certificate for a local name | Yes, the hard part | No |
| Keeps the strict site policy | Yes | To verify |
| Works across the guest/school Wi-Fi problem | Yes (ordinary http(s) on the LAN) | Depends on the network |
| Pairing steps for a person | None or one link | A code each way |
| New code Nenya must own | Wrapper + image | Wrapper + native peer + pairing |
| Third-party loads | None | None (no STUN) |
| Nenya's servers see | Nothing | Nothing (code exchange) or pairing events (mailbox) |

**Recommendation.** Build option 1 first, behind the hub gate above (guards on the hub). Treat option 4 as a second phase that starts with the measurements in its items 3 and 4 on three real networks, and only proceeds if they pass.

## Terms, pages and records (owner approval needed before any wording changes)
- **Terms:** a section for hubs (who the host is, that the host reads the conversation, that Nenya does not and cannot, no retention by default, what the operator may change); Section 15 stays about the hosted coach.
- **Pages:** About text for the provider label; a hub consent screen before the first message; the data register gets a row for hub operators (no Nenya processing) and, if the mailbox variant is ever used, a row for pairing events.
- **Operator document:** a one-page "what you take on by hosting this", including logging off by default, who to tell if something goes wrong, and that the safety checks cannot be disabled.

## Decisions for the owner
1. Is a hub allowed to serve people the operator does not know (a public library) or only members of a known group? It changes the consent and the abuse story.
2. Certificates for option 1: a domain-based certificate the operator owns, a managed local CA, or `localhost` only?
3. Pairing: network boundary only, or a link/QR token as well?
4. Option 4 signalling: codes only (no Nenya server) or the mailbox variant?
5. Does the hub use the 26B (a 24–32 GB machine) or E2B (a laptop) for its first version? The answer decides what the guards must carry (see `outer-layers-scope.md`).
6. Who is the first pilot host, if any? A pilot with one real place answers the Wi-Fi and concurrency questions faster than any lab test.

## Before building anything
1. Measure concurrency on a 24–32 GB machine: replies per minute for 1, 3 and 6 simultaneous people.
2. Confirm the guards run end to end with no Netlify in the path (a test harness using the same shared modules).
3. Check the Terms for what "the site loads nothing from other sites" covers, so the hub's own origin is described correctly.
