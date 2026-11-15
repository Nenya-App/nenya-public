// A rough, honest footprint calculator for Nenya (docs/ghost-footprint-stack.md). Every figure here is either measured
// (bytes, request counts, token counts) or an assumption with its source named, and results are ranges, low to high.
// Before citing a number, check the per-gigabyte figures against CO2.js (Green Web Foundation), which implements the
// Sustainable Web Design model, and use the real grid intensity of each data centre.

export interface Range {
  low: number;
  high: number;
}
const r = (low: number, high: number): Range => ({ low, high });
const add = (...xs: Range[]): Range => xs.reduce((a, b) => r(a.low + b.low, a.high + b.high), r(0, 0));
const scale = (x: Range, k: number): Range => r(x.low * k, x.high * k);

/** Energy per gigabyte transferred, by model version (kWh/GB), and the grid it assumes (g CO2e per kWh). */
export const TRANSFER_MODELS = {
  // Sustainable Web Design v3 (2022): 0.81 kWh/GB in total, at a global average grid of about 442 g/kWh.
  swd3: { kWhPerGB: 0.81, grid: 442 },
  // Sustainable Web Design v4 (2024): operational 0.055 data centres + 0.059 networks + 0.080 devices, embodied 0.012 + 0.013 + 0.081.
  swd4: { kWhPerGB: 0.055 + 0.059 + 0.08 + 0.012 + 0.013 + 0.081, grid: 494 },
} as const;
export type TransferModel = keyof typeof TRANSFER_MODELS;

/** Transfer: the range across both model versions, so a reader can see how much the choice of model matters. */
export function transfer(bytes: number): { wh: Range; g: Range } {
  const gb = bytes / 1e9;
  const v = Object.values(TRANSFER_MODELS).map((m) => ({ wh: gb * m.kWhPerGB * 1000, g: gb * m.kWhPerGB * m.grid }));
  return { wh: r(Math.min(...v.map((x) => x.wh)), Math.max(...v.map((x) => x.wh))), g: r(Math.min(...v.map((x) => x.g)), Math.max(...v.map((x) => x.g))) };
}

/** Assumptions for AI inference. Small (7-8B) models on a current data-centre GPU, from public measurements (ML.ENERGY, AI Energy Score). */
export const INFERENCE = {
  /** Joules per generated token. */
  jPerOutputToken: r(0.05, 0.5),
  /** A prompt token costs about a tenth of a generated one (prefill is batched). */
  promptShare: 0.1,
  /** Data centre overhead (PUE and idle capacity), plus a little for running inside a secure enclave. */
  overhead: r(1.1, 1.5),
  /** Grid for the inference data centre, g/kWh (unknown: a wide range). */
  grid: r(250, 450),
};

export function inference(promptTokens: number, outputTokens: number): { wh: Range; g: Range } {
  const tokens = outputTokens + promptTokens * INFERENCE.promptShare;
  const wh = r((tokens * INFERENCE.jPerOutputToken.low * INFERENCE.overhead.low) / 3600, (tokens * INFERENCE.jPerOutputToken.high * INFERENCE.overhead.high) / 3600);
  return { wh, g: r((wh.low / 1000) * INFERENCE.grid.low, (wh.high / 1000) * INFERENCE.grid.high) };
}

/** A serverless function call that does little work (a short request, a small store read or write). An estimate. */
export const FUNCTION_CALL_WH = r(0.0002, 0.002);
export const SERVER_GRID = r(350, 450); // US East (Ohio), where the functions run

/** The visitor's device while Nenya is on screen: mostly the screen, plus a little for animation. Watts. */
export const DEVICE_W = { phone: r(1, 3), laptop: r(5, 15) };
export const DEVICE_GRID = r(300, 500);

export interface Row {
  task: string;
  option: string;
  wh: Range;
  g: Range;
  notes: string;
}

const row = (task: string, option: string, parts: { wh: Range; g: Range }[], notes: string): Row => ({ task, option, wh: add(...parts.map((p) => p.wh)), g: add(...parts.map((p) => p.g)), notes });
const device = (minutes: number, kind: 'phone' | 'laptop' = 'phone') => {
  const wh = scale(DEVICE_W[kind], minutes / 60);
  return { wh, g: r((wh.low / 1000) * DEVICE_GRID.low, (wh.high / 1000) * DEVICE_GRID.high) };
};
const calls = (n: number) => ({ wh: scale(FUNCTION_CALL_WH, n), g: r((n * FUNCTION_CALL_WH.low / 1000) * SERVER_GRID.low, (n * FUNCTION_CALL_WH.high / 1000) * SERVER_GRID.high) });

