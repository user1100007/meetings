"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Printer,
  Download,
  FileCode,
  Plus,
  RefreshCw,
  User,
  Database,
  Calendar,
  BarChart3,
  ChevronDown,
  Menu,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenAddModal: () => void;
  onOpenCalendar: () => void;
  onOpenAnalytics: () => void;
  onPrint: () => void;
  onDownloadHTML: () => void;
  onDownloadTXT: () => void;
  onResetDefaults: () => void;
  meetingCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenAddModal,
  onOpenCalendar,
  onOpenAnalytics,
  onPrint,
  onDownloadHTML,
  onDownloadTXT,
  onResetDefaults,
  meetingCount,
}) => {
  const { user } = useAuth();
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setIsToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-blue-900 text-white shadow-md border-b border-blue-800 print:hidden font-khmer">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 gap-2">
          {/* Logo & School Header */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center border border-white/20 shadow-inner shrink-0 text-base sm:text-lg">
              🇰🇭
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs sm:text-sm md:text-base font-bold tracking-tight text-white truncate leading-tight">
                  កំណត់ហេតុប្រជុំគណៈគ្រប់គ្រង
                </h1>
                <span className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                  <Database className="w-2.5 h-2.5 text-emerald-400" />
                  <span>Live ({meetingCount})</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-sky-200/90 truncate hidden xs:block">
                សាលាបឋមសិក្សា រោគ • ស្រុកភ្នំស្រុក
              </p>
            </div>
          </div>

          {/* Compact Action Toolbar with Dropdowns */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Primary Compact Add Button */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-xs transition border border-emerald-500 cursor-pointer"
              title="បន្ថែមកំណត់ហេតុថ្មី"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">បន្ថែមថ្មី</span>
            </button>

            {/* Quick Print Compact Button */}
            <button
              onClick={onPrint}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white text-blue-950 hover:bg-sky-50 font-bold text-xs rounded-lg shadow-xs transition cursor-pointer"
              title="បោះពុម្ពឯកសារ A4"
            >
              <Printer className="w-3.5 h-3.5 text-blue-900" />
              <span className="hidden md:inline">បោះពុម្ព</span>
            </button>

            {/* Tools & Export Dropdown Menu */}
            <div className="relative" ref={toolsRef}>
              <button
                type="button"
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-800/90 hover:bg-blue-700 text-sky-100 hover:text-white font-semibold text-xs rounded-lg transition border border-blue-700/80 cursor-pointer shadow-xs"
                title="ម៉ឺនុយឧបករណ៍ & ទាញយកឯកសារ"
              >
                <Menu className="w-3.5 h-3.5 text-sky-300" />
                <span className="hidden sm:inline">ឧបករណ៍</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    isToolsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu Items */}
              {isToolsOpen && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 font-khmer">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    ឧបករណ៍ & មុខងារ
                  </div>

                  <button
                    onClick={() => {
                      setIsToolsOpen(false);
                      onOpenAnalytics();
                    }}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-indigo-50 hover:text-indigo-900 flex items-center gap-2 font-medium transition cursor-pointer"
                  >
                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                    <span>ស្ថិតិ & ក្រាហ្វិកវិភាគ</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsToolsOpen(false);
                      onOpenCalendar();
                    }}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2 font-medium transition cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span>ប្រតិទិនខ្មែរ (ចន្ទគតិ)</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsToolsOpen(false);
                      onPrint();
                    }}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-sky-50 hover:text-sky-900 flex items-center gap-2 font-medium transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-sky-700" />
                    <span>បោះពុម្ពឯកសារ A4</span>
                  </button>

                  <div className="my-1 border-t border-slate-100" />
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    ទាញយកឯកសារ (Export)
                  </div>

                  <button
                    onClick={() => {
                      setIsToolsOpen(false);
                      onDownloadHTML();
                    }}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-slate-50 flex items-center gap-2 font-medium text-slate-700 transition cursor-pointer"
                  >
                    <FileCode className="w-4 h-4 text-blue-600" />
                    <span>ទាញយកជា HTML</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsToolsOpen(false);
                      onDownloadTXT();
                    }}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-slate-50 flex items-center gap-2 font-medium text-slate-700 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>ទាញយកជា TXT</span>
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    onClick={() => {
                      setIsToolsOpen(false);
                      onResetDefaults();
                    }}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-rose-50 text-rose-700 flex items-center gap-2 font-medium transition cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4 text-rose-500" />
                    <span>ស្តារទិន្នន័យដើម ៧ លើក</span>
                  </button>
                </div>
              )}
            </div>

            {/* Compact User Auth Button */}
            <button
              onClick={onOpenAuth}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border cursor-pointer ${
                user
                  ? "bg-emerald-500/10 text-emerald-200 border-emerald-500/40 hover:bg-emerald-500/20"
                  : "bg-amber-500/20 text-amber-200 border-amber-500/40 hover:bg-amber-500/30"
              }`}
              title={user ? `ចូលដោយ: ${user.email}` : "ចូលគណនី (Auth)"}
            >
              {user ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="max-w-[70px] sm:max-w-[100px] truncate">
                    {user.displayName || user.email?.split("@")[0] || "គណនី"}
                  </span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">គណនី</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
