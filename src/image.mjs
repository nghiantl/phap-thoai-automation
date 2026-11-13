import OpenAI from "openai";
import { v2 as cloudinary } from "cloudinary";
import { assertDraftMode, envValue } from "./config.mjs";

export function buildImagePrompt(topic) {
  if (typeof topic !== "string" || topic.trim().length < 5 || topic.length > 500)
    throw new Error("Invalid image topic");
  return `Create a respectful Vietnamese Buddhist spiritual illustration about: ${topic}.
Tranquil lotus flowers, warm golden lighting, serene natural scenery,
tasteful and contemplative composition, no text, logos, watermarks, or fake scripture.
Vertical image with generous safe margins for 4:5 cropping.`;
}

export async function generateAndUploadImage({ topic, postId, env = process.env, imageClient, uploader } = {}) {
  assertDraftMode(env);
  if (typeof postId !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/.test(postId))
    throw new Error("Invalid postId");
  const client = imageClient ?? new OpenAI({ apiKey: envValue("OPENAI_API_KEY", env) });
  const response = await client.images.generate({
    model: env.OPENAI_IMAGE_MODEL || "gpt-image-1.5",
    size: "1024x1536",
    quality: "medium",
    n: 1,
    prompt: buildImagePrompt(topic)
  });
  const base64 = response.data?.[0]?.b64_json;
  if (!base64) throw new Error("OpenAI did not return an image");
  if (!uploader) {
    cloudinary.config({
      cloud_name: envValue("CLOUDINARY_CLOUD_NAME", env),
      api_key: envValue("CLOUDINARY_API_KEY", env),
      api_secret: envValue("CLOUDINARY_API_SECRET", env),
      secure: true
    });
  }
  const upload = await (uploader ?? cloudinary.uploader).upload(
    "data:image/png;base64," + base64,
    {
      folder: "phap-thoai-khai-sang",
      public_id: "post-" + postId,
      overwrite: false,
      resource_type: "image"
    }
  );
  const cloudName = envValue("CLOUDINARY_CLOUD_NAME", env);
  const url = new URL(upload.secure_url);
  if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com" ||
      !url.pathname.startsWith("/" + cloudName + "/image/upload/"))
    throw new Error("Unexpected Cloudinary image URL");
  if (upload.resource_type && upload.resource_type !== "image")
    throw new Error("Unexpected Cloudinary resource type");
  return {
    imageUrl: url.toString(),
    publicId: upload.public_id,
    width: upload.width,
    height: upload.height
  };
}
