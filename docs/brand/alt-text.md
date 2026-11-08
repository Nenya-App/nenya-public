# Alt text for Nenya's images

One written set, used by the site (`src/lib/altText.ts`, which a test keeps identical to the quoted lines below) and by the marketing posts, so they cannot drift apart. Nothing here is private.

## Rules the descriptions follow
- Say what it is first, then its shape and arrangement. Not mood.
- Mention color only where it means something.
- No "image of" or "logo of" padding, no file names.
- Do not repeat words that are on the page right beside the image.
- Decorative images get an empty `alt=""`, never a file name.
- Pictures the visitor makes (drawings, the body map) cannot be described by us; the page gives a text version instead.

## The logo

**Short** (the large logo on the welcome page, link previews, posts):
> Nenya logo: a faceted rainbow gem at the center of two interlaced six-petaled flowers, gold and cream, ringed by sixteen colored orbs.

**Short, without the orbs** (the welcome logo when the orbs are turned off):
> Nenya logo: a faceted rainbow gem at the center of two interlaced six-petaled flowers, gold and cream.

**Long** (the About page that explains the name, a press kit, a "describe this image" note):
> The Nenya emblem. At the center is a hexagonal gem whose facets show rainbow colors. Around it, two six-petaled flowers drawn in thin gold and cream lines weave over and under each other. A ring of sixteen small orbs surrounds the flowers, each a different soft color: purples, greens, blues, yellow, orange, red and pink. On the site the orbs slowly change color and the glow follows the breathing rhythm.

**Header and repeated use:** empty (`alt=""`). The logo sits beside the word "Nenya" or inside a button that already has a name, so reading it again adds noise. Where the logo is the only thing in a link, the link carries the name ("Nenya, home").

## Marketing variants
Dark with glow, dark clean, transparent, and for light backgrounds all use the short text above. Say the background only where it matters to the post ("on a light background").

## Other images
| Image | Alt text |
| --- | --- |
| Netlify badge in the footer | Deploys by Netlify |
| Fractured Atlas donate button (inside a link) | Donate now at Fractured Atlas! |
| Link-preview image (`og:image:alt` in `index.html`) | the short logo text, above |
| The visitor's freehand drawing, present state | Your freehand drawing for the present state. We cannot describe your drawing; your written answers are listed above. |
| The visitor's freehand drawing, wish state | Your freehand drawing for the wish state. We cannot describe your drawing; your written answers are listed above. |
| The visitor's body map picture | Your body map as a picture. The same marks are listed below as text. |

## Known gap
PDF and PNG exports are not tagged for screen readers (the PDF library does not tag images or structure). They are listed in the audit checklist as a known gap, not claimed as accessible.
