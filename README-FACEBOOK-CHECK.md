# Phase D.6 – Facebook read-only connection validation

This phase verifies the Page Access Token without publishing or updating Facebook content.

## GitHub Secrets
Set `FACEBOOK_PAGE_ACCESS_TOKEN` in repository Actions Secrets. Do not paste any secret into source code, issues or chat. User Token and App Secret are **not** required for this read-only check.

## Local test
```bash
npm install
npm test
AUTO_PUBLISH_ENABLED=false FACEBOOK_PUBLISH_ENABLED=false FACEBOOK_PAGE_ID=296758006853316 node scripts/check-facebook-connection.mjs
```
A valid Page token is required. Output includes only Page ID, name, and `tasks` when returned; never prints tokens.

## GitHub Actions
`Facebook Page connection check (read-only)` is a manual workflow. GitHub Actions generally requires a workflow to exist on the repository default branch before it is listed for manual dispatch. This PR stays Draft and is not merged, so the workflow might not be available in the Actions UI yet. You can run the script locally or after explicit approval to merge.

## Security
- HTTP method GET only to `https://graph.facebook.com/v24.0/296758006853316?fields=id,name,tasks`.
- Uses `Authorization: Bearer <token>` header; no token in URL, logs or artifacts.
- Requires `AUTO_PUBLISH_ENABLED=false` and `FACEBOOK_PUBLISH_ENABLED=false`.
- A successful GET confirms identity and token access, **not** that `pages_manage_posts` is approved or that publishing is permitted. App permissions should be checked separately using User Token.
- No Facebook posts, cron, merge or automatic publishing.
