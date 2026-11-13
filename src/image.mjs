import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";
import { assertDraftMode, envValue } from "./config.mjs";

export const WIDTH = 1080;
export const HEIGHT = 1350;

const THEMES = Object.freeze({
  morning: [
    { sky: "#F9DDA4", horizon: "#E9A976", water: "#8DAFA7", glow: "#FFF2CA", lotus: "#FFF2EA", ink: "#442E29", title: "LỜI CHÚC BUỔI SÁNG" },
    { sky: "#F6E9C5", horizon: "#D9B68B", water: "#8BA6A4", glow: "#FFF9E4", lotus: "#FFE3D9", ink: "#42392D", title: "BÌNH AN MỖI SÁNG" }
  ],
  evening: [
    { sky: "#242E53", horizon: "#58618A", water: "#293E5E", glow: "#F2DDAA", lotus: "#F8DDEB", ink: "#FFF5E8", title: "LẮNG LÒNG BUỔI TỐI" },
    { sky: "#283D4A", horizon: "#536D76", water: "#244B5B", glow: "#F4D5A2", lotus: "#F4E5E5", ink: "#FFF9EE", title: "AN YÊN MỖI TỐI" }
  ]
});

export function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;"
  })[char]);
}

function wrapText(value, maxChars = 24, maxLines = 4) {
  if (typeof value !== "string" || value.trim().length < 5 || value.length > 180)
    throw new Error("Message must be 5-180 characters");
  const words = value.trim().replace(/\s+/g, " ").split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    if (word.length > maxChars) throw new Error("Message contains an unbreakable word");
    const next = line ? line + " " + word : word;
    if (next.length > maxChars) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) throw new Error("Message is too long for the template");
  return lines;
}

function lotus(x, y, scale, color) {
  const petals = [-54, -27, 0, 27, 54].map(angle =>
    `<ellipse cx="0" cy="-42" rx="20" ry="58" fill="${color}" fill-opacity=".88" transform="rotate(${angle})"/>`).join("");
  return `<g transform="translate(${x} ${y}) scale(${scale})"><g>${petals}</g><ellipse cx="0" cy="10" rx="77" ry="12" fill="#F7D7A2" fill-opacity=".55"/></g>`;
}

/** All backgrounds are original vector artwork: no third-party images or licenses. */
export function renderTemplateSvg({ period, message, variant = 0 }) {
  if (!Object.hasOwn(THEMES, period)) throw new Error("period must be morning or evening");
  if (!Number.isInteger(variant) || variant < 0) throw new Error("Invalid variant");
  const theme = THEMES[period][variant % THEMES[period].length];
  const lines = wrapText(message);
  const yStart = 670 - (lines.length - 1) * 39;
  const text = lines.map((line, i) =>
    `<text x="540" y="${yStart + i * 78}" text-anchor="middle" font-family="Noto Sans, DejaVu Sans, sans-serif" font-size="57" font-weight="700" fill="${theme.ink}">${escapeXml(line)}</text>`).join("");
  const stars = period === "evening"
    ? Array.from({length:20},(_,i)=>`<circle cx="${(i*197+79)%1080}" cy="${(i*83+65)%390}" r="${i%3+1}" fill="#FFF8E9" opacity=".7"/>`).join("")
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 1080 1350">
    <defs>
      <linearGradient id="sky" x2="0" y2="1"><stop stop-color="${theme.sky}"/><stop offset="1" stop-color="${theme.horizon}"/></linearGradient>
      <linearGradient id="lake" x2="0" y2="1"><stop stop-color="${theme.water}"/><stop offset="1" stop-color="${theme.sky}"/></linearGradient>
    </defs>
    <rect width="1080" height="1350" fill="url(#sky)"/>
    ${stars}
    <circle cx="820" cy="260" r="128" fill="${theme.glow}" opacity=".78"/>
    <path d="M0 440 Q150 320 330 450 T690 440 T1080 425 V1350 H0Z" fill="${theme.water}" opacity=".35"/>
    <path d="M0 970 Q300 915 540 975 T1080 950 V1350 H0Z" fill="url(#lake)"/>
    <rect x="72" y="500" width="936" height="520" rx="46" fill="${period === "morning" ? "#FFF9ED" : "#101B33"}" opacity=".85"/>
    <text x="540" y="580" text-anchor="middle" font-family="Noto Sans, DejaVu Sans, sans-serif" font-size="34" letter-spacing="4" fill="${theme.ink}">${escapeXml(theme.title)}</text>
    ${text}
    <path d="M390 905 H690" stroke="${theme.ink}" stroke-opacity=".4" stroke-width="2"/>
    <text x="540" y="961" text-anchor="middle" font-family="Noto Sans, DejaVu Sans, sans-serif" font-size="30" fill="${theme.ink}">PHÁP THOẠI KHAI SÁNG</text>
    ${lotus(260,1135,1.2,theme.lotus)}
    ${lotus(815,1170,.9,theme.lotus)}
    ${lotus(545,1230,.65,theme.lotus)}
  </svg>`;
}

export async function createImageBuffer({ period, message, variant = 0, imageProcessor = sharp }) {
  const svg = Buffer.from(renderTemplateSvg({ period, message, variant }));
  const result = await imageProcessor(svg).png().toBuffer();
  const metadata = await sharp(result).metadata();
  if (metadata.width !== WIDTH || metadata.height !== HEIGHT)
    throw new Error("Incorrect output dimensions");
  return result;
}

export async function generateAndUploadImage({
  period, message, postId, variant = 0, env = process.env,
  imageProcessor = sharp, uploader
} = {}) {
  assertDraftMode(env);
  if (typeof postId !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/.test(postId))
    throw new Error("Invalid postId");
  const png = await createImageBuffer({ period, message, variant, imageProcessor });
  const cloudName = envValue("CLOUDINARY_CLOUD_NAME", env);
  if (!uploader) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: envValue("CLOUDINARY_API_KEY", env),
      api_secret: envValue("CLOUDINARY_API_SECRET", env),
      secure: true
    });
  }
  const upload = await (uploader ?? cloudinary.uploader).upload(
    "data:image/png;base64," + png.toString("base64"),
    { folder:"phap-thoai-khai-sang", public_id:"post-" + postId,
      overwrite:false, resource_type:"image" }
  );
  const url = new URL(upload.secure_url);
  if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com" ||
      !url.pathname.startsWith("/" + cloudName + "/image/upload/"))
    throw new Error("Unexpected Cloudinary image URL");
  if (upload.resource_type && upload.resource_type !== "image")
    throw new Error("Unexpected Cloudinary resource type");
  return { imageUrl:url.toString(), publicId:upload.public_id,
    width:WIDTH, height:HEIGHT, period, variant };
}
