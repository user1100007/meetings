"use client";

import React, { useState } from "react";
import { MeetingDoc, SchoolInfo, TextStyleConfig, MeetingAttendee } from "@/types/meeting";
import {
  Edit3,
  Trash2,
  Table as TableIcon,
  Image as ImageIcon,
  CheckCircle2,
  ListOrdered,
  FileText,
  Printer,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Paperclip,
  Users,
} from "lucide-react";
import { StyleToolbar } from "./StyleToolbar";
import { toKhmerDigits, toKhmerListIndex, formatKhmerTimeString } from "@/lib/khmerDateUtils";

interface PrintableDocumentProps {
  meetings: MeetingDoc[];
  schoolInfo: SchoolInfo;
  onEditMeeting: (m: MeetingDoc) => void;
  onDeleteMeeting: (id: string) => void;
  onUpdateMeetingStyle?: (meetingId: string, styleConfig: TextStyleConfig) => void;
  onPrint?: () => void;
  readOnly?: boolean;
}

const DEFAULT_ATTENDEES_FALLBACK: MeetingAttendee[] = [
  {
    id: "att_d1",
    name: "សុខ សារើន",
    gender: "ស្រី",
    role: "នាយិកាសាលា / ប្រធានអង្គប្រជុំ",
    organization: "សាលាបឋមសិក្សា រោគ",
    phone: "០១២ ៣៤៥ ៦៧៨",
    signature: "សុខ សារើន (Digital)",
    remarks: "ចូលរួមដឹកនាំអង្គប្រជុំ",
  },
  {
    id: "att_d2",
    name: "អ៊ុន ប៊ុនទុង",
    gender: "ប្រុស",
    role: "គ្រូបង្រៀន / លេខាកត់ត្រា",
    organization: "សាលាបឋមសិក្សា រោគ",
    phone: "០៩៧ ៨៨៨ ៩៩៩",
    signature: "អ៊ុន ប៊ុនទុង (Digital)",
    remarks: "កត់ត្រាកំណត់ហេតុ",
  },
  {
    id: "att_d3",
    name: "ស៊ូ គិន",
    gender: "ប្រុស",
    role: "ប្រធានគណៈកម្មាធិការគ្រប់គ្រង (គ.គ.ស)",
    organization: "សហគមន៍ភូមិ",
    phone: "០៨៨ ៧៦៥ ៤៣២",
    signature: "ស៊ូ គិន (Digital)",
    remarks: "ចូលរួមពេញលេញ",
  },
  {
    id: "att_d4",
    name: "យិន សាវី",
    gender: "ប្រុស",
    role: "គ្រូបង្រៀនថ្នាក់ទី៦",
    organization: "សាលាបឋមសិក្សា រោគ",
    phone: "០៩២ ១១២ ២៣៣",
    signature: "យិន សាវី (Digital)",
    remarks: "ចូលរួមពេញលេញ",
  },
  {
    id: "att_d5",
    name: "ម៉ានីតា",
    gender: "ស្រី",
    role: "តំណាងអង្គការដៃគូ",
    organization: "អង្គការដៃគូអភិវឌ្ឍន៍",
    phone: "០១៥ ៤៤៥ ៥៦៦",
    signature: "ម៉ានីតា (Digital)",
    remarks: "ចូលរួមពេញលេញ",
  },
  {
    id: "att_d6",
    name: "សាន វណ្ណា",
    gender: "ស្រី",
    role: "តំណាងមាតាបិតាសិស្ស",
    organization: "សហគមន៍",
    phone: "០៧០ ៩៩៨ ៨៧៧",
    signature: "សាន វណ្ណា (Digital)",
    remarks: "ចូលរួមពេញលេញ",
  },
];

