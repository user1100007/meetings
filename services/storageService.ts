import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { MeetingAttachment, MeetingPhoto } from "@/types/meeting";
import { processImageFile } from "@/lib/imageUtils";

/**
 * Format bytes into human readable format (KB, MB)
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

/**
 * Identify file category for icon and preview handling
 */
export function getFileTypeCategory(
  mimeType: string,
  fileName: string
): "pdf" | "image" | "doc" | "other" {
  const lowerName = fileName.toLowerCase();
  const lowerMime = (mimeType || "").toLowerCase();

  if (lowerMime.includes("pdf") || lowerName.endsWith(".pdf")) {
    return "pdf";
  }
  if (
    lowerMime.startsWith("image/") ||
    /\.(jpg|jpeg|png|webp|gif|svg|bmp)$/i.test(lowerName)
  ) {
    return "image";
  }
  if (
    lowerMime.includes("word") ||
    lowerMime.includes("document") ||
    lowerMime.includes("text") ||
    /\.(doc|docx|txt|rtf|odt)$/i.test(lowerName)
  ) {
    return "doc";
  }
  return "other";
}

/**
 * Convert file to Base64 (used as resilient fallback if storage bucket is unreachable)
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Upload a meeting photo to Firebase Storage
 */
export async function uploadMeetingPhoto(
  file: File,
  meetingId: string,
  onProgress?: (progress: number) => void
): Promise<MeetingPhoto> {
  const photoId = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const cleanName = file.name.replace(/[^a-zA-Z0-9.\u1780-\u17FF_-]/g, "_");
  const storagePath = `photos/meetings/${meetingId || "general"}/${Date.now()}_${cleanName}`;

  try {
    const storageRef = ref(storage, storagePath);
    const metadata = {
      contentType: file.type || "image/jpeg",
      customMetadata: {
        originalName: file.name,
        uploadedAt: String(Date.now()),
        meetingId: meetingId || "general",
      },
    };

    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    const downloadUrl = await new Promise<string>((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          if (snapshot.totalBytes > 0 && onProgress) {
            const percent = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            onProgress(percent);
          }
        },
        (error) => {
          console.warn("Firebase Storage photo upload task error:", error);
          reject(error);
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          } catch (urlErr) {
            reject(urlErr);
          }
        }
      );
    });

    return {
      id: photoId,
      url: downloadUrl,
      storagePath,
      caption: `រូបភាព៖ ${file.name.replace(/\.[^/.]+$/, "")}`,
      width: "medium",
    };
  } catch (storageErr) {
    console.warn("Falling back to optimized local data URL for photo:", storageErr);
    const compressedDataUrl = await processImageFile(file, 900, 675, 60000);
    if (onProgress) onProgress(100);

    return {
      id: photoId,
      url: compressedDataUrl,
      caption: `រូបភាព៖ ${file.name.replace(/\.[^/.]+$/, "")}`,
      width: "medium",
    };
  }
}

/**
 * Delete a photo from Firebase Storage
 */
export async function deleteMeetingPhoto(photo: MeetingPhoto): Promise<void> {
  if (photo.storagePath) {
    try {
      const fileRef = ref(storage, photo.storagePath);
      await deleteObject(fileRef);
    } catch (err) {
      console.warn("Failed to delete photo from Firebase Storage:", err);
    }
  }
}

/**
 * Upload a document attachment (PDF, image, doc) to Firebase Storage
 */
export async function uploadMeetingAttachment(
  file: File,
  meetingId: string,
  onProgress?: (progress: number) => void
): Promise<MeetingAttachment> {
  const fileId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const fileType = getFileTypeCategory(file.type, file.name);
  const cleanName = file.name.replace(/[^a-zA-Z0-9.\u1780-\u17FF_-]/g, "_");
  const storagePath = `attachments/meetings/${meetingId || "general"}/${Date.now()}_${cleanName}`;

  try {
    const storageRef = ref(storage, storagePath);
    const metadata = {
      contentType: file.type || (fileType === "pdf" ? "application/pdf" : "application/octet-stream"),
      customMetadata: {
        originalName: file.name,
        uploadedAt: String(Date.now()),
        meetingId: meetingId || "general",
      },
    };

    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    const downloadUrl = await new Promise<string>((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          if (snapshot.totalBytes > 0 && onProgress) {
            const percent = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            onProgress(percent);
          }
        },
        (error) => {
          console.warn("Firebase Storage upload task error:", error);
          reject(error);
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          } catch (urlErr) {
            reject(urlErr);
          }
        }
      );
    });

    return {
      id: fileId,
      name: file.name,
      url: downloadUrl,
      storagePath,
      fileType,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      uploadedAt: Date.now(),
      description: "",
    };
  } catch (storageErr) {
    console.warn("Falling back to embedded data URL for attachment:", storageErr);
    const base64Url =
      fileType === "image"
        ? await processImageFile(file, 900, 675, 60000)
        : await fileToBase64(file);

    if (onProgress) onProgress(100);

    return {
      id: fileId,
      name: file.name,
      url: base64Url,
      fileType,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      uploadedAt: Date.now(),
      description: "",
    };
  }
}

/**
 * Delete an attachment from Firebase Storage
 */
export async function deleteMeetingAttachment(attachment: MeetingAttachment): Promise<void> {
  if (attachment.storagePath) {
    try {
      const fileRef = ref(storage, attachment.storagePath);
      await deleteObject(fileRef);
    } catch (err) {
      console.warn("Failed to delete attachment from Firebase Storage:", err);
    }
  }
}
