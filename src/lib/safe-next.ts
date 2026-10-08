/** Only same-site paths under /portal are allowed; anything else becomes /portal. */
export function safeNextPath(next: unknown): string {
  if (typeof next !== "string") return "/portal";
  if (next !== "/portal" && !next.startsWith("/portal/") && !next.startsWith("/portal?")) {
    return "/portal";
  }
  if (next.includes("\\") || next.includes("//") || /[\u0000-\u001f]/.test(next)) return "/portal";
  return next;
}
