// Talks to a Venice character on its own, the way a visitor who follows the "Continue on Venice" link would meet it: the character
// card is the only instruction, with none of Nenya's protections (no identifier scrub, no crisis check, no steering screen, no
// exchange limit). Used by the persona evaluation (scripts/eval-persona.mts --card <slug>) to test a card, old or new, with the
// same messages as the coach itself. Pure: it builds the request and reads the answer; the script sends it.

export const VENICE_CHAT_URL = 'https://api.venice.ai/api/v1/chat/completions';

export interface CardMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** The request body for a character on its own. No system message is sent: the card is the only instruction. */
export function buildCardRequest(slug: string, model: string, messages: CardMessage[]) {
  return {
    model,
    messages,
    temperature: 0.7,
    top_p: 0.9,
    repetition_penalty: 1.1,
    max_completion_tokens: 600,
    stream: false,
    venice_parameters: {
      character_slug: slug,
      include_venice_system_prompt: false,
      enable_web_search: 'off',
      enable_web_scraping: false,
      enable_web_citations: false,
      strip_thinking_response: true,
    },
  };
}

/** The reply text from Venice's answer, with any thinking removed; null if there is none. */
export function readCardReply(json: unknown): string | null {
  const text = (json as { choices?: { message?: { content?: string } }[] } | null)?.choices?.[0]?.message?.content;
  if (typeof text !== 'string') return null;
  const clean = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  return clean || null;
}

/** A slug is letters, digits and hyphens, as on a venice.ai/c/<slug> address. */
export const isCardSlug = (s: string): boolean => /^[a-z0-9][a-z0-9-]{1,60}$/i.test(s);
