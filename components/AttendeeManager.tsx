"use client";

import React, { useState, useRef } from "react";
import { MeetingAttendee } from "@/types/meeting";
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  PenTool,
  Check,
  X,
  Phone,
  Building2,
  Briefcase,
  UserCheck,
  RotateCcw,
  Sparkles,
  Download,
  Upload,
} from "lucide-react";
import { toKhmerDigits } from "@/lib/khmerDateUtils";

interface AttendeeManagerProps {
  attendees: MeetingAttendee[];
  schoolName?: string;
  onChange: (attendees: MeetingAttendee[]) => void;
}

export const AttendeeManager: React.FC<AttendeeManagerProps> = ({
  attendees,
  schoolName = "សាលាបឋមសិក្សា រោគ",
  onChange,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [signingAttendee, setSigningAttendee] = useState<MeetingAttendee | null>(null);
  const [signatureData, setSignatureData] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // New Attendee Form State
  const [newAttendee, setNewAttendee] = useState<Omit<MeetingAttendee, "id">>({
    name: "",
    gender: "ស្រី",
    role: "លោកគ្រូ / អ្នកគ្រូ",
    organization: schoolName,
    phone: "",
    signature: "",
    remarks: "ចូលរួមពេញលេញ",
  });

  const handleAddAttendee = () => {
    if (!newAttendee.name.trim()) return;

    const created: MeetingAttendee = {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: newAttendee.name.trim(),
      gender: newAttendee.gender || "ស្រី",
      role: newAttendee.role.trim() || "សមាជិក",
      organization: newAttendee.organization.trim() || schoolName,
      phone: toKhmerDigits(newAttendee.phone.trim()),
      signature: newAttendee.signature || "ឌីជីថល (បានចុះហត្ថលេខា)",
      remarks: newAttendee.remarks?.trim() || "",
    };

    onChange([...attendees, created]);

    // Reset Form
    setNewAttendee({
      name: "",
      gender: "ស្រី",
      role: "លោកគ្រូ / អ្នកគ្រូ",
      organization: schoolName,
      phone: "",
      signature: "",
      remarks: "",
    });
  };

  const handleRemove = (id: string) => {
    onChange(attendees.filter((a) => a.id !== id));
  };

  const handleUpdate = (id: string, updatedFields: Partial<MeetingAttendee>) => {
    onChange(
      attendees.map((a) => (a.id === id ? { ...a, ...updatedFields } : a))
    );
  };

  const handleLoadSampleAttendees = () => {
    const sampleList: MeetingAttendee[] = [
      {
        id: `att_sample_1`,
        name: "សុខ សារើន",
        gender: "ស្រី",
        role: "នាយិកាសាលា / ប្រធានអង្គប្រជុំ",
        organization: schoolName,
        phone: "០១២ ៣៤៥ ៦៧៨",
        signature: "សុខ សារើន (Digital)",
        remarks: "ចូលរួមដឹកនាំអង្គប្រជុំ",
      },
      {
        id: `att_sample_2`,
        name: "អ៊ុន ប៊ុនទុង",
        gender: "ប្រុស",
        role: "គ្រូបង្រៀន / លេខាកត់ត្រា",
        organization: schoolName,
        phone: "០៩៧ ៨៨៨ ៩៩៩",
        signature: "អ៊ុន ប៊ុនទុង (Digital)",
        remarks: "កត់ត្រាកំណត់ហេតុ",
      },
      {
        id: `att_sample_3`,
        name: "ស៊ូ គិន",
        gender: "ប្រុស",
        role: "ប្រធានគណៈកម្មាធិការគ្រប់គ្រង (គ.គ.ស)",
        organization: "សហគមន៍ភូមិ",
        phone: "០៨៨ ៧៦៥ ៤៣២",
        signature: "ស៊ូ គិន (Digital)",
        remarks: "ចូលរួមពេញលេញ",
      },
      {
        id: `att_sample_4`,
        name: "យិន សាវី",
        gender: "ប្រុស",
        role: "គ្រូបង្រៀនថ្នាក់ទី៦",
        organization: schoolName,
        phone: "០៩២ ១១២ ២៣៣",
        signature: "យិន សាវី (Digital)",
        remarks: "ចូលរួមពេញលេញ",
      },
      {
        id: `att_sample_5`,
        name: "ម៉ានីតា",
        gender: "ស្រី",
        role: "តំណាងអង្គការដៃគូអភិវឌ្ឍន៍",
        organization: "អង្គការដៃគូសង្គ្រោះ",
        phone: "០១៥ ៤៤៥ ៥៦៦",
        signature: "ម៉ានីតា (Digital)",
        remarks: "ចូលរួមពេញលេញ",
      },
      {
        id: `att_sample_6`,
        name: "សាន វណ្ណា",
        gender: "ស្រី",
        role: "តំណាងមាតាបិតា / អាណាព្យាបាល",
        organization: "សហគមន៍",
        phone: "០៧០ ៩៩៨ ៨៧៧",
        signature: "សាន វណ្ណា (Digital)",
        remarks: "ចូលរួមពេញលេញ",
      },
    ];

    onChange(sampleList);
  };

  // Canvas drawing functions for digital signature
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = ("clientX" in e ? e.clientX : e.touches[0].clientX) - rect.left;
    const y = ("clientY" in e ? e.clientY : e.touches[0].clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1e3a8a"; // dark blue signature ink
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ("clientX" in e ? e.clientX : e.touches[0].clientX) - rect.left;
    const y = ("clientY" in e ? e.clientY : e.touches[0].clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL("image/png"));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData("");
  };

  const saveSignature = () => {
    if (signingAttendee && signatureData) {
      handleUpdate(signingAttendee.id, { signature: signatureData });
      setSigningAttendee(null);
      setSignatureData("");
    }
  };

  return (
    <div className="space-y-6 font-khmer">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            បញ្ជីវត្តមានអ្នកចូលរួមប្រជុំ (Meeting Attendance List)
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            ចំនួនអ្នកចូលរួមសរុប៖{" "}
            <span className="font-bold text-indigo-700">
              {toKhmerDigits(attendees.length)} នាក់
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {attendees.length === 0 && (
            <button
              type="button"
              onClick={handleLoadSampleAttendees}
              className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-3 py-1.5 rounded-xl border border-indigo-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="បញ្ចូលបញ្ជីវត្តមានគំរូស្រាប់"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>បញ្ចូលបញ្ជីគំរូ</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Attendee Input Form */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 shadow-2xs">
        <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-emerald-600" />
          <span>បន្ថែមអ្នកចូលរួមថ្មី (Add Attendee)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              គោត្តនាម - នាម <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={newAttendee.name}
              onChange={(e) => setNewAttendee({ ...newAttendee, name: e.target.value })}
              placeholder="ឧ. សុខ សារើន"
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              ភេទ
            </label>
            <select
              value={newAttendee.gender}
              onChange={(e) => setNewAttendee({ ...newAttendee, gender: e.target.value })}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ស្រី">ស្រី</option>
              <option value="ប្រុស">ប្រុស</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              តួនាទី / ភារកិច្ច
            </label>
            <input
              type="text"
              value={newAttendee.role}
              onChange={(e) => setNewAttendee({ ...newAttendee, role: e.target.value })}
              placeholder="ឧ. នាយិកា / គ្រូបង្រៀន / សមាជិក"
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              អង្គភាព / សាលា
            </label>
            <input
              type="text"
              value={newAttendee.organization}
              onChange={(e) => setNewAttendee({ ...newAttendee, organization: e.target.value })}
              placeholder={schoolName}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              លេខទូរស័ព្ទ
            </label>
            <input
              type="text"
              value={newAttendee.phone}
              onChange={(e) => setNewAttendee({ ...newAttendee, phone: e.target.value })}
              placeholder="ឧ. ០១២ ៣៤៥ ៦៧៨"
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              សេចក្ដីបញ្ជាក់ / ផ្សេងៗ
            </label>
            <input
              type="text"
              value={newAttendee.remarks}
              onChange={(e) => setNewAttendee({ ...newAttendee, remarks: e.target.value })}
              placeholder="ឧ. ចូលរួមពេញលេញ / មានមតិយោបល់"
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleAddAttendee}
              disabled={!newAttendee.name.trim()}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>បន្ថែមក្នុងបញ្ជី</span>
            </button>
          </div>
        </div>
      </div>

      {/* Attendees Table Display */}
      {attendees.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50">
          <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 text-xs font-medium">មិនទាន់មានអ្នកចូលរួមនៅក្នុងបញ្ជីវត្តមាននៅឡើយទេ</p>
          <button
            type="button"
            onClick={handleLoadSampleAttendees}
            className="mt-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl transition shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>បញ្ចូលបញ្ជីគំរូ ៦ នាក់</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-2xs">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                <th className="py-2.5 px-3 text-center w-12 border-r border-slate-200">ល.រ</th>
                <th className="py-2.5 px-3 border-r border-slate-200 min-w-[140px]">គោត្តនាម-នាម</th>
                <th className="py-2.5 px-2 text-center w-14 border-r border-slate-200">ភេទ</th>
                <th className="py-2.5 px-3 border-r border-slate-200 min-w-[140px]">តួនាទី / ភារកិច្ច</th>
                <th className="py-2.5 px-3 border-r border-slate-200 min-w-[120px]">អង្គភាព</th>
                <th className="py-2.5 px-3 border-r border-slate-200 w-28">លេខទូរស័ព្ទ</th>
                <th className="py-2.5 px-3 border-r border-slate-200 text-center w-32">ហត្ថលេខា(digital)</th>
                <th className="py-2.5 px-3 border-r border-slate-200 min-w-[100px]">ផ្សេងៗ</th>
                <th className="py-2.5 px-2 text-center w-20">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {attendees.map((attendee, idx) => {
                const isEditing = editingId === attendee.id;

                return (
                  <tr key={attendee.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 text-center font-bold text-slate-600 border-r border-slate-200">
                      {toKhmerDigits(idx + 1)}
                    </td>

                    {/* Name */}
                    <td className="py-2 px-3 border-r border-slate-200">
                      {isEditing ? (
                        <input
                          type="text"
                          value={attendee.name}
                          onChange={(e) => handleUpdate(attendee.id, { name: e.target.value })}
                          className="w-full px-2 py-1 border border-indigo-400 rounded text-xs"
                        />
                      ) : (
                        <span className="font-bold text-slate-900">{attendee.name}</span>
                      )}
                    </td>

                    {/* Gender */}
                    <td className="py-2 px-2 text-center border-r border-slate-200">
                      {isEditing ? (
                        <select
                          value={attendee.gender}
                          onChange={(e) => handleUpdate(attendee.id, { gender: e.target.value })}
                          className="px-1 py-1 border border-indigo-400 rounded text-xs"
                        >
                          <option value="ស្រី">ស្រី</option>
                          <option value="ប្រុស">ប្រុស</option>
                        </select>
                      ) : (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          attendee.gender === "ស្រី" ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-blue-700"
                        }`}>
                          {attendee.gender}
                        </span>
                      )}
                    </td>

                    {/* Role */}
                    <td className="py-2 px-3 border-r border-slate-200">
                      {isEditing ? (
                        <input
                          type="text"
                          value={attendee.role}
                          onChange={(e) => handleUpdate(attendee.id, { role: e.target.value })}
                          className="w-full px-2 py-1 border border-indigo-400 rounded text-xs"
                        />
                      ) : (
                        <span className="text-slate-700">{attendee.role}</span>
                      )}
                    </td>

                    {/* Organization */}
                    <td className="py-2 px-3 border-r border-slate-200">
                      {isEditing ? (
                        <input
                          type="text"
                          value={attendee.organization}
                          onChange={(e) => handleUpdate(attendee.id, { organization: e.target.value })}
                          className="w-full px-2 py-1 border border-indigo-400 rounded text-xs"
                        />
                      ) : (
                        <span className="text-slate-600">{attendee.organization}</span>
                      )}
                    </td>

                    {/* Phone */}
                    <td className="py-2 px-3 border-r border-slate-200">
                      {isEditing ? (
                        <input
                          type="text"
                          value={attendee.phone}
                          onChange={(e) => handleUpdate(attendee.id, { phone: e.target.value })}
                          className="w-full px-2 py-1 border border-indigo-400 rounded text-xs"
                        />
                      ) : (
                        <span className="font-mono text-slate-700">{toKhmerDigits(attendee.phone) || "-"}</span>
                      )}
                    </td>

                    {/* Digital Signature */}
                    <td className="py-2 px-3 border-r border-slate-200 text-center">
                      {attendee.signature && attendee.signature.startsWith("data:image") ? (
                        <div className="flex items-center justify-center gap-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={attendee.signature}
                            alt="Digital Signature"
                            className="max-h-7 max-w-[80px] object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setSigningAttendee(attendee);
                              setSignatureData("");
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                            title="គូសហត្ថលេខាឡើងវិញ"
                          >
                            <PenTool className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-[11px] font-semibold text-emerald-700 italic">
                            {attendee.signature || "ឌីជីថល (ឯកភាព)"}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSigningAttendee(attendee);
                              setSignatureData("");
                            }}
                            className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                            title="គូសហត្ថលេខាដោយដៃ"
                          >
                            <PenTool className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Remarks */}
                    <td className="py-2 px-3 border-r border-slate-200">
                      {isEditing ? (
                        <input
                          type="text"
                          value={attendee.remarks || ""}
                          onChange={(e) => handleUpdate(attendee.id, { remarks: e.target.value })}
                          className="w-full px-2 py-1 border border-indigo-400 rounded text-xs"
                        />
                      ) : (
                        <span className="text-slate-500 italic">{attendee.remarks || "-"}</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {isEditing ? (
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="រក្សាទុកការកែប្រែ"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setEditingId(attendee.id)}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                            title="កែសម្រួល"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemove(attendee.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="លុប"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Signature Modal */}
      {signingAttendee && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h5 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <PenTool className="w-4 h-4 text-indigo-600" />
                គូសហត្ថលេខាឌីជីថល៖ {signingAttendee.name}
              </h5>
              <button
                type="button"
                onClick={() => setSigningAttendee(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              សូមប្រើប្រាស់ម្រាមដៃ ឬ Mouse ដើម្បីគូសហត្ថលេខាលើប្រអប់ខាងក្រោម៖
            </p>

            <div className="border-2 border-dashed border-indigo-300 rounded-xl bg-slate-50 p-1">
              <canvas
                ref={canvasRef}
                width={360}
                height={160}
                className="w-full h-40 bg-white rounded-lg cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={clearCanvas}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-medium flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>លុបគូសឡើងវិញ</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSigningAttendee(null)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-xl font-medium cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="button"
                  onClick={saveSignature}
                  disabled={!signatureData}
                  className="px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>យល់ព្រមហត្ថលេខា</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
