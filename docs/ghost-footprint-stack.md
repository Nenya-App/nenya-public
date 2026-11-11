# The ghost-footprint stack

Start with `docs/HANDOFF-2026-11-11.md`.

Status (2026-11-11): **the parts below marked "built" exist and are tested, and everything new is off by default.** No
visitor sees a change until a switch is turned on and the screens and Terms are written. This document scopes the whole
stack: what is built, what is left, and in what order.

The aim: the most ecologically light version of Nenya that still offers a real choice between **witnessed** conversations
(Nenya can read, check and sign them) and **sealed** ones (Nenya cannot read them at all), for one person with the coach
and for two people in partner practice.

## The principle

Most of Nenya's footprint is decided by three things, in this order (measured with `npm run footprint`; see the table at
the end):

1. **What a first visit downloads.** The gem sprite was 809 KB of a 1.1 MB first visit. The live gem replaces it with 4 KB
   of code.
2. **Whether an AI model is called at all, and how big it is.** A whole five-exchange conversation with Nenya's small model
   is about the cost of one or two prompts to a large AI service. Turns answered by the site's own code cost nearly nothing.
3. **The screen.** After the first visit, the visitor's own screen uses more energy than the network and the servers.

So the stack keeps everything on the device that can be, uses the smallest model that does the job, and asks a server only
for what only a server can do. It does **not** move the AI onto the device to save energy: a model download (0.4 to 1 GB)
costs as much as hundreds of server conversations. On-device AI is a privacy option for capable devices, and is labelled
as the heaviest choice.

## The modes

Described once in `src/lib/privacyModes.ts`, so every screen says the same true things.

| Mode | Who can read the words | Checks run | Can Nenya sign a record? | Status |
|---|---|---|---|---|
| Witnessed (the coach today) | Nenya's relay, in memory; the model's enclave | On the device and on the server | Yes | Live |
| Sealed | The model's enclave only | On the device only | No | Built, off (`COACH_SEALED=on`) |
| On this device | No one | On the device | No | Planned |
| Partner practice | The other person only | On each device | No | Channel built, off (`CELL_ENABLED=true`); no screens yet |

Witnessed and sealed are a real trade: a sealed conversation cannot become a Witnessed Encounter, because Nenya never saw
it. The screens should offer the choice per conversation and say so.

## Components

### 1. Live gem — built (see `docs/live-gem.md`)
- `src/lib/gemCut.ts`, `src/lib/gemRenderer.ts`, `src/app/components/SpectralGem.tsx`, the `/bench/` page.
- **New today:** without a chosen quality, the gem starts at the device's tier and steps down to the low setting if its
  first frames are slow (more than 8 ms on average, after two warm-up frames).
- **Left:** tune on the bench, copy the settings into the defaults, set `GEM_ENGINE = 'live'` in `src/lib/gemSprite.ts`.

### 2. Device profile — built
- `src/lib/deviceProfile.ts`: reads data saver, connection type, memory, cores, reduced motion, WebGL2 and WebGPU once,
  and returns `lite`, `standard` or `capable`, with the reasons. Nothing is stored or sent.
- `lite` (older or smaller phones, data saver, slow connections): low gem quality, nothing optional fetched early, the
  coach on the server. Only `capable` may later run the coach on the device.
- **Left:** use `prefetch` to hold back optional downloads (the About pages, the colour-name list) on `lite` devices.

