// Who may use the owner-only endpoints (the numbers, the transcript lookup). Two ways in, either is enough: the owner token
// in the header x-nenya-owner (see ownerAuth.ts), or a signed-in Netlify Identity user whose roles include "Owner" (see
// ownerAccess.ts). Anything else is the same bare 401, whatever the reason. `getUser` is passed in so tests can stand in for
// Netlify Identity and this file stays free of the Netlify package.
import { tokenMatches } from './ownerAuth.ts';
import { hasOwnerRole } from './ownerAccess.ts';

export async function ownerAllowed(req: Request, getUser: () => Promise<{ roles?: unknown } | null>): Promise<boolean> {
  if (tokenMatches(req.headers.get('x-nenya-owner'), process.env.COACH_OWNER_TOKEN_HASH)) return true;
  try {
    return hasOwnerRole(await getUser());
  } catch {
    return false;
  }
}
