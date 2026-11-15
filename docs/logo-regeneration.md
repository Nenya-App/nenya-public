# Regenerating the logo assets from the live gem

The site now draws its gem live (`src/lib/gemRenderer.ts`), so the static pictures of the logo (the in-app WebP, favicons, app icons, social preview, PDF logo, print logos, avatars) are made from that same gem, not from the old sprite. Written 2026-11-12.

1. **Choose the look** on the `/bench/` page (`npm run dev -- --port 5174`, then open `http://localhost:5174/bench/`). "Copy settings" copies it. A pasted address (after the `#`) now loads settings without a reload, and the kaleidoscope panel has **Return to the plain cut**, which restarts the stone from its plain cut.
2. **Save the copied settings** as `~/Desktop/Nenya Research/logo-regen/gem-settings.json` (or point `GEM_SETTINGS` at another file).
3. **Run `npm run logo:render`.** It builds `logo-export/` on its own (not part of the site's build), draws the logo in headless Chrome with those settings (the stone held still), and writes every asset under `~/Desktop/Nenya Research/logo-regen/out/` at the path it will have in the project, plus `before-after.png` next to it. It needs Google Chrome, macOS's `sips` and `cwebp`, and `npm i --no-save puppeteer-core`.
4. **Look at `before-after.png`** in Finder. Nothing in the project changes until you say so.
5. **Replace and archive:** old files go to dated `_retired-YYYY-MM-DD` folders in the assets folder (the project's own history keeps the old versions), then the new ones are copied into place. The "for light backgrounds" print logo needs its own method (darkening the whole drawing turns the gem grey), so it is held back until that is solved.

## Decisions of 2026-11-12 (supersede anything above that disagrees)
- **Light backgrounds:** the logo is used as a **dark badge** (`nenya-logo-10x10in-300dpi-badge-for-light-backgrounds.png`, a rounded dark tile), not a darkened drawing. The old "transparent-for-light-backgrounds" file is retired.
- **The flat logo** (in-app webp, small webp, favicons, PDF logo, transparent avatar) is drawn from the live gem with `flat=1` (petals and bezel, no outer ring), because the site's flat logo image has the old gem baked in.
- **Orbit-view assets** use `vivid=1` (brighter, steady orbs and more of the color wheel through the stone) so the still picture is as colorful as the old one.
- **Kaleidoscope is off by default** on the site. The applied look is in `gem-settings.json` (research folder), `src/lib/siteGem.ts` and `src/lib/orbitLook.ts`.
- Old files are in `~/Desktop/Nenya Assets/_retired-2026-11-12/`.
