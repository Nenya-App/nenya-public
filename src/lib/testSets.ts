// The open prompt sets we may test the coach with, and what each licence lets us do (docs/test-prompt-datasets.md, docs/results/README.md).
// The data itself is never in this repository: it is downloaded to a folder outside it. This file holds only what we need to credit and to publish fairly.
// "verified" means the licence was read on the dataset's own card or repository; anything else must be confirmed at the source before a result is published.

export interface TestSet {
  id: string;
  name: string;
  authors: string;
  url: string;
  licence: string;
  licenceChecked: 'verified' | 'unverified';
  /** The credit line to print wherever results using the set appear. */
  credit: string;
  /** What we may do. Private testing and development is assumed for every set listed here. */
  may: {
    /** Quote a few short prompts in a published result (always with the credit). */
    quoteShort: boolean;
    /** Put the data itself in a public place. */
    redistribute: boolean;
    /** Use it to train or fine-tune a model. */
    train: boolean;
  };
  /** Anything a reader of the results, or the owner, should know. */
  note: string;
}

export const TEST_SETS: Record<string, TestSet> = {
  xstest: {
    id: 'xstest', name: 'XSTest', authors: 'Röttger, Kirk, Vidgen, Attanasio, Bianchi and Hovy', url: 'https://github.com/paul-rottger/xstest', licence: 'CC BY 4.0 (prompts)', licenceChecked: 'verified',
    credit: 'XSTest prompts, Röttger and colleagues (NAACL 2024), CC BY 4.0, https://github.com/paul-rottger/xstest',
    may: { quoteShort: true, redistribute: true, train: true },
    note: '250 safe prompts that sound unsafe and 200 unsafe contrasts. The licence covers the prompts; model completions in the repository have other terms.',
  },
  oasst2: {
    id: 'oasst2', name: 'OpenAssistant OASST2', authors: 'OpenAssistant contributors (LAION)', url: 'https://huggingface.co/datasets/OpenAssistant/oasst2', licence: 'Apache 2.0', licenceChecked: 'verified',
    credit: 'OpenAssistant Conversations (OASST2), OpenAssistant contributors, Apache 2.0, https://huggingface.co/datasets/OpenAssistant/oasst2',
    may: { quoteShort: true, redistribute: true, train: true },
    note: 'Written by volunteers: publish rates and prompt ids, quote very little.',
  },
  dolly: {
    id: 'dolly', name: 'Databricks Dolly 15k', authors: 'Databricks employees', url: 'https://huggingface.co/datasets/databricks/databricks-dolly-15k', licence: 'CC BY-SA 3.0', licenceChecked: 'verified',
    credit: 'databricks-dolly-15k, Databricks, CC BY-SA 3.0, https://huggingface.co/datasets/databricks/databricks-dolly-15k',
    may: { quoteShort: true, redistribute: true, train: true },
    note: 'ShareAlike: anything adapted from the prompts must be shared under the same licence. Results alone are not adapted prompts.',
  },
  esconv: {
    id: 'esconv', name: 'ESConv', authors: 'Liu and colleagues (Tsinghua, ACL 2021)', url: 'https://huggingface.co/datasets/thu-coai/esconv', licence: 'CC BY-NC 4.0', licenceChecked: 'unverified',
    credit: 'ESConv, Liu et al. (ACL 2021), CC BY-NC 4.0, https://huggingface.co/datasets/thu-coai/esconv',
    may: { quoteShort: true, redistribute: false, train: false },
    note: 'NonCommercial: private testing and development is the intended use. Do not put the data in a public place, and do not use it to train. Confirm the licence on the main branch of the card before publishing.',
  },
};

/** The credit lines for the sets a run used, for a results file or page. */
export const creditsFor = (ids: string[]): string[] => ids.map((i) => TEST_SETS[i]?.credit).filter((x): x is string => !!x);
