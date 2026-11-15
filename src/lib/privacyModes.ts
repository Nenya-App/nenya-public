// The privacy modes, described once, so every screen that offers a choice says the same true things
// (docs/ghost-footprint-stack.md). Each mode lists what is true, what is not, and what it costs, in plain words.
// Nothing here switches a mode on: the server's switches are COACH_SEALED and CELL_ENABLED, both off by default.

export type ModeId = 'witnessed' | 'sealed' | 'local' | 'cell';
export type ModeStatus = 'live' | 'built-off' | 'planned';

export interface PrivacyMode {
  id: ModeId;
  /** What the visitor sees as the choice. */
  name: string;
  /** One line under the name. */
  summary: string;
  status: ModeStatus;
  /** Who can read the words, besides the person who wrote them. */
  whoCanRead: string[];
  /** What the site does with them. */
  checks: string;
  /** Whether Nenya can sign a transcript (a witnessed record). */
  canSign: boolean;
  /** Whether it may be called end-to-end encrypted, and the exact words allowed. */
  encryption: string;
  /** What it costs the planet and the device, compared with the others. */
  footprint: string;
  /** The honest limits. */
  limits: string[];
}

export const MODES: Record<ModeId, PrivacyMode> = {
  witnessed: {
    id: 'witnessed',
    name: 'Witnessed',
    summary: 'Nenya reads each message to check it, and can sign a record of the conversation.',
    status: 'live',
    whoCanRead: ["Nenya's relay function, in memory only, while it handles the message", "The AI model's secure enclave"],
    checks: 'Crisis, identifier and instruction checks run on your device and again on the server, so a modified page cannot skip them.',
    canSign: true,
    encryption: 'Encrypted between Nenya and the AI model. Not end-to-end: Nenya’s relay reads your words before encrypting them.',
    footprint: 'The lowest of the AI options: one small model, five capped exchanges, and many turns answered without the model at all.',
    limits: ['The relay sees your words (it does not store or log them).', 'Signed records are what make "Witnessed Encounters" possible.'],
  },
  sealed: {
    id: 'sealed',
    name: 'Sealed',
    summary: 'Your device encrypts each message for the AI model’s enclave. Nenya passes along words it cannot read.',
    status: 'built-off',
    whoCanRead: ["The AI model's secure enclave"],
    checks: 'Crisis, identifier and instruction checks run only on your device. Nenya’s server cannot check what it cannot read.',
    canSign: false,
    encryption: 'Encrypted on your device for the AI model’s enclave. Your device checks the hardware evidence itself: Intel’s signatures, that the key was made inside the enclave for this conversation, and which code it runs. It still relies on Venice for whether the firmware is up to date, for the GPU evidence’s signatures, and for whether the code is the code Venice intends.',
    footprint: 'About the same as Witnessed: the same model and limits, one extra check of the enclave, slightly larger requests.',
    limits: [
      'Nenya cannot sign a record of words it never saw, so a Sealed conversation cannot become a Witnessed Encounter.',
      'Someone who edits the page can skip the checks on their own device.',
      'The enclave is run by Venice on attested hardware. Your device checks Intel’s signatures on it, but you are still trusting Intel’s hardware, and Venice for the parts your device cannot check yet.',
    ],
  },
  local: {
    id: 'local',
    name: 'On this device',
    summary: 'A small model runs in your browser. Nothing you write leaves your device.',
    status: 'planned',
    whoCanRead: [],
    checks: 'Every check runs on your device.',
    canSign: false,
    encryption: 'Nothing is sent, so nothing needs encrypting.',
    footprint: 'The highest: a one-time download of 0.4 to 1 GB, and your device does the work. Only for recent devices, on Wi-Fi.',
    limits: ['Smaller models give simpler replies.', 'Needs WebGPU and plenty of memory.', 'Not built yet.'],
  },
  cell: {
    id: 'cell',
    name: 'Partner practice (two people)',
    summary: 'Messages between the two of you are encrypted on your devices. Nenya’s mailbox holds only what it cannot read.',
    status: 'built-off',
    whoCanRead: ['The other person in the cell'],
    checks: 'Each device checks incoming messages for crisis language and can pause the cell.',
    canSign: false,
    encryption: 'End-to-end encrypted between the two devices, with a key exchange tied to the code you share, new keys for every message, and colours you can compare.',
    footprint: 'Small: a few hundred short requests in a 20-minute session (fewer when quiet), deleted within three hours.',
    limits: [
      'If either person uses AI help, their own words go to the AI as in Witnessed or Sealed mode.',
      'A report reveals the reported message to Nenya, and proves the other person sent it.',
      'Anyone with the code can try to join; only two people can, once each.',
    ],
  },
};

/** The modes a visitor can actually choose today, given the server's switches. */
export function availableModes(switches: { sealed?: boolean; cell?: boolean } = {}): PrivacyMode[] {
  return Object.values(MODES).filter((m) => m.status === 'live' || (m.id === 'sealed' && switches.sealed) || (m.id === 'cell' && switches.cell));
}
