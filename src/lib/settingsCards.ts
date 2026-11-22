// The cards in the breathing and accessibility panel (src/app/components/AccessibilitySettings.tsx): which are open. Every card starts closed on every visit
// (owner's request, 2026-11-22), so which cards are open is never stored anywhere; it lives in the panel's own state. Pure, so it is tested.
export const SETTINGS_CARD_IDS = ['theme', 'animation', 'logo-look', 'sound', 'vision', 'strength', 'text-size', 'remember'] as const;
export type SettingsCardId = (typeof SETTINGS_CARD_IDS)[number];
export type OpenCards = Partial<Record<SettingsCardId, boolean>>;

/** Every card closed: how the panel starts. */
export const NO_CARDS_OPEN: OpenCards = {};
export const toggleCard = (open: OpenCards, id: SettingsCardId): OpenCards => ({ ...open, [id]: !open[id] });
export const openAllCards = (): OpenCards => Object.fromEntries(SETTINGS_CARD_IDS.map((id) => [id, true])) as OpenCards;
export const closeAllCards = (): OpenCards => ({});
export const allCardsOpen = (open: OpenCards): boolean => SETTINGS_CARD_IDS.every((id) => open[id]);
export const noCardsOpen = (open: OpenCards): boolean => SETTINGS_CARD_IDS.every((id) => !open[id]);
export const CARDS_INSTRUCTION = 'Each card opens when you select its heading. Select it again to close it.';
