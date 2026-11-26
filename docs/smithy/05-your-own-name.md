---
number: 5
slug: your-own-name
title: Give it your own name and mark
summary: Swap the name, logo, icons and contact address for yours.
status: approved
files: TRADEMARK.md, src/app/components/GlobalNavigation.tsx, src/app/components/OnboardingFlow.tsx, index.html, public/manifest.json, public/icons, src/assets/nenya-logo.webp, src/assets/nenya-logo-small.webp, src/lib/aboutRoutes.ts, src/app/components/ShareNenya.tsx, src/app/components/AppFooter.tsx, src/lib/legalDocument.ts, src/lib/tolkienNotice.ts, src/lib/nenyaPdfReport.ts, src/lib/aboutNenya.ts, src/lib/smithyData.ts, public/llms.txt, public/mind-facts.txt, public/sitemap.xml
---

## Why

The code is shared, but the name and the logo are not. If you give your copy to anyone, or put it online, it must not use the name Nenya or its logo. The rules are in [`TRADEMARK.md`](https://github.com/Nenya-App/nenya-public/blob/main/TRADEMARK.md). For a copy that stays on your own computer, you may still want your own name.

## Start with these places

| Place | What to change |
|---|---|
| `src/app/components/GlobalNavigation.tsx` | The name at the top of every page. It appears twice. |
| `src/app/components/OnboardingFlow.tsx` | The words "Welcome to Nenya" on the first screen. |
| `index.html` | The page title and the lines that name the site. |
| `public/manifest.json` | The name, short name and description. |
| `public/icons` | The icon pictures. Keep the same file names and sizes. |
| `src/assets/nenya-logo.webp` and `src/assets/nenya-logo-small.webp` | The logo pictures. |
| `src/lib/aboutRoutes.ts` | The line that starts with `SITE_TITLE`. |
| `src/app/components/ShareNenya.tsx` | The web address and words used by the Share button. |
| `src/app/components/AppFooter.tsx` | The name, the year line and the email link at the foot of the page. |
| `src/lib/nenyaPdfReport.ts` | The line at the foot of every saved report, which names Nenya and nenya.biz. |
| `src/lib/aboutNenya.ts` | The answers about the site. They describe Nenya. Rewrite or remove them. |

## Change the contact address

The address `info@nenya.biz` appears many times. Replace every one with your own, or remove the link. If you skip this, messages from your copy would go to the people who run nenya.biz.

**Mac and Linux:**

```bash
grep -rn "info@nenya.biz" src public index.html
```

**Windows:**

```bash
findstr /s /n /c:"info@nenya.biz" src\* public\* index.html
```

## Find the rest of the name

Search for the name and the web address to see what is left. There will be many results, and many are notes inside the code that no one sees. Skip `src/lib/smithyData.ts`: it holds these guides.

**Mac and Linux:**

```bash
grep -rn "Nenya" src index.html public
grep -rn "nenya.biz" src index.html public
```

**Windows:**

```bash
findstr /s /n /i "nenya" src\* public\* index.html
```

## Text that is only true for nenya.biz

- `src/lib/legalDocument.ts` holds the Terms and Privacy Policy. They speak for nenya.biz. Do not show them as yours. Write your own or remove them before others use your copy.
- `src/lib/tolkienNotice.ts` holds a line about the books the name comes from. Keep it only if it is still true for you.
- `public/llms.txt`, `public/mind-facts.txt` and `public/sitemap.xml` describe nenya.biz. Delete them or rewrite them.

## Check it

Run `npm run build`, then open your copy as in the sixth guide. Look at the top of the page, the footer, the browser tab and the About pages.

This is not legal advice.

The files are here on GitHub:

- [`index.html`](https://github.com/Nenya-App/nenya-public/blob/main/index.html)
- [`public/manifest.json`](https://github.com/Nenya-App/nenya-public/blob/main/public/manifest.json)
- [`src/app/components/ShareNenya.tsx`](https://github.com/Nenya-App/nenya-public/blob/main/src/app/components/ShareNenya.tsx)
- [`src/app/components/AppFooter.tsx`](https://github.com/Nenya-App/nenya-public/blob/main/src/app/components/AppFooter.tsx)
- [`src/lib/legalDocument.ts`](https://github.com/Nenya-App/nenya-public/blob/main/src/lib/legalDocument.ts)
