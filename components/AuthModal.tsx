"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LogIn, UserPlus, LogOut, ShieldCheck, UserCheck, Key, Mail, Sparkles, X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInAsGuest,
    signOutUser,
    error,
    setError,
  } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        await signInWithEmail(email, password);
      } else {
        if (!displayName.trim()) {
          setError("សូមបញ្ចូលឈ្មោះរបស់អ្នក");
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password, displayName);
      }
      onClose();
    } catch (err) {
      // handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err) {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      await signInAsGuest();
      onClose();
    } catch (err) {
      // handled
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-sky-900 text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner border border-white/20">
            <ShieldCheck className="w-7 h-7 text-sky-300" />
          </div>
          <h2 className="text-xl font-bold font-khmer">
            {user ? "គណនីអ្នកប្រើប្រាស់" : "ចូលប្រើប្រាស់ប្រព័ន្ធ (Auth)"}
          </h2>
          <p className="text-xs text-sky-200/80 mt-1">
            {user
              ? "ភ្ជាប់ជាមួយ Firebase Auth & Firestore Real-time DB"
              : "គ្រប់គ្រង និងរក្សាទុកកំណត់ហេតុប្រជុំក្នុង Firestore"}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {user ? (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto font-bold text-2xl mb-2 border-2 border-blue-200">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
                </div>
                <h3 className="font-semibold text-slate-800 text-base">
                  {user.displayName || "អ្នកប្រើប្រាស់ (User)"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{user.email || "Guest Session"}</p>
                <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200/60">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>ភ្ជាប់ Firebase Authenticated</span>
                </div>
              </div>

              <button
                onClick={async () => {
                  await signOutUser();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-50 text-rose-700 hover:bg-rose-100 font-medium text-sm rounded-xl transition border border-rose-200"
              >
                <LogOut className="w-4 h-4" />
                <span>ចាកចេញពីគណនី (Sign Out)</span>
              </button>
            </div>
          ) : (
            <div>
              {/* Error display */}
              {error && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                  <span>{error}</span>
                </div>
              )}

              {/* Mode Switcher */}
              <div className="flex bg-slate-100 p-1 rounded-xl mb-5 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                  className={`flex-1 py-2 rounded-lg transition ${
                    mode === "login"
                      ? "bg-white text-blue-900 shadow-sm font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  ចូលប្រព័ន្ធ (Sign In)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                  }}
                  className={`flex-1 py-2 rounded-lg transition ${
                    mode === "signup"
                      ? "bg-white text-blue-900 shadow-sm font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  បង្កើតគណនី (Sign Up)
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === "signup" && (
                  <div>
                    <label htmlFor="auth-display-name" className="block text-xs font-medium text-slate-700 mb-1">
                      ឈ្មោះពេញ (Display Name)
                    </label>
                    <input
                      id="auth-display-name"
                      name="displayName"
                      type="text"
                      required
                      autoComplete="name"
                      suppressHydrationWarning
                      placeholder="ឧ. លោក សុខ សារើន"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="auth-email-input" className="block text-xs font-medium text-slate-700 mb-1">
                    អុីមែល (Email)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="auth-email-input"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      suppressHydrationWarning
                      placeholder="name@school.edu.kh"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="auth-password-input" className="block text-xs font-medium text-slate-700 mb-1">
                    ពាក្យសម្ងាត់ (Password)
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="auth-password-input"
                      name="password"
                      type="password"
                      required
                      minLength={6}
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      suppressHydrationWarning
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-900 hover:bg-blue-800 text-white font-medium text-sm rounded-xl transition shadow-md shadow-blue-900/10 disabled:opacity-60"
                >
                  {mode === "login" ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  <span>{mode === "login" ? "ចូលប្រព័ន្ធ" : "ចុះឈ្មោះគណនី"}</span>
                </button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-slate-400 font-medium">ឬជ្រើសរើស</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-xl transition"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={handleGuest}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>ចូលជាភ្ញៀវ (Guest)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
