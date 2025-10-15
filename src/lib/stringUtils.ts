export function titleCase(s?: string | null): string | null {
  if (!s) return null;
  // trim and collapse spaces
  const cleaned = s.trim().replace(/\s+/g, " ");
  return cleaned
    .split(" ")
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}
