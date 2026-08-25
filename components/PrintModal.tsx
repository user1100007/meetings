"use client";

import React, { useState } from "react";
import {
  Printer,
  ExternalLink,
  Download,
  FileCode,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  HelpCircle,
  FileText,
} from "lucide-react";
import { MeetingDoc } from "@/types/meeting";

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNumber: number | "all";
  totalMeetings: number;
  onDownloadHTML: () => void;
  onDownloadTXT: () => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  selectedNumber,
  totalMeetings,
  onDownloadHTML,
  onDownloadTXT,
}) => {
  const [printStatus, setPrintStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDirectPrint = () => {
    try {
      setPrintStatus("កំពុងបើកផ្ទាំងបោះពុម្ព...");
      window.focus();
      const printSuccess = window.print();
      setTimeout(() => setPrintStatus(null), 3000);
    } catch (e) {
      console.warn("Direct window.print() failed inside iframe, advising new tab:", e);
      setPrintStatus("សូមប្រើជម្រើស 'បើកក្នុងផ្ទាំងថ្មី' ដើម្បីបោះពុម្ពដោយរលូន!");
    }
  };

  const handleOpenInNewTab = () => {
    const query = selectedNumber !== "all" ? `?number=${selectedNumber}` : "";
    const printUrl = `/print${query}`;
    window.open(printUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-fade-in font-khmer">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-sky-300">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                ជម្រើសបោះពុម្ព & ទាញយកឯកសារ A4
              </h3>
              <p className="text-xs text-sky-200 mt-0.5">
                {selectedNumber === "all"
                  ? `កំណត់ហេតុទាំងអស់ (${totalMeetings} លើក)`
                  : `កំណត់ហេតុលើកទី ${selectedNumber}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs text-slate-700">
          {/* Main Action 1: Open in New Dedicated Tab (Recommended for Iframe/Sandbox) */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-block px-2 py-0.5 bg-blue-900 text-white font-bold text-[10px] rounded-md mb-1">
                  ជម្រើសល្អដាច់គេ (Best Method)
                </span>
                <h4 className="font-bold text-sm text-blue-950">
                  បើកក្នុងផ្ទាំងថ្មី (Open in Dedicated Tab)
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  បើកឯកសារ A4 ពេញលេញក្នុងផ្ទាំងថ្មីដាច់ដោយឡែក ដើម្បីបោះពុម្ព ឬ Save ជា PDF ដោយគ្មានការរារាំងពីប្រព័ន្ធសុវត្ថិភាព។
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleOpenInNewTab}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-sky-300" />
              <span>បើកផ្ទាំងបោះពុម្ព A4 ក្នុង Tab ថ្មី (Open & Print)</span>
            </button>
          </div>

          {/* Secondary Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Direct Print Button */}
            <button
              type="button"
              onClick={handleDirectPrint}
              className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition flex flex-col justify-between space-y-2 cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-blue-700 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-slate-900 text-xs">បោះពុម្ពភ្លាមៗ</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                បញ្ជាទៅកាន់ម៉ាស៊ីនបោះពុម្ពដោយផ្ទាល់ (Direct Print)
              </p>
            </button>

            {/* Download Standalone HTML */}
            <button
              type="button"
              onClick={onDownloadHTML}
              className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition flex flex-col justify-between space-y-2 cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-slate-900 text-xs">ទាញយកជា HTML</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                រក្សាទុកជា File HTML ដើម្បីបើកមើល និងបោះពុម្ពពេលគ្មានអ៊ីនធឺណិត
              </p>
            </button>
          </div>

          {/* Status info */}
          {printStatus && (
            <div className="p-3 bg-sky-50 border border-sky-200 text-sky-900 rounded-xl flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
              <span>{printStatus}</span>
            </div>
          )}

          {/* Useful Print Settings Guideline */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
            <h5 className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-blue-700" />
              <span>ការកំណត់ពេលបោះពុម្ពជា PDF (Print / Save as PDF Settings)</span>
            </h5>
            <ul className="text-[11px] text-slate-600 space-y-1 pl-4 list-disc leading-relaxed">
              <li>
                <strong>Destination:</strong> Save as PDF ឬ ជ្រើសរើសម៉ាស៊ីនព្រីន
              </li>
              <li>
                <strong>Paper size:</strong> A4
              </li>
              <li>
                <strong>Margins:</strong> Default ឬ None
              </li>
              <li>
                <strong>Options:</strong> ត្រូវធីកយក <strong>Background graphics</strong> ដើម្បីបង្ហាញក្បាលទំព័រ និងតារាង
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            បិទ
          </button>
        </div>
      </div>
    </div>
  );
};
