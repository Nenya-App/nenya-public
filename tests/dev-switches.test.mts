// The three lens and Terms-first switches are on in every build of the repository and in local dev (owner, 2026-11-18). They sit in [build.environment] so the dev site is covered
// whichever Netlify context it builds in; a variable in a site's own settings overrides them.
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';

// The switches are on for builds of the dev branch only ([context.dev.environment]); nothing in the repository turns them on for production or any other site.
const toml = readFileSync('netlify.toml', 'utf8');
const dev = readFileSync('.env.development', 'utf8');
const ON = ['VITE_LENS_COPY', 'VITE_LENS_TRAY', 'VITE_TERMS_FIRST', 'VITE_LENS_TAPESTRY', 'VITE_LENS_PATH', 'VITE_SUMMARY_REQUEST'];
const build = toml.slice(toml.indexOf('[build.environment]'), toml.indexOf('[context.dev.environment]'));
const devBlock = toml.slice(toml.indexOf('[context.dev.environment]'), toml.indexOf('[functions]'));
ok('the dev branch builds with the switches on', ON.every((v) => new RegExp(`${v} = "on"`).test(devBlock)) && !/VITE_NEED_TALLY = "on"/.test(devBlock));
ok('nothing is set for every build or for production, so merging to main turns nothing on', !/VITE_/.test(build.split('\n').filter((l) => !l.trim().startsWith('#')).join('\n')) && !/\[context\.(production|branch-deploy|deploy-preview)/.test(toml));
ok('local dev has the same switches on, and no secret in the file', ON.every((v) => new RegExp(`^${v}=on$`, 'm').test(dev)) && !/KEY|SECRET|TOKEN|PASSWORD/i.test(dev.replace(/^#.*$/gm, '')));
