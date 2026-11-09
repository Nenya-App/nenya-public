# Scope: renaming the sixteen palettes outwardly

Status: scoping only, nothing changed. Written 2026-11-08 from the owner's note: the Valar palette names should be renamed before the project grows, to avoid any dispute with the Tolkien estate, **at least externally** (what visitors and outsiders see; the code can keep its own internal names for now).

I am not a lawyer, and this is not a legal opinion. It is a plan for removing the names from view, plus the questions a lawyer (or Fractured Atlas's legal resources) should answer.

## The principle
**Separate the id from the name.** Each palette keeps its internal id (today the Tolkien name, used in code and tests); a new `displayName` is what every visitor, screen reader, report, page and public document shows. Nothing stored on a visitor's device or sent anywhere needs to change, because ids stay the same. Later, if the owner wants the code cleaned too, ids can be renamed in one step.

## Where the names are visible (the external surfaces)
| Surface | What shows | Size of change |
| --- | --- | --- |
| The colour picker (`ValarColorPicker.tsx`) | each palette's name as a heading, plus the group "Valar palettes" | one field, 22 mentions |
| The Pantheon of Needs page (`PantheonOfNeeds.tsx`) | the 16 names with their stories, and the word "Valar" | the largest: 36 mentions, and text that tells each as a Tolkien character and not only as a need |
| Our Name & Philosophy page | the ring (Nenya), Galadriel, Fëanor, the Palantíri: the project's identity, not just palettes | **separate decision** (below) |
| About the Designer | 4 mentions (Nienna, "the Valar provide a universal framework…") | small |
| The Sight gateway page | "Browse the Valar palettes" (2 places) | small |
| Settings | "Valar Orbit" (label) | one string |
| The logo and gem components, body map, breathing popout | mostly comments and ids; check any visible text or `aria-label` | small |
| Reports (the PDF and the sensory report) | any palette name a visitor sees on their own report | to check |
| `public/about-nenya.html` and the link previews, JSON-LD | the SEO and sharing pages describe "sixteen Valar archetypes" and name eight of them | rewrite |
| `README.md` | "the sixteen 'Valar' archetypes of need" | one line |
| `docs/` | `valar-color-palettes.md` and others use the names (the repository is public) | rename or add a note, owner's call |
| Alt text (`docs/brand/alt-text.md`) | any description naming a Vala | check |
| Tests | `render.test.mjs`, `critical-ui.test.mts` assert some names | follow the rename |

## Proposed outward names
Each is chosen from the palette's own colour and the need it stands for (`docs/valar-color-palettes.md`), plain English, easy to translate, and not taken from Tolkien. These are a first proposal for the owner to edit.

| Internal id (stays) | Domain | Proposed name | Why |
| --- | --- | --- | --- |
| Manwë | air, clarity, perspective | **Sky** | sky blue, high cloud |
| Varda | stars, hope, illumination | **Starlight** | star gold to white |
| Ulmo | water, flow, intuition | **Tide** | deep ocean to foam |
| Nienna | grief, mercy, self-compassion | **Soft Rain** | silver grey, lavender: tears and mercy |
| Aulë | craft, structure, mastery | **Craft** | stone, terracotta, bronze |
| Yavanna | growth, nourishment, vitality | **Greenwood** | forest to meadow |
| Vána | blossoming, joy, radiance | **Blossom** | spring green, blossom pink |
| Mandos | finality, acceptance, reckoning | **Twilight** | slate and purple at dusk |
| Vairë | memory, narrative, consequence | **Tapestry** | deep teal with woven gold |
| Oromë | action, ethical defence, clear boundaries | **Stride** | forest green and leather |
| Tulkas | strength, vitality, uncomplicated power | **Ember** | warm orange to red-orange |
| Nessa | rhythm, movement, play | **Rhythm** | coral, rose, warm pink |
| Irmo | imagination, creative expression | **Reverie** | dreamy lavender, magenta |
| Estë | restoration, sanctuary, sleep | **Haven** | pale aqua, still water |
| Melkor | raw power, sovereignty, radical self-will (shadow) | **Cinder** | dark red-black, burnt crimson |
| Ungoliant | void, despair, the unhealed wound | **Hollow** | near-black, deep indigo |

And the collective name: "the Valar" becomes **"the Sixteen"** (or "the sixteen palettes"); "Valar Orbit" becomes **"Palette Orbit"** (or "Orbit"); "sixteen Valar archetypes" becomes **"sixteen archetypes of need"**. The page title **The Pantheon of Needs** is generic and can stay.

Notes: "Cinder" and "Hollow" stand for the shadow palettes and should read as acknowledged, not as bad (check their copy). Two names are close ("Tide" and "Haven" are both water): if that confuses, "Haven" could become "Stillness".

## What the Pantheon page needs beyond a rename
Today it tells each palette through a Tolkien character, which is the part most tied to the source. The rewrite keeps what each archetype means (the need and the focus, which already exist in the data: `individualFocus`, `communalFocus`) and drops the character stories, so the page stands on its own without the mythology.

## The bigger question, kept separate
Renaming the palettes does not touch the rest of the Tolkien material, and the owner should decide those on purpose, with advice:
- **The project name "Nenya"** and its meaning (Galadriel's ring) are the identity of the project; the Name & Philosophy page is built on Tolkien's ring and on Fëanor and the Palantíri; the stance names Vilya and Narya (internal only for now) come from the same place. None of this is changed by renaming the palettes.
- **Trademarks and rights.** I do not know which of these names, if any, are registered for software, games or merchandise, or how a non-commercial, fiscally sponsored project would be treated. That is a question for a lawyer. A trademark search for the names in use, and a read of the project's Tolkien references (the Name page, `public/about-nenya.html`, the contributor draft, the Terms), are the two things to ask for.
- **The Terms and the contributor agreement** should say nothing that implies any connection with Tolkien's estate.

## Order
1. The owner edits the proposed names (and chooses whether to keep "Pantheon of Needs").
2. Add `displayName` to the palette data and use it in the picker, settings, reports and any screen-reader label; tests follow.
3. Rewrite the visible copy: the Pantheon page (needs and focus, not characters), About the Designer, the Sight page, the settings label, the logo and body-map text.
4. Rewrite `public/about-nenya.html`, the JSON-LD and link previews, and the README line.
5. Update `docs/valar-color-palettes.md` (add the outward names beside the internal ones) and the alt-text file.
6. A test that no visible string and no page contains a Tolkien name (a list of the sixteen plus "Valar", checked against the built pages and the components' visible text), so a name cannot creep back.

## Decisions for the owner
1. The sixteen outward names (and the collective names).
2. Rename the ids in code too, now or later (later is the plan).
3. Rewrite the Pantheon page without the character stories (recommended).
4. Whether the repository's own docs (`docs/valar-color-palettes.md`) keep the internal names, since the repository is public.
5. Who gets the trademark and rights question, and when (before "going big").

## Not verified
- Which places a palette name reaches a visitor beyond the ones found by searching the code (reports, alt text, saved files).
- The legal position on any of these names, or on "Nenya".
