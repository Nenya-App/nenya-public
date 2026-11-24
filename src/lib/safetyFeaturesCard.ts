// The words of the "safety features" card (owner approved the draft on 2026-11-24, with the changes listed below; docs/safety-features-card.md).
//
// This is pre-written site text. No model writes it, changes it or sees it, and nothing here is built from what a visitor typed. It is shown, collapsed,
// under the help lines of a safety notice about abuse (src/coach/FlagNotice.tsx), and is ready for the coercion modules (src/lib/safetyCardRule.ts).
// It never replaces the help lines and never appears for any other topic.
//
// Every statement was checked against the code before it was put here (the evidence table is in docs/safety-features-card.md). Where the approved wording was not
// quite true, the smallest change was made and is listed in CHANGES_FROM_APPROVED, which tests/safety-features-card.test.mts checks against the approved draft word for word.
// Plain words, reading level about grade 5 to 6. Nothing here is a promise of safety.
import { EXIT_PAGE_NAME } from './emergencyExit.ts';

export interface CardPart {
  /** A bold lead-in such as "Where it is." (it is part of the text). */
  label: string;
  /** One paragraph after the label. */
  text?: string;
  /** Or a list after the label. */
  bullets?: string[];
}
export interface CardSection {
  heading?: string;
  parts: CardPart[];
}

export const SAFETY_CARD_TITLE = 'Learn more about our current safety and privacy features';
export const SAFETY_CARD_INTRO = 'What we have, what it does, and what it cannot do.';

/** The sentence about what Nenya keeps of what a person writes. With "Save and return later" switched on, it needs the exception (see CHANGES_FROM_APPROVED). */
export const NEVER_SAVES = 'Nenya never saves what you write or draw on your device.';
export const NEVER_SAVES_WITH_SAVE_RETURN = 'Nenya does not save what you write or draw on your device, unless you choose “Save and return later”. That is kept up to 24 hours, locked with a passcode you pick, and Forget me erases it.';

export function safetyCardSections(saveAndReturnOn: boolean): CardSection[] {
  return [
    {
      heading: 'Emergency Exit',
      parts: [
        {
          label: 'Where it is.',
          text: 'A button in the header and the footer of most pages, and on the coach page. On the pages that check or open a signed transcript, it floats at the top instead. It is rust-colored and says “Emergency Exit.”',
        },
        {
          label: 'What it does.',
          bullets: [
            'It erases everything Nenya saved on this device: your settings, your timers, and your agreement to the terms.',
            `It replaces your page with ${EXIT_PAGE_NAME}. It does not add to your history, so Back does not bring the Nenya page you were on.`,
            'If you press Back to an earlier Nenya page in the same tab, it sends you away again. This stops when you close the tab.',
            'It sends nothing to us.',
          ],
        },
        {
          label: 'What it cannot do.',
          bullets: [
            'It cannot erase your browser’s own history. Your browser may still show that you visited nenya.biz, and the page it sent you to.',
            'It does not close other tabs or windows.',
            'It does not delete files you saved, such as a PDF or a transcript.',
            'It cannot hide your visit from your internet provider, your network, or anyone who controls your device or your accounts.',
          ],
        },
      ],
    },
    {
      heading: 'Forget me',
      parts: [
        {
          label: 'Where it is.',
          text: 'A link at the bottom of most pages, and a button under “Remember on this device” in Accessibility Settings.',
        },
        {
          label: 'What it does.',
          text: `It erases what Nenya saved in this browser: your display settings, your choice to remember, your agreement to the terms, and the timer that follows a coach conversation. It sends nothing to us. ${saveAndReturnOn ? NEVER_SAVES_WITH_SAVE_RETURN : NEVER_SAVES}`,
        },
        {
          label: 'What it cannot do.',
          bullets: [
            'It cannot erase your browser’s own history, or files you downloaded.',
            'The coach sends your messages through our server to an outside AI service to get a reply. We do not store them. We cannot see or control what that service does with them.',
            'If you chose to send us a conversation, Forget me does not remove it. Email us and we will delete it.',
          ],
        },
      ],
    },
    {
      heading: 'What we have not built',
      parts: [
        {
          label: '',
          bullets: [
            'There is no disguised app, no password or lock on the page, and no key that hides the page.',
            'Nenya is not a safety plan, and it is not a crisis service.',
          ],
        },
      ],
    },
    {
      heading: 'If you are not safe',
      parts: [{ label: '', text: 'Call your local emergency number. The help lines are in the notice on this page.' }],
    },
  ];
}

export const SAFETY_CARD_FOOTER = 'Nenya is a free, early prototype and is not therapy. No clinician or lawyer has reviewed it. We have not studied whether it helps.';

/** The whole card as plain text, one line per paragraph or bullet. The tests compare this with the approved draft. */
export function safetyCardText(saveAndReturnOn = false): string {
  const out: string[] = [SAFETY_CARD_TITLE, SAFETY_CARD_INTRO, ''];
  for (const s of safetyCardSections(saveAndReturnOn)) {
    if (s.heading) out.push(`## ${s.heading}`);
    for (const p of s.parts) {
      if (p.text !== undefined) out.push(p.label ? `${p.label} ${p.text}` : p.text);
      else {
        if (p.label) out.push(p.label);
        for (const b of p.bullets ?? []) out.push(`- ${b}`);
      }
    }
    out.push('');
  }
  out.push(SAFETY_CARD_FOOTER);
  return out.join('\n');
}

/**
 * Each place where the card differs from the approved draft, with the reason. Every one is marked for the owner to approve (2026-11-24); none changes what
 * the card means, and each makes a statement true that the code does not support as drafted.
 */
export const CHANGES_FROM_APPROVED: { from: string; to: string; why: string; forced?: boolean }[] = [
  { from: 'It replaces your page with a Wikipedia page.', to: `It replaces your page with ${EXIT_PAGE_NAME}.`, why: 'The owner decided the exit goes to the Google home page (2026-11-24).', forced: true },
  { from: 'A button in the header and the footer of the pages, and on the coach page. It is red and says “Emergency Exit.”', to: 'A button in the header and the footer of most pages, and on the coach page. On the pages that check or open a signed transcript, it floats at the top instead. It is rust-colored and says “Emergency Exit.”', why: 'The check-a-transcript and my-transcript pages have no header or footer, only a floating button; the button is rust-colored (#89452D), not red.' },
  { from: 'A link at the bottom of every page, and a button under “Remember on this device” in the display settings.', to: 'A link at the bottom of most pages, and a button under “Remember on this device” in Accessibility Settings.', why: 'The check-a-transcript, my-transcript and partner-cell pages have no footer, so no link; the settings window is titled Accessibility Settings.' },
  { from: NEVER_SAVES, to: NEVER_SAVES_WITH_SAVE_RETURN, why: 'Only where “Save and return later” is switched on (VITE_SAVE_REFLECTION, on in the production list): it keeps the parts you finished, the body-map placements and the colors for up to 24 hours, encrypted. The Terms say so in Section 16. With it off, the approved sentence is used as written.' },
  { from: 'no password or lock, and', to: 'no password or lock on the page, and', why: '“Save and return later” has a passcode for the saved reflection; the sentence is about the page, and now says so.' },
];
