import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { Sidebar } from "@/components/shell/sidebar";

/**
 * App shell layout — wraps every authenticated route with the
 * Synelia sidebar + main content area. Mobile: sidebar is hidden
 * (drawer comes in Phase 5).
 *
 * In dev, when the user isn't signed in, we redirect to /login. The
 * production proxy.ts (NextAuth-aware) handles the real gate.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In dev without a session, send people to the login screen.
  if (process.env.NODE_ENV !== "production") {
    try {
      const session = await auth();
      if (!session?.user) {
        redirect("/login");
      }
    } catch {
      // ignore — proxy.ts handles real auth in prod
    }
  }

  const projects = [
    { id: "1", slug: "audit-coris-bank", name: "Audit Coris Bank", iconKey: "shield-check" as const, iconBg: "var(--primary)", live: true },
    { id: "2", slug: "migration-cloud-orange", name: "Migration Cloud Orange CI", iconKey: "cloud" as const, iconBg: "var(--info)" },
    { id: "3", slug: "conformite-pci-dss", name: "Conformité PCI-DSS", iconKey: "lock" as const, iconBg: "var(--warning)" },
    { id: "4", slug: "academie-synelia", name: "Académie Synelia 2026", iconKey: "graduation-cap" as const, iconBg: "var(--success)" },
    { id: "5", slug: "data-platform-sgtm", name: "Data Platform SGTM", iconKey: "cloud" as const, iconBg: "var(--info)" },
    { id: "6", slug: "fraude-paiement-omo", name: "Fraude paiement OMO", iconKey: "shield-check" as const, iconBg: "var(--primary)" },
  ];

  return (
    <div className="flex h-dvh w-screen overflow-hidden bg-[var(--background)]">
      <div className="hidden md:flex">
        <Sidebar
          activityCount={5}
          currentUser={{
            name: "Awa Diomandé",
            email: "awa.diomande@synelia.tech",
            avatarColor: "var(--accent)",
          }}
          projects={projects}
        />
      </div>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
