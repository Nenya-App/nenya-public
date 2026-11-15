# "I was here": a color guestbook (scope, draft for the owner, 2026-11-15)

**The idea (owner):** at the end of a session, a visitor can sign an "I was here" mark with their session colors, and the marks build a color graph over time somewhere on the site, like a guestbook.

## The snag: the session colors are a key
The two session colors (`#7a9b9e.#dac682`) are also the session ID for "Save and return later". Publishing them, with a date, would hand a stranger half of someone's saved-reflection key, and the colors were kept off public pages for exactly that reason. They also say how someone felt (now and wished), which is reflection content.

## Proposed design
- **Sign with one blended color, not the pair:** the midpoint of the two colors, rounded to the nearest of the site's 96 named colors. It cannot be turned back into the pair, it carries the visit's feeling without the details, and rounding makes identical marks common, so a mark cannot single anyone out.
- **When:** a quiet "Leave a mark: I was here" at the end of a reflection and at the end of a coach conversation, never during. One mark per visit. Unticked, opt-in, one tap.
- **What is kept:** the color and the day. No time, no connection details, no words. Counted per day in the private store.
- **The display:** "Who has been here", a slow ring or a band of days, each day a strip of the colors left that day, newest at the edge. A page of its own (`/here`) and a small version on the About page. Static image for reduced motion; a text summary for screen readers ("Today, 12 marks, mostly blues and golds").
- **Limits:** one mark per connection a day (the same one-way daily code the coach uses), and Turnstile when it is on, so the graph cannot be flooded.
- **Taking it back:** a mark is one color among many with no code; it cannot be found again to remove it. Say so before signing ("A mark cannot be taken back, because nothing ties it to you").
- **Terms:** a short paragraph (what is kept, that it is public and anonymous, that it cannot be removed) and a row in docs/data-register.md.

## Decisions for the owner
1. One blended color (recommended), or the pair (only if save-and-return then stops using the colors as its ID)?
2. Where it lives: its own page, the About page, the footer, or the start chooser?
3. Kept for how long: forever as a growing record, or a rolling year?
