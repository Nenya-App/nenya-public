// The coach's instruction wordings, by name. 'v1' is the original; 'v2' adds what the coach is and the distress rule
// (docs/coach-instructions-v2.md); 'v2.1' is v2 trimmed so each rule is said once (docs/coach-instructions-v2.1.md).
export const INSTRUCTION_VERSIONS = ['v1', 'v2', 'v2.1'] as const;
export type InstructionsVersion = (typeof INSTRUCTION_VERSIONS)[number];
export const isInstructionsVersion = (v: unknown): v is InstructionsVersion => typeof v === 'string' && (INSTRUCTION_VERSIONS as readonly string[]).includes(v);
