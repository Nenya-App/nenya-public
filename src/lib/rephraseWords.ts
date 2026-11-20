// Every word a person reads in rephrasing, in one place (docs/dyad-rephrase-scope.md). DRAFTS for the owner to approve. Plain
// words, lower-secondary reading level, first person where the person is speaking about themselves. Nothing here scores,
// labels a person, or says which reading is right: tests/rephrase-words.test.mts holds a list of words that must never appear.
import type { MarkKind } from './rephraseKinds.ts';
import type { Notice } from './rephraseRound.ts';

/** The credit line, exactly as it must appear wherever the categories are shown. */
export const CNVC_CREDIT = 'The Center for Nonviolent Communication © 2023, www.CNVC.org';
export const CNVC_URL = 'https://www.cnvc.org';
export const EXTENSION_NOTE = 'The communal-needs layer is a project extension and is not part of the CNVC list.';
export const CATEGORIES_NOTE = `The kinds of mark follow the categories of ${CNVC_CREDIT}. Nenya’s own lists of feelings and needs are used, not CNVC’s.`;

export const WORDS = {
  panelTitle: 'Rephrase together',
  panelIntro: 'Mark what you meant by a phrase, or what you heard in one. You choose each thing that is sent.',
  open: 'Rephrase together',
  close: 'Close rephrasing',
  // First use (each person, separately).
  firstTitle: 'Before the first round',
  firstPoints: [
    'Rephrasing lets one of you share a phrase and mark what they meant by it. The other can say what they heard in it. If you both choose, you see the two readings side by side.',
    'You choose each thing that is sent. Nothing is shown to you until you say yes, and “Not now” needs no reason.',
    'The other person can copy or screenshot anything you send. Nothing here can stop that.',
    'Your device checks the words it receives for signs that someone may be in danger. This can miss things, and a person who edits their own page can skip it.',
    'It needs two devices. If someone is reading over your shoulder, they can see your screen.',
    'This is a practice, not therapy, and not for emergencies. In the US, call or text 988. If you are afraid of the other person, rephrasing is not a way to settle that.',
    'You can pause, stop rephrasing, or close and delete the cell at any time. Nothing is kept by Nenya, and the cell is deleted within three hours at most.',
  ],
  understand: 'I understand',
  understood: 'You said you understand.',
  // Marking.
  markAs: 'Mark as',
  phraseLabel: 'The phrase, word by word',
  yourPhrase: 'Your phrase',
  yourPhraseHelp: 'Type the words you said, or would say. This stays on your device until you choose to send it.',
  phraseBox: 'The phrase',
  tapWords: 'Choose a kind, then tap or press a word to mark it. Tap it again to clear it. Unmarked words are fine.',
  rewriteLabel: 'Another way to say it (optional)',
  rewriteHelp: 'Sent only if you choose to show what you meant.',
  hearerGuess: 'Feelings and needs you mark are your guesses about the other person, and are shown as guesses.',
  noteLabel: 'One sentence of your own (optional)',
  storiesBox: 'Also send what I marked as a story',
  storiesHelp: 'Not sent unless you tick this.',
  // The ask.
  askButton: 'Ask if they would like to hear it',
  askReviewTitle: 'Review before sending',
  askReviewBody: 'A request: “I would like to share a phrase and hear what you hear in it.”',
  askReviewNote: 'No words from your phrase, no length, no marks.',
  sendRequest: 'Send the request',
  notAfterAll: 'Not after all',
  waitingAsk: 'Waiting. They may be away. You can cancel.',
  cancelRequest: 'Cancel the request',
  arrivedAsk: 'A request has arrived',
  arrivedAskBody: 'They would like to share a phrase and hear what you hear in it. Nothing has been shown yet.',
  yes: 'Yes, I will look',
  notNow: 'Not now',
  never: 'Not in this cell',
  // The phrase.
  phraseReviewTitle: 'They said yes',
  phraseReviewBody: 'What will be sent',
  phraseReviewNote: 'Only the phrase. Your marks and your rewrite are not included.',
  sendPhrase: 'Send the phrase',
  sentPhrase: 'The phrase has gone. You will not be told whether it has been opened.',
  waitingPhrase: 'Waiting for the phrase. You can go on with other things in the cell.',
  hearTitle: 'The phrase',
  hearHelp: 'Mark what you hear in it. You can leave words unmarked, or skip marking.',
  reviewSend: 'Review what to send',
  // The hearer's choice.
  returnTitle: 'What do you want to send back?',
  returnMarks: 'Your marks',
  sendMarks: 'Send my marks',
  keepMarks: 'Keep my marks to myself',
  skipMarks: 'Skip marking',
  returned: 'Sent. They will decide whether to show you what they meant.',
  returnedKeep: 'Kept on your device. They will decide whether to show you what they meant.',
  returnedSkip: 'You skipped marking. They will decide whether to show you what they meant.',
  waitingTitle: 'Waiting for them',
  waitingMeant: 'Waiting for them to show what they meant. You can go on with other things in the cell.',
  // The reveal.
  answeredTitle: 'They have answered',
  answeredSent: 'When you show what you meant, you will see what they heard.',
  answeredKept: 'They kept their marks to themselves. You can still show what you meant.',
  answeredSkipped: 'They chose not to mark. You can still show what you meant.',
  revealBox: 'What will be shown to them',
  revealBoxBody: 'Your marks on the phrase, and your rewrite if you wrote one.',
  reveal: 'Show what I meant',
  revealLater: 'Nothing has been shown. You can show what you meant whenever you like.',
  // The comparison.
  compareTitle: 'Two readings of the same words',
  compareHint: 'Neither is the right one.',
  wordByWord: 'Word by word',
  nothingMarked: 'Nothing marked. That is a fine way to read it.',
  noWordsMarked: 'No words were marked by either of you.',
  theirRewrite: 'Their rewrite',
  yourRewrite: 'Your rewrite',
  theirNote: 'Their sentence',
  keptOwn: 'They kept their marks to themselves.',
  skippedOwn: 'They did not mark.',
  lockOk: 'This is what they fixed before you marked.',
  lockBad: 'This is not what they fixed before you marked. Take care with it.',
  doneButton: 'Done with this',
  // Controls.
  pause: 'Pause',
  stop: 'Stop rephrasing',
  // Safety, writer's private notice.
  privateTitle: 'Only you can see this',
  privateBody: 'Your device found words that may be about someone being in danger. Nobody else is told. You can edit, send as it is, or stop.',
  sendAnyway: 'Send as it is',
  edit: 'Go back and edit',
  // The reader's notice (an ordinary message or a rephrasing one).
  readerTitle: 'This may be about someone being in danger',
  readerBody: 'Your device found words that may be about someone being in danger. The cell is paused for both of you. This is a simple check of the words and can be mistaken. If anyone is in danger now, call your local emergency number. You can continue when you are both ready.',
  // Time.
  away: 'They may have stepped away. Waiting.',
  stillThereTitle: 'Still there?',
  stillThere: 'They have been away for a while. You can keep waiting, or close the cell.',
  keepWaiting: 'Keep waiting',
  closeCell: 'Close the cell',
  minutesLeft: (n: number) => `About ${n} minutes are left before this cell is deleted. This is a privacy rule and cannot be extended.`,
  // Reports.
  report: 'Report what they sent',
  reportExplain: 'This sends the message exactly as it arrived to Nenya’s owner, with the proof that it came through this cell. It reveals every word in that message: the phrase, a rewrite, a sentence and marks. It does not tell them who reported it.',
  reportConfirm: 'Send the report',
  reportCancel: 'Do not send',
  reportDone: 'Reported. Nothing else from this cell was sent.',
  reportFailed: 'The report could not be sent.',
  // Errors.
  sendFailed: 'That could not be sent. It is still here; try again.',
  paused: 'Paused. Nothing can be sent until you continue.',
} as const;

