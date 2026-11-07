# Scope: signed transcripts, receipt count and verified reports

Status: scoping only, nothing built. Written 2026-11-06. Read with `docs/coach-transcripts.md` (what a receipt proves and how to verify one today).

## What we want
1. A record that a verified (signed) transcript was made, **not** what is in it. Contents reach us only if the visitor sends them.
2. A way to know a transcript file was not changed after it was signed.
3. Only signed transcripts accepted when a visitor sends one to us; unsigned ones are not wanted.

## Current state (read from the code, 2026-11-06)
- The visitor asks for a signature; the coach function checks the conversation against its last ticket and returns a **receipt**. The downloaded `.json` file holds `transcript` and `receipt` (`hash`, `signature`, `keyId`, `publicKey`, `issuedAt`). `coach-transcripts.md` describes it.
- The readable `.txt` copy repeats the receipt lines but cannot be checked, because the hash is of the JSON, not of the text.
- "Report or send verified transcript" posts the **readable text** to a Netlify Form (`reportSubmission.ts`). Nothing checks the signature at that point, and the text is not machine-verifiable, so **a made-up transcript can be submitted through the same button**. This is the gap.
- Checking a file today needs `node scripts/verify-transcript.mjs`; most people cannot do that.

## Tamper evidence: you already have it, in the receipt
The "something in the metadata" you described is the receipt, and it works like this: the server computes a SHA-256 hash of the transcript and signs the hash and the date with its private key (Ed25519). Change one character of the conversation and the hash no longer matches; change the hash and the signature no longer matches; only Nenya's private key can make a new signature. Nothing else in the file needs to carry the proof.

What does **not** work as tamper evidence: file properties or PDF metadata. They are easy to edit and are not tied to the visible text, so they can be left looking intact while the text is changed. A signature only means something when the checker recomputes from the content and compares. That is why the JSON (where recomputing is trivial) is the verified format.

So the work is to make the proof **easy to check** and to **use it where it matters**:

### 1. A browser verifier
A static page (`/verify`) where the visitor drops the signed file; it recomputes the hash and checks the signature **in the browser**. Nothing is uploaded, and the page counts nothing. It reports VALID with the date and key ID, or says why not, and shows the key ID to compare with the published one. Web Crypto supports Ed25519 in recent browsers, but support varies by version, so tomorrow's first step is to check it in Safari and Firefox, and fall back to a small MIT-licensed library if needed.

### 2. A verification block in the readable copy
The `.txt` gets a clearly marked block at the end holding the signed JSON (compact, base64). The verifier accepts the `.txt` too, checks the signature on the block, and checks that the readable text above matches the text regenerated from the block. Edit the readable part and it fails. This also lets a visitor send or keep one file.

### 3. Verified reports only
Replace the direct form post with a small function (`/api/report`) for transcripts:
- The page sends the **signed JSON** (not the rebuilt text) plus the visitor's note, after the same preview screen as today.
- The function checks size limits; checks `version`, `algorithm` and that `keyId` is one of the published keys (current and earlier, kept in the repo; see `coach-transcripts.md` on rotation); recomputes the hash of `JSON.stringify(transcript)`; verifies the signature.
- **Valid:** it rebuilds the readable text from the transcript itself (so what we read is what was signed) and forwards it to a Netlify Form named for verified transcripts, with the signed JSON attached and a `checked` field. It counts `coach.report.verified`.
- **Invalid or unsigned:** it answers with a short reason code and counts `coach.report.rejected`. It does not keep or log the content.
- **The `checked` field** is an HMAC the function adds using a server secret, over the transcript hash. Netlify Forms are public endpoints, so someone could still post to the form directly, but they cannot produce `checked`, so you filter on it. You can also always run the verifier on the attached JSON; the signature in the file is the real guarantee and the function is a convenience filter in front of your inbox.
- The general "report a problem" form (no transcript) is unchanged. A report type that claims to be a transcript but has no valid signature is not accepted.
- Netlify Forms limits (submissions per month on the current plan) should be checked, since valid reports now arrive through it too.

