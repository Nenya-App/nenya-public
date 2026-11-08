// Image descriptions: one written set (docs/brand/alt-text.md) that the site uses and the marketing posts can point at,
// and a check that every image in the source has an alt attribute that is not a file name or filler.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import * as A from '../src/lib/altText.ts';
import { ok } from './helpers.mts';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (f: string) => readFileSync(join(root, f), 'utf8');
const doc = read('docs/brand/alt-text.md');
const walk = (d: string): string[] => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });

// ---- the shared file and the code say the same thing
const quoted = (heading: string): string => {
  const at = doc.indexOf(heading);
  const m = at < 0 ? null : doc.slice(at).match(/\n> (.+)/);
  return m ? m[1].trim() : '';
};
ok('the short logo text is the same in the shared file and the code', quoted('**Short** (') === A.LOGO_ALT_SHORT);
ok('so is the version without orbs', quoted('**Short, without the orbs**') === A.LOGO_ALT_NO_ORBS);
ok('so is the long version', quoted('**Long** (') === A.LOGO_ALT_LONG);
ok('the table gives the same words for the visitor\'s own pictures', doc.includes(A.DRAWING_ALT_PRESENT) && doc.includes(A.DRAWING_ALT_WISH) && doc.includes(A.BODY_MAP_ALT));
ok('the link-preview text in index.html is the short logo text', read('index.html').includes(`property="og:image:alt" content="${A.LOGO_ALT_SHORT}"`));

// ---- the rules
const texts = [A.LOGO_ALT_SHORT, A.LOGO_ALT_NO_ORBS, A.LOGO_ALT_LONG, A.DRAWING_ALT_PRESENT, A.DRAWING_ALT_WISH, A.BODY_MAP_ALT];
ok('no description starts with filler or reads as a file name', texts.every((t) => !/^(image|picture|photo|logo) of\b/i.test(t) && !/\.(png|jpe?g|webp|svg|gif)\b/i.test(t)));
ok('the short descriptions stay short (one sentence, under 160 characters)', A.LOGO_ALT_SHORT.length < 160 && A.LOGO_ALT_NO_ORBS.length < 160);
ok('the visitor\'s own pictures are not described as if we could see them', [A.DRAWING_ALT_PRESENT, A.DRAWING_ALT_WISH].every((t) => /cannot describe/.test(t)));

// ---- every image in the source has an alt attribute
const files = walk(join(root, 'src')).filter((f) => /\.tsx$/.test(f));
const problems: string[] = [];
let imgCount = 0;
for (const f of files) {
  const s = readFileSync(f, 'utf8');
  for (const m of s.matchAll(/<img\b[\s\S]*?\/>|<img\b[\s\S]*?>/g)) {
    imgCount++;
    const tag = m[0];
    const rel = f.slice(root.length);
    if (!/\balt\s*=/.test(tag)) { problems.push(`${rel}: an <img> has no alt`); continue; }
    const lit = tag.match(/\balt\s*=\s*"([^"]*)"/);
    if (lit && /^(image|picture|photo|logo|nenya logo)$/i.test(lit[1].trim())) problems.push(`${rel}: filler alt "${lit[1]}"`);
    if (lit && /\.(png|jpe?g|webp|svg|gif)\b/i.test(lit[1])) problems.push(`${rel}: alt looks like a file name`);
  }
}
ok(`every <img> in the source (${imgCount}) has an alt attribute that is not filler`, imgCount > 5 && problems.length === 0, problems.join('; '));
const logo = read('src/app/components/NenyaLogo.tsx');
ok('the logo is decorative unless a description is passed, and never says "Nenya Logo"', /alt = ''/.test(logo) && /alt=\{alt\}/.test(logo) && !/alt="Nenya Logo"/.test(logo));
ok('the welcome page describes the logo (without orbs when they are off), and the name page uses the long text', /alt=\{orbitEnabled \? LOGO_ALT_SHORT : LOGO_ALT_NO_ORBS\}/.test(read('src/app/components/pages/WelcomePage.tsx')) && /alt=\{LOGO_ALT_LONG\}/.test(read('src/app/components/about/NamePhilosophy.tsx')));
ok('the review page uses text-alternative alts for the visitor\'s pictures', /alt=\{DRAWING_ALT_PRESENT\}/.test(read('src/app/components/pages/GatewayReviewPage.tsx')) && /alt=\{BODY_MAP_ALT\}/.test(read('src/app/components/pages/GatewayReviewPage.tsx')));
