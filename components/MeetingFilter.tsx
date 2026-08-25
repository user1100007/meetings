"use client";

import React from "react";
import { Search, LayoutGrid, FileText, Filter, BarChart3, ChevronDown } from "lucide-react";

interface MeetingFilterProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedNumber: number | "all";
  onSelectNumber: (num: number | "all") => void;
  viewMode: "document" | "cards";
  onViewModeChange: (mode: "document" | "cards") => void;
  totalMeetings: number;
  onOpenAnalytics?: () => void;
}

export const MeetingFilter: React.FC<MeetingFilterProps> = ({
  searchTerm,
  onSearchChange,
  selectedNumber,
  onSelectNumber,
  viewMode,
  onViewModeChange,
  totalMeetings,
  onOpenAnalytics,
}) => {
  return (
    <div className="bg-white border-b border-slate-200 py-2 px-3 sm:px-4 lg:px-6 sticky top-[56px] z-30 shadow-2xs font-khmer print:hidden">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left Side: Search input & Filter Select */}
        <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-xl">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              id="meeting-search-input"
              name="meeting-search"
              type="text"
              placeholder="ស្វែងរកប្រធានបទ របៀបវារៈ..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              autoComplete="off"
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
            />
          </div>

          {/* Meeting Number Filter Dropdown */}
          <div className="relative shrink-0">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus-within:ring-2 focus-within:ring-blue-600/20 focus-within:border-blue-600">
              <Filter className="w-3.5 h-3.5 text-blue-800 mr-1.5 shrink-0" />
              <select
                value={selectedNumber}
                onChange={(e) => {
                  const val = e.target.value;
                  onSelectNumber(val === "all" ? "all" : Number(val));
                }}
                className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer pr-4 appearance-none"
              >
                <option value="all">ទាំងអស់ ({totalMeetings})</option>
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <option key={num} value={num}>
                    លើកទី {num}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Right Side: View Mode Toggle Switch */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {onOpenAnalytics && (
            <button
              onClick={onOpenAnalytics}
              className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-semibold text-xs rounded-lg border border-indigo-200 transition cursor-pointer"
              title="ស្ថិតិ & ក្រាហ្វិក"
            >
              <BarChart3 className="w-3 h-3 text-indigo-600" />
              <span className="hidden sm:inline text-[11px]">ស្ថិតិ</span>
            </button>
          )}

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold border border-slate-200">
            <button
              type="button"
              onClick={() => onViewModeChange("document")}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                viewMode === "document"
                  ? "bg-white text-blue-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="ទិដ្ឋភាពឯកសារ A4"
            >
              <FileText className="w-3 h-3" />
              <span>A4</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("cards")}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                viewMode === "cards"
                  ? "bg-white text-blue-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="ទិដ្ឋភាពកាត"
            >
              <LayoutGrid className="w-3 h-3" />
              <span>កាត</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
