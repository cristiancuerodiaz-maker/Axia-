import React from "react";
import { X, Check, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  logo: React.ReactNode;
}

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
];

export function LanguageModal({ isOpen, onClose, logo }: LanguageModalProps) {
  const { t, i18n } = useTranslation();

  if (!isOpen) return null;

  const currentLang = i18n.language || "en";

  const handleSelect = (code: string) => {
    i18n.changeLanguage(code);
    if (typeof window !== "undefined") {
      localStorage.setItem("axia_lang", code);
    }
    setTimeout(() => {
      onClose();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fade-in">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-gradient-to-tr from-blue-500/20 via-emerald-400/20 to-indigo-500/20 rounded-full blur-3xl opacity-80" />
      </div>

      <div className="relative z-10 w-full max-w-sm glass-panel rounded-3xl p-7 border border-slate-200/90 shadow-2xl bg-white/95 text-slate-800">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label={t("account.cancel")}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center mb-5">
          <div className="scale-90">{logo}</div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            <span>{t("language.title")}</span>
          </h2>
        </div>

        {/* Clean Stacked Language List */}
        <div className="divide-y divide-slate-100 py-1">
          {LANGUAGES.map((lang) => {
            const isSelected = currentLang.startsWith(lang.code);
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center justify-between py-3 px-3 transition-colors rounded-xl ${
                  isSelected
                    ? "bg-blue-50/70 text-blue-900 font-bold"
                    : "text-slate-700 hover:bg-slate-50 font-medium"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl leading-none">{lang.flag}</span>
                  <span className="text-sm">{lang.name}</span>
                </div>
                {isSelected && <Check className="h-4 w-4 text-blue-600 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
