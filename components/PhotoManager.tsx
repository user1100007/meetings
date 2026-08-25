"use client";

import React, { useRef, useState } from "react";
import { MeetingPhoto } from "@/types/meeting";
import {
  uploadMeetingPhoto,
  deleteMeetingPhoto,
} from "@/services/storageService";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  LayoutGrid,
  Loader2,
  Upload,
  Eye,
  X,
  Sparkles,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  Tag,
} from "lucide-react";
import { toKhmerDigits } from "@/lib/khmerDateUtils";

interface PhotoManagerProps {
  photos: MeetingPhoto[];
  layout: "grid-1" | "grid-2" | "grid-3" | "grid-4";
  meetingId?: string;
  agendaItems?: string[];
  decisionItems?: string[];
  onPhotosChange: (photos: MeetingPhoto[]) => void;
  onLayoutChange: (layout: "grid-1" | "grid-2" | "grid-3" | "grid-4") => void;
}

interface UploadingPhotoState {
  id: string;
  name: string;
  progress: number;
  error?: string;
}

export const PhotoManager: React.FC<PhotoManagerProps> = ({
  photos,
  layout,
  meetingId = "temp_meeting",
  agendaItems = [],
  decisionItems = [],
  onPhotosChange,
  onLayoutChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState<UploadingPhotoState[]>([]);
  const [previewPhoto, setPreviewPhoto] = useState<MeetingPhoto | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [targetActivityIndex, setTargetActivityIndex] = useState<number | "general">("general");

  // Merge activity labels for selection
  const activityOptions = (decisionItems.length > 0 ? decisionItems : agendaItems).filter(
    (item) => item && item.trim() !== ""
  );

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);

    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) {
      setErrorMessage("សូមជ្រើសរើសប្រភេទឯកសារជារូបភាព (JPG, PNG, WebP)!");
      return;
    }

    for (const file of imageFiles) {
      const uploadId = `upload_photo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      setUploadingPhotos((prev) => [
        ...prev,
        {
          id: uploadId,
          name: file.name,
          progress: 10,
        },
      ]);

      try {
        const uploadedPhoto = await uploadMeetingPhoto(
          file,
          meetingId,
          (progress) => {
            setUploadingPhotos((prev) =>
              prev.map((item) =>
                item.id === uploadId ? { ...item, progress } : item
              )
            );
          }
        );

        const assignedActivity =
          targetActivityIndex === "general" ? null : targetActivityIndex;
        const assignedTitle =
          assignedActivity !== null && activityOptions[assignedActivity]
            ? activityOptions[assignedActivity]
            : undefined;

        const enrichedPhoto: MeetingPhoto = {
          ...uploadedPhoto,
          activityIndex: assignedActivity,
          activityTitle: assignedTitle,
          caption:
            uploadedPhoto.caption ||
            (assignedActivity !== null
              ? `រូបភាពសកម្មភាពទី ${toKhmerDigits(assignedActivity + 1)}`
              : `ទិដ្ឋភាពកិច្ចប្រជុំ`),
        };

        setUploadingPhotos((prev) => prev.filter((item) => item.id !== uploadId));
        onPhotosChange([...photos, enrichedPhoto]);
      } catch (err: any) {
        console.error("Photo upload error:", err);
        setUploadingPhotos((prev) =>
          prev.map((item) =>
            item.id === uploadId
              ? { ...item, error: err?.message || "បរាជ័យក្នុងការបង្ហោះ" }
              : item
          )
        );
        setErrorMessage(`មិនអាចបង្ហោះរូបភាព "${file.name}" បានទេ។`);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleRemovePhoto = async (index: number) => {
    const photoToRemove = photos[index];
    if (confirm("តើអ្នកពិតជាចង់លុបរូបភាពនេះមែនទេ?")) {
      await deleteMeetingPhoto(photoToRemove);
      const updated = photos.filter((_, i) => i !== index);
      onPhotosChange(updated);
      if (previewPhoto?.id === photoToRemove.id) {
        setPreviewPhoto(null);
      }
    }
  };

  const handleCaptionChange = (index: number, caption: string) => {
    const updated = [...photos];
    updated[index] = { ...updated[index], caption };
    onPhotosChange(updated);
  };

  const handleActivityAssignment = (index: number, actIdxVal: string) => {
    const updated = [...photos];
    const actIdx = actIdxVal === "general" ? null : parseInt(actIdxVal, 10);
    const actTitle = actIdx !== null && activityOptions[actIdx] ? activityOptions[actIdx] : undefined;

    updated[index] = {
      ...updated[index],
      activityIndex: actIdx,
      activityTitle: actTitle,
    };
    onPhotosChange(updated);
  };

  return (
    <div className="space-y-6 font-khmer">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-100 text-sky-700 rounded-xl">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <span>រូបភាពសកម្មភាពកិច្ចប្រជុំ (Meeting Photos)</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                  {toKhmerDigits(photos.length)} រូប
                </span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                បង្ហោះរូបភាព ១ ឬច្រើនក្នុងសកម្មភាពនីមួយៗ និងរូបភាពទូទៅនៃកិច្ចប្រជុំ
              </p>
            </div>
          </div>
        </div>

        {/* Layout Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
            <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
            ទម្រង់តម្រៀប៖
          </span>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs shadow-2xs">
            <button
              type="button"
              onClick={() => onLayoutChange("grid-1")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                layout === "grid-1"
                  ? "bg-white text-indigo-700 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ១/ជួរ
            </button>
            <button
              type="button"
              onClick={() => onLayoutChange("grid-2")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                layout === "grid-2"
                  ? "bg-white text-indigo-700 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ២/ជួរ
            </button>
            <button
              type="button"
              onClick={() => onLayoutChange("grid-3")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                layout === "grid-3"
                  ? "bg-white text-indigo-700 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ៣/ជួរ
            </button>
            <button
              type="button"
              onClick={() => onLayoutChange("grid-4")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                layout === "grid-4"
                  ? "bg-white text-indigo-700 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ៤/ជួរ
            </button>
          </div>
        </div>
      </div>

      {/* Target Activity Selector for New Uploads */}
      {activityOptions.length > 0 && (
        <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-sky-700" />
            <span className="font-bold text-slate-800">
              ជ្រើសរើសសកម្មភាពភ្ជាប់រូបភាព (Assign to Activity):
            </span>
          </div>
          <select
            value={targetActivityIndex}
            onChange={(e) =>
              setTargetActivityIndex(
                e.target.value === "general" ? "general" : parseInt(e.target.value, 10)
              )
            }
            className="px-3 py-1.5 bg-white border border-sky-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-sky-500 max-w-md"
          >
            <option value="general">រូបភាពទូទៅនៃកិច្ចប្រជុំ (General Meeting Photo)</option>
            {activityOptions.map((act, i) => (
              <option key={i} value={i}>
                សកម្មភាពទី {toKhmerDigits(i + 1)}៖ {act.substring(0, 45)}...
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Drag and Drop Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
          isDragging
            ? "border-sky-500 bg-sky-50/80 scale-[1.01]"
            : "border-slate-300 hover:border-sky-400 bg-slate-50/60 hover:bg-sky-50/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFilesSelected(e.target.files)}
          className="hidden"
          id="meeting-photos-file-input"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
            <Upload className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h5 className="font-bold text-sm text-slate-800">
              អូសនិងទម្លាក់រូបភាពនៅទីនេះ ឬចុចដើម្បីជ្រើសរើស
            </h5>
            <p className="text-xs text-slate-500">
              គាំទ្ររូបភាព JPG, PNG, WebP (អាចជ្រើសរើសម្តងច្រើនរូបដើម្បីបង្ហោះចូល Firebase Storage)
            </p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ជ្រើសរើសរូបភាពថ្មី (Upload Photos)</span>
          </button>
        </div>
      </div>

      {/* Uploading Status Progress List */}
      {uploadingPhotos.length > 0 && (
        <div className="space-y-2 bg-sky-50/70 p-4 rounded-2xl border border-sky-100 animate-fade-in">
          <h5 className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
            កំពុងបង្ហោះរូបភាពទៅ Firebase Storage ({toKhmerDigits(uploadingPhotos.length)} រូប)...
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {uploadingPhotos.map((up) => (
              <div
                key={up.id}
                className="bg-white p-3 rounded-xl border border-sky-100 shadow-2xs space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span className="truncate max-w-[200px]">{up.name}</span>
                  <span className="text-sky-600 font-bold">{toKhmerDigits(up.progress)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-sky-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${up.progress}%` }}
                  />
                </div>
                {up.error && (
                  <p className="text-[11px] text-rose-600 font-medium">{up.error}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-rose-700 p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Photos Grid Display */}
      {photos.length === 0 ? (
        <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-slate-200/80">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">
            មិនទាន់មានរូបភាពសកម្មភាពនៅឡើយទេ
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            រូបភាពដែលបានបញ្ចូល នឹងបង្ហាញជារូបតូច (Thumbnails) លើកាតកិច្ចប្រជុំ និងឯកសារបោះពុម្ព
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo, pIdx) => (
            <div
              key={photo.id || pIdx}
              className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-2.5 group relative flex flex-col justify-between"
            >
              {/* Photo Thumbnail Container */}
              <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.caption || "Meeting photo"}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Activity badge or General badge */}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-900/80 backdrop-blur text-white text-[10px] font-semibold rounded-md flex items-center gap-1 shadow-xs">
                  {photo.activityIndex !== null && photo.activityIndex !== undefined ? (
                    <span className="text-amber-300">
                      សកម្មភាពទី {toKhmerDigits(photo.activityIndex + 1)}
                    </span>
                  ) : (
                    <span className="text-sky-300">រូបភាពទូទៅ</span>
                  )}
                </div>

                {/* Overlay Action Buttons */}
                <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => setPreviewPhoto(photo)}
                    className="p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg backdrop-blur transition-all cursor-pointer shadow-md"
                    title="មើលរូបភាពពេញ"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(pIdx)}
                    className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-all cursor-pointer shadow-md"
                    title="លុបរូបភាពនេះ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Activity Tag Assignment */}
              {activityOptions.length > 0 && (
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                    ភ្ជាប់ជាមួយសកម្មភាព៖
                  </label>
                  <select
                    value={
                      photo.activityIndex !== null && photo.activityIndex !== undefined
                        ? String(photo.activityIndex)
                        : "general"
                    }
                    onChange={(e) => handleActivityAssignment(pIdx, e.target.value)}
                    className="w-full px-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
                  >
                    <option value="general">រូបភាពទូទៅនៃកិច្ចប្រជុំ</option>
                    {activityOptions.map((act, i) => (
                      <option key={i} value={String(i)}>
                        សកម្មភាពទី {toKhmerDigits(i + 1)}៖ {act.substring(0, 30)}...
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Caption Input */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-600">
                  ចំណងជើងរូបភាពទី {toKhmerDigits(pIdx + 1)}
                </label>
                <input
                  type="text"
                  value={photo.caption || ""}
                  onChange={(e) => handleCaptionChange(pIdx, e.target.value)}
                  placeholder={`ឧ. រូបភាពទី ${toKhmerDigits(pIdx + 1)}៖ ទិដ្ឋភាពកិច្ចប្រជុំ...`}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 text-slate-800 transition-all"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Photo Lightbox Preview Modal */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-fade-in font-khmer">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-sky-400" />
                <h4 className="font-bold text-sm truncate">
                  {previewPhoto.caption || "រូបភាពកិច្ចប្រជុំ"}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 bg-slate-950 p-4 flex items-center justify-center overflow-auto min-h-[400px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewPhoto.url}
                alt={previewPhoto.caption || "Meeting photo preview"}
                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-lg"
              />
            </div>
            {previewPhoto.caption && (
              <div className="p-3 bg-white border-t border-slate-200 text-center text-xs font-semibold text-slate-800">
                {previewPhoto.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
