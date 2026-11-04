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
