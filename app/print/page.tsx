"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MeetingDoc, SchoolInfo } from "@/types/meeting";
import { subscribeMeetings, DEFAULT_SCHOOL_INFO } from "@/services/meetingService";
import { PrintableDocument } from "@/components/PrintableDocument";
import { Printer, ArrowLeft, Download, ExternalLink, Loader2 } from "lucide-react";

function PrintContent() {
  const searchParams = useSearchParams();
  const meetingNumParam = searchParams ? searchParams.get("number") : null;
  
  const [meetings, setMeetings] = useState<MeetingDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeMeetings(
      (items) => {
        setMeetings(items);
        setLoading(false);
      },
      (err) => {
        console.error("Print page subscription error:", err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const schoolInfo: SchoolInfo = {
    schoolName: meetings[0]?.schoolName || DEFAULT_SCHOOL_INFO.schoolName,
    district: meetings[0]?.district || DEFAULT_SCHOOL_INFO.district,
    academicYear: meetings[0]?.academicYear || DEFAULT_SCHOOL_INFO.academicYear,
    meetingPlace: meetings[0]?.meetingPlace || DEFAULT_SCHOOL_INFO.meetingPlace,
    meetingChair: meetings[0]?.meetingChair || DEFAULT_SCHOOL_INFO.meetingChair,
    minuteTaker: meetings[0]?.minuteTaker || DEFAULT_SCHOOL_INFO.minuteTaker,
  };

  const filteredMeetings = meetingNumParam && meetingNumParam !== "all"
    ? meetings.filter((m) => String(m.meetingNumber) === meetingNumParam)
    : meetings;

  const handlePrint = () => {
    window.focus();
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 font-khmer p-6">
        <Loader2 className="w-8 h-8 text-blue-900 animate-spin mb-3" />
        <p className="text-sm font-bold text-slate-700">កំពុងរៀបចំឯកសារ A4 សម្រាប់បោះពុម្ព...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200/80 font-khmer flex flex-col items-center">
      {/* Floating Control Bar for clean printing */}
      <header className="sticky top-0 z-50 w-full bg-slate-900/90 backdrop-blur text-white px-4 py-2.5 shadow-lg flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ត្រឡប់ក្រោយ</span>
          </a>
          <span className="text-xs font-bold text-sky-300 hidden sm:inline">
            ទំព័របោះពុម្ព A4 ផ្លូវការ (Official Print View)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>បោះពុម្ពឥឡូវនេះ (Ctrl + P)</span>
          </button>
        </div>
      </header>

      {/* Main Printable Document */}
      <main className="w-full flex justify-center py-6 print:p-0">
        <PrintableDocument
          meetings={filteredMeetings}
          schoolInfo={schoolInfo}
          onEditMeeting={() => {}}
          onDeleteMeeting={() => {}}
          readOnly={true}
        />
      </main>
    </div>
  );
}

export default function PrintPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center font-khmer">
          <Loader2 className="w-8 h-8 text-blue-900 animate-spin" />
        </div>
      }
    >
      <PrintContent />
    </Suspense>
  );
}
