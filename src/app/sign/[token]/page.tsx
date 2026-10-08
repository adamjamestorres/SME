import { notFound } from "next/navigation";

// No signing tokens exist yet; #32 builds the real signing page.
export default function SignPage() {
  notFound();
}
