# Scope: a terms agreement that is carried through a visit and into what the person signs

Status 2026-11-10: **scoping only, nothing built.** From the owner's request: carry the timestamp of the person's agreement to the Terms through their visit, put it in the verified transcript and in any later agreement, tie it to the session as it changes, clear it when they leave, and keep it only if they choose. The owner also suggested a hashed IP address. Related: `docs/drafts/transcript-contribution-terms-draft.md`, `docs/drafts/terms-transcripts-draft.md`, `src/lib/deviceMemory.ts`.

## What already does part of this
| Piece | What it does now | What is missing |
| --- | --- | --- |
| `nenya.terms` (`deviceMemory.ts`) | Remembers the **date of the Terms the person agreed to**, on the device, only while "Remember on this device" is on. Never sent anywhere. | It is a date only; it is not carried through the visit when Remember is off; it goes into nothing the person signs. |
| **Session colors** | The temporary label the person makes by picking colors; it changes when they pick new ones, lives in the page, is sent with each coach message, and is printed in a signed transcript ("Session colors: a temporary label, not an account"). | It is not tied to the agreement. |
| The signed transcript | Signed by the site when the conversation ends; carries the colors, the site's own messages, build and model. | It says nothing about the Terms. |
| The consent receipt (new) | Signed when a conversation is sent; carries the choices, the 18+ statement and a **terms wording version**. | It has no record of the agreement to the site's Terms. |
So the **session ID the owner describes already exists: the session colors.** What is new is the agreement record and carrying it through.

## The design I recommend
1. **A terms receipt.** When the person first agrees (a button, such as "I understand, start" in the coach, or the first place the site asks), the page asks the site to sign a small statement: *the Terms version (their effective date) and the time, by the site's clock.* The site stores nothing and records no address. The page holds the signed statement. (A time from the browser alone can be faked and should not go inside a signed document; a site-signed one can be trusted by anyone who checks it.)
2. **Held for the visit, cleared on exit.** It lives in the page and in the tab's session storage, which the browser clears when the tab closes. **Emergency Exit** and **Forget me** clear it at once. The same record is kept longer **only if the person turns on "Remember on this device"** (the existing switch, extended from a date to this record); it is never sent anywhere except as below.
3. **Carried into what they sign.** (a) A **signed transcript** includes it inside the signed bytes ("Terms agreed: version, time"), shown in the readable copy and on the verify page; (b) the **consent receipt** for sending a conversation copies it; (c) **any later agreement** on the site (a report, a feedback form, a take-back, a future contributor step) copies it too. Each later agreement also adds **its own** time and the session colors current at that moment, so a person's chain of agreements is readable and each is separate.
4. **Followed by the session colors, not an ID.** The colors change as they are picked; each document records the colors as they stood **when it was made**, so there is nothing to "replace" and nothing that follows them from one visit to the next.
5. **No new identifier.** The terms receipt has **no random visit ID**: the signature already binds the version and the time. A visit ID would be a new random identifier on every document the person makes, linking them, which the current Privacy text says the site does not have ("there are no random identifiers").

## The hashed IP: I recommend against it
- **A hash of an IP address is not anonymous.** Addresses have so few possible values that a plain hash can be reversed by trying them all; a hash with a secret key is safer but is still a **persistent identifier**: it would tie together every transcript and receipt that comes from the same connection, across visits.
- **It would sit inside documents the person holds and sends**, including the copy that reaches Nenya and the owner's inbox, and it contradicts the promises that nothing identifies the person ("no accounts", "anonymous daily counts", "nothing that identifies you").
- **It adds little as evidence of consent.** What shows someone agreed is the version, the time and the action, signed by the site. Addresses are shared (homes, offices, VPNs, phone networks) and change, so they prove little about a person.
- **The site already keeps a keyed hash of the connection for the daily allowance**, briefly, on the server, never in anything the person receives. That is the right place for it.
- If a lawyer says an address is needed for some purpose, the least harmful version is a **keyed, truncated hash kept only in the server's short-lived consent record, never inside the person's files**, with a Terms line saying so. I would not put it in the signed transcript.

## What changes in the code (not started)
`src/lib/termsReceipt.ts` (sign and verify, in the style of `consentReceipt.ts`); a small function route to sign it; `deviceMemory.ts` and the welcome and coach consent steps (hold it, clear it, the Remember switch); the transcript's signed `meta` and the verifier (`signedCheck.ts`, the verify page, the readable copy; a **format change** that older transcripts do not have, and that the checker must still accept); the consent receipt; the reports and any other forms; the Privacy and Terms lines; tests for each.

## Decisions for you
1. **No hashed IP**, as above? (Or a lawyer's reason for one.)
2. **No visit ID**, only the site-signed version and time?
3. **Where the agreement is first asked.** The site is browsable by anyone with no agreement. I suggest the first explicit step that needs it: starting the coach, and sending anything. Do you also want a one-time note at the Welcome screen, or none?
4. **Session storage** (cleared when the tab closes) versus memory only (cleared on reload)? I suggest session storage, so a reload does not lose it.
5. **A transcript format change** so the signed file can carry the agreement. Older transcripts stay valid and simply say "no terms agreement recorded."