export const PrintableDocument: React.FC<PrintableDocumentProps> = ({
  meetings,
  schoolInfo,
  onEditMeeting,
  onDeleteMeeting,
  onUpdateMeetingStyle,
  onPrint,
  readOnly = false,
}) => {
  // Global document style modifier for fast live adjustments before printing
  const [docGlobalStyle, setDocGlobalStyle] = useState<TextStyleConfig>({
    fontSize: 15,
    textAlign: "justify",
    color: "#0f172a",
    fontWeight: "normal",
    fontStyle: "normal",
    textDecoration: "none",
  });
  const [showStylePanel, setShowStylePanel] = useState(false);

  const getPhotoGridColsClass = (layout?: "grid-1" | "grid-2" | "grid-3" | "grid-4") => {
    switch (layout) {
      case "grid-1":
        return "grid-cols-1";
      case "grid-3":
        return "grid-cols-1 sm:grid-cols-3";
      case "grid-4":
        return "grid-cols-2 sm:grid-cols-4";
      case "grid-2":
      default:
        return "grid-cols-1 sm:grid-cols-2";
    }
  };

  const cleanSummaryText = (text?: string) => {
    if (!text) return "";
    return text
      .replace(/\*\*(.*?)\*\*/g, "$1") // strip bold marks
      .replace(/\*(.*?)\*/g, "$1") // strip italic marks
      .replace(/^#+\s+/gm, "") // strip markdown headings
      .trim();
  };

  return (
    <div className="w-full flex flex-col items-center py-6 print:py-0 font-khmer">
      {/* Top Document Formatting Control Panel (Hidden on Print) */}
      {!readOnly && (
        <div className="w-full max-w-[210mm] mb-4 print:hidden">
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-md">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    របារកែសម្រួលទម្រង់ឯកសារ (Quick Format & Typography Toolbar)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    តម្រឹមអក្សរ, បន្ថែម/បន្ថយទំហំ, ប្តូរពណ៌ឯកសារផ្ទាល់មុនពេលបោះពុម្ព
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onPrint || (() => window.print())}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-2xs transition cursor-pointer"
                  title="បោះពុម្ពឯកសារ A4"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>បោះពុម្ព A4</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowStylePanel(!showStylePanel)}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 p-1.5 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  {showStylePanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {showStylePanel && (
              <div className="mt-2 pt-2 border-t border-slate-100">
                <StyleToolbar
                  inlineMode={true}
                  styleConfig={docGlobalStyle}
                  onChange={(newStyle) => setDocGlobalStyle(newStyle)}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Printable Paper A4 Page Container */}
      <article
        id="printable-area"
        className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 p-8 sm:p-[18mm] shadow-2xl rounded-sm border border-slate-200 print:shadow-none print:border-none print:w-full print:max-w-none print:p-0 print:m-0"
        style={{
          fontFamily: "'Khmer OS Battambang', 'Khmer OS Siemreap', 'Moul', sans-serif",
          fontSize: `${docGlobalStyle.fontSize || 15}px`,
          lineHeight: "1.8",
          color: docGlobalStyle.color || "#0f172a",
        }}
      >
        {/* Meetings List */}
        <div className="space-y-14">
          {meetings.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 font-medium">មិនទាន់មានកំណត់ហេតុប្រជុំនៅឡើយទេ</p>
            </div>
          ) : (
            meetings.map((m, idx) => {
              const meetingStyle = m.styleConfig || docGlobalStyle;
              const activeFontSize = docGlobalStyle.fontSize || meetingStyle.fontSize || 15;
              const activeAlign = docGlobalStyle.textAlign || meetingStyle.textAlign || "justify";
              const activeColor = docGlobalStyle.color || meetingStyle.color || "#0f172a";

              const currentSchool = toKhmerDigits(m.schoolName || schoolInfo.schoolName || "សាលាបឋមសិក្សា រោគ");
              const currentDistrict = toKhmerDigits(m.district || schoolInfo.district || "រដ្ឋបាលស្រុកភ្នំស្រុក");
              const currentChair = toKhmerDigits(m.meetingChair || schoolInfo.meetingChair || "លោកស្រី សុខ សារើន");
              const currentMinuteTaker = toKhmerDigits(m.minuteTaker || schoolInfo.minuteTaker || "លោក អ៊ុន ប៊ុនទុង");

              const formattedDate = toKhmerDigits(m.date || "ថ្ងៃទី១៥ ខែកក្កដា ឆ្នាំ២០២៥");
              const formattedTime = formatKhmerTimeString(m.time || "វេលាម៉ោងប្រាំបី និងសូន្យនាទី(៨:០០) ព្រឹក");

              const introText =
                m.introParagraph ? toKhmerDigits(m.introParagraph) :
                `${formattedDate} ${formattedTime.startsWith("វេលា") ? formattedTime : `វេលា${formattedTime}`} នៅ${currentSchool} បានបើកកិច្ចប្រជុំមួយដើម្បី ${toKhmerDigits(m.title) || "ពិនិត្យ និងវាយតម្លៃការងារ"} ដែលដឹកនាំដោយ${currentChair} ជាប្រធានអង្គប្រជុំ។`;

              const khmerMeetingNum = toKhmerDigits(m.meetingNumber);

              // Extract all photos and separate general vs activity-specific photos
              const allPhotos = m.photos || [];
              const generalPhotos = allPhotos.filter(
                (p) => p.activityIndex === null || p.activityIndex === undefined || p.activityIndex < 0
              );

              // Extract attendees for attendance list
              const attendeesList =
                m.attendees && m.attendees.length > 0
                  ? m.attendees
                  : DEFAULT_ATTENDEES_FALLBACK;

              return (
                <section
                  key={m.id || idx}
                  className={`relative group ${
                    idx > 0 ? "border-t-2 border-slate-300 print:border-none print:page-break-before-always pt-8" : ""
                  }`}
                  style={{
                    fontSize: `${activeFontSize}px`,
                    textAlign: activeAlign,
                    color: activeColor,
                  }}
                >
                  {/* On-screen Edit / Delete Floating Controls */}
                  {!readOnly && (
                    <div className="absolute right-0 top-0 hidden group-hover:flex items-center gap-2 print:hidden bg-white/95 backdrop-blur p-1 rounded-xl border border-slate-200 shadow-md z-10">
                      <button
                        onClick={() => onEditMeeting(m)}
                        className="px-2.5 py-1.5 text-indigo-700 hover:bg-indigo-50 rounded-lg transition flex items-center gap-1 text-xs font-bold cursor-pointer"
                        title="កែប្រែទិន្នន័យ & តារាង & រូបភាព"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>កែប្រែ</span>
                      </button>
                      <button
                        onClick={() => onDeleteMeeting(m.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition flex items-center gap-1 text-xs font-semibold cursor-pointer"
                        title="លុប"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* ផ្នែកខាងលើ: Cambodian Administrative Header & Title */}
                  <div className="mb-6">
                    {/* Top Kingdom Header */}
                    <div className="text-center mb-4">
                      <div className="font-moul text-base sm:text-lg tracking-wide text-slate-900 leading-snug">
                        ព្រះរាជាណាចក្រកម្ពុជា
                      </div>
                      <div className="font-moul text-sm sm:text-base tracking-wide text-slate-900 leading-snug mt-0.5">
                        ជាតិ សាសនា ព្រះមហាក្សត្រ
                      </div>
                      <div className="text-xs tracking-[0.35em] text-slate-700 font-semibold my-1">
                        ❖ ❖ ❖
                      </div>
                    </div>

                    {/* District & School (Left Aligned) */}
                    <div className="text-left font-bold text-sm text-slate-900 space-y-0.5 mb-4">
                      <div>{currentDistrict}</div>
                      <div>{currentSchool}</div>
                    </div>

                    {/* Document Title: កំណត់ហេតុ ស្ដីពី... */}
                    <div className="text-center my-4 space-y-1">
                      <h3 className="font-moul text-lg sm:text-xl text-slate-900 tracking-wide">
                        កំណត់ហេតុ
                      </h3>
                      <div className="font-moul text-sm text-slate-800">
                        ស្ដីពី
                      </div>
                      <h4 className="font-bold text-base sm:text-lg text-slate-900 leading-snug max-w-2xl mx-auto">
                        {toKhmerDigits(m.title) || `កិច្ចប្រជុំលើកទី${khmerMeetingNum}`}
                      </h4>
                    </div>
                  </div>

                  {/* Lead Narrative Paragraph (កថាខណ្ឌផ្តើមនៃកិច្ចប្រជុំ) */}
                  <div className="my-4 text-justify leading-relaxed indent-8 text-slate-900">
                    {introText}
                  </div>

                  {/* Section 1: សមាសភាពអញ្ជើញចូលរួមប្រជុំ */}
                  <div className="my-4 space-y-1.5">
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="text-base select-none">👉</span>
                      <span>សមាសភាពអញ្ជើញចូលរួមប្រជុំ</span>
                    </h4>
                    <div className="pl-6 text-slate-800">
                      {m.participants ? (
                        m.participants.startsWith("-") ? (
                          <p>{toKhmerDigits(m.participants)}</p>
                        ) : (
                          <p>- {toKhmerDigits(m.participants)}</p>
                        )
                      ) : (
                        <p>- (បញ្ជីវត្តមានជូនភ្ជាប់)</p>
                      )}
                    </div>
                  </div>

                  {/* Section 2: របៀបវារៈនៃអង្គប្រជុំ */}
                  <div className="my-4 space-y-2">
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="text-base select-none">👉</span>
                      <span>របៀបវារៈនៃអង្គប្រជុំ</span>
                    </h4>
                    <div className="space-y-1.5 pl-6 text-slate-900">
                      {m.agenda && m.agenda.length > 0 ? (
                        m.agenda.map((item, i) => {
                          const khmerNumPrefix = toKhmerListIndex(i);
                          // Strip any existing numeric bullets
                          const cleanItem = String(item).replace(/^[0-9០-៩]+[\.\-\)\s]+\s*/, "");
                          return (
                            <div key={i} className="leading-relaxed flex items-start gap-2">
                              <span className="font-semibold shrink-0 select-none">{khmerNumPrefix}</span>
                              <span className="flex-1">{toKhmerDigits(cleanItem || item)}</span>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-slate-400 italic">គ្មានរបៀបវារៈ</p>
                      )}
                    </div>
                  </div>

                  {/* Section 3: ដំណើរការ និងសេចក្តីសម្រេចនៃអង្គប្រជុំ + Attached Photos per Activity */}
                  <div className="my-5 space-y-3">
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="text-base select-none">👉</span>
                      <span>ដំណើរការ និងសេចក្តីសម្រេចនៃអង្គប្រជុំ</span>
                    </h4>
                    <div className="space-y-4 pl-6 text-slate-900">
                      {m.decisions && m.decisions.length > 0 ? (
                        m.decisions.map((item, i) => {
                          const khmerNumPrefix = toKhmerListIndex(i);
                          const cleanItem = String(item).replace(/^[0-9០-៩]+[\.\-\)\s]+\s*/, "");

                          // Find photos associated specifically with this activity item
                          const activityPhotos = allPhotos.filter(
                            (p) => p.activityIndex === i
                          );

                          return (
                            <div key={i} className="space-y-2 break-inside-avoid">
                              <div className="leading-relaxed flex items-start gap-2">
                                <span className="font-semibold shrink-0 select-none">{khmerNumPrefix}</span>
                                <span className="flex-1 font-medium">{toKhmerDigits(cleanItem || item)}</span>
                              </div>

                              {/* Render 1 or more photos attached directly to this activity item */}
                              {activityPhotos.length > 0 && (
                                <div className="pl-6 pt-1 pb-2">
                                  <div className={`grid gap-3 ${
                                    activityPhotos.length === 1 ? "grid-cols-1 sm:grid-cols-2" : getPhotoGridColsClass(m.photoLayout)
                                  }`}>
                                    {activityPhotos.map((photo, pIdx) => (
                                      <div
                                        key={photo.id || pIdx}
                                        className="bg-slate-50 border border-slate-300 rounded-lg p-2 text-center space-y-1.5 break-inside-avoid shadow-2xs"
                                      >
                                        <div className="aspect-4/3 w-full overflow-hidden rounded bg-slate-200 border border-slate-300">
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img
                                            src={photo.url}
                                            alt={photo.caption || "រូបភាពសកម្មភាព"}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        {photo.caption && (
                                          <p className="text-[11px] font-medium text-slate-700 italic">
                                            {toKhmerDigits(photo.caption)}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-slate-400 italic">គ្មានសេចក្តីសម្រេច</p>
                      )}
                    </div>
                  </div>

                  {/* Section 4: សេចក្តីសង្ខេបកិច្ចប្រជុំ (AI Executive Summary) - Clean Formatting */}
                  {m.aiSummary && m.aiSummary.trim() !== "" && (
                    <div className="my-5 space-y-1.5 break-inside-avoid">
                      <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="text-base select-none">👉</span>
                        <span>សេចក្តីសង្ខេបកិច្ចប្រជុំ (Executive Summary)</span>
                      </h4>
                      <div className="pl-6 text-slate-900 leading-relaxed text-justify bg-slate-50/80 print:bg-transparent p-3 print:p-0 rounded-xl border border-slate-200 print:border-none text-sm sm:text-base">
                        <p className="whitespace-pre-line">{toKhmerDigits(cleanSummaryText(m.aiSummary))}</p>
                      </div>
                    </div>
                  )}

                  {/* Dynamic Tables (If any) */}
                  {m.tables && m.tables.length > 0 && (
                    <div className="my-5 space-y-4 break-inside-avoid">
                      {m.tables.map((table, tIdx) => (
                        <div key={table.id || tIdx} className="space-y-1.5">
                          {table.title && (
                            <h5 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                              <TableIcon className="w-4 h-4 text-indigo-600 print:hidden inline" />
                              {toKhmerDigits(table.title)}
                            </h5>
                          )}
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-slate-700 text-xs">
                              <thead>
                                <tr className="bg-slate-100 print:bg-slate-100 font-bold text-slate-900 border-b border-slate-700">
                                  {table.headers.map((h, hIdx) => (
                                    <th
                                      key={hIdx}
                                      className="border border-slate-700 px-2 py-1.5 text-center font-bold"
                                    >
                                      {toKhmerDigits(h)}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {(table.rows || []).map((row, rIdx) => {
                                  const cells = Array.isArray(row) ? row : (row?.cells || []);
                                  return (
                                    <tr key={(row as any)?.id || rIdx} className="border-b border-slate-700">
                                      {cells.map((cell, cIdx) => (
                                        <td
                                          key={cIdx}
                                          className={`border border-slate-700 px-2 py-1.5 ${
                                            cIdx === 0 ? "text-center" : "text-left"
                                          }`}
                                        >
                                          {toKhmerDigits(cell)}
                                        </td>
                                      ))}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* General Photo Gallery (If any general photos without specific activity assignment) */}
                  {generalPhotos.length > 0 && (
                    <div className="my-6 space-y-2 break-inside-avoid">
                      <h5 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-sky-600 print:hidden inline" />
                        រូបភាពសកម្មភាពកិច្ចប្រជុំ ({toKhmerDigits(generalPhotos.length)} រូប)
                      </h5>
                      <div className={`grid gap-3 ${getPhotoGridColsClass(m.photoLayout)}`}>
                        {generalPhotos.map((photo, pIdx) => (
                          <div
                            key={photo.id || pIdx}
                            className="bg-slate-50 border border-slate-300 rounded-lg p-2 text-center space-y-1.5 break-inside-avoid shadow-2xs"
                          >
                            <div className="aspect-4/3 w-full overflow-hidden rounded bg-slate-200 border border-slate-300">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={photo.url}
                                alt={photo.caption || "រូបភាពកិច្ចប្រជុំ"}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {photo.caption && (
                              <p className="text-[11px] font-medium text-slate-700 italic">
                                {toKhmerDigits(photo.caption)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key School Document Attachments (Annex / ឯកសារ និងលិខិតភ្ជាប់) */}
                  {m.attachments && m.attachments.length > 0 && (
                    <div className="my-5 space-y-2 break-inside-avoid">
                      <h5 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-300 pb-1">
                        <Paperclip className="w-4 h-4 text-rose-600 print:hidden inline" />
                        ឯកសារ និងលិខិតភ្ជាប់ ({toKhmerDigits(m.attachments.length)} ឯកសារ)
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                        {m.attachments.map((att, aIdx) => (
                          <div
                            key={att.id || aIdx}
                            className="border border-slate-300 rounded-lg p-2.5 bg-slate-50/70 flex items-start gap-2.5 shadow-2xs break-inside-avoid"
                          >
                            {att.fileType === "image" && att.url && (
                              <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-300 shrink-0 bg-slate-100">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={att.url}
                                  alt={att.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}

                            <div className="min-w-0 flex-1 space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-800 truncate block">
                                  {toKhmerDigits(aIdx + 1)}. {toKhmerDigits(att.name)}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 uppercase font-semibold">
                                  {att.fileType}
                                </span>
                              </div>
                              {att.description && (
                                <p className="text-[11px] text-slate-600 italic truncate">
                                  {toKhmerDigits(att.description)}
                                </p>
                              )}
                            </div>
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 text-[11px] font-bold underline print:hidden shrink-0 self-center"
                            >
                              បើកមើល
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Closing Paragraph */}
                  <div className="my-5 text-justify leading-relaxed text-slate-900">
                    អង្គប្រជុំនេះ បានបញ្ចប់នៅ{formattedTime.includes("ដល់") ? formattedTime.split("ដល់")[1] || "វេលាម៉ោងបញ្ចប់" : "វេលាម៉ោងសមគួរ"} នាថ្ងៃខែឆ្នាំដដែល ក្រោមបរិយាកាសរីករាយ និងស្និទ្ធស្នាលក្រៃលែង។
                  </div>

                  {/* Meeting Signatures Block */}
                  <div className="grid grid-cols-2 text-center text-sm mt-8 pt-4 min-h-[140px] break-inside-avoid">
                    <div>
                      <p className="font-bold">បានពិនិត្យ និងឯកភាព</p>
                      <p className="font-bold text-xs mt-0.5">ប្រធានអង្គប្រជុំ</p>
                      <div className="h-14 flex items-center justify-center">
                        <p className="text-xs text-slate-400">ហត្ថលេខា និងត្រា</p>
                      </div>
                      <p className="text-xs font-bold text-slate-900 mt-1">{currentChair}</p>
                    </div>
                    <div>
                      <p className="font-bold">អ្នកធ្វើកំណត់ហេតុ</p>
                      <p className="text-xs text-slate-400 mt-0.5">&nbsp;</p>
                      <div className="h-14 flex items-center justify-center">
                        <p className="text-xs text-slate-400">ហត្ថលេខា</p>
                      </div>
                      <p className="text-xs font-bold text-slate-900 mt-1">{currentMinuteTaker}</p>
                    </div>
                  </div>

                  {/* ======================================================== */}
                  {/* ATTENDANCE SHEET ANNEX (បញ្ជីវត្តមានអ្នកចូលរួមប្រជុំ) */}
                  {/* ======================================================== */}
                  <div className="mt-14 pt-8 border-t-2 border-slate-800 print:page-break-before-always break-inside-avoid">
                    {/* Official Cambodian Header for Attendance */}
                    <div className="text-center mb-4">
                      <div className="font-moul text-sm sm:text-base tracking-wide text-slate-900 leading-snug">
                        ព្រះរាជាណាចក្រកម្ពុជា
                      </div>
                      <div className="font-moul text-xs sm:text-sm tracking-wide text-slate-900 leading-snug mt-0.5">
                        ជាតិ សាសនា ព្រះមហាក្សត្រ
                      </div>
                      <div className="text-[10px] tracking-[0.35em] text-slate-700 font-semibold my-1">
                        ❖ ❖ ❖
                      </div>
                    </div>

                    {/* School Name */}
                    <div className="text-left font-bold text-xs sm:text-sm text-slate-900 mb-3">
                      <div>{currentSchool}</div>
                    </div>

                    {/* Attendance Title */}
                    <div className="text-center mb-4 space-y-1">
                      <h4 className="font-moul text-base sm:text-lg text-slate-900">
                        បញ្ជីវត្តមានអ្នកចូលរួមប្រជុំ
                      </h4>
                      <div className="font-moul text-xs text-slate-800">
                        ស្តីពី
                      </div>
                      <h5 className="font-bold text-sm sm:text-base text-slate-900 max-w-xl mx-auto">
                        {toKhmerDigits(m.title) || `កិច្ចប្រជុំលើកទី${khmerMeetingNum}`}
                      </h5>
                      <p className="text-xs text-slate-700 font-medium pt-1">
                        {formattedDate} នៅ{toKhmerDigits(m.meetingPlace || currentSchool)}
                      </p>
                    </div>

                    {/* Official Attendance Table (8 Columns) */}
                    <div className="overflow-x-auto my-4">
                      <table className="w-full border-collapse border border-slate-700 text-xs">
                        <thead>
                          <tr className="bg-slate-100 print:bg-slate-100 font-bold text-slate-900 border-b border-slate-700">
                            <th className="border border-slate-700 px-2 py-2 text-center w-10">ល.រ</th>
                            <th className="border border-slate-700 px-2.5 py-2 text-left min-w-[130px]">គោត្តនាម-នាម</th>
                            <th className="border border-slate-700 px-1.5 py-2 text-center w-12">ភេទ</th>
                            <th className="border border-slate-700 px-2 py-2 text-left min-w-[130px]">ភារកិច្ច / តួនាទី</th>
                            <th className="border border-slate-700 px-2 py-2 text-left min-w-[120px]">អង្គភាព</th>
                            <th className="border border-slate-700 px-2 py-2 text-center w-28">លេខទូរស័ព្ទ</th>
                            <th className="border border-slate-700 px-2 py-2 text-center w-32">ហត្ថលេខា(digital)</th>
                            <th className="border border-slate-700 px-2 py-2 text-left min-w-[100px]">ផ្សេងៗ / សេចក្ដីបញ្ជាក់</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendeesList.map((att, aIdx) => (
                            <tr key={att.id || aIdx} className="border-b border-slate-700">
                              <td className="border border-slate-700 px-2 py-1.5 text-center font-bold">
                                {toKhmerDigits(aIdx + 1)}
                              </td>
                              <td className="border border-slate-700 px-2.5 py-1.5 font-bold text-slate-900">
                                {toKhmerDigits(att.name)}
                              </td>
                              <td className="border border-slate-700 px-1.5 py-1.5 text-center">
                                {att.gender}
                              </td>
                              <td className="border border-slate-700 px-2 py-1.5 text-slate-800">
                                {toKhmerDigits(att.role)}
                              </td>
                              <td className="border border-slate-700 px-2 py-1.5 text-slate-700">
                                {toKhmerDigits(att.organization || currentSchool)}
                              </td>
                              <td className="border border-slate-700 px-2 py-1.5 text-center font-mono">
                                {toKhmerDigits(att.phone) || "-"}
                              </td>
                              <td className="border border-slate-700 px-2 py-1 text-center">
                                {att.signature && att.signature.startsWith("data:image") ? (
                                  <div className="flex items-center justify-center">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={att.signature}
                                      alt="Signature"
                                      className="max-h-7 max-w-[75px] object-contain"
                                    />
                                  </div>
                                ) : (
                                  <span className="text-[11px] font-semibold italic text-slate-800">
                                    {toKhmerDigits(att.signature || "បានចុះហត្ថលេខា")}
                                  </span>
                                )}
                              </td>
                              <td className="border border-slate-700 px-2 py-1.5 text-slate-600 text-[11px] italic">
                                {toKhmerDigits(att.remarks || "ចូលរួមពេញលេញ")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Attendance Confirmation Footer Signatures */}
                    <div className="grid grid-cols-2 text-center text-xs sm:text-sm mt-8 pt-2 break-inside-avoid">
                      <div>
                        <p className="font-bold">បានពិនិត្យ និងឯកភាព</p>
                        <p className="font-bold mt-0.5">នាយិកាសាលា</p>
                        <div className="h-16 flex items-center justify-center">
                          <p className="text-xs text-slate-400">ហត្ថលេខា និងត្រា</p>
                        </div>
                        <p className="font-bold text-slate-900 mt-1">{currentChair}</p>
                      </div>
                      <div>
                        <p className="font-bold">អ្នករៀបចំបញ្ជីវត្តមាន</p>
                        <p className="font-bold mt-0.5">&nbsp;</p>
                        <div className="h-16 flex items-center justify-center">
                          <p className="text-xs text-slate-400">ហត្ថលេខា</p>
                        </div>
                        <p className="font-bold text-slate-900 mt-1">{currentMinuteTaker}</p>
                      </div>
                    </div>
                  </div>
                </section>
              );
            })
          )}
        </div>
      </article>
    </div>
  );
};
