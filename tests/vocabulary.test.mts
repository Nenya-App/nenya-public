// The lens vocabulary (src/lib/vocabulary.ts, docs/lens-vocabulary-audit.md): off changes nothing; on says lens and Pattern; and no visitor-facing string outside the listed
// About pages (still to be rewritten with the owner) says "gateway" without going through L().
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { L, sixthLensName } from '../src/lib/vocabulary.ts';
import { ok } from './helpers.mts';

ok('off: every string comes back unchanged', L('The six gateways: Sight, Sound, Touch, Essence, Movement and Insight', false) === 'The six gateways: Sight, Sound, Touch, Essence, Movement and Insight' && sixthLensName(false) === 'Insight');
ok('on: gateway becomes lens in every case and number', L('The Six Gateways', true) === 'The Six Lenses' && L('one gateway or all gateways', true) === 'one lens or all lenses' && L('Next Gateway', true) === 'Next Lens' && L('Welcome to the Sight Gateway', true) === 'Welcome to the Sight Lens');
ok('on: the sixth lens is Pattern where its siblings or the old word are in the text', L('Movement and Insight', true) === 'Movement and Pattern' && L("Nenya's Insight gateway", true) === "Nenya's Pattern lens" && L('an Insight gateway', true) === 'a Pattern lens' && sixthLensName(true) === 'Pattern');
ok('on: the word Insight alone, with no lens around it, is left alone', L('This gives you insight and Insights', true) === 'This gives you insight and Insights');
ok('on: a string without the old words is unchanged', L('Breathe slowly', true) === 'Breathe slowly');

// Scan: string literals that say gateway (with a space around it, so not ids or routes) must be inside L(...), except in the About pages still to be rewritten.
const PENDING = new Set([
  'src/app/components/about/SixGateways.tsx', 'src/app/components/about/BioSocialDesign.tsx', 'src/app/components/about/HumanCenteredDesign.tsx', 'src/app/components/about/TheoryU.tsx',
  'src/app/components/about/NamePhilosophy.tsx', 'src/app/components/about/PrivacyPromise.tsx', 'src/app/components/SupportThisWork.tsx', 'src/app/components/about/SupportUs.tsx', 'src/lib/aboutEvalCorpus.ts',
]);
const walk = (d: string): string[] => readdirSync(d).flatMap((n) => { const p = `${d}/${n}`; return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(p) ? [p] : []; });
const lit = /'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`/g;
const strays: string[] = [];
for (const f of walk('src')) {
  if (PENDING.has(f) || f.endsWith('vocabulary.ts')) continue;
  readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
    if (/^\s*(\/\/|\/\*|\*|\{\/\*)/.test(line)) return;
    for (const m of line.matchAll(lit)) {
      const body = m[0].slice(1, -1).replace(/L\((?:'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")\)/g, '').replace(/\$\{[^}]*\}/g, '');
      if (!/(^|[^\w-])[Gg]ateways?([^\w-]|$)/.test(body) || !/\s/.test(body) && !/^[A-Z]/.test(body)) continue;
      if (/^[a-z0-9-]+$/.test(body)) continue;
      const before = line.slice(0, m.index);
      if (/L\($/.test(before) || /\$\{L\($/.test(before)) continue;
      strays.push(`${f}:${i + 1}: ${body.slice(0, 50)}`);
    }
  });
}
ok('no visitor-facing string says gateway outside L() (except the listed About pages)', strays.length === 0, strays.slice(0, 5).join(' | '));
ok('the About pages still to be rewritten are the only ones that keep the old word in prose', [...PENDING].every((f) => /ateway/.test(readFileSync(f, 'utf8'))));
