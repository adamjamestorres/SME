import type { Metadata } from "next";

// Customer payment pages: no site nav, and never indexed.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PayLayout({ children }: LayoutProps<"/pay">) {
  return children;
}
