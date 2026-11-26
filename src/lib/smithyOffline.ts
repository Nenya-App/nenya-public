// Which requests left the machine, for the offline check behind guide 6 (scripts/smithy-offline-check.mts). Pure.

/** Every address whose origin differs from `origin`. Addresses that never go over a network (data:, blob:) are left out. An unreadable address is kept, to be looked at. */
export function outwardRequests(urls: string[], origin: string): string[] {
  return urls.filter((url) => {
    if (/^(data|blob):/i.test(url)) return false;
    try {
      return new URL(url).origin !== origin;
    } catch {
      return true;
    }
  });
}
