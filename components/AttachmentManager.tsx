"use client";

import React, { useState, useRef } from "react";
import { MeetingAttachment } from "@/types/meeting";
import {
  uploadMeetingAttachment,
  deleteMeetingAttachment,
  formatFileSize,
} from "@/services/storageService";
import {
  FileText,
  Image as ImageIcon,
  Upload,
  Trash2,
  Eye,
  Download,
  Copy,
  Check,
  X,
  Loader2,
  AlertCircle,
  Paperclip,
  ExternalLink,
  Search,
  Tag,
  FileCheck2,
} from "lucide-react";

interface AttachmentManagerProps {
  attachments: MeetingAttachment[];
  meetingId?: string;
  onChange: (attachments: MeetingAttachment[]) => void;
}

interface UploadingFileState {
  id: string;
  name: string;
  size: number;
  progress: number;
  error?: string;
}

const COMMON_DOCUMENT_TAGS = [
  "លិខិតអញ្ជើញ",
  "បញ្ជីវត្តមាន",
  "ផែនការសកម្មភាព",
  "តារាងថវិកា",
  "សេចក្តីសម្រេច",
  "របាយការណ៍វឌ្ឍនភាព",
  "លិខិតបង្គាប់ការ",
];

export const AttachmentManager: React.FC<AttachmentManagerProps> = ({
  attachments,
  meetingId = "temp_meeting",
  onChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFileState[]>([]);
  const [filterType, setFilterType] = useState<"all" | "pdf" | "image" | "doc">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewAttachment, setPreviewAttachment] = useState<MeetingAttachment | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);

    const fileArray = Array.from(files);
    for (const file of fileArray) {
      const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      // Add to uploading list
      setUploadingFiles((prev) => [
        ...prev,
        {
          id: uploadId,
          name: file.name,
          size: file.size,
          progress: 10,
        },
      ]);

      try {
        const newAttachment = await uploadMeetingAttachment(
          file,
          meetingId,
          (progress) => {
            setUploadingFiles((prev) =>
              prev.map((item) =>
                item.id === uploadId ? { ...item, progress } : item
              )
            );
          }
        );

        // Success: remove from uploading list and add to attachments
        setUploadingFiles((prev) => prev.filter((item) => item.id !== uploadId));
        onChange([...attachments, newAttachment]);
      } catch (err: any) {
        console.error("Upload error:", err);
        setUploadingFiles((prev) =>
          prev.map((item) =>
            item.id === uploadId
              ? { ...item, error: err?.message || "បរាជ័យក្នុងការបង្ហោះ" }
              : item
          )
        );
        setErrorMessage(
          `មិនអាចបង្ហោះឯកសារ "${file.name}" បានទេ។ សូមពិនិត្យការតភ្ជាប់អ៊ីនធឺណិត។`
        );
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

  const handleDelete = async (attachment: MeetingAttachment) => {
    if (confirm(`តើអ្នកពិតជាចង់លុបឯកសារ "${attachment.name}" មែនទេ?`)) {
      await deleteMeetingAttachment(attachment);
      onChange(attachments.filter((a) => a.id !== attachment.id));
      if (previewAttachment?.id === attachment.id) {
        setPreviewAttachment(null);
      }
    }
  };

  const handleDescriptionChange = (id: string, description: string) => {
    const updated = attachments.map((a) =>
      a.id === id ? { ...a, description } : a
    );
    onChange(updated);
  };

  const handleApplyPresetTag = (id: string, tag: string) => {
    const currentAtt = attachments.find((a) => a.id === id);
    const existingDesc = currentAtt?.description || "";
    const newDesc = existingDesc ? `${existingDesc} - ${tag}` : tag;
    handleDescriptionChange(id, newDesc);
  };

  const handleCopyLink = (attachment: MeetingAttachment) => {
    navigator.clipboard.writeText(attachment.url);
    setCopiedId(attachment.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter and search
  const filteredAttachments = attachments.filter((att) => {
    const matchesFilter =
      filterType === "all" ||
      (filterType === "pdf" && att.fileType === "pdf") ||
      (filterType === "image" && att.fileType === "image") ||
      (filterType === "doc" && att.fileType === "doc");

    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesFilter;

    const matchesSearch =
      att.name.toLowerCase().includes(query) ||
      (att.description || "").toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  const pdfCount = attachments.filter((a) => a.fileType === "pdf").length;
  const imageCount = attachments.filter((a) => a.fileType === "image").length;
  const docCount = attachments.filter((a) => a.fileType === "doc" || a.fileType === "other").length;

  return (
    <div className="space-y-6 font-khmer">
      {/* Upload Header & Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
          isDragging
            ? "border-indigo-600 bg-indigo-50/80 scale-[1.01]"
            : "border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-indigo-50/20"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,application/pdf,image/*,.doc,.docx,.txt"
          onChange={(e) => handleFilesSelected(e.target.files)}
          className="hidden"
          id="meeting-attachment-file-input"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-md">
            <Upload className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-sm text-slate-800">
              អូសនិងទម្លាក់ឯកសារនៅទីនេះ ឬចុចដើម្បីជ្រើសរើស
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              គាំទ្រឯកសារផ្លូវការសាលារៀនដូចជា <strong>PDF</strong> (សេចក្តីសម្រេច, ផែនការ, បញ្ជីវត្តមាន) និង <strong>រូបភាព</strong> (PNG, JPG) រក្សាទុកក្នុង Firebase Storage
            </p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-700 to-blue-700 hover:from-indigo-800 hover:to-blue-800 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Paperclip className="w-4 h-4" />
            <span>ជ្រើសរើសឯកសារភ្ជាប់ (Upload Files)</span>
          </button>
        </div>
      </div>

      {/* Uploading Status Progress List */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2 bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 animate-fade-in">
          <h5 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
            កំពុងដំណើរការបង្ហោះទៅ Firebase Storage ({uploadingFiles.length} ឯកសារ)...
          </h5>
          <div className="space-y-2">
            {uploadingFiles.map((uf) => (
              <div
                key={uf.id}
                className="bg-white p-3 rounded-xl border border-indigo-100 shadow-2xs space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span className="truncate max-w-[280px] sm:max-w-md">{uf.name}</span>
                  <span className="text-indigo-600 font-bold">{uf.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${uf.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{formatFileSize(uf.size)}</span>
                  {uf.error && <span className="text-rose-600 font-medium">{uf.error}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Global Error Banner if any */}
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

      {/* Attachments Section Header with Search and Type Filter */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-indigo-700" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              បញ្ជីឯកសារភ្ជាប់ទាំងអស់ ({attachments.length})
            </h4>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                filterType === "all"
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              ទាំងអស់ ({attachments.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("pdf")}
              className={`px-3 py-1 rounded-lg font-semibold transition flex items-center gap-1 cursor-pointer ${
                filterType === "pdf"
                  ? "bg-rose-600 text-white shadow-2xs"
                  : "bg-rose-50 text-rose-700 hover:bg-rose-100"
              }`}
            >
              <FileText className="w-3 h-3" />
              PDF ({pdfCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("image")}
              className={`px-3 py-1 rounded-lg font-semibold transition flex items-center gap-1 cursor-pointer ${
                filterType === "image"
                  ? "bg-sky-600 text-white shadow-2xs"
                  : "bg-sky-50 text-sky-700 hover:bg-sky-100"
              }`}
            >
              <ImageIcon className="w-3 h-3" />
              រូបភាព ({imageCount})
            </button>
            {docCount > 0 && (
              <button
                type="button"
                onClick={() => setFilterType("doc")}
                className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  filterType === "doc"
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                ផ្សេងៗ ({docCount})
              </button>
            )}
          </div>
        </div>

        {/* Search Bar if multiple files */}
        {attachments.length > 2 && (
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ស្វែងរកតាមឈ្មោះឯកសារ ឬការពិពណ៌នា..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
        )}
      </div>

      {/* Empty State */}
      {attachments.length === 0 && (
        <div className="py-10 text-center bg-slate-50 rounded-2xl border border-slate-200/80 p-6">
          <Paperclip className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">
            មិនទាន់មានឯកសារភ្ជាប់នៅឡើយទេ
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            សូមចុចប៊ូតុងខាងលើដើម្បីបង្ហោះលិខិតអញ្ជើញ បញ្ជីវត្តមាន ឬឯកសារពាក់ព័ន្ធផ្សេងៗ
          </p>
        </div>
      )}

      {/* Attachments List */}
      {filteredAttachments.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {filteredAttachments.map((att) => {
            const isPdf = att.fileType === "pdf";
            const isImage = att.fileType === "image";

            return (
              <div
                key={att.id}
                className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col gap-3 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left info */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                        isPdf
                          ? "bg-rose-50 text-rose-600 border border-rose-200"
                          : isImage
                          ? "bg-sky-50 text-sky-600 border border-sky-200"
                          : "bg-indigo-50 text-indigo-600 border border-indigo-200"
                      }`}
                    >
                      {isPdf ? (
                        <FileText className="w-6 h-6" />
                      ) : isImage ? (
                        <ImageIcon className="w-6 h-6" />
                      ) : (
                        <Paperclip className="w-6 h-6" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h5
                          className="font-bold text-xs sm:text-sm text-slate-900 truncate"
                          title={att.name}
                        >
                          {att.name}
                        </h5>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                            isPdf
                              ? "bg-rose-100 text-rose-800"
                              : isImage
                              ? "bg-sky-100 text-sky-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {att.fileType}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span>ទំហំ៖ {formatFileSize(att.size)}</span>
                        <span>•</span>
                        <span>
                          {new Date(att.uploadedAt).toLocaleDateString("km-KH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => setPreviewAttachment(att)}
                      className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-indigo-200 shadow-2xs"
                      title="មើលឯកសារផ្ទាល់"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>មើល (Preview)</span>
                    </button>

                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={att.name}
                      className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                      title="ទាញយកឯកសារ"
                    >
                      <Download className="w-4 h-4" />
                    </a>

                    <button
                      type="button"
                      onClick={() => handleCopyLink(att)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                      title="ចម្លងតំណភ្ជាប់ (URL)"
                    >
                      {copiedId === att.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(att)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                      title="លុបឯកសារ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Editable Description & Preset Tags */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <input
                      type="text"
                      value={att.description || ""}
                      onChange={(e) =>
                        handleDescriptionChange(att.id, e.target.value)
                      }
                      placeholder="បញ្ចូលកំណត់សម្គាល់ឯកសារ (ឧ. លិខិតអញ្ជើញប្រជុំលេខ ០៤៥, បញ្ជីវត្តមានផ្លូវការ)..."
                      className="flex-1 px-3 py-1.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>

                  {/* Preset Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      ស្លាករហ័ស៖
                    </span>
                    {COMMON_DOCUMENT_TAGS.map((tag, tIdx) => (
                      <button
                        key={tIdx}
                        type="button"
                        onClick={() => handleApplyPresetTag(att.id, tag)}
                        className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-md transition-colors cursor-pointer border border-slate-200/60"
                      >
                        +{tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Document Full Preview Modal */}
      {previewAttachment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-fade-in font-khmer">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0 pr-4">
                <div
                  className={`p-2 rounded-lg ${
                    previewAttachment.fileType === "pdf"
                      ? "bg-rose-600"
                      : "bg-sky-600"
                  }`}
                >
                  {previewAttachment.fileType === "pdf" ? (
                    <FileText className="w-4 h-4 text-white" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm truncate">
                    {previewAttachment.name}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {formatFileSize(previewAttachment.size)} •{" "}
                    {previewAttachment.description || "គ្មានការពិពណ៌នា"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewAttachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>បើកផ្ទាំងថ្មី</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewAttachment(null)}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Preview Body */}
            <div className="flex-1 bg-slate-100 overflow-auto p-4 flex items-center justify-center min-h-[400px]">
              {previewAttachment.fileType === "pdf" ? (
                <iframe
                  src={previewAttachment.url}
                  title={previewAttachment.name}
                  className="w-full h-[70vh] rounded-xl border border-slate-300 shadow-sm bg-white"
                />
              ) : previewAttachment.fileType === "image" ? (
                <div className="max-w-full max-h-[70vh] flex items-center justify-center overflow-auto rounded-xl bg-white p-2 border border-slate-300 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewAttachment.url}
                    alt={previewAttachment.name}
                    className="max-w-full max-h-[65vh] object-contain rounded"
                  />
                </div>
              ) : (
                <div className="text-center p-8 bg-white rounded-xl border border-slate-300 shadow-sm">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="font-bold text-sm text-slate-800">
                    ឯកសារទម្រង់ {previewAttachment.fileType.toUpperCase()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    ទម្រង់ឯកសារនេះមិនអាចបង្ហាញផ្ទាល់ក្នុង Preview បានទេ។
                  </p>
                  <a
                    href={previewAttachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={previewAttachment.name}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>ទាញយកឯកសារដើម្បីបើក</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
