import "dotenv/config";
import { writeFile } from "node:fs/promises";
import { createImageBuffer, generateAndUploadImage } from "../src/image.mjs";
import { assertDraftMode } from "../src/config.mjs";

assertDraftMode();
const [period = "morning", message = "Bình an bắt đầu từ chính tâm mình", mode = "local"] = process.argv.slice(2);
if (mode === "upload") {
  const result = await generateAndUploadImage({period,message,postId:"test-"+Date.now()});
  console.log(JSON.stringify(result,null,2));
} else if (mode === "local") {
  const buffer = await createImageBuffer({period,message});
  const file = `preview-${period}.png`;
  await writeFile(file,buffer);
  console.log("Saved "+file+" (1080x1350); no network calls.");
} else throw new Error("mode must be local or upload");
