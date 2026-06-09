export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
export default function AdminGovernancePage() { redirect("/admin?tab=governance"); }
