# Phase D.9 – GitHub-only durable publishing, staged (NOT ACTIVATED)

## Design
- Every slot `YYYY-MM-DD-morning|evening` is claimed using GitHub REST `POST /repos/{owner}/{repo}/git/refs` with ref `refs/tags/facebook-ledger/claimed/<slot>`. Duplicate creation is rejected by GitHub; only a verified existing claim is treated as already claimed.
- After execution, an append-only ref under `facebook-ledger/published`, `failed` or `unknown` records the result. A crash may leave only the claim; **treat this as UNKNOWN and reconcile manually**, never automatically retry.
- This is at-most-once *attempt*, not exactly-once delivery. A crash after claiming can skip a post. A Facebook timeout may mean the post exists.
- GitHub token must have `contents: write`; workflow concurrency serializes attempts. GitHub ref creation is the atomic lock; concurrency alone is insufficient.
- Facebook write is gated by existing `assertPublishConfig`. The release workflow has **no usable trigger** and requires `LIVE_PUBLISH_RELEASE=true` GitHub repository variable. Neither is configured here.
- `npm test` exercises mock concurrent claims, duplicate and UNKNOWN states. No real GitHub concurrent ref integration test or live Facebook post has been executed.

## Planned release
1. Review content quality: the current engine has only four morning and four evening entries and repeats frequently; expand before live posting.
2. Test GitHub ref creation with a throwaway slot/ref in a test repository, and test permissions of the GitHub Actions token.
3. Ensure GitHub Actions secrets `FACEBOOK_PAGE_ACCESS_TOKEN`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` are configured.
4. Test Cloudinary and Facebook API versions; verify token lifecycle and safe log output.
5. Create a separate activation change: add `workflow_dispatch` and cron `0 23 * * *`, `30 12 * * *`; set `LIVE_PUBLISH_RELEASE=true`. Existing 30-minute windows can miss delayed GitHub schedule executions; revise time-slot selection before activation.
6. Only then merge activation change. Do not merge this PR without confirming intended deployment. This PR alone cannot publish.

## Security
No token or secret is committed. No live Facebook API request has been made.
