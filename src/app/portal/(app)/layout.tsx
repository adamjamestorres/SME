import { requireOwner } from "@/lib/auth";

// Signed-in portal pages. #19 adds the portal shell.
export default async function PortalAppLayout({ children }: LayoutProps<"/portal">) {
  await requireOwner();
  return children;
}
