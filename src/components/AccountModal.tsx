import React, { useState } from "react";
import { type User, signOut } from "firebase/auth";
import {
  X,
  User as UserIcon,
  LogOut,
  Mail,
  ShieldCheck,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { auth } from "../lib/firebase";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  logo: React.ReactNode;
}

export function AccountModal({ isOpen, onClose, user, logo }: AccountModalProps) {
  const { t, i18n } = useTranslation();
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);

  if (!isOpen || !user) return null;

  const handleLogoutConfirm = async () => {
    setLoadingLogout(true);
    try {
      await signOut(auth);
      setShowConfirmLogout(false);
      onClose();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoadingLogout(false);
    }
  };

  const handleClose = () => {
    setShowConfirmLogout(false);
    onClose();
  };

  const localeMap: Record<string, string> = {
    es: "es-ES",
    en: "en-US",
    pt: "pt-BR",
    it: "it-IT",
    fr: "fr-FR",
  };
  const langKey = i18n.language ? i18n.language.substring(0, 2) : "en";
  const currentLocale = localeMap[langKey] || "en-US";

  const createdAt = user.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString(currentLocale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Reciente";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fade-in">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-gradient-to-tr from-blue-500/20 via-emerald-400/20 to-indigo-500/20 rounded-full blur-3xl opacity-80" />
      </div>

      <div className="relative z-10 w-full max-w-md glass-panel rounded-3xl p-7 border border-slate-200/90 shadow-2xl bg-white/95 text-slate-800">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label={t("account.cancel")}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header with Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="scale-90">{logo}</div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">{t("account.title")}</h2>
        </div>

        {!showConfirmLogout ? (
          /* Account Details View */
          <div className="space-y-5">
            {/* User Profile Card */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || t("account.userDefault")}
                  className="h-14 w-14 rounded-full object-cover border-2 border-blue-500/30 shadow-sm"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                  <UserIcon className="h-7 w-7" />
                </div>
              )}
              <div className="overflow-hidden text-left">
                <h3 className="text-base font-bold text-slate-900 truncate">
                  {user.displayName || t("account.userDefault")}
                </h3>
                <p className="text-xs text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span>{user.email || "—"}</span>
                </p>
              </div>
            </div>

            {/* Info details */}
            <div className="space-y-2.5 text-left text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <span className="text-slate-500 flex items-center gap-2 font-medium">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  {t("account.statusLabel")}
                </span>
                <span className="font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                  {t("account.statusActive")}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <span className="text-slate-500 flex items-center gap-2 font-medium">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  {t("account.memberSince")}
                </span>
                <span className="font-semibold text-slate-700">{createdAt}</span>
              </div>
            </div>

            {/* Logout Button */}
            <div className="pt-2">
              <button
                onClick={() => setShowConfirmLogout(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs tracking-wide uppercase transition border border-rose-200/80"
              >
                <LogOut className="h-4 w-4" />
                <span>{t("header.logout")}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Confirmation Dialog */
          <div className="py-2 text-center animate-fade-in">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{t("account.confirmLogoutTitle")}</h3>
            <p className="mt-1.5 text-xs text-slate-600 max-w-xs mx-auto">
              {t("account.confirmLogoutText")}
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmLogout(false)}
                disabled={loadingLogout}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
              >
                {t("account.cancel")}
              </button>
              <button
                type="button"
                onClick={handleLogoutConfirm}
                disabled={loadingLogout}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 text-xs font-semibold text-white hover:bg-rose-700 transition shadow-md disabled:opacity-50"
              >
                {loadingLogout ? t("account.loggingOut") : t("account.accept")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
