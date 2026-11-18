// Plain names and groups for the usage totals, shared by the admin page and its spreadsheet export.

export const GROUPS: { title: string; match: (e: string) => boolean }[] = [
  { title: 'Coach demo', match: (e) => e.startsWith('coach.') || e.startsWith('transcript.') },
  { title: 'Partner practice', match: (e) => e.startsWith('cell.') },
  { title: 'Opening and tour', match: (e) => e.startsWith('onboarding.') || e.startsWith('tour.') },
  { title: 'Lenses', match: (e) => e.startsWith('lens.') },
  { title: 'Screens shown', match: (e) => e.startsWith('page.view.') },
  { title: 'Reports and messages', match: (e) => e.startsWith('submission.') },
  { title: 'Guestbook', match: (e) => e.startsWith('guestbook.') },
];

const LABELS: Record<string, string> = {
  'coach.turn.sent': 'Messages sent',
  'coach.turn.answered': 'Messages answered',
  'coach.sealed.attested': 'Sealed mode: enclave checks given to browsers',
  'coach.sealed.turn.sent': 'Sealed mode: encrypted messages relayed',
  'coach.sealed.turn.answered': 'Sealed mode: encrypted replies passed back',
  'cell.opened': 'Partner practice: encrypted cells opened',
  'cell.report.verified': 'Partner practice: reported messages verified',
  'coach.turn.hostile.abuse': 'Messages hostile toward the coach',
  'coach.turn.hostile.critique': 'Messages critical of the coach\'s reply',
  'coach.turn.hostile.thanks-added': 'Thank-yous added to replies to critique',
  'coach.turn.hostile.apology-removed': 'Apologies removed from replies to hostile messages',
  'coach.turn.distress-text': 'Replies with the crisis pointer added',
  'coach.conversation.started': 'Conversations started',
  'coach.conversation.finished': 'Conversations finished',
  'onboarding.terms.accepted': 'Terms accepted',
  'coach.pause.begun': 'Pauses begun',
  'coach.pause.returned.waited': 'Returned from a pause by waiting',
  'coach.pause.returned.quiz': 'Returned from a pause by the quiz',
  'guestbook.signed': 'Guestbook signed',
  'guestbook.refused.once': 'Guestbook: second signature that day refused',
  'submission.received': 'Report or message received',
  'submission.deleted.self': 'Deleted by its sender (code)',
  'submission.deleted.expired': 'Deleted at 90 days',
  'submission.deleted.owner': 'Deleted by the owner',
  'submission.alert-failed': 'Report alert email failed',
  'tour.accepted': 'Tour accepted',
  'tour.declined': 'Tour declined',
  'tour.completed': 'Tour completed',
  'coach.report.verified': 'Transcript reports accepted',
  'coach.report.rejected': 'Transcript reports refused',
  'coach.report.alert-failed': 'Transcripts kept, email alert failed',
  'transcript.deleted': 'Transcripts deleted at their chosen time',
  'transcript.needs-manual-deletion': 'Deletions that did not go through',
  'coach.offer.slur': 'Cards offered: slurs',
  'coach.offer.dehumanizing-metaphor': 'Cards offered: dehumanizing comparisons',
  'coach.offer.dehumanizing-phrase': 'Cards offered: dehumanizing phrases',
  'coach.offer.coded-term': 'Cards offered: coded terms',
  'coach.offer.harassing-insult': 'Cards offered: insults',
  'coach.offer.ai-insult': 'Cards offered: abuse aimed at the AI',
};

const lensName = (id: string): string => (id === 'insight' ? 'Pattern' : id[0].toUpperCase() + id.slice(1));

export const label = (e: string): string => {
  if (LABELS[e]) return LABELS[e];
  if (e.startsWith('coach.receipt.issued.')) return `Receipts issued (key ${e.slice('coach.receipt.issued.'.length, 'coach.receipt.issued.'.length + 6)}…)`;
  if (e.startsWith('coach.turn.blocked.')) return `Blocked: ${e.slice('coach.turn.blocked.'.length)}`;
  if (e.startsWith('onboarding.rhythm.')) return `Rhythm: ${e.slice('onboarding.rhythm.'.length)}`;
  if (e.startsWith('onboarding.start.')) return `Started with: ${e.slice('onboarding.start.'.length)}`;
  if (e.startsWith('lens.opened.')) return `Lens opened: ${lensName(e.slice('lens.opened.'.length))}`;
  if (e.startsWith('lens.added.')) return `Lens added to a report: ${lensName(e.slice('lens.added.'.length))}`;
  if (e.startsWith('page.view.')) return e.slice('page.view.'.length);
  return e;
};

export const groupTitle = (e: string): string => GROUPS.find((g) => g.match(e))?.title ?? 'Other';
