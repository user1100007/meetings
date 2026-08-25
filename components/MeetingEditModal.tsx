"use client";

import React, { useState } from "react";
import { MeetingDoc, TextStyleConfig, MeetingTable, MeetingPhoto, MeetingAttachment, MeetingAttendee } from "@/types/meeting";
import {
  X,
  Plus,
  Trash2,
  Save,
  FileText,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Table as TableIcon,
  Image as ImageIcon,
  Type,
  ListOrdered,
  CheckCircle2,
  School,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Bot,
  RefreshCw,
  AlertCircle,
  Paperclip,
  Tag,
} from "lucide-react";
import { TableEditor } from "./TableEditor";
import { PhotoManager } from "./PhotoManager";
import { AttendeeManager } from "./AttendeeManager";
import { AttachmentManager } from "./AttachmentManager";
import { StyleToolbar } from "./StyleToolbar";
import { KhmerCalendarModal } from "./KhmerCalendarModal";
import { optimizePhotosPayload } from "@/lib/imageUtils";
import { generateKhmerIntroParagraph, toKhmerDigits, formatKhmerTimeString } from "@/lib/khmerDateUtils";

interface MeetingEditModalProps {
  isOpen: boolean;
  meeting: Partial<MeetingDoc> | null;
  onClose: () => void;
  onSave: (meetingData: Omit<MeetingDoc, "id" | "createdAt" | "updatedAt">) => Promise<void>;
}

type TabType = "info" | "agenda" | "photos" | "attendees" | "tables" | "attachments" | "styling";

