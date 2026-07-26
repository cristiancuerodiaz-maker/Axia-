import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { auth, googleProvider, db } from "../lib/firebase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  logo: React.ReactNode;
}

export function AuthModal({ isOpen, onClose, logo }: AuthModalProps) {
  const { t } = useTranslation();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const saveUserToFirestore = async (
    uid: string,
    userEmail: string | null,
    displayName: string | null,
  ) => {
    try {
      await setDoc(
        doc(db, "users", uid),
        {
          uid,
          email: userEmail || "",
          displayName: displayName || "",
          createdAt: new Date().toISOString(),
        },
        { merge: true },
      );
    } catch (err) {
      console.error("Error saving user to Firestore:", err);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!acceptTerms) {
      setError(t("auth.errorTerms"));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await saveUserToFirestore(user.uid, user.email, user.displayName);
      setLoading(false);
      onClose();
    } catch (err: unknown) {
      console.error("Google Auth Error:", err);
      const errorMessage = err instanceof Error ? err.message : "Error with Google Auth.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-between min-h-screen w-full bg-slate-50 text-foreground overflow-y-auto animate-fade-in">
      {/* Background ambient lighting effects matching the app */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-blue-500/20 via-emerald-400/20 to-indigo-500/20 rounded-full blur-3xl opacity-80" />
      </div>

      {/* Header - Back Button */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-6">
        <button
          onClick={onClose}
          className="flex items-center gap-2 rounded-full glass-pill px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition hover:bg-white/80 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("header.backHome")}</span>
        </button>
      </header>

      {/* Main Container - Full Screen Centered */}
      <main className="relative z-10 my-auto mx-auto flex w-full max-w-md flex-col items-center px-6 py-12 text-center">
        {/* Logo */}
        <div className="mb-3">{logo}</div>

        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          {t("auth.welcome")}
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-xs leading-relaxed">{t("auth.subtitle")}</p>

        {/* Auth Content directly on background */}
        <div className="mt-8 w-full space-y-5">
          {error && (
            <div className="flex items-center gap-2.5 rounded-2xl bg-rose-50/90 backdrop-blur-md border border-rose-200 p-3.5 text-xs text-rose-700 text-left shadow-sm">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Provider Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-full border border-slate-200/90 bg-white/80 backdrop-blur-md text-sm font-semibold text-slate-800 hover:bg-white hover:border-slate-300 transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
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
            <span>{loading ? t("auth.signingIn") : t("auth.continueGoogle")}</span>
          </button>

          {/* Terms and Conditions Checkbox */}
          <div className="pt-2 text-center">
            <label className="inline-flex items-start gap-3 cursor-pointer group text-left">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => {
                  setAcceptTerms(e.target.checked);
                  if (e.target.checked) setError(null);
                }}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                {t("auth.acceptTerms1")}
                <span className="text-blue-600 font-semibold underline">{t("auth.termsLink")}</span>
                {t("auth.acceptTerms2")}
                <span className="text-blue-600 font-semibold underline">
                  {t("auth.privacyLink")}
                </span>
                {t("auth.acceptTerms3")}
              </span>
            </label>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-slate-400">
        © 2026 AXIA Build · Intelligence by Design
      </footer>
    </div>
  );
}
