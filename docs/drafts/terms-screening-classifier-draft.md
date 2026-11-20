# DRAFT: Terms wording for the hate-speech classifier

Status: a draft for the owner to edit, written 2026-11-20. **Nothing here is in the live Terms** (`src/lib/legalDocument.ts`). The Terms are owner-approved text, so this is wording to approve, not a change made.

## Why this is needed
The site now explains the classifier in plain terms on the "How the checks work" page (`src/app/components/about/HowChecksWork.tsx`, status line from `SCREEN_STATUS` in `src/lib/checksReport.ts`). The Terms still say, in Section 5 and in the coach section, that the checks are "simple phrase matching". That stays true only while the classifier is off. **The classifier must not be switched on for the live site (`COACH_SCREEN=on`, or `shadow` on the live site) until this wording is in the Terms**, because a message would then pass through a step the Terms do not describe. Until then the site says it is not on for the live site.
(An earlier version of the how-checks page said "the Terms say whether it is switched on". They did not; that line is removed.)

## Where it goes
No section is renumbered (`tests/legal-sections.test.mts` checks every "Section N"). As with the other drafts, the sentences appear only where the build switch is on, so the Terms are true whichever switches are live. Suggested switch: `VITE_SCREEN_MODEL === 'on'`, read like `TRAY` and `TERMS_FIRST` at the top of `legalDocument.ts`, and turned on together with `COACH_SCREEN`.
When the live document changes: archive the outgoing text in `docs/legal/archive/`, update the table in `docs/legal/README.md`, change `LEGAL_EFFECTIVE_DATE` (everyone is then asked to agree again).

## (A) Section 5 (respectful use), replace "These checks are simple phrase matching and can be wrong." with, when the switch is on

> These checks are phrase matching and, where stated in Section 21, a small hate-speech classifier. Both can be wrong.

## (B) The coach section (the paragraph that begins "Every message is checked for signs of crisis"), add a paragraph, when the switch is on

> A small hate-speech classifier also reads each message you write in a conversation, one at a time, as a second signal. It is the model cardiffnlp/twitter-roberta-base-hate-latest, made by the Cardiff NLP group under the Creative Commons Attribution 4.0 licence, which we shrank to a smaller format and did not retrain. It runs on our own server, in memory, and sends your message to nobody else; your message already passes through our server on its way to Venice AI. It gives back only a band (high, mid or low), never a score and never your words, and we keep neither. We count only how many messages fell in each band, with nothing that identifies anyone (Section 13). It can change only the tone of the coach's reply (the coach may state its own position, or offer a short learning card). It never ends a conversation, never stops a message from being sent, and reports no one. If it is slow or fails, it is skipped. It reads English only, misses most hate that is not a slur, is uneven across groups, and can be wrong about a quote, a joke or a reclaimed word. How it was measured, and where it falls short, is on the "How the checks work" page.

(Check "Section 13" is the section that lists the daily counts; adjust if not.)

## (C) Where else the site must change when it goes live
1. `SCREEN_STATUS` in `src/lib/checksReport.ts`: set `onLiveSite: true` and the date. The how-checks page and the About text on Venice (`VeniceChat.tsx`) read it.
2. The pre-written answer about which model runs and where messages go (`src/lib/aboutNenya.ts`, "which model it uses") is checked against the Terms and the About pages; add the classifier there too, in the same words.
3. `ATTRIBUTIONS.md` already names the model, licence and changes; drop "(not yet switched on in production)".
4. The privacy lines in the coach demo's first screen (if they list what reads a message).
