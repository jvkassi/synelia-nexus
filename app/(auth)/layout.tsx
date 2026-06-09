/**
 * Synelia Cowork — auth layout.
 * The login and register pages own their own split-screen layouts,
 * so this is intentionally minimal: just a full-bleed container.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
