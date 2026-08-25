"use client";

import React, { useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Calendar as CalendarIcon,
  Sun,
  Moon,
  Sparkles,
  Award,
  Clock,
  Send,
} from "lucide-react";
import {
  getKhmerDateDetail,
  getMonthMatrix,
  KHMER_DAYS_SHORT,
  KHMER_SOLAR_MONTHS,
  toKhmerNum,
  KhmerDateDetail,
} from "@/lib/khmerCalendarEngine";

interface KhmerCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDateForMeeting?: (dateText: string, fullIntroText?: string) => void;
  initialDate?: Date;
}

export const KhmerCalendarModal: React.FC<KhmerCalendarModalProps> = ({
  isOpen,
  onClose,
  onSelectDateForMeeting,
  initialDate = new Date(),
}) => {
  const [currentYear, setCurrentYear] = useState<number>(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(initialDate.getMonth() + 1); // 1-12
  const [selectedDate, setSelectedDate] = useState<KhmerDateDetail>(() =>
    getKhmerDateDetail(initialDate)
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "holidays" | "sila">("all");

  if (!isOpen) return null;

  const daysMatrix = getMonthMatrix(currentYear, currentMonth);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth() + 1);
    setSelectedDate(getKhmerDateDetail(today));
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const isCurrentMonth = (d: KhmerDateDetail) =>
    d.solarMonth === currentMonth && d.solarYear === currentYear;

  const isToday = (d: KhmerDateDetail) => {
    const today = new Date();
    return (
      d.solarDay === today.getDate() &&
      d.solarMonth === today.getMonth() + 1 &&
      d.solarYear === today.getFullYear()
    );
  };

  const isSelected = (d: KhmerDateDetail) => {
    return (
      d.solarDay === selectedDate.solarDay &&
      d.solarMonth === selectedDate.solarMonth &&
      d.solarYear === selectedDate.solarYear
    );
  };

  return (
    <div
      id="khmer-calendar-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 font-khmer overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="khmer-calendar-modal-content"
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white px-5 py-4 flex items-center justify-between border-b border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
              <CalendarIcon className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">
                  ប្រតិទិនខ្មែរ ចន្ទគតិ & ថ្ងៃឈប់សម្រាកបុណ្យជាតិ
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-medium">
                  ព.ស. {toKhmerNum(selectedDate.beYear)}
                </span>
              </div>
              <p className="text-xs text-blue-200">
                ពិនិត្យថ្ងៃសីល ថ្ងៃឈប់សម្រាក និងចម្លងកាលបរិច្ឆេទរដ្ឋបាលសម្រាប់កិច្ចប្រជុំ
              </p>
            </div>
          </div>

          <button
            id="close-calendar-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="បិទផ្ទាំង"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto flex-1 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* Left / Top Main: Interactive Calendar Grid (7 cols on lg) */}
          <div className="lg:col-span-7 p-4 sm:p-5 flex flex-col justify-between">
            <div>
              {/* Calendar Controls & Month Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                  <button
                    id="prev-month-btn"
                    onClick={handlePrevMonth}
                    className="p-1.5 hover:bg-white text-slate-700 rounded-xl transition shadow-2xs cursor-pointer"
                    title="ខែមុន"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="px-3 py-1 font-bold text-slate-800 text-sm sm:text-base flex items-center gap-1">
                    <span>ខែ{KHMER_SOLAR_MONTHS[currentMonth - 1]}</span>
                    <span>ឆ្នាំ{toKhmerNum(currentYear)}</span>
                  </div>

                  <button
                    id="next-month-btn"
                    onClick={handleNextMonth}
                    className="p-1.5 hover:bg-white text-slate-700 rounded-xl transition shadow-2xs cursor-pointer"
                    title="ខែបន្ទាប់"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Filter / Quick actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleGoToday}
                    className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200 transition cursor-pointer"
                  >
                    ថ្ងៃនេះ
                  </button>

                  <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
                    <button
                      onClick={() => setFilterMode("all")}
                      className={`px-2 py-0.5 rounded-lg font-medium transition ${
                        filterMode === "all"
                          ? "bg-white text-slate-800 shadow-2xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      ទាំងអស់
                    </button>
                    <button
                      onClick={() => setFilterMode("holidays")}
                      className={`px-2 py-0.5 rounded-lg font-medium transition ${
                        filterMode === "holidays"
                          ? "bg-rose-500 text-white shadow-2xs"
                          : "text-slate-500 hover:text-rose-600"
                      }`}
                    >
                      ថ្ងៃឈប់សម្រាក
                    </button>
                    <button
                      onClick={() => setFilterMode("sila")}
                      className={`px-2 py-0.5 rounded-lg font-medium transition ${
                        filterMode === "sila"
                          ? "bg-amber-500 text-white shadow-2xs"
                          : "text-slate-500 hover:text-amber-600"
                      }`}
                    >
                      ថ្ងៃសីល
                    </button>
                  </div>
                </div>
              </div>

              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-500 mb-1 border-b border-slate-200 pb-1.5">
                {KHMER_DAYS_SHORT.map((day, idx) => (
                  <div
                    key={idx}
                    className={idx === 0 ? "text-rose-500" : idx === 6 ? "text-blue-600" : ""}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid (42 Cells) */}
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {daysMatrix.map((d, index) => {
                  const inCurrentMonth = isCurrentMonth(d);
                  const today = isToday(d);
                  const selected = isSelected(d);

                  const highlightMatch =
                    filterMode === "all" ||
                    (filterMode === "holidays" && d.isHoliday) ||
                    (filterMode === "sila" && d.isSila);

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(d)}
                      className={`relative min-h-[58px] sm:min-h-[64px] p-1 rounded-2xl flex flex-col items-center justify-between transition cursor-pointer border text-left ${
                        selected
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-300"
                          : today
                          ? "bg-blue-50/80 border-blue-400 text-blue-900"
                          : inCurrentMonth
                          ? "bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-800"
                          : "bg-slate-50/50 border-slate-100 text-slate-300 opacity-60"
                      } ${!highlightMatch ? "opacity-30" : ""}`}
                    >
                      {/* Top row: Solar day + Badges */}
                      <div className="w-full flex items-center justify-between">
                        <span
                          className={`text-xs sm:text-sm font-bold ${
                            selected
                              ? "text-white"
                              : d.dayOfWeek === 0
                              ? "text-rose-600"
                              : inCurrentMonth
                              ? "text-slate-800"
                              : "text-slate-400"
                          }`}
                        >
                          {toKhmerNum(d.solarDay)}
                        </span>

                        {d.isHoliday ? (
                          <span
                            className={`w-2 h-2 rounded-full ${
                              selected ? "bg-rose-300" : "bg-rose-500"
                            }`}
                            title={d.holidayName}
                          />
                        ) : d.isSila ? (
                          <span
                            className={`w-2 h-2 rounded-full ${
                              selected ? "bg-amber-300" : "bg-amber-500"
                            }`}
                            title={d.silaDescription}
                          />
                        ) : null}
                      </div>

                      {/* Middle / Bottom row: Khmer Lunar date */}
                      <div className="w-full text-center mt-0.5">
                        <span
                          className={`block text-[10px] sm:text-[11px] leading-tight truncate font-medium ${
                            selected
                              ? "text-indigo-100"
                              : d.isSila
                              ? "text-amber-700 font-bold"
                              : d.isHoliday
                              ? "text-rose-700 font-bold"
                              : "text-slate-500"
                          }`}
                        >
                          {toKhmerNum(d.lunarDay)}
                          {d.lunarPhase}
                        </span>

                        {d.lunarPhase === "កើត" && d.lunarDay === 15 ? (
                          <span className="text-[9px] block text-amber-500">🌕 ពេញ</span>
                        ) : d.lunarPhase === "រោច" && (d.lunarDay === 14 || d.lunarDay === 15) ? (
                          <span className="text-[9px] block text-slate-400">🌑 ដាច់</span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend / Info Bar */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>ថ្ងៃឈប់សម្រាក</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>ថ្ងៃសីល</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>ថ្ងៃនេះ</span>
                </div>
              </div>

              <div className="text-slate-500 text-[11px]">
                ឆ្នាំ{selectedDate.animalYear} {selectedDate.sak}
              </div>
            </div>
          </div>

          {/* Right / Bottom Detail Panel: Selected Day & Quick Copy (5 cols on lg) */}
          <div className="lg:col-span-5 bg-slate-50/70 p-4 sm:p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Selected Day Header Card */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
                    {selectedDate.dayOfWeekKhmer}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>ព.ស. {toKhmerNum(selectedDate.beYear)}</span>
                  </span>
                </div>

                <div className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {selectedDate.solarKhmerText}
                </div>

                <div className="text-xs text-slate-700 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/80 space-y-1">
                  <div className="flex items-center gap-1 font-semibold text-amber-900">
                    <Moon className="w-3.5 h-3.5 text-amber-600" />
                    <span>
                      {toKhmerNum(selectedDate.lunarDay)}
                      {selectedDate.lunarPhase} ខែ{selectedDate.lunarMonthName} ឆ្នាំ
                      {selectedDate.animalYear} {selectedDate.sak}
                    </span>
                  </div>
                  {selectedDate.isSila && (
                    <div className="text-amber-800 font-bold flex items-center gap-1">
                      <span>🔔</span>
                      <span>{selectedDate.silaDescription}</span>
                    </div>
                  )}
                </div>

                {selectedDate.isHoliday && (
                  <div className="text-xs text-rose-800 bg-rose-50 p-2.5 rounded-xl border border-rose-200 font-bold flex items-start gap-1.5">
                    <Award className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div>{selectedDate.holidayName}</div>
                      <div className="text-[11px] font-normal text-rose-600">
                        ថ្ងៃឈប់សម្រាកបុណ្យជាតិផ្លូវការ
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Copy Format 1: Full Khmer Administrative Text (អត្ថបទរដ្ឋបាលពេញលេញ) */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>ទម្រង់រដ្ឋបាលពេញលេញ (Full Admin)</span>
                  </label>
                  <button
                    onClick={() =>
                      handleCopyText(selectedDate.fullAdminKhmerText, "fullAdmin")
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-lg transition border border-indigo-200 cursor-pointer shadow-2xs"
                  >
                    {copiedKey === "fullAdmin" ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">បានចម្លង!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>ចម្លង</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-800 leading-relaxed border border-slate-100 font-medium select-all">
                  {selectedDate.fullAdminKhmerText}
                </div>
              </div>

              {/* Copy Format 2: Standard Khmer Lunar + Solar (ចន្ទគតិ & សុរិយគតិ) */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Moon className="w-3.5 h-3.5 text-blue-600" />
                    <span>ទម្រង់ចន្ទគតិ-សុរិយគតិ (Lunar & Solar)</span>
                  </label>
                  <button
                    onClick={() =>
                      handleCopyText(selectedDate.standardKhmerDateText, "standard")
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-lg transition border border-blue-200 cursor-pointer shadow-2xs"
                  >
                    {copiedKey === "standard" ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">បានចម្លង!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>ចម្លង</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-800 leading-relaxed border border-slate-100 font-medium select-all">
                  {selectedDate.standardKhmerDateText}
                </div>
              </div>

              {/* Copy Format 3: Solar Only */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>ទម្រង់សុរិយគតិធម្មតា (Solar Date)</span>
                  </label>
                  <button
                    onClick={() =>
                      handleCopyText(selectedDate.solarKhmerText, "solar")
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs rounded-lg transition border border-amber-200 cursor-pointer shadow-2xs"
                  >
                    {copiedKey === "solar" ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">បានចម្លង!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>ចម្លង</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl text-xs text-slate-800 font-medium select-all border border-slate-100">
                  {selectedDate.solarKhmerText}
                </div>
              </div>
            </div>

            {/* If Modal was opened from Meeting Editor -> Insert Button */}
            {onSelectDateForMeeting && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onSelectDateForMeeting(
                      selectedDate.fullAdminKhmerText,
                      selectedDate.fullAdminKhmerText
                    );
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>បញ្ចូលកាលបរិច្ឆេទនេះទៅក្នុងកំណត់ហេតុ</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
