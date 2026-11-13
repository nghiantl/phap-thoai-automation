# Pháp Thoại Khai Sáng – Phase D.3

Free Sharp/SVG images (1080×1350) → Cloudinary → safe Metricool Facebook draft workflow.

## Safety
- `AUTO_PUBLISH_ENABLED=false` is mandatory. `METRICOOL_DRAFT_WRITES_ENABLED=false` by default.
- No cron, Vercel route, automated execution, Facebook publishing, scheduling or merge.
- `src/metricool-api.mjs` implements an independently callable **official Metricool API adapter**, with strict brand/page checks, fixed HTTPS host, token header, GET list and guarded PUT update.
- `src/metricool-integration.mjs` checks draft identity, UUID, text/time, existing media, and read-back. The transport adapter is not automatically invoked.
- Metricool's direct API currently requires an Advanced or Custom subscription; connected ChatGPT Metricool tools are a separate integration.
- Keep `METRICOOL_API_TOKEN` and `METRICOOL_USER_ID` in local environment or Vercel project settings, never GitHub.

## Install and test
```bash
npm install
npm test
npm run generate:image -- morning "Bình an bắt đầu từ chính tâm mình"
npm run generate:image -- evening "Đêm xuống rồi, hãy để lòng bình yên"
```
Update and commit `package-lock.json` after npm install before configuring CI.

## Metricool read-only smoke test
If your Metricool plan provides API access, set the values in `.env`:
```env
METRICOOL_USER_ID=your_user_id
METRICOOL_API_TOKEN=your_api_token
METRICOOL_BLOG_ID=8074409
FACEBOOK_PAGE_ID=296758006853316
AUTO_PUBLISH_ENABLED=false
METRICOOL_DRAFT_WRITES_ENABLED=false
```
Then run:
```bash
node scripts/metricool-safe-check.mjs "2026-11-15T00:00:00" "2026-11-16T00:00:00"
```
This lists draft metadata without any write. The independent API adapter is not yet deployed to Vercel; no API credentials have been supplied or used in this PR.

## Existing live verification
Morning Metricool draft UUID `-2137464596706156`, ID `426529682`, already has the Cloudinary image and remains `draft=true`, `autoPublish=false`. Evening draft remains unchanged.

## Next validation
Confirm API plan access, run read-only smoke test and tests, then review a separate controlled draft-only Vercel endpoint. Do not enable publishing.
