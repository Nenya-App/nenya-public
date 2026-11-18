// The words of the requested summary that the page needs too. Kept apart from finalSummary.ts, which uses node:crypto and so cannot be bundled for the browser.
import { CNVC_LINK } from './feelingsNeeds.ts';

/** The credit the page shows under a summary made in the picked form (the words are CNVC's, unchanged); the link is CNVC's page for the inventory. */
export const SUMMARY_CREDIT = 'The feeling and need words come from the Center for Nonviolent Communication\'s Feelings and Needs Inventory (cnvc.org).';
export const SUMMARY_CREDIT_LINK = CNVC_LINK;

/** What the page shows when a requested summary could not be written (draft wording, for the owner's approval). */
export const SUMMARY_FAILED_TEXT = 'A summary could not be written this time. The transcript you can download still has everything that was said.';
