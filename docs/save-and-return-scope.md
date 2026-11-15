# Save and return later: scope (owner's decisions, 2026-11-15)

**The idea:** a visitor can save the reflection in progress on their own device and come back to it, protected by a simple passcode, with Forget me and Emergency Exit erasing it.

## Decided (owner, 2026-11-15)
- **Kept for 24 hours**, then erased on its own.
- **A simple passcode is fine**, but the saved reflection is **encrypted** with it (the long-standing example: "watermelon", from *nen* = water and "speak, friend, and enter" = *mellon*).
- **Password managers may save it**: the passcode field is a real password field, and nothing blocks pasting (WCAG 2.2 3.3.8 Accessible Authentication: remembering a code is a memory test unless a password manager or pasting can help).
- **The "username" is the session ID**: the visitor's two colors as hex codes (`#7a9b9e.#dac682`, the signature the coach already shows), set by the Sight or Sound gateway. If neither has been done yet, a **random hex pair** is made as a "shadow" ID.
- Forget me and Emergency Exit erase it, and so does a "Delete it" button.

## How it works
1. **Saving.** At the end of any finished gateway, or on the review, a "Save and return later" button. It shows the session ID (with a copy button), asks for a passcode, and says plainly: kept on this device only, encrypted, for 24 hours; Forget me and Emergency Exit erase it; nothing is sent to Nenya; without the ID and passcode it cannot be opened, and there is no recovery.
2. **What is saved:** the gateways chosen, every finished gateway's answers, the body map, and the session colors. A half-finished gateway is not saved (its answers live inside that page until it is finished); the save button says "your finished gateways".
3. **Encryption** (the browser's built-in Web Crypto): a key is derived from the session ID and the passcode together with PBKDF2-SHA-256 (a high iteration count, so each guess is slow) and a random salt; the reflection is sealed with AES-GCM. Stored: the salt, the nonce, the sealed data and the expiry time. Not stored: the ID or the passcode.
4. **Returning.** A quiet "Continue a saved reflection" link at `/senses`, shown whether or not anything is saved. It asks for the ID and the passcode (a password manager fills both). A wrong pair and "nothing saved" give the same answer, so the page never tells anyone a reflection exists.
5. **Erasing.** At 24 hours (checked on every visit, so an expired one is gone before anyone could try), on "Delete it", on Forget me, on Emergency Exit, and after a successful return (it is opened back into memory and the saved copy is removed; saving again makes a new one).

## Honest limits (to say on the page and in the Terms)
- A simple passcode stops a glance, not a determined person with the device and time. Because the ID is not stored, a guesser needs both: with a random shadow ID that is a lot of guessing; with colors someone could guess, less. The page says so and suggests a longer passcode if the device is shared.
- Someone who opens the browser's own storage tools can see that something encrypted is saved, though not what it says. The page itself never reveals it.
- It does not follow the visitor to another device or browser.

## Decision still open
**Store the ID, or not.**
- **Not stored (recommended):** stronger (a guesser needs the ID too) and nothing on the page hints that a reflection exists. The visitor needs a password manager, or to copy the ID when saving. Without it, the reflection is gone in 24 hours anyway.
- **Stored and pre-filled:** easier to come back to, but then only the passcode protects it, and a pre-filled ID tells anyone looking that a reflection is saved.

## Changes elsewhere
- **Terms:** Section 16 ("We never save what you write, draw or answer…") gains the exception: only if you choose Save and return later, encrypted on this device under your passcode for at most 24 hours, erased by Forget me and Emergency Exit, never sent to us. Section 17 (no persistent identifiers) notes the session ID is chosen or random and never leaves the device. A same-day revision while the November 15 text is not yet live.
- **Forget me and Emergency Exit:** add the saved reflection to what they erase (tests check both).
- **Switch:** `VITE_SAVE_REFLECTION=on`, staging first.
- **Tests:** encryption round trip; wrong ID or passcode fails the same way as nothing saved; expiry at 24 hours; erased by Forget me, Emergency Exit, Delete and a successful return; nothing about it is sent anywhere; the passcode field allows password managers and pasting; wording at reading grade 8 or below.
