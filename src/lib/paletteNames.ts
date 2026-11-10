// The outward names of the sixteen palettes. The code keeps each palette's internal id (the older name used in the data and tests); what a visitor,
// a screen reader, a report or a public page shows is the name here. See docs/valar-rename-scope.md. Chosen 2026-11-08 from each palette's colour and
// the need it stands for: plain English, easy to translate. The collective names are OUTWARD_NAMES.
export const PALETTE_DISPLAY_NAMES: Record<string, string> = {
  'Manwë': 'Sky',
  'Varda': 'Starlight',
  'Ulmo': 'Tide',
  'Nienna': 'Soft Rain',
  'Aulë': 'Craft',
  'Yavanna': 'Greenwood',
  'Vána': 'Blossom',
  'Mandos': 'Twilight',
  'Vairë': 'Tapestry',
  'Oromë': 'Stride',
  'Tulkas': 'Ember',
  'Nessa': 'Rhythm',
  'Irmo': 'Reverie',
  'Estë': 'Haven',
  'Melkor': 'Cinder',
  'Ungoliant': 'Hollow',
  // the colour picker's own list calls its second shadow palette by another name
  'Morgoth': 'Hollow',
};

/** The name to show for a palette's internal id (an id with no entry is shown as it is: add it here when a palette is added). */
export const displayNameFor = (id: string): string => PALETTE_DISPLAY_NAMES[id] ?? id;

/** What the group is called in words a visitor sees. */
export const OUTWARD_NAMES = { group: 'the Sixteen', palettes: 'the sixteen palettes', orbit: 'Palette Orbit', archetypes: 'sixteen archetypes of need' } as const;

/** Names that must never appear in anything a visitor sees (kept as a list so a test can check it). */
export const HIDDEN_NAMES: string[] = [...Object.keys(PALETTE_DISPLAY_NAMES), 'Valar', 'Vala'];
