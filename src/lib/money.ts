const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

/** Formats integer cents as US dollars: 125050 → "$1,250.50". */
export function formatMoney(cents: number): string {
  return usd.format(cents / 100);
}
