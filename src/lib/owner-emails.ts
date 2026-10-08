// Owner email addresses from OWNER_EMAILS (comma-separated). Used for portal access (#6) and
// owner alerts (#7). An empty or missing list means nobody is an owner.

export function ownerEmails(): string[] {
  return (process.env.OWNER_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isOwnerEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ownerEmails().includes(email.trim().toLowerCase());
}
