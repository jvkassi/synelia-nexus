export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { AdminSidebar } from "@/components/shell/admin-sidebar";
import { ToastProvider } from "@/components/synelia/toaster";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const name = session.user.name ?? session.user.email?.split("@")[0] ?? "Admin";
  const email = session.user.email ?? "";

  return (
    <ToastProvider>
      <div className="app">
        <Suspense fallback={<aside className="sidebar" />}>
          <AdminSidebar currentUser={{ name, email }} />
        </Suspense>
        <div className="main-wrap">
          <div className="content" style={{ overflowY: "auto" }}>
            {children}
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
