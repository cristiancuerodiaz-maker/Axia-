/** Strip accidental markdown fences from a model HTML response. */
export function cleanHtml(raw: string): string {
  let s = raw.trim();
  // Remove leading ```html or ``` and trailing ```
  s = s.replace(/^```(?:html)?\s*\n?/i, "");
  s = s.replace(/\n?```\s*$/i, "");
  return s.trim();
}
