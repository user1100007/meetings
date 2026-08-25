"use client";

import React, { useState } from "react";
import { MeetingDoc, MeetingPhoto, MeetingAttachment } from "@/types/meeting";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  ListOrdered,
  Edit3,
  Trash2,
  FileText,
  Plus,
  Table as TableIcon,
  Image as ImageIcon,
  Sparkles,
  Paperclip,
  Maximize2,
  X,
  ExternalLink,
  Download,
  Eye,
  Bot,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { formatFileSize } from "@/services/storageService";
import { toKhmerDigits, formatKhmerTimeString } from "@/lib/khmerDateUtils";
import { updateMeeting } from "@/services/meetingService";

interface MeetingCardsListProps {
  meetings: MeetingDoc[];
  onEditMeeting: (m: MeetingDoc) => void;
  onDeleteMeeting: (id: string) => void;
  onOpenAddModal: () => void;
}

interface PreviewItem {
  url: string;
  caption?: string;
  title?: string;
  type: "photo" | "attachment";
}

export const MeetingCardsList: React.FC<MeetingCardsListProps> = ({
  meetings,
  onEditMeeting,
  onDeleteMeeting,
  onOpenAddModal,
}) => {
  const [lightboxItem, setLightboxItem] = useState<PreviewItem | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [summaryModalMeeting, setSummaryModalMeeting] = useState<MeetingDoc | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [cardError, setCardError] = useState<{ id: string; message: string } | null>(null);

  // Trigger AI-Powered Summary Generator using Gemini
  const handleGenerateAISummary = async (meeting: MeetingDoc) => {
    setGeneratingId(meeting.id);
    setCardError(null);

    try {
      const filteredAgenda = (meeting.agenda || []).filter((a) => a && a.trim() !== "");
      const filteredDecisions = (meeting.decisions || []).filter((d) => d && d.trim() !== "");

      if (filteredAgenda.length === 0 && filteredDecisions.length === 0 && !meeting.title) {
        throw new Error(
          "កំណត់ហេតុនេះមិនទាន់មានរបៀបវារៈ ឬសេចក្តីសម្រេចនៅឡើយទេ។ សូមបន្ថែមព័ត៌មានជាមុនសិន។"
        );
      }

      const res = await fetch("/api/gemini/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: meeting.title || `កិច្ចប្រជុំលើកទី${meeting.meetingNumber || 1}`,
          agenda: filteredAgenda,
          decisions: filteredDecisions,
          schoolName: meeting.schoolName || "",
          date: meeting.date || "",
          introParagraph: meeting.introParagraph || "",
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errorMsg =
          typeof data?.error === "string"
            ? data.error
            : typeof data?.error?.message === "string"
            ? data.error.message
            : "មិនអាចបង្កើតសេចក្តីសង្ខេប AI បានទេ។ សូមព្យាយាមម្តងទៀត។";
        throw new Error(errorMsg);
      }

      if (data.summary) {
        // Automatically persist into Firestore
        await updateMeeting(meeting.id, {
          aiSummary: data.summary,
        });

        // Open summary overview modal
        const updatedMeeting: MeetingDoc = {
          ...meeting,
          aiSummary: data.summary,
        };
        setSummaryModalMeeting(updatedMeeting);
      }
    } catch (err: any) {
      console.error("AI Summary generation error:", err);
      setCardError({
        id: meeting.id,
        message:
          typeof err?.message === "string"
            ? err.message
            : "មានបញ្ហាក្នុងការបង្កើតសេចក្តីសង្ខេប AI។ សូមព្យាយាមម្តងទៀត។",
      });
    } finally {
      setGeneratingId(null);
    }
  };

  const handleCopySummary = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (meetings.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
        <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">មិនទាន់មានកំណត់ហេតុប្រជុំនៅឡើយទេ</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          លោកអ្នកអាចបង្កើតកំណត់ហេតុប្រជុំថ្មីដោយចុចប៊ូតុងខាងក្រោម
        </p>
        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-sm font-bold shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>បង្កើតកំណត់ហេតុថ្មី</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meetings.map((m) => {
          const tableCount = m.tables?.length || 0;
          const photoCount = m.photos?.length || 0;
          const attachmentCount = m.attachments?.length || 0;
          const isGeneratingThis = generatingId === m.id;

          // Combine photos and image-based attachments for quick thumbnail gallery
          const imageAttachments = (m.attachments || []).filter(
            (a) => a.fileType === "image"
          );

          const allImageItems: PreviewItem[] = [
            ...(m.photos || []).map((p) => ({
              url: p.url,
              caption: toKhmerDigits(p.caption || "រូបភាពសកម្មភាពកិច្ចប្រជុំ"),
              type: "photo" as const,
            })),
            ...imageAttachments.map((a) => ({
              url: a.url,
              title: toKhmerDigits(a.name),
              caption: toKhmerDigits(a.description || a.name),
              type: "attachment" as const,
            })),
          ];

          const nonImageAttachments = (m.attachments || []).filter(
            (a) => a.fileType !== "image"
          );

          const khmerMeetingNumber = toKhmerDigits(m.meetingNumber);

          return (
            <div
              key={m.id}
              id={`meeting-card-${m.id}`}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group"
            >
              {/* Card Top Banner */}
              <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center font-extrabold text-sm text-sky-300">
                    #{khmerMeetingNumber}
                  </span>
                  <span className="text-xs font-semibold text-sky-200">
                    ប្រជុំលើកទី{khmerMeetingNumber}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditMeeting(m)}
                    className="p-1.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition cursor-pointer"
                    title="កែប្រែ"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteMeeting(m.id)}
                    className="p-1.5 text-rose-300 hover:text-rose-100 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg transition cursor-pointer"
                    title="លុប"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug mb-3">
                    {toKhmerDigits(m.title) || `កំណត់ហេតុប្រជុំលើកទី${khmerMeetingNumber}`}
                  </h3>

                  {/* Badges for Tables, Photos, Attachments, and AI Summary */}
                  {(tableCount > 0 || photoCount > 0 || attachmentCount > 0 || m.aiSummary || m.styleConfig?.color) && (
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      {m.aiSummary && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                          <Sparkles className="w-3 h-3 text-indigo-600" />
                          មានសេចក្តីសង្ខេប AI
                        </span>
                      )}
                      {attachmentCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                          <Paperclip className="w-3 h-3 text-rose-600" />
                          {toKhmerDigits(attachmentCount)} ឯកសារភ្ជាប់
                        </span>
                      )}
                      {tableCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          <TableIcon className="w-3 h-3 text-amber-600" />
                          {toKhmerDigits(tableCount)} តារាង
                        </span>
                      )}
                      {photoCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                          <ImageIcon className="w-3 h-3 text-sky-600" />
                          {toKhmerDigits(photoCount)} រូបភាព
                        </span>
                      )}
                      {m.styleConfig?.color && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-200">
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ backgroundColor: m.styleConfig.color }}
                          />
                          {toKhmerDigits(m.styleConfig.fontSize || 15)}px
                        </span>
                      )}
                    </div>
                  )}

                  {/* Meeting Meta */}
                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                      <span className="truncate">{toKhmerDigits(m.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                      <span className="truncate">{formatKhmerTimeString(m.time)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                      <span className="truncate">{toKhmerDigits(m.participants)}</span>
                    </div>
                  </div>

                  {/* Error Notification on Card */}
                  {cardError && cardError.id === m.id && (
                    <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold">{cardError.message}</p>
                        <button
                          onClick={() => handleGenerateAISummary(m)}
                          className="mt-1 text-[11px] text-rose-700 font-bold underline hover:text-rose-900 cursor-pointer"
                        >
                          ព្យាយាមម្តងទៀត
                        </button>
                      </div>
                    </div>
                  )}

                  {/* AI Summary Section on Meeting Card */}
                  {m.aiSummary && (
                    <div className="mt-3.5 p-3.5 bg-gradient-to-br from-indigo-50/80 via-sky-50/40 to-slate-50 rounded-xl border border-indigo-100/90 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>សេចក្តីសង្ខេប AI (Overview)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            id={`copy-summary-${m.id}`}
                            onClick={() => handleCopySummary(m.aiSummary || "", m.id)}
                            className="p-1 text-slate-500 hover:text-indigo-700 bg-white/90 hover:bg-white rounded-md border border-slate-200/70 shadow-2xs transition cursor-pointer"
                            title="ចម្លងសេចក្តីសង្ខេប"
                          >
                            {copiedId === m.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                          <button
                            id={`expand-summary-${m.id}`}
                            onClick={() => setSummaryModalMeeting(m)}
                            className="p-1 text-slate-500 hover:text-indigo-700 bg-white/90 hover:bg-white rounded-md border border-slate-200/70 shadow-2xs transition cursor-pointer"
                            title="មើលពេញលេញ & ផ្ទៀងផ្ទាត់"
                          >
                            <Maximize2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed line-clamp-3 italic">
                        {toKhmerDigits(m.aiSummary)}
                      </p>

                      <div className="pt-1 flex items-center justify-between text-[11px] text-indigo-700/80">
                        <button
                          onClick={() => setSummaryModalMeeting(m)}
                          className="hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <span>មើលសេចក្តីសង្ខេបពេញលេញ</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Photo & Image Attachments Thumbnails Grid */}
                  {allImageItems.length > 0 && (
                    <div className="mt-3.5 space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-slate-700">
                        <span className="font-bold flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
                          រូបភាពភ្ជាប់ ({toKhmerDigits(allImageItems.length)} រូប)
                        </span>
                        <span className="text-[11px] text-slate-400">ចុចលើរូបដើម្បីពង្រីក</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {allImageItems.slice(0, 3).map((imgItem, imgIdx) => {
                          const isLastThumb = imgIdx === 2 && allImageItems.length > 3;
                          const remainingCount = allImageItems.length - 3;

                          return (
                            <div
                              key={imgIdx}
                              onClick={() => setLightboxItem(imgItem)}
                              className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 cursor-pointer group/thumb hover:border-sky-400 shadow-2xs transition-all"
                              title={imgItem.caption}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={imgItem.url}
                                alt={imgItem.caption}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-110"
                                loading="lazy"
                              />

                              {/* Hover Eye Icon */}
                              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <Eye className="w-4 h-4 drop-shadow" />
                              </div>

                              {/* Overlay tag if more than 3 */}
                              {isLastThumb && (
                                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center text-white font-bold text-xs">
                                  +{toKhmerDigits(remainingCount)} រូប
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Non-Image Attachments Strip (PDFs, Docs) */}
                  {nonImageAttachments.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Paperclip className="w-3.5 h-3.5 text-rose-600" />
                        ឯកសារ PDF & សេចក្តីសម្រេច ({toKhmerDigits(nonImageAttachments.length)})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {nonImageAttachments.slice(0, 2).map((att) => (
                          <a
                            key={att.id}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-[11px] font-medium transition truncate max-w-[200px]"
                            title={att.name}
                          >
                            <FileText className="w-3 h-3 text-rose-600 shrink-0" />
                            <span className="truncate">{toKhmerDigits(att.name)}</span>
                          </a>
                        ))}
                        {nonImageAttachments.length > 2 && (
                          <span className="text-[10px] text-slate-500 self-center px-1">
                            +{toKhmerDigits(nonImageAttachments.length - 2)} ទៀត
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Intro Narrative Preview (if present) */}
                  {m.introParagraph && (
                    <div className="mt-3 p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100/70 text-xs text-slate-700 leading-relaxed line-clamp-2 italic">
                      <span className="font-semibold text-indigo-900 not-italic mr-1">ផ្តើម៖</span>
                      {toKhmerDigits(m.introParagraph)}
                    </div>
                  )}

                  {/* Agenda Preview */}
                  <div className="mt-3">
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1 mb-1">
                      <ListOrdered className="w-3.5 h-3.5 text-blue-800" />
                      <span>របៀបវារៈ ({toKhmerDigits(m.agenda?.length || 0)})</span>
                    </p>
                    <ul className="text-xs text-slate-600 space-y-0.5 line-clamp-2 pl-4 list-disc">
                      {m.agenda?.slice(0, 2).map((a, i) => (
                        <li key={i}>{toKhmerDigits(a)}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Decision Preview */}
                  <div className="mt-3">
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>សេចក្តីសម្រេច ({toKhmerDigits(m.decisions?.length || 0)})</span>
                    </p>
                    <ul className="text-xs text-slate-600 space-y-0.5 line-clamp-2 pl-4 list-disc">
                      {m.decisions?.slice(0, 2).map((d, i) => (
                        <li key={i}>{toKhmerDigits(d)}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Action Bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* AI Summary Generator Trigger Button */}
                  <button
                    id={`btn-ai-summary-${m.id}`}
                    onClick={() => handleGenerateAISummary(m)}
                    disabled={isGeneratingThis}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-50 via-blue-50 to-sky-50 hover:from-indigo-100 hover:to-sky-100 text-indigo-900 border border-indigo-200/80 shadow-2xs hover:shadow transition-all cursor-pointer disabled:opacity-60"
                    title="បង្កើតសេចក្តីសង្ខេបកិច្ចប្រជុំដោយស្វ័យប្រវត្តិតាមរយៈ Gemini AI"
                  >
                    {isGeneratingThis ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                        <span>កំពុងសង្ខេប AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{m.aiSummary ? "សង្ខេប AI ឡើងវិញ" : "សង្ខេប AI"}</span>
                      </>
                    )}
                  </button>

                  <button
                    id={`btn-edit-meeting-${m.id}`}
                    onClick={() => onEditMeeting(m)}
                    className="text-xs font-bold text-blue-900 hover:text-blue-700 flex items-center gap-1 hover:underline cursor-pointer py-1.5"
                  >
                    <span>ពិនិត្យ & កែប្រែ</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Summary Overview Modal */}
      {summaryModalMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            id="ai-summary-modal"
            className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-sky-300 shadow-inner">
                  <Sparkles className="w-5 h-5 text-sky-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 font-bold text-sky-200">
                      Gemini AI Overview
                    </span>
                    <span className="text-xs text-sky-200">
                      ប្រជុំលើកទី{toKhmerDigits(summaryModalMeeting.meetingNumber)}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5 line-clamp-1">
                    {toKhmerDigits(summaryModalMeeting.title)}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSummaryModalMeeting(null)}
                className="p-2 hover:bg-white/10 rounded-xl text-white/80 hover:text-white transition cursor-pointer"
                title="បិទ"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Analyzed Scope Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-medium block">កាលបរិច្ឆេទ</span>
                  <span className="text-xs font-bold text-slate-800 truncate block mt-0.5">
                    {toKhmerDigits(summaryModalMeeting.date || "មិនបានបញ្ជាក់")}
                  </span>
                </div>
                <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100">
                  <span className="text-[11px] text-blue-700 font-medium block">របៀបវារៈវិភាគ</span>
                  <span className="text-xs font-bold text-blue-900 block mt-0.5">
                    {toKhmerDigits(summaryModalMeeting.agenda?.length || 0)} ចំណុច
                  </span>
                </div>
                <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-emerald-700 font-medium block">សេចក្តីសម្រេចវិភាគ</span>
                  <span className="text-xs font-bold text-emerald-900 block mt-0.5">
                    {toKhmerDigits(summaryModalMeeting.decisions?.length || 0)} ចំណុច
                  </span>
                </div>
              </div>

              {/* Summary Text Stage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-indigo-600" />
                    <span>ខ្លឹមសារសង្ខេបផ្លូវការ (Executive Summary)</span>
                  </label>
                  <span className="text-[11px] text-slate-400">បានបង្កើត និងរក្សាទុកក្នុង Firestore</span>
                </div>

                <div className="p-5 bg-gradient-to-br from-indigo-50/60 via-blue-50/30 to-slate-50 rounded-2xl border border-indigo-100 shadow-inner">
                  <p className="text-sm text-slate-800 leading-loose whitespace-pre-line text-justify font-normal font-battambang">
                    {toKhmerDigits(summaryModalMeeting.aiSummary || "")}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  id="btn-copy-modal-summary"
                  onClick={() =>
                    handleCopySummary(
                      summaryModalMeeting.aiSummary || "",
                      `modal_${summaryModalMeeting.id}`
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  {copiedId === `modal_${summaryModalMeeting.id}` ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">បានចម្លងរួចរាល់</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-600" />
                      <span>ចម្លងសេចក្តីសង្ខេប</span>
                    </>
                  )}
                </button>

                <button
                  id="btn-regenerate-modal-summary"
                  onClick={() => handleGenerateAISummary(summaryModalMeeting)}
                  disabled={generatingId === summaryModalMeeting.id}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
                >
                  {generatingId === summaryModalMeeting.id ? (
                    <>
                      <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                      <span>កំពុងបង្កើត...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 text-indigo-600" />
                      <span>បង្កើតឡើងវិញ</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-edit-from-modal-summary"
                  onClick={() => {
                    const m = summaryModalMeeting;
                    setSummaryModalMeeting(null);
                    onEditMeeting(m);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>បើកកែសម្រួលកំណត់ហេតុ</span>
                </button>
                <button
                  onClick={() => setSummaryModalMeeting(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  បិទ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media Lightbox Modal */}
      {lightboxItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 truncate">
                <ImageIcon className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="text-xs font-bold truncate">
                  {lightboxItem.title || lightboxItem.caption || "រូបភាពភ្ជាប់"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={lightboxItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition"
                  title="បើកផ្ទាំងថ្មី"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setLightboxItem(null)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Image Stage */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/60 min-h-[300px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxItem.url}
                alt={lightboxItem.caption || "Preview"}
                className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>

            {/* Footer Caption */}
            {lightboxItem.caption && (
              <div className="p-3 bg-slate-900 border-t border-slate-800 text-center text-xs text-slate-300 italic">
                {lightboxItem.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

