import type { Metadata } from "next";

// The owner portal is private: keep it out of search results.
export const metadata: Metadata = {
  title: "Owner portal",
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: LayoutProps<"/portal">) {
  return children;
}
