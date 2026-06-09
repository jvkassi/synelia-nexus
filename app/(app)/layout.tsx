export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { Modals } from "@/components/synelia/modals";
import { ModalProvider } from "@/components/synelia/modal-context";
import { ToastProvider } from "@/components/synelia/toaster";
import { ensureLoaded, getProjectChats } from "@/lib/synelia/queries";

/**
 * App shell layout — wraps every authenticated route with the Synelia
 * sidebar + topbar + main content area. The signed-in user comes from the
 * NextAuth session; shared data comes from the live DB via ensureLoaded().
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const email = session.user.email ?? "";
  const name = session.user.name ?? email.split("@")[0] ?? "Utilisateur";

  // Load live data from DB
  const data = await ensureLoaded();
  const PROJECTS = data.PROJECTS;
  const ROUTINES = data.ROUTINES;

  const projects = PROJECTS.map((p) => ({
    id: p.id,
    name: p.name,
    icon: p.emoji,
    color: p.color,
    live: getProjectChats(p.id).some((c) => c.live),
  }));

  const activeRoutinesCount = ROUTINES.filter((r) => r.status === "active").length;

  return (
    <ToastProvider>
      <ModalProvider>
        <div className="app">
          <Sidebar
            currentUser={{ name, email }}
            projects={projects}
            routinesCount={activeRoutinesCount}
          />
          <div className="main-wrap">
            <Topbar />
            <div className="content">
              {children}
            </div>
          </div>
        </div>
        <Modals />
      </ModalProvider>
    </ToastProvider>
  );
}
