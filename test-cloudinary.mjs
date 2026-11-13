
import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

const required = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET"
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

async function uploadImage(imagePath, name) {
  const result = await cloudinary.uploader.upload(imagePath, {
    folder: "phap-thoai-khai-sang",
    public_id: name,
    resource_type: "image",
    overwrite: false,
    unique_filename: true
  });

  if (
    !result.secure_url?.startsWith("https://") ||
    result.resource_type !== "image"
  ) {
    throw new Error("Cloudinary returned an invalid image");
  }

  return {
    publicId: result.public_id,
    url: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format
  };
}

// Test with a local image. Does not publish to Facebook.
try {
  const result = await uploadImage(
    "./test-image.png",
    `test-${Date.now()}`
  );

  console.log("Upload successful:");
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error("Upload failed:", error.message);
  process.exitCode = 1;
}
