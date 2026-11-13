import "dotenv/config";
import { readFile } from "node:fs/promises";
import { prepareDraftUpdate } from "../src/metricool-integration.mjs";

const [path,imageUrl]=process.argv.slice(2);
if(!path || !imageUrl) {
  console.error('Usage: node scripts/preview-metricool-update.mjs ./draft.json "<Cloudinary secure_url>"');
  process.exit(1);
}
const original=JSON.parse(await readFile(path,"utf8"));
console.log(JSON.stringify(prepareDraftUpdate({original,imageUrl}),null,2));
console.log("DRY RUN ONLY: no Metricool writes");
