export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { ensureLoaded, getProject, getProjectChats, getMember, getProjectArtifacts } from "@/lib/synelia/queries";
import { SYN } from "@/lib/synelia/data";
import { ChatWorkspace } from "./chat-workspace";

export default async function ChatPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{ layout?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await ensureLoaded();
  const { slug, id } = await params;
  const { layout = "centered" } = await searchParams;

  const project = getProject(slug);
  if (!project) notFound();

  const chats = getProjectChats(slug);
  const chat = chats.find((c) => c.id === id);
  if (!chat) notFound();

  const artifacts = getProjectArtifacts(slug);
  const members = project.members.map((uid) => getMember(uid)).filter(Boolean);

  // Thread messages — use THREAD_SYNTHESE for the demo chat, empty for others
  const initialMessages =
    id === "c-synthese" ? SYN.THREAD_SYNTHESE : [];

  // Risk rows for the artifact panel (c-synthese)
  const riskRows = SYN.RISK_ROWS;

  // Ghost typing: for c-entretiens, show Fatou typing
  const ghostTyper =
    chat.liveState === "user-typing" && chat.liveUser
      ? getMember(chat.liveUser) ?? null
      : null;

  const me = {
    id: session.user.email?.split("@")[0] ?? "awa",
    name: session.user.name ?? session.user.email ?? "Vous",
  };

  return (
    <ChatWorkspace
      project={project}
      chat={chat}
      layout={layout as "centered" | "canvas" | "wide"}
      initialMessages={initialMessages}
      artifacts={artifacts}
      members={members.filter(Boolean) as ReturnType<typeof getMember>[]}
      riskRows={riskRows}
      ghostTyper={ghostTyper}
      me={me}
    />
  );
}
