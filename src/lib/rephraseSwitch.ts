// Rephrasing in a partner cell (docs/dyad-rephrase-scope.md; VITE_REPHRASE, off by default): the build switch. With it off, the
// cell page is exactly as it was: no rephrasing panel, no new message kinds sent, and the page still closes the cell for both
// people when it is left. Page-side only: the mailbox (netlify/functions/cell.mts) needs no switch, because it never reads a kind.
export const rephraseOn = (): boolean => import.meta.env?.VITE_REPHRASE === 'on';
