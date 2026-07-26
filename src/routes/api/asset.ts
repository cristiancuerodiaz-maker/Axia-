import { createFileRoute } from "@tanstack/react-router";
import { streamTextWithFallback } from "@/lib/ai-gateway.server";

type SectionDef = { id: string; name: string; role: string; brief: string };
type Plan = { title: string; theme: string; sections: SectionDef[] };

type AssetKind = "styles" | "interactions" | "animations" | "components";

const SPECS: Record<AssetKind, { filename: string; lang: "css" | "js"; brief: string }> = {
  styles: {
    filename: "styles.css",
    lang: "css",
    brief:
      "Hoja de estilos CSS avanzada COMPLEMENTARIA a Tailwind: variables :root con paleta, tipografía custom, utilidades extra, componentes (cards, botones), keyframes (fadeIn, slideUp, float, shimmer, glow, marquee), gradientes, glassmorphism, scroll-behavior smooth, scrollbar custom, media queries refinadas, dark mode opcional, hover states ricos, focus-visible accesible. Apunta a ~1000 líneas.",
  },
  interactions: {
    filename: "interactions.js",
    lang: "js",
    brief:
      "JavaScript vanilla con: menú móvil (toggle, cierre al click fuera), navegación con scroll suave a anclas, header sticky que cambia al hacer scroll, botón 'volver arriba', acordeón/FAQ con accesibilidad ARIA, tabs interactivos, formularios con validación cliente (email, requeridos) y mensajes de error, modal/dialog accesible (focus trap, ESC cierra), copy-to-clipboard, theme toggle si aplica. Todo IIFE o módulo, sin dependencias, ~1000 líneas.",
  },
  animations: {
    filename: "animations.js",
    lang: "js",
    brief:
      "JavaScript vanilla solo de animaciones: IntersectionObserver para reveal on scroll (data-reveal), parallax sutil en hero, contador animado para números/stats, typewriter para títulos, marquee infinito de logos, tilt 3D en cards al mover el mouse, cursor personalizado opcional, animación de números con requestAnimationFrame, transiciones de página suaves. ~1000 líneas.",
  },
  components: {
    filename: "components.js",
    lang: "js",
    brief:
      "JavaScript de componentes interactivos: carrusel/slider con autoplay y dots, galería con lightbox, dropdown menus, tooltips, toasts/notificaciones, contador regresivo (countdown), filtros dinámicos de cards/proyectos, búsqueda en vivo con debounce, lazy loading de imágenes, cookie banner básico, share buttons nativos. Todo vanilla, ~1000 líneas.",
  },
};

export const Route = createFileRoute("/api/asset")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          plan?: Plan;
          kind?: AssetKind;
        };
        if (!body.plan || !body.kind || !SPECS[body.kind]) {
          return new Response("plan & kind required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY || process.env.GEMINI_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY or GEMINI_API_KEY", { status: 500 });

        const spec = SPECS[body.kind];
        const system = `Eres AXIA Build, generando el archivo **${spec.filename}** para la página "${body.plan.title}".

TEMA GLOBAL: ${body.plan.theme}
SECCIONES DE LA PÁGINA: ${body.plan.sections.map((s) => s.name).join(", ")}

OBJETIVO DEL ARCHIVO:
${spec.brief}

REGLAS ESTRICTAS:
1. Devuelve ÚNICAMENTE código ${spec.lang.toUpperCase()} crudo. SIN markdown, SIN \`\`\`, SIN comentarios introductorios fuera del código.
2. Solo se permiten comentarios propios de ${spec.lang === "css" ? "CSS (/* */)" : "JS (// o /* */)"} DENTRO del código.
3. Apunta a ~1000 líneas reales y útiles (no relleno).
4. Código moderno, robusto, sin dependencias externas.
5. ${spec.lang === "js" ? "Envuelve en IIFE (function(){ ... })(); o usa 'use strict'. Usa querySelector, addEventListener. Defiende contra elementos ausentes (if (!el) return)." : "Usa variables CSS (custom properties) en :root. Mobile-first. Compatible con Tailwind (sin chocar)."}
6. ${spec.lang === "js" ? "Espera al DOMContentLoaded antes de manipular el DOM." : "Sin @import remotos."}
7. Indentación 2 espacios.`;

        const result = streamTextWithFallback(key, {
          system,
          prompt: `Genera ahora el contenido completo de ${spec.filename}.`,
        });

        return result.toTextStreamResponse();
      },
    },
  },
});
