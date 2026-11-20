// The communal needs: needs that belong to a group of people rather than to one person (fairness, a say together, belonging to a group, shared safety, looking after what lasts,
// looking after each other). THIS PROJECT'S OWN EXTENSION, not part of CNVC's inventory: the seven categories of the Feelings and Needs Inventory (The Center for Nonviolent Communication
// © 2023, www.CNVC.org) are credited wherever they are shown, and this layer is shown apart from them with the label below. The families, words and meanings are written fresh,
// in plain words (grade 5 to 8), as a starting point and never a complete list: CNVC itself calls its lists neither exhaustive nor definitive, and the person's own word is always welcome.
// DRAFT: untested on data and not yet read by a reviewer. Pure data. Nothing here is sent anywhere.

export interface CommunalWord { word: string; def: string }
export interface CommunalFamily { id: string; name: string; words: CommunalWord[] }

/** The label that must sit next to this layer wherever it is shown. */
export const COMMUNAL_LABEL = "Needs we share: this project's own addition, not part of the CNVC inventory.";

const f = (id: string, name: string, lines: string[]): CommunalFamily => ({
  id,
  name,
  words: lines.map((l) => {
    const i = l.indexOf(':');
    return { word: l.slice(0, i).trim(), def: l.slice(i + 1).trim() };
  }),
});

export const COMMUNAL_FAMILIES: CommunalFamily[] = [
  f('fair', 'Fairness', [
    'fairness: Everyone is treated by the same rules.',
    'a fair share: Getting your part, and no one taking more than theirs.',
    'being counted: Your needs are part of what gets weighed.',
    'equal respect: No group is treated as worth less.',
    'justice: Wrongs are named and put right.',
  ]),
  f('say', 'A say together', [
    'a voice in decisions: Being asked before something that affects you is settled.',
    'being consulted: People hear from those who live with the result.',
    'answerable leaders: Those in charge explain what they did and why.',
    'open information: People can see how decisions are made.',
    'a way to object: A safe place to say this is not working.',
  ]),
  f('together', 'Belonging to a group', [
    'a shared identity: Knowing who we are, together.',
    'being welcomed: New and different people are let in.',
    'shared ways: Customs, songs, meals and jokes that belong to the group.',
    'common purpose: Working toward something we all care about.',
    'being one of us: Counted as part of the group, not an outsider.',
  ]),
  f('safe', 'Shared safety', [
    'safety for everyone: No one in the group has to be afraid.',
    'looking out for the vulnerable: The young, old and sick are protected.',
    'trusted places: Schools, offices and streets where people can relax.',
    'someone to turn to: A person or office that listens when things go wrong.',
    'steady rules: What is allowed and what is not stays clear.',
  ]),
  f('lasting', 'Looking after what lasts', [
    'a future for the young: Children can count on a world that works.',
    'shared places: Parks, buildings and water kept in good shape.',
    'passing it on: Skills, stories and care handed to the next people.',
    'staying power: What we build can last past a hard year.',
    'looking after the land: The ground and living things are cared for.',
  ]),
  f('each-other', 'Looking after each other', [
    'sharing the load: Hard work is spread, so no one carries it alone.',
    'mutual help: People help each other and take help in turn.',
    'solidarity: Standing together when one of us is in trouble.',
    'giving back: A chance to give to others and to see it matter.',
    'neighborliness: Small kindnesses between people who live near each other.',
  ]),
];

export const COMMUNAL_FAMILY_IDS = COMMUNAL_FAMILIES.map((x) => `need.communal.${x.id}`);
