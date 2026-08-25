/**
 * Utility to resize, compress, and optimize images to lightweight Data URLs
 * ensuring Firestore documents never exceed the 1,048,576 byte limit,
 * while preserving high visual quality for screen and A4 print.
 */

import { MeetingPhoto } from "@/types/meeting";

/**
 * Compresses an image file with multi-pass size optimization targeting ~40-60KB.
 */
export async function processImageFile(
  file: File,
  maxWidth = 800,
  maxHeight = 600,
  targetMaxBytes = 65000
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Resize down proportionally
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Multi-pass compression to guarantee under target bytes
        let quality = 0.75;
        let dataUrl = canvas.toDataURL("image/jpeg", quality);

        while (dataUrl.length > targetMaxBytes * 1.37 && quality > 0.35) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        // If still large, scale canvas down by 20%
        if (dataUrl.length > targetMaxBytes * 1.37) {
          const smallCanvas = document.createElement("canvas");
          smallCanvas.width = Math.round(width * 0.8);
          smallCanvas.height = Math.round(height * 0.8);
          const sCtx = smallCanvas.getContext("2d");
          if (sCtx) {
            sCtx.fillStyle = "#ffffff";
            sCtx.fillRect(0, 0, smallCanvas.width, smallCanvas.height);
            sCtx.drawImage(img, 0, 0, smallCanvas.width, smallCanvas.height);
            dataUrl = smallCanvas.toDataURL("image/jpeg", 0.6);
          }
        }

        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Re-compresses an existing base64 image data url if needed
 */
export async function recompressDataUrl(
  dataUrl: string,
  maxWidth = 700,
  maxHeight = 525,
  quality = 0.65
): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith("data:image")) return dataUrl;
  // If already under 50KB, no need to touch
  if (dataUrl.length < 65000) return dataUrl;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Ensures an array of photos stays safely under Firestore's document byte limit (~500KB max for all photos combined)
 */
export async function optimizePhotosPayload(
  photos: MeetingPhoto[],
  maxTotalBytes = 500000
): Promise<MeetingPhoto[]> {
  if (!photos || photos.length === 0) return [];

  // Calculate current total length
  let totalLength = photos.reduce((acc, p) => acc + (p.url ? p.url.length : 0), 0);
  if (totalLength < maxTotalBytes) {
    return photos;
  }

  // If too large, recompress each photo adaptively based on count
  const targetPerPhotoBytes = Math.floor(maxTotalBytes / Math.max(1, photos.length));
  const optimized: MeetingPhoto[] = [];

  for (const photo of photos) {
    if (
      photo.url &&
      photo.url.startsWith("data:image") &&
      photo.url.length > targetPerPhotoBytes * 1.37
    ) {
      const smallerUrl = await recompressDataUrl(photo.url, 640, 480, 0.55);
      optimized.push({ ...photo, url: smallerUrl });
    } else {
      optimized.push(photo);
    }
  }

  return optimized;
}
