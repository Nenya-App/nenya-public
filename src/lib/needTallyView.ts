// "What has come up so far" (docs/need-tally-scope.md; VITE_NEED_TALLY, off by default): the switch and the words for the page's running tally. The tally itself is conversationTally.ts
// (the person's own words, matched against CNVC's inventory). Page state only: nothing here stores or sends anything.
export const needTallyOn = (): boolean => import.meta.env?.VITE_NEED_TALLY === 'on';

/** The words on the control. DRAFTS for the owner to approve: the label, the two headings and the note. */
export const NEED_TALLY_UI = {
  label: 'What has come up so far',
  feelings: 'Feelings you named',
  needs: 'Needs you named',
  note: 'These are your own words from this conversation, found on a standard list. They are only on this page, are not saved or sent, and are gone when you close the tab.',
} as const;
