export interface AgendaItem {
  id: string;
  text: string;
}

export interface DecisionItem {
  id: string;
  text: string;
}

export interface MeetingTableRow {
  id?: string;
  cells: string[];
}

export interface MeetingTable {
  id: string;
  title: string;
  headers: string[];
  rows: MeetingTableRow[];
}

export interface MeetingAttendee {
  id: string;
  name: string; // គោត្តនាម នាម
  gender: "ប្រុស" | "ស្រី" | string; // ភេទ
  role: string; // ភារកិច្ច / តួនាទី
  organization: string; // អង្គភាព
  phone: string; // លេខទូរស័ព្ទ
  signature?: string; // Digital signature image data / stamp / text
  remarks?: string; // សេចក្ដីបញ្ជាក់ផ្សេងៗ
}

export interface MeetingPhoto {
  id: string;
  url: string;
  storagePath?: string;
  caption?: string;
  width?: "small" | "medium" | "large" | "full";
  activityIndex?: number | null; // Null or undefined for general photos, 0, 1, 2... for specific activity/decision point
  activityTitle?: string;
}

export interface MeetingAttachment {
  id: string;
  name: string;
  url: string;
  storagePath?: string;
  fileType: "pdf" | "image" | "doc" | "other";
  mimeType: string;
  size: number;
  uploadedAt: number;
  description?: string;
}

export interface TextStyleConfig {
  fontSize?: number; // in px, e.g. 14, 15, 16, 18
  textAlign?: "left" | "center" | "right" | "justify";
  color?: string; // hex color e.g. #000000, #1e3a8a
  backgroundColor?: string;
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  textDecoration?: "none" | "underline";
}

export interface MeetingDoc {
  id: string;
  schoolName: string;
  district: string;
  academicYear: string;
  meetingPlace: string;
  meetingChair: string;
  minuteTaker: string;
  meetingNumber: number; // 1 to 7 or custom
  title: string;
  date: string;
  time: string;
  participants: string;
  introParagraph?: string;
  agenda: string[];
  decisions: string[];
  aiSummary?: string;
  tables?: MeetingTable[];
  photos?: MeetingPhoto[];
  photoLayout?: "grid-1" | "grid-2" | "grid-3" | "grid-4";
  attendees?: MeetingAttendee[];
  attachments?: MeetingAttachment[];
  customNotes?: string;
  styleConfig?: TextStyleConfig;
  userId: string;
  userEmail?: string;
  userName?: string;
  createdAt: number;
  updatedAt: number;
}

export interface SchoolInfo {
  schoolName: string;
  district: string;
  academicYear: string;
  meetingPlace: string;
  meetingChair: string;
  minuteTaker: string;
}

