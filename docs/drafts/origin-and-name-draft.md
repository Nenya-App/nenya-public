# Origin note and Name page: working draft

Status: a draft for the author to cut and rewrite. Nothing here is published. Public voice is the project's, as a witness ("here is what we noticed"). No personal or family history, no Palantir name, no Harp of Móru (decisions of 2026-11-08). Philosophy is shown through the structure, not explained.

## Origin note (draft)

> Nenya began as a refusal. Some technology borrows its names from stories about power, then uses them to watch and to control. We wanted to take a name back and give it the opposite job: a place to rest.
>
> In Tolkien's stories, Nenya is one of the three Elven rings, the ring of water. The One Ring was made to rule the others. These three were made apart from it, and were kept to preserve and to protect, never to command. Whoever carried Nenya held it for others, not for herself, and that was the test. In the same stories there is a place where travelers stop and rest before going on.
>
> Nenya is for the hours before a crisis, when it is hard to ask for help and no one is there. It cannot replace a person, and it says so. You do not have to take our word for any of this. Everything here is built so you can check it.

## Name page (draft)

> *Nenya* means "you may rest here." The name is borrowed from the Elven ring of water in Tolkien's stories, a ring kept to preserve and protect, never to rule. The word comes from the Quenya *nén*, "water." Nothing here is hidden, so you can see for yourself. [What you can check](the About page section)

## What you can check (draft)

Placement (decided 2026-11-08): this list lives on the About page as its own section. The Name page carries only a link to it. The origin note does not repeat the list.

Each line links to where it can be verified. Items marked PENDING are written but must not be published until the thing exists in production.

1. **The code is open.** It is published under the AGPL-3.0, so you can read it, run it and change it. The name and logo are reserved separately, and the repository says so plainly.
2. **Forget me.** One button, in the settings menu and at the bottom of every page, erases what Nenya saved on your device. Emergency Exit erases it and leaves the page.
3. **Emergency Exit.** Leaving is always one click away.
4. **The checks can be wrong.** When the coach ends a conversation, it says that the checks are simple phrase matching and can be wrong, and that ending is not a punishment. PENDING: depends on the distress wording being approved and the break trigger being built.
5. **The pause is yours.** After a break, the rest is one time stored in your own browser. Nothing is sent to Nenya. PENDING: the trigger is not built yet.

## Claim check against the repo and Terms (2026-11-08)

| Claim | Where it is true | Wording constraint |
|---|---|---|
| Open source, AGPL-3.0 | `LICENSE`; Terms section on source code | Say the name and logo are reserved (`TRADEMARK.md`). Do not say "free to use the name." |
| Forget me | `src/lib/deviceMemory.ts` (`forgetMeAndRestart`); Terms Section 19 | Say it erases what is saved on this device. Do NOT say it resets limits: the coach's daily limit is counted on the server and Forget me cannot reset it (Terms). Do not say "nothing is stored anywhere": the host keeps ordinary connection logs and visit statistics (Terms Section 15). |
| Emergency Exit | `src/main.tsx`, `App.tsx`, `WelcomePopup.tsx`; Terms Section 19 | Terms say it erases everything before leaving the page. |
| No accounts | Terms (privacy section): no visitor accounts or profiles | Safe to say. Do not extend to "anonymous": the daily limit uses a one-way code of the connection address, deleted within two days. |
| Messages not stored | Terms Section 21: not stored, not logged by Nenya | Say "we do not store your messages." Do not say "no one can see them": they pass through our server to Venice AI, and the host keeps connection logs. Encryption wording is a separate open item (the prompt is encrypted in our function; it is not end-to-end from the device). |
| Closing note says it is not a punishment | `src/coach/PauseScreen.tsx`; `src/lib/pause.ts` | Live only on dev. In production the site-written distress text is off (`COACH_DISTRESS_TEXT`) until the wording is approved. |
| The pause is one browser timestamp | `src/lib/pause.ts` (`PAUSE_MINUTES = 10`), `PauseScreen.tsx`; Terms Section 19 and 21 | The break trigger is not built; the Terms revision (Section 5, respectful use) is pending. |

## Open items

- Decided 2026-11-08: the ring is named and explained, in the origin note and on the Name page. Facts to confirm against the books before publishing: that Nenya is one of the three rings, made apart from the One, and borne by Galadriel; the Quenya root *nén* (water); the "test" refers to Galadriel declining the One Ring. Describe in our own words. Do not quote Tolkien.
- This is the one place Tolkien is explained, by design: the rest of the site carries the philosophy through structure, not through the myth.
- Length: this draft is short on purpose. A "read more" layer can be added.
- The name and the "protest" framing remain a lawyer's question (trademark and literary estates). Tone is not legal protection. Criticize the design ("technology built to dominate"), not a named company's conduct.
- Every sentence on these pages should stay checkable. The about-Nenya fact-check test (`tests/about-nenya.test.mjs`) already works this way and can cover these lines when they are published.
- Placement is settled: the list lives on the About page, linked from the Name page. Build it into the About overhaul (docs/about-overhaul-scope.md), with a stable anchor so the link survives the rewrite.
