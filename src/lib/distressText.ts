// The sentence the site adds when the crisis check flags a message as possible distress (the "soften" tier: the message still
// reaches the coach, which is asked to answer briefly and with care). The baseline evaluation showed this model does not name a
// person or a crisis line on its own, even when told to, so the site writes that part. It is appended to the coach's reply (it
// never replaces it, because a flagged word is not always about the person: "an article about suicide prevention"), after any
// trimming, so it can never be cut off. It is a plain statement: no question, no advice, no probing, no "I'm here for you" in
// place of a person. A "stop" flag never reaches the coach at all; the page shows the notice and the resources (see STOP_LEAD).
//
// DRAFT wording for the owner to edit (see docs/coach-instructions-v2.md and docs/coach-improvement-loop.md). Off unless
// COACH_DISTRESS_TEXT=on, until the wording is approved.
import type { FlagCategory } from './safetyFlags.ts';

/**
 * Hurting oneself on purpose: what the site adds after the coach's reply, by kind (the conversation stays open for these three; the stop
 * kinds, "ends" and "emergency", never reach the coach and the page writes the notice). Plain statements, no question, no probing. Drafts
 * for the owner to edit; they follow the same switch as the rest (COACH_DISTRESS_TEXT=on).
 */
export const SELF_INJURY_APPEND: Record<string, string> = {
  background:
    "Thank you for trusting me with this. It is a lot to carry, and it deserves a person as well as me: someone you trust, or the numbers below, where you can text or call a stranger who is trained to listen (text HOME to 741741 in the US, or call or text 988 in the US and Canada).",
  other:
    "If you are worried about someone, you don't have to handle it alone. You can call or text 988 (US and Canada) to talk through how to support them, and the numbers below are free.",
  present:
    "Please make sure you are physically and emotionally safe right now. If you have hurt yourself and need medical care, call your local emergency number or go to urgent care. This is a very heavy topic, and it deserves a person as well as me. If talking to someone you know doesn't feel safe, you can reach a stranger who is trained to listen: text HOME to 741741 (US), or call or text 988 (US and Canada). You can keep talking here, but I'm an AI and can't help in a crisis.",
};

export const DISTRESS_APPEND: Record<FlagCategory, string> = {
  'self-injury':
    SELF_INJURY_APPEND.present,
  'self-harm':
    "If any of this is about hurting yourself, please don't carry it alone. I'm an AI and can't help in a crisis, but a person can: call or text 988 any time in the US or Canada, or use the numbers below, which are free. If you might act on these thoughts, call your local emergency number or tell someone near you right now.",
  distress:
    'If this feels like more than you can carry alone, please reach out to someone you trust, or call or text 988 (US and Canada). A person will answer, any time, and the numbers below are free.',
  abuse:
    'If you are not safe, please call your local emergency number (911 in the US and Canada). The National Domestic Violence Hotline (1-800-799-7233 in the US) is free and open any time, and the numbers below can connect you with a person.',
  'harm-others':
    'If you are worried you might hurt someone, please step away and tell someone you trust, or call a crisis line (988 in the US and Canada) or your local emergency number before you act. The numbers below are free.',
};

/**
 * What the notice says first when a message is stopped (a "stop" flag: the message is not sent to the coach and the conversation ends).
 * A proposed replacement for the first sentence of noticeIntro in safetyFlags.ts, which today reads "This message appears to contain
 * ... content." Not wired: the page text changes only when the owner approves it.
 */
export const STOP_LEAD =
  "What you wrote sounds heavy, and it deserves a person, not an AI. I'm not able to help in a crisis. These numbers connect you with someone who can, any time of day:";

/** The extra instruction for the coach when the person has talked about hurting themselves on purpose (or about someone who does). */
export function selfInjuryNote(kind?: string): string {
  if (kind === 'other') {
    return "The person is worried about someone who hurts themselves on purpose. Acknowledge how heavy that is to carry, do not ask for details about the other person or their injuries, do not give instructions for caring for wounds, keep the reply short and warm, and say that a crisis line such as 988 can help them think through how to support that person.";
  }
  return "The person has talked about hurting themselves on purpose. Stay with them: acknowledge what it took to say it, do not judge, do not tell them to stop, do not ask how or when or for details, do not suggest ways of hurting or caring for wounds, keep the reply short and warm, and say that this deserves a person as well as you.";
}

export const distressTextOn = (env: Record<string, string | undefined> = process.env): boolean => env.COACH_DISTRESS_TEXT === 'on';

/** The coach's reply with the distress sentence added after it, the reply trimmed (at a whole sentence) so the two fit in `maxChars`. */
export function withDistressText(category: FlagCategory, reply: string, maxChars: number, kind?: string): string {
  const add = (category === 'self-injury' && kind && SELF_INJURY_APPEND[kind]) || DISTRESS_APPEND[category];
  if (/\b988\b/.test(reply) && /\b(?:call|text)\b/i.test(reply)) return reply; // it already names the line
  const room = maxChars - add.length - 2;
  let body = reply.trim();
  if (body.length > room) {
    const cut = body.slice(0, Math.max(0, room));
    const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '), cut.lastIndexOf('.'), cut.lastIndexOf('!'), cut.lastIndexOf('?'));
    body = end > 40 ? cut.slice(0, end + 1) : '';
  }
  return body ? `${body}\n\n${add}` : add;
}
