import { createFileRoute } from "@tanstack/react-router";
import { streamTextWithFallback } from "@/lib/ai-gateway.server";

type SectionDef = { id: string; name: string; role: string; brief: string };
type Plan = { title: string; theme: string; sections: SectionDef[] };

export const Route = createFileRoute("/api/section")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          plan?: Plan;
          sectionId?: string;
          previousIds?: string[];
        };
        if (!body.plan || !body.sectionId) {
          return new Response("plan & sectionId required", { status: 400 });
        }
        const section = body.plan.sections.find((s) => s.id === body.sectionId);
        if (!section) return new Response("section not found", { status: 400 });

        const key = process.env.LOVABLE_API_KEY || process.env.GEMINI_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY or GEMINI_API_KEY", { status: 500 });

        const previousIds = body.previousIds ?? [];
        const system = `Eres AXIA Build. Estás construyendo la página "${body.plan.title}".

TEMA GLOBAL: ${body.plan.theme}
PLAN COMPLETO (en orden): ${body.plan.sections.map((s) => s.name).join(" → ")}
SECCIONES YA GENERADAS: ${previousIds.length ? previousIds.join(", ") : "ninguna (esta es la primera)"}

AHORA debes generar SOLAMENTE la sección: "${section.name}"
Rol: ${section.role}
Brief: ${section.brief}

REGLAS ESTRICTAS:
1. Devuelve ÚNICAMENTE elementos <section>...</section>, <header>...</header> o <footer>...</footer> autocontenidos. Puede ser uno o varios elementos hermanos.
2. NO escribas <!DOCTYPE>, <html>, <head>, <body>, ni <script src="...tailwind..."> — Tailwind CDN ya está cargado.
3. NO uses markdown ni \`\`\`. Solo HTML puro listo para inyectar en el body.
4. Diseño moderno, profesional, totalmente responsive (mobile-first). Usa clases Tailwind.
5. Contenido realista, ABUNDANTE y específico en español (NO Lorem Ipsum). Textos largos, detallados, varios párrafos donde tenga sentido.
6. Usa imágenes de https://images.unsplash.com/photo-... cuando aporte (con tamaños tipo ?w=1200&q=80).
7. Mantén COHERENCIA VISUAL con las secciones previas (misma paleta, tipografía, estilo).
8. OBJETIVO DE TAMAÑO: 400-700 líneas de HTML bien indentado para esta sección. Sé generoso: añade MUCHOS sub-elementos (cards, grids amplios de 6-12 items, listas de features, mini-galerías, badges, gradientes decorativos con SVG inline, divisores, sub-headlines, micro-componentes). NO te quedes corto.
9. Añade detalles visuales ricos: SVG decorativos inline, gradientes (bg-gradient-to-br), sombras multicapa, blobs absolutos con blur, badges, chips, micro-iconos SVG inline (NO uses librerías de iconos).
10. Si es footer, cierra con <footer>. Si es hero, abre con <section> grande con altura mínima 80vh.`;

        const result = streamTextWithFallback(key, {
          system,
          prompt: `Genera ahora la sección "${section.name}".`,
        });

        return result.toTextStreamResponse();
      },
    },
  },
});
