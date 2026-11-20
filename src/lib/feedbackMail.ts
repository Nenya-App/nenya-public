// The one place feedback mail leaves the site. The rest of the code knows only MailSender; which provider is behind it is the owner's choice and is set on the
// server (docs/production-env.md). Nothing here is a service: with no address configured there is no sender, and nothing is sent.
//
//   FEEDBACK_MAIL_URL    secret  an https address that accepts the JSON below (a relay the owner runs, or a provider's HTTP endpoint behind a small adapter)
//   FEEDBACK_MAIL_TOKEN  secret  optional: sent as "Authorization: Bearer ..."
//   FEEDBACK_MAIL_FROM   plain   the sender address the relay should use (the relay may ignore it)
//
// The request is: POST FEEDBACK_MAIL_URL, Content-Type application/json, body {"from","to","subject","text"}; any 2xx means sent.
import { featureLabel, isFeatureId } from './feedback.ts';

export interface MailMessage { to: string; subject: string; text: string }
export interface MailSender { send(m: MailMessage): Promise<boolean> }

export function senderFromEnv(env: Record<string, string | undefined>, fetchImpl: typeof fetch = fetch): MailSender | null {
  const url = (env.FEEDBACK_MAIL_URL ?? '').trim();
  if (!/^https:\/\//i.test(url)) return null;
  const token = (env.FEEDBACK_MAIL_TOKEN ?? '').trim();
  const from = (env.FEEDBACK_MAIL_FROM ?? '').trim();
  return {
    async send(m) {
      try {
        const r = await fetchImpl(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ from, to: m.to, subject: m.subject, text: m.text }),
          signal: AbortSignal.timeout(10_000),
        });
        return r.ok;
      } catch {
        return false;
      }
    },
  };
}

/** The automated reply. Fixed words: it never repeats what the person wrote, and it says what happened to their address. */
export function thankYouMail(to: string): MailMessage {
  return {
    to,
    subject: 'Thank you for your feedback on Nenya',
    text: [
      'Thank you for taking the time to tell us what you think of Nenya. We read every note.',
      '',
      'This is an automated message and nobody reads replies to it. We used your email address only to send it, and we did not keep it: it is not stored with your feedback or anywhere else.',
      '',
      'If you would like to talk to a person, write to info@nenya.biz.',
      '',
      'Nenya',
    ].join('\n'),
  };
}

export interface DigestEntry { at: string; route: string; features: string; picked: string; comment: string }

const featuresText = (csv: string): string =>
  csv.split(',').map((s) => s.trim()).filter(Boolean).map((id) => (isFeatureId(id) ? featureLabel(id) : id)).join(', ');

/** The daily digest as plain text. Empty when there is nothing: the caller sends nothing on a quiet day. */
export function buildDigest(entries: DigestEntry[], sinceIso: string, untilIso: string): { subject: string; text: string } | null {
  if (entries.length === 0) return null;
  const lines = [`${entries.length} feedback note${entries.length === 1 ? '' : 's'} from ${sinceIso.slice(0, 16)}Z to ${untilIso.slice(0, 16)}Z.`, ''];
  entries.forEach((e, i) => {
    lines.push(`#${i + 1}  ${e.at.slice(0, 16)}Z  page ${e.route}`);
    const about = [featuresText(e.features), e.picked ? `pointed at: ${e.picked}` : ''].filter(Boolean).join(' | ');
    if (about) lines.push(`    about: ${about}`);
    lines.push(...e.comment.split('\n').map((l) => `    ${l}`), '');
  });
  lines.push('Notes that did not pass the site’s checks are never included. No email addresses are kept, so none are here.');
  return { subject: `Nenya feedback: ${entries.length} new note${entries.length === 1 ? '' : 's'}`, text: lines.join('\n') };
}
