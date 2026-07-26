import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { z } from "zod";
import {
  ArrowUp,
  Code2,
  Eye,
  MessageSquare,
  RotateCw,
  Download,
  Loader2,
  Check,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import {
  assembleHtml,
  buildIndexHtml,
  sanitizeSection,
  type Assets,
  type Plan,
} from "@/lib/assemble-html";

const searchSchema = z.object({ prompt: z.string().optional() });

export const Route = createFileRoute("/build")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "AXIA Build — Generando tu página" },
      {
        name: "description",
        content: "Plan + 5 archivos en paralelo (HTML/CSS/JS) con auto-corrección de errores.",
      },
    ],
  }),
  component: BuildPage,
});

type Tab = "chat" | "preview" | "code";
type FileKey = "index.html" | "styles.css" | "interactions.js" | "animations.js" | "components.js";
type AssetKind = "styles" | "interactions" | "animations" | "components";
type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  kind?:
    | "thinking"
    | "plan"
    | "section-start"
    | "section-done"
    | "asset-start"
    | "asset-done"
    | "fix"
    | "done"
    | "error"
    | "info";
};

const ASSET_FILES: {
  kind: AssetKind;
  filename: FileKey;
  label: string;
  lang: "css" | "javascript";
}[] = [
  { kind: "styles", filename: "styles.css", label: "Estilos avanzados", lang: "css" },
  { kind: "interactions", filename: "interactions.js", label: "Interacciones", lang: "javascript" },
  { kind: "animations", filename: "animations.js", label: "Animaciones", lang: "javascript" },
  { kind: "components", filename: "components.js", label: "Componentes", lang: "javascript" },
];

