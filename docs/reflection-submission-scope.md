# Public submission of reflections, the signed-transcript way: scope (draft for the owner, 2026-11-15)

**The gap (owner, 2026-11-15):** coach conversations can be signed, verified, sent with the person's own choices (keep, publish, withdraw) and shown on the "witnessed conversations" page after a person reviews them. Reflections from the gateways have no such path: they stay on the device (by design), with a PDF summary the person can keep.

## What it would mean
A person who has finished a reflection could choose to send it, signed, for Nenya to keep or show publicly, with the same consent model as transcripts.

1. **Signing.** Today a reflection never leaves the device. To sign it, the page sends the summary to the site once, on the person's explicit choice; the site signs it (Ed25519, the same key as transcripts) and keeps nothing. The signature proves it came from Nenya's tool and was not changed: what makes a public gallery trustworthy (no invented submissions) and lets the person withdraw it later with the signed file.
2. **What a signed reflection holds.** The gateways done; for each, the choices (colors with their names, surfaces, scents, shapes, melody notes) and any words; the body map. Drawings are images and much larger; leave them out at first.
3. **Sending.** The same choices as transcripts (`src/lib/transcriptPolicy.ts`): keep for a set time, allow reading for improving the site, allow publication, and the showing time. Kept in the private store, deleted by `transcript-expiry`, withdrawable with the signed file.
4. **Before anything is public.** Words are scrubbed for names and contact details again; a person reviews and can edit (as for transcripts); then it appears on a public "witnessed reflections" page, shown as the reflection itself: two colors, a texture, a short melody, a few words, with the month, never the exact date, and no session colors as identifiers (they are the save-and-return ID).
5. **Verifying.** `/verify` accepts a signed reflection as it does a transcript.

## Things to weigh
- **It changes a promise.** "What you enter in the reflection tools never reaches us" becomes "…unless you choose to send it". The Terms and the About pages change; the choice must be plainly separate from everything else.
- **Session colors as the save ID.** A published reflection must not show the two colors as an identifier, or a stranger would hold half of someone's save-and-return pair. (The colors can be shown as part of the reflection only if they are not labelled as the ID; simplest is to leave the pair out.)
- **Moderation.** Text needs the same human review as transcripts; colors, textures and melodies carry little risk.
- **Reuse.** Most of the machinery exists (signing, the private store, consent records, expiry, withdrawal, the review page, `/verify`); the new parts are a reflection format, its renderer, and the public page.

## Decisions for the owner
1. Wanted as described, including the change to "never reaches us" (only on the person's explicit choice)?
2. Drawings included later, or never?
3. One public page for both conversations and reflections, or separate pages?
4. Build after the data hygiene practice (recommended: the new stored type then joins a written register from day one)?

## Update (owner, 2026-11-15): a display and a notice of submission
The owner wants shared sensory reports shown publicly, like the witnessed conversations, with notice of submission.

**What exists now:** "Share mine" on the review page sends the reflection summary privately (kept 90 days, deletion code, alert to the owner without the text; docs/data-register.md). Nothing is shown publicly.

**Proposed build**
1. **Choices when sharing** (the transcript model): keep it private for Nenya to read (today), and optionally "show it on the shared reflections page, without anything that identifies me". Unticked by default.
2. **Review first:** a shared reflection waits on the admin page; the owner reads it, can edit the words (names are scrubbed again first), and approves or declines. Nothing is public before that.
3. **The page:** "Shared reflections" (`/about/shared`, beside the witnessed conversations): each one shown as the reflection itself, the two colors as swatches (not labelled as an ID), a texture name, a short melody that can be played, a scent, a few of the person's words; the month only, never the exact date.
4. **Notice of submission:** the sender sees at once what happens next ("received; a person will read it before anything is shown; nothing is public until then") with their code. On `/my-transcript` the same code shows its status (waiting for review, shown, not shown) and can take it down or delete it at any time. There is no email to the sender: Nenya never asks for one.
5. **Removal:** the code takes a shown reflection down at once; the daily job removes it when its showing time ends (default 90 days, the sender may choose longer).
6. **Signing** (from the scope above) can come later; the review step already prevents invented submissions from appearing.

**Decisions for the owner:** the default showing time; whether the person's own words are shown at all or only the senses; one page shared with the witnessed conversations, or its own.
