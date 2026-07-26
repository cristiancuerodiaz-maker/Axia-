import { cleanHtml } from "./clean-html";

export type SectionDef = {
  id: string;
  name: string;
  role: string;
  brief: string;
};
export type Plan = { title: string; theme: string; sections: SectionDef[] };

/** Strip any accidental <!DOCTYPE>, <html>, <head>, <body> wrappers from a section chunk. */
export function sanitizeSection(raw: string): string {
  let s = cleanHtml(raw);
  s = s.replace(/<!DOCTYPE[^>]*>/gi, "");
  s = s.replace(/<\/?html[^>]*>/gi, "");
  s = s.replace(/<head[\s\S]*?<\/head>/gi, "");
  s = s.replace(/<\/?body[^>]*>/gi, "");
  s = s.replace(/<script[^>]*tailwindcss[^>]*><\/script>/gi, "");
  return s.trim();
}

export type Assets = {
  styles?: string;
  interactions?: string;
  animations?: string;
  components?: string;
};

export function assembleHtml(
  plan: Plan | null,
  built: Record<string, string>,
  currentlyGeneratingId?: string,
  assets: Assets = {},
): string {
  const title = plan?.title ?? "AXIA Build";
  const sections = plan?.sections ?? [];

  const sectionsHtml = sections
    .map((s) => {
      const html = built[s.id];
      if (html && html.length > 0) return sanitizeSection(html);
      if (s.id === currentlyGeneratingId) {
        return `<section class="py-24 bg-slate-50 border-y border-slate-200">
  <div class="max-w-3xl mx-auto px-6 text-center">
    <div class="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-white border border-slate-200 shadow-sm">
      <span class="relative flex h-3 w-3"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-violet-500"></span></span>
      <span class="text-sm font-medium text-slate-700">Generando: ${s.name}…</span>
    </div>
  </div>
</section>`;
      }
      return `<section class="py-16 bg-white border-y border-slate-100">
  <div class="max-w-3xl mx-auto px-6 text-center text-slate-300 text-sm">
    ⏳ Pendiente: ${s.name}
  </div>
</section>`;
    })
    .join("\n\n");

  const inlineStyles = assets.styles ? `<style>\n${assets.styles}\n</style>` : "";
  const inlineScripts = [assets.interactions, assets.animations, assets.components]
    .filter(Boolean)
    .map((js) => `<script>\n${js}\n</script>`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    html, body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
    h1, h2, h3, h4 { font-family: 'Manrope', system-ui, sans-serif; letter-spacing: -0.02em; }
  </style>
  ${inlineStyles}
</head>
<body class="bg-white text-slate-900">
${sectionsHtml}
${inlineScripts}
</body>
</html>`;
}

/** Build just the HTML file (as user would download), referencing external assets. */
export function buildIndexHtml(plan: Plan | null, built: Record<string, string>): string {
  const title = plan?.title ?? "AXIA Build";
  const sections = plan?.sections ?? [];
  const sectionsHtml = sections
    .map((s) => (built[s.id] ? sanitizeSection(built[s.id]) : ""))
    .filter(Boolean)
    .join("\n\n");
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="./styles.css" />
</head>
<body class="bg-white text-slate-900">
${sectionsHtml}
<script src="./interactions.js" defer></script>
<script src="./animations.js" defer></script>
<script src="./components.js" defer></script>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
