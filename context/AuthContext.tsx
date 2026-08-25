"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOutUser: () => Promise<void>;
  error: string | null;
  setError: (err: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signInAsGuest: async () => {},
  signOutUser: async () => {},
  error: null,
  setError: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Sync user profile to Firestore users collection gracefully
        try {
          const userRef = doc(db, "users", currentUser.uid);
          // Use setDoc with merge: true so it works even if getDoc is delayed or offline
          await setDoc(
            userRef,
            {
              uid: currentUser.uid,
              email: currentUser.email || "guest@school.gov.kh",
              displayName: currentUser.displayName || "អ្នកប្រើប្រាស់ (Guest)",
              role: "secretary",
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        } catch (e) {
          // In offline or intermittent mode, Firestore SDK queues the write locally
          console.warn("Notice syncing user profile to Firestore (queued locally if offline):", e);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      setError(err.message || "មិនអាចចូលប្រើប្រាស់តាម Google បានទេ");
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      console.error("Email Sign-In Error:", err);
      let msg = "ការចូលប្រើប្រាស់បរាជ័យ";
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        msg = "អុីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ";
      } else if (err.code === "auth/user-not-found") {
        msg = "រកមិនឃើញគណនីនេះទេ";
      }
      setError(msg);
      throw new Error(msg);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    setError(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        await updateProfile(res.user, { displayName: name });
      }
    } catch (err: any) {
      console.error("Email Sign-Up Error:", err);
      let msg = "ការបង្កើតគណនីបរាជ័យ";
      if (err.code === "auth/email-already-in-use") {
        msg = "អុីមែលនេះត្រូវបានប្រើប្រាស់រួចហើយ";
      } else if (err.code === "auth/weak-password") {
        msg = "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៦ តួអក្សរ";
      }
      setError(msg);
      throw new Error(msg);
    }
  };

  const signInAsGuest = async () => {
    setError(null);
    try {
      await signInAnonymously(auth);
    } catch (err: any) {
      console.error("Guest Sign-In Error:", err);
      setError("មិនអាចចូលជាភ្ញៀវបានទេ");
      throw err;
    }
  };

  const signOutUser = async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error("Sign-Out Error:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInAsGuest,
        signOutUser,
        error,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
