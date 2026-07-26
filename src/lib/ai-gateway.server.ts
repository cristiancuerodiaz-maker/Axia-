import { GoogleGenAI } from "@google/genai";

const FALLBACK_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

export async function generateTextWithFallback(
  key: string,
  options: { system?: string; prompt: string },
): Promise<{ text: string }> {
  const geminiKey =
    process.env.GEMINI_API_KEY || (key && !key.startsWith("aig-") ? key : undefined);

  if (geminiKey) {
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    let lastError: unknown;

    for (const modelName of FALLBACK_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: options.prompt,
          config: options.system ? { systemInstruction: options.system } : undefined,
        });
        return { text: response.text ?? "" };
      } catch (err: unknown) {
        lastError = err;
        const msg = (err as Error)?.message || String(err);
        if (
          msg.includes("429") ||
          msg.includes("Too Many Requests") ||
          msg.includes("Quota exceeded") ||
          msg.includes("rate-limits") ||
          msg.includes("RESOURCE_EXHAUSTED") ||
          msg.includes("404") ||
          msg.includes("NOT_FOUND")
        ) {
          console.warn(
            `[AI Gateway] ${modelName} error (${msg.slice(0, 100)}), trying fallback...`,
          );
          await new Promise((r) => setTimeout(r, 600));
          continue;
        }
        throw err;
      }
    }
    throw lastError;
  }

  const lovableKey = process.env.LOVABLE_API_KEY || key;
  if (lovableKey) {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "Lovable-API-Key": lovableKey,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          ...(options.system ? [{ role: "system", content: options.system }] : []),
          { role: "user", content: options.prompt },
        ],
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Lovable API error (${res.status}): ${errText}`);
    }
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";
    return { text };
  }

  throw new Error("Missing GEMINI_API_KEY or LOVABLE_API_KEY in environment");
}

export function streamTextWithFallback(key: string, options: { system?: string; prompt: string }) {
  return {
    toTextStreamResponse: () => {
      const geminiKey =
        process.env.GEMINI_API_KEY || (key && !key.startsWith("aig-") ? key : undefined);

      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();

          if (geminiKey) {
            const ai = new GoogleGenAI({ apiKey: geminiKey });
            let succeeded = false;
            let lastError: unknown;

            for (const modelName of FALLBACK_MODELS) {
              try {
                const responseStream = await ai.models.generateContentStream({
                  model: modelName,
                  contents: options.prompt,
                  config: options.system ? { systemInstruction: options.system } : undefined,
                });

                for await (const chunk of responseStream) {
                  if (chunk.text) {
                    controller.enqueue(encoder.encode(chunk.text));
                  }
                }
                succeeded = true;
                break;
              } catch (err: unknown) {
                lastError = err;
                const msg = (err as Error)?.message || String(err);
                console.warn(
                  `[AI Gateway Stream] ${modelName} error (${msg.slice(0, 100)}), trying fallback...`,
                );
                await new Promise((r) => setTimeout(r, 600));
              }
            }

            if (!succeeded) {
              controller.error(lastError);
              return;
            }
          } else {
            const lovableKey = process.env.LOVABLE_API_KEY || key;
            try {
              const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${lovableKey}`,
                  "Lovable-API-Key": lovableKey,
                },
                body: JSON.stringify({
                  model: "google/gemini-2.5-flash",
                  messages: [
                    ...(options.system ? [{ role: "system", content: options.system }] : []),
                    { role: "user", content: options.prompt },
                  ],
                  stream: true,
                }),
              });

              if (!res.ok || !res.body) {
                throw new Error(`Lovable API returned status ${res.status}`);
              }

              const reader = res.body.getReader();
              const decoder = new TextDecoder();
              let buffer = "";

              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                  const trimmed = line.trim();
                  if (trimmed.startsWith("data: ")) {
                    const jsonStr = trimmed.slice(6);
                    if (jsonStr === "[DONE]") continue;
                    try {
                      const data = JSON.parse(jsonStr);
                      const content = data.choices?.[0]?.delta?.content;
                      if (content) {
                        controller.enqueue(encoder.encode(content));
                      }
                    } catch {
                      // ignore partial chunks
                    }
                  }
                }
              }
            } catch (err) {
              controller.error(err);
              return;
            }
          }
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    },
  };
}
