import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  ArrowUp,
  Sparkles,
  Menu,
  User as UserIcon,
  Globe,
  Coffee,
  GraduationCap,
  ShoppingBag,
  Utensils,
  Smartphone,
  BarChart3,
  Music,
  Calendar,
  Dumbbell,
  Briefcase,
} from "lucide-react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useTranslation } from "react-i18next";
import { auth } from "../lib/firebase";
import { AuthModal } from "../components/AuthModal";
import { AccountModal } from "../components/AccountModal";
import { LanguageModal } from "../components/LanguageModal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AXIA Build — Intelligence by Design" },
      {
        name: "description",
        content:
          "Describe tu idea y AXIA Build genera una página web completa con HTML y Tailwind en segundos.",
      },
    ],
  }),
  component: Landing,
});

function AxiaLogo({ size = 80 }: { size?: number }) {
  return (
    <div className="relative inline-flex items-center justify-center my-2">
      {/* Dynamic ambient blur background - no box or card border */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-emerald-500/30 to-indigo-600/30 blur-2xl rounded-full transform scale-150 pointer-events-none" />

      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient
            id="axia-x-grad-1"
            x1="10"
            y1="10"
            x2="90"
            y2="90"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <linearGradient
            id="axia-x-grad-2"
            x1="90"
            y1="10"
            x2="10"
            y2="90"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
          <filter id="glow-effect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Diagonal stroke 1: Top-Left to Bottom-Right */}
        <path
          d="M 20 18 C 15 13 25 8 32 15 L 50 36 L 68 15 C 75 8 85 13 80 18 L 59 42 L 82 68 C 88 75 80 84 72 78 L 50 52 L 28 78 C 20 84 12 75 18 68 L 41 42 Z"
          fill="url(#axia-x-grad-1)"
          filter="url(#glow-effect)"
        />

        {/* Diagonal stroke 2: Top-Right to Bottom-Left for 3D layered intersection */}
        <path
          d="M 80 18 C 85 13 75 8 68 15 L 50 36 L 32 15 C 25 8 15 13 20 18 L 41 42 L 18 68 C 12 75 20 84 28 78 L 50 52 L 72 78 C 80 84 88 75 82 68 L 59 42 Z"
          fill="url(#axia-x-grad-2)"
          opacity="0.85"
        />

        {/* Center glowing focal star */}
        <circle cx="50" cy="42" r="4.5" fill="#FFFFFF" />
        <circle cx="50" cy="42" r="8" fill="#3B82F6" opacity="0.3" />
      </svg>
    </div>
  );
}

function Landing() {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState("");
  const [ideaIndex, setIdeaIndex] = useState(0);
  const [placeholderText, setPlaceholderText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const promptIdeas = useMemo(() => {
    return (t("promptIdeas", { returnObjects: true }) as string[]) || [];
  }, [t]);

  const ideaChips = useMemo(
    () => [
      {
        id: "coffee",
        title: t("chips.coffeeTitle"),
        prompt: t("chips.coffeePrompt"),
        Icon: Coffee,
        bgClass: "bg-amber-100",
        iconColor: "text-amber-700",
      },
      {
        id: "school",
        title: t("chips.schoolTitle"),
        prompt: t("chips.schoolPrompt"),
        Icon: GraduationCap,
        bgClass: "bg-indigo-100",
        iconColor: "text-indigo-700",
      },
      {
        id: "ecommerce",
        title: t("chips.ecommerceTitle"),
        prompt: t("chips.ecommercePrompt"),
        Icon: ShoppingBag,
        bgClass: "bg-emerald-100",
        iconColor: "text-emerald-700",
      },
      {
        id: "restaurant",
        title: t("chips.restaurantTitle"),
        prompt: t("chips.restaurantPrompt"),
        Icon: Utensils,
        bgClass: "bg-rose-100",
        iconColor: "text-rose-700",
      },
      {
        id: "mobileApp",
        title: t("chips.mobileAppTitle"),
        prompt: t("chips.mobileAppPrompt"),
        Icon: Smartphone,
        bgClass: "bg-blue-100",
        iconColor: "text-blue-700",
      },
      {
        id: "dashboard",
        title: t("chips.dashboardTitle"),
        prompt: t("chips.dashboardPrompt"),
        Icon: BarChart3,
        bgClass: "bg-cyan-100",
        iconColor: "text-cyan-700",
      },
      {
        id: "music",
        title: t("chips.musicTitle"),
        prompt: t("chips.musicPrompt"),
        Icon: Music,
        bgClass: "bg-purple-100",
        iconColor: "text-purple-700",
      },
      {
        id: "events",
        title: t("chips.eventsTitle"),
        prompt: t("chips.eventsPrompt"),
        Icon: Calendar,
        bgClass: "bg-orange-100",
        iconColor: "text-orange-700",
      },
      {
        id: "fitness",
        title: t("chips.fitnessTitle"),
        prompt: t("chips.fitnessPrompt"),
        Icon: Dumbbell,
        bgClass: "bg-teal-100",
        iconColor: "text-teal-700",
      },
      {
        id: "portfolio",
        title: t("chips.portfolioTitle"),
        prompt: t("chips.portfolioPrompt"),
        Icon: Briefcase,
        bgClass: "bg-slate-100",
        iconColor: "text-slate-700",
      },
    ],
    [t],
  );

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Typewriter animation for input placeholder
  useEffect(() => {
    if (!promptIdeas || promptIdeas.length === 0) return;
    const currentIdea = promptIdeas[ideaIndex % promptIdeas.length];
    const typingSpeed = isDeleting ? 25 : 45;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setPlaceholderText(currentIdea.slice(0, placeholderText.length + 1));
        if (placeholderText.length + 1 === currentIdea.length) {
          setTimeout(() => setIsDeleting(true), 2200);
        }
      } else {
        setPlaceholderText(currentIdea.slice(0, placeholderText.length - 1));
        if (placeholderText.length - 1 === 0) {
          setIsDeleting(false);
          setIdeaIndex((prev) => (prev + 1) % promptIdeas.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [placeholderText, isDeleting, ideaIndex, promptIdeas]);

  const handleChipSelect = (promptText: string) => {
    setPrompt(promptText);
    const textarea = document.getElementById("axia-prompt") as HTMLTextAreaElement | null;
    if (textarea) {
      textarea.focus();
    }
  };

  const submit = () => {
    const p = prompt.trim();
    if (!p) return;
    navigate({ to: "/build", search: { prompt: p } });
  };

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-hidden text-foreground flex flex-col justify-between">
      {/* Top Header - Iniciar Sesión or 3-Lines Menu when Logged in */}
      <header className="absolute top-4 right-6 z-50">
        {!user ? (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="rounded-full btn-axia px-5 py-2 text-xs font-semibold tracking-wide shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
          >
            {t("header.login")}
          </button>
        ) : (
          <div className="relative">
            {/* 3 horizontal lines hamburger menu button when logged in */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={t("header.menu")}
              className="flex h-10 w-10 items-center justify-center rounded-full glass-pill text-slate-700 hover:text-slate-900 transition hover:bg-white/90 shadow-sm border border-slate-200/80 active:scale-95"
            >
              <Menu className="h-5 w-5 text-slate-700" />
            </button>

            {/* Proportional Dropdown Menu with fine travelling border glow */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 z-50 animate-fade-in">
                <div className="border-glow-wrapper-menu">
                  <div className="relative z-10 w-full rounded-[18px] bg-white/95 backdrop-blur-xl p-1.5 text-left shadow-lg space-y-0.5">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsAccountModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 transition text-left"
                    >
                      <UserIcon className="h-4 w-4 text-blue-600" />
                      <span>{t("header.account")}</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsLanguageModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 transition text-left"
                    >
                      <Globe className="h-4 w-4 text-emerald-600" />
                      <span>{t("header.languages")}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Hero Main */}
      <main className="relative mx-auto flex w-full max-w-4xl flex-col items-center px-4 sm:px-6 pt-12 pb-16 text-center my-auto overflow-hidden">
        {/* Central Elaborate Logo - Shifted Higher */}
        <AxiaLogo size={90} />

        <h1 className="mb-3 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
          {t("hero.title")}
        </h1>
        <p className="mb-8 max-w-xl text-base text-slate-600 md:text-lg leading-relaxed font-normal">
          {t("hero.subtitle")}
        </p>

        {/* Prompt Input Box with fine travelling border glow */}
        <div className="relative w-full max-w-2xl">
          <div className="aurora-glow" />
          <div className="border-glow-wrapper">
            <div className="relative z-10 w-full rounded-[23px] bg-white/90 backdrop-blur-xl p-5 text-left shadow-md">
              <textarea
                id="axia-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
                }}
                placeholder={placeholderText || t("hero.promptPlaceholder")}
                rows={3}
                className="w-full resize-none border-none bg-transparent text-left text-base text-slate-800 placeholder:text-slate-400 outline-none focus:ring-0"
              />
              <div className="mt-2 flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                  Gemini AI Engine
                </div>
                <button
                  onClick={submit}
                  disabled={!prompt.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-full btn-axia disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label={t("hero.generate")}
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Scrollable Idea Chips (Swipeable) */}
        <div className="mt-4 w-full max-w-2xl px-1 min-w-0">
          <div
            className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto py-2 px-1 scroll-smooth min-w-0 touch-pan-x snap-x snap-mandatory"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {ideaChips.map((chip) => (
              <button
                key={chip.id}
                onClick={() => handleChipSelect(chip.prompt)}
                className="shrink-0 snap-start group relative active:scale-95 transition-transform"
              >
                <div className="border-glow-wrapper-chip">
                  <div className="relative z-10 flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-slate-700 group-hover:text-slate-900 group-hover:bg-white transition shadow-sm whitespace-nowrap">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${chip.bgClass} ${chip.iconColor}`}
                    >
                      <chip.Icon className="h-3 w-3" />
                    </span>
                    <span>{chip.title}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        logo={<AxiaLogo size={60} />}
      />

      {/* Account Info Modal */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        user={user}
        logo={<AxiaLogo size={60} />}
      />

      {/* Language Selection Modal */}
      <LanguageModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        logo={<AxiaLogo size={60} />}
      />
    </div>
  );
}