/** What a notice says after a round ends without a comparison. Never a reason; never a count. */
export const NOTICES: Record<Notice, string> = {
  'partner-notnow': 'They would like to wait. Nothing was sent, and nothing more is asked of you.',
  'partner-never': 'They would rather not rephrase in this cell. You can go on with the ordinary conversation.',
  'said-notnow': 'Okay. Nothing was shown, and you gave no reason.',
  'said-never': 'Okay. No more requests to rephrase in this cell.',
  'partner-done': 'The round is done. It is gone from this device’s memory.',
  done: 'The round is done. It is gone from this device’s memory. Nothing was saved.',
  'partner-stopped': 'Rephrasing has stopped. You are back in the ordinary conversation.',
  stopped: 'Rephrasing has stopped. You are back in the ordinary conversation.',
  cancelled: 'The request was withdrawn. Nothing was sent.',
};

/** The kind, as a phrase about a word, for the plain statements (third person). */
export const KIND_PLAIN: Record<MarkKind, string> = {
  saw: 'what was seen or heard',
  story: 'a story',
  feeling: 'a feeling',
  need: 'a need',
  request: 'a request',
  thought: 'a thought',
  strategy: 'a way to meet a need',
  demand: 'a demand',
};

/** The announcements for a screen reader (polite). The content of a phrase is never read out on arrival. */
export const ANNOUNCE = {
  ask: 'A request has arrived from the other person. Open it when you are ready.',
  phrase: 'A phrase has arrived. Open it when you are ready.',
  heard: 'They have answered.',
  meant: 'Two readings are ready.',
  paused: 'The cell is paused.',
  resumed: 'The cell has continued.',
  away: 'The other person may have stepped away.',
  back: 'The other person is back.',
  ended: 'The round has ended.',
  marked: (word: string, kind: string) => `${word} marked as ${kind}.`,
  cleared: (word: string) => `${word} mark cleared.`,
} as const;
