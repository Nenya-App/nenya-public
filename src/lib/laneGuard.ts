// The coach's lane: it works with words about what the person is going through. It never makes images, drawings, video, audio, documents or other files, does not write code,
// stories or other pieces for people, and does not give financial, medical or legal advice. The model alone did not hold this (the first OASST2 run wrote code, a story, a Pokémon design and a bitcoin trading
// strategy), so the site recognizes these requests and answers them itself, kindly, in fixed words that are in the public source code. Questions about the world ("what is the capital of Austria") are not
// here: the coach answers those briefly. A request that is about the person ("help me write what to say to my sister") is never matched: only the named kinds of thing below are.
// The checks are phrase checks: they miss some requests and can match an odd sentence, so they are tuned to refuse only when the request is plain.

export type Lane = 'media' | 'task' | 'advice';

// A request aimed at the coach: "can you ...", "please ...", "I need you to ...", or a bare command at the start.
const ASK = String.raw`(?:(?:can|could|would|will|may)\s+you\s+(?:please\s+)?|please\s+|i\s+(?:need|want|would\s+like|'d\s+like)\s+you\s+to\s+|^\s*(?:hey,?\s+|hi,?\s+|ok,?\s+)?)`;

const MEDIA_NOUN = String.raw`(?:images?|pictures?|photos?|photographs?|drawings?|sketch(?:es)?|paintings?|illustrations?|logos?|icons?|posters?|memes?|gifs?|videos?|animations?|cartoons?|diagrams?|charts?|graphs?|infographics?|pdfs?|word\s+docs?|documents?|spreadsheets?|powerpoints?|slides?|slide\s+decks?|presentations?|audio|songs?|music|melod(?:y|ies)|beats?|voice\s+recordings?|files?)`;
const MEDIA = [
  // "draw me ...", "draw a picture", "paint a ...", "sketch ..."
  new RegExp(`${ASK}(?:draw|paint|sketch|illustrate|animate|render|photoshop)\\s+(?:me\\b|(?:a|an|the|some|my|us)\\s+)`, 'i'),
  // "make/create/generate/design/produce/compose ... <media>"
  new RegExp(`${ASK}(?:make|create|generate|produce|design|compose|record|export|send|give|show)\\s+(?:me\\s+)?(?:an?\\s+|the\\s+|some\\s+|my\\s+)?(?:\\w+\\s+){0,3}${MEDIA_NOUN}\\b`, 'i'),
  /\b(?:text|prompt)[ -]to[ -](?:image|video|speech|music)\b/i,
];

const TASK_NOUN = String.raw`(?:code|program|script|app|website|web\s+page|function|algorithm|sql|query|regex|html|css|javascript|python|java|typescript|c\+\+|rust|golang|go\s+code|story|short\s+story|poem|poetry|lyrics|haiku|sonnet|limerick|essay|article|blog(?:\s+post)?|press\s+release|report|joke|riddle|recipe|itinerary|lesson\s+plan|business\s+plan|slogan|tagline|marketing\s+copy|cover\s+letter|r[ée]sum[ée]|rocket)`;
const TASK = [
  new RegExp(`${ASK}(?:write|create|generate|build|make|code|program|develop|draft|compose|design|provide|give|tell)\\s+(?:me\\s+)?(?:an?\\s+|some\\s+|the\\s+)?(?:\\w+\\s+){0,3}${TASK_NOUN}\\b`, 'i'),
  new RegExp(`${ASK}(?:help\\s+me\\s+)(?:build|code|program|debug|write)\\s+(?:an?\\s+|some\\s+|the\\s+)?(?:\\w+\\s+){0,3}${TASK_NOUN}\\b`, 'i'),
  /\b(?:in|using)\s+(?:python|javascript|java|typescript|c\+\+|rust|golang|sql|julia|bash|php|ruby|swift|kotlin)\b[^.?!]{0,40}\b(?:how\s+(?:do|can)\s+i|write|create|function|code)\b|\bhow\s+(?:do|can)\s+i\b[^.?!]{0,50}\b(?:in\s+(?:python|javascript|java|typescript|c\+\+|rust|golang|go|sql|julia|bash|php|ruby|swift|kotlin)|with\s+(?:react|pandas|numpy|tensorflow))\b/i,
];

