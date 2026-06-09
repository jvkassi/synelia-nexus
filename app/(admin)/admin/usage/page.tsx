export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
export default function AdminUsagePage() { redirect("/admin?tab=usage"); }
