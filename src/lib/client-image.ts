import { uploadImage } from "@/lib/upload";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image."));
    image.src = src;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to encode image."))),
      type,
      quality,
    );
  });
}

/**
 * Client-side resize/compress, then upload to S3. Returns the public image URL.
 *
 * NOTE: despite the historical name this now returns a hosted URL (not a data
 * URL) — images are stored on S3, not inline in the database. The signature is
 * unchanged so existing callers keep working; pass `options.folder` to group
 * uploads (e.g. "colleges", "courses", "settings").
 */
export async function optimizeImageFileToDataUrl(
  file: File,
  options: {
    maxWidth: number;
    maxHeight: number;
    quality?: number;
    folder?: string;
  },
): Promise<string> {
  const folder = options.folder ?? "uploads";

  // GIF / SVG / icon: don't rasterize — upload the original.
  if (
    file.type === "image/gif" ||
    file.type === "image/svg+xml" ||
    file.type.includes("icon")
  ) {
    return uploadImage(file, folder);
  }

  const source = await readFileAsDataUrl(file);
  const image = await loadImage(source);

  const ratio = Math.min(
    1,
    options.maxWidth / image.width,
    options.maxHeight / image.height,
  );

  const width = Math.max(1, Math.round(image.width * ratio));
  const height = Math.max(1, Math.round(image.height * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Failed to process image.");
  }

  context.drawImage(image, 0, 0, width, height);

  const outputType =
    file.type === "image/png" || file.type === "image/webp"
      ? file.type
      : "image/jpeg";

  const blob = await canvasToBlob(canvas, outputType, options.quality ?? 0.82);
  const ext = outputType.split("/")[1] || "jpg";
  const optimizedFile = new File([blob], `image.${ext}`, { type: outputType });
  return uploadImage(optimizedFile, folder);
}

// Explicit alias for new code — same behavior, clearer name.
export const optimizeAndUploadImage = optimizeImageFileToDataUrl;

export function estimateJsonPayloadSize(value: unknown): number {
  return new TextEncoder().encode(JSON.stringify(value)).length;
}
