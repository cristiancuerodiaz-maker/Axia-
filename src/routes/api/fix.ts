import { createFileRoute } from "@tanstack/react-router";
import { generateTextWithFallback } from "@/lib/ai-gateway.server";

type Lang = "html" | "css" | "js";

function localValidate(code: string, lang: Lang): string[] {
  const issues: string[] = [];
  if (lang === "html") {
    const opens = (
      code.match(/<(section|div|header|footer|main|nav|article|aside|ul|ol|li)\b/gi) ?? []
    ).length;
    const closes = (
      code.match(/<\/(section|div|header|footer|main|nav|article|aside|ul|ol|li)>/gi) ?? []
    ).length;
    if (Math.abs(opens - closes) > 4)
      issues.push(`Posible desbalance de tags (${opens} aperturas vs ${closes} cierres)`);
    if (/```/.test(code)) issues.push("Contiene fences markdown (```)");
  }
  if (lang === "css") {
    const open = (code.match(/\{/g) ?? []).length;
    const close = (code.match(/\}/g) ?? []).length;
    if (open !== close) issues.push(`Llaves CSS desbalanceadas (${open} vs ${close})`);
    if (/```/.test(code)) issues.push("Contiene fences markdown");
  }
  if (lang === "js") {
    const o = (code.match(/\{/g) ?? []).length;
    const c = (code.match(/\}/g) ?? []).length;
    if (o !== c) issues.push(`Llaves JS desbalanceadas (${o} vs ${c})`);
    const po = (code.match(/\(/g) ?? []).length;
    const pc = (code.match(/\)/g) ?? []).length;
    if (po !== pc) issues.push(`Paréntesis JS desbalanceados (${po} vs ${pc})`);
    if (/```/.test(code)) issues.push("Contiene fences markdown");
  }
  return issues;
}

function stripFences(s: string): string {
  let t = s.trim();
  t = t.replace(/^```(?:html|css|js|javascript)?\s*\n?/i, "");
  t = t.replace(/\n?```\s*$/i, "");
  return t.trim();
}

export const Route = createFileRoute("/api/fix")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          lang?: Lang;
          filename?: string;
          code?: string;
        };
        if (!body.lang || !body.code) {
          return new Response(JSON.stringify({ error: "lang & code required" }), { status: 400 });
        }
        const filename = body.filename ?? `code.${body.lang}`;
        const issues = localValidate(body.code, body.lang);

        if (issues.length === 0) {
          return Response.json({ fixed: false, issues: [], code: stripFences(body.code) });
        }

        const key = process.env.LOVABLE_API_KEY || process.env.GEMINI_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY or GEMINI_API_KEY", { status: 500 });

        const system = `Eres un linter+fixer experto en ${body.lang.toUpperCase()}.
Recibes un archivo (${filename}) con posibles errores detectados:
${issues.map((i) => `- ${i}`).join("\n")}

DEVUELVE el archivo CORREGIDO COMPLETO. SOLO el código, SIN markdown, SIN \`\`\`, SIN explicaciones.
Conserva la intención y la mayor parte del contenido original. Solo corrige sintaxis, balance de tags/llaves, y problemas reales.`;

        try {
          const { text } = await generateTextWithFallback(key, {
            system,
            prompt: body.code,
          });
          return Response.json({ fixed: true, issues, code: stripFences(text) });
        } catch (e) {
          return Response.json({
            fixed: false,
            issues,
            code: stripFences(body.code),
            error: (e as Error).message,
          });
        }
      },
    },
  },
});
