# Phase D.8 – production safety foundations (NOT live)

**Status:** Draft PR; publishing remains disabled. No merge or Facebook write is authorized.

## Ledger and states
- `db/facebook-publish-ledger.sql` defines a PostgreSQL table with a unique primary key for each `YYYY-MM-DD-morning|evening` slot.
- `src/publishing-ledger.mjs` provides atomic `INSERT ... ON CONFLICT DO NOTHING` claims, terminal `PUBLISHED`/`FAILED`/`UNKNOWN` updates, and status lookup.
- Claimed slots never retry automatically. In particular, `UNKNOWN` means a Facebook request might have succeeded despite a timeout; reconcile manually before any retry.
- `PROCESSING` is inserted directly as the claim, so the code does not leave an unclaimed `PENDING` gap.
- `src/github-ledger.mjs` remains fail-closed. **The PostgreSQL adapter is not wired into the live slot runner**, and no database is provisioned or credentials added. Live publishing is not production-ready.

## Token health
`src/token-health.mjs` checks Page identity through a read-only GET. It does not establish `pages_manage_posts` permission or guarantee that Facebook will accept a write.

## Scheduling
`facebook-dry-run.yml` retains existing 23:00 and 12:30 UTC cron expressions, equivalent to 06:00 and 19:30 Asia/Ho_Chi_Minh. GitHub Actions schedule can be delayed and only runs from the default branch. A manual DRY_RUN workflow is included. Neither can publish Facebook content.

## Testing
`npm test` includes mock tests for duplicate claims, terminal states, and side-effect-free DRY_RUN. These mocks are **not** a real PostgreSQL concurrency test or Facebook integration test.

## Before live rollout (requires separate approval)
Provision PostgreSQL and run schema, implement and wire a safe live adapter, verify DB transactional behavior with parallel workers, handle crash/reconciliation states, ensure Facebook API version compatibility, token lifecycle, timezone scheduling, and obtain explicit authorization for a controlled live post. Do not turn on publishing flags yet.
