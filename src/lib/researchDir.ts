// Where the research pipeline keeps its files: one folder outside the repository, so downloaded datasets and the readings of replies are never committed and
// Downloads stays clear. The default is "Nenya Research" on the Desktop; NENYA_RESEARCH_DIR (a path) overrides it.
//   datasets/            downloaded prompt sets (each in its own subfolder or file; never in the repository)
//   results/public/      the files made to be published: counts and prompt ids only
//   results/private/     prompts and replies for a person to read (do not publish)
//   results/dev-checks/  the output of scripts/dev-coach.mts
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const home = (p: string): string => p.replace(/^~(?=\/|$)/, homedir());
export const researchDir = (): string => home(process.env.NENYA_RESEARCH_DIR || join('~', 'Desktop', 'Nenya Research'));
export const researchPaths = () => {
  const r = researchDir();
  return { root: r, datasets: join(r, 'datasets'), publicResults: join(r, 'results', 'public'), privateResults: join(r, 'results', 'private'), devChecks: join(r, 'results', 'dev-checks') };
};

/** Makes the folders (and a short README in the root) if they are not there. Returns the paths. */
export function ensureResearchDirs() {
  const p = researchPaths();
  for (const d of [p.datasets, p.publicResults, p.privateResults, p.devChecks]) mkdirSync(d, { recursive: true });
  const readme = join(p.root, 'README.txt');
  if (!existsSync(readme)) writeFileSync(readme, README);
  return p;
}

/** A dataset path as typed: used as it is if it exists, otherwise looked for in datasets/. */
export function resolveDataset(file: string): string {
  const direct = home(file);
  if (existsSync(direct)) return direct;
  const inside = join(researchPaths().datasets, file);
  return existsSync(inside) ? inside : direct;
}

const README = `Nenya Research: private working files for testing the coach. NOT part of the repository; do not commit or publish what is in here except as noted.

datasets/           Prompt sets downloaded from their authors (XSTest, OASST2, ...). Licences are in src/lib/testSets.ts in the repository. Do not put these in a public place
                    (the noncommercial ones, such as ESConv, may not be redistributed at all).
results/public/     Result files made to be published: counts and prompt ids only, with the credit each licence asks for. These are what you move to docs/results/ in the repository.
results/private/    The prompts and the coach's replies, for a person to read. Do not publish.
results/dev-checks/ Output of scripts/dev-coach.mts (the quick checks on the dev site). Private working notes.

The rules for publishing are in docs/results/README.md in the repository. Change this folder's place with the environment variable NENYA_RESEARCH_DIR.
`;
