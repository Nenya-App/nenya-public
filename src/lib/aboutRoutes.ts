// The About pages have real addresses: /about for the menu and /about/<section> for each page, so they can be linked to, opened directly, found in
// the browser's history and counted in the host's page statistics. The old form, /?about=<section>, still works and is rewritten to the new one.
// (The page is still one app: the host serves it for every path, and the app reads the address on load. Each address also sets its own title.)

export const ABOUT_TITLES: Record<string, string> = {
  mellonamin: 'Welcome: You May Rest Here',
  'about-founder': 'About the Designer',
  'contact-us': 'Contact Us',
  'evolved-leader': 'Evolved Leadership',
  'bio-social-design': 'Our Bio-Social Design',
  'name-philosophy': 'Our Name & Philosophy',
  'power-of-color': 'Color and Feeling',
  'six-gateways': 'The Six Lenses',
  'breathing-tool': 'About the Breathing Tool',
  'pantheon-of-needs': 'The Pantheon of Needs',
  'nvc-method': 'Our Approach',
  'privacy-promise': 'Our Privacy Promise',
  'pii-scrubbing': 'PII Scrubbing Tutorial',
  'venice-chat': 'Chat with Nenya\'s AI on Venice',
  witnessed: 'Witnessed Conversations',
  'where-we-stand': 'Where We Stand',
  'about-coach': 'About the Coach',
  'how-checks-work': 'How the Checks Work',
  'coach-region': 'Where the Coach Is Open',
  'partner-practice': 'Partner Practice (Planned)',
  structure: 'Our Structure',
  'support-us': 'Support Us',
  terms: 'Terms of Use & Privacy Policy',
};

export const ABOUT_IDS = Object.keys(ABOUT_TITLES);

/** The address of a page, when it differs from its id. The page's id stays `six-gateways` (nothing is keyed to it), but its address now says lenses; the old address still opens it. */
const ADDRESS_OF: Record<string, string> = { 'six-gateways': 'six-lenses' };
const ID_AT: Record<string, string> = { 'six-lenses': 'six-gateways' };
export const SITE_TITLE = 'Nenya — Take a Moment to Breathe';

/** The address for a section: '' or 'menu' gives /about. An unknown id also gives /about. */
export function aboutPath(section?: string | null): string {
  return section && ABOUT_IDS.includes(section) ? `/about/${ADDRESS_OF[section] ?? section}` : '/about';
}

/** The section named by an address: null when the address is not an About page, '' for the menu. Understands /about/<id> and the old ?about=<id>. */
export function aboutSectionFromLocation(pathname: string, search = ''): string | null {
  const m = /^\/about(?:\/([a-z0-9-]+))?\/?$/i.exec(pathname);
  if (m) { const id = m[1] ? (ID_AT[m[1].toLowerCase()] ?? m[1].toLowerCase()) : ''; return id && ABOUT_IDS.includes(id) ? id : ''; }
  try {
    const p = new URLSearchParams(search);
    if (p.has('about')) {
      const v = (p.get('about') || '').toLowerCase();
      return ABOUT_IDS.includes(v) ? v : '';
    }
  } catch { /* an unreadable query is not an About address */ }
  return null;
}

export const aboutTitle = (section?: string | null): string => (section && ABOUT_TITLES[section] ? `${ABOUT_TITLES[section]} — Nenya` : section === '' || section === 'menu' ? 'About Nenya' : SITE_TITLE);
