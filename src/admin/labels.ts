// Plain names and groups for the usage totals, shared by the admin page and its spreadsheet export.

export const GROUPS: { title: string; match: (e: string) => boolean }[] = [
  { title: 'Coach demo', match: (e) => e.startsWith('coach.') },
  { title: 'Opening and tour', match: (e) => e.startsWith('onboarding.') || e.startsWith('tour.') },
  { title: 'Screens shown', match: (e) => e.startsWith('page.view.') },
];

const LABELS: Record<string, string> = {
  'coach.turn.sent': 'Messages sent',
  'coach.turn.answered': 'Messages answered',
  'coach.turn.distress-text': 'Replies with the crisis pointer added',
  'coach.conversation.started': 'Conversations started',
  'coach.conversation.finished': 'Conversations finished',
  'onboarding.terms.accepted': 'Terms accepted',
  'tour.accepted': 'Tour accepted',
  'tour.declined': 'Tour declined',
  'tour.completed': 'Tour completed',
  'coach.report.verified': 'Transcript reports accepted',
  'coach.report.rejected': 'Transcript reports refused',
};

export const label = (e: string): string => {
  if (LABELS[e]) return LABELS[e];
  if (e.startsWith('coach.receipt.issued.')) return `Receipts issued (key ${e.slice('coach.receipt.issued.'.length, 'coach.receipt.issued.'.length + 6)}…)`;
  if (e.startsWith('coach.turn.blocked.')) return `Blocked: ${e.slice('coach.turn.blocked.'.length)}`;
  if (e.startsWith('onboarding.rhythm.')) return `Rhythm: ${e.slice('onboarding.rhythm.'.length)}`;
  if (e.startsWith('page.view.')) return e.slice('page.view.'.length);
  return e;
};

export const groupTitle = (e: string): string => GROUPS.find((g) => g.match(e))?.title ?? 'Other';
