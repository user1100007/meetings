import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 font-khmer p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-sm">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">
        រកមិនឃើញទំព័រនេះទេ (404 Not Found)
      </h2>
      <p className="text-xs text-slate-500 max-w-md mb-6">
        ទំព័រដែលលោកអ្នកកំពុងស្វែងរកប្រហែលជាត្រូវបានផ្លាស់ប្តូរ ឬលុបចេញពីប្រព័ន្ធ។
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>ត្រឡប់ទៅកាន់ទំព័រដើម</span>
      </Link>
    </div>
  );
}
