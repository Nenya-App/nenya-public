---
number: 4
slug: make-it-yours
title: Make it yours
summary: Change the words, colors, breath pace and the shape of the logo.
status: approved
files: src/app/components/pages/WelcomePage.tsx, src/styles/globals.css, src/app/components/PortableBreath.tsx, src/lib/breathingPresets.ts, src/lib/logoLook.ts, src/lib/logoColours.ts, src/app/components/NenyaLogo.tsx
---

## Before you change anything

Keep your copy running with `npm run dev`, as in the second guide. Open it in your browser. When you save a file, the page updates by itself.

Use a plain text editor. Curly quotes break code. On a Mac, in TextEdit, open Settings, then New Document, and untick Smart quotes and Smart dashes. For a file that is already open, also check Edit, then Substitutions. On Windows, Notepad works.

If you saved settings in your browser with "Remember on this device", press "Forget me" at the bottom of the page. Saved settings hide your new starting values.

Change one thing at a time. If the page breaks, undo your last change and save again.

## Change the words

Open `src/app/components/pages/WelcomePage.tsx`. Find the line that says `Take a Moment to Breathe`. Type your own words in its place. Save.

## Change the colors

Open `src/styles/globals.css`. There are two sets of colors, one for the light theme and one for the dark theme. To change the dark background, find this line:

```css
--background: #1A1512;
```

Change the code after the colon to a color of your own, such as `#101820`. Keep the `#` and the semicolon. The main gold color is on a line that starts with `--nenya-gold`.

Make sure your words are still easy to read against the new color.

## Change the breath pace

The pace your copy starts with is in `src/app/components/PortableBreath.tsx`. Find this line:

```ts
export const STEADY: BreathingTechnique = { ih: 6000, hi: 0, ex: 6000, ho: 0 };
```

The numbers are in thousandths of a second. `ih` is the breath in, `hi` is the hold after it, `ex` is the breath out, and `ho` is the hold after that. For five seconds in and five out, use `5000` for both `ih` and `ex`.

The list of paces you can pick from is in `src/lib/breathingPresets.ts`. The first screen offers that list, so change the entry called Steady there too: its numbers, its short label such as `6·6`, and its description. Five in and five out is already in the list under the name Even. Take care with long breaths and holds. If a pace feels hard, choose a shorter one.

## Change the logo's shape

Open `src/lib/logoLook.ts`.

- `DEFAULT_LOGO_LEAVES` is the number of leaves. It may be 6, 8, 10 or 12.
- `DEFAULT_GEM_CHOICE` is the number of sides on the gem. It may be 6, 8 or 10.
- `DEFAULT_BREATH_COLOURS` picks the colors of the breathing glow. Try `'preset:warm'` or `'preset:cool'`.

The color sets are listed in `src/lib/logoColours.ts`. The drawing of the logo itself is in `src/app/components/NenyaLogo.tsx`.

## Lighter animation levels

Two lighter levels, Minimal and Simple, are planned for older or busy computers. They are not built yet. For now, the Stop motion button holds most of the movement still.

## Check your work

Stop the page, then run `npm run build`. If it finishes without errors, your changes are sound enough to keep.

The files are here on GitHub:

- [`src/app/components/pages/WelcomePage.tsx`](https://github.com/Nenya-App/nenya-public/blob/main/src/app/components/pages/WelcomePage.tsx)
- [`src/styles/globals.css`](https://github.com/Nenya-App/nenya-public/blob/main/src/styles/globals.css)
- [`src/app/components/PortableBreath.tsx`](https://github.com/Nenya-App/nenya-public/blob/main/src/app/components/PortableBreath.tsx)
- [`src/lib/breathingPresets.ts`](https://github.com/Nenya-App/nenya-public/blob/main/src/lib/breathingPresets.ts)
- [`src/lib/logoLook.ts`](https://github.com/Nenya-App/nenya-public/blob/main/src/lib/logoLook.ts)
- [`src/lib/logoColours.ts`](https://github.com/Nenya-App/nenya-public/blob/main/src/lib/logoColours.ts)
- [`src/app/components/NenyaLogo.tsx`](https://github.com/Nenya-App/nenya-public/blob/main/src/app/components/NenyaLogo.tsx)
