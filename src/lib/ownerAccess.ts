// Who may read the owner's page. Two ways in, either is enough:
//  1. the owner token (see ownerAuth.ts), or
//  2. a signed-in Netlify Identity user whose role list includes "Owner" (set in Netlify under Identity, Users).
// The sign-in itself is checked by Netlify (the server asks the Identity service about the login cookie); this file
// only decides whether that user's roles are enough.

export const OWNER_ROLE = 'Owner';

interface UserWithRoles {
  roles?: unknown;
}

export function hasOwnerRole(user: UserWithRoles | null | undefined): boolean {
  const roles = user?.roles;
  return Array.isArray(roles) && roles.some((r) => typeof r === 'string' && r === OWNER_ROLE);
}
