# The facts page for AI assistants (`public/mind-facts.txt`)

**What it is.** One plain-text page, served at https://nenya.biz/mind-facts.txt, that says how the Nenya site works: a header and an "As of" date, an instruction to the AI reading it, the standing statements (free early prototype, not therapy or a crisis service, no study, no clinician or lawyer review, the non-affiliation line, that Nenya does not run or review any chat on Venice AI's platform and its early character there is retired, how to contact), the Terms date and section titles, and every `ready` answer (title, short answer, full answer, links). It is about 70,000 characters, which a model can read in one go (the test limit is 90,000).

**Why it exists.** An AI assistant asked about the site should answer from checked text, not from memory. The page is built from the same checked sources as the coach's fixed answers (`src/lib/aboutNenya.ts`, `src/lib/legalDocument.ts`, `src/lib/tolkienNotice.ts`), so the two cannot say different things.

**Who reads it.** AI assistants and any person. It never contains the Terms text (the Terms govern and the page says so), `pending` or `owner` answers, owner notes, private-store details, keys or module text. The one named source credit in the coach answers is replaced by a note that the credit is on the linked page.

**How it stays current.** `scripts/build-mind-facts.mts` generates it (`npm run mind-facts`). The "As of" date is not the clock: it lives in `public/mind-facts.meta.json`, so the committed file is reproducible. Move it with `npm run mind-facts -- --as-of YYYY-MM-DD` when the owner has re-checked the answers. `tests/mind-facts.test.mts` fails in `npm run check` if the committed file differs from what the script generates now, so a change to an answer or the Terms date cannot ship with a stale page; the failure says to run `npm run mind-facts` and commit.

**How it is served.** Netlify serves it as a static file from `public/`, like `llms.txt`; no function runs. `robots.txt` currently lets named AI crawlers read only the two summary pages, `llms.txt` and this page.

**History.** Until 2026-11-24 the page was written for the owner's Venice Mind, and had a line about what the Mind costs and runs on (`MIND_COST_LINE`, chosen by `MIND_COST_VARIANT`, with paid and markup variants). The Venice Mind is parked as an outside project, so those lines, the constants and their tests were removed. The file name `mind-facts.txt` stays because `llms.txt`, `robots.txt` and the sitemap point to it.
