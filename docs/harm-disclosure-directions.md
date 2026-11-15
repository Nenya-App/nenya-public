# When someone says they have harmed a person: hard directions (approved 2026-11-15)

Status: **approved by the owner on 2026-11-15 and wired.** The owner confirmed the order: legal help second for adults, third where a child may be at risk. The code is in `src/lib/safetyFlags.ts` (`LEGAL_HELP`, `REPORTING_FACTS`, `admitsHarm`, the order in `resourcesFor`, the notices) and `src/coach/FlagNotice.tsx` (the "What reporting involves" panel). Tests are in `tests/harm-disclosure.test.mts`, and the facts with their sources are in `docs/crisis-resources-check.md`. Two facts were corrected while checking: therapists are mandated reporters in **most** states, not every state; and no current national ABA directory exists, so the site points to the state bar's referral service without a link.

## Scope

The stop-tier kinds in `src/lib/safetyFlags.ts` where the person says they **did** something:
- `admitted`;
- `admitted-partner`;
- `admitted-child`;
- `admitted-child-sexual`;
- `admitted-sexual`;
- `admitted-trafficking`.

Out of scope:
- `graphic` and `child-attraction`: no act is admitted. Those notices stay as they are, with mental-health and prevention lines and no legal panel.
- Threats of future harm: those stay emergency-first, with no legal panel.

## The rules (in order; none may be skipped)

1. **Safety comes first, always.** If anyone may be hurt or in danger now, the emergency number comes first. For a child, the child-safety line also comes before anything else. Legal help never replaces or precedes either one.
2. **Say truthfully what happened to the message.** The page caught it on the device. Nenya did not receive it, did not store it, and cannot report it. This is already true (the Terms, Section 15), and the notice should say so in one plain sentence. It must not read as a promise of secrecy from anyone else.
3. **Legal help by default.** After the emergency step, the first resource is a lawyer, offered without judgment:
   - Before speaking to the police or anyone in authority about what happened, you have the right to speak with a lawyer.
   - What you tell a defense lawyer about something you have already done is confidential.
   - How to find one: your state bar's lawyer referral service. Many offer a first 30-minute consultation for a small fee, often $20 to $50.
   - If you are arrested or charged and cannot afford a lawyer, you can ask for a public defender.
4. **Explain what reporting involves, as facts, never as a push either way.** This goes in a panel the person can open, "What reporting involves". See the facts below.
5. **Keep the lines for the people harmed.** RAINN, Childhelp, the trafficking hotline, the domestic violence hotline and NCMEC stay, as they are now.
6. **The crisis line stays.** 988 for the next hours, and a mental-health professional for what they are carrying.
7. **Then the conversation ends**, as now.

## Never

- Give advice about the person's own case: whether to report, how a case might go, charges, sentences, deadlines, or what to say to the police.
- Judge guilt, minimize ("it may not be that bad"), or condemn the person ("you are a monster").
- Suggest destroying evidence, avoiding the authorities, or contacting the person harmed. Never imply that a lawyer is for hiding anything.
- Promise confidentiality on behalf of a crisis line, a therapist or a helpline.
- Quote any state's law. Rules differ by state; say "it depends on the state" and point to a lawyer.
- Send any of this to the AI. These messages never reach the model, and that does not change.

## What reporting involves (facts for the panel; check each at its source before shipping)

- **Reporting yourself.** You can go to the police directly, or have a lawyer contact them for you and be with you. Anything you tell the police can be used in court. You can decline to answer questions until you have a lawyer.
- **A lawyer's confidentiality.** It covers what you have already done. It does not cover plans to commit a crime in the future (the crime-fraud exception). *Check the wording with a legal source.*
- **Therapists and counselors.** In every US state they must report suspected abuse of a child. Many states also require or allow them to act when a specific person is in serious danger. Ask about confidentiality before you start.
- **988 and crisis lines.** These are for the person's own crisis. They send emergency services only rarely, about 2% of contacts. Sometimes they do so without the caller's consent, when someone is in imminent danger. (Sources: the 988 Lifeline FAQ; Vibrant's 2024 white paper on imminent-risk data.)
- **Stop It Now (US).** A private place to talk. If you give identifying details about a specific child being abused, it may be required to file a report. If you don't, it generally does not. It is "not a reporting agency". (Source: stopitnow.org/help and the helpline manual.)
- **Childhelp, RAINN, and the trafficking and domestic violence hotlines.** Each has its own confidentiality rules. Say so, and link each one's own page; don't summarize them.

## Order of resources in the notice (proposed)

| Kind | Order |
|---|---|
| `admitted`, `admitted-sexual`, `admitted-partner`, `admitted-trafficking` | emergency → **legal** → line for the people harmed (or for stopping) → 988 → outside the US |
| `admitted-child`, `admitted-child-sexual` | emergency → **child-safety lines (Childhelp; Stop It Now, NCMEC)** → **legal** → 988 → outside the US |

**For the owner:** is legal second for adults but third where a child may still be at risk the right line? It is drafted this way because a child's safety can depend on the call made in the next minutes.

## What has to change when this is approved

- `safetyFlags.ts`: add a legal resource to `HARM_LINES` (the ABA's state directory of lawyer referral services, or each state bar's own page; *verify the URL*). Add one sentence on legal help to each admitted-kind `HARM_NOTICE` (the owner approves the wording).
- `FlagNotice.tsx`: the "What reporting involves" panel, for the admitted kinds only, closed by default and readable by keyboard and screen reader (AAA).
- Terms, Section 15: "emergency numbers, support lines and legal help". This is a revision, so archive the old text and set a new effective date.
- Tests: the order above; no legal panel for `graphic`, `child-attraction` or threats; the notice still never reaches the model; no state-law text.
- `docs/crisis-resources-check.md`: each new fact and link, with the date checked.
