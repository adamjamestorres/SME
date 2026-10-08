// Dates in emails are shown in the shop's time zone.
const TIME_ZONE = "America/Los_Angeles";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeZone: TIME_ZONE,
});
const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: TIME_ZONE,
  timeZoneName: "short",
});

/** "October 7, 2026" */
export function formatDate(date: Date): string {
  return dateFormat.format(date);
}

/** "October 7, 2026 at 2:30 PM PDT" */
export function formatDateTime(date: Date): string {
  return dateTimeFormat.format(date);
}
