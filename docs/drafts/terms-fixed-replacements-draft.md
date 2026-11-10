# DRAFT: Terms wording for replies the site replaces with a fixed sentence

Status: draft for the owner, 2026-11-10. **Not in the live Terms** (`src/lib/legalDocument.ts`). I am not a lawyer.

## Why
Two guards can replace a model reply, after one retry, with a fixed sentence written by the site: (1) the infrastructure and data guard (`src/lib/infraGuard.ts`: a reply that claims how Nenya runs, a certification, or what happens to your data), and (2) the persona guard (`src/lib/personaGuard.ts`: a reply that invents a human life or says it is not an AI). The Terms list of site-written text (Section 21) does not yet mention them. The infrastructure guard has been in dev since before this draft; the Terms should say so before either goes to production, because the replaced reply appears as the coach's reply and in a downloaded transcript.

## Proposed addition to the Section 21 bullet on site-written text
> In two situations our server may replace the AI's whole reply with a short fixed sentence instead of showing it: when the reply makes a claim about how Nenya runs or what happens to your data that the AI cannot know, and when the reply speaks as if the AI had a human life of its own or were not an AI. The AI is asked once to answer again first. The fixed sentences are in our public source code (`src/lib/infraGuard.ts` and `src/lib/personaGuard.ts`). They are not AI output, and they appear in a transcript you download as the coach's reply. These checks are simple phrase matching and they can be wrong in both directions.

## Open question for the owner
The signed transcript does not yet mark a replaced reply as site-written (it records the fixed sentence as the assistant's message). Options: (a) mark it with a `site` entry of a new kind, `replacement`, so a transcript shows which words were the site's; (b) leave it and rely on the Terms. I recommend (a), because transcripts are the evidence people will use to dispute a decision.