export const MeetingEditModal: React.FC<MeetingEditModalProps> = ({
  isOpen,
  meeting,
  onClose,
  onSave,
}) => {
  const [prevMeeting, setPrevMeeting] = useState<Partial<MeetingDoc> | null>(null);
  const [formData, setFormData] = useState<Partial<MeetingDoc>>({});
  const [activeTab, setActiveTab] = useState<TabType>("info");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isKhmerCalendarOpen, setIsKhmerCalendarOpen] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Sync state during rendering when meeting prop changes
  if (meeting !== prevMeeting) {
    setPrevMeeting(meeting);
    setFormData({
      schoolName: meeting?.schoolName || "សាលាបឋមសិក្សា រោគ",
      district: meeting?.district || "រដ្ឋបាលស្រុកភ្នំស្រុក",
      academicYear: meeting?.academicYear || "២០២៥-២០២៦",
      meetingPlace: meeting?.meetingPlace || "សាលាបឋមសិក្សា រោគ",
      meetingChair: meeting?.meetingChair || "លោកស្រី សុខ សារើន",
      minuteTaker: meeting?.minuteTaker || "លោក អ៊ុន ប៊ុនទុង",
      meetingNumber: meeting?.meetingNumber || 1,
      title: meeting?.title || "",
      date: meeting?.date || "",
      time: meeting?.time || "",
      participants: meeting?.participants || "-(បញ្ជីវត្តមានជូនភ្ជាប់)",
      introParagraph: meeting?.introParagraph || "",
      agenda: meeting?.agenda && meeting.agenda.length > 0 ? meeting.agenda : [""],
      decisions: meeting?.decisions && meeting.decisions.length > 0 ? meeting.decisions : [""],
      aiSummary: meeting?.aiSummary || "",
      tables: meeting?.tables || [],
      photos: meeting?.photos || [],
      attendees: meeting?.attendees || [],
      photoLayout: meeting?.photoLayout || "grid-2",
      attachments: meeting?.attachments || [],
      customNotes: meeting?.customNotes || "",
      styleConfig: meeting?.styleConfig || {
        fontSize: 15,
        textAlign: "justify",
        color: "#0f172a",
        fontWeight: "normal",
        fontStyle: "normal",
        textDecoration: "none",
      },
    });
  }

  if (!isOpen) return null;

  const handleAgendaChange = (index: number, val: string) => {
    const updated = [...(formData.agenda || [])];
    updated[index] = val;
    setFormData({ ...formData, agenda: updated });
  };

  const addAgendaItem = () => {
    setFormData({ ...formData, agenda: [...(formData.agenda || []), ""] });
  };

  const removeAgendaItem = (index: number) => {
    const updated = (formData.agenda || []).filter((_, i) => i !== index);
    setFormData({ ...formData, agenda: updated.length > 0 ? updated : [""] });
  };

  const handleDecisionChange = (index: number, val: string) => {
    const updated = [...(formData.decisions || [])];
    updated[index] = val;
    setFormData({ ...formData, decisions: updated });
  };

  const addDecisionItem = () => {
    setFormData({ ...formData, decisions: [...(formData.decisions || []), ""] });
  };

  const removeDecisionItem = (index: number) => {
    const updated = (formData.decisions || []).filter((_, i) => i !== index);
    setFormData({ ...formData, decisions: updated.length > 0 ? updated : [""] });
  };

  const handleGenerateAISummary = async () => {
    setIsGeneratingSummary(true);
    setSummaryError(null);
    try {
      const filteredAgenda = (formData.agenda || []).filter((a) => a && a.trim() !== "");
      const filteredDecisions = (formData.decisions || []).filter((d) => d && d.trim() !== "");

      if (filteredAgenda.length === 0 && filteredDecisions.length === 0 && !formData.title) {
        throw new Error(
          "សូមបញ្ចូលរបៀបវារៈ ឬសេចក្តីសម្រេច មុននឹងចុចបង្កើតសេចក្តីសង្ខេប AI!"
        );
      }

      const res = await fetch("/api/gemini/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title || `កិច្ចប្រជុំលើកទី${formData.meetingNumber || 1}`,
          agenda: filteredAgenda,
          decisions: filteredDecisions,
          schoolName: formData.schoolName || "",
          date: formData.date || "",
          introParagraph: formData.introParagraph || "",
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
        setFormData((prev) => ({
          ...prev,
          aiSummary: data.summary,
        }));
      }
    } catch (err: any) {
      console.error("AI Summary generation error:", err);
      setSummaryError(
        typeof err?.message === "string"
          ? err.message
          : "មានបញ្ហាក្នុងការបង្កើតសេចក្តីសង្ខេប AI។ សូមព្យាយាមម្តងទៀត។"
      );
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleCopySummary = () => {
    if (formData.aiSummary) {
      navigator.clipboard.writeText(formData.aiSummary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    try {
      const optimizedPhotos = await optimizePhotosPayload(formData.photos || [], 450000);

      await onSave({
        schoolName: formData.schoolName || "សាលាបឋមសិក្សា រោគ",
        district: formData.district || "រដ្ឋបាលស្រុកភ្នំស្រុក",
        academicYear: formData.academicYear || "២០២៥-២០២៦",
        meetingPlace: formData.meetingPlace || "សាលាបឋមសិក្សា រោគ",
        meetingChair: formData.meetingChair || "លោកស្រី សុខ សារើន",
        minuteTaker: formData.minuteTaker || "លោក អ៊ុន ប៊ុនទុង",
        meetingNumber: Number(formData.meetingNumber) || 1,
        title: formData.title ? toKhmerDigits(formData.title) : `កំណត់ហេតុប្រជុំលើកទី${toKhmerDigits(formData.meetingNumber || 1)}`,
        date: formData.date ? toKhmerDigits(formData.date) : "ថ្ងៃទី......... ខែ......... ឆ្នាំ.........",
        time: formData.time ? formatKhmerTimeString(formData.time) : "ចាប់ពីម៉ោង......... ដល់ម៉ោង.........",
        participants: formData.participants ? toKhmerDigits(formData.participants) : "-(បញ្ជីវត្តមានជូនភ្ជាប់)",
        introParagraph: formData.introParagraph ? toKhmerDigits(formData.introParagraph) : "",
        agenda: (formData.agenda || []).filter((a) => a.trim() !== "").map((a) => toKhmerDigits(a)),
        decisions: (formData.decisions || []).filter((d) => d.trim() !== "").map((d) => toKhmerDigits(d)),
        aiSummary: formData.aiSummary || "",
        tables: formData.tables || [],
        photos: optimizedPhotos,
        attendees: formData.attendees || [],
        photoLayout: formData.photoLayout || "grid-2",
        attachments: formData.attachments || [],
        customNotes: formData.customNotes || "",
        styleConfig: formData.styleConfig || {
          fontSize: 15,
          textAlign: "justify",
          color: "#0f172a",
        },
        userId: formData.userId || "user_doc",
      });
      onClose();
    } catch (err: any) {
      console.error("Save meeting failed:", err);
      setErrorMessage(
        err?.message || "មានបញ្ហាក្នុងការរក្សាទុកទិន្នន័យ សូមព្យាយាមម្តងទៀត!"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in font-khmer">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-100 my-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-sky-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <FileText className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {meeting?.id ? "កែប្រែកំណត់ហេតុប្រជុំ" : "បន្ថែមកំណត់ហេតុប្រជុំថ្មី"}
              </h3>
              <p className="text-xs text-sky-200">
                បញ្ចូលរូបភាពសកម្មភាព, បញ្ជីវត្តមាន (Signatures), តារាង និងរបៀបវារៈ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/90 px-4 pt-2 gap-1 overflow-x-auto shrink-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("info")}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-t border-x cursor-pointer shrink-0 ${
              activeTab === "info"
                ? "bg-white text-indigo-900 border-slate-200 -mb-px shadow-2xs font-bold"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <School className="w-4 h-4 text-indigo-600" />
            ព័ត៌មានទូទៅ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("agenda")}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-t border-x cursor-pointer shrink-0 ${
              activeTab === "agenda"
                ? "bg-white text-indigo-900 border-slate-200 -mb-px shadow-2xs font-bold"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <ListOrdered className="w-4 h-4 text-emerald-600" />
            របៀបវារៈ & សកម្មភាព
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("photos")}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-t border-x cursor-pointer shrink-0 ${
              activeTab === "photos"
                ? "bg-white text-indigo-900 border-slate-200 -mb-px shadow-2xs font-bold"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <ImageIcon className="w-4 h-4 text-sky-600" />
            រូបភាពសកម្មភាព ({(formData.photos || []).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("attendees")}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-t border-x cursor-pointer shrink-0 ${
              activeTab === "attendees"
                ? "bg-white text-indigo-900 border-slate-200 -mb-px shadow-2xs font-bold"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            បញ្ជីវត្តមាន ({(formData.attendees || []).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tables")}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-t border-x cursor-pointer shrink-0 ${
              activeTab === "tables"
                ? "bg-white text-indigo-900 border-slate-200 -mb-px shadow-2xs font-bold"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <TableIcon className="w-4 h-4 text-amber-600" />
            តារាង ({(formData.tables || []).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("attachments")}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-t border-x cursor-pointer shrink-0 ${
              activeTab === "attachments"
                ? "bg-white text-indigo-900 border-slate-200 -mb-px shadow-2xs font-bold"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Paperclip className="w-4 h-4 text-rose-600" />
            ឯកសារភ្ជាប់ ({(formData.attachments || []).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("styling")}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-t border-x cursor-pointer shrink-0 ${
              activeTab === "styling"
                ? "bg-white text-indigo-900 border-slate-200 -mb-px shadow-2xs font-bold"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Type className="w-4 h-4 text-purple-600" />
            ទម្រង់អក្សរ
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* TAB 1: General Info */}
            {activeTab === "info" && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ឈ្មោះសាលា
                    </label>
                    <input
                      type="text"
                      value={formData.schoolName || ""}
                      onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                      placeholder="ឧ. សាលាបឋមសិក្សា រោគ"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      រដ្ឋបាលស្រុក / ក្រុង
                    </label>
                    <input
                      type="text"
                      value={formData.district || ""}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      placeholder="ឧ. រដ្ឋបាលស្រុកភ្នំស្រុក"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ឆ្នាំសិក្សា
                    </label>
                    <input
                      type="text"
                      value={formData.academicYear || ""}
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                      placeholder="ឧ. ២០២៥-២០២៦"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      កិច្ចប្រជុំលើកទី
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formData.meetingNumber || 1}
                      onChange={(e) => setFormData({ ...formData, meetingNumber: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      កម្មវត្ថុ ឬប្រធានបទកិច្ចប្រជុំ (Title)
                    </label>
                    <input
                      type="text"
                      value={formData.title || ""}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="ឧ. ការពិនិត្យ វាយតម្លៃគម្រោងចាក់ផ្លូវបេតុង..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        កាលបរិច្ឆេទ (ថ្ងៃ ខែ ឆ្នាំ)
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsKhmerCalendarOpen(true)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-md transition cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>ប្រតិទិនចន្ទគតិខ្មែរ</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={formData.date || ""}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      placeholder="ឧ. ឆ្នាំពីរពាន់ម្ភៃប្រាំ ខែកក្កដា ថ្ងៃទីបី..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ពេលវេលាប្រជុំ (ម៉ោង)
                    </label>
                    <input
                      type="text"
                      value={formData.time || ""}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      placeholder="ឧ. វេលាម៉ោងប្រាំបី និងសូន្យនាទី(៨:០០) ព្រឹក"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ទីកន្លែងប្រជុំ
                    </label>
                    <input
                      type="text"
                      value={formData.meetingPlace || ""}
                      onChange={(e) => setFormData({ ...formData, meetingPlace: e.target.value })}
                      placeholder="ឧ. សាលប្រជុំសាលាបឋមសិក្សា រោគ"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ប្រធានអង្គប្រជុំ
                    </label>
                    <input
                      type="text"
                      value={formData.meetingChair || ""}
                      onChange={(e) => setFormData({ ...formData, meetingChair: e.target.value })}
                      placeholder="ឧ. លោកស្រី សុខ សារើន"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      អ្នកធ្វើកំណត់ហេតុ / លេខា
                    </label>
                    <input
                      type="text"
                      value={formData.minuteTaker || ""}
                      onChange={(e) => setFormData({ ...formData, minuteTaker: e.target.value })}
                      placeholder="ឧ. លោក អ៊ុន ប៊ុនទុង"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    សមាសភាពអញ្ជើញចូលរួមប្រជុំ
                  </label>
                  <input
                    type="text"
                    value={formData.participants || ""}
                    onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                    placeholder="-(បញ្ជីវត្តមានជូនភ្ជាប់)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      កថាខណ្ឌផ្តើមនៃកិច្ចប្រជុំ (Intro Paragraph)
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          introParagraph: generateKhmerIntroParagraph({
                            dateStr: prev.date,
                            timeStr: prev.time,
                            schoolName: prev.schoolName,
                            meetingChair: prev.meetingChair,
                            title: prev.title,
                          }),
                        }))
                      }
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-md transition cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>បង្កើតកថាខណ្ឌផ្តើមស្វ័យប្រវត្តិ</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={formData.introParagraph || ""}
                    onChange={(e) => setFormData({ ...formData, introParagraph: e.target.value })}
                    placeholder="កថាខណ្ឌផ្តើមបង្ហាញកាលបរិច្ឆេទ ទីកន្លែង ប្រធានបទ និងសមាសភាពដឹកនាំ..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: Agenda & Decisions */}
            {activeTab === "agenda" && (
              <div className="space-y-6 animate-fade-in">
                {/* Agenda Items */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ListOrdered className="w-4 h-4 text-emerald-600" />
                      របៀបវារៈនៃកិច្ចប្រជុំ (Agenda Items)
                    </label>
                    <button
                      type="button"
                      onClick={addAgendaItem}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      បន្ថែមរបៀបវារៈ
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(formData.agenda || []).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                          {toKhmerDigits(idx + 1)}
                        </span>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleAgendaChange(idx, e.target.value)}
                          placeholder={`របៀបវារៈទី ${toKhmerDigits(idx + 1)}`}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                        {(formData.agenda || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeAgendaItem(idx)}
                            className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="លុប"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Decisions & Activities with Associated Photos Indicator */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        ដំណើរការ និងសេចក្តីសម្រេចនៃអង្គប្រជុំ (Activities & Decisions)
                      </label>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        អាចភ្ជាប់រូបភាព ១ ឬច្រើនទៅកាន់សកម្មភាពនីមួយៗបានយ៉ាងងាយស្រួល
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addDecisionItem}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      បន្ថែមសកម្មភាព
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(formData.decisions || []).map((item, idx) => {
                      const linkedPhotos = (formData.photos || []).filter(
                        (p) => p.activityIndex === idx
                      );

                      return (
                        <div
                          key={idx}
                          className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0">
                              {toKhmerDigits(idx + 1)}
                            </span>
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => handleDecisionChange(idx, e.target.value)}
                              placeholder={`សកម្មភាព/សេចក្តីសម្រេចទី ${toKhmerDigits(idx + 1)}`}
                              className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                            />
                            {(formData.decisions || []).length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeDecisionItem(idx)}
                                className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                                title="លុប"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {/* Photos attached badge & quick link */}
                          <div className="flex items-center justify-between text-[11px] pl-8">
                            <div className="flex items-center gap-2 text-slate-600">
                              <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
                              <span>
                                រូបភាពភ្ជាប់សកម្មភាពនេះ៖{" "}
                                <strong className="text-slate-900">
                                  {toKhmerDigits(linkedPhotos.length)} រូប
                                </strong>
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => setActiveTab("photos")}
                              className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                            >
                              <span>គ្រប់គ្រងរូបភាពសកម្មភាព</span>
                              <span>→</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* AI Executive Summary Generation Section */}
                <div className="p-4 bg-gradient-to-br from-indigo-50/80 via-sky-50/40 to-slate-50 rounded-2xl border border-indigo-100/90 shadow-2xs space-y-3 pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">
                            សេចក្តីសង្ខេប AI (Gemini AI Summary)
                          </h4>
                          <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-100 text-indigo-800 rounded-md border border-indigo-200">
                            Gemini 3.7
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          វិភាគ និងសង្ខេបរបៀបវារៈ & សេចក្តីសម្រេចជាភាសាខ្មែរផ្លូវការ
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateAISummary}
                      disabled={isGeneratingSummary}
                      className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm hover:shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      title="បង្កើតសេចក្តីសង្ខេបដោយស្វ័យប្រវត្តិតាមរយៈ Gemini AI"
                    >
                      {isGeneratingSummary ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Gemini កំពុងសង្ខេប...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>បង្កើតសេចក្តីសង្ខេប AI</span>
                        </>
                      )}
                    </button>
                  </div>

                  {summaryError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 animate-fade-in">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">មិនអាចដំណើរការសង្ខេបបានទេ៖</p>
                        <p>{summaryError}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <textarea
                      rows={4}
                      value={formData.aiSummary || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, aiSummary: e.target.value })
                      }
                      placeholder="ចុចប៊ូតុង 'បង្កើតសេចក្តីសង្ខេប AI' ខាងលើ ឬបញ្ចូលខ្លឹមសារសង្ខេបដោយផ្ទាល់នៅទីនេះ..."
                      className="w-full px-3.5 py-2.5 bg-white border border-indigo-200/80 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs leading-relaxed text-slate-800 placeholder:text-slate-400 shadow-2xs"
                    />
                  </div>

                  {formData.aiSummary && formData.aiSummary.trim() !== "" && (
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-emerald-700 font-medium flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        បានបំពេញសេចក្តីសង្ខេបដោយជោគជ័យ
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopySummary}
                          className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                          title="ចម្លងអត្ថបទសង្ខេប"
                        >
                          {copiedSummary ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">បានចម្លង!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-500" />
                              <span>ចម្លង</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, aiSummary: "" })}
                          className="px-2 py-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="លុបសេចក្តីសង្ខេបចេញ"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: Photos Manager */}
            {activeTab === "photos" && (
              <div className="animate-fade-in">
                <PhotoManager
                  photos={formData.photos || []}
                  layout={formData.photoLayout || "grid-2"}
                  meetingId={meeting?.id || `meeting_${formData.meetingNumber || "temp"}`}
                  agendaItems={formData.agenda || []}
                  decisionItems={formData.decisions || []}
                  onPhotosChange={(photos) => setFormData({ ...formData, photos })}
                  onLayoutChange={(photoLayout) => setFormData({ ...formData, photoLayout })}
                />
              </div>
            )}

            {/* TAB 4: Attendance List Manager (បញ្ជីវត្តមានអ្នកចូលរួមប្រជុំ) */}
            {activeTab === "attendees" && (
              <div className="animate-fade-in">
                <AttendeeManager
                  attendees={formData.attendees || []}
                  schoolName={formData.schoolName || "សាលាបឋមសិក្សា រោគ"}
                  onChange={(attendees) => setFormData({ ...formData, attendees })}
                />
              </div>
            )}

            {/* TAB 5: Tables Editor */}
            {activeTab === "tables" && (
              <div className="animate-fade-in">
                <TableEditor
                  tables={formData.tables || []}
                  onChange={(tables) => setFormData({ ...formData, tables })}
                />
              </div>
            )}

            {/* TAB 6: School Document Attachments (Firebase Storage) */}
            {activeTab === "attachments" && (
              <div className="animate-fade-in">
                <AttachmentManager
                  attachments={formData.attachments || []}
                  meetingId={meeting?.id || `meeting_${formData.meetingNumber || "temp"}`}
                  onChange={(attachments) => setFormData({ ...formData, attachments })}
                />
              </div>
            )}

            {/* TAB 7: Typography & Styling */}
            {activeTab === "styling" && (
              <div className="space-y-6 animate-fade-in">
                <StyleToolbar
                  styleConfig={
                    formData.styleConfig || {
                      fontSize: 15,
                      textAlign: "justify",
                      color: "#0f172a",
                    }
                  }
                  onChange={(styleConfig) => setFormData({ ...formData, styleConfig })}
                />

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    កំណត់សម្គាល់បន្ថែម ឬសេចក្តីសន្និដ្ឋាន (Custom Notes / Remarks)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.customNotes || ""}
                    onChange={(e) => setFormData({ ...formData, customNotes: e.target.value })}
                    placeholder="បញ្ចូលកំណត់សម្គាល់បន្ថែម ឬការផ្តាំផ្ញើក្នុងកិច្ចប្រជុំ..."
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
            {errorMessage ? (
              <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <span>⚠️</span>
                <span>{errorMessage}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                បោះបង់
              </button>
            )}
            <div className="flex items-center justify-end gap-3">
              {errorMessage && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  បោះបង់
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {saving ? "កំពុងរក្សាទុក..." : "រក្សាទុកកំណត់ហេតុ"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <KhmerCalendarModal
        isOpen={isKhmerCalendarOpen}
        onClose={() => setIsKhmerCalendarOpen(false)}
        onSelectDateForMeeting={(dateText) => {
          setFormData((prev) => {
            const updated = { ...prev, date: dateText };
            if (!prev.introParagraph || prev.introParagraph.trim() === "") {
              updated.introParagraph = generateKhmerIntroParagraph({
                dateStr: dateText,
                timeStr: prev.time,
                schoolName: prev.schoolName,
                meetingChair: prev.meetingChair,
                title: prev.title,
              });
            }
            return updated;
          });
        }}
      />
    </div>
  );
};
