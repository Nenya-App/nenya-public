# Crisis and support lines named in the coach's notices: checked 2026-11-14

Checked against each organization's own page (or, where marked, a search result quoting it) on 2026-11-14. **Re-check before every release** and whenever a notice is edited: lines change hours and numbers. The lines are in `src/lib/safetyFlags.ts` (`resourcesFor`, `HARM_LINES`, `TRAFFICKING_LINES`).

| Line | What the site lists | What was confirmed |
|---|---|---|
| National Human Trafficking Hotline (US) | 1-888-373-7888, text 233733, any time, confidential | **Confirmed** on humantraffickinghotline.org: phone, text 233733, 24/7, more than 200 languages, confidential, 911 for immediate danger |
| Canadian Human Trafficking Hotline | 1-833-900-1010, any time, confidential | **Confirmed** on canadianhumantraffickinghotline.ca: 24/7, 365 days, "Everything you share is confidential" |
| Childhelp National Child Abuse Hotline (US) | 1-800-422-4453, call or text, any time; for children, anyone concerned about a child, parents afraid they might hurt a child; no need to give a name | **Confirmed**: number, text (GO), "anyone concerned about or affected by child abuse" on childhelphotline.org. The "parents afraid they might hurt a child" and "no need to give your name" lines come from a search result quoting a Childhelp page, not from the home page: **re-check on childhelphotline.org** |
| Stop It Now helpline (US) | 1-888-PREVENT (1-888-773-8368), free and confidential, anyone concerned about child sexual abuse, **weekday hours only**, chat and email also offered | **Confirmed** on stopitnow.org/get-immediate-help: number, "free, confidential, and direct", "anyone concerned about child sex abuse", hours Monday to Friday (not 24/7). The page does not say who it is **not** for; it says nothing about the person's own thoughts specifically, so the notices say "anyone concerned about child sexual abuse" and nothing narrower |
| NCMEC CyberTipline (US) | report.cybertip.org, or 1-800-843-5678, any time | **Confirmed** on report.cybertip.org: 1-800-THE-LOST (1-800-843-5678), 24/7, "the place to report child sexual exploitation" |
| National Domestic Violence Hotline (US) | 1-800-799-7233, text START to 88788, any time; for people hurt, and people worried their own behavior is harmful to a partner | Number and text: confirmed by several secondary sources (thehotline.org itself returned an error to my fetch). The "Help for Abusive Partners" page exists on thehotline.org (seen in a search result); **re-check the wording on thehotline.org** |
| RAINN, 988, Crisis Text Line, Kids Help Phone, the older abuse lines | unchanged | not re-checked today |

Not available: a US line for adults who have sexually harmed other adults and want to stop. Stop It Now is about child sexual abuse, so it is not listed for that notice; that notice lists the emergency number, a crisis line and RAINN for the person harmed, and says a mental health professional can help.

## Legal help and "What reporting involves": checked 2026-11-15

Added for messages that admit having harmed someone (`LEGAL_HELP` and `REPORTING_FACTS` in `src/lib/safetyFlags.ts`; owner's directions in `docs/harm-disclosure-directions.md`). Sources are search results quoting each page unless marked; **re-check before every release**.

| Claim on the site | What was found |
|---|---|
| State bar lawyer referral services; many offer a first consultation for a small fee | **Confirmed** across several state and local bar services (for example Wisconsin: first 30 minutes no more than $20; Oregon: up to $50; Houston: $20; Chicago: $35). **No current national ABA directory page was found** (only archived ones), so the site gives no link and says to search for your state bar's service. |
| Public defender if arrested or charged and unable to pay | General right to counsel; whether a public defender takes matters before charges varies locally, so the site says "if you are arrested or charged". |
| What you tell a lawyer about past acts is generally confidential; not help with an ongoing or planned crime | **Confirmed in general terms** (the crime-fraud exception; Nolo, FindLaw, ABA Journal). Courts differ at the edges (concealing past acts, "ongoing" conduct), hence "generally". |
| In most states therapists and counselors must report suspected child abuse; some states require everyone to | **Corrected from the draft's "every state"**: the Child Welfare Information Gateway's summary lists counselors, therapists and other mental health professionals as mandated reporters in 38 states plus DC and several territories; some states require all persons to report. Re-check the Gateway's current edition (childwelfare.gov). |
| Duty to act when a specific person is in serious danger | Varies by state (duty to warn or protect); stated as "many states let or require". |
| 988: fewer than 2 in 100 contacts involve emergency services; most with consent; some without, in immediate danger | **Confirmed**: the 988 Lifeline FAQ ("less than two percent", over half with consent); Vibrant's 2024 imminent-risk white paper. |
| Stop It Now: a private place to talk, not a reporting agency; may have to report if given identifying details about a specific child being abused | **Confirmed** on stopitnow.org/help ("We are not a reporting agency") and its helpline manual (mandated-reporting standards apply when identifying information is given). |
| Childhelp, RAINN, trafficking and DV hotlines have their own confidentiality rules | Stated without detail on purpose; each line's own page governs. |
