// The phrase workbench (docs/phrase-workbench-scope.md) is behind a build switch, off by default: VITE_PHRASE_WORKBENCH=on.
export const phraseWorkbenchOn = (): boolean => import.meta.env?.VITE_PHRASE_WORKBENCH === 'on';
/** The address of the page. */
export const PHRASES_PATH = '/phrases';
export const isPhrasesPath = (pathname: string): boolean => /^\/phrases\/?$/.test(pathname);
