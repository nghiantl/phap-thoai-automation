import "dotenv/config";
import { buildFacebookDraft } from "../src/metricool-draft.mjs";

const [imageUrl, publishAt = "2026-11-15T06:00:00+07:00"] = process.argv.slice(2);
if (!imageUrl) {
  console.error('Usage: npm run draft:preview -- "<secure_url>" "2026-11-15T06:00:00+07:00"');
  process.exit(1);
}
const caption = "Bình an không ở đâu xa, bình an bắt đầu từ chính tâm mình 🌸. Hãy sống chánh niệm và nuôi dưỡng lòng từ bi mỗi ngày.";
console.log(JSON.stringify(buildFacebookDraft({caption,imageUrl,publishAt}),null,2));
console.log("PREVIEW ONLY: No request was sent to Metricool or Facebook.");
