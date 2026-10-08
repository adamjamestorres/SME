import type { Metadata } from "next";

// Customer signing pages: no site nav, and never indexed.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function SignLayout({ children }: LayoutProps<"/sign">) {
  return children;
}
