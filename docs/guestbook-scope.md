# "I was here": a color guestbook (scope, draft for the owner, 2026-11-15)

**The idea (owner):** at the end of a session, a visitor can sign an "I was here" mark with their session colors, and the marks build a color graph over time somewhere on the site, like a guestbook.

## The snag: the session colors are a key
The two session colors (`#7a9b9e.#dac682`) are also the session ID for "Save and return later". Publishing them, with a date, would hand a stranger half of someone's saved-reflection key, and the colors were kept off public pages for exactly that reason. They also say how someone felt (now and wished), which is reflection content.

## Decided (owner, 2026-11-15): a dual-color signature, a time-derived guestbook ID, and a 4-color centroid
- **The signature: two colors the visitor chooses**, from the site's named colors, just for the guestbook. A note says not to use the session colors (the key to a saved reflection), and the exact session pair is refused on the device (the session colors are never sent).
- **The shadow ID stays as it is** (random), for Save and return later. A time-derived key would be guessable from the time of a visit, so it is not used there.
- **The guestbook ID: two colors made from the moment of signing**, so they say *when*. Proposed algorithm: the first color's hue walks the year (day of the year around the color wheel), the second's walks the day (time of day around the wheel, in 10-minute steps); lightness and saturation fixed so both stay readable. The guestbook page's own interface is tinted, live, by the current guestbook ID, so it shifts through the day.
- **What goes into the visualizer: the centroid of the four colors** (the two chosen, the two from the moment), one point per signature. The four colors themselves are not kept; a centroid of four cannot be turned back into them. The server computes the time colors from its own clock (so the time cannot be faked) and keeps only the centroid and the day.
- **The visualizer:** every signature's centroid as a point in a 3D color space (rotatable, with the overall centroid marked), lifted from the Apiary's centroid geometry (owner, 2026-11-15: the component may be lifted; only the geometry, no handshakes, Solresol or drift). Still under reduced motion; a text summary for screen readers.
- **Once per session**, one per connection a day on the server, Turnstile when it is on. A signature cannot be taken back (nothing ties it to the person); said before signing.
- Terms paragraph and a data-register row.

## Earlier proposals (kept for the record)
### Its own choice point (superseded the same day)
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
1. ~~Session colors or a blend~~, ~~one color or two~~: decided (above).
2. The renderer: the Apiary has the centroid math (RGBPoint averaging, apiary_v43.py) but no 3D drawing; the site's gem renderer places colored lights in 3D. Which tool is meant, or build a small 3D color-space view?
3. Where the guestbook lives: its own page (`/here`), the About page, or elsewhere.
4. Kept for how long: forever, or a rolling year.
