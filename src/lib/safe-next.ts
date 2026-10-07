export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/portal") || next.startsWith("//") || next.startsWith("/\\")) {
    return "/portal";
  }
  return next;
}
