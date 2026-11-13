# Phase D.4: Metricool Free without API Token

Metricool officially supports **CSV import** with a Draft field. This branch builds a CSV from reviewed content and public Cloudinary URLs, but **does not import it into Metricool automatically**. No API token or paid Metricool plan is required for the manual import. The connected ChatGPT Metricool MCP is a separate optional workflow.

## One-time setup

1. In Metricool Planning > Import CSV > Download template, download the template for your brand. Save the original header-only CSV as `metricool-template.csv` in the working directory (the workflow expects it in the repository; review its contents before committing). Never modify or reorder its columns.
2. Set Cloudinary credentials in your local `.env` or GitHub Actions Secrets (`CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`). Keep `AUTO_PUBLISH_ENABLED=false`.
3. Copy `content/draft-plan.example.json` to `content/draft-plan.json`, edit captions, dates and short image messages. Ensure there are no existing Metricool drafts for the same slots before importing.

## Local execution
```bash
npm install
npm test
node scripts/build-draft-bundle.mjs content/draft-plan.json
```
The output is `dist/metricool-drafts.csv` (UTF-8 with BOM) and `dist/draft-manifest.json`. Images are uploaded to Cloudinary, but **no Metricool call is made**.

## GitHub Actions
After committing the official `metricool-template.csv` and a reviewed plan, open Actions > Prepare Metricool draft CSV (manual) > Run workflow. Download the `metricool-draft-csv` artifact. This workflow is **manual only**, not scheduled.

## Metricool import
In Planning > Import CSV, choose the generated CSV, select date format `YYYY-MM-DD`, time format `HH:mm:ss`, verify all rows have `Draft=TRUE`, Facebook only, and the right images. Import only after reviewing the preview. Metricool's template may change; if the field names differ, adjust the mapping in `src/csv-drafts.mjs` and re-run tests.

**Safety:** CSV import can create duplicates if repeated; no programmatic read-back is possible without API access. No publishing, no Vercel deployment, no cron, no automatic Metricool import, no merge.
