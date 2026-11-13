# Phase D.9 – GitHub-only durable publishing (staged; NOT ACTIVATED)

## What is implemented
- Atomic GitHub `POST /git/refs` claim per date/slot; a duplicate ref prevents a second attempt. State markers `published`, `failed`, `unknown` are append-only. Claimed refs are permanent.
- `src/slot-runner.mjs` wires claims before Cloudinary and Facebook. If the Facebook request is ambiguous, mark UNKNOWN. A failed status write does not unlock the slot.
- Delayed GitHub schedules are accepted only during the same-day 3-hour window: 06:00–08:59 and 19:30–22:29 Vietnam. Outside this window: OUTSIDE_SLOT.
- `test/phase-d9-hardening.test.mjs` checks boundaries, no duplicate side effects, FAILED, UNKNOWN, and marker failures.
- GitHub workflow is deliberately inactive; the existing dry-run workflow cannot publish.

## Important limitations
- At-most-once *attempt*, not exactly-once publication: a crash after claiming can cause a missed post.
- The current content bank contains four morning and four evening entries, repeating frequently; improve editorial diversity before activation.
- Real GitHub API concurrency and permission testing have not been performed; mocked tests alone do not prove live behavior.
- Graph API version, token lifetime, Cloudinary secrets and live Facebook publish have not been validated in this environment.
- GitHub Actions cron is best-effort and may be delayed or skipped. Workflow must be merged to default branch for schedule activation.
- No automatic retry or deletion of claimed refs. Resolve missed/UNKNOWN slots manually.

## Release checklist
1. Run `npm test`.
2. Verify the GitHub Actions token can create a disposable ref in a test repo.
3. Confirm all three secrets: `FACEBOOK_PAGE_ACCESS_TOKEN`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
4. Verify Page token, image URL and Meta Graph API compatibility.
5. Review content bank and image quality.
6. Prepare separate activation PR with real cron triggers, protected release variable and operational alerts.
7. Merge activation change only when operational checks pass. User's chosen policy is post-first, review-after; no per-post approvals are required.

No secrets are stored in the repository and no Facebook write has been executed.
