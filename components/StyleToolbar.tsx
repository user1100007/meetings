"use client";

import React from "react";
import { TextStyleConfig } from "@/types/meeting";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Type,
  Palette,
  Minus,
  Plus,
  RotateCcw,
} from "lucide-react";

interface StyleToolbarProps {
  styleConfig: TextStyleConfig;
  onChange: (config: TextStyleConfig) => void;
  inlineMode?: boolean;
}

const COLOR_PRESETS = [
  { name: "ខ្មៅស្តង់ដារ", value: "#0f172a" },
  { name: "ខៀវដិត", value: "#1e3a8a" },
  { name: "ខៀវរាជការ", value: "#1d4ed8" },
  { name: "ក្រហមក្រមៅ", value: "#881337" },
  { name: "បៃតងចាស់", value: "#14532d" },
  { name: "ប្រផេះដិត", value: "#334155" },
];

export const StyleToolbar: React.FC<StyleToolbarProps> = ({
  styleConfig,
  onChange,
  inlineMode = false,
}) => {
  const currentSize = styleConfig.fontSize || 15;
  const currentAlign = styleConfig.textAlign || "justify";
  const currentColor = styleConfig.color || "#0f172a";
  const currentWeight = styleConfig.fontWeight || "normal";
  const currentFontStyle = styleConfig.fontStyle || "normal";
  const currentDecoration = styleConfig.textDecoration || "none";

  const handleSizeChange = (delta: number) => {
    const newSize = Math.max(11, Math.min(26, currentSize + delta));
    onChange({ ...styleConfig, fontSize: newSize });
  };

  const handleAlign = (align: "left" | "center" | "right" | "justify") => {
    onChange({ ...styleConfig, textAlign: align });
  };

  const handleColor = (color: string) => {
    onChange({ ...styleConfig, color });
  };

  const toggleBold = () => {
    onChange({
      ...styleConfig,
      fontWeight: currentWeight === "bold" ? "normal" : "bold",
    });
  };

  const toggleItalic = () => {
    onChange({
      ...styleConfig,
      fontStyle: currentFontStyle === "italic" ? "normal" : "italic",
    });
  };

  const toggleUnderline = () => {
    onChange({
      ...styleConfig,
      textDecoration: currentDecoration === "underline" ? "none" : "underline",
    });
  };

  const resetDefaults = () => {
    onChange({
      fontSize: 15,
      textAlign: "justify",
      color: "#0f172a",
      fontWeight: "normal",
      fontStyle: "normal",
      textDecoration: "none",
    });
  };

  if (inlineMode) {
    return (
      <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs print:hidden shadow-2xs">
        {/* Alignment */}
        <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => handleAlign("left")}
            className={`p-1.5 rounded ${
              currentAlign === "left" ? "bg-indigo-100 text-indigo-700 font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
            title="តម្រឹមឆ្វេង"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleAlign("center")}
            className={`p-1.5 rounded ${
              currentAlign === "center" ? "bg-indigo-100 text-indigo-700 font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
            title="តម្រឹមកណ្តាល"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleAlign("right")}
            className={`p-1.5 rounded ${
              currentAlign === "right" ? "bg-indigo-100 text-indigo-700 font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
            title="តម្រឹមស្តាំ"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleAlign("justify")}
            className={`p-1.5 rounded ${
              currentAlign === "justify" ? "bg-indigo-100 text-indigo-700 font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
            title="តម្រឹមស្មើមុខក្រោយ (Justify)"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>

        {/* Font Size */}
        <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => handleSizeChange(-1)}
            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
            title="បន្ថយទំហំអក្សរ"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 text-xs font-semibold text-slate-700 min-w-[32px] text-center">
            {currentSize}px
          </span>
          <button
            type="button"
            onClick={() => handleSizeChange(1)}
            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
            title="បន្ថែមទំហំអក្សរ"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Font Styles */}
        <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={toggleBold}
            className={`p-1.5 rounded ${
              currentWeight === "bold" ? "bg-indigo-100 text-indigo-700" : "text-slate-600 hover:text-slate-900"
            }`}
            title="អក្សរដិត"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={toggleItalic}
            className={`p-1.5 rounded ${
              currentFontStyle === "italic" ? "bg-indigo-100 text-indigo-700" : "text-slate-600 hover:text-slate-900"
            }`}
            title="អក្សរទ្រេត"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={toggleUnderline}
            className={`p-1.5 rounded ${
              currentDecoration === "underline" ? "bg-indigo-100 text-indigo-700" : "text-slate-600 hover:text-slate-900"
            }`}
            title="គូសបន្ទាត់ក្រោម"
          >
            <Underline className="w-4 h-4" />
          </button>
        </div>

        {/* Color presets */}
        <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-slate-200">
          <Palette className="w-3.5 h-3.5 text-slate-400" />
          <div className="flex items-center gap-1">
            {COLOR_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => handleColor(p.value)}
                style={{ backgroundColor: p.value }}
                className={`w-4 h-4 rounded-full transition-transform ${
                  currentColor.toLowerCase() === p.value.toLowerCase()
                    ? "ring-2 ring-indigo-500 scale-110"
                    : "opacity-80 hover:opacity-100"
                }`}
                title={p.name}
              />
            ))}
          </div>
          <input
            type="color"
            value={currentColor}
            onChange={(e) => handleColor(e.target.value)}
            className="w-5 h-5 cursor-pointer rounded border-0 bg-transparent p-0"
            title="ជ្រើសពណ៌ផ្ទាល់ខ្លួន"
          />
        </div>

        <button
          type="button"
          onClick={resetDefaults}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition-colors ml-auto"
          title="កំណត់ទម្រង់ដើមវិញ"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Type className="w-5 h-5 text-indigo-600" />
          ការកំណត់ទម្រង់អក្សរ & ពណ៌ (Text Styling & Color)
        </h4>
        <p className="text-xs text-slate-500 mt-0.5">
          អ្នកអាចបន្ថែម/បន្ថយទំហំអក្សរ តម្រឹមអក្សរ (ឆ្វេង កណ្តាល ស្តាំ ស្មើ) និងប្តូរពណ៌តាមតម្រូវការ
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200">
        {/* Alignment */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">តម្រឹមអក្សរ (Text Alignment)</label>
          <div className="grid grid-cols-4 gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => handleAlign("left")}
              className={`py-2 px-3 rounded-lg text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                currentAlign === "left" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <AlignLeft className="w-4 h-4" />
              <span>ឆ្វេង</span>
            </button>
            <button
              type="button"
              onClick={() => handleAlign("center")}
              className={`py-2 px-3 rounded-lg text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                currentAlign === "center" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <AlignCenter className="w-4 h-4" />
              <span>កណ្តាល</span>
            </button>
            <button
              type="button"
              onClick={() => handleAlign("right")}
              className={`py-2 px-3 rounded-lg text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                currentAlign === "right" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <AlignRight className="w-4 h-4" />
              <span>ស្តាំ</span>
            </button>
            <button
              type="button"
              onClick={() => handleAlign("justify")}
              className={`py-2 px-3 rounded-lg text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                currentAlign === "justify" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <AlignJustify className="w-4 h-4" />
              <span>ស្មើមុខក្រោយ</span>
            </button>
          </div>
        </div>

        {/* Font Size */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">ទំហំអក្សរ (Font Size)</label>
          <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => handleSizeChange(-1)}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="flex-1 text-center">
              <span className="text-lg font-bold text-indigo-900">{currentSize} px</span>
              <p className="text-[11px] text-slate-400">ទំហំស្តង់ដារបោះពុម្ព A4: 14 - 16px</p>
            </div>
            <button
              type="button"
              onClick={() => handleSizeChange(1)}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Font Color */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">ប្តូរពណ៌អក្សរ (Text Color)</label>
          <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center gap-2">
            {COLOR_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => handleColor(p.value)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                  currentColor.toLowerCase() === p.value.toLowerCase()
                    ? "border-indigo-600 bg-indigo-50 text-indigo-950 font-bold shadow-2xs"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-black/10"
                  style={{ backgroundColor: p.value }}
                />
                {p.name}
              </button>
            ))}
            <div className="flex items-center gap-1.5 ml-auto pl-2 border-l border-slate-200">
              <span className="text-[11px] text-slate-500">ពណ៌ផ្សេង៖</span>
              <input
                type="color"
                value={currentColor}
                onChange={(e) => handleColor(e.target.value)}
                className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* Text Decoration */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">ទម្រង់អក្សរពិសេស (Styles)</label>
          <div className="grid grid-cols-3 gap-2 bg-white p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={toggleBold}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                currentWeight === "bold" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Bold className="w-4 h-4" />
              អក្សរដិត
            </button>
            <button
              type="button"
              onClick={toggleItalic}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                currentFontStyle === "italic" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Italic className="w-4 h-4" />
              អក្សរទ្រេត
            </button>
            <button
              type="button"
              onClick={toggleUnderline}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                currentDecoration === "underline" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Underline className="w-4 h-4" />
              គូសបន្ទាត់ក្រោម
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
