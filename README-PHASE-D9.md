# Phase D.9 – GitHub-only automated publishing: release gated

## Completed
- Atomic GitHub ref claim before external side effects, terminal state markers, at-most-once attempt.
- Vietnam windows 06:00–08:59 and 19:30–22:29, accommodating bounded GitHub cron delays.
- Curated original editorial bank: 12 morning and 12 evening messages, deterministic rotation. No fabricated religious quotations.
- Scheduled production workflow at 23:00 and 12:30 UTC, plus manual dispatch. **Requires merge into default branch and LIVE_PUBLISH_RELEASE=true.** If the variable is missing/false, job is skipped and no Facebook write is possible.
- Read-only Facebook Page verification and required-secret presence check before each attempt.
- Mock unit tests for idempotency, failures, slot windows and editorial uniqueness.

## Important limitations
- GitHub scheduled runs are best-effort; they may be delayed or skipped. A delay beyond 3 hours skips the slot.
- At-most-once attempts are not guaranteed delivery: an interrupted run can leave a claim and no Facebook post.
- Real GitHub API concurrency and live Facebook photo POST have not been verified. A successful Page GET does not verify posting permissions at runtime.
- Token expiry, app access and Cloudinary upload failure require monitoring. This code does not renew Page tokens.
- GitHub ref status markers do not store the Facebook post ID; review the Page directly.
- The production workflow must be merged to main before GitHub cron runs. The old DRY_RUN schedule remains active after merge unless removed in a separate cleanup.
- No external paid API is required, but service usage limits still apply.

## Before activation
1. Run `npm ci && npm test` on the branch.
2. In GitHub Actions secrets verify `FACEBOOK_PAGE_ACCESS_TOKEN`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Do not paste them into chat or repository files.
3. Verify GitHub Actions has `contents: write` access and GitHub's `POST /git/refs` works with a disposable test ref.
4. Check Graph API version compatibility and perform a controlled publishing integration test only if desired; user chose post-first/review-after and no per-post approval.
5. Merge PR after code review; set repository Actions variable `LIVE_PUBLISH_RELEASE=true` to enable automatic publishing. Setting it false disables future publishing jobs without removing schedules.
6. Review workflow results and Page posts after first live run.

## Safety
No tokens committed. No live Facebook post made in this change. Draft PR remains unmerged.
