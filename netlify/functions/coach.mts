// Demo relay for the Nenya coach: the browser talks only to this function, and
// this function talks to Venice AI, so the Venice key never reaches a browser.
//
// Stateless by design: nothing is stored, message text is never logged, and the
// turn count is carried by a signed ticket instead of a database.
//
// Environment (Netlify, production, Functions scope):
//   VENICE_API_KEY       secret   Venice API key
//   COACH_TICKET_SECRET  secret   long random string for signing tickets
//   COACH_ENABLED        plain    "true" to accept requests
//   COACH_SIGNING_KEY    secret   optional, base64 Ed25519 private key (PKCS8 DER) for
//                                 signing transcript receipts
//   COACH_MODEL          plain    optional, overrides DEFAULT_MODEL
//   COACH_CHARACTER_SLUG plain    optional, overrides DEFAULT_CHARACTER_SLUG
import { createHash, createHmac, createPrivateKey, createPublicKey, sign as edSign, timingSafeEqual } from 'node:crypto';
import { detectFlag } from '../../src/lib/safetyFlags.ts';
import { scrubPII } from '../../src/lib/piiScrub.ts';

const MAX_TURNS = 5;
const MAX_USER_CHARS = 500;
const MAX_ASSISTANT_CHARS = 3000;
const MAX_REPLY_TOKENS = 300;
const MAX_BODY_BYTES = 16000;
const TICKET_TTL_MS = 30 * 60 * 1000;
const VENICE_TIMEOUT_MS = 20000;

const VENICE_URL = 'https://api.venice.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'deepseek-v3.2'; // Venice "Private" tier
const DEFAULT_CHARACTER_SLUG = 'nenya-20';

const ROUTE = '/api/coach';

const ALLOWED_HOSTS = new Set(['nenya.biz', 'www.nenya.biz', 'localhost', '127.0.0.1']);

type Role = 'user' | 'assistant';
interface Msg {
  role: Role;
  content: string;
}

const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

const clean = (s: string): string =>
  s
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/[‪-‮⁦-⁩​-‏]/g, '')
    .trim();

const sha256 = (s: string): string => createHash('sha256').update(s).digest('hex');

function sign(secret: string, completed: number, issuedAt: number, history: Msg[]): string {
  const mac = createHmac('sha256', secret)
    .update(`${completed}|${issuedAt}|${sha256(JSON.stringify(history))}`)
    .digest('base64url');
  return `${issuedAt}.${mac}`;
}

function verify(secret: string, ticket: unknown, completed: number, history: Msg[]): boolean {
  if (typeof ticket !== 'string') return false;
  const [issuedRaw, mac] = ticket.split('.');
  const issuedAt = Number(issuedRaw);
  if (!Number.isFinite(issuedAt) || !mac) return false;
  const age = Date.now() - issuedAt;
  if (age < -60000 || age > TICKET_TTL_MS) return false;
  const expected = sign(secret, completed, issuedAt, history);
  const a = Buffer.from(expected);
  const b = Buffer.from(ticket);
  return a.length === b.length && timingSafeEqual(a, b);
}

function parseMessages(raw: unknown, endsWith: Role = 'user'): Msg[] | null {
  const max = endsWith === 'user' ? MAX_TURNS * 2 - 1 : MAX_TURNS * 2;
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > max) return null;
  if (endsWith === 'user' ? raw.length % 2 === 0 : raw.length % 2 === 1) return null;
  const out: Msg[] = [];
  for (let i = 0; i < raw.length; i++) {
    const m = raw[i] as { role?: unknown; content?: unknown };
    const expected: Role = i % 2 === 0 ? 'user' : 'assistant';
    if (!m || m.role !== expected || typeof m.content !== 'string') return null;
    const content = clean(m.content);
    const limit = expected === 'user' ? MAX_USER_CHARS : MAX_ASSISTANT_CHARS;
    if (content.length < 1 || content.length > limit) return null;
    out.push({ role: expected, content });
  }
  return out;
}

