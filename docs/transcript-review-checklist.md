# Checklist for the person who reads a conversation before it is shown or used for training

Written 2026-11-10. Used from the owner page for each conversation waiting to be shown (the public page) or, later, to be used for training. Nothing is shown or used until a person has done this by hand. Nothing in the training pipeline exists yet: a conversation with a training choice is recorded as **waiting for review** and nothing reads it for training.

1. **Read every message**, the person's and the AI's. Do not rely on the automatic scrub.
2. **Names and details.** Remove or replace anything that could identify a person: names, places smaller than a region, workplaces, schools, dates that point to one event, usernames, unusual details. The scrub misses some. If a person cannot be made unrecognizable without gutting the conversation, **do not use it.**
3. **A minor.** Look for signs the writer is under 18 (a school grade, "my mom said I can't", curfews, homework, "my teacher"). If there is any sign, **do not show it and do not use it for training**, and delete it by the same path as a take-back. The checkbox is the person's word; this is the backstop.
4. **Other people's private details.** Health, legal, immigration or abuse details about someone who is not the writer: remove them or do not use it.
5. **Safety.** A conversation the site's safety check stopped is never shown or used (the site already refuses these). If anything in the conversation suggests crisis or danger, do not show it and do not use it.
6. **The AI's part.** Remove any reply that says something false about how Nenya works or about the person's data (the guards catch most), or that you would not want shown as an example.
7. **What they chose.** Show only the parts they chose, for no longer than they chose. For training: only what they allowed, and only from now on.
8. **Record what you did.** Approve or reject; for training, approving adds the conversation's fingerprint to the next training run's ledger so a later take-back is honored in the following run.
9. **Never** combine a conversation with identifying information from anywhere else, and never publish or share a dataset or a model trained on conversations (that would be a separate consent we do not offer).
