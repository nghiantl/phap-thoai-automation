# Independent scheduling fallback (Cloudflare Workers)

GitHub's scheduled workflows were delayed beyond the Vietnam publishing
windows on 2026-11-14 and 2026-11-15. Manual workflow_dispatch on
2026-11-15 20:16 ICT returned PUBLISHED with Facebook post ID.
This PR keeps GitHub's native schedule and adds an independent Cloudflare
Worker Cron Trigger that dispatches **the same** production workflow.

## One-time setup (required; merging alone does not activate fallback)

1. Create a Cloudflare account and install Node.js 20+.
2. From the repository root, run:
   `cd scheduler/cloudflare && npx wrangler login`
3. Create a **fine-grained GitHub personal access token** restricted to
   repository `nghiantl/phap-thoai-automation` with **Actions: Read and write**
   permission only. Set a reasonable expiration and plan rotation.
   Never paste this token into a chat or commit it.
4. In `scheduler/cloudflare` run:
   `npx wrangler secret put GH_DISPATCH_TOKEN`
   Enter the token only into the secure CLI prompt. If prompted to create
   the Worker first, run `npx wrangler deploy` and then repeat the secret
   command.
5. Run `npx wrangler deploy` and verify that four Cron Triggers are deployed
   in the Cloudflare dashboard. Cloudflare Cron Triggers use UTC.
6. Ensure GitHub Actions is enabled and the repository variable
   `LIVE_PUBLISH_RELEASE=true` remains configured. Check the next scheduled
   run in GitHub Actions. Worker dispatches appear as `workflow_dispatch`,
   whereas GitHub-native cron runs appear as `schedule`.

## Safety and expected behavior

- This Worker does **not** hold Facebook or Cloudinary secrets.
- The Worker sends a GitHub workflow_dispatch request. It never posts to
  Facebook directly. The existing GitHub Actions release gate and durable
  atomic GitHub ledger are unchanged.
- Both schedulers can trigger the same slot. GitHub ledger permits only one
  claimed attempt. No retries of FAILED/UNKNOWN claims.
- Dispatch success (HTTP 204) means GitHub accepted the request, **not**
  that the Facebook post succeeded. Check the workflow logs for PUBLISHED.
- Native GitHub schedules are moved away from minute 0 to reduce
  contention, but **neither scheduler guarantees exact-time execution**.
- Cloudflare Cron Triggers may take time to propagate after deployment.
- Cloudflare free plan limits and billing terms may change; review them
  before deploying.
- Revoke the fine-grained token to disable the fallback immediately.
- Do not remove GitHub ledger refs to force duplicate attempts.

## Validation

`node --test test/external-scheduler.test.mjs` validates the dispatch
request and fail-closed error handling with a mock fetch. It does not deploy
a Worker or send a real workflow dispatch.