// ── Signed transcripts ─────────────────────────────────────────────────────
// A receipt proves a transcript matches an exchange this server actually produced
// (the ticket binds every reply), and dates it. Nothing is stored: the server
// verifies, signs a hash and a timestamp, and returns it.
function signingKey() {
  const b64 = process.env.COACH_SIGNING_KEY;
  if (!b64) return null;
  try {
    const key = createPrivateKey({ key: Buffer.from(b64, 'base64'), format: 'der', type: 'pkcs8' });
    const spki = createPublicKey(key).export({ type: 'spki', format: 'der' }) as Buffer;
    return { key, publicKey: spki.toString('base64'), keyId: sha256(spki.toString('base64')).slice(0, 16) };
  } catch {
    return null;
  }
}

// Canonical form that gets hashed. Documented in docs/coach-transcripts.md.
const canonicalTranscript = (messages: Msg[]): string =>
  JSON.stringify({ v: 1, messages: messages.map((m) => ({ role: m.role, content: m.content })) });

function systemInstruction(turn: number, softened: boolean): string {
  const parts = [
    `This is a short demonstration limited to ${MAX_TURNS} exchanges. This is exchange ${turn} of ${MAX_TURNS}.`,
    'Reply in two to four short sentences of plain language.',
    'Reflect what you hear, name the feeling or need underneath if you can, and offer at most one gentle question or one invitation to take a slow breath.',
    'Do not give advice or diagnoses. Do not invite the person to keep talking. Never claim to be a therapist.',
  ];
  if (softened) {
    parts.push(
      'The latest message may signal distress. Respond briefly and with care. Acknowledge what the person said without probing or interpreting it, do not give advice, and gently encourage them to reach a person they trust or a crisis line (988 in the US). You are not able to help in a crisis.'
    );
  }
  if (turn === MAX_TURNS) {
    parts.push(
      'This is the final exchange. Close warmly, name one thing you heard, and invite one slow breath. Do not ask a question.'
    );
  } else if (turn === MAX_TURNS - 1) {
    parts.push('One more exchange remains after this one, so begin to settle toward a close.');
  }
  return parts.join(' ');
}

