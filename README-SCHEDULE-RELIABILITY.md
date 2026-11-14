# Schedule reliability hotfix

## Why
On 2026-11-14 the production workflow was scheduled but GitHub Actions started
runs at 09:49 and 09:57 Vietnam time, beyond the allowed morning window
06:00–08:59. Both runs completed successfully with OUTSIDE_SLOT; no post.

## Change
Schedule opportunities every ten minutes within the original permitted Vietnam
windows, rather than only once per slot. UTC cron expressions:
- `*/10 23,0,1 * * *` (06:00–08:50 Vietnam, spanning UTC dates)
- `30,40,50 12 * * *`, `*/10 13,14 * * *`, `0,10,20 15 * * *`
  (19:30–22:20 Vietnam).

The runner's window and GitHub-only atomic claim remain unchanged. Repeated
workflow starts in one slot yield ALREADY_CLAIMED after the first claim.
FAILED/UNKNOWN claims remain locked; this is **not** a retry of a failed
Facebook attempt.

## Operational cautions
- GitHub cron has no punctuality or delivery SLA; even frequent triggers can
  all be delayed or skipped.
- Runs starting after the slot window return OUTSIDE_SLOT.
- A claimed slot may still be missed due to process crash or upload failure;
  manual reconciliation is required.
- After merging, monitor the first scheduled run's actual PUBLISHED result
  and the Facebook Page. A green GitHub job with OUTSIDE_SLOT or
  ALREADY_CLAIMED does not prove a new post.
- Keep `LIVE_PUBLISH_RELEASE=true` only when production posting is desired.
- No live post is executed by this PR. Do not delete GitHub ledger refs to
  force retries.
