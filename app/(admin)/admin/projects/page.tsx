export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
export default function AdminProjectsPage() { redirect("/admin?tab=projects"); }
