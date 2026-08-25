"use client";

import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { MeetingFilter } from "@/components/MeetingFilter";
import { PrintableDocument } from "@/components/PrintableDocument";
import { MeetingCardsList } from "@/components/MeetingCardsList";
import { AuthModal } from "@/components/AuthModal";
import { MeetingEditModal } from "@/components/MeetingEditModal";
import { KhmerCalendarModal } from "@/components/KhmerCalendarModal";
import { MeetingAnalyticsModal } from "@/components/MeetingAnalyticsModal";
import { PrintModal } from "@/components/PrintModal";
import { MeetingDoc, SchoolInfo, TextStyleConfig } from "@/types/meeting";
import {
  subscribeMeetings,
  seedDefaultMeetingsIfEmpty,
  restoreDefaultMeetings,
  addMeeting,
  updateMeeting,
  deleteMeeting,
  DEFAULT_SCHOOL_INFO,
} from "@/services/meetingService";
import { FileText, Sparkles, CheckCircle2, ShieldCheck, Database, Info } from "lucide-react";

function MainContent() {
  const { user } = useAuth();

  const [meetings, setMeetings] = useState<MeetingDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNumber, setSelectedNumber] = useState<number | "all">("all");
  const [viewMode, setViewMode] = useState<"document" | "cards">("document");

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  type EditingState = Partial<MeetingDoc> | null;
  const [editingMeeting, setEditingMeeting] = useState<EditingState>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Subscribe to real-time Firestore updates and seed initial data if empty
  useEffect(() => {
    const userId = user?.uid || "guest_user";
    const userEmail = user?.email || "guest@school.gov.kh";

    // Seed defaults if empty
    seedDefaultMeetingsIfEmpty(userId, userEmail);

    // Subscribe to real-time updates
    const unsubscribe = subscribeMeetings(
      (items) => {
        setMeetings(items);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore real-time subscription error:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Derived School Info from first meeting or default
  const schoolInfo: SchoolInfo = {
    schoolName: meetings[0]?.schoolName || DEFAULT_SCHOOL_INFO.schoolName,
    district: meetings[0]?.district || DEFAULT_SCHOOL_INFO.district,
    academicYear: meetings[0]?.academicYear || DEFAULT_SCHOOL_INFO.academicYear,
    meetingPlace: meetings[0]?.meetingPlace || DEFAULT_SCHOOL_INFO.meetingPlace,
    meetingChair: meetings[0]?.meetingChair || DEFAULT_SCHOOL_INFO.meetingChair,
    minuteTaker: meetings[0]?.minuteTaker || DEFAULT_SCHOOL_INFO.minuteTaker,
  };

  // Filter meetings by search term and meeting number
  const filteredMeetings = meetings.filter((m) => {
    const matchesNumber =
      selectedNumber === "all" || m.meetingNumber === selectedNumber;

    const term = searchTerm.toLowerCase().trim();
    if (!term) return matchesNumber;

    const matchesTitle = m.title.toLowerCase().includes(term);
    const matchesAgenda = m.agenda?.some((a) => a.toLowerCase().includes(term));
    const matchesDecisions = m.decisions?.some((d) => d.toLowerCase().includes(term));

    return matchesNumber && (matchesTitle || matchesAgenda || matchesDecisions);
  });

  // Handlers for Add / Edit / Delete
  const handleOpenAddModal = () => {
    setEditingMeeting({
      schoolName: schoolInfo.schoolName,
      district: schoolInfo.district,
      academicYear: schoolInfo.academicYear,
      meetingPlace: schoolInfo.meetingPlace,
      meetingChair: schoolInfo.meetingChair,
      minuteTaker: schoolInfo.minuteTaker,
      meetingNumber: meetings.length + 1,
      agenda: [""],
      decisions: [""],
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (m: MeetingDoc) => {
    setEditingMeeting(m);
    setIsEditModalOpen(true);
  };

  const handleSaveMeeting = async (
    meetingData: Omit<MeetingDoc, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const uid = user?.uid || "guest_user";
      const uemail = user?.email || "guest@school.gov.kh";

      if (editingMeeting && editingMeeting.id) {
        // Update existing
        await updateMeeting(editingMeeting.id, {
          ...meetingData,
          userId: uid,
          userEmail: uemail,
        });
        showToast("បានបច្ចុប្បន្នភាពកំណត់ហេតុប្រជុំក្នុង Firestore");
      } else {
        // Create new
        await addMeeting({
          ...meetingData,
          userId: uid,
          userEmail: uemail,
        });
        showToast("បានបន្ថែម កំណត់ហេតុប្រជុំថ្មី ទៅក្នុង Firestore");
      }
    } catch (err: any) {
      console.error("Save error:", err);
      showToast("ការរក្សាទុកមានបញ្ហា: " + (err?.message || "ទំហំរូបភាពធំលើសកំណត់"));
      throw err;
    }
  };

  const handleUpdateMeetingStyle = async (meetingId: string, styleConfig: TextStyleConfig) => {
    try {
      await updateMeeting(meetingId, { styleConfig });
      showToast("បានកែប្រែទម្រង់អក្សរ & ពណ៌");
    } catch (err) {
      console.error("Style update error:", err);
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    if (confirm("តើអ្នកពិតជាចង់លុប កំណត់ហេតុប្រជុំនេះមែនទេ?")) {
      try {
        await deleteMeeting(id);
        showToast("បានលុប កំណត់ហេតុប្រជុំពី Firestore");
      } catch (err) {
        console.error("Delete error:", err);
        showToast("ការលុបមានបញ្ហា");
      }
    }
  };

  const handleResetDefaults = async () => {
    if (
      confirm(
        "តើអ្នកចង់ទាញយក និងស្តារទិន្នន័យកំណត់ហេតុដើមទាំង ៧ លើកឡើងវិញ ក្នុង Firestore មែនទេ?"
      )
    ) {
      try {
        const uid = user?.uid || "guest_user";
        const uemail = user?.email || "guest@school.gov.kh";
        await restoreDefaultMeetings(uid, uemail);
        showToast("បានស្តារកំណត់ហេតុប្រជុំដើម ៧ លើកឡើងវិញ");
      } catch (err) {
        console.error("Restore error:", err);
      }
    }
  };

  // Export HTML File
  const handleDownloadHTML = () => {
    const printableElement = document.getElementById("printable-area");
    if (!printableElement) return;

    const htmlContent = `<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <title>កំណត់ហេតុប្រជុំគណៈគ្រប់គ្រងសាលារៀន</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&display=swap');
    body { font-family: 'Battambang', Arial, sans-serif; padding: 20px; line-height: 1.8; color: #111; }
    h1, h2, h3 { text-align: center; }
    .page-break { page-break-before: always; margin-top: 30px; }
  </style>
</head>
<body>
  ${printableElement.innerHTML}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `កំណត់ហេតុប្រជុំ_${schoolInfo.schoolName.replace(/\s+/g, "_")}.html`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("បានទាញយកឯកសារ HTML រួចរាល់");
  };

  // Export Plain Text File
  const handleDownloadTXT = () => {
    const printableElement = document.getElementById("printable-area");
    if (!printableElement) return;

    const textContent = printableElement.innerText;
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `កំណត់ហេតុប្រជុំ_${schoolInfo.schoolName.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("បានរក្សាទុកជាឯកសារ TXT រួចរាល់");
  };

  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col font-khmer">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-bounce text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAddModal={handleOpenAddModal}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onPrint={handlePrint}
        onDownloadHTML={handleDownloadHTML}
        onDownloadTXT={handleDownloadTXT}
        onResetDefaults={handleResetDefaults}
        meetingCount={meetings.length}
      />

      {/* Filter and Search Bar */}
      <MeetingFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedNumber={selectedNumber}
        onSelectNumber={setSelectedNumber}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalMeetings={meetings.length}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
      />

      {/* Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-medium">កំពុងទាញយកទិន្នន័យពី Firestore...</p>
          </div>
        ) : (
          <>
            <div className={viewMode === "document" ? "block" : "hidden print:block"}>
              <PrintableDocument
                meetings={filteredMeetings}
                schoolInfo={schoolInfo}
                onEditMeeting={handleOpenEditModal}
                onDeleteMeeting={handleDeleteMeeting}
                onUpdateMeetingStyle={handleUpdateMeetingStyle}
                onPrint={handlePrint}
              />
            </div>
            <div className={viewMode === "cards" ? "block print:hidden" : "hidden"}>
              <MeetingCardsList
                meetings={filteredMeetings}
                onEditMeeting={handleOpenEditModal}
                onDeleteMeeting={handleDeleteMeeting}
                onOpenAddModal={handleOpenAddModal}
              />
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 print:hidden mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-slate-300">
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">Firebase Firestore & Authentication Enabled</span>
          </div>
          <p>
            រៀបចំដោយគណៈគ្រប់គ្រង{schoolInfo.schoolName} — ឆ្នាំសិក្សា {schoolInfo.academicYear}
          </p>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      <KhmerCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
      />

      <MeetingEditModal
        isOpen={isEditModalOpen}
        meeting={editingMeeting}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingMeeting(null);
        }}
        onSave={handleSaveMeeting}
      />

      <MeetingAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        meetings={meetings}
        schoolInfo={schoolInfo}
      />

      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        selectedNumber={selectedNumber}
        totalMeetings={meetings.length}
        onDownloadHTML={handleDownloadHTML}
        onDownloadTXT={handleDownloadTXT}
      />
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
