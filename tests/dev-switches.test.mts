// The three lens and Terms-first switches are on for the dev branch's deploys and local dev only (owner, 2026-11-18); production's are set in Netlify and stay the owner's.
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';

const toml = readFileSync('netlify.toml', 'utf8');
const dev = readFileSync('.env.development', 'utf8');
const block = toml.slice(toml.indexOf('[context.dev.environment]'));
ok('the dev branch deploys build with the three switches on', ['VITE_LENS_COPY', 'VITE_LENS_TRAY', 'VITE_TERMS_FIRST'].every((v) => new RegExp(`${v} = "on"`).test(block.slice(0, 300))));
ok('nothing is set for production in the repository (its variables stay in Netlify)', !/\[context\.production/.test(toml) && !/\[context\.branch-deploy/.test(toml));
ok('local dev has the same three on, and no secret in the file', ['VITE_LENS_COPY', 'VITE_LENS_TRAY', 'VITE_TERMS_FIRST'].every((v) => new RegExp(`^${v}=on$`, 'm').test(dev)) && !/KEY|SECRET|TOKEN|PASSWORD/i.test(dev.replace(/^#.*$/gm, '')));
