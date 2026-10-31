# Signed coach-demo transcripts

When a `/coach` demo conversation finishes, the visitor can download a **signed transcript**. This
page explains what the signature does and does not prove, and how to verify one.

## What it proves

- The transcript is exactly what Nenya's server saw and produced. Each reply carries a server-signed
  "ticket" that binds the whole conversation so far, and a receipt is issued only if the transcript
  matches the last ticket. A reply cannot be edited, and a conversation cannot be cut or reordered,
  without the receipt failing.
- The conversation was signed on the date and time in the receipt (the server's clock).

## What it does not prove

- That the person typing was who they say they are. It is not an identity check.
- That a visitor's own messages are what they "really meant". The page replaces some identifiers with
  placeholders before sending, and the signed text is the text as sent.
- That the model's replies are good, safe, or accurate. It proves only that they are the replies given.

## Privacy

Signing sends the conversation to the server once more so it can check the ticket and sign a hash.
Nothing is stored and message text is not logged. The signed file stays with the visitor. If a visitor
chooses "Send to Nenya", they are shown exactly what will be sent first, and it arrives like any other
report (a Netlify Forms submission).

## The signed file

`nenya-coach-transcript-YYYY-MM-DD.json`:

```json
{
  "transcript": {
    "v": 2,
    "session": { "color1": "#7A9B9E", "color2": "#DAC682" },
    "messages": [{ "role": "user", "content": "…" }, { "role": "assistant", "content": "…" }]
  },
  "receipt": {
    "version": 2, "algorithm": "Ed25519", "keyId": "…", "publicKey": "…(base64 DER SPKI)",
    "hash": "…(SHA-256 hex)", "issuedAt": "2026-10-31T18:02:11.000Z", "signature": "…(base64)"
  }
}
```

- **hash** is SHA-256 of `JSON.stringify(transcript)`, exactly as written above (keys in that order).
- **signature** is Ed25519 over the UTF-8 text `nenya-coach-transcript-v2\n<hash>\n<issuedAt>`.
- **session** is the visitor's two chosen colors. They are a temporary label for the conversation, bound
  into the signature. They are not an account or proof of identity, and two visitors can pick the same pair.
- **keyId** is the first 16 hex characters of SHA-256 of the `publicKey` string.

## Verifying

```bash
node scripts/verify-transcript.mjs transcript.json <published-key-id>
```

It prints `VALID` with the date, or says why the file is not valid. Passing the published key ID
matters: otherwise anyone could sign a made-up transcript with their own key. The official key ID:

> **Key ID: `[to be filled in after the signing key is created]`**

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
