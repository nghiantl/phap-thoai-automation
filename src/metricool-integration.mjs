import { assertDraftMode } from "./config.mjs";
import { assertCloudinaryImageUrl } from "./metricool-draft.mjs";

const BRAND = "8074409";
const PAGE = "296758006853316";
const ZONE = "Asia/Ho_Chi_Minh";

export function assertDraftPost(post) {
  if (!post || post.draft !== true || post.autoPublish !== false)
    throw new Error("draft=true and autoPublish=false are required");
  if (!Array.isArray(post.providers) || post.providers.length !== 1 ||
      post.providers[0].network !== "facebook" || post.facebookData?.type !== "POST")
    throw new Error("Only Facebook POST drafts are allowed");
  if (post.publicationDate?.timezone !== ZONE)
    throw new Error("Unexpected timezone");
}

export function prepareDraftUpdate({original,imageUrl,env=process.env}) {
  assertDraftMode(env);
  if (String(env.METRICOOL_BLOG_ID || BRAND) !== BRAND) throw new Error("Wrong Metricool brand");
  if (String(env.FACEBOOK_PAGE_ID || PAGE) !== PAGE) throw new Error("Wrong Facebook page");
  assertDraftPost(original);
  if (!original.id || !original.uuid || typeof original.text !== "string")
    throw new Error("Missing original draft id, uuid or text");
  const mediaUrl = assertCloudinaryImageUrl(imageUrl,env.CLOUDINARY_CLOUD_NAME || "yiygxwxc");
  const info = {
    publicationDate:structuredClone(original.publicationDate),
    text:original.text,
    firstCommentText:original.firstCommentText || "",
    providers:[{network:"facebook"}],
    facebookData:{type:"POST"},
    media:[mediaUrl],
    draft:true,
    autoPublish:false,
    shortener:original.shortener === true,
    hasNotReadNotes:original.hasNotReadNotes === true
  };
  assertDraftPost(info);
  return {id:String(original.id),uuid:String(original.uuid),blogId:BRAND,info};
}

/** Inject a verified Metricool adapter; no guessed API URLs or secrets. */
export async function updateExistingDraft({
  original,imageUrl,env=process.env,transport,allowWrite=false
}) {
  const request=prepareDraftUpdate({original,imageUrl,env});
  if (!allowWrite) return {status:"DRY_RUN",request};
  if (env.METRICOOL_DRAFT_WRITES_ENABLED !== "true")
    throw new Error("Draft writes must be explicitly enabled");
  if (!transport || typeof transport.listDrafts !== "function" ||
      typeof transport.updateDraft !== "function")
    throw new Error("Verified Metricool adapter required");

  const current=(await transport.listDrafts()).find(p=>String(p.uuid)===request.uuid);
  if (!current) throw new Error("Draft not found; no duplicate will be created");
  assertDraftPost(current);
  if (String(current.id)!==request.id) throw new Error("Draft ID changed; refresh");
  if (current.text!==original.text ||
      JSON.stringify(current.publicationDate)!==JSON.stringify(original.publicationDate))
    throw new Error("Draft was modified; refusing to overwrite");
  const media=current.media || [];
  if (media.includes(imageUrl)) return {status:"UNCHANGED",uuid:request.uuid};
  if (media.length) throw new Error("Draft already contains media; manual review required");

  const result=await transport.updateDraft(request);
  assertDraftPost(result);
  if (String(result.uuid)!==request.uuid) throw new Error("UUID mismatch");
  const after=(await transport.listDrafts()).find(p=>String(p.uuid)===request.uuid);
  if (!after) throw new Error("Updated draft missing on readback");
  assertDraftPost(after);
  if (after.text!==original.text ||
      JSON.stringify(after.publicationDate)!==JSON.stringify(original.publicationDate) ||
      !Array.isArray(after.media) || after.media.length!==1)
    throw new Error("Draft readback mismatch");
  return {status:"UPDATED_DRAFT",id:after.id,uuid:after.uuid,media:after.media};
}
