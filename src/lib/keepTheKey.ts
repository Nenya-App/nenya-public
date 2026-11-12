// The signed transcript is the key to a person's own data. With it, the person changes or deletes it themselves at /my-transcript; Nenya
// is not involved. A change can only remove permissions, never add them (adding is scoped for future accounts only; see
// docs/transcript-consent-scope.md). Without the file, the only route is a review by email, which can only remove or delete. The words are shared by the coach's
// transcript tools and the /my-transcript page so they say the same thing.

export const CONTACT_EMAIL = 'info@nenya.biz';
export const REVIEW_DAYS = 30;

/** The short heading for the warning. */
export const KEEP_KEY_TITLE = 'Download your signed transcript and keep it';

/** Why the file matters, in full. */
export const KEEP_KEY_WARNING =
  'The signed transcript is your key. Without it you cannot use the automatic tool at nenya.biz/my-transcript to change what you allowed or to delete what you sent. ' +
  `Without the file, we can only remove permissions or delete what you sent, after a review you ask for by email at ${CONTACT_EMAIL}. That can take up to ${REVIEW_DAYS} days, and you would need to tell us what the conversation contained and when it happened so we can find it.`;

/** The policy behind it. */
export const KEEP_KEY_POLICY =
  'With the file, you make any change yourself at nenya.biz/my-transcript: stop a use, take a public copy down, or delete it. No one at Nenya needs to be involved. Permissions can only ever be removed, never added, with or without the file. Our policy is not to change or delete a verified transcript for anyone who cannot show the matching file, except after the email review. Keeping the file is how you keep control of your data.';

/** Under the "Save or send to myself" button (the device's share sheet). */
export const KEEP_KEY_SHARE =
  'This opens your device\'s own options, such as email, notes or files, and sends the readable copy with its signature from your device. It does not pass through Nenya, and we do not see where it goes or record an address.';

/** A feature that may come later. Planned, not built. */
export const KEEP_KEY_PLANNED =
  'Planned, not built: an optional account on the site where you could keep your signed transcripts, so you would not need to download each one.';
