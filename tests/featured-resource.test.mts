// The featured resource on the About NVC page (owner, 2026-11-20): the trainer's site first and plainly marked, the other resources still there, nothing claimed about endorsement.
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';

const page = readFileSync('src/app/components/about/NVCMethod.tsx', 'utf8');
const featuredAt = page.indexOf('id="featured-resource"');
const listAt = page.indexOf('Resources for Exploration');
ok('the featured card comes before the list of other resources', featuredAt > 0 && listAt > featuredAt);
ok('it is marked "Featured" in words, not by colour', />Featured</.test(page));
ok('it links to the site safely: https, a new tab, noopener, and says so to a screen reader', /href="https:\/\/www\.yvetteerasmus\.com"\s+target="_blank"\s+rel="noopener noreferrer"/.test(page.slice(featuredAt, listAt)) && /opens an outside site in a new tab/.test(page.slice(featuredAt, listAt)));
ok('the site appears once: it is not repeated in the list below', (page.match(/yvetteerasmus\.com/gi) ?? []).length === 2 && !page.slice(listAt).includes('href="https://www.yvetteerasmus.com"'));
ok('the other resources are still listed', /mikikashtan\.org/.test(page.slice(listAt)) && /empathyfactor\.com/.test(page.slice(listAt)));
ok('the page offers variety in words: many places, find the voices that suit you', /There are many good places to learn this/.test(page) && /find the voices that suit you/.test(page));
ok('nothing claims she endorses, reviewed, partners with or stands behind Nenya', !/\b(?:endorse[sd]?|partner(?:s|ed)? with|official(?:ly)?|approved by|stands? behind|reviewed by)\b/i.test(page.slice(featuredAt, listAt)));
ok('the description is the plain one that was already on the page', /Psychologist and conflict facilitator\. Explores the intersection of psychology, social justice, and relational dynamics\./.test(page.slice(featuredAt, listAt)));
