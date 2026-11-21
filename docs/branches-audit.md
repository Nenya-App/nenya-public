# Branch audit

Written 2026-11-20 (read-only; nothing was deleted or changed). Generated from `git for-each-ref`, `git worktree list --porcelain` and `git merge-base --is-ancestor`, against `origin/main` (tip: PR #30, 2026-11-16) and local `dev`.

**This is not a handful of branches.** There are 40 local branches and 8 on the remote. Most local ones are **checked out as worktrees** under `.claude/worktrees/` (and `nenya-public-activities`): each belongs to a session or an agent that may be running or may be needed. A checked-out branch cannot be removed with `git branch -d`, and removing a worktree throws away anything uncommitted in it. **Do not prune the "keep" rows, and do not run a bulk delete.** The only rows marked safe are branches merged into main (or dev) that nobody has checked out.

How to read the columns: "ahead of dev" and "ahead of main" count commits the branch has that dev or origin/main lack; "merged" means every commit is already in main or dev.

## Local branches
| Branch | Last commit | Ahead of dev | Ahead of main | Merged into main | Merged into dev | Worktree | Recommendation |
|---|---|---|---|---|---|---|---|
| `dev` | 2026-11-20 | 0 | 259 | no | yes | yes | keep (trunk) |
| `main` | 2026-11-16 | 0 | 0 | yes | yes | no | keep (trunk) |
| `claude/answers-classifier` | 2026-11-20 | 53 | 304 | no | no | yes | keep: checked out in a worktree (a session or agent may be using it) |
| `claude/breath-display-options-a0f8ff` | 2026-11-19 | 2 | 182 | no | no | yes | keep: checked out in a worktree (a session or agent may be using it) |
| `claude/busy-elion-23e873` | 2026-11-20 | 0 | 202 | no | yes | yes | keep: checked out in a worktree (a session or agent may be using it) |
| `claude/coach-moveset` | 2026-11-20 | 6 | 201 | no | no | yes | keep: checked out in a worktree (a session or agent may be using it) |
| `claude/dyad-rephrase-scope-08806d` | 2026-11-20 | 34 | 229 | no | no | yes | keep: checked out in a worktree (a session or agent may be using it) |
| `claude/eight-sided-gem-018bd4` | 2026-11-20 | 0 | 205 | no | yes | yes | keep: checked out in a worktree (a session or agent may be using it) |
| `claude/feedback-forms-afedb3` | 2026-11-19 | 1 | 181 | no | no | yes | keep: checked out in a worktree (a session or agent may be using it) |
| `claude/integration-gem-leaves` | 2026-11-20 | 0 | 238 | no | yes | yes | keep: checked out in a worktree (a session or agent may be using it) |
| `claude/lens-ring-on-gem` | 2026-11-20 | 0 | 203 | no | yes | yes | keep: checked out in a worktree (a session or agent may be using it) |
| `claude/mallorn-petals-57db2e` | 2026-11-20 | 0 | 185 | no | yes | yes | keep: checked out in a worktree (a session or agent may be using it) |
| `claude/nature-story-lenses-e05e47` | 2026-11-19 | 2 | 182 | no | no | yes | keep: checked out in a worktree (a session or agent may be using it) |
| `claude/phrase-workbench-scope-cc19cc` | 2026-11-20 | 11 | 206 | no | no | yes | keep: checked out in a worktree (a session or agent may be using it) |
| `claude/release-breath` | 2026-11-20 | 53 | 304 | no | no | yes | keep: checked out in a worktree (a session or agent may be using it) |
| `claude/release-candidate` | 2026-11-20 | 79 | 330 | no | no | yes | keep: checked out in a worktree (a session or agent may be using it) |
| `claude/release-lenses` | 2026-11-20 | 54 | 305 | no | no | yes | keep: checked out in a worktree (a session or agent may be using it) |
| `claude/release-trial` | 2026-11-20 | 50 | 301 | no | no | yes | keep: checked out in a worktree (a session or agent may be using it) |
| `claude/report-expiry` | 2026-11-20 | 54 | 305 | no | no | yes | keep: checked out in a worktree (a session or agent may be using it) |
| `claude/resources-featured` | 2026-11-20 | 2 | 198 | no | no | yes | keep: checked out in a worktree (a session or agent may be using it) |
| `claude/terms-2026-11-20` | 2026-11-20 | 38 | 233 | no | no | yes | keep: checked out in a worktree (a session or agent may be using it) |
| `claude/workbench-dyad-docs` | 2026-11-20 | 7 | 202 | no | no | yes | keep: checked out in a worktree (a session or agent may be using it) |
| `lens-activities` | 2026-11-18 | 0 | 89 | no | yes | yes | keep: checked out in a worktree (a session or agent may be using it) |
| `worktree-agent-a018c1a03080e849b` | 2026-11-18 | 0 | 139 | no | yes | yes | keep: checked out in a worktree (a session or agent may be using it) |
| `worktree-agent-a1279e54da09a1d84` | 2026-11-19 | 0 | 169 | no | yes | yes | keep: checked out in a worktree (a session or agent may be using it) |
| `worktree-agent-a25d3eb38abc47941` | 2026-11-18 | 0 | 142 | no | yes | yes | keep: checked out in a worktree (a session or agent may be using it) |
| `worktree-agent-a35707ec1fe9bc628` | 2026-11-19 | 0 | 160 | no | yes | yes | keep: checked out in a worktree (a session or agent may be using it) |
| `worktree-agent-a47c1bdb68c596006` | 2026-11-18 | 0 | 139 | no | yes | yes | keep: checked out in a worktree (a session or agent may be using it) |
| `worktree-agent-a4e76005b91d5b39e` | 2026-11-19 | 0 | 165 | no | yes | yes | keep: checked out in a worktree (a session or agent may be using it) |
| `worktree-agent-a7bbee09d67b5dc34` | 2026-11-18 | 0 | 139 | no | yes | yes | keep: checked out in a worktree (a session or agent may be using it) |
| `worktree-agent-a8d4fef6afd085920` | 2026-11-18 | 0 | 3 | no | yes | yes | keep: checked out in a worktree (a session or agent may be using it) |
| `worktree-agent-accd7226d92bd3a2d` | 2026-11-19 | 1 | 166 | no | no | yes | keep: checked out in a worktree (a session or agent may be using it) |
| `worktree-agent-ae0afc8f79555648d` | 2026-11-19 | 1 | 1 | no | no | yes | keep: checked out in a worktree (a session or agent may be using it) |
| `worktree-agent-afd4a572f39b3edd9` | 2026-11-19 | 0 | 168 | no | yes | yes | keep: checked out in a worktree (a session or agent may be using it) |
| `claude/nvc-icarus-web` | 2026-11-20 | 13 | 208 | no | no | yes | keep: checked out in a worktree (/Users/estellestreiff/Desktop/nenya-web-wt) |
| `claude/upbeat-gates-64ac76` | 2026-11-20 | 5 | 192 | no | no | no | needs a decision: unmerged, not checked out |
| `worktree-agent-a4d23c8821e82a188` | 2026-11-16 | 0 | 0 | yes | yes | no | safe to delete: merged into main, not checked out |
| `worktree-agent-ab4623d464eb03728` | 2026-11-16 | 0 | 0 | yes | yes | no | safe to delete: merged into main, not checked out |
| `worktree-agent-adf00ed5e0b60bc9d` | 2026-11-16 | 0 | 0 | yes | yes | no | safe to delete: merged into main, not checked out |
| `worktree-agent-afc8a58e4b9c41c0b` | 2026-11-16 | 0 | 0 | yes | yes | no | safe to delete: merged into main, not checked out |

## Remote branches (origin)
| Branch | Last commit | Merged into main | Recommendation |
|---|---|---|---|
| `origin/dev` | 2026-11-20 | no | keep (trunk) |
| `origin/main` | 2026-11-16 | yes | keep (trunk) |
| `origin/agent-and-unblock-first-paint-b76e` | 2026-11-11 | no | needs a decision: unmerged |
| `origin/agent-and-add-site-gem-settings-e77e` | 2026-11-11 | yes | safe to delete (merged into main) |
| `origin/agent-encrypted-partner-cells-3b9d` | 2026-11-11 | yes | safe to delete (merged into main) |
| `origin/agent-for-sealed-coach-mode-f3f6` | 2026-11-12 | yes | safe to delete (merged into main) |
| `origin/agent-transcript-submissions-67e8` | 2026-11-12 | yes | safe to delete (merged into main) |
| `origin/agent-with-a-docs-drift-test-1812` | 2026-11-15 | yes | safe to delete (merged into main) |

## Notes
- The `claude/release-*` branches are 50 to 79 commits ahead of dev: they are other sessions' integration work, not stale copies. Leave them to whoever owns them.
- The `worktree-agent-*` branches are agents' scratch worktrees; whether they hold anything unmerged is a question for each (compare with `git log dev..<branch>`), not something to infer from age.
- The `origin/agent-*` branches marked safe were merged into main long ago; deleting a remote branch is a push and is the owner's to do (`git push origin --delete <branch>`), after reading this list.
- Before any deletion, run `git branch --merged main` and `git worktree list` again: this file is a snapshot.
