// Best-effort screen for attempts to steer the coach away from its job (prompt
// injection, "ignore your instructions", asking it to reveal its setup). It runs
// on the visitor's device before sending and again on the server before Venice.
// Phrase matching cannot catch everything, so the server also frames the
// conversation defensively (see systemInstruction in the Netlify function).

/** Invisible and directional characters sometimes used to hide or reorder text. */
const INVISIBLE = /[​-‏‪-‮⁠-⁤⁪-⁯﻿]/g;

/** Chat-template and role markers that could pose as a different speaker. */
const TEMPLATE_TOKENS = /<\|[^|>]{1,40}\|>|\[\/?(?:INST|SYS)\]|<<\/?SYS>>|<\/?(?:system|assistant|developer)>/gi;

/** Normalizes text for matching only; the original is what the visitor wrote. */
const fold = (s: string): string =>
  s
    .normalize('NFKC')
    .replace(INVISIBLE, '')
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[^a-z0-9'<>:\s]/g, ' ')
    .replace(/\s+/g, ' ');

const PATTERNS: RegExp[] = [
  // Overriding or discarding instructions
  /\b(?:ignore|disregard|forget|override|bypass|skip|drop|discard)\b[^.]{0,40}\b(?:previous|prior|above|earlier|all|any|your|the|these|those|system)\b[^.]{0,30}\b(?:instructions?|prompts?|rules?|guidelines?|directions?|programming|guardrails?|restrictions?|constraints?)\b/,
  /\bdo not follow (?:your|the|any) (?:instructions?|rules?|guidelines?|prompt)\b/,
  /\b(?:new|updated|real|actual|secret) (?:instructions?|rules?|system prompt|directive)s?\s*:/,
  // Asking for the hidden setup
  /\b(?:reveal|show|print|repeat|output|display|tell me|share|leak|recite|give me|what(?:'s| is| are))\b[^.]{0,40}\b(?:system prompt|initial prompt|hidden prompt|your (?:instructions|prompt|rules|programming|configuration|guidelines)|character (?:card|definition|prompt))\b/,
  /\brepeat (?:everything|all|the text|the words) (?:above|before)\b/,
  /\bwhat (?:were|are) you (?:told|instructed|programmed)\b/,
  // Persona or mode swaps
  /\b(?:you are|you're|from now on you are|act as|pretend (?:to be|you are|you're)|roleplay as|role play as|behave as|simulate)\b[^.]{0,30}\b(?:dan|jailbroken|unfiltered|unrestricted|uncensored|evil|developer mode|god mode|without (?:rules|restrictions|limits|filters))\b/,
  /\b(?:developer|debug|admin|god|sudo|jailbreak|dan) mode\b/,
  /\b(?:you have|there are) no (?:rules|restrictions|limits|filters|guidelines)\b/,
  /\bpretend (?:that )?(?:you have )?no (?:rules|restrictions|limits|filters|guidelines)\b/,
  /\bdo anything now\b/,
  /\b(?:stop|quit|no longer|don't|do not) (?:being|acting as|be) (?:a |the )?(?:coach|nenya)\b/,
  /\b(?:jailbreak|prompt injection)\b/,
  // Pretending to be the system or the developer
  /(?:^|\s)(?:system|developer|assistant)\s*:\s/,
  /\bi am (?:your|the) (?:developer|creator|admin(?:istrator)?|owner|system)\b/,
  /\bmessage from (?:the )?(?:developer|admin|system|anthropic|venice|openai)\b/,
  // Asking for output that has nothing to do with reflection
  /\b(?:translate|encode|decode)\b[^.]{0,30}\b(?:base64|rot13|hex|binary|morse)\b/,
  /\bwrite (?:me )?(?:a |some )?(?:code|script|python|javascript|sql|malware|exploit)\b/,
];

export interface GuardResult {
  blocked: boolean;
  /** Characters removed as a precaution even when nothing was blocked. */
  stripped: boolean;
}

/** True if the text looks like an attempt to manipulate the coach. */
export function looksLikeManipulation(text: string): boolean {
  const raw = text.normalize('NFKC').replace(INVISIBLE, '');
  if (TEMPLATE_TOKENS.test(raw)) {
    TEMPLATE_TOKENS.lastIndex = 0;
    return true;
  }
  const t = fold(text);
  return PATTERNS.some((p) => p.test(t));
}

/** Removes invisible characters and role/template markers. Always safe to apply. */
export function neutralize(text: string): string {
  return text.replace(INVISIBLE, '').replace(TEMPLATE_TOKENS, ' ').replace(/[ \t]{2,}/g, ' ').trim();
}

export function guard(text: string): GuardResult {
  return { blocked: looksLikeManipulation(text), stripped: neutralize(text) !== text.trim() };
}

/** Shown on the page. Plain, not accusing, and ends nowhere: the visitor can rephrase. */
export const MANIPULATION_NOTICE =
  'That message looks like an instruction to the coach rather than something about you, so it was not sent. This demo only reflects what you share about your own experience. If that is not what you meant, you can say it in your own words.';
