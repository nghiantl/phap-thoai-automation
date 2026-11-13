# Pháp Thoại Khai Sáng – Phase D (free image generation)

This branch replaces the paid OpenAI Image API with **Sharp + original SVG artwork**. Two palettes (morning/evening) with two variations each, lotus artwork, typography and gradients. Images are **1080 × 1350 PNG**. The original backgrounds are generated from SVG; no stock images or image API licenses are needed.

**No Metricool writes, Facebook publishing, scheduling or cron are enabled.** All code requires `AUTO_PUBLISH_ENABLED=false`. Existing Metricool draft preview remains read-only.

## Requirements

Node.js 20+, `npm install`, then `npm test`. Copy `.env.example` to `.env`. Do not commit secrets.

## Local previews (free, no credentials)

```bash
npm run generate:image -- morning "Bình an bắt đầu từ chính tâm mình"
npm run generate:image -- evening "Đêm xuống rồi, hãy để lòng bình yên"
```

These create `preview-morning.png` and `preview-evening.png` locally. Review Vietnamese typography; install Noto Sans if your environment lacks a Vietnamese-capable font. Do not attribute invented quotes to the Buddha.

## Cloudinary upload (uses free-tier quota)

Set Cloudinary environment variables locally and keep `AUTO_PUBLISH_ENABLED=false`.

```bash
npm run generate:image -- morning "Bình an bắt đầu từ chính tâm mình" upload
```

The command uploads one image to Cloudinary cloud `yiygxwxc` and prints `imageUrl`. It does not call Metricool. Cloudinary free-tier limits may apply.

## Metricool draft preview (no writes)

```bash
npm run draft:preview -- "https://res.cloudinary.com/yiygxwxc/image/upload/v.../photo.png" "2026-11-15T06:00:00+07:00"
```

Next phase: explicit Metricool draft-write integration, idempotency, read-back verification and deployment, with separate approval. This PR must remain Draft and must not be merged without review.
