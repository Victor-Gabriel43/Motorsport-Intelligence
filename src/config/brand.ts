/**
 * Brand configuration — the single place to rename the project.
 * Everything in the UI (wordmark text, <title>, footer, metadata) reads from here.
 */
export const brand = {
  name: "APEX",
  descriptor: "Motorsport Intelligence",
  /** Short line used under the wordmark and in metadata. */
  tagline: "O universo das corridas, organizado com precisão.",
  /** Used in the document title template: "Page — APEX". */
  titleSeparator: " — ",
  /** Year the project started; shown in the footer. */
  since: 2026,
} as const;

export function pageTitle(page?: string) {
  const base = `${brand.name} · ${brand.descriptor}`;
  return page ? `${page}${brand.titleSeparator}${brand.name}` : base;
}
