export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

export default function AdminMembersPage() {
  redirect("/admin?tab=members");
}

