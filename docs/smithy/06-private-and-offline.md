---
number: 6
slug: private-and-offline
title: Keep it private and use it offline
summary: Build your copy, open it only on your own computer, and know what can leave it.
status: approved
files: README.md, src/lib/deviceMemory.ts, src/lib/usageCounts.ts, scripts/smithy-offline-check.mts, netlify.toml
---

## Build your copy

Go into your folder, as in the second guide. Then run:

```bash
npm run build
```

This makes a folder called `dist` with the finished site in it.

## Open it on your computer only

```bash
npx vite preview
```

You should see an address that starts with `http://localhost`. Open it in your browser. Only your own computer can reach this address. To stop it, hold Control and press C.

You can now turn off your internet. The breathing tool, the Lenses, the sound and the report still work. The project notes this in [`README.md`](https://github.com/Nenya-App/nenya-public/blob/main/README.md), under "Offline use".

## What we checked

On 25 November 2026, a copy was built with `npm run build` on a Mac. A check program served it to that computer only and watched every request. It agreed to the terms, opened and closed the breathing panel, used one Lens, saved the report as a file, and opened three About pages. **Nothing was sent off the computer.**

The check does not cover every button or every page. It was not run on Windows or Linux.

You can run the same check yourself. It needs Google Chrome. On a Mac:

```bash
npm i --no-save puppeteer-core
npm run build
node scripts/smithy-offline-check.mts
```

On Windows or Linux, first tell the check where Chrome is. These two have not been tried. Your Chrome may be in another place.

**Windows,** in Command Prompt:

```bash
npm i --no-save puppeteer-core
npm run build
set "CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe"
node scripts/smithy-offline-check.mts
```

**Linux:**

```bash
npm i --no-save puppeteer-core
npm run build
CHROME=/usr/bin/google-chrome node scripts/smithy-offline-check.mts
```

Look for the line `outward requests: 0`. The program is [`scripts/smithy-offline-check.mts`](https://github.com/Nenya-App/nenya-public/blob/main/scripts/smithy-offline-check.mts).

## What can leave your computer

- **Links to other sites.** If you press one, your browser goes there. The Emergency Exit button goes to Google. About pages link to sources and to GitHub.
- **The coach page.** Do not open the page whose address ends in `/coach`. It is built to load a check from the company Cloudflare. The allowed outside address is listed in [`netlify.toml`](https://github.com/Nenya-App/nenya-public/blob/main/netlify.toml).
- **Email and sharing buttons.** They open your own mail or sharing apps. What you send there leaves your computer.

## What stays but does not leave

The site tries to send daily counts and a note that you agreed to the terms. In your copy, these go to your own computer, where nothing receives them, so they go nowhere. The counting code is [`src/lib/usageCounts.ts`](https://github.com/Nenya-App/nenya-public/blob/main/src/lib/usageCounts.ts).

Other buttons that need a server, such as sending a report or asking The Color API for colors, will not work in your copy.

## What your browser keeps

By default, almost nothing is kept after you close the tab. If you turn on "Remember on this device", your settings are saved in your browser. "Forget me" erases them. The full rules are in [`src/lib/deviceMemory.ts`](https://github.com/Nenya-App/nenya-public/blob/main/src/lib/deviceMemory.ts).
