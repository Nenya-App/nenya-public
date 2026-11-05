// Turns the module drafts (a framework core plus lens modules, and the richer coaching-move modules) into the one
// document the coach function reads from the private store: { core, modules: { id: text } }. Only structure lives
// here. The text itself is private and never in this repository.
import { MODULE_IDS } from './coachModules.ts';

export interface DraftModule {
  id: string;
  kind: string;
  title: string;
  guidance: string;
  steps?: string[];
  exemplars?: string[];
}
export interface MoveDraft {
  core_additions?: string[];
  modules: DraftModule[];
}
export interface LensSet {
  core: string;
  modules: Record<string, string>;
}
export interface BuildReport {
  perModule: Record<string, number>;
  coreChars: number;
  worstCaseChars: number;
  problems: string[];
}

export const NOTES_CAP = 12000;

const EXEMPLAR_HEADER = "In the coach's own words (match the tone and rhythm, adapt to this person, never recite):";

export function moduleText(m: DraftModule): string {
  const parts = [m.title.toUpperCase(), m.guidance.trim()];
  if (m.steps?.length) parts.push(m.steps.map((s, i) => `${i + 1}. ${s}`).join('\n'));
  if (m.exemplars?.length) parts.push(EXEMPLAR_HEADER + '\n' + m.exemplars.map((e) => `- "${e.trim()}"`).join('\n'));
  return parts.join('\n');
}

export function buildCombinedSet(lens: LensSet, moves: MoveDraft): { set: LensSet; report: BuildReport } {
  const problems: string[] = [];
  const modules: Record<string, string> = { ...lens.modules };
  for (const m of moves.modules) {
    if (modules[m.id] && !(m.id in lens.modules)) problems.push(`duplicate id ${m.id}`);
    modules[m.id] = moduleText(m);
  }
  const core = [lens.core.trim(), ...(moves.core_additions ?? []).map((s) => s.trim())].join('\n');

  for (const id of Object.keys(modules)) if (!MODULE_IDS.includes(id)) problems.push(`no trigger for module ${id}`);
  for (const id of MODULE_IDS) if (!modules[id]) problems.push(`trigger without text: ${id}`);
  const perModule = Object.fromEntries(Object.entries(modules).map(([id, t]) => [id, t.length]));
  // The most that can be added in one reply is three modules, so the worst case is the core plus the three longest.
  const longest = Object.values(perModule).sort((a, b) => b - a).slice(0, 3);
  const worstCaseChars = core.length + longest.reduce((a, n) => a + n + 2, 0);
  if (worstCaseChars > NOTES_CAP) problems.push(`worst case ${worstCaseChars} characters exceeds the ${NOTES_CAP} cap`);
  return { set: { core, modules }, report: { perModule, coreChars: core.length, worstCaseChars, problems } };
}
