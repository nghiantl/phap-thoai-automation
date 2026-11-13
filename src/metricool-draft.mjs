import { assertDraftMode } from "./config.mjs";

export function assertCloudinaryImageUrl(imageUrl, cloudName = "yiygxwxc") {
  const url = new URL(imageUrl);
  if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com" ||
      !url.pathname.startsWith("/" + cloudName + "/image/upload/"))
    throw new Error("Image must be a public HTTPS image on the configured Cloudinary cloud");
  if (url.searchParams.has("token") || url.searchParams.has("signature"))
    throw new Error("Do not use signed/private query parameters");
  return url.toString();
}
export function buildFacebookDraft({ caption, imageUrl, publishAt, env = process.env }) {
  assertDraftMode(env);
  if (typeof caption !== "string" || caption.trim().length < 50)
    throw new Error("Caption is too short");
  const date = new Date(publishAt);
  if (Number.isNaN(date.getTime()) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+07:00$/.test(publishAt))
    throw new Error("publishAt must be YYYY-MM-DDTHH:mm:ss+07:00");
  const cloudName = env.CLOUDINARY_CLOUD_NAME || "yiygxwxc";
  return {
    publicationDate: { dateTime: publishAt.slice(0,19), timezone: "Asia/Ho_Chi_Minh" },
    text: caption.trim(),
    providers: [{ network: "facebook" }],
    facebookData: { type: "POST" },
    media: [assertCloudinaryImageUrl(imageUrl, cloudName)],
    draft: true,
    autoPublish: false
  };
}
/** No live Metricool API call is made by Phase D. This fails closed even if called accidentally. */
export async function publishDraft() {
  throw new Error("Metricool write integration is disabled in Phase D. Review and authorize a separate implementation.");
}