export default async (req: Request): Promise<Response> => {
  // Only the rate-limited public route is served; the default
  // /.netlify/functions/coach address would sidestep the limit.
  const url = new URL(req.url);
  if (url.pathname !== ROUTE) return json(404, { error: 'not found' });
  if (req.method === 'GET' && url.searchParams.has('key')) {
    const k = signingKey();
    return k
      ? json(200, { algorithm: 'Ed25519', keyId: k.keyId, publicKey: k.publicKey })
      : json(404, { error: 'signing-off' });
  }
  if (req.method !== 'POST') return json(405, { error: 'method' });
  if (process.env.COACH_ENABLED !== 'true') return json(503, { error: 'off' });

  const apiKey = process.env.VENICE_API_KEY;
  const secret = process.env.COACH_TICKET_SECRET;
  if (!apiKey || !secret) return json(500, { error: 'config' });

  // Browsers always send Origin on a cross-origin-capable POST. This is a courtesy
  // check against casual misuse, not a security boundary.
  const origin = req.headers.get('origin');
  let originHost = '';
  try {
    originHost = origin ? new URL(origin).hostname : '';
  } catch {
    originHost = '';
  }
  if (!ALLOWED_HOSTS.has(originHost)) return json(403, { error: 'origin' });
  if (!(req.headers.get('content-type') || '').includes('application/json')) return json(415, { error: 'type' });

  const text = await req.text();
  if (text.length > MAX_BODY_BYTES) return json(413, { error: 'size' });
  let body: { messages?: unknown; ticket?: unknown };
  try {
    body = JSON.parse(text);
  } catch {
    return json(400, { error: 'json' });
  }

  if ((body as { action?: unknown }).action === 'receipt') {
    const done = parseMessages(body.messages, 'assistant');
    if (!done) return json(400, { error: 'messages' });
    if (!verify(secret, body.ticket, done.length / 2, done)) return json(400, { error: 'ticket' });
    const k = signingKey();
    if (!k) return json(503, { error: 'signing-off' });
    const hash = sha256(canonicalTranscript(done));
    const issuedAt = new Date().toISOString();
    const signature = edSign(null, Buffer.from(`nenya-coach-transcript-v1\n${hash}\n${issuedAt}`), k.key).toString('base64');
    return json(200, {
      receipt: { version: 1, algorithm: 'Ed25519', keyId: k.keyId, publicKey: k.publicKey, hash, issuedAt, signature },
    });
  }

  const messages = parseMessages(body.messages);
  if (!messages) return json(400, { error: 'messages' });

  const turn = (messages.length + 1) / 2; // this exchange's number, 1-based
  if (turn > MAX_TURNS) return json(400, { error: 'turns' });

  if (turn > 1) {
    const history = messages.slice(0, -1);
    if (!verify(secret, body.ticket, turn - 1, history)) return json(400, { error: 'ticket' });
  }

  // Stop-tier flags never reach the AI: the page shows resources and the conversation ends.
  const flag = detectFlag(messages[messages.length - 1].content);
  if (flag?.tier === 'stop') {
    return json(200, { done: true, flag });
  }

  const model = process.env.COACH_MODEL || DEFAULT_MODEL;
  const slug = process.env.COACH_CHARACTER_SLUG || DEFAULT_CHARACTER_SLUG;

  let reply = '';
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), VENICE_TIMEOUT_MS);
    const res = await fetch(VENICE_URL, {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemInstruction(turn, flag?.tier === 'soften') },
          // Scrubbed again here in case the page was bypassed.
          ...messages.map((m) => (m.role === 'user' ? { ...m, content: scrubPII(m.content).text } : m)),
        ],
        temperature: 0.7,
        top_p: 0.9,
        repetition_penalty: 1.1,
        max_completion_tokens: MAX_REPLY_TOKENS,
        stream: false,
        venice_parameters: {
          character_slug: slug,
          include_venice_system_prompt: process.env.COACH_INCLUDE_VENICE_PROMPT === 'true',
          enable_web_search: 'off',
          enable_web_scraping: false,
          enable_web_citations: false,
          strip_thinking_response: true,
        },
      }),
    });
    clearTimeout(timer);
    if (!res.ok) {
      console.error('coach: venice status', res.status); // status only, never content
      return json(502, { error: 'upstream' });
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    reply = clean((data.choices?.[0]?.message?.content ?? '').replace(/<think>[\s\S]*?<\/think>/gi, ''));
  } catch {
    console.error('coach: venice request failed');
    return json(502, { error: 'upstream' });
  }
  if (!reply) return json(502, { error: 'empty' });
  if (reply.length > MAX_ASSISTANT_CHARS) reply = reply.slice(0, MAX_ASSISTANT_CHARS);

  const history = [...messages, { role: 'assistant' as const, content: reply }];
  const ticket = sign(secret, turn, Date.now(), history);
  return json(200, { reply, ticket, turn, done: turn >= MAX_TURNS, ...(flag ? { flag } : {}) });
};

// Literal values on purpose: Netlify reads this block by static analysis, so it
// cannot follow constants. Keep `path` in step with ROUTE above.
// ~40 requests a minute per visitor: a room of people sharing venue Wi-Fi can
// each finish a turn, while a script is cut off. Netlify takes up to ~10 seconds
// to start enforcing, and invalid rules do not fail the deploy, so check the
// deploy log's post-processing step after changing this.
export const config = {
  path: '/api/coach',
  rateLimit: {
    windowLimit: 40,
    windowSize: 60,
    aggregateBy: ['ip', 'domain'],
  },
};
