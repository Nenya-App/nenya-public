// A synthetic corpus for testing how well names are kept out of what the coach sees (docs/pii-names-scope.md). Every line is invented (written by Claude,
// 2026-11-09); the names are common given names from many languages, and none refers to a real person. A line in NAMES lists the names it contains: after the
// scrubber has run, none of them should remain. A line in NOT_NAMES has capitalised words that are NOT people's names (feelings, places, organisations,
// days, brands) and must come out unchanged: a scrubber that eats ordinary words makes the conversation worse and teaches people to ignore its note.
//
// The scrubber is pattern matching and cannot catch every name. This corpus measures what it does catch, so changes can be judged by numbers.

export interface NameCase {
  text: string;
  names: string[];
  /** How the name appears, for reading the results: told (a phrase says it is a name), relation (after "my sister"), bare (just there), title, full, possessive, list, word (a name that is also a word). */
  kind: 'told' | 'relation' | 'bare' | 'title' | 'full' | 'possessive' | 'list' | 'word' | 'cultural' | 'nickname';
}

export const NAMES: NameCase[] = [
  // told
  { text: "My name is Priya and I don't know who to talk to.", names: ['Priya'], kind: 'told' },
  { text: 'Call me Marcus, everyone does.', names: ['Marcus'], kind: 'told' },
  { text: 'I go by Kwame at work.', names: ['Kwame'], kind: 'told' },
  { text: "I'm called Bean by my family.", names: ['Bean'], kind: 'told' },
  { text: 'My name is Siobhan Murphy.', names: ['Siobhan', 'Murphy'], kind: 'told' },
  // relation
  { text: 'My sister Maria stopped answering my calls.', names: ['Maria'], kind: 'relation' },
  { text: 'My boss, Daniel, keeps changing my schedule.', names: ['Daniel'], kind: 'relation' },
  { text: 'My friend Aaliyah says I should leave.', names: ['Aaliyah'], kind: 'relation' },
  { text: 'My dad Rajesh never says he is proud of me.', names: ['Rajesh'], kind: 'relation' },
  { text: 'My partner named Jordan moved out last week.', names: ['Jordan'], kind: 'relation' },
  { text: 'My therapist Dr. Okafor said to write things down.', names: ['Okafor'], kind: 'relation' },
  { text: 'My daughter Mei is starting school and I am terrified.', names: ['Mei'], kind: 'relation' },
  { text: 'My coworker Fatima took credit for the report.', names: ['Fatima'], kind: 'relation' },
  // bare: the name is just there
  { text: 'Maria yelled at me in front of everyone.', names: ['Maria'], kind: 'bare' },
  { text: 'I told Jordan I needed space and he left.', names: ['Jordan'], kind: 'bare' },
  { text: 'Me and Sam had a fight about money.', names: ['Sam'], kind: 'bare' },
  { text: 'I have been avoiding Priya since the wedding.', names: ['Priya'], kind: 'bare' },
  { text: 'Yesterday Ahmed said I was too sensitive.', names: ['Ahmed'], kind: 'bare' },
  { text: 'I cannot stop thinking about what Elena said.', names: ['Elena'], kind: 'bare' },
  { text: 'It started when I moved in with Tomás.', names: ['Tomás'], kind: 'bare' },
  { text: 'I feel like Nguyen does not respect me.', names: ['Nguyen'], kind: 'bare' },
  { text: 'We argued and then Chloe blocked me.', names: ['Chloe'], kind: 'bare' },
  { text: 'I was close to Wei for ten years.', names: ['Wei'], kind: 'bare' },
  { text: 'Honestly, Olivia has been kinder to me than my family.', names: ['Olivia'], kind: 'bare' },
  { text: 'I keep waiting for Kofi to apologize.', names: ['Kofi'], kind: 'bare' },
  { text: 'Thank you for listening. Hannah does not understand.', names: ['Hannah'], kind: 'bare' },
  // title
  { text: 'Mr. Alvarez called me into his office again.', names: ['Alvarez'], kind: 'title' },
  { text: 'I am scared of Ms. Patel on Monday.', names: ['Patel'], kind: 'title' },
  { text: 'Pastor Williams told me to forgive.', names: ['Williams'], kind: 'title' },
  // full
  { text: 'I was married to Maria Gonzalez for six years.', names: ['Maria', 'Gonzalez'], kind: 'full' },
  { text: 'John Smith from HR said it was nothing.', names: ['John', 'Smith'], kind: 'full' },
  { text: 'I keep seeing Aroha Te Rangi at the shop.', names: ['Aroha', 'Rangi'], kind: 'full' },
  // possessive
  { text: "Maria's voice still makes my chest tight.", names: ['Maria'], kind: 'possessive' },
  { text: "I am dreading Daniel's wedding.", names: ['Daniel'], kind: 'possessive' },
  // list
  { text: 'Sam, Alex and Jo all know and nobody told me.', names: ['Sam', 'Alex', 'Jo'], kind: 'list' },
  { text: 'I have two kids, Anya and Leo.', names: ['Anya', 'Leo'], kind: 'list' },
  // names that are also words
  { text: 'My friend Will keeps cancelling on me.', names: ['Will'], kind: 'word' },
  { text: 'My mother Grace never asks how I am.', names: ['Grace'], kind: 'word' },
  { text: 'My sister Hope moved away.', names: ['Hope'], kind: 'word' },
  { text: 'My son Mark will not talk to me.', names: ['Mark'], kind: 'word' },
  { text: 'I told Rose everything.', names: ['Rose'], kind: 'word' },
  // cultural / varied
  { text: 'My grandmother Abuela Carmen raised me.', names: ['Carmen'], kind: 'cultural' },
  { text: 'My uncle Mohammed has not spoken to us since.', names: ['Mohammed'], kind: 'cultural' },
  { text: 'Svetlana and I stopped talking.', names: ['Svetlana'], kind: 'cultural' },
  { text: 'My aunt Lakshmi is the only one who called.', names: ['Lakshmi'], kind: 'cultural' },
  { text: 'I miss Chidi more than I can say.', names: ['Chidi'], kind: 'cultural' },
  { text: 'My roommate Yuki is moving out.', names: ['Yuki'], kind: 'cultural' },
  { text: 'Zainab said she would call and she did not.', names: ['Zainab'], kind: 'cultural' },
  // nicknames
  { text: 'Everyone at school called me Scooter.', names: ['Scooter'], kind: 'nickname' },
  { text: 'My ex, Jay, texted me at midnight.', names: ['Jay'], kind: 'nickname' },
];

