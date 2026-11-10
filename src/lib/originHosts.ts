// Which page hosts may call the coach function. Production hosts are fixed. Preview deploys get
// other hostnames, so COACH_EXTRA_HOSTS (set only in Netlify's preview contexts, never in
// production) can add exact hostnames or patterns, comma-separated:
//   dev--yoursite.netlify.app, deploy-preview-*--yoursite.netlify.app
// A `*` matches letters, digits and hyphens within one label (never a dot). A wildcard label must
// keep at least three literal characters, so a bare `*.netlify.app` is refused and cannot open the
// function to every site on that domain.

export const BASE_HOSTS: ReadonlySet<string> = new Set(['nenya.biz', 'www.nenya.biz', 'localhost', '127.0.0.1']);

const MAX_ENTRIES = 10;
const ENTRY = /^[a-z0-9.*-]{3,200}$/;

function toPattern(entry: string): RegExp | null {
  if (!ENTRY.test(entry) || entry.startsWith('.') || entry.endsWith('.') || entry.includes('..')) return null;
  const labels = entry.split('.');
  if (labels.length < 2) return null;
  for (const label of labels) {
    if (!label.includes('*')) continue;
    if (label.replace(/\*/g, '').length < 3) return null;
  }
  const source = labels
    .map((l) => l.split('*').map((part) => part.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&')).join('[a-z0-9-]+'))
    .join('\\.');
  return new RegExp(`^${source}$`);
}

/**
 * Why a host was refused, for the OWNER only (never shown to a visitor): whether COACH_EXTRA_HOSTS reached this deploy at all and how many
 * entries in it were usable. Hostnames are not secret; nothing else from the settings is revealed.
 */
export function originHint(host: string, extraHosts?: string): string {
  const seen = host ? `the request came from "${host}"` : 'the request carried no usable Origin header';
  if (!extraHosts || !extraHosts.trim()) return `${seen}; COACH_EXTRA_HOSTS is empty or not set for this deploy`;
  const entries = extraHosts.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean).slice(0, MAX_ENTRIES);
  const usable = entries.filter((e) => toPattern(e) !== null).length;
  return `${seen}; COACH_EXTRA_HOSTS is set with ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}, ${usable} usable (an entry is a bare hostname: no https://, port or path), and none matches`;
}

export function hostAllowed(host: string, extraHosts?: string): boolean {
  const h = host.toLowerCase();
  if (BASE_HOSTS.has(h)) return true;
  if (!extraHosts) return false;
  const entries = extraHosts.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean).slice(0, MAX_ENTRIES);
  return entries.some((e) => toPattern(e)?.test(h) === true);
}

/** The Blobs store the coach reads and writes. Previews set COACH_STORE_NAME so they never touch production's. */
export function storeNameFrom(raw?: string): string {
  const v = (raw ?? '').trim();
  return /^[a-z0-9-]{1,64}$/.test(v) ? v : 'coach-private';
}