## The receipt count
- The function that issues a receipt adds one to `coach.receipt.issued.<keyId>` (daily total, by key). It sees the conversation in order to sign it, but the count records only that a receipt was issued and which key signed it.
- **Caveat:** this counts receipts issued, not distinct transcripts. A visitor who downloads twice after reloading the page may be counted twice.
- **Optional, off unless you ask for it:** a daily list of receipt hashes. The hash reveals nothing about the content, and it lets us count distinct transcripts, drop duplicate reports, and answer "did we issue this one?". It is a per-transcript record, so it needs its own Terms wording and a retention rule (suggested: delete after 30 days). Not needed to prove authenticity, since the signature already does.

## Wording changes
- `coach-transcripts.md`: "Nothing is stored" becomes "Nothing is stored except a daily count that a receipt was issued"; describe the verified-only report path and the `/verify` page.
- Terms and Privacy: one sentence on the receipt count and one on the verified report path (content is seen in transit by the function, checked, forwarded to the form, and not logged). Part of the same Terms revision as the other items.
- The page text on the coach: the "Send" button's helper text says only signed transcripts can be sent.

## Later options
- **An independent timestamp** (an RFC 3161 time-stamp authority or a public transparency log) would prove the transcript existed at that time even if Nenya's own clock or key were doubted. Not needed now.
- **An admin list** of verified reports, once the admin owner key exists.

## Tests to write when it is built
- Receipt: the existing checks still pass; counts increment by one per receipt under the right key; no content in the count.
- `/api/report`: valid file accepted; altered message, altered order, altered date, wrong key ID, wrong algorithm, wrong version, missing receipt, oversized file and non-JSON all rejected with a reason and no content logged; `checked` present only on accepted ones.
- Verifier: the same cases; readable copy with edited text fails; the file never leaves the browser (assert no network calls).
- Readable copy: block present; round-trips to the same JSON.
- Existing tests that pin the form post for transcripts are updated, not deleted.

## Open decisions
- Receipt count only, or also the hash list? (Suggested: count only now.)
- `checked` field and separate form: agreed?
- Where the verifier lives (`/verify`, or inside the About pages) and what to call it.
- Whether to keep accepting readable-text-only reports for non-transcript problems (suggested: yes, unchanged).

## Decisions made (2026-11-07)
- **Receipt log: count plus receipt hash.** A daily total of receipts issued by signing key, and a short daily list of receipt hashes kept for **30 days** and then deleted (to drop duplicate reports and answer "did we issue this one?"). Needs its own wording in the Terms (the revision that ships with the counts); the hash reveals nothing readable about the transcript.
- **Verified reports use a separate form with a `checked` field** that only the function can produce; direct posts to the old report form are no longer how transcripts arrive.

## Receipt fields to add (decided 2026-11-07)
The signed content gains a small `meta` block, so these facts are covered by the signature and cannot be changed afterward. The transcript becomes version 3: `{ "v": 3, "session": …, "meta": { … }, "messages": […] }` (keys in that order, as the hash is of `JSON.stringify(transcript)`); the verifier and `scripts/verify-transcript.mjs` keep accepting version 2.
- **`closed`** (true or false): the conversation reached its final exchange. A partial transcript is therefore labelled partial, and a closed one cannot be cut down without breaking the signature.
- **`exchanges`**: how many exchanges the transcript holds (taken from the verified ticket, not from the page).
- **`build`**: the site version that produced the replies (the deploy's commit). To check when building: how to get the version into the function at build time (Netlify's `COMMIT_REF` is a build variable; it may need to be written into a small generated file or set as a constant at build, rather than read at run time).
- **`model`**: the model the replies came from.
- **`instructions`**: a short fingerprint (the first 16 hex characters of a SHA-256) of the instruction text and method notes the coach used, so a reported reply can be tied to the exact configuration. It is a hash, not the text.
- **Deliberately left off:** any IP address, hashed or not (it would stay in every transcript we are sent and outlive the two-day deletion promise), and a per-conversation random ID (skipped for now; the receipt hash list already recognizes duplicates).
- **Nothing here identifies a person.** The Terms say so in Section 21.
- **Tests:** `meta` is covered by the hash (changing `closed` or `build` breaks verification); `closed` is true only for a final exchange and `exchanges` matches the ticket, not the page; version 2 files still verify; the instruction fingerprint changes when the instruction text changes and is stable otherwise.