/**
 * Names that are NOT on the scrubber's list by construction (unusual in this corpus's own culture of English-language, US and UK names, written after the list was).
 * They measure the miss rate for a name the list does not know: expect many misses. They are not a pass/fail target; they are why the page asks people to
 * leave names out, and why the conversation must work when a name gets through.
 */
export const HELD_OUT: NameCase[] = [
  { text: 'Thandiwe has not spoken to me since the argument.', names: ['Thandiwe'], kind: 'bare' },
  { text: 'I told Oluwaseun I was leaving.', names: ['Oluwaseun'], kind: 'bare' },
  { text: 'Dilnoza is the only one who calls.', names: ['Dilnoza'], kind: 'bare' },
  { text: 'My cousin Wanjiru lives with us now.', names: ['Wanjiru'], kind: 'relation' },
  { text: 'Anneliese always makes me feel small.', names: ['Anneliese'], kind: 'bare' },
  { text: 'I cannot forgive Casimir for what he said.', names: ['Casimir'], kind: 'bare' },
  { text: 'My sister Mirela has been so distant.', names: ['Mirela'], kind: 'relation' },
  { text: 'Nasrin and I used to be inseparable.', names: ['Nasrin'], kind: 'bare' },
  { text: 'I met Takeshi in college.', names: ['Takeshi'], kind: 'bare' },
  { text: 'Ximena laughed when I told her.', names: ['Ximena'], kind: 'bare' },
  { text: 'Bronwyn thinks I am overreacting.', names: ['Bronwyn'], kind: 'bare' },
  { text: 'I keep thinking about Lorcan.', names: ['Lorcan'], kind: 'bare' },
  { text: 'My niece Tamsin does not call me anymore.', names: ['Tamsin'], kind: 'relation' },
  { text: 'Marguerite was the only one who understood.', names: ['Marguerite'], kind: 'bare' },
  { text: 'Esperanza said it would pass.', names: ['Esperanza'], kind: 'bare' },
  { text: 'I saw Zawadi at the market and froze.', names: ['Zawadi'], kind: 'bare' },
  { text: 'Chiamaka keeps texting me.', names: ['Chiamaka'], kind: 'bare' },
  { text: 'My manager Bartholomew is relentless.', names: ['Bartholomew'], kind: 'relation' },
];

export const NOT_NAMES: string[] = [
  'Will you remember me?', 'May I ask you something?', 'Hope is hard to find lately.', 'Mark my words, nothing will change.', 'Grace is something I never give myself.',
  'In June everything fell apart.', 'I felt Joy for a minute and then it was gone.', 'Rose is the color of the room I cannot leave.', 'Amber alerts scare me.', 'I flew to Jordan last year.',
'Sunday dinners at my grandmother\'s house are loud.', 'I want to Be Heard.', 'My Mother Tongue is Spanish.',
  'I took Advil and slept badly.', 'Madison Avenue is where I work.',
  'I feel Overwhelmed and Alone on Monday mornings.',
  'We moved to Portland after the divorce.',
  'I work at Acme Corp and it is draining me.',
  'Last Tuesday I could not get out of bed.',
  'I keep reading about Nonviolent Communication and it helps.',
  'My therapist suggested the Box breathing exercise.',
  'Netflix is the only thing that calms me down.',
  'Since January I have felt Numb.',
  'I called the Crisis Text Line once.',
  'God, I am tired.',
  'Honestly, Monday is the worst.',
  'We went to Lake Michigan for the funeral.',
  'My doctor at Mayo said it was stress.',
  'The Internet makes everything feel worse.',
  'I have been taking Zoloft for a month.',
  'Thanksgiving with my family is coming and I dread it.',
  'I grew up in Texas and never felt safe.',
  'English is my second language and I feel judged.',
  'On Friday we have the review at Google and I cannot sleep.',
  'I love You Are Not Alone, the song.',
  'Mom says I am too sensitive.',
  'Sometimes I wonder if Anyone would notice.',
  'Please Help me find the words.',
  'I live in New York and it is loud.',
];