/** What the scenarios need to know about the build. Measured by scripts/footprint.mjs; these defaults are the 2026-11-11 staging measurements. */
export interface Measured {
  /** Compressed bytes of a first visit's page, scripts, styles, fonts and small logo images, without the gem. */
  firstVisitBase: number;
  /** The gem sprite. */
  sprite: number;
  /** The live gem's code. */
  liveGemCode: number;
  /** A return visit (the page itself; everything else is cached). */
  returnVisit: number;
  /** The coach page's own code. */
  coachCode: number;
  /** Tokens in a whole five-exchange coach conversation (the instruction and history are sent again every turn). */
  coachPromptTokens: number;
  coachOutputTokens: number;
}

export const STAGING_2026_11_11: Measured = {
  firstVisitBase: 284_000,
  sprite: 809_112,
  liveGemCode: 3_900,
  returnVisit: 2_012,
  coachCode: 48_000,
  coachPromptTokens: 17_500,
  coachOutputTokens: 750,
};

/** Every option the stack offers, as rows that can be compared. */
export function scenarios(m: Measured = STAGING_2026_11_11): Row[] {
  const coach = inference(m.coachPromptTokens, m.coachOutputTokens);
  const coachBytes = 5 * 6_000; // five requests and replies of a few KB each
  const sealedBytes = 5 * 24_000; // ciphertext is about four times the text, as hex, and earlier replies are sent again
  const fixedPolls = (20 * 60) / 1.5;
  const adaptivePolls = 250; // 1.5 s after activity, easing to 15 s when quiet (src/lib/cellClient.ts)
  return [
    row('First visit', 'Today: sprite gem', [transfer(m.firstVisitBase + m.sprite)], 'The sprite is most of it.'),
    row('First visit', 'Live gem', [transfer(m.firstVisitBase + m.liveGemCode)], 'The gem is drawn on the device instead.'),
    row('Return visit', 'Any', [transfer(m.returnVisit)], 'Everything else is cached for a year.'),
    row('10-minute check-in', 'Phone', [device(10)], 'All on the device; the screen is most of it.'),
    row('Coach conversation (5 exchanges)', 'Witnessed (relay reads, checks and signs)', [coach, transfer(m.coachCode + coachBytes), calls(5)], 'Inference is most of it; the prompt is resent every turn.'),
    row('Coach conversation (5 exchanges)', 'Sealed (encrypted in the browser)', [coach, transfer(m.coachCode + sealedBytes), calls(6)], 'The same model work; one more call (the enclave check) and larger requests.'),
    row('Coach conversation (5 exchanges)', 'Large general AI service, for comparison', [{ wh: r(1.2, 1.7), g: r(0.5, 0.75) }], 'Published per-prompt figures (about 0.24-0.34 Wh each), five prompts.'),
    row('Partner cell, 20 minutes', 'Mailbox, fixed 1.5 s polling', [calls(fixedPolls * 2), transfer(fixedPolls * 2 * 600)], 'Two people polling every 1.5 s.'),
    row('Partner cell, 20 minutes', 'Mailbox, adaptive polling (built)', [calls(adaptivePolls * 2), transfer(adaptivePolls * 2 * 600)], 'Slows to 15 s when quiet; stops when the tab is hidden.'),
    row('Partner cell, 20 minutes', 'Direct (WebRTC), for comparison', [calls(6), transfer(50_000)], 'Only the introduction goes through a server; not built.'),
    row('On-device model, one-time download', 'Small model (about 0.4 GB)', [transfer(0.4e9)], 'A privacy choice, not a greener one: equal to hundreds of server conversations.'),
    row('On-device model, one-time download', 'Medium model (about 1 GB)', [transfer(1e9)], 'As above.'),
  ];
}

const fmt = (x: number): string => (x === 0 ? '0' : x < 0.001 ? x.toExponential(1) : x < 1 ? x.toPrecision(2) : x < 100 ? x.toFixed(1) : Math.round(x).toLocaleString('en-US'));
export const range = (x: Range): string => `${fmt(x.low)} – ${fmt(x.high)}`;

/** The scenarios as a Markdown table. */
export function table(rows: Row[] = scenarios()): string {
  const head = '| Task | Option | Energy (Wh) | CO₂e (g) | Notes |\n|---|---|---|---|---|';
  return [head, ...rows.map((x) => `| ${x.task} | ${x.option} | ${range(x.wh)} | ${range(x.g)} | ${x.notes} |`)].join('\n');
}
