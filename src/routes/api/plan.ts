import { createFileRoute } from "@tanstack/react-router";
import { generateTextWithFallback } from "@/lib/ai-gateway.server";

const SYSTEM = `Eres un ARQUITECTO de páginas web. Recibes el deseo del usuario y devuelves un PLAN en JSON ESTRICTO con esta forma exacta:

{
  "title": "Título de la página",
  "theme": "Una frase corta describiendo paleta de colores, tipografía y tono visual",
  "sections": [
    { "id": "hero", "name": "Hero", "role": "Bienvenida principal con CTA", "brief": "Describe contenido y estilo visual de esta sección en 2-3 frases" }
  ]
}

REGLAS:
- Genera entre 7 y 10 secciones que tengan sentido para la página solicitada.
- Las secciones típicas: hero, features, about, services, gallery, testimonials, pricing, faq, cta, footer. Adáptalo al dominio.
- Cada "id" debe ser único, en minúsculas, sin espacios (ej: "hero", "features", "testimonials").
- El "brief" debe ser específico (qué cards mostrar, qué tono, qué imágenes).
- Responde SOLO el JSON. Sin markdown, sin \`\`\`, sin texto antes o después.`;

function extractJson(s: string): string {
  let t = s.trim();
  t = t.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start >= 0 && end > start) t = t.slice(start, end + 1);
  return t.trim();
}

export const Route = createFileRoute("/api/plan")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { prompt?: string };
        if (!body.prompt) return new Response("prompt required", { status: 400 });

        const key = process.env.LOVABLE_API_KEY || process.env.GEMINI_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY or GEMINI_API_KEY", { status: 500 });

        try {
          const { text } = await generateTextWithFallback(key, {
            system: SYSTEM,
            prompt: body.prompt,
          });
          const json = extractJson(text);
          // Validate parseable
          JSON.parse(json);
          return new Response(json, {
            headers: { "Content-Type": "application/json" },
          });
        } catch (e) {
          return new Response(JSON.stringify({ error: (e as Error).message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
