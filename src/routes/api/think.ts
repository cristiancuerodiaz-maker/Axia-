import { createFileRoute } from "@tanstack/react-router";
import { generateTextWithFallback } from "@/lib/ai-gateway.server";

type SectionDef = { id: string; name: string; role: string; brief: string };
type Plan = { title: string; theme: string; sections: SectionDef[] };

export const Route = createFileRoute("/api/think")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          plan?: Plan;
          sectionId?: string;
          previousIds?: string[];
        };
        if (!body.plan || !body.sectionId)
          return new Response("plan & sectionId required", { status: 400 });
        const section = body.plan.sections.find((s) => s.id === body.sectionId);
        if (!section) return new Response("section not found", { status: 400 });

        const key = process.env.LOVABLE_API_KEY || process.env.GEMINI_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY or GEMINI_API_KEY", { status: 500 });

        const system = `Eres un DISEÑADOR SENIOR pensando en voz alta antes de construir una sección web.
Tu trabajo es REFLEXIONAR brevemente (3-5 frases en español, en primera persona) sobre cómo vas a diseñar esta sección.
Menciona ideas concretas: "voy a añadir un gradiente sutil aquí", "esto se vería bonito con un grid asimétrico", "agregaría microinteracciones en los botones", "una imagen de fondo con overlay", etc.
NO escribas código. NO uses markdown ni listas. Solo un párrafo natural y entusiasta.`;

        const prompt = `Página: "${body.plan.title}"
Tema visual: ${body.plan.theme}
Sección a diseñar: "${section.name}" — ${section.role}
Brief: ${section.brief}
Secciones ya construidas: ${(body.previousIds ?? []).join(", ") || "ninguna"}

Reflexiona brevemente sobre cómo vas a hacer que ESTA sección sea visualmente impactante y coherente.`;

        try {
          const { text } = await generateTextWithFallback(key, {
            system,
            prompt,
          });
          return new Response(text.trim(), { headers: { "Content-Type": "text/plain" } });
        } catch (e) {
          return new Response((e as Error).message, { status: 500 });
        }
      },
    },
  },
});