### 3. Sealed coach — built, off
- **Browser:** `src/lib/sealedCoach.ts`. It checks the enclave's attestation with a nonce it makes itself, encrypts each
  message for the enclave (secp256k1, HKDF-SHA256, AES-256-GCM, the same protocol as Venice's), and opens the reply with
  a one-time key. Before encrypting, it runs the crisis, identifier and instruction checks on the device. After opening, it
  runs the reply guards (infrastructure, persona, names). The secp256k1 code comes from the audited `@noble/curves`.
- **Relay:** `handleSealed` in `netlify/functions/coach.mts`, with `attestationFor`, `checkReport` and `sealedChat` in
  `src/lib/veniceE2ee.ts`.
  - It shares the coach's origin check, rate limit, daily cap and per-connection allowance.
  - It binds a five-exchange ticket to the encrypted messages, and writes and encrypts the system instruction itself.
  - It only encrypts that instruction to an enclave key it has checked itself, so a page cannot obtain the private
    instruction by sending its own key.
  - It never reads, logs or stores message text.
- **Tested:** `tests/sealed-coach.test.mts` (25 checks). A full five-turn conversation goes through the real relay
  against a fake enclave. It checks that the browser's and server's protocol code interoperate, that the relay never
  receives readable text, that the instruction goes only to the checked key, and that the switch is off by default.
- **Also fixed:** the server now checks that an enclave key is a real curve point, not just the right length.
- **Screens — built:** `src/coach/ModeChooser.tsx` (shown only when the server reports sealed mode on, via
  `/api/coach?modes`) and `src/coach/SealedChat.tsx`, which says there is no signed record or shared reflection.
- **Terms — drafted, not applied:** `docs/drafts/terms-sealed-and-partner-draft.md`.
- **Left, in order:**
  1. Check the Intel TDX quote and NVIDIA evidence in the browser, before the word "end-to-end" is used without
     qualification. Open-source verifiers exist (some compiled to WebAssembly); this needs `'wasm-unsafe-eval'` in the
     Content Security Policy.
  2. Choosing notes by topic is not possible in sealed mode; the relay uses the general notes only.

### 4. Partner practice channel — built, off
- **Crypto:** `src/lib/cellCrypto.ts`, which uses only the browser's own WebCrypto, so it needs no library.
  - The code is 80 secure random bits, shown as `XXXX-XXXX-XXXX-XXXX` with no look-alike letters.
  - The code gives a mailbox name (all the server sees) and an authentication key (never sent). Each side's one-time
    P-256 key is tagged with that key, so no one without the code can sit in the middle.
  - Each direction has its own key chain, moved on with every message (forward secrecy). Altered, replayed and
    out-of-order messages are refused.
  - Every message carries a franking commitment, so a reported message can be proven to have been sent while unreported
    messages stay unreadable. Both people see two safety colours to compare.
- **Client:** `src/lib/cellClient.ts`.
  - It makes or joins a cell, connects, and sends and receives messages.
  - It checks every incoming message for crisis language on the reader's device, and handles reporting and closing.
  - Polling is adaptive: every 1.5 s after activity, easing to 15 s when quiet, and stopped while the tab is hidden.
- **Mailbox:** `netlify/functions/cell.mts` at `/api/cell`, using Netlify Blobs with strong consistency.
  - It holds only ciphertext. There are two seats, each taken once with a create-only write, so no third person can join.
  - It enforces sequence numbers and caps: 300 messages per side, 12 KB per message.
  - Either person can close the cell, which deletes it. Nothing outlives three hours: the mailbox enforces this, and so
    does the hourly `cell-cleanup.mts`.
  - Verified reports are kept in the private store, without the mailbox name.
  - It is off unless `CELL_ENABLED=true`.
- **Also:** the scripted preview's code generator now uses the same secure code (it used `Math.random`).
- **Tested:** `tests/cell.test.mts` (33 checks). These include two clients holding a conversation through the real
  function, a third person refused a seat, a crisis message caught on the reader's device, and a report verified while
  an altered report is refused. Closing, expiry and the hourly cleanup are also covered.
- **Screens — built:** `/cell` (`src/cell/CellPage.tsx`): make or join, compare colours, the conversation, pause (by
  either person, and automatically on a crisis flag), report, close. The About page links to it only when
  `/api/cell?status` says cells are open. The scripted preview stays as it was.
- **Terms — drafted, not applied:** `docs/drafts/terms-sealed-and-partner-draft.md`.
- **Left, in order:**
  1. "Send with AI" and "receive translated" go through the witnessed or sealed coach route, per person, with the original
     always kept in the message (the `assisted` field is already in the format).
  2. The owner panel for verified reports, and their keeping time.
  3. Decide the accountability question: revoking access after verified abuse needs some kind of identity.
  4. Later, for the lightest version: a direct WebRTC channel (only the introduction through a server). It needs a TURN
     relay for some networks (a third party to disclose) and a change to `connect-src`.

### 5. Footprint measurement — built
- `src/lib/footprint.ts`: transfer (both Sustainable Web Design versions, as a range), small-model inference, function
  calls and the device screen. Every assumption is a named range with its source.
- `scripts/footprint.mjs` (`npm run footprint`, or `--json`) measures the built `dist/` and prints the table below.
- **Tested:** `tests/ghost-footprint.test.mts`.
- **Left:**
  1. Log token counts per coach turn (counts only), to replace the estimate of 17,500 prompt tokens per conversation.
  2. Ask Venice for the enclave's hardware and region.
  3. Measure device energy on a real older phone (Android Perfetto, or a Mac's `powermetrics`), with the live gem on
     and off.
  4. Confirm the per-gigabyte figures with CO2.js before citing anything.

### 6. On-device model — planned, not built
- Only for `capable` devices, on Wi-Fi, with the download size shown and a one-tap delete.
- Candidates: Qwen3 0.6B or 1.7B (Apache 2.0) through WebLLM or transformers.js.
- It needs `worker-src` and `'wasm-unsafe-eval'` in the Content Security Policy, and self-hosted model files.
- It's the heaviest option, and `privacyModes.ts` says so.

## Switching things on, safely

1. **Sealed coach:** set `COACH_SEALED=on` for a deploy preview only (Functions scope). The coach screen still sends
   witnessed messages until the choice is built, so nothing changes for visitors.
2. **Partner practice:** set `CELL_ENABLED=true` for a preview. The endpoint then works, but no screen uses it yet.
3. **For production:** first the screens, the Terms (through the archive process), and a check of the admin numbers.
   The new counts are `coach.sealed.*`, `cell.opened` and `cell.report.verified`; they are counts only, with no content.

## The numbers (`npm run footprint`, build of 2026-11-11)

| Task | Option | Energy (Wh) | CO₂e (g) | Notes |
|---|---|---|---|---|
| First visit | Today: sprite gem | 0.33 – 0.89 | 0.16 – 0.39 | The sprite is most of it. |
| First visit | Live gem | 0.086 – 0.23 | 0.043 – 0.10 | The gem is drawn on the device instead. |
| Return visit | Any | 5.1e-4 – 0.0014 | 2.5e-4 – 6.1e-4 | Everything else is cached for a year. |
| 10-minute check-in | Phone | 0.17 – 0.50 | 0.050 – 0.25 | All on the device; the screen is most of it. |
| Coach conversation (5 exchanges) | Witnessed | 0.061 – 0.59 | 0.021 – 0.26 | Inference is most of it; the prompt is resent every turn. |
| Coach conversation (5 exchanges) | Sealed | 0.088 – 0.66 | 0.034 – 0.30 | One more call (the enclave check) and larger requests. |
| Coach conversation (5 exchanges) | Large general AI service | 1.2 – 1.7 | 0.50 – 0.75 | Published per-prompt figures, five prompts. |
| Partner cell, 20 minutes | Mailbox, fixed 1.5 s polling | 0.61 – 4.0 | 0.25 – 1.8 | Two people polling every 1.5 s. |
| Partner cell, 20 minutes | Mailbox, adaptive polling (built) | 0.19 – 1.2 | 0.079 – 0.56 | Slows to 15 s when quiet; stops when hidden. |
| Partner cell, 20 minutes | Direct (WebRTC) | 0.016 – 0.053 | 0.0078 – 0.023 | Not built. |
| On-device model download | Small model (about 0.4 GB) | 120 – 324 | 59 – 143 | A privacy choice, not a greener one. |
| On-device model download | Medium model (about 1 GB) | 300 – 810 | 148 – 358 | As above. |

How to read it:
- **The cell's figures are the least certain.** They depend on the energy of one small function call, which is an
  estimate (0.0002 to 0.002 Wh). That is why the direct WebRTC channel is the lightest option on paper.
- **What is measured:** the first visit without the gem is 284 KB, and these load only when used:

| Loaded only when used | Size |
|---|---|
| The PDF report | 157 KB |
| The coach | 42 KB |
| The About pages | 46 KB |
| The colour names | 44 KB |
| The touch textures (283 small images, loaded only as they scroll into view) | up to 4.5 MB |
