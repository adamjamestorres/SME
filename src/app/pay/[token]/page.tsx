import { notFound } from "next/navigation";

// No payment tokens exist yet; #25 builds the real pay page.
export default function PayPage() {
  notFound();
}
