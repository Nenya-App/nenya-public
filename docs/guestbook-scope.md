# "I was here": a color guestbook (scope, draft for the owner, 2026-11-15)

**The idea (owner):** at the end of a session, a visitor can sign an "I was here" mark with their session colors, and the marks build a color graph over time somewhere on the site, like a guestbook.

## The snag: the session colors are a key
The two session colors (`#7a9b9e.#dac682`) are also the session ID for "Save and return later". Publishing them, with a date, would hand a stranger half of someone's saved-reflection key, and the colors were kept off public pages for exactly that reason. They also say how someone felt (now and wished), which is reflection content.

## Decided (owner, 2026-11-15): its own choice point
Instead of using the session colors, signing the guestbook is a separate small activity: the visitor chooses the colors for their mark there and then.
They are not the session colors, are not linked to anything else, and are completely anonymous.

- **Choosing:** one or two colors from the site's named colors (the same names and plain descriptions as the Sight gateway), with a live preview of the mark.
- **Once per session.** After signing, the choice point says "You left your mark this visit" and does not offer it again until a new visit.
- **A note about the session ID:** "These colors are only for the guestbook. Please don't use your session colors: those are the key to a saved reflection." If the chosen pair is exactly the visitor's current session pair, the page says so and asks them to choose again (checked on the device; the session colors are never sent).
- **When:** offered at the end of a reflection and at the end of a coach conversation, never during; a quiet link, opt-in, one tap to skip.
- **What is kept:** the chosen colors and the day. No time, no connection details, no words.
- **The display:** "Who has been here": a band of days, each day a strip of the colors left that day, newest at the edge. Static under reduced motion; a text summary for screen readers ("Today, 12 marks, mostly blues and golds").
- **Limits:** once per session on the page; on the server, one mark per connection a day (the same one-way daily code the coach uses), and Turnstile when it is on, so the band cannot be flooded.
- **Taking it back:** a mark has no code and nothing ties it to the person, so it cannot be found again to remove it. Say so before signing.
- **Terms and register:** a short paragraph (what is kept, public and anonymous, cannot be removed) and a row in docs/data-register.md.

## Decisions for the owner
1. ~~Session colors or a blend~~: decided, its own choice point (above).
2. One color or two per mark?
3. Where the band lives: its own page (`/here`), the About page, the footer, or the start chooser?
4. Kept for how long: forever as a growing record, or a rolling year?
