# The facts page for the Venice Mind (`public/mind-facts.txt`)

**What it is.** One plain-text page, served at https://nenya.biz/mind-facts.txt, that says how the Nenya site works: a header and an "As of" date, an instruction to the AI reading it, the standing statements (free early prototype, not therapy or a crisis service, no study, no clinician or lawyer review, the non-affiliation line, the Venice Mind is separate, how to contact), the Terms date and section titles, and every `ready` answer (title, short answer, full answer, links). It is about 71,000 characters, which a model can read in one go (the test limit is 90,000).

**Why it exists.** The owner's Venice Mind should answer questions about the site from checked text, not from memory. The page is built from the same checked sources as the coach's fixed answers (`src/lib/aboutNenya.ts`, `src/lib/legalDocument.ts`, `src/lib/tolkienNotice.ts`), so the two cannot say different things.

**Who reads it.** The Mind (through Venice's web scrape tool, if the owner turns it on) and any person. It never contains the Terms text (the Terms govern and the page says so), `pending` or `owner` answers, owner notes, private-store details, keys or module text. The one named source credit in the coach answers is replaced by a note that the credit is on the linked page.

**How it stays current.** `scripts/build-mind-facts.mts` generates it (`npm run mind-facts`). The "As of" date is not the clock: it lives in `public/mind-facts.meta.json`, so the committed file is reproducible. Move it with `npm run mind-facts -- --as-of YYYY-MM-DD` when the owner has re-checked the answers. `tests/mind-facts.test.mts` fails in `npm run check` if the committed file differs from what the script generates now, so a change to an answer or the Terms date cannot ship with a stale page; the failure says to run `npm run mind-facts` and commit.

**How it is served.** Netlify serves it as a static file from `public/`, like `llms.txt`; no function runs. `robots.txt` currently lets named AI crawlers read only the two summary pages and `llms.txt`; whether the Venice scraper obeys that is for the owner to check.
