// Signed-in portal pages. Pass-through for now; #6 adds the owner check and
// #19 the portal shell.
export default function PortalAppLayout({ children }: LayoutProps<"/portal">) {
  return children;
}
