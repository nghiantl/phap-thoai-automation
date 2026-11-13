import "dotenv/config";
import { generateAndUploadImage } from "../src/image.mjs";

const topic = process.argv.slice(2).join(" ") || "Bình an và chánh niệm buổi sáng";
const postId = "test-" + Date.now();
const result = await generateAndUploadImage({ topic, postId });
console.log(JSON.stringify(result, null, 2));
