// Wording for "Save and return later" (docs/save-and-return-scope.md). Kept apart from the components so tests/save-reflection.test.mts
// holds every line to reading grade 8 or below.

export const SAVE_COPY = {
  link: 'Save and return later',
  title: 'Save and return later',
  intro: 'Your finished gateways are kept on this device only, locked with a passcode, for 24 hours. Nothing is sent to Nenya.',
  idLabel: 'Your session ID',
  idHelp: 'You need this and your passcode to come back. A password manager can keep both, or copy them somewhere safe.',
  passLabel: 'Passcode',
  passHelp: 'Something simple you will remember. On a shared device, choose something longer.',
  show: 'Show passcode',
  copy: 'Copy ID',
  copied: 'Copied',
  save: 'Save',
  saved: 'Saved. Keep your ID and passcode: there is no other way back in. It will be erased in 24 hours, or sooner with Forget me or Emergency Exit.',
  noSpace: 'This device has no room to save it. Your reflection is still here in this tab.',
  invalid: 'Enter a passcode first.',
  limits: 'A simple passcode stops a glance, not someone with time and this device.',
  half: 'A gateway you are in the middle of is not saved; finish it first if you want it kept.',
  continueLink: 'Continue a saved reflection',
  continueTitle: 'Continue a saved reflection',
  continueIntro: 'Enter the session ID and passcode you saved it with.',
  open: 'Open',
  notFound: 'Nothing matched that ID and passcode. A saved reflection is kept for 24 hours.',
  close: 'Close',
} as const;

export const saveCopyLines = (): string[] => [
  SAVE_COPY.intro,
  SAVE_COPY.idHelp,
  SAVE_COPY.passHelp,
  SAVE_COPY.saved,
  SAVE_COPY.noSpace,
  SAVE_COPY.limits,
  SAVE_COPY.half,
  SAVE_COPY.continueIntro,
  SAVE_COPY.notFound,
];
