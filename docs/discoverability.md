# Discoverability (search engines and AI assistants)

What is in place, and what only the site owner can do.

## In the repo
- `public/about-nenya.html`: curated static summary with FAQ structured data. Answers are kept accurate to what is built; nonviolent communication is described as the grounding for the tools (the site has an NVC page), with partner practice marked planned, not built.
- `public/why-nenya.html`: plain-language comparison with a typical AI chatbot, written for skeptical first-time visitors. Includes a "what it does not do" section.
- `public/sitemap.xml`: lists `/`, `/about-nenya.html`, `/why-nenya.html`. **Update `lastmod` whenever a listed page changes, and add any new static page here.**
- `public/robots.txt`: named AI crawlers may read only the two static pages; everyone else (ordinary search engines) may crawl everything. `/coach` is `noindex` on purpose (prototype).
- `public/llms.txt`: short plain-text pointer for AI tools. A convention with unproven effect; it costs nothing.
- `index.html`: description, canonical URL, and `WebApplication` structured data.

## Keeping it honest
Only claim a topic where the site delivers it. Today: breathing (yes), mindfulness-style reflection (yes), digital coaching (early prototype, optional), nonviolent communication (grounding for the tools; partner practice planned, not built). Update the FAQ and `llms.txt` when that changes.

## Only the owner can do these
1. Verify nenya.biz in Google Search Console and submit `https://nenya.biz/sitemap.xml`.
2. Do the same in Bing Webmaster Tools (also feeds several AI search products).
3. Link to the site from places that already describe it (GitHub README, Fractured Atlas project page, any press or directory listings). Inbound links matter more than any tag.
4. After a deploy, request indexing for `/why-nenya.html` in Search Console.

## Not done, on purpose
Netlify prerendering: the app has a single address and its social-preview tags are already static, so it adds little.
