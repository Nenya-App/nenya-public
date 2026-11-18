# A running tally of the needs and feelings that come up (scope, owner idea 2026-11-18; nothing built)

**The idea (owner).** Keep a running tally of the topics (feelings and needs) as they come up, in server-side or browser-side storage. Together with the "one to three needs" recommendation (`src/lib/needFocus.ts`), a tally could show what keeps coming back.

## What the Terms and code promise today
- "We do not store your messages or the replies"; the page keeps the conversation in the tab only. By default the only thing kept on the device between visits is one timestamp after a coach conversation; "Remember my settings on this device" keeps display settings and the agreement.
- Our own daily totals are numbers only and "We never count what you type, draw or choose" (Terms, Section 13). A per-word count of needs would be a count of what people said, so **a server-side tally of topics, even without any identifier, breaks that sentence** and would need the Terms and the counts promise changed, a new effective date, and the owner's decision that it is worth it.

## Three places a tally could live
| | A. In the page, for this conversation only | B. In the browser, kept between visits | C. On the server |
|---|---|---|---|
| What it holds | needs and feelings named so far, as the five exchanges go (state in the page; never stored) | the same, per device, across visits | counts of words across all visitors |
| Privacy | nothing stored; gone with the tab | a new thing kept on the device; sensitive (it describes a person's inner life) | a new category of data we hold; breaks the "never count what you choose" promise |
| Terms | none (it is part of the conversation the page already shows) | a new sentence under "Remember my settings", off unless chosen; the tray and the Terms-first panel already use a remembered-settings switch | rewrite of Sections 13 and 15 |
| Use | a quiet "what has come up so far" strip; feeds the summary and the one-to-three recommendation | "what keeps coming up across visits", only if the person asks to remember | aggregate learning about what people bring (what the owner may want to know) |
| Risk | low | a shared or lost device shows someone's needs; needs a "forget" button and clear wording | re-identification risk is low for single words but the promise changes; legally and ethically the heaviest |

## Recommendation
1. **Build A first** (page state only): the five-exchange conversation keeps a list of needs and feelings named so far, shown to the person as an option and used by the summary and the focus recommendation. It needs no Terms change.
2. **B only with consent:** tied to the existing "Remember on this device", off by default, with "Forget me" clearing it, and a Terms sentence. Wait until A has been read in use.
3. **No C** unless the owner decides the aggregate is worth changing the promise; if it ever is, count only the CNVC family names (a dozen families, not each word) and never a combination.

## Decisions for the owner
1. Is A (this conversation only) enough for now?
2. Should B exist at all, and under "Remember on this device"?
3. Is C ever acceptable, and if so at what grain?
