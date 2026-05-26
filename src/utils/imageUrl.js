import { BACKEND_BASE_URL, HAS_API_BASE_URL } from "../config/api";
import { HOME_IMAGE_URL } from "./publicAsset";

const base = BACKEND_BASE_URL.replace(/\/+$/, "");

function normalizeLegacyImagePath(imagePath) {
  if (typeof imagePath !== "string") {
    return imagePath;
  }

  if (imagePath.startsWith("/images/grounds/")) {
    const filename = imagePath.split("/").pop();
    return filename ? `/uploads/grounds/${filename}` : imagePath;
  }

  return imagePath;
}

export function getGroundImages(ground) {
  if (!ground || typeof ground !== "object") {
    return [];
  }

  if (Array.isArray(ground.images) && ground.images.length > 0) {
    return ground.images;
  }

  if (ground.image) {
    return [ground.image];
  }

  return [];
}

function extractImagePath(image) {
  if (!image) {
    return null;
  }

  if (typeof image === "string") {
    return image;
  }

  if (typeof image !== "object") {
    return null;
  }

  return (
    image.url ||
    image.image ||
    image.src ||
    image.path ||
    image.image_path ||
    image.image_url ||
    image.file_path ||
    image.file_url ||
    null
  );
}

export function getImageUrl(path) {
  const normalizedPath = normalizeLegacyImagePath(extractImagePath(path));

  if (!normalizedPath || typeof normalizedPath !== "string") {
    return null;
  }

  if (/^https?:\/\//i.test(normalizedPath)) {
    return normalizedPath;
  }

  if (!HAS_API_BASE_URL) {
    return null;
  }

  if (normalizedPath.startsWith("/")) {
    return `${base}${normalizedPath}`;
  }

  if (normalizedPath.includes("/")) {
    return `${base}/uploads/${normalizedPath}`;
  }

  return `${base}/uploads/grounds/${normalizedPath}`;
}

export function resolveGroundImageUrl(image) {
  return getImageUrl(image) || HOME_IMAGE_URL;
}