const ADVICE = [
  // financial: a request for a strategy, tips or what to buy or sell
  /\b(?:strateg(?:y|ies)|tips?|advice|recommend(?:ation)?s?|best\s+way|how\s+(?:do|can|should)\s+i|should\s+i)\b[^.?!]{0,60}\b(?:trade|trading|invest|investing|buy|sell)\b[^.?!]{0,40}\b(?:bitcoin|crypto(?:currency)?|stocks?|shares|etfs?|forex|options|dexes?|portfolio|index\s+funds?|bonds?)\b/i,
  /\b(?:trade|trading|invest(?:ing)?|buy|sell)\b[^.?!]{0,30}\b(?:bitcoin|crypto(?:currency)?|stocks?|forex|dexes?)\b[^.?!]{0,30}\b(?:strateg(?:y|ies)|tips?|advice)\b/i,
  // medical: what to take, how much, whether it is safe to combine
  /\b(?:what|which)\s+(?:medication|medicine|dose|dosage|pills?|drugs?)\s+(?:should|can|do)\s+i\b|\bhow\s+(?:much|many)\b[^.?!]{0,30}\b(?:mg|milligrams?|pills?|tablets?)\b[^.?!]{0,20}\b(?:should|can)\s+i\b|\bis\s+it\s+safe\s+to\s+(?:take|combine|mix)\b[^.?!]{0,40}\b(?:with|and)\b/i,
  // legal: can I sue, how to file
  /\bcan\s+i\s+sue\b|\bhow\s+(?:do|can|should)\s+i\s+file\s+(?:for|a)\s+(?:divorce|bankruptcy|custody|lawsuit|restraining\s+order|claim)\b|\b(?:legal\s+advice|is\s+it\s+(?:legal|illegal)\s+to)\b/i,
];

/** The kind of request this message plainly is, or null. Media comes first (always refused), then advice, then tasks. */
export function laneFor(text: string): Lane | null {
  const t = text.normalize('NFKC').slice(0, 600);
  if (MEDIA.some((r) => r.test(t))) return 'media';
  if (ADVICE.some((r) => r.test(t))) return 'advice';
  if (TASK.some((r) => r.test(t))) return 'task';
  return null;
}

const CORE: Record<Lane, string> = {
  media: 'I can\'t make images, drawings, video, audio, documents or any other files. I only work with words, and only about what you are going through.',
  task: 'I can\'t write code, stories, poems or other pieces for you. This is a place to put into words what you are going through, not a tool for making things.',
  advice: 'I can\'t give financial, medical or legal advice. A professional can, and for a decision that matters that is the safer place to go.',
};
const BRIDGE: Record<Lane, string> = {
  media: 'If something is behind the request, such as a feeling you wanted to put into a picture or a song, you can tell me about that instead.',
  task: 'If something is behind the request, such as pressure or a worry about it, you can tell me about that instead.',
  advice: 'If worry about the decision is weighing on you, I am glad to hear what that is like.',
};

/** The site's reply. The last exchange has no invitation, so it ends on the plain statement. */
export const laneReply = (lane: Lane, last: boolean): string => (last ? CORE[lane] : `${CORE[lane]} ${BRIDGE[lane]}`);

/** Every fixed reply (so a signed transcript can mark them as written by the site). */
export const LANE_REPLIES: string[] = (['media', 'task', 'advice'] as Lane[]).flatMap((l) => [laneReply(l, true), laneReply(l, false)]);
export const isLaneReply = (content: string): boolean => LANE_REPLIES.includes(content);
