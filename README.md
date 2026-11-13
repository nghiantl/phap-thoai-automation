# Pháp Thoại Khai Sáng – Phase D.2

Generate **1080 × 1350** Buddhist lotus artwork for free with Sharp/SVG, upload it to Cloudinary, and safely prepare or update **existing** Metricool Facebook drafts. No OpenAI Image API is used.

## Safety

- `AUTO_PUBLISH_ENABLED=false` is mandatory for image creation and Metricool draft handling.
- `METRICOOL_DRAFT_WRITES_ENABLED=false` by default. A real write requires explicit `allowWrite:true`, `METRICOOL_DRAFT_WRITES_ENABLED=true`, and an injected verified Metricool adapter.
- Only the expected brand `8074409`, Facebook Page `296758006853316`, Facebook POST drafts, and timezone `Asia/Ho_Chi_Minh` are permitted.
- Existing drafts are located by UUID; changed IDs, content, or media are rejected. No automatic duplicate creation. The update is read back and checked.
- No cron, public endpoint, publishing or scheduling. PR stays Draft.

## Setup and local tests

Node.js 20+. Copy `.env.example` to `.env`, set Cloudinary keys, and run:

```bash
npm install
npm test
npm run generate:image -- morning "Bình an bắt đầu từ chính tâm mình"
npm run generate:image -- evening "Đêm xuống rồi, hãy để lòng bình yên"
npm run generate:image -- morning "Bình an bắt đầu từ chính tâm mình" upload
```

`npm install` regenerates the removed stale package lock. Check Vietnamese fonts in local previews.

## Metricool draft preview

```bash
npm run draft:preview -- "https://res.cloudinary.com/yiygxwxc/image/upload/v1794543552/phap-thoai-khai-sang/post-test-1794543549446.png" "2026-11-15T06:00:00+07:00"
```

To preview an **existing** draft update, save the exact latest Metricool draft JSON (without account credentials) to `draft.json`, then:

```bash
node scripts/preview-metricool-update.mjs ./draft.json "https://res.cloudinary.com/yiygxwxc/image/upload/v1794543552/phap-thoai-khai-sang/post-test-1794543549446.png"
```

This only prints a safe request. The `src/metricool-integration.mjs` module accepts a trusted Metricool transport with `listDrafts()` and `updateDraft()` for later integration; it does **not** guess undocumented API endpoints or store credentials.

## Live draft verification (2026-11-13)

The connected Metricool app successfully updated morning draft UUID `-2137464596706156`, now ID `426529682`, preserving 06:00 Vietnam time, `draft=true` and `autoPublish=false`. Metricool stored the Cloudinary image as its own media URL. Evening draft UUID `5965844497316925114` remains unchanged.

This branch does not automatically execute Metricool API calls. Review and test before merging.
