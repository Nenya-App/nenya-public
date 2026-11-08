# Signed coach-demo transcripts

When a `/coach` demo conversation finishes, the visitor can download a **signed transcript**. This
page explains what the signature does and does not prove, and how to verify one.

## What it proves

- The transcript is exactly what Nenya's server saw and produced. Each reply carries a server-signed
  "ticket" that binds the whole conversation so far, and a receipt is issued only if the transcript
  matches the last ticket. A reply cannot be edited, and a conversation cannot be cut or reordered,
  without the receipt failing.
- The conversation was signed on the date and time in the receipt (the server's clock).
- Whether the conversation was complete (`closed`, `exchanges`) and which version of the coach wrote the replies (`build`, `model`, `instructions`, a fingerprint of the instruction text) are inside the signature too (version 3, below). A partial transcript therefore says it is partial, and it cannot be cut down from a complete one without breaking the signature.

## What it does not prove

- That the person typing was who they say they are. It is not an identity check.
- That a visitor's own messages are what they "really meant". The page replaces some identifiers with
  placeholders before sending, and the signed text is the text as sent.
- That the model's replies are good, safe, or accurate. It proves only that they are the replies given.

## Privacy

Signing sends the conversation to the server once more so it can check the ticket and sign a hash.
The conversation is not stored and message text is not logged. What is kept: a plain daily count of
receipts issued, by signing key, and, for 30 days, each receipt's hash (a fingerprint that cannot be
turned back into the conversation) so duplicates can be recognized. The signed file stays with the visitor.

If a visitor chooses "Send to Nenya", they are shown exactly what will be sent first. Only a signed
transcript can be sent: the report function (`/api/report`) checks the signature and that the key is
Nenya's before anything is forwarded, and an unsigned or altered transcript is refused. A genuine one is
rebuilt as readable text from the signed transcript itself and reaches us through a separate Netlify form
with the signed file attached, the key id, whether the receipt is in the 30-day log, and a `checked` value
only the function can produce. The function sees the transcript on its way through and does not keep it.

## The signed file

`nenya-coach-transcript-<first 8 characters of the hash>-<YYYYMMDDTHHMMSSZ>.json` (the readable copy ends `.txt`; an unsigned copy has `unsigned` in place of the hash code):

```json
{
  "transcript": {
    "v": 3,
    "session": { "color1": "#7A9B9E", "color2": "#DAC682" },
    "meta": { "closed": true, "exchanges": 5, "build": "…", "model": "…", "instructions": "…(16 hex)" },
    "messages": [{ "role": "user", "content": "…" }, { "role": "assistant", "content": "…" }]
  },
  "receipt": {
    "version": 3, "algorithm": "Ed25519", "keyId": "…", "publicKey": "…(base64 DER SPKI)",
    "hash": "…(SHA-256 hex)", "issuedAt": "2026-10-31T18:02:11.000Z", "signature": "…(base64)"
  }
}
```

- **hash** is SHA-256 of `JSON.stringify(transcript)`, exactly as written above (keys in that order).
- **signature** is Ed25519 over the UTF-8 text `nenya-coach-transcript-v3\n<hash>\n<issuedAt>` (`v2` for the older version 2 files, which have no `meta` block and verify the same way).
- **session** is the visitor's two chosen colors. They are a temporary label for the conversation, bound
  into the signature. They are not an account or proof of identity, and two visitors can pick the same pair.
- **context** appears (between `session` and `messages`) only if a future version lets a visitor share a
  summary of their reflection with the coach. The current demo never sends one, so it is absent. If present, it is part of what is hashed and signed.
- **meta** (version 3): `closed` is true when the conversation reached its final exchange; `exchanges` is how many
  it holds; `build` is the site version that produced it (`unknown` if the host does not provide one); `model` is the
  model that wrote the replies; `instructions` is the first 16 hex characters of a SHA-256 over every fixed instruction
  the coach is given (not the private method notes). None of it identifies a person.
- **keyId** is the first 16 hex characters of SHA-256 of the `publicKey` string.

The readable `.txt` copy carries the same signed file at its end, in a marked block (`-----BEGIN NENYA SIGNED
TRANSCRIPT-----`), so the text above it can be checked against the signed transcript: if the readable text is edited,
the check says so.

## Verifying

**In a browser:** open https://nenya.biz/verify/ and choose the `.json` file or the readable `.txt` copy (or paste it). The
check happens on your device; nothing is uploaded. It reports whether the file is genuine and unedited, the date,
the key id, the signed facts, and whether that key is one of Nenya's published keys (below). A file signed by a
different key, such as a test site's, still checks as intact but is flagged.

**From a terminal:**

```bash
node scripts/verify-transcript.mjs transcript.json <published-key-id>
```

It prints `VALID` with the date, or says why the file is not valid. Passing the published key ID
matters: otherwise anyone could sign a made-up transcript with their own key. The official key ID:

> **Key ID: `579b407dc600fa7d`** (read from https://nenya.biz/api/coach?key and recorded 2026-11-04)

Transcripts signed by a staging or preview site use a different key and will not verify against this ID. That is intended.
When the key is rotated, add the new ID here and keep the old ones listed below.

| Key ID | Status |
|---|---|
| `579b407dc600fa7d` | current |

The running site also serves its public key at `/api/coach?key`, but check the key ID against this
file, which lives in the repository's history.

## Setting up signing (site owner)

1. Create a key and copy the single line it prints:

   ```bash
   node -e "const {generateKeyPairSync}=require('crypto');process.stdout.write(generateKeyPairSync('ed25519').privateKey.export({type:'pkcs8',format:'der'}).toString('base64'))"
   ```

   (This uses Node because the `openssl` that ships with macOS cannot create Ed25519 keys.)

2. In Netlify, add an environment variable `COACH_SIGNING_KEY` with that value (mark it secret;
   Production context; Functions scope). Redeploy.
3. Open `/api/coach?key` and record the `keyId` above and commit this file.

Without `COACH_SIGNING_KEY`, transcripts can still be downloaded and shared, but unsigned.

Rotating the key: generate a new one and redeploy. Old transcripts still verify against the key ID
recorded in their own receipts, so keep earlier key IDs listed here.
