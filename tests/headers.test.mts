// The security headers in netlify.toml: a guard against one being dropped by accident, and a check that the
// content-security policy keeps its important restrictions. This reads the file; it does not make requests.
import { readFileSync, existsSync } from 'node:fs';
import { ok } from './helpers.mts';

const toml = readFileSync(new URL('../netlify.toml', import.meta.url), 'utf8');
// The values under the first [[headers]] block (for = "/*"), as name = "value" lines.
const block = toml.slice(toml.indexOf('[[headers]]'));
const header = (name: string): string | undefined => block.match(new RegExp(`^\\s*${name}\\s*=\\s*"([^"]*)"`, 'm'))?.[1];

ok('the headers apply to every path', /\[\[headers\]\]\s*\n\s*for\s*=\s*"\/\*"/.test(block));
ok('X-Frame-Options denies framing', header('X-Frame-Options') === 'DENY');
ok('MIME sniffing is off', header('X-Content-Type-Options') === 'nosniff');
ok('referrer policy is set', header('Referrer-Policy') === 'strict-origin-when-cross-origin');
ok('HSTS lasts at least a year and covers subdomains', /max-age=(\d+)/.test(header('Strict-Transport-Security') ?? '') && Number(/max-age=(\d+)/.exec(header('Strict-Transport-Security')!)![1]) >= 31536000 && /includeSubDomains/.test(header('Strict-Transport-Security')!));
ok('window isolation (COOP) is same-origin', header('Cross-Origin-Opener-Policy') === 'same-origin');
const pp = header('Permissions-Policy') ?? '';
ok('camera, microphone and location are denied', ['camera=()', 'microphone=()', 'geolocation=()'].every((d) => pp.includes(d)));

const csp = header('Content-Security-Policy') ?? '';
const directive = (d: string) => csp.split(';').map((x) => x.trim()).find((x) => x.startsWith(d + ' ') || x === d);
ok('CSP defaults to same-origin', directive('default-src') === "default-src 'self'");
ok('CSP allows only same-origin scripts', directive('script-src') === "script-src 'self'");
ok('CSP lets nothing frame the site and nothing be framed', directive('frame-ancestors') === "frame-ancestors 'none'" && directive('frame-src') === "frame-src 'none'");
ok('CSP limits connections, forms and objects to the site', directive('connect-src') === "connect-src 'self'" && directive('form-action') === "form-action 'self'" && directive('object-src') === "object-src 'none'");
ok('CSP allows no remote images or fonts', !/https?:/.test(directive('img-src') ?? '') && !/https?:/.test(directive('font-src') ?? ''));

// Caching: long-lived only where the file name changes whenever the file does.
const blockFor = (path: string): string | undefined => toml.split('[[headers]]').find((b) => new RegExp(`for\\s*=\\s*"${path.replace(/[/*]/g, (c) => '\\' + c)}"`).test(b));
const cache = (path: string): string | undefined => blockFor(path)?.match(/Cache-Control\s*=\s*"([^"]*)"/)?.[1];
ok('hashed build assets are cached for a year, immutable', cache('/assets/*') === 'public, max-age=31536000, immutable');
ok('fonts are cached for a year, immutable', cache('/fonts/*') === 'public, max-age=31536000, immutable');
ok('icons, badges and PDF files are cached for a week', ['/icons/*', '/badges/*', '/pdf-assets/*'].every((p) => cache(p) === 'public, max-age=604800'));
ok('pages are not given a long cache (a new deploy must show up at once)', !/for\s*=\s*"\/\*"[\s\S]*?Cache-Control/.test(block.slice(0, block.indexOf('[[headers]]', 12))) && cache('/*.html') === undefined && cache('/') === undefined);

// Fonts preloaded by the pages must exist, or the preload is a wasted request on every visit.
const preloaded = (html: string) =>
  [...html.matchAll(/<link\b[^>]*>/g)].map((m) => m[0]).filter((tag) => /rel="preload"/.test(tag) && /as="font"/.test(tag)).map((tag) => tag.match(/href="([^"]+)"/)![1]);
for (const page of ['index.html', 'coach/index.html']) {
  const html = readFileSync(new URL('../' + page, import.meta.url), 'utf8');
  const fonts = preloaded(html);
  ok(`${page} preloads at least one font`, fonts.length > 0);
  for (const f of fonts) ok(`${page}: preloaded ${f} exists and carries crossorigin`, existsSync(new URL('../public' + f, import.meta.url)) && [...html.matchAll(/<link\b[^>]*>/g)].some((m) => m[0].includes(`href="${f}"`) && /\bcrossorigin\b/.test(m[0])));
}
