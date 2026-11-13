# Pháp Thoại Khai Sáng – Phase D

A **fail-closed** pipeline to generate an OpenAI image, upload it to Cloudinary, and preview a Metricool Facebook draft. **Nothing in this branch publishes or schedules Facebook posts.**

## Setup

Use Node.js 20+, then `npm install`. Copy `.env.example` to `.env` and set `OPENAI_API_KEY`, Cloudinary API key/secret, while keeping `AUTO_PUBLISH_ENABLED=false`. Never commit secrets.

Cloudinary cloud: `yiygxwxc` · Metricool brand: `8074409` · Facebook page: `296758006853316`.

## Commands

- `npm test`: mock tests for safety guards and the image pipeline (no paid API calls).
- `npm run generate:image -- "Bình an và chánh niệm"`: generate an image and upload it to Cloudinary (real API charges apply).
- `npm run draft:preview -- "https://res.cloudinary.com/yiygxwxc/image/upload/v.../photo.png" "2026-11-15T06:00:00+07:00"`: build a draft payload locally **without** sending to Metricool.

## Safe rollout

1. Run automated tests and manually generate one image.
2. Verify Cloudinary HTTPS image accessibility and composition.
3. Preview two post payloads with `draft: true` and `autoPublish: false`.
4. Next phase: implement audited Metricool draft writes, idempotency and read-back verification.
5. Require separate approval before any scheduling or publishing.

No cron and no public endpoint are added here. Existing `test-cloudinary.mjs` is unchanged.
