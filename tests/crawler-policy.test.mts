// The crawler policy (owner, 2026-11-15): search and AI answers welcome, AI training not; named AI crawlers read only the summary pages
// and llms.txt; the coach's endpoints are for no crawler. And the AI-facing pages say what is true today.
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';

const robots = readFileSync('public/robots.txt', 'utf8');
const groups = robots.split(/\n\s*\n/).map((g) => g.split('\n').filter((l) => !l.startsWith('#')).join('\n').trim() + '\n').filter((g) => g.startsWith('User-agent:'));
ok('two groups: the named AI crawlers, and everyone else', groups.length === 2 && /User-agent: \*/.test(groups[1]));
ok('every group signals search yes, AI answers yes, AI training no', groups.every((g) => /Content-Signal: search=yes, ai-input=yes, ai-train=no/.test(g)));
ok('named AI crawlers may read only the two summary pages and llms.txt', /Disallow: \/\n/.test(groups[0]) && ['/about-nenya.html', '/why-nenya.html', '/llms.txt'].every((p) => groups[0].includes(`Allow: ${p}`)) && (groups[0].match(/^Allow:/gm) ?? []).length === 3);
ok('the named list includes the assistants that fetch a page for someone', ['ChatGPT-User', 'Claude-User', 'Perplexity-User', 'Meta-ExternalFetcher', 'DuckAssistBot', 'MistralAI-User', 'GPTBot', 'ClaudeBot', 'Google-Extended', 'CCBot'].every((a) => groups[0].includes(`User-agent: ${a}\n`)));
ok('everyone else may crawl the site, but not the function endpoints', /Disallow: \/api\//.test(groups[1]) && /Disallow: \/\.netlify\//.test(groups[1]) && /Allow: \/\n/.test(groups[1]));
ok('the sitemap is listed, and no private page is named', /Sitemap: https:\/\/nenya\.biz\/sitemap\.xml/.test(robots) && !/admin|bench|cell/i.test(robots));

const about = readFileSync('public/about-nenya.html', 'utf8');
const llms = readFileSync('public/llms.txt', 'utf8');
ok('the AI-facing pages say the coach is open in the United States for now', /United States for now/.test(about) && /United States for now/.test(llms));
ok('they point to /verify for signed transcripts', /nenya\.biz\/verify/.test(about) && /nenya\.biz\/verify/.test(llms));
ok('they no longer claim the coach comes only after a reflection, or that nothing from a reflection can reach it', !/Only after finishing a reflection/.test(about) && !/Nothing from the reflection is\s+passed to it/.test(about) && /unless the visitor chooses to bring parts of their summary/.test(about));
ok('the visible FAQ no longer describes continuing on Venice AI as the AI step', !/continue the conversation with Venice AI, an external AI chat\s+service/.test(about));
ok('the structured data still parses', (() => { try { JSON.parse(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(about)![1]); return true; } catch { return false; } })());
ok('llms.txt states the training preference and is not therapy', /training AI models on it is not/.test(llms) && /not therapy/.test(llms));
