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

export async function optimizeImageFileToDataUrl(
  file: File,
  options: {
    maxWidth: number;
    maxHeight: number;
    quality?: number;
  },
): Promise<string> {
  if (file.type === "image/gif") {
    return readFileAsDataUrl(file);
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

  return canvas.toDataURL(outputType, options.quality ?? 0.82);
}

export function estimateJsonPayloadSize(value: unknown): number {
  return new TextEncoder().encode(JSON.stringify(value)).length;
}
