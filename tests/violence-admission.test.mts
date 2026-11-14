// An admission of having killed or badly hurt someone, and graphic violence or violent fantasy, is a stop: the message never reaches the AI, and the notice sends the
// person to emergency services and to people. (2026-11-14: the coach had answered "I killed someone" with "that must feel incredibly heavy".)
import { detectFlag, noticeIntro, resourcesFor } from '../src/lib/safetyFlags.ts';
import { ok } from './helpers.mts';
const flag = (t: string) => detectFlag(t);
const stops = (t: string, kind: string) => { const f = flag(t); return f?.category === 'harm-others' && f.tier === 'stop' && f.kind === kind; };

for (const t of ['I killed someone.', 'I killed someone', "I've killed a man", 'I think I killed someone last night', 'I murdered my husband', 'I stabbed my brother', 'I accidentally killed a child', 'I have strangled someone', 'I shot a man', 'I beat up a stranger', 'I killed him', 'i just killed her']) ok(`an admission is a stop: ${t}`, stops(t, 'admitted'));
for (const t of ['I fantasize about killing my boss', 'I keep imagining torturing him', 'I picture strangling her all the time', 'I want to watch him bleed', 'I want to torture someone', 'I slit his throat and buried the body']) ok(`graphic violence or a fantasy is a stop: ${t}`, stops(t, 'graphic'));

for (const t of ['I killed it at the presentation today.', 'I killed the weeds in the garden', 'I shot a photo of the sunset', 'I killed my houseplant again', 'I killed them with my presentation', 'I killed them at the audition', 'In the game I killed someone', 'I dreamed that I killed someone', 'My character in the movie killed someone', 'I shot hoops with my brother', 'I killed time before the meeting', 'I beat him at chess', 'He said he killed someone and I am scared', 'I am worried I might hurt someone', 'I imagine a quiet life by the sea', 'I want to watch the sunset']) ok(`not an admission: ${t}`, !stops(t, 'admitted') && !stops(t, 'graphic'));

