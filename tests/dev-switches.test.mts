// The three lens and Terms-first switches are on in every build of the repository and in local dev (owner, 2026-11-18). They sit in [build.environment] so the dev site is covered
// whichever Netlify context it builds in; a variable in a site's own settings overrides them.
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';

const toml = readFileSync('netlify.toml', 'utf8');
const dev = readFileSync('.env.development', 'utf8');
const block = toml.slice(toml.indexOf('[build.environment]'), toml.indexOf('[functions]'));
ok('every build has the three switches on (set for all contexts, not only a branch)', ['VITE_LENS_COPY', 'VITE_LENS_TRAY', 'VITE_TERMS_FIRST'].every((v) => new RegExp(`${v} = "on"`).test(block)) && !/\[context\./.test(toml.split('\n').filter((l) => !l.trim().startsWith('#')).join('\n')) || /\[context\.[a-z-]+\]/.test(toml) === false);
ok('no branch-only or production-only setting hides them from a site that builds another branch', !/\[context\.(production|dev|branch-deploy)/.test(toml));
ok('local dev has the same three on, and no secret in the file', ['VITE_LENS_COPY', 'VITE_LENS_TRAY', 'VITE_TERMS_FIRST'].every((v) => new RegExp(`^${v}=on$`, 'm').test(dev)) && !/KEY|SECRET|TOKEN|PASSWORD/i.test(dev.replace(/^#.*$/gm, '')));