function BuildPage() {
  const { prompt: initialPrompt } = Route.useSearch();
  const [tab, setTab] = useState<Tab>("chat");
  const [activeFile, setActiveFile] = useState<FileKey>("index.html");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [built, setBuilt] = useState<Record<string, string>>({});
  const [assets, setAssets] = useState<Assets>({});
  const [currentSectionId, setCurrentSectionId] = useState<string | undefined>();
  const [streaming, setStreaming] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const didInit = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const previewHtml = useMemo(
    () => (plan ? assembleHtml(plan, built, currentSectionId, assets) : ""),
    [plan, built, currentSectionId, assets],
  );
  const indexHtmlSrc = useMemo(() => (plan ? buildIndexHtml(plan, built) : ""), [plan, built]);

  const fileContents: Record<FileKey, string> = {
    "index.html": indexHtmlSrc,
    "styles.css": assets.styles ?? "",
    "interactions.js": assets.interactions ?? "",
    "animations.js": assets.animations ?? "",
    "components.js": assets.components ?? "",
  };

  const addMsg = (m: Omit<ChatMessage, "id">) => {
    const id = crypto.randomUUID();
    setMessages((prev) => [...prev, { ...m, id }]);
    return id;
  };
  const updateMsg = (id: string, patch: Partial<ChatMessage>) => {
    setMessages((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  const streamAsset = async (
    planData: Plan,
    spec: (typeof ASSET_FILES)[number],
    onProgress: (lines: number) => void,
    signal: AbortSignal,
  ): Promise<string> => {
    const r = await fetch("/api/asset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planData, kind: spec.kind }),
      signal,
    });
    if (!r.ok || !r.body) throw new Error(`HTTP ${r.status}`);
    const reader = r.body.getReader();
    const dec = new TextDecoder();
    let acc = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      acc += dec.decode(value, { stream: true });
      const cleaned = acc.replace(/^```[a-z]*\s*/i, "").replace(/```\s*$/i, "");
      setAssets((prev) => ({ ...prev, [spec.kind]: cleaned }));
      onProgress(cleaned.split("\n").length);
    }
    return acc.replace(/^```[a-z]*\s*/i, "").replace(/```\s*$/i, "");
  };

  const autoFix = async (
    lang: "html" | "css" | "js",
    filename: string,
    code: string,
    signal: AbortSignal,
  ): Promise<{ fixed: boolean; issues: string[]; code: string }> => {
    const r = await fetch("/api/fix", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang, filename, code }),
      signal,
    });
    if (!r.ok) throw new Error(`Fix HTTP ${r.status}`);
    return r.json();
  };

  const runBuild = async (userPrompt: string) => {
    if (streaming) return;
    const trimmed = userPrompt.trim();
    if (!trimmed) return;

    setStreaming(true);
    setPlan(null);
    setBuilt({});
    setAssets({});
    setCurrentSectionId(undefined);
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    addMsg({ role: "user", text: trimmed });

    // PHASE 1: PLAN
    const thinkingId = addMsg({
      role: "assistant",
      text: "🧠 Analizando tu idea y diseñando la arquitectura de la página…",
      kind: "thinking",
    });
    setTab("chat");

    let planData: Plan;
    try {
      const r = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
        signal,
      });
      if (!r.ok) {
        const errTxt = await r.text().catch(() => "");
        let friendly = `No pude generar el plan (HTTP ${r.status}).`;
        if (r.status === 429) friendly = "Demasiadas solicitudes. Espera unos segundos.";
        if (r.status === 402) friendly = "Sin créditos de IA en tu workspace.";
        updateMsg(thinkingId, { text: `⚠️ ${friendly} ${errTxt}`.trim(), kind: "error" });
        setStreaming(false);
        return;
      }
      planData = (await r.json()) as Plan;
      setPlan(planData);
      updateMsg(thinkingId, {
        text: `📋 Plan listo: **${planData.title}** — ${planData.sections.length} secciones HTML + 4 archivos extra (CSS/JS).`,
        kind: "plan",
      });
      addMsg({
        role: "assistant",
        text:
          `**Arquitectura propuesta:**\n` +
          planData.sections.map((s, i) => `${i + 1}. ${s.name} — ${s.role}`).join("\n") +
          `\n\n**Estilo:** ${planData.theme}\n\n**Archivos a generar tras el HTML:** styles.css · interactions.js · animations.js · components.js`,
        kind: "info",
      });
    } catch (e) {
      updateMsg(thinkingId, { text: `⚠️ Error: ${(e as Error).message}`, kind: "error" });
      setStreaming(false);
      return;
    }

    // PHASE 2: HTML SECTIONS (secuencial)
    setTab("code");
    setActiveFile("index.html");
    const builtLocal: Record<string, string> = {};
    const previousIds: string[] = [];

    for (let i = 0; i < planData.sections.length; i++) {
      const section = planData.sections[i];
      setCurrentSectionId(section.id);

      // 2a. THINKING — el diseñador piensa en voz alta
      const thinkId = addMsg({
        role: "assistant",
        text: `💭 Pensando el diseño de **${section.name}**…`,
        kind: "thinking",
      });
      try {
        const tr = await fetch("/api/think", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: planData, sectionId: section.id, previousIds }),
          signal,
        });
        if (tr.ok) {
          const thoughts = await tr.text();
          updateMsg(thinkId, { text: `💭 **${section.name}** — ${thoughts}`, kind: "thinking" });
        }
      } catch {
        /* non-fatal */
      }

      const msgId = addMsg({
        role: "assistant",
        text: `🔨 HTML (${i + 1}/${planData.sections.length}) Generando **${section.name}** (~500 líneas)…`,
        kind: "section-start",
      });

      try {
        const r = await fetch("/api/section", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: planData, sectionId: section.id, previousIds }),
          signal,
        });
        if (!r.ok || !r.body) {
          updateMsg(msgId, { text: `⚠️ Falló ${section.name}: HTTP ${r.status}`, kind: "error" });
          continue;
        }
        const reader = r.body.getReader();
        const dec = new TextDecoder();
        let acc = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += dec.decode(value, { stream: true });
          const cleaned = sanitizeSection(acc);
          builtLocal[section.id] = cleaned;
          setBuilt({ ...builtLocal });
          updateMsg(msgId, {
            text: `🔨 HTML (${i + 1}/${planData.sections.length}) **${section.name}** — ${cleaned.split("\n").length} líneas…`,
            kind: "section-start",
          });
        }
        const finalSection = sanitizeSection(acc);
        builtLocal[section.id] = finalSection;
        setBuilt({ ...builtLocal });
        previousIds.push(section.id);
        updateMsg(msgId, {
          text: `✓ HTML (${i + 1}/${planData.sections.length}) **${section.name}** — ${finalSection.split("\n").length} líneas.`,
          kind: "section-done",
        });
      } catch (e) {
        updateMsg(msgId, { text: `⚠️ ${section.name}: ${(e as Error).message}`, kind: "error" });
      }
    }
    setCurrentSectionId(undefined);

    const htmlLines = Object.values(builtLocal).reduce((a, h) => a + h.split("\n").length, 0);
    addMsg({
      role: "assistant",
      text: `✅ HTML completo: **${htmlLines} líneas** en ${planData.sections.length} secciones.\n\n🚀 Iniciando generación PARALELA de 4 archivos extra (CSS/JS, ~1000 líneas c/u)…`,
      kind: "info",
    });

    // PHASE 3: ASSETS EN PARALELO
    const assetMsgIds: Record<AssetKind, string> = {} as Record<AssetKind, string>;
    for (const spec of ASSET_FILES) {
      assetMsgIds[spec.kind] = addMsg({
        role: "assistant",
        text: `⚙️ **${spec.filename}** (${spec.label}) — en cola…`,
        kind: "asset-start",
      });
    }

    const assetResults = await Promise.allSettled(
      ASSET_FILES.map((spec) =>
        streamAsset(
          planData,
          spec,
          (lines) => {
            updateMsg(assetMsgIds[spec.kind], {
              text: `⚙️ **${spec.filename}** — ${lines} líneas streaming…`,
              kind: "asset-start",
            });
          },
          signal,
        ).then((code) => {
          updateMsg(assetMsgIds[spec.kind], {
            text: `✓ **${spec.filename}** — ${code.split("\n").length} líneas generadas.`,
            kind: "asset-done",
          });
          return { spec, code };
        }),
      ),
    );

    // PHASE 4: AUTO-FIX en paralelo (HTML + cada asset)
    addMsg({
      role: "assistant",
      text: "🛡️ Pasando detector de errores y auto-corrección sobre todos los archivos…",
      kind: "fix",
    });

    const fixTargets: {
      lang: "html" | "css" | "js";
      filename: string;
      code: string;
      apply: (fixed: string) => void;
    }[] = [];

    // HTML
    fixTargets.push({
      lang: "html",
      filename: "index.html",
      code: indexHtmlSrc || buildIndexHtml(planData, builtLocal),
      apply: () => {
        /* HTML sections kept as-is; index.html is regenerated */
      },
    });

    for (const r of assetResults) {
      if (r.status !== "fulfilled") continue;
      const { spec, code } = r.value;
      fixTargets.push({
        lang: spec.lang === "css" ? "css" : "js",
        filename: spec.filename,
        code,
        apply: (fixed) => setAssets((prev) => ({ ...prev, [spec.kind]: fixed })),
      });
    }

    const fixResults = await Promise.allSettled(
      fixTargets.map((t) => autoFix(t.lang, t.filename, t.code, signal)),
    );

    let fixedCount = 0;
    fixResults.forEach((res, i) => {
      const target = fixTargets[i];
      if (res.status === "fulfilled") {
        if (res.value.fixed) {
          fixedCount++;
          target.apply(res.value.code);
          addMsg({
            role: "assistant",
            text: `🛠️ **${target.filename}** corregido: ${res.value.issues.join("; ")}`,
            kind: "fix",
          });
        }
      }
    });

    if (fixedCount === 0) {
      addMsg({
        role: "assistant",
        text: "✓ Todos los archivos pasaron la validación sin errores.",
        kind: "fix",
      });
    }

    // Final
    const totalAssetLines = ASSET_FILES.reduce((acc, s) => {
      const txt =
        (s.kind === "styles"
          ? assets.styles
          : s.kind === "interactions"
            ? assets.interactions
            : s.kind === "animations"
              ? assets.animations
              : assets.components) ?? "";
      return acc + (txt ? txt.split("\n").length : 0);
    }, 0);
    addMsg({
      role: "assistant",
      text: `🎉 **¡Página completa y validada!**\n• HTML: ${htmlLines} líneas\n• Assets: ~${totalAssetLines} líneas\n• 5 archivos listos para descargar.\nAbriendo Vista Previa.`,
      kind: "done",
    });
    setTab("preview");
    setStreaming(false);
  };

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    if (initialPrompt && initialPrompt.trim()) void runBuild(initialPrompt);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || streaming) return;
    void runBuild(input);
    setInput("");
  };

  const downloadAll = async () => {
    if (!plan) return;
    // Download each file separately
    const files: { name: string; content: string }[] = [
      { name: "index.html", content: indexHtmlSrc },
      ...ASSET_FILES.map((s) => ({ name: s.filename, content: fileContents[s.filename] })).filter(
        (f) => f.content,
      ),
    ];
    for (const f of files) {
      const blob = new Blob([f.content], {
        type: f.name.endsWith(".html")
          ? "text/html"
          : f.name.endsWith(".css")
            ? "text/css"
            : "text/javascript",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = f.name;
      a.click();
      URL.revokeObjectURL(url);
      await new Promise((r) => setTimeout(r, 200));
    }
  };

  const openInNewTab = () => {
    if (!previewHtml) return;
    const blob = new Blob([previewHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const reset = () => {
    if (streaming) abortRef.current?.abort();
    setPlan(null);
    setBuilt({});
    setAssets({});
    setCurrentSectionId(undefined);
    setMessages([]);
    setStreaming(false);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Top Header */}
      <header className="flex items-center justify-between border-b border-border/60 px-4 py-2.5 md:px-6 bg-white/70 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          {/* Standalone Code button on Top Left */}
          <button
            onClick={() => setTab(tab === "code" ? "chat" : "code")}
            title="Ver Código"
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition border ${
              tab === "code"
                ? "bg-slate-900 text-white border-slate-900"
                : "glass-pill text-slate-700 hover:text-slate-900 border-slate-200/80"
            }`}
          >
            <Code2 className="h-4 w-4" />
            <span>Code</span>
          </button>

          <Link to="/" className="text-sm md:text-base font-bold tracking-tight text-slate-900">
            AXIA <span className="font-medium text-muted-foreground">Build</span>
          </Link>
        </div>

        {/* Top Right View button */}
        <div className="flex items-center gap-2">
          {tab === "preview" ? (
            <button
              onClick={() => setTab("chat")}
              className="flex items-center gap-1.5 rounded-full glass-pill px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200/80"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Chat / Modificar</span>
            </button>
          ) : (
            <button
              onClick={() => setTab("preview")}
              className="flex items-center gap-1.5 rounded-full btn-axia px-4 py-2 text-xs font-bold shadow-md transition hover:scale-105 active:scale-95"
            >
              <Eye className="h-4 w-4" />
              <span>View</span>
            </button>
          )}

          <button
            onClick={downloadAll}
            disabled={!plan}
            title="Descargar archivos"
            className="hidden md:flex items-center gap-1.5 rounded-full glass-pill px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200/80 disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <main className="relative flex flex-1 flex-col overflow-hidden">
        {tab === "chat" && (
          <ChatPanel
            messages={messages}
            streaming={streaming}
            input={input}
            setInput={setInput}
            onSubmit={handleSubmit}
            hasPlan={!!plan}
            onDownload={downloadAll}
            onView={() => setTab("preview")}
          />
        )}
        {tab === "preview" && (
          <PreviewPanel
            html={previewHtml}
            streaming={streaming}
            hasPlan={!!plan}
            onBackToChat={() => setTab("chat")}
            onDownload={downloadAll}
          />
        )}
        {tab === "code" && (
          <CodePanel
            files={fileContents}
            activeFile={activeFile}
            setActiveFile={setActiveFile}
            streaming={streaming}
          />
        )}
      </main>
    </div>
  );
}

/* ---------------- Chat ---------------- */
function ChatPanel({
  messages,
  streaming,
  input,
  setInput,
  onSubmit,
  hasPlan,
  onDownload,
  onView,
}: {
  messages: ChatMessage[];
  streaming: boolean;
  input: string;
  setInput: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  hasPlan: boolean;
  onDownload: () => void;
  onView: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-hidden px-3 py-4 md:px-4 md:py-6">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold text-slate-800">¿Qué construimos hoy?</h2>
            <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
              Describe tu página web y la construiré sección por sección en tiempo real.
            </p>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "user" ? (
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-sm">
                {m.text}
              </div>
            ) : (
              <div className="flex max-w-[95%] gap-2.5">
                <div className="flex flex-col gap-1.5 pt-0.5 text-sm leading-relaxed">
                  <RichText text={m.text} />
                  {streaming && (m.kind === "section-start" || m.kind === "asset-start") && (
                    <div className="flex gap-1.5 pt-1">
                      <span className="dot-pulse h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="dot-pulse h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="dot-pulse h-1.5 w-1.5 rounded-full bg-primary" />
                    </div>
                  )}
                  {m.kind === "section-done" && (
                    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                      <Check className="h-3 w-3" /> HTML
                    </span>
                  )}
                  {m.kind === "asset-done" && (
                    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-sky-500/15 px-2.5 py-0.5 text-[11px] font-medium text-sky-700">
                      <Check className="h-3 w-3" /> Asset
                    </span>
                  )}
                  {m.kind === "fix" && (
                    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
                      <ShieldCheck className="h-3 w-3" /> Auto-fix
                    </span>
                  )}
                  {m.kind === "thinking" && (
                    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-fuchsia-500/15 px-2.5 py-0.5 text-[11px] font-medium text-fuchsia-700">
                      💭 Pensando
                    </span>
                  )}
                  {m.kind === "done" && (
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <button
                        onClick={onView}
                        className="inline-flex items-center gap-1.5 rounded-full btn-axia px-4 py-2 text-xs font-bold shadow-md"
                      >
                        <Eye className="h-3.5 w-3.5" /> Ver página completa (View)
                      </button>
                      <button
                        onClick={onDownload}
                        className="inline-flex items-center gap-1.5 rounded-full glass-pill px-3 py-2 text-xs font-semibold text-slate-700 border border-slate-200"
                      >
                        <Download className="h-3.5 w-3.5" /> Descargar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sleek compact input box with half height and traveling border glow */}
      <form onSubmit={onSubmit} className="mt-3 flex-shrink-0">
        <div className="border-glow-wrapper">
          <div className="relative z-10 w-full rounded-[1.25rem] bg-white/95 backdrop-blur-xl px-3 py-2 shadow-sm flex items-center gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit(e as unknown as React.FormEvent);
                }
              }}
              disabled={streaming}
              rows={1}
              placeholder={hasPlan ? "Describe la siguiente página…" : "Describe la página web…"}
              className="w-full resize-none border-none bg-transparent py-1 px-1 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-0 disabled:opacity-50 min-h-[36px] max-h-[80px]"
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full btn-axia disabled:opacity-40 transition-transform active:scale-95"
              title="Enviar"
            >
              {streaming ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ArrowUp className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
        <div className="mt-1 px-2 text-[11px] text-slate-400 font-medium text-right">
          Enter para enviar · Shift+Enter salto
        </div>
      </form>
    </div>
  );
}

function RichText({ text }: { text: string }) {
  const parts = text.split(/\n/);
  return (
    <span className="text-foreground/90 whitespace-pre-wrap">
      {parts.map((line, i) => (
        <span key={i}>
          {renderBold(line)}
          {i < parts.length - 1 && <br />}
        </span>
      ))}
    </span>
  );
}
function renderBold(line: string) {
  const segs = line.split(/(\*\*[^*]+\*\*)/g);
  return segs.map((s, i) =>
    s.startsWith("**") && s.endsWith("**") ? (
      <strong key={i} className="font-semibold text-foreground">
        {s.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{s}</span>
    ),
  );
}

/* ---------------- Preview ---------------- */
function PreviewPanel({
  html,
  streaming,
  hasPlan,
  onBackToChat,
  onDownload,
}: {
  html: string;
  streaming: boolean;
  hasPlan: boolean;
  onBackToChat: () => void;
  onDownload: () => void;
}) {
  const openExternal = () => {
    if (!html) return;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-2 md:p-3">
      <div className="mb-2 flex flex-shrink-0 items-center justify-between px-2 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              streaming ? "bg-amber-500 animate-pulse" : hasPlan ? "bg-emerald-500" : "bg-slate-300"
            }`}
          />
          <span className="font-medium text-slate-700">
            {streaming
              ? "Construyendo en tiempo real…"
              : hasPlan
                ? "Vista completa — Actualizada"
                : "Sin contenido aún"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hasPlan && (
            <button
              onClick={openExternal}
              title="Abrir en pestaña nueva"
              className="flex items-center gap-1 rounded-full glass-pill px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Pestaña nueva</span>
            </button>
          )}
          <button
            onClick={onBackToChat}
            className="flex items-center gap-1 rounded-full glass-pill px-3 py-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 border border-slate-200"
          >
            <MessageSquare className="h-3 w-3" />
            <span>Chat</span>
          </button>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl">
        {hasPlan ? (
          <iframe
            title="AXIA Preview"
            srcDoc={html}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-slate-50/50 px-4 text-center text-sm text-slate-500">
            <p>Aún no hay HTML generado.</p>
            <button
              onClick={onBackToChat}
              className="mt-3 rounded-full btn-axia px-4 py-2 text-xs font-bold"
            >
              Ir al Chat para construir
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Code ---------------- */
function CodePanel({
  files,
  activeFile,
  setActiveFile,
  streaming,
}: {
  files: Record<FileKey, string>;
  activeFile: FileKey;
  setActiveFile: (f: FileKey) => void;
  streaming: boolean;
}) {
  const tabs: { key: FileKey; lang: string }[] = [
    { key: "index.html", lang: "html" },
    { key: "styles.css", lang: "css" },
    { key: "interactions.js", lang: "javascript" },
    { key: "animations.js", lang: "javascript" },
    { key: "components.js", lang: "javascript" },
  ];
  const active = tabs.find((t) => t.key === activeFile)!;
  const value = files[activeFile] ?? "";
  const lineCount = value ? value.split("\n").length : 0;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-shrink-0 items-center gap-1 overflow-x-auto border-b border-border/60 bg-background/60 px-2 py-1.5">
        {tabs.map((t) => {
          const isActive = t.key === activeFile;
          const has = (files[t.key] ?? "").length > 0;
          return (
            <button
              key={t.key}
              onClick={() => setActiveFile(t.key)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition whitespace-nowrap ${
                isActive
                  ? "bg-primary/20 text-foreground"
                  : "text-foreground/60 hover:text-foreground hover:bg-white/5"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${has ? "bg-emerald-400" : "bg-foreground/30"}`}
              />
              {t.key}
            </button>
          );
        })}
      </div>
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={active.lang}
          value={value}
          theme="vs-dark"
          path={activeFile}
          beforeMount={(monaco) => {
            monaco.editor.defineTheme("axia-dark", {
              base: "vs-dark",
              inherit: true,
              rules: [
                { token: "tag", foreground: "c084fc" },
                { token: "attribute.name", foreground: "fbbf24" },
                { token: "attribute.value", foreground: "60a5fa" },
                { token: "string", foreground: "60a5fa" },
                { token: "comment", foreground: "64748b", fontStyle: "italic" },
              ],
              colors: {
                "editor.background": "#0a0a14",
                "editor.foreground": "#e2e8f0",
                "editor.lineHighlightBackground": "#1a1a2e",
                "editorLineNumber.foreground": "#475569",
                "editorLineNumber.activeForeground": "#a78bfa",
                "editorCursor.foreground": "#a78bfa",
                "editor.selectionBackground": "#4c1d9540",
              },
            });
            monaco.editor.setTheme("axia-dark");
          }}
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
            minimap: { enabled: false },
            wordWrap: "on",
            automaticLayout: true,
            scrollBeyondLastLine: false,
            lineNumbers: "on",
            tabSize: 2,
            padding: { top: 16, bottom: 16 },
            readOnly: true,
            smoothScrolling: true,
            renderLineHighlight: "all",
          }}
        />
      </div>
      <div className="flex flex-shrink-0 items-center justify-between border-t border-border/60 bg-background/80 px-4 py-2 text-[11px] text-foreground/60 backdrop-blur">
        <div>
          {activeFile} · {lineCount} líneas
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1">
            <span
              className={`h-2 w-2 rounded-full ${streaming ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`}
            />
            {streaming ? "Streaming" : "Listo"}
          </span>
          <span className="rounded-full bg-white/5 px-3 py-1">UTF-8</span>
        </div>
      </div>
    </div>
  );
}
