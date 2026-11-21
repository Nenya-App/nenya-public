# Crisis resources: currency check (2026-11-19, step 8 of the suicidal-ideation audit)

A web search is not a verification. This records what a quick search showed and what still has to be read on each service's own site by a person. Lists live in `src/lib/safetyFlags.ts`.

| Resource in the code | Search result today | Still to do |
|---|---|---|
| 988 Suicide & Crisis Lifeline (call or text 988) | Operating; Vibrant Emotional Health continues as administrator under a new agreement from May 2026; demand rising. The LGBTQ+ youth option was shut in July 2025 and is reported as being restored; the code does not mention it. | Read 988lifeline.org once; keep the code's claims to "call or text 988" |
| Crisis Text Line (text HOME to 741741) | Not confirmed by this search | Read crisistextline.org |
| 9-8-8 Canada (call or text, English or French) | Not searched | Read 988.ca |
| Kids Help Phone (1-800-668-6868; text CONNECT to 686868) | Both confirmed in several listings | Read kidshelpphone.ca |
| National Domestic Violence Hotline (1-800-799-7233; text START to 88788) | Not confirmed by this search | Read thehotline.org |
| Childhelp (1-800-422-4453 call or text) | Number confirmed; "text GO" in the code is not confirmed | Read childhelp.org and drop "(text GO)" if it is not stated there |
| RAINN (1-800-656-4673) | Confirmed in listings | Read rainn.org |
| National Human Trafficking Hotline (1-888-373-7888; text 233733) | Number consistent; sources disagree on the text keyword (HELP or INFO); the code says "text 233733" with no keyword | Read humantraffickinghotline.org; add the keyword if stated |
| Canadian Human Trafficking Hotline (1-833-900-1010) | Not searched | Read canadianhumantraffickinghotline.ca |
| Stop It Now (1-888-773-8368, weekdays) and NCMEC (1-800-843-5678) | Not searched | Read each site |
| Emergency number (911 in the US and Canada) | Unchanged | none |

Nothing in the code was changed: nothing found contradicts it, and nothing here was verified against an official source. Do this by a person, with the date recorded, at least twice a year (the weekly Claude task can prepare the list but cannot verify a number). Outside the US and Canada no local line is offered; that gap is in the audit.


## Future idea (owner, 2026-11-20): keep the resource list live

Use part of the nightly or weekly budget (see `docs/nightly-budget-scope.md`) for workers to check each listed resource against its own site, or find an API to use. Notes so far, nothing built:

- A model reading a page can **flag** a changed number or keyword. It must never **change** the list by itself: a person confirms each change on the organization's own page before it goes live. Wrong numbers in a crisis list are worse than a stale one.
- First candidates: a plain scheduled fetch (no model) that compares each listed phone number and text keyword to the organization's page and reports differences; the model is only needed to read pages whose layout changes.
- APIs to look into: 988 Lifeline and Poison Help have no public directory API that I could confirm; findahelpline.com (ThroughLine) lists services by country and may offer one; a person should check their terms and whether it is allowed to be called from the site or only from a check.
- Output goes to a private report, in the same place as the weekly drafts. Never to production.