const f = flag('I killed someone.')!;
const text = noticeIntro(f);
ok('the notice for an admission tells the person to call emergency services at once if anyone is hurt or in danger', /911/.test(text) && /hurt or in danger right now/.test(text) && /immediately/.test(text));
ok('and to speak with a crisis line, a mental health professional and a lawyer, not with the AI', /988/.test(text) && /mental health professional/.test(text) && /lawyer/.test(text) && /I'm an AI/.test(text));
ok('and it never says the thing the coach said ("that must feel", "sounds hard")', !/must feel|sounds (?:hard|tough|heavy)/i.test(text));
ok('the notice for graphic violence declines to go into it and sends the person to emergency services, a crisis line and a professional', /won't go into it/.test(noticeIntro(flag('I want to torture someone')!)) && /911/.test(noticeIntro(flag('I want to torture someone')!)) && /988/.test(noticeIntro(flag('I want to torture someone')!)) && /mental health professional/.test(noticeIntro(flag('I want to torture someone')!)));
ok('the emergency number is first in the resources for an admission or graphic violence', resourcesFor('harm-others', 'admitted')[0].name === 'Immediate danger' && resourcesFor('harm-others', 'graphic')[0].href === 'tel:911');
ok('the older harm-to-others stops are unchanged (no kind, the usual resources)', flag("I'm going to hurt all of them.")?.kind === undefined && resourcesFor('harm-others')[0].href === 'tel:988');

// ---- admissions of abusing a child or a partner, sexual harm, trafficking: each its own stop, notice and resources (2026-11-14)
const KINDS: [string, string][] = [
  ['I hit my kid last night.', 'admitted-child'], ['I beat my son when I get angry', 'admitted-child'], ["I've been abusing my children", 'admitted-child'], ['I shook my baby', 'admitted-child'], ['I burned my daughter with a cigarette', 'admitted-child'],
  ['I hit my wife again.', 'admitted-partner'], ['I choked my girlfriend', 'admitted-partner'], ["I'm abusive to my husband", 'admitted-partner'], ["I've been beating my partner", 'admitted-partner'], ['I punched my ex', 'admitted-partner'],
  ['I molested a child.', 'admitted-child-sexual'], ['I touched my niece sexually', 'admitted-child-sexual'], ['I have been sexually abusing my daughter', 'admitted-child-sexual'], ['I downloaded child porn', 'admitted-child-sexual'], ['I had sex with a 14 year old', 'admitted-child-sexual'],
  ["I'm a pedophile", 'child-attraction'], ['I have sexual thoughts about children', 'child-attraction'], ["I'm attracted to kids and I hate it", 'child-attraction'],
  ['I raped someone.', 'admitted-sexual'], ['I sexually assaulted a woman', 'admitted-sexual'], ['I molested someone at a party', 'admitted-sexual'],
  ['I trafficked women across the border', 'admitted-trafficking'], ["I'm trafficking people", 'admitted-trafficking'], ['I kidnapped a girl', 'admitted-trafficking'], ['I am keeping a woman captive', 'admitted-trafficking'], ['I have a girl locked up in my basement', 'admitted-trafficking'], ['I forced her into prostitution', 'admitted-trafficking'], ['I sold girls for sex', 'admitted-trafficking'],
];
for (const [t, kind] of KINDS) ok(`${kind}: ${t}`, stops(t, kind), JSON.stringify(flag(t)));

for (const t of ['I hit my kid with a baseball by accident while playing catch', 'I spanked my kid once and felt awful', 'I hurt my child\'s feelings and I feel terrible', 'I hit my head on the door', 'I touched my daughter on the shoulder', 'I abuse caffeine', 'My wife hit me', 'My partner is abusive', 'I was abused as a child', 'I was molested', 'I worry about children being trafficked', 'I watched a documentary about human trafficking', 'I work with survivors of trafficking', 'I volunteer with kids', 'I kidnapped my friend\'s teddy bear for the joke', 'I made him work late', 'I sold my car to a girl from work', 'I forced myself to go to work']) {
  const f = flag(t);
  ok(`not an admission of harm: ${t}`, !(f?.category === 'harm-others' && f.tier === 'stop' && f.kind && /^(?:admitted|child-attraction)/.test(f.kind)), JSON.stringify(f));
}

const notice = (t: string) => noticeIntro(flag(t)!);
ok('every one of these notices says an AI cannot help, ends the conversation, and names the emergency number', KINDS.every(([t]) => { const x = notice(t); return /I'm an AI/.test(x) && /ending our conversation/.test(x) && /911/.test(x); }));
ok('none of them says "that sounds hard" or "must feel heavy"', KINDS.every(([t]) => !/must feel|sounds (?:hard|tough|heavy)/i.test(notice(t))));
const names = (t: string) => resourcesFor('harm-others', flag(t)!.kind).map((r) => r.name).join(' | ');
ok('partner abuse: emergency first, then the domestic violence hotline (also for people who want to stop), then a crisis line', resourcesFor('harm-others', 'admitted-partner')[0].name === 'Immediate danger' && /National Domestic Violence Hotline/.test(names('I hit my wife again.')) && /988/.test(names('I hit my wife again.')) && /worried that their own behavior is harmful/.test(resourcesFor('harm-others', 'admitted-partner')[1].detail));
ok('child abuse: emergency first, Childhelp (for parents afraid they might hurt a child), a crisis line', resourcesFor('harm-others', 'admitted-child')[0].name === 'Immediate danger' && /Childhelp/.test(names('I hit my kid last night.')) && /afraid they might hurt a child/.test(resourcesFor('harm-others', 'admitted-child')[1].detail));
ok('sexual harm to a child: emergency, Stop It Now, the NCMEC CyberTipline, Childhelp', ['Immediate danger', 'Stop It Now', 'NCMEC', 'Childhelp'].every((n) => names('I molested a child.').includes(n)));
ok('attraction to children: Stop It Now comes first (no act is described), the emergency number is still there', resourcesFor('harm-others', 'child-attraction')[0].name.startsWith('Stop It Now') && /Immediate danger/.test(names("I'm a pedophile")));
ok('sexual harm to an adult: emergency, a crisis line, and RAINN for the person harmed (Stop It Now is about child sexual abuse, so it is not listed here)', ['Immediate danger', '988', 'RAINN'].every((n) => names('I raped someone.').includes(n)) && !/Stop It Now/.test(names('I raped someone.')));
ok('trafficking by the person: emergency, the US and Canadian trafficking hotlines', ['Immediate danger', 'National Human Trafficking Hotline', 'Canadian Human Trafficking Hotline'].every((n) => names('I trafficked women across the border').includes(n)));
ok('the attraction notice says having thoughts is not the same as acting, and that wanting help is right', /does not mean you have acted/.test(notice("I'm a pedophile")) && /wanting help is the right step/.test(notice("I'm a pedophile")));

// the person being trafficked: a stop in the abuse category, with the trafficking lines
for (const t of ['I am being trafficked.', "I was sold and I can't get out", 'They took my passport and make me work', 'my boss holds my passport', "I'm being forced to have sex"]) {
  const f = flag(t);
  ok(`a person being trafficked or held is a stop in the abuse category: ${t}`, f?.category === 'abuse' && f.tier === 'stop', JSON.stringify(f));
}
ok('and their resources include the trafficking hotlines', resourcesFor('abuse', 'trafficking').some((r) => /National Human Trafficking Hotline/.test(r.name)) && resourcesFor('abuse', 'trafficking').some((r) => /Canadian Human Trafficking/.test(r.name)));
ok('the earlier abuse resources are unchanged for other kinds (no trafficking lines)', !resourcesFor('abuse', 'partner-or-family').some((r) => /Trafficking/.test(r.name)));
