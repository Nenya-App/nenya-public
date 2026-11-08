// Netlify's Identity emails (invite, password reset, confirmation, email change) link to the site's front page with a token
// in the address after the #, never to a particular page. Nobody else ever arrives with one of those tokens, so a front-page
// visit that carries one is sent on to the owner's page with the token intact. The token stays in the address after the
// #, which the browser never sends to any server. The front pages load only this tiny check, not the sign-in code.
const TOKEN_HASH = /^#(invite_token|recovery_token|confirmation_token|email_change_token)=/;

/** Where to send a front-page visit that arrived with an Identity token, or null for every ordinary visit. */
export function identityTarget(hash: string): string | null {
  return TOKEN_HASH.test(hash) ? `/admin/${hash}` : null;
}

export function forwardIdentityLinks(): boolean {
  if (typeof window === 'undefined') return false;
  const to = identityTarget(window.location.hash);
  if (!to) return false;
  window.location.replace(to);
  return true;
}
