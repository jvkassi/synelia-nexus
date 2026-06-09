import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { Sidebar } from "@/components/shell/sidebar";
import { getProjectChats, PROJECTS } from "@/lib/synelia/data";

/**
 * App shell layout — wraps every authenticated route with the Synelia
 * sidebar + main content area. The signed-in user comes from the NextAuth
 * session; the shared projects come from the workspace data.
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

  const projects = PROJECTS.map((p) => ({
    id: p.id,
    name: p.name,
    icon: p.emoji,
    color: p.color,
    live: getProjectChats(p.id).some((c) => c.live),
  }));

  return (
    <div className="flex h-dvh w-screen overflow-hidden bg-[var(--background)]">
      <div className="hidden md:flex">
        <Sidebar currentUser={{ name, email }} projects={projects} />
      </div>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
