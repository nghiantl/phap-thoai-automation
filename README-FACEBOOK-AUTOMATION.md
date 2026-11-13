# Phase D.5 – Facebook direct publishing (safe preview)

The codebase now contains a deterministic, offline Vietnamese Buddhist content engine, 1080×1350 Sharp/SVG image rendering, Cloudinary upload plumbing, a Meta Graph API photo publisher and a scheduled **DRY_RUN** GitHub Actions workflow.

## Current safety status
- `AUTO_PUBLISH_ENABLED=false`, `FACEBOOK_PUBLISH_ENABLED=false` hardcoded in the scheduled workflow.
- No Page token is passed to scheduled jobs. The workflow cannot publish.
- The publisher requires `AUTO_PUBLISH_ENABLED=true`, `FACEBOOK_PUBLISH_ENABLED=true`, `PUBLISH_CONFIRMATION=I_APPROVE_FACEBOOK_POSTING`, and a Page token.
- The runner additionally requires an atomic durable ledger to prevent duplicates. The shipped `createSafeLedger()` deliberately rejects all live claims. **Live mode is NOT ready to enable.**
- Existing Draft PR remains unmerged; GitHub Actions schedules on a PR branch do not run until workflow is on the default branch. Manual workflow dispatch also normally uses the default branch for registration.

## Schedule
GitHub Actions uses UTC: 23:00 UTC = 06:00 Vietnam next day; 12:30 UTC = 19:30 Vietnam same day. The runner accepts only 30-minute windows. GitHub may delay or skip scheduled runs.

## Local dry-run
```bash
npm install
npm test
AUTO_PUBLISH_ENABLED=false FACEBOOK_PUBLISH_ENABLED=false FACEBOOK_PAGE_ID=296758006853316 node scripts/run-facebook-slot.mjs
```
No external requests are made in dry-run. At times outside the slot, status is `OUTSIDE_SLOT`.

## Meta App onboarding
1. Create an app in Meta for Developers. Obtain the required Page permissions, including `pages_manage_posts`, `pages_read_engagement`, and `pages_show_list`. Your app/user must have CREATE_CONTENT rights for the Page.
2. Retrieve the Page Access Token for Page `296758006853316`; do not paste the token into a chat, GitHub issue, source file, or workflow YAML.
3. Keep credentials in GitHub Actions Secrets when the separate live-release gate is ready.
4. Meta app review, business verification and token lifetime vary by app mode and account. Test with a Page you administer.

## Not yet implemented / required before go-live
- Atomic durable slot ledger (for example a DB table with a unique `date+period` key) and reconciliation after uncertain network responses.
- Tested live Graph API photo publishing, image URL checks, retries, observability and token renewal.
- Expanded content bank or a validated LLM source for long-term diversity. The included small editorial bank rotates and is **not** AI-generated content.
- Controlled release workflow with explicit user approval; do not simply flip the two flags.
- No Facebook posts have been published by this PR.
