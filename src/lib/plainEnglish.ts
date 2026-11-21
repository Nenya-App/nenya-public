// "Nenya in plain English" (docs/terms-first-entry-scope.md): a short summary of the Terms and the privacy promise, in everyday words. A summary, not the Terms; the full
// Terms of Use and Privacy Policy (src/lib/legalDocument.ts) are the binding text, and this page says so. Approved by the owner 2026-11-18 ("approve all"). Every line carries the Terms section
// it was written from (`from`), so a change to the Terms shows which lines to check. The words are the owner's to approve; it follows the Terms' archive and effective-date practice.

export interface PlainItem { heading: string; text: string; from: string }

export const PLAIN_INTRO = 'This is a short summary. The full Terms of Use and Privacy Policy are the binding text, and you can read them any time.';

export const PLAIN_ENGLISH: PlainItem[] = [
  { heading: 'What it is', from: 'Section 1 and the crisis section (988, findahelpline.com)',
    text: 'A free place to pause, breathe and reflect, a kind of interactive art. It is not therapy, medical care or advice, and it cannot help in an emergency. If you are in crisis, please contact a person now: call or text 988 (US and Canada), or your local emergency number. Elsewhere, findahelpline.com lists lines in your country.' },
  { heading: 'Breathing safely', from: 'Section 3, "Using Nenya well"',
    text: 'Stop and breathe normally if you feel dizzy or lightheaded. If a pace feels too long, shorten it. If you have asthma, COPD, a heart or lung condition, or specific symptoms, check with a healthcare professional first.' },
  { heading: 'Who it is for', from: 'Section 2',
    text: 'People 13 or older, or your country’s minimum age if that is higher. If you are under 18, please use the coach only with a parent’s or guardian’s consent. Sending us something is only for people 18 or older.' },
  { heading: 'What stays with you', from: 'The short version; Section 16',
    text: 'What you enter in the reflection tools (colors, melodies, drawings, writing) stays in your browser and is gone when you close the tab, unless you choose “Save and return later”: then it is kept on your own device, locked with your passcode, for at most 24 hours. A PDF report is made on your own device.' },
  { heading: 'What we do not do', from: 'The short version; Section 16',
    text: 'No accounts. No advertising. No tracking cookies. Nothing follows you around the internet.' },
  { heading: 'What we do see', from: 'Section 13',
    text: 'Our web host keeps ordinary connection logs, as any website’s host does, and gives us visit totals. We keep our own daily totals too: numbers only, nothing about who. They start only after you agree, and not at all if your browser sends the Global Privacy Control signal.' },
  { heading: 'What leaves your device', from: 'The short version; Sections 14, 15 and 16',
    text: 'Only what you choose to send: a report or message, a color palette from The Color API, the signed note when you agree, and the coach conversation.' },
  { heading: 'The coach', from: 'Section 15',
    text: 'The coach is an AI. Your messages go through our server to Venice AI, which writes the replies. We do not store them. Venice AI handles them under its own terms. For now the coach is open only to connections in the United States.' },
  { heading: 'If you agree', from: 'Section 16 (the signed note); “Your session colors” in Section 15',
    text: 'We sign a short note that you agreed. Your visit gets a random pair of colors as its working name, which you can change. It is not an account, and we do not store it.' },
  { heading: 'If you decline', from: 'Section 13 (host logs)',
    text: 'We do not count or keep anything about you here. Our web host keeps ordinary connection logs, as any website’s host does. You can come back and read, or agree, whenever you like.' },
];

/** The lines the draft says that the Terms did not say in these words when the page was written. Since the 2026-11-18 revision the Terms say both when `VITE_TERMS_FIRST` is on
 *  (Section 15 "Your session colors" for the pair made at agreement; Section 16 for what a decline leaves), so these hold exactly when this page is shown. */
export const PLAIN_UNVERIFIED = [
  'The working pair "is made when you agree": stated in Section 15 ("Your session colors") when VITE_TERMS_FIRST is on.',
  '"We do not count or keep anything about you here" for a decline: stated in Section 16 when VITE_TERMS_FIRST is on; a statement about this build as well.',
];
